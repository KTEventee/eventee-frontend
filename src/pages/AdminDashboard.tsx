import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import EventeeButton from '../components/EventeeButton';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { User, Users, MessageSquare, Gamepad2, Heart, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, currentEvent, logout } = useApp();
  
  if (!currentEvent || !user) return null;
  const event = currentEvent;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl mb-1" style={{ color: '#67594C' }}>
                Even<span style={{ color: '#67594C' }}>tee</span> <span className="text-sm" style={{ color: '#FFAB5D' }}>관리자</span>
              </h1>
              <h2 className="text-2xl" style={{ color: '#67594C' }}>{event.title}</h2>
              <p className="text-sm text-gray-600">
                {format(event.startDate, 'yyyy.MM.dd', { locale: ko })} - {format(event.endDate, 'yyyy.MM.dd', { locale: ko })}
              </p>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {user.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div>{user.nickname}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/my-page')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    마이페이지
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    로그아웃
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="team">팀 빌딩</TabsTrigger>
            <TabsTrigger value="chat">채팅</TabsTrigger>
            <TabsTrigger value="rolling">롤링 페이퍼</TabsTrigger>
            <TabsTrigger value="games">미니게임</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>이벤트 정보</CardTitle>
                <CardDescription>{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">초대 코드</div>
                    <div className="text-2xl font-mono">{event.inviteCode}</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">참가자 수</div>
                    <div className="text-2xl">24명</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">팀 수</div>
                    <div className="text-2xl">6개 팀</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    팀 빌딩
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">참가자들과 팀을 구성하고 함께 활동하세요</p>
                  <EventeeButton className="w-full">팀 빌딩 시작하기</EventeeButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    채팅
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">팀원들과 실시간으로 소통하세요</p>
                  <EventeeButton className="w-full">채팅 참여하기</EventeeButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    롤링 페이퍼
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">참가자들에게 응원 메시지를 남겨보세요</p>
                  <EventeeButton className="w-full" variant="outline">메시지 작성하기</EventeeButton>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    미니게임
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">재미있는 게임으로 팀워크를 높여보세요</p>
                  <EventeeButton className="w-full" variant="outline">게임 시작하기</EventeeButton>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>팀 빌딩</CardTitle>
                <CardDescription>팀을 구성하고 관리하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  팀 빌딩 기능은 곧 추가될 예정입니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>채팅</CardTitle>
                <CardDescription>참가자들과 실시간으로 소통하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  채팅 기능은 곧 추가될 예정입니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rolling">
            <Card>
              <CardHeader>
                <CardTitle>롤링 페이퍼</CardTitle>
                <CardDescription>참가자들에게 응원 메시지를 남겨보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  롤링 페이퍼 기능은 곧 추가될 예정입니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>미니게임</CardTitle>
                <CardDescription>재미있는 게임으로 팀워크를 높여보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  미니게임 기능은 곧 추가될 예정입니다
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
