import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EventeeButton from "../components/EventeeButton";
import { Copy, Check } from "lucide-react";

export default function InviteCodePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    inviteCode = "ABCDEF",
    title = "이벤트 제목",
    startAt,
    endAt,
    password,
  } = location.state || {};

  const [copied, setCopied] = useState(false);

  // 날짜 변환 함수
  const formatDateTime = (dt: string | undefined) => {
    if (!dt) return "날짜 정보 없음";
    return new Date(dt).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 초대 문구 (공유용)
  const inviteMessage = `${title}에 초대합니다!
행사 코드 : ${inviteCode}
입장 비밀번호 : ${password}

아래 링크로 바로 참여해보세요!
https://eventee.app/join?code=${inviteCode}`;

  const handleCopyInvite = () => {
    const textArea = document.createElement("textarea");
    textArea.value = inviteMessage;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen relative">
      {/* EventTee 로고 */}
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4">
        <h1 className="font-['Pretendard:Bold'] text-[36px] text-[#67594c] mb-12">
          초대 코드
        </h1>

        <div className="w-full max-w-[850px] space-y-6">
          {/* 코드 박스 */}
          <div className="bg-white rounded-[10px] p-8">
            <h2 className="text-[20px] font-semibold mb-2">행사 코드</h2>
            <p className="text-[12px] text-gray-600 mb-6">
              초대 코드를 복사해 참여자에게 공유하세요
            </p>

            <div className="bg-neutral-100 rounded-[10px] py-12 flex items-center justify-center mb-4">
              <p className="text-[64px] text-black tracking-wider font-mono">
                {inviteCode}
              </p>
            </div>

            {/* 날짜 표시 */}
            <div className="text-center space-y-1 text-[12px] text-gray-600">
              <p>시작 : {formatDateTime(startAt)}</p>
              <p>종료 : {formatDateTime(endAt)}</p>
            </div>
          </div>

          {/* 초대 문구 */}
          <div className="bg-white rounded-[10px] p-8">
            <div className="bg-neutral-100 rounded-[10px] p-8 mb-6">
              <div className="text-[14px] text-black whitespace-pre-wrap leading-relaxed">
                {inviteMessage}
              </div>
            </div>

            <div className="flex justify-end">
              <EventeeButton
                onClick={handleCopyInvite}
                variant="outline"
                className="flex items-center gap-2 px-8"
              >
                {copied ? (
                  <>
                    <Check className="inline-block h-4 w-4" />
                    복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="inline-block h-4 w-4" />
                    초대 문구 복사
                  </>
                )}
              </EventeeButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
