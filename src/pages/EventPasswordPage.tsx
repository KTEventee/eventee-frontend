import React from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, type Event } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock } from "lucide-react";

export default function EventPasswordPage() {
  const navigate = useNavigate();
  const { user, inviteCode, setCurrentEvent } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요");
      return;
    }

    // TODO: 백엔드 연동 필요
    // API: POST /api/events/join
    // body: { inviteCode, password }
    // Response: { success: boolean, event: Event, message?: string }
    // 비밀번호 검증 후 이벤트 정보를 받아옴

    const mockEvent: Event = {
      id: "1",
      title: "2024 해커톤",
      description: "겨울 해커톤 행사입니다",
      inviteCode: inviteCode,
      startDate: new Date("2024-12-01"),
      endDate: new Date("2024-12-03"),
      createdBy: "admin",
    };
    setCurrentEvent(mockEvent);

    // 이벤트 메인 페이지로 이동
    navigate("/event-main", {
      state: {
        eventTitle: mockEvent.title,
        eventCode: inviteCode,
      },
    });
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
            초대 코드:{" "}
            <span className="font-mono">{inviteCode}</span>
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
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">
                  {error}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                주최자로부터 받은 비밀번호를 입력하세요
              </p>
            </div>

            <EventeeButton type="submit" className="w-full">
              다음으로
            </EventeeButton>
          </form>
        </div>
      </div>
    </div>
  );
}