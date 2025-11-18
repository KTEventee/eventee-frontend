import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useApp();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const target = url.searchParams.get("state") || "my-page";

    if (!code) {
      alert("Google 로그인 실패");
      navigate("/login");
      return;
    }

    // 1. 백엔드로 code 전송
    fetch(`/api/v1/auth/google?code=${code}`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("RAW RESPONSE:", text);

        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("JSON PARSE ERROR:", e);
          throw new Error("NOT_JSON");
        }
      })
      .then(async (json) => {
        console.log("PARSED JSON:", json);


        if (!json.isSuccess || json.code !== "SUCCESS-0000") {
          alert("로그인 실패");
          navigate("/login");
          return;
        }

        const data = json.result;
        setAccessToken(data.accessToken);

        // 2. 내 정보 조회
        const me = await fetch("/api/v1/member/mypage", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
          credentials: "include",
        }).then((r) => r.json());

        if (!me.isSuccess) {
          alert("유저 정보를 가져올 수 없습니다.");
          navigate("/login");
          return;
        }

        setUser(me.result);
        navigate(`/${target}`);
      })
      .catch((err) => {
        console.error("ERROR:", err);
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
