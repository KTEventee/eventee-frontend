import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { User as UserIcon, ChevronRight } from "lucide-react";

// TODO: 백엔드 연동 필요
// API: GET /api/user/events
// Response: { events: Array<{ id, title, imageUrl, participants: Array<{ nickname, profileImageUrl }>, startDate, endDate }> }
type EventData = {
  id: string;
  title: string;
  imageUrl: string; // 행사 대표 이미지 URL (백엔드에서 제공)
  participants: Array<{
    nickname: string;
    profileImageUrl?: string; // 참가자 프로필 이미지 URL (백엔드에서 제공)
  }>;
  startDate: Date;
  endDate: Date;
};

// MOCK DATA - 실제 구현 시 백엔드에서 데이터 가져오기
const mockEvents: EventData[] = [
  {
    id: "1",
    title: "캐릭털 오디",
    imageUrl:
      "https://images.unsplash.com/photo-1590319541269-4513d04a9d6a?w=400", // TODO: 백엔드에서 실제 행사 이미지 URL 받아오기
    participants: [
      { nickname: "감길동" },
      { nickname: "김철수" },
      { nickname: "이영희" },
      { nickname: "박민수" },
    ],
    startDate: new Date("2024-11-01"),
    endDate: new Date("2025-12-31"), // 현재 진행중
  },
  {
    id: "2",
    title: "OO대학교 멘티",
    imageUrl:
      "https://images.unsplash.com/photo-1590319541269-4513d04a9d6a?w=400", // TODO: 백엔드에서 실제 행사 이미지 URL 받아오기
    participants: [
      { nickname: "최지민" },
      { nickname: "정수현" },
      { nickname: "강태희" },
      { nickname: "윤서연" },
    ],
    startDate: new Date("2024-11-15"),
    endDate: new Date("2024-11-20"),
  },
  {
    id: "3",
    title: "동아리 수료식",
    imageUrl:
      "https://images.unsplash.com/photo-1590319541269-4513d04a9d6a?w=400", // TODO: 백엔드에서 실제 행사 이미지 URL 받아오기
    participants: [
      { nickname: "송하은" },
      { nickname: "임도현" },
      { nickname: "오준서" },
    ],
    startDate: new Date("2024-10-10"),
    endDate: new Date("2024-10-12"),
  },
];

const getEventPeriodText = (
  startDate: Date,
  endDate: Date,
): string => {
  const diffTime = Math.abs(
    endDate.getTime() - startDate.getTime(),
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays}일`;
};

export default function MyPage() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  if (!user) return null;

  // TODO: 컴포넌트 마운트 시 백엔드에서 데이터 가져오기
  // useEffect(() => {
  //   fetch('/api/user/events')
  //     .then(res => res.json())
  //     .then(data => setEvents(data.events));
  // }, []);

  // 현재 날짜 기준으로 진행중/종료된 이벤트 분리
  const now = new Date();
  const ongoingEvents = mockEvents.filter(
    (event) => event.startDate <= now && event.endDate >= now
  );
  const pastEvents = mockEvents.filter((event) => event.endDate < now);

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
              {/* 프로필 이미지 */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl"
                style={{ backgroundColor: "#D2CDBC" }}
              >
                <UserIcon className="h-12 w-12" />
              </div>
              {/* 닉네임 */}
              <h2
                className="text-2xl"
                style={{ color: "#67594C" }}
              >
                {user.nickname}
              </h2>
            </div>

            {/* 버튼들 */}
            <div className="flex gap-3">
              <EventeeButton 
                variant="ghost" 
                className="px-6"
                onClick={() => {
                  // TODO: 백엔드 연동 필요
                  // 프로필 수정 페이지로 이동 또는 모달 표시
                  // API: PUT /api/user/profile
                  // body: { nickname, profileImage }
                  // Response: { success: boolean, user: User }
                  alert("프로필 수정 기능은 추후 구현 예정입니다.");
                }}
              >
                프로필 수정
              </EventeeButton>
              <EventeeButton
                variant="ghost"
                onClick={() => {
                  // TODO: 백엔드 연동 필요
                  // API: POST /api/auth/logout
                  // Response: { success: boolean }
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
            <h2
              className="text-2xl"
              style={{ color: "#67594C" }}
            >
              참여중인 이벤트
            </h2>
            <EventeeButton
              onClick={() => navigate("/create-event")}
              className="px-8"
            >
              이벤트 생성하기
            </EventeeButton>
          </div>

          {/* TODO: 백엔드에서 진행중인 이벤트 목록이 없으면 빈 상태 표시 */}
          {ongoingEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-gray-500">
                참여중인 이벤트가 없습니다
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* TODO: 백엔드에서 받아온 행사 대표 이미지 URL 사용 */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 이벤트 정보 */}
                  <div className="p-6">
                    {/* TODO: 백엔드에서 받아온 행사명 */}
                    <h3
                      className="mb-2"
                      style={{ color: "#67594C" }}
                    >
                      {event.title}
                    </h3>

                    {/* TODO: 백엔드에서 받아온 참가자 정보 (닉네임, 프로필 이미지) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {event.participants
                            .slice(0, 3)
                            .map((participant, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                                style={{
                                  backgroundColor:
                                    idx === 0
                                      ? "#67594C"
                                      : idx === 1
                                        ? "#FFAB5D"
                                        : "#D2CDBC",
                                }}
                                title={participant.nickname}
                              >
                                {/* TODO: participant.profileImageUrl이 있으면 이미지 사용, 없으면 닉네임 첫 글자 표시 */}
                                {participant.profileImageUrl ? (
                                  <img
                                    src={
                                      participant.profileImageUrl
                                    }
                                    alt={participant.nickname}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  participant.nickname
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                              </div>
                            ))}
                          {event.participants.length > 3 && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-white"
                              style={{
                                backgroundColor: "#E9E5DA",
                                color: "#67594C",
                              }}
                            >
                              +{event.participants.length - 3}
                            </div>
                          )}
                        </div>
                        {/* TODO: 백엔드에서 받아온 행사 기간으로 계산 */}
                        <span className="text-sm text-gray-600">
                          {getEventPeriodText(
                            event.startDate,
                            event.endDate,
                          )}
                        </span>
                      </div>

                      {/* 참여하기 버튼 */}
                      <EventeeButton
                        onClick={() => navigate(`/event/${event.id}`)}
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

        {/* 지금까지 참여한 이벤트들 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl"
              style={{ color: "#67594C" }}
            >
              지금까지 참여한 이벤트들
            </h2>
          </div>

          {/* TODO: 백엔드에서 이벤트 목록이 없으면 빈 상태 표시 */}
          {pastEvents.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-gray-500">
                참여한 이벤트가 없습니다
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* TODO: 백엔드에서 받아온 행사 대표 이미지 URL 사용 */}
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 이벤트 정보 */}
                  <div className="p-6">
                    {/* TODO: 백엔드에서 받아온 행사명 */}
                    <h3
                      className="mb-2"
                      style={{ color: "#67594C" }}
                    >
                      {event.title}
                    </h3>

                    {/* TODO: 백엔드에서 받아온 참가자 정보 (닉네임, 프로필 이미지) */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {event.participants
                            .slice(0, 3)
                            .map((participant, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs border-2 border-white"
                                style={{
                                  backgroundColor:
                                    idx === 0
                                      ? "#67594C"
                                      : idx === 1
                                        ? "#FFAB5D"
                                        : "#D2CDBC",
                                }}
                                title={participant.nickname}
                              >
                                {/* TODO: participant.profileImageUrl이 있으면 이미지 사용, 없으면 닉네임 첫 글자 표시 */}
                                {participant.profileImageUrl ? (
                                  <img
                                    src={
                                      participant.profileImageUrl
                                    }
                                    alt={participant.nickname}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  participant.nickname
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                              </div>
                            ))}
                          {event.participants.length > 3 && (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-white"
                              style={{
                                backgroundColor: "#E9E5DA",
                                color: "#67594C",
                              }}
                            >
                              +{event.participants.length - 3}
                            </div>
                          )}
                        </div>
                        {/* TODO: 백엔드에서 받아온 행사 기간으로 계산 */}
                        <span className="text-sm text-gray-600">
                          {getEventPeriodText(
                            event.startDate,
                            event.endDate,
                          )}
                        </span>
                      </div>

                      {/* 참여하기 버튼 */}
                      <EventeeButton
                        onClick={() => navigate(`/event/${event.id}`)}
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