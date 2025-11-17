import React from 'react';
import { useState } from "react";
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

export default function CreateEventPageNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [teamCount, setTeamCount] = useState("");
  const [showStartCalendar, setShowStartCalendar] =
    useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>(
    {},
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 입력 검증
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "행사 제목을 입력해주세요";
    }

    if (!startDate) {
      newErrors.startDate = "시작 날짜를 선택해주세요";
    }

    if (!endDate) {
      newErrors.endDate = "종료 날짜를 선택해주세요";
    }

    // 종료일이 시작일보다 빠른지 체크
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate =
        "종료 날짜는 시작 날짜 이후여야 합니다";
    }

    if (!password.trim()) {
      newErrors.password = "비밀번호를 입력해주세요";
    }

    if (!description.trim()) {
      newErrors.description = "행사 세부 내용을 입력해주세요";
    }

    // 에러가 있으면 submit 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 초대 코드 생성
    const inviteCode = generateInviteCode();

    // TODO: 백엔드 연동 필요
    // API: POST /api/events
    // body: { title, password, description, startDate, endDate, teamCount }
    // Response: { success: boolean, event: Event, inviteCode: string }
    // 이벤트 생성 후 초대 코드를 받아옴

    // 초대 코드 페이지로 이동
    navigate("/invite-code", {
      state: {
        inviteCode,
        title,
        startDate,
        endDate,
        password,
      },
    });
  };

  const generateInviteCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(
        Math.floor(Math.random() * chars.length),
      );
    }
    return code;
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen relative">
      {/* EventTee 로고 */}
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="absolute right-12 top-8">
        <button
          onClick={() => navigate("/mypage")}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          type="button"
        >
          <ArrowLeft
            className="w-5 h-5"
            style={{ color: "#67594C" }}
          />
        </button>
      </div>

      {/* 메인 컨텐츠 - 중앙 정렬 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4">
        {/* 1-1 번호 뱃지 */}
        <div className="relative mb-4"></div>

        {/* 제목 */}
        <h1 className="font-['Pretendard:Bold',sans-serif] text-[36px] text-[#67594c] mb-12">
          이벤트 생성
        </h1>

        {/* 폼 컨테이너 */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[850px]"
        >
          <div className="space-y-6">
            {/* 제목과 날짜 - 가로 배치 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                  제목 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder="행사 제목을 입력하세요"
                  className={`bg-white h-[51px] rounded-[15px] border-0 text-[12px] ${errors.title ? "ring-2 ring-red-500" : ""}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.title}
                  </p>
                )}
              </div>
              <div className="w-[266px]">
                <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                  시작 날짜{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Popover
                  open={showStartCalendar}
                  onOpenChange={setShowStartCalendar}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full bg-white h-[51px] rounded-[15px] border-0 text-left px-4 text-[12px] text-[#687c94] ${errors.startDate ? "ring-2 ring-red-500" : ""}`}
                    >
                      {startDate
                        ? startDate.toLocaleDateString("ko-KR")
                        : "시작 날짜를 선택하세요"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
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
                {errors.startDate && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div className="w-[266px]">
                <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                  종료 날짜{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Popover
                  open={showEndCalendar}
                  onOpenChange={setShowEndCalendar}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`w-full bg-white h-[51px] rounded-[15px] border-0 text-left px-4 text-[12px] text-[#687c94] ${errors.endDate ? "ring-2 ring-red-500" : ""}`}
                    >
                      {endDate
                        ? endDate.toLocaleDateString("ko-KR")
                        : "종료 날짜를 선택하세요"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0"
                    align="start"
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
                {errors.endDate && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* 비밀번호와 팀 개수 - 가로 배치 */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                  비밀번호{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: "" });
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className={`bg-white h-[51px] rounded-[15px] border-0 text-[12px] ${errors.password ? "ring-2 ring-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="w-[266px]">
                <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                  팀 개수{" "}
                  <span className="text-gray-400 text-[10px]">
                    (선택)
                  </span>
                </label>
                <Input
                  type="number"
                  value={teamCount}
                  onChange={(e) => setTeamCount(e.target.value)}
                  placeholder="팀 개수를 입력하세요"
                  className="bg-white h-[51px] rounded-[15px] border-0 text-[12px]"
                />
              </div>
            </div>

            {/* 내용 */}
            <div>
              <label className="block font-['Pretendard:SemiBold',sans-serif] text-[12px] text-black mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: "" });
                }}
                placeholder="행사 세부 내용을 작성하세요"
                className={`bg-white h-[116px] rounded-[10px] border-0 text-[12px] resize-none ${errors.description ? "ring-2 ring-red-500" : ""}`}
              />
              {errors.description && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* 행사 생성하기 버튼 */}
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