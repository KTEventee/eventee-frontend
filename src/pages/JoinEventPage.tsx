import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { apiFetch } from "../utils/apiFetch"; 

export default function JoinEventPage() {
  const navigate = useNavigate();
  const { user, setInviteCode } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("초대 코드를 입력해주세요");
      return;
    }

    if (code.length !== 6) {
      setError("초대 코드는 6자리입니다");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(
        `${API_URL}/api/v1/event/events/validate?code=${code}`,
        { method: "GET" }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "유효하지 않은 초대 코드입니다.");
        setLoading(false);
        return;
      }

      const upperCode = code.toUpperCase();
      setInviteCode(upperCode);

      navigate("/event-password", {
        state: { inviteCode: upperCode },
      });

    } catch (err) {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const canCreateEvent =
    user?.role === "admin" || user?.role === "master_admin";

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 relative">

      {/* ===== 공통 헤더 (로그인 / 패스워드 / 닉네임 입력과 동일) ===== */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#E6E0D8]">
        <div className="max-w-5xl mx-auto flex items-center px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/ticket.png"
              alt="Eventee Logo"
              className="w-8 h-8 rounded-xl shadow-sm"
            />
            <span className="font-semibold text-sm tracking-tight text-[#5A4A3B]">
              Eventee
            </span>
          </div>
        </div>
      </header>
      {/* ========================================================== */}

      <div className="w-full max-w-md pt-28">

        {/* 타이틀 */}
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-semibold tracking-tight text-[#67594C]">
            초대 코드 입력
          </h2>
        </div>

        {/* 코드 입력 카드 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 mb-10">
          <p className="text-gray-600 text-[14px] mb-4">
            참여하려면 초대 코드를 입력하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="inviteCode"
                type="text"
                placeholder="6자리 초대 코드"
                value={code}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "");
                  setCode(value);
                  setError("");
                }}
                className="mt-2 uppercase h-[56px] text-center text-[20px] tracking-[0.2em]"
                maxLength={6}
              />

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <EventeeButton 
              type="submit" 
              className="w-full h-[56px] text-[16px]" 
              disabled={loading}
            >
              {loading ? "확인 중..." : "다음으로"}
            </EventeeButton>
          </form>
        </div>

        {/* 이벤트 만들기 카드 (관리자 전용) */}
        {canCreateEvent && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between">

              <div>
                <h3 className="font-semibold text-[18px] text-[#67594C] mb-1">
                  이벤트 만들기
                </h3>
                <p className="text-sm text-gray-600">
                  새로운 이벤트를 생성하고 참여자를 초대하세요
                </p>
              </div>

              <Button
                onClick={() => navigate("/create-event")}
                size="icon"
                className="rounded-full h-12 w-12 bg-[#67594C] hover:bg-[#574A3F]"
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
