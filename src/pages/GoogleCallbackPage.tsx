import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useApp();
  const API_URL = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const url = new URL(window.location.href);

    const accessToken = url.searchParams.get("accessToken");
    const state = url.searchParams.get("state") || "my-page";

    if (!accessToken) {
      alert("Google 로그인 실패");
      navigate("/login");
      return;
    }

    // AccessToken 저장
    setAccessToken(accessToken);

    fetch(`${API_URL}/api/v1/member/mypage`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.isSuccess) {
          alert("유저 정보를 가져오지 못했습니다.");
          navigate("/login");
          return;
        }

        // 유저 저장
        setUser(json.result);

        // 로그인 성공 → state 기반 페이지 이동
        navigate(`/${state}`);
      })
      .catch(() => {
        alert("서버 오류");
        navigate("/login");
      });
  }, [navigate, setUser, setAccessToken, API_URL]);

  return (
    <div className="p-6 text-center">
      <p className="text-lg font-semibold">로그인 처리 중...</p>
    </div>
  );
}
