import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { User as UserIcon, Crown } from "lucide-react";
import { apiFetch } from "../utils/apiFetch";
import ProfileEditModal from "../components/ProfileEditModal";

type JoinedEvent = {
  eventId: number;
  title: string;
  thumbnailUrl: string;
  inviteCode: string;
  startAt: string;
  endAt: string;
  participantsCount: number;
  participantProfileImages: string[];
  date: string;
  role: string;
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useApp();
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    apiFetch(`${API_URL}/api/v1/member/mypage`, { method: "GET" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.isSuccess) return;

        setUser((prev) => ({
          ...(prev || {}),
          nickname: json.result.nickname,
          profileImageUrl: json.result.profileImageUrl,
        }));

        setJoinedEvents(json.result.joinedEvents || []);
      });
  }, [API_URL, setUser]);

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_URL}/api/v1/auth/logout`, { method: "POST" });
    } finally {
      logout();
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen px-4 py-6 relative bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-10">

          {/* 로그인 페이지 동일 로고 디자인 */}
          <div className="flex items-center gap-2">
            <img
              src="/ticket.png"
              alt="Eventee Logo"
              className="w-8 h-8 rounded-xl shadow-sm"
            />
            <span className="text-[22px] font-bold tracking-tight text-[#5A4A3B]">
              Eventee
            </span>
          </div>

        </div>


          {/* 프로필 카드 */}
          <div className="bg-white rounded-3xl shadow-md p-10 mb-12 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#D2CDBC] flex items-center justify-center shadow-inner">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-white" />
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-semibold text-[#67594C]">
                    {user.nickname ?? "사용자"}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    내 이벤트 관리 공간
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <EventeeButton
                  variant="ghost"
                  className="px-6 h-[44px]"
                  onClick={() => setProfileModalOpen(true)}
                >
                  프로필 수정
                </EventeeButton>

                <EventeeButton
                  variant="ghost"
                  onClick={handleLogout}
                  className="px-6 h-[44px]"
                >
                  로그아웃
                </EventeeButton>
              </div>
            </div>
          </div>

          {/* 참여 이벤트 리스트 */}
          <div className="mb-14">
            <h2 className="text-2xl font-semibold mb-6 text-[#67594C]">
              참여중인 이벤트
            </h2>

            {joinedEvents.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm p-14 text-center border border-gray-100">
                <p className="text-gray-500 text-lg">
                  참여한 이벤트가 없습니다
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {joinedEvents.map((event) => {
                  const isHost = event.role === "HOST";

                  return (
                    <div
                      key={event.eventId}
                      className={`
                        rounded-3xl overflow-hidden relative transition 
                        hover:shadow-lg 
                        ${isHost 
                          ? "border-2 border-[#67594C] bg-[#F3F0EA]" 
                          : "bg-white border border-gray-100 shadow-sm"
                        }
                      `}
                    >

                      {isHost && (
                        <div className="absolute top-4 right-4 bg-[#67594C] text-white px-3 py-1 rounded-full text-xs shadow">
                          HOST
                        </div>
                      )}

                      {/* 썸네일 */}
                      <div className="relative h-48 bg-gray-200">
                        <img
                          src={event.thumbnailUrl || "/default-event.png"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/default-event.png";
                          }}
                        />
                      </div>


                      {/* 내용 */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-[#67594C]">
                            {event.title}
                          </h3>
                          {isHost && <Crown size={18} className="text-[#67594C]" />}
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                          {event.startAt?.split("T")[0]}  
                          <span className="mx-1">~</span>
                          {event.endAt?.split("T")[0]}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {event.participantProfileImages.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                className="w-9 h-9 rounded-full border-2 border-white object-cover"
                              />
                            ))}

                            {event.participantsCount > 3 && (
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-xs border-2 border-white bg-[#E9E5DA] text-[#67594C]"
                              >
                                +{event.participantsCount - 3}
                              </div>
                            )}
                          </div>

                          <EventeeButton
                            className="px-6 h-[40px]"
                            onClick={() =>
                              navigate("/event-password", {
                                state: {
                                  inviteCode: event.inviteCode,
                                  eventId: event.eventId,
                                  title: event.title,
                                  startAt: event.startAt,
                                  endAt: event.endAt,
                                },
                              })
                            }
                          >
                            참여하기
                          </EventeeButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="fixed bottom-10 right-10 flex flex-col gap-3">

            {/* 참여하기 버튼 → /join-event */}
            <button
              onClick={() => navigate("/join-event")}
              className="bg-white text-[#67594C] border border-[#67594C] px-7 py-4 rounded-full shadow-md hover:bg-[#F3F0EA] transition-all"
            >
              이벤트 참여하기
            </button>

            {/* 기존 이벤트 생성 버튼 */}
            <button
              onClick={() => navigate("/create-event")}
              className="bg-[#67594C] text-white px-7 py-4 rounded-full shadow-xl hover:bg-[#54473C] transition-all"
            >
              + 이벤트 생성하기
            </button>

          </div>
        </div>
      </div>

      <ProfileEditModal
        open={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
