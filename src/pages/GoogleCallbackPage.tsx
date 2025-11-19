import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setAccessToken } = useApp();

  useEffect(() => {
    const url = new URL(window.location.href);

    const accessToken = url.searchParams.get("accessToken");
    const email = url.searchParams.get("email");
    const socialId = url.searchParams.get("socialId");
    const state = url.searchParams.get("state"); // "my-page" or "join-event"

    console.log("OAuth Callback Received:", { accessToken, email, socialId, state });

    // 1) accessToken 없는 경우 → 로그인 실패 처리
    if (!accessToken) {
      alert("Google 로그인 실패");
      navigate("/login");
      return;
    }

    // 2) 기본 사용자 정보 체크
    if (!email || !socialId) {
      alert("로그인 정보가 올바르지 않습니다.");
      navigate("/login");
      return;
    }

    // 3) 토큰 저장 (AppContext + localStorage)
    setAccessToken(accessToken);
    localStorage.setItem("accessToken", accessToken);

    // 4) User 타입에 맞게 모든 필드를 채움
    setUser({
      id: null,
      nickname: null,
      email,
      socialId,
      profileImage: null,
      role: null,
    });

    // 5) state 값에 따라 이동
    if (state === "my-page") {
      navigate("/my-page");
    } else if (state === "join-event") {
      navigate("/join-event");
    } else {
      navigate("/"); // 기본 fallback
    }

  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">로그인 처리 중...</p>
    </div>
  );
}
