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

  // location.state로 전달된 값
  const passedInviteCode = location.state?.inviteCode;

  // 최종 inviteCode: state > context > null
  const inviteCode = passedInviteCode || ctxInviteCode || null;

  console.log("[EventPasswordPage] inviteCode =", inviteCode);

  // 초대코드 없으면 /join-event로 강제 이동
  useEffect(() => {
    if (!inviteCode) {
      navigate("/join-event");
    }
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
      // apiFetch로 변경 (Authorization 자동 포함)
      const response = await apiFetch(`${API_URL}/api/v1/events/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "이벤트 비밀번호가 올바르지 않습니다");
        setLoading(false);
        return;
      }

      // 이벤트 정보 저장
      setCurrentEvent({
        id: data.result.eventId,
        title: data.result.title,
        description: data.result.description ?? "",
        inviteCode: inviteCode,
        startDate: null,
        endDate: null,
        createdBy: data.result.role ?? "PARTICIPANT",
      });

      // signup 페이지로 이동
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

  // inviteCode 없으면 렌더 안 함 (navigate로 이동 중)
  if (!inviteCode) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl mb-2">이벤트 비밀번호</h1>
          <p className="text-gray-600">
            초대 코드: <span className="font-mono">{inviteCode}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="이벤트 비밀번호 입력"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="mt-2 h-[59px]"
                disabled={loading}
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
      </div>
    </div>
  );
}
