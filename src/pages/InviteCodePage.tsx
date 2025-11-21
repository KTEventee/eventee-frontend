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
    textArea.style.left = "-9999px";
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
    <div className="bg-[#FAF9F6] min-h-screen relative">

      {/* 로고 */}
      <div className="absolute left-10 top-10">
        <h1 className="text-[30px] font-bold tracking-tight">
          Even<span className="text-[#67594C]">Tee</span>
        </h1>
      </div>

      {/* 메인 컨테이너 */}
      <div className="max-w-4xl mx-auto pt-40 pb-24 px-6">

        <h1 className="text-[34px] text-center font-semibold text-[#67594C] mb-16 tracking-tight">
          초대 코드 생성 완료
        </h1>

        <div className="space-y-10">
          
          {/* 초대 코드 카드 */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12">
            <h2 className="text-[22px] font-semibold text-[#3B3B3B] mb-2">
              행사 코드
            </h2>
            <p className="text-[14px] text-gray-500 mb-10">
              아래 코드를 복사하여 참여자에게 공유하세요
            </p>

            <div className="bg-[#F0EFEA] rounded-2xl py-14 flex items-center justify-center shadow-inner mb-8">
              <p className="text-[60px] font-mono tracking-[0.18em] text-[#333]">
                {inviteCode}
              </p>
            </div>

            {/* 날짜 정보 */}
            <div className="text-center space-y-2 text-[14px] text-gray-600">
              <p>
                시작 : <span className="font-medium">{formatDateTime(startAt)}</span>
              </p>
              <p>
                종료 : <span className="font-medium">{formatDateTime(endAt)}</span>
              </p>
            </div>
          </div>

          {/* 초대 문구 */}
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-12">

            <div className="bg-[#F8F7F3] rounded-2xl p-8 border border-neutral-200 mb-10 shadow-sm">
              <div className="text-[15px] leading-relaxed text-[#333] whitespace-pre-wrap">
                {inviteMessage}
              </div>
            </div>

            {/* 복사 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={handleCopyInvite}
                className="
                  flex items-center justify-center gap-2
                  px-8 py-3 rounded-xl
                  border border-[#C8C3BE]
                  text-[#67594C] bg-white
                  hover:bg-[#EEEAE6] active:bg-[#E6E2DD]
                  transition-all shadow-sm
                "
              >
                {copied ? (
                  <>
                    <Check className="h-[20px] w-[20px]" />
                    <span className="text-[16px]">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-[20px] w-[20px]" />
                    <span className="text-[16px]">초대 문구 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* 돌아가기 */}
            <div className="mt-14 flex justify-center">
              <EventeeButton
                onClick={() => navigate("/my-page")}
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
