import { useNavigate } from "react-router-dom";
// import { useApp, type User } from "../contexts/AppContext";
import EventeeButton from "../components/EventeeButton";

const GOOGLE_CLIENT_ID = "1311838165-j2g0s0tnb4hr1ptsksurpultd8uk14ov.apps.googleusercontent.com"; 
// const REDIRECT_URI = "http://localhost:3000/oauth/callback/google";
const REDIRECT_URI = "https://www.eventee.cloud/oauth/callback/google";

const buildGoogleOAuthUrl = (target: string) => {
  return (
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=email%20profile%20openid` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${target}`
  );
};


export default function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = buildGoogleOAuthUrl("my-page");
  };

  const handleJoinEvent = () => {
    window.location.href = buildGoogleOAuthUrl("join-event");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-[30px] font-bold">
            Even<span style={{ color: "#67594C" }}>Tee</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-center mb-6">로그인/회원가입</h2>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 h-[59px] rounded-[9px] transition-all"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </button>

            <EventeeButton
              onClick={handleJoinEvent}
              className="w-full"
            >
              이벤트 참여하기
            </EventeeButton>
          </div>
        </div>
      </div>
    </div>
  );
}