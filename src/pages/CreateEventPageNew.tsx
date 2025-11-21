import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
    <div className="bg-[#FAF9F6] min-h-screen relative">
      {/* 로고 */}
      <div className="absolute left-10 top-10">
        <p className="text-[30px] font-bold tracking-tight">
          Even<span className="text-[#67594C]">Tee</span>
        </p>
      </div>

      {/* 뒤로가기 */}
      <div className="absolute right-10 top-10">
        <button
          onClick={() => navigate("/my-page")}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          type="button"
        >
          <ArrowLeft className="w-6 h-6" style={{ color: "#67594C" }} />
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4">
        <h1 className="text-[32px] font-semibold text-[#67594C] mb-12 tracking-tight">
          이벤트 생성
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-[850px]">
          <div className="bg-white p-10 rounded-3xl shadow-md border border-gray-100 space-y-8">

            {/* 제목 / 날짜 */}
            <div className="flex gap-4">
              {/* 제목 */}
              <div className="flex-1">
                <label className="block text-[13px] font-medium mb-2 text-[#4a4a4a]">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder="행사 제목을 입력하세요"
                  className={`h-[54px] rounded-xl bg-[#FDFDFC] text-[14px] ${
                    errors.title && "ring-2 ring-red-500"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* 시작 날짜 */}
              <div className="w-[260px]">
                <label className="block text-[13px] font-medium mb-2 text-[#4a4a4a]">
                  시작 날짜 <span className="text-red-500">*</span>
                </label>

                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full h-[54px] bg-[#FDFDFC] rounded-xl px-4 text-left text-[14px] ${
                        errors.startDate && "ring-2 ring-red-500"
                      }`}
                    >
                      {startDate
                        ? startDate.toLocaleDateString("ko-KR")
                        : "시작 날짜 선택"}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 w-[320px] z-[9999] rounded-xl shadow-lg bg-white">
                    <DayPicker
                      mode="single"
                      selected={startDate}
                      onSelect={(day) => {
                        setStartDate(day ?? undefined);
                        setShowStartCalendar(false);
                        setErrors({ ...errors, startDate: "" });
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>

                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                )}
              </div>

              {/* 종료 날짜 */}
              <div className="w-[260px]">
                <label className="block text-[13px] font-medium mb-2 text-[#4a4a4a]">
                  종료 날짜 <span className="text-red-500">*</span>
                </label>

                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full h-[54px] bg-[#FDFDFC] rounded-xl px-4 text-left text-[14px] ${
                        errors.endDate && "ring-2 ring-red-500"
                      }`}
                    >
                      {endDate
                        ? endDate.toLocaleDateString("ko-KR")
                        : "종료 날짜 선택"}
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 w-[320px] z-[9999] rounded-xl shadow-lg bg-white">
                    <DayPicker
                      mode="single"
                      selected={endDate}
                      onSelect={(day) => {
                        setEndDate(day ?? undefined);
                        setShowEndCalendar(false);
                        setErrors({ ...errors, endDate: "" });
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>

                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* 비밀번호 + 팀 수 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] mb-2 font-medium text-[#4a4a4a]">
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
                  className={`bg-[#FDFDFC] h-[54px] rounded-xl text-[14px] ${
                    errors.password && "ring-2 ring-red-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="w-[260px]">
                <label className="block text-[13px] mb-2 font-medium text-[#4a4a4a]">
                  팀 개수 <span className="text-gray-400 text-[11px]">(선택)</span>
                </label>
                <Input
                  type="number"
                  value={teamCount}
                  onChange={(e) => setTeamCount(e.target.value)}
                  placeholder="팀 개수 입력"
                  className="bg-[#FDFDFC] h-[54px] rounded-xl text-[14px]"
                />
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-[13px] font-medium mb-2 text-[#4a4a4a]">
                내용 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: "" });
                }}
                placeholder="행사 세부 내용을 작성하세요"
                className={`bg-[#FDFDFC] h-[130px] rounded-xl text-[14px] resize-none ${
                  errors.description && "ring-2 ring-red-500"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* 제출 */}
            <div className="pt-8">
              <EventeeButton type="submit" className="w-full h-[56px] text-[16px]">
                행사 생성하기
              </EventeeButton>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
