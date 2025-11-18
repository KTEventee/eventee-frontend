import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock } from "lucide-react";

export default function EventPasswordPage() {
  const navigate = useNavigate();
  const { inviteCode, setCurrentEvent } = useApp();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);

    try {
      // 비밀번호 검증 API 호출
      const response = await fetch(`/api/v1/events/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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


      setCurrentEvent({
        id: data.result.eventId,
        title: data.result.title,
        description: data.result.description ?? "",
        inviteCode: inviteCode,
        startDate: null,
        endDate: null,
        createdBy: data.result.role ?? "PARTICIPANT",
      });

      // 닉네임 입력 페이지로 이동 (state 함께 전달)
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
