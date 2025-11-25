import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  MessageSquare,
  Gamepad2,
  Heart,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, currentEvent, logout } = useApp();

  if (!currentEvent || !user) return null;

  const event = currentEvent;

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Header */}
      <header className="bg-[#E8E4D9] border-b border-[#D5D0C4] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            
            {/* 이벤트 정보 */}
            <div className="flex flex-col gap-1">
              <h1
                className="text-xl font-semibold tracking-tight"
                style={{ color: "#67594C" }}
              >
                EvenTee{" "}
                <span className="text-sm" style={{ color: "#FFAB5D" }}>
                  관리자
                </span>
              </h1>

              <h2
                className="text-2xl font-bold truncate max-w-[250px] sm:max-w-none"
                style={{ color: "#67594C" }}
              >
                {event.title}
              </h2>

              <p className="text-sm text-gray-600">
                {format(event.startDate, "yyyy.MM.dd", { locale: ko })} ~{" "}
                {format(event.endDate, "yyyy.MM.dd", { locale: ko })}
              </p>
            </div>

            {/* 오른쪽: 뒤로가기 버튼 */}
            <div>
             <Button
                variant="outline"
                onClick={() =>
                  navigate("/event-main", {
                    state: {
                      eventId: currentEvent.id,
                      eventTitle: currentEvent.title,
                      eventCode: currentEvent.inviteCode,
                      nickname: user.nickname
                    },
                  })
                }
              >
                이벤트 화면으로 돌아가기
              </Button>

            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-6">

          {/* Tabs Header */}
          <TabsList className="bg-transparent border-b border-[#DDD6CE] rounded-none px-0">
            <TabsTriggerStyled value="overview">대시보드</TabsTriggerStyled>
            <TabsTriggerStyled value="participants">참여자 관리</TabsTriggerStyled>
            <TabsTriggerStyled value="notice">공지 작성</TabsTriggerStyled>
            <TabsTriggerStyled value="groups">그룹 관리</TabsTriggerStyled>
            <TabsTriggerStyled value="games">게임 관리</TabsTriggerStyled>
          </TabsList>

          {/* 대시보드 */}
          <TabsContent value="overview" className="space-y-6">

            {/* 이벤트 정보 */}
            <Card className="bg-white border border-[#E8E4D9] shadow-sm rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#67594C] text-lg">
                  이벤트 정보
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {event.description || "이벤트 설명이 아직 입력되지 않았습니다."}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoBox label="초대 코드" value={event.inviteCode} color="#FFAB5D" />
                  <InfoBox label="참가자 수" value="24명" color="#A8CBAA" />
                  <InfoBox label="팀 수" value="6개 팀" color="#C7D2FE" />
                </div>
              </CardContent>
            </Card>

            {/* 기능 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Users className="h-5 w-5 text-[#67594C]" />}
                title="참여자 관리"
                description="참여자 목록을 확인하고 상태를 관리하는 기능입니다."
                button="참여자 관리 열기"
              />
              <FeatureCard
                icon={<MessageSquare className="h-5 w-5 text-[#67594C]" />}
                title="공지 작성"
                description="공지사항을 작성하고 참가자에게 전달하는 기능입니다."
                button="공지 작성하기"
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5 text-[#67594C]" />}
                title="그룹 관리"
                description="팀/그룹 생성과 구성원 관리를 담당합니다."
                button="그룹 관리하기"
              />
              <FeatureCard
                icon={<Gamepad2 className="h-5 w-5 text-[#67594C]" />}
                title="게임 관리"
                description="이벤트 진행용 게임 관리 기능입니다."
                button="기능 추가 예정입니다"
                outline
                disabled
              />
            </div>

          </TabsContent>

          {/* 나머지 탭들 */}
          <PlaceholderTab value="participants" title="참여자 관리" />
          <PlaceholderTab value="notice" title="공지 작성" />
          <PlaceholderTab value="groups" title="그룹 관리" />
          <PlaceholderTab value="games" title="게임 관리" />

        </Tabs>
      </main>
    </div>
  );
}

/* ----------------- COMPONENTS ----------------- */

function TabsTriggerStyled({ value, children }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none px-4 pb-2 pt-1 text-sm text-gray-500
                 data-[state=active]:border-b-2 data-[state=active]:border-[#67594C]
                 data-[state=active]:text-[#67594C] data-[state=active]:font-semibold"
    >
      {children}
    </TabsTrigger>
  );
}

function InfoBox({ label, value, color }) {
  return (
    <div
      className="rounded-xl p-4 shadow-sm"
      style={{ backgroundColor: `${color}22` }}
    >
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-semibold" style={{ color: "#67594C" }}>
        {value}
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description, button, outline, disabled }) {
  return (
    <Card className="bg-white border border-[#E8E4D9] shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#67594C]">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 text-sm">{description}</p>
        <EventeeButton
          className="w-full"
          variant={outline ? "outline" : "default"}
          disabled={disabled}
        >
          {button}
        </EventeeButton>
      </CardContent>
    </Card>
  );
}

function PlaceholderTab({ value, title }) {
  return (
    <TabsContent value={value}>
      <Card className="bg-white border border-[#E8E4D9] shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-[#67594C]">{title}</CardTitle>
          <CardDescription>기능이 곧 추가될 예정입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            준비 중입니다.
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
