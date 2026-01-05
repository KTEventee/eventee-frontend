import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, type Event } from '../contexts/AppContext';
import EventeeButton from '../components/EventeeButton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ArrowLeft, Calendar as CalendarIcon, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user, setCurrentEvent } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = '이벤트 제목을 입력해주세요';
    if (!description.trim()) newErrors.description = '이벤트 설명을 입력해주세요';
    if (!password.trim()) newErrors.password = '비밀번호를 입력해주세요';
    if (!startDate) newErrors.startDate = '시작일을 선택해주세요';
    if (!endDate) newErrors.endDate = '종료일을 선택해주세요';
    
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = '종료일은 시작일 이후여야 합니다';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // 초대 코드 생성
    const code = generateInviteCode();
    setGeneratedCode(code);
    
    // TODO: 실제 API 호출
    // POST /api/events
    // body: { title, description, password, startDate, endDate }
    // response: { id, inviteCode, ... }
    
    setShowSuccessDialog(true);
  };

  const handleCopyInvite = () => {
    const inviteMessage = `${title}에 초대합니다!

일정: ${startDate ? format(startDate, 'yyyy년 M월 d일', { locale: ko }) : ''} - ${endDate ? format(endDate, 'yyyy년 M월 d일', { locale: ko }) : ''}
${description}

초대 코드: ${generatedCode}
비밀번호: ${password}

아래 링크를 통해 참여하세요:
https://eventee.app/join?code=${generatedCode}`;

    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (startDate && endDate) {
      const newEvent: Event = {
        id: Date.now().toString(),
        title,
        description,
        startDate,
        endDate,
        inviteCode: generatedCode,
        createdBy: user?.id || '',
      };
      setCurrentEvent(newEvent);
      navigate('/admin-dashboard');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/join-event')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl">새 이벤트 만들기</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">이벤트 제목</Label>
              <Input
                id="title"
                type="text"
                placeholder="예: 2024 겨울 해커톤"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: '' });
                }}
                className="mt-2"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">이벤트 설명</Label>
              <Textarea
                id="description"
                placeholder="이벤트에 대한 간단한 설명을 입력하세요"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: '' });
                }}
                className="mt-2 min-h-[100px]"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2">{errors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">이벤트 비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="참가자가 입력할 비밀번호"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                className="mt-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                참가자가 이벤트에 입장할 때 필요한 비밀번호입니다
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>시작일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'yyyy-MM-dd') : '날짜 선택'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setErrors({ ...errors, startDate: '' });
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-2">{errors.startDate}</p>
                )}
              </div>

              <div>
                <Label>종료일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'yyyy-MM-dd') : '날짜 선택'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setErrors({ ...errors, endDate: '' });
                      }}
                      disabled={(date) => startDate ? date < startDate : false}
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-2">{errors.endDate}</p>
                )}
              </div>
            </div>

            <EventeeButton type="submit" className="w-full">
              다음으로
            </EventeeButton>
          </form>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>이벤트가 생성되었습니다!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">초대 코드</span>
                <span className="font-mono text-2xl tracking-wider">{generatedCode}</span>
              </div>
              <div className="text-sm text-gray-600">
                유효 기간: {endDate ? format(endDate, 'yyyy년 M월 d일까지', { locale: ko }) : ''}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm whitespace-pre-wrap">
                {`${title}에 초대합니다!

일정: ${startDate ? format(startDate, 'yyyy년 M월 d일', { locale: ko }) : ''} - ${endDate ? format(endDate, 'yyyy년 M월 d일', { locale: ko }) : ''}
${description}

초대 코드: ${generatedCode}
비밀번호: ${password}

아래 링크를 통해 참여하세요:
https://eventee.app/join?code=${generatedCode}`}
              </div>
            </div>

            <EventeeButton
              onClick={handleCopyInvite}
              className="w-full flex items-center justify-center"
              variant={copied ? "outline" : "primary"}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  초대 메시지 복사하기
                </>
              )}
            </EventeeButton>

            <EventeeButton
              onClick={handleConfirm}
              variant="outline"
              className="w-full"
            >
              이벤트로 이동
            </EventeeButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
