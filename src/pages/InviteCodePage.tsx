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

  const inviteMessage = `${title}에 초대합니다!
행사 코드 : ${inviteCode}
입장 비밀번호 : ${password}

아래 링크로 바로 참여해보세요!
https://www.eventee.cloud/join?code=${inviteCode}`;

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
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen relative">
      
      {/* Eventtee 로고 */}
      <div className="absolute left-8 top-8">
        <p className="text-[26px] font-bold tracking-tight">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      {/* 메인 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <h1 className="text-[32px] font-semibold text-[#67594c] mb-12 tracking-tight">
          초대 코드 생성 완료
        </h1>

        <div className="w-full max-w-[850px] space-y-8">
          
          {/* 코드 카드 */}
          <div className="bg-white rounded-[12px] p-10 shadow-sm border border-gray-100">
            <h2 className="text-[20px] font-semibold mb-2 text-[#3b3b3b]">
              행사 코드
            </h2>
            <p className="text-[13px] text-gray-500 mb-8">
              생성된 초대 코드를 복사해 참여자에게 공유하세요
            </p>

            <div className="bg-neutral-100 rounded-[12px] py-12 flex items-center justify-center mb-6 shadow-inner">
              <p className="text-[56px] text-black font-mono tracking-[0.15em]">
                {inviteCode}
              </p>
            </div>

            {/* 날짜 */}
            <div className="text-center space-y-2 text-[13px] text-gray-600">
              <p>시작 : <span className="font-medium">{formatDateTime(startAt)}</span></p>
              <p>종료 : <span className="font-medium">{formatDateTime(endAt)}</span></p>
            </div>
          </div>

          {/* 초대 문구 */}
          <div className="bg-white rounded-[12px] p-10 shadow-sm border border-gray-100">
            <div className="bg-neutral-100 rounded-[12px] p-8 mb-8 border border-neutral-200">
              <div className="text-[15px] text-black whitespace-pre-wrap leading-relaxed">
                {inviteMessage}
              </div>
            </div>

           <div className="flex justify-end">
            <button
              onClick={handleCopyInvite}
              className="
                flex items-center justify-center gap-2
                px-8 py-3
                rounded-[12px]
                border border-[#c8c3be]
                text-[#67594c]
                bg-white
                hover:bg-[#f3f1ee]
                active:bg-[#e7e4e1]
                transition-all
              "
            >
              {copied ? (
                <>
                  <Check className="h-[18px] w-[18px]" />
                  <span className="text-[16px] leading-none">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="h-[18px] w-[18px]" />
                  <span className="text-[16px] leading-none">초대 문구 복사</span>
                </>
              )}
            </button>
          </div>



            {/* 돌아가기 버튼 */}
            <div className="flex justify-center mt-12">
              <EventeeButton
                onClick={() => navigate("/my-page")}
                variant="primary"
                className="px-12 py-3 text-[16px]"
              >
                마이페이지로 돌아가기
              </EventeeButton>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
