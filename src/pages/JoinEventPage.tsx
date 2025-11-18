import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function JoinEventPage() {
  const navigate = useNavigate();
  const { user, setInviteCode } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // 초대코드 검증 API 호출
      const response = await fetch(`/api/v1/events/validate?code=${code}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "유효하지 않은 초대 코드입니다.");
        setLoading(false);
        return;
      }

      // 초대 코드 저장
      setInviteCode(code.toUpperCase());
      navigate("/event-password");

    } catch (err) {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const canCreateEvent =
    user?.role === "admin" || user?.role === "master_admin";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-[30px] font-bold">
            Even<span style={{ color: "#67594C" }}>Tee</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <h2>초대 코드 입력</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="inviteCode"
                type="text"
                placeholder="6자리 초대 코드 입력"
                value={code}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "");
                  setCode(value);
                  setError("");
                }}
                className="mt-2 uppercase h-[59px]"
                maxLength={6}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <EventeeButton type="submit" className="w-full" disabled={loading}>
              {loading ? "확인 중..." : "다음으로"}
            </EventeeButton>
          </form>
        </div>

        {canCreateEvent && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">이벤트 만들기</h3>
                <p className="text-sm text-gray-600">
                  새로운 이벤트를 생성하고 참가자를 초대하세요
                </p>
              </div>
              <Button
                onClick={() => navigate("/create-event")}
                size="icon"
                className="rounded-full h-12 w-12 flex-shrink-0"
              >
                <svg
                  className="h-6 w-6"
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
