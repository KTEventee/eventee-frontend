import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";

export default function CreateEventPageNew() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [teamCount, setTeamCount] = useState("");
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const API_URL = import.meta.env.VITE_API_URL;

  const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 19);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "행사 제목을 입력해주세요";
    if (!startDate) newErrors.startDate = "시작 날짜를 선택해주세요";
    if (!endDate) newErrors.endDate = "종료 날짜를 선택해주세요";
    if (startDate && endDate && endDate < startDate)
      newErrors.endDate = "종료 날짜는 시작 날짜 이후여야 합니다";
    if (!password.trim()) newErrors.password = "비밀번호를 입력해주세요";
    if (!description.trim()) newErrors.description = "행사 세부 내용을 입력해주세요";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const body = {
      title,
      description,
      password,
      startAt: formatDateTime(startDate!),
      endAt: formatDateTime(endDate!),
      teamCount: teamCount ? Number(teamCount) : 0,
    };

    try {
      const res = await apiFetch(`${API_URL}/api/v1/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      console.log(json);

      if (!json.isSuccess) {
        alert("이벤트 생성 실패: " + (json.message || ""));
        return;
      }

      navigate("/invite-code", {
        state: {
          inviteCode: json.result.inviteCode,
          title: json.result.title,
          startAt: json.result.startAt,
          endAt: json.result.endAt,
          password,
        },
      });
    } catch (err) {
      console.error(err);
      alert("이벤트 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen relative">
      {/* 로고 */}
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      {/* 뒤로가기 */}
      <div className="absolute right-12 top-8">
        <button
          onClick={() => navigate("/mypage")}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          type="button"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#67594C" }} />
        </button>
      </div>

      {/* 본문 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4">
        <h1 className="font-['Pretendard:Bold'] text-[36px] text-[#67594c] mb-12">
          이벤트 생성
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-[850px]">
          <div className="space-y-6">
            {/* 제목 + 날짜 */}
            <div className="flex gap-4">
              {/* 제목 */}
              <div className="flex-1">
                <label className="block text-[12px] mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder="행사 제목을 입력하세요"
                  className={`bg-white h-[51px] rounded-[15px] text-[12px] ${
                    errors.title ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-[11px]">{errors.title}</p>
                )}
              </div>

              {/* 시작 날짜 */}
              <div className="w-[266px]">
                <label className="block text-[12px] mb-2">
                  시작 날짜 <span className="text-red-500">*</span>
                </label>

                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full bg-white h-[51px] rounded-[15px] px-4 text-left text-[12px] ${
                        errors.startDate ? "ring-2 ring-red-500" : ""
                      }`}
                    >
                      {startDate
                        ? startDate.toLocaleDateString("ko-KR")
                        : "시작 날짜를 선택하세요"}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-auto p-0 z-[9999]"
                    style={{ overflow: "visible" }}
                  >
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(newDate) => {
                        setStartDate(newDate);
                        setShowStartCalendar(false);
                        setErrors({ ...errors, startDate: "" });
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {errors.startDate && <p className="text-red-500 text-[11px]">{errors.startDate}</p>}
              </div>

              {/* 종료 날짜 */}
              <div className="w-[266px]">
                <label className="block text-[12px] mb-2">
                  종료 날짜 <span className="text-red-500">*</span>
                </label>

                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full bg-white h-[51px] rounded-[15px] px-4 text-left text-[12px] ${
                        errors.endDate ? "ring-2 ring-red-500" : ""
                      }`}
                    >
                      {endDate
                        ? endDate.toLocaleDateString("ko-KR")
                        : "종료 날짜를 선택하세요"}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-auto p-0 z-[9999]"
                    style={{ overflow: "visible" }}
                  >
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(newDate) => {
                        setEndDate(newDate);
                        setShowEndCalendar(false);
                        setErrors({ ...errors, endDate: "" });
                      }}
                    />
                  </PopoverContent>
                </Popover>

                {errors.endDate && <p className="text-red-500 text-[11px]">{errors.endDate}</p>}
              </div>
            </div>

            {/* 비밀번호 + 팀 수 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[12px] mb-2">
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className={`bg-white h-[51px] rounded-[15px] text-[12px] ${
                    errors.password ? "ring-2 ring-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-[11px]">{errors.password}</p>
                )}
              </div>

              <div className="w-[266px]">
                <label className="block text-[12px] mb-2">
                  팀 개수 <span className="text-gray-400 text-[10px]">(선택)</span>
                </label>
                <Input
                  type="number"
                  value={teamCount}
                  onChange={(e) => setTeamCount(e.target.value)}
                  placeholder="팀 개수를 입력하세요"
                  className="bg-white h-[51px] rounded-[15px] text-[12px]"
                />
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-[12px] mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: "" });
                }}
                placeholder="행사 세부 내용을 작성하세요"
                className={`bg-white h-[116px] rounded-[10px] text-[12px] resize-none ${
                  errors.description ? "ring-2 ring-red-500" : ""
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-[11px]">{errors.description}</p>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="pt-12">
              <EventeeButton type="submit" className="w-full">
                행사 생성하기
              </EventeeButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
