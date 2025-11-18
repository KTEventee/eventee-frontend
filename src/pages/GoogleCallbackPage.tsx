import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useApp();
  
  useEffect(() => {
    const url = new URL(window.location.href);

    const accessToken = url.searchParams.get("accessToken");
    const state = url.searchParams.get("state") || "my-page"; 
    const email = url.searchParams.get("email");
    const socialId = url.searchParams.get("socialId");

    if (!accessToken) {
      alert("Google 로그인 실패");
      navigate("/login");
      return;
    }

    setAccessToken(accessToken);

    fetch("/api/v1/member/mypage", {
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

        setUser(json.result);

        navigate(`/${state}`);
      })
      .catch(() => {
        alert("서버 오류");
        navigate("/login");
      });
  }, [navigate, setUser, setAccessToken]);

  return (
    <div className="p-6 text-center">
      <p className="text-lg font-semibold">로그인 처리 중...</p>
    </div>
  );
}
