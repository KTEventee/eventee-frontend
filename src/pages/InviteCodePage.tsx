import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EventeeButton from "../components/EventeeButton";
import { Copy, Check } from "lucide-react";

export default function InviteCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    inviteCode = "ABCDEF",
    title = "케컵업 1조",
    date,
    password,
  } = location.state || {};

  const [copied, setCopied] = useState(false);

  const inviteMessage = `${title}에 초대합니다!
행사 코드 : ${inviteCode}

초대받은 행사로 바로가기
https://eventee.app/join?code=${inviteCode}`;

  const handleCopyInvite = () => {
    // 클립보드 복사 - 대체 방법 사용
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

  const formattedDate = date
    ? new Date(date).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "2025년 00월 00일 오후 00:00";

  return (
    <div className="bg-[#faf9f6] min-h-screen relative">
      {/* EventTee 로고 */}
      <div className="absolute left-12 top-8">
        <p className="text-[30px] font-bold">
          Even<span className="text-[#67594c]">Tee</span>
        </p>
      </div>

      {/* 메인 컨텐츠 - 중앙 정렬 */}
      <div className="flex flex-col items-center justify-center pt-32 pb-16 px-4">
        {/* 1-2 번호 뱃지 */}
        <div className="relative mb-4"></div>

        {/* 제목 */}
        <h1 className="font-['Pretendard:Bold',sans-serif] text-[36px] text-[#67594c] mb-12">
          초대 코드
        </h1>

        {/* 컨텐츠 컨테이너 */}
        <div className="w-full max-w-[850px] space-y-6">
          {/* 행사 코드 섹션 */}
          <div className="bg-white rounded-[10px] p-8">
            <h2 className="font-['Pretendard:SemiBold',sans-serif] text-[20px] text-black mb-2">
              행사 코드
            </h2>

            <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-gray-600 mb-6">
              초대 코드와 문구를 복사해 공유하세요
            </p>

            {/* 초대 코드 표시 영역 */}
            <div className="bg-neutral-100 rounded-[10px] py-12 flex items-center justify-center">
              <p className="font-['Poppins:Regular',sans-serif] text-[64px] text-black tracking-wider">
                {inviteCode}
              </p>
            </div>
            {/* 안내 문구 */}
            <div className="text-center space-y-2">
              <p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-gray-500">
                유효기간 : {formattedDate}
              </p>
            </div>
          </div>
          {/* 여기에 넣기*/}

          {/* 초대 문구 섹션 */}
          <div className="bg-white rounded-[10px] p-8">
            <div className="bg-neutral-100 rounded-[10px] p-8 mb-6">
              <div className="font-['Pretendard:Regular',sans-serif] text-[14px] text-black whitespace-pre-wrap leading-relaxed">
                {inviteMessage}
              </div>
            </div>

            {/* 초대 문구 복사 버튼 */}
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
                    <span className="text-[16px] leading-normal w-full text-center">
                      초대 문구 복사
                    </span>
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