import React from 'react';
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp, type User } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useApp();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // nextPage가 state로 전달되면 해당 페이지로, 아니면 기본적으로 마이페이지로
  const nextPage = location.state?.nextPage || "/my-page";

  const validateNickname = (value: string): string | null => {
    if (!value.trim()) {
      return "닉네임을 입력해주세요";
    }

    if (value.length < 2 || value.length > 5) {
      return "아래 조건에 맞는 닉네임을 입력해주세요.";
    }

    // 한글, 영문, 숫자만 허용 (공백 및 특수문자 불가)
    const regex = /^[가-힣a-zA-Z0-9]+$/;
    if (!regex.test(value)) {
      return "아래 조건에 맞는 닉네임을 입력해주세요.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    // TODO: 실제 API 호출
    // POST /api/auth/signup
    // body: { nickname, socialProvider, socialId }
    // response: { success: boolean, message?: string, user?: User }

    // Mock: 닉네임 중복 체크 시뮬레이션
    const existingNicknames = ["테스트", "admin", "관리자"];

    if (existingNicknames.includes(nickname)) {
      setError("이미 존재하는 닉네임입니다.");
      setIsSubmitting(false);
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      nickname,
      email: "new@example.com",
      role: "user",
    };
    setUser(newUser);
    setIsSubmitting(false);
    navigate(nextPage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* EvenTee 로고 */}
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2">회원가입</h1>
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
                <p className="text-red-500 text-sm mt-2">
                  {error}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                2자 이상 5자 이하, 한글, 영문, 숫자만 허용 /
                공백 및 특수문자는 사용 불가합니다.
              </p>
            </div>

            <EventeeButton
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "확인 중..." : "다음으로"}
            </EventeeButton>
          </form>
        </div>
      </div>
    </div>
  );
}