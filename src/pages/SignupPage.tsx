import React from 'react';
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function SignupPage() {

  const navigate = useNavigate();
  const location = useLocation();

  const { inviteCode, setCurrentEvent } = useApp();

  const password = location.state?.password;

  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const nextPage = "/event-main";

  const validateNickname = (value: string): string | null => {
    if (!value.trim()) return "닉네임을 입력해주세요";
    if (value.length < 2 || value.length > 5)
      return "닉네임은 2~5자여야 합니다.";
    const regex = /^[가-힣a-zA-Z0-9]+$/;
    if (!regex.test(value))
      return "한글/영문/숫자만 사용 가능합니다.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!inviteCode || !password) {
      setError("올바른 접근이 아닙니다. 처음부터 다시 진행해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      //  환경변수 적용된 절대 API 주소
      const response = await fetch(`${API_URL}/api/v1/events/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inviteCode,
          password,
          nickname
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "이벤트 참여에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      // 백엔드 result 구조에 맞춰 저장
      setCurrentEvent({
        id: data.result.eventId,
        title: data.result.title,
        description: data.result.description ?? "",
        thumbnailUrl: data.result.thumbnailUrl,
        teamCount: data.result.teamCount,
        inviteCode: inviteCode,
        role: data.result.role,
        groups: data.result.groups
      });

      navigate(nextPage, {
        state: {
          eventId: data.result.eventId,
          eventTitle: data.result.title,
          eventCode: inviteCode,
        },
      });

    } catch (err) {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">닉네임 입력</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력하세요 (2-5자)"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                className="mt-2 h-[59px]"
                maxLength={5}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                2~5자, 한글/영문/숫자만 사용 가능
              </p>
            </div>

            <EventeeButton type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "참여 중..." : "입장하기"}
            </EventeeButton>
          </form>
        </div>
      </div>
    </div>
  );
}
