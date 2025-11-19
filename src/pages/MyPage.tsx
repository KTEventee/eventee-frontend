import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { User as UserIcon } from "lucide-react";

type JoinedEvent = {
  eventId: number;
  title: string;
  thumbnailUrl: string;
  participantsCount: number;
  participantProfileImages: string[];
  date: string;
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, accessToken, logout } = useApp();

  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${API_URL}/api/v1/member/mypage`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.isSuccess) return;
        setJoinedEvents(json.result.joinedEvents || []);
      });
  }, [accessToken, API_URL]);

  if (!user) return null;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-5xl mx-auto">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl" style={{ color: "#000000" }}>
            Even<span style={{ color: "#67594C" }}>Tee</span>
          </h1>
        </div>

        {/* 프로필 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl"
                style={{ backgroundColor: "#D2CDBC" }}
              >
                <UserIcon className="h-12 w-12" />
              </div>

              <h2 className="text-2xl" style={{ color: "#67594C" }}>
                {user.nickname}
              </h2>
            </div>

            <div className="flex gap-3">
              <EventeeButton variant="ghost" className="px-6">
                프로필 수정
              </EventeeButton>
              <EventeeButton
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="px-6"
              >
                로그아웃
              </EventeeButton>
            </div>
          </div>
        </div>

        {/* 참여중인 이벤트 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl" style={{ color: "#67594C" }}>
              참여중인 이벤트
            </h2>
          </div>

          {joinedEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-gray-500">참여한 이벤트가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={event.thumbnailUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="mb-2" style={{ color: "#67594C" }}>
                      {event.title}
                    </h3>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* 참가자 프로필 이미지 */}
                        <div className="flex -space-x-2">
                          {event.participantProfileImages
                            .slice(0, 3)
                            .map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="participant"
                                className="w-8 h-8 rounded-full object-cover border-2 border-white"
                              />
                            ))}

                          {event.participantsCount > 3 && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-white"
                              style={{
                                backgroundColor: "#E9E5DA",
                                color: "#67594C",
                              }}
                            >
                              +{event.participantsCount - 3}
                            </div>
                          )}
                        </div>

                        {/* 날짜 */}
                        <span className="text-sm text-gray-600">
                          {event.date}
                        </span>
                      </div>

                      <EventeeButton
                        onClick={() => navigate(`/event/${event.eventId}`)}
                        className="px-6 shrink-0"
                      >
                        참여하기
                      </EventeeButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
