import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { User as UserIcon } from "lucide-react";
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
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useApp();

  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // 마이페이지 정보 로딩
  useEffect(() => {
    apiFetch(`${API_URL}/api/v1/member/mypage`, { method: "GET" })
      .then((res) => res.json())
      .then((json) => {
        if (!json.isSuccess) return;

        // 사용자 정보 저장
        setUser((prev) => ({
          ...(prev || {}),
          nickname: json.result.nickname,
          profileImageUrl: json.result.profileImageUrl,
        }));

        // 참여 이벤트 저장
        setJoinedEvents(json.result.joinedEvents || []);
      });
  }, [API_URL, setUser]);

  // 로그아웃
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
      <div className="min-h-screen px-4 py-6 relative bg-[#faf9f6]">
        <div className="max-w-5xl mx-auto">

          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">
              Even<span style={{ color: "#67594C" }}>Tee</span>
            </h1>
          </div>

          {/* 프로필 영역 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <div className="flex items-center justify-between">

              {/* 프로필 이미지 + 닉네임 */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#D2CDBC] flex items-center justify-center">
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

                <h2 className="text-2xl font-semibold" style={{ color: "#67594C" }}>
                  {user.nickname ?? "사용자"}
                </h2>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <EventeeButton
                  variant="ghost"
                  className="px-6"
                  onClick={() => setProfileModalOpen(true)}
                >
                  프로필 수정
                </EventeeButton>

                <EventeeButton
                  variant="ghost"
                  onClick={handleLogout}
                  className="px-6"
                >
                  로그아웃
                </EventeeButton>
              </div>

            </div>
          </div>

          {/* 참여 이벤트 리스트 */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold" style={{ color: "#67594C" }}>
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
                    {/* 썸네일 */}
                    <div className="relative h-48 bg-gray-200">
                      <img
                        src={event.thumbnailUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 카드 내용 */}
                    <div className="p-6">
                      <h3
                        className="mb-2 font-semibold"
                        style={{ color: "#67594C" }}
                      >
                        {event.title}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">

                          {/* 참가자 프로필 이미지들 */}
                          <div className="flex -space-x-2">
                            {event.participantProfileImages.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                              />
                            ))}

                            {/* +몇명 표시 */}
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

                          <span className="text-sm text-gray-600">
                            {event.startAt?.split("T")[0]} ~ {event.endAt?.split("T")[0]}
                          </span>

                        </div>

                        {/* 참여하기 → 비밀번호 입력 페이지 이동 */}
                        <EventeeButton
                          className="px-6"
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
                ))}

              </div>
            )}
          </div>

          {/* 이벤트 생성 버튼 */}
          <button
            onClick={() => navigate("/create-event")}
            className="fixed bottom-10 right-10 bg-[#67594C] text-white px-6 py-4 rounded-full shadow-lg hover:bg-[#564a3f] transition"
          >
            + 이벤트 생성하기
          </button>

        </div>
      </div>

      {/* 프로필 수정 모달 */}
      <ProfileEditModal
        open={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
