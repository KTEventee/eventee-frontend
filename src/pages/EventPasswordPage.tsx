import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";  

export default function EventPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { inviteCode: ctxInviteCode, setCurrentEvent } = useApp();

  const passedInviteCode = location.state?.inviteCode;
  const inviteCode = passedInviteCode || ctxInviteCode || null;

  useEffect(() => {
    if (!inviteCode) navigate("/join-event");
  }, [inviteCode, navigate]);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요");
      return;
    }

    if (!inviteCode) {
      setError("초대 코드가 존재하지 않습니다. 다시 시도해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`${API_URL}/api/v1/events/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "이벤트 비밀번호가 올바르지 않습니다");
        setLoading(false);
        return;
      }

      setCurrentEvent({
        id: data.result.eventId,
        title: data.result.title,
        description: data.result.description ?? "",
        inviteCode,
        startDate: null,
        endDate: null,
        createdBy: data.result.role ?? "PARTICIPANT",
      });

      navigate("/signup", {
        state: {
          password,
          eventId: data.result.eventId,
          eventTitle: data.result.title,
          eventCode: inviteCode,
          nextPage: "/event-main"
        }
      });

    } catch (err) {
      setError("서버와 연결할 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!inviteCode) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 relative">

      {/* HEADER (LoginPage 동일 디자인) */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#E6E0D8]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
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

      <div className="w-full max-w-md pt-28">

        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#EDEAE5] rounded-full shadow-inner mb-5">
            <Lock className="h-10 w-10 text-[#67594C]" />
          </div>

          <h1 className="text-[28px] font-semibold text-[#67594C] mb-1 tracking-tight">
            이벤트 비밀번호
          </h1>

          <p className="text-gray-600 text-sm">
            초대 코드 : <span className="font-mono text-[#67594C]">{inviteCode}</span>
          </p>
        </div>

        {/* 비밀번호 입력 카드 */}
        <div className="bg-white rounded-3xl shadow-sm p-10 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <Label htmlFor="password" className="text-[#4A4A4A]">
                비밀번호
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="이벤트 비밀번호 입력"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="mt-2 h-[56px] text-[16px]"
                disabled={loading}
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

      </div>
    </div>
  );
}
