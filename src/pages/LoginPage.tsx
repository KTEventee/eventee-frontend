import "../styles/login-animations.css";
import EventeeButton from "../components/EventeeButton";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

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
  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = (e.target as HTMLButtonElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    (e.target as HTMLButtonElement).style.setProperty("--x", `${x}px`);
    (e.target as HTMLButtonElement).style.setProperty("--y", `${y}px`);

    window.location.href = buildGoogleOAuthUrl("my-page");
  };

  const handleJoinEvent = () => {
    window.location.href = buildGoogleOAuthUrl("join-event");
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#F8F5F0] text-gray-900">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-md border-b border-[#E6E0D8]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/ticket.png"
              alt="Eventee Logo"
              className="w-8 h-8 rounded-xl shadow-sm"
            />
            <span className="font-semibold text-sm tracking-tight text-[#5A4A3B]">
              Eventee
            </span>
          </div>
          <span className="hidden md:inline text-[11px] text-gray-400">
            팀 행사 · 동아리 공연 · 프로젝트 데모데이까지
          </span>
        </div>
      </header>

      <main className="pt-20">

        {/* HERO SECTION */}
        <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 fade-up">
          <div className="max-w-4xl w-full flex flex-col items-center md:items-start text-center md:text-left space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#E6E0D8] text-[11px] font-medium text-[#7A6550]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F2A84A]" />
              이벤트 관리, 티켓 한 장처럼 가볍게
            </div>

            {/* TITLE */}
            <h1 className="text-[34px] sm:text-[40px] leading-tight font-extrabold tracking-tight text-[#3F342A]">
              이벤트를 쉽고 빠르고
              <br className="hidden sm:block" />
              간편하게 관리해보세요.
            </h1>

            {/* SUBTEXT */}
            <p className="text-[15px] sm:text-[16px] text-gray-600 leading-relaxed max-w-xl">
              여러 채널에 흩어진 명단, 공지, 투표를 하나의 화면에서 정리할 수 있어요.
              초대부터 마감까지 Eventee가 알아서 정리합니다.
            </p>

            {/* FEATURES */}
            <ul className="text-sm text-gray-600 space-y-1.5 max-w-xl">
              <li className="flex items-start gap-2">
                <span className="mt-[6px] inline-block w-1.5 h-1.5 rounded-full bg-[#F2A84A]" />
                팀·동아리 행사, 공연, MT, 데모데이 등 다양한 이벤트에 활용 가능
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[6px] inline-block w-1.5 h-1.5 rounded-full bg-[#F2A84A]" />
                참여자 관리, 공지, 투표, 게시글 기능까지 한 번에
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-[6px] inline-block w-1.5 h-1.5 rounded-full bg-[#F2A84A]" />
                Google 계정으로 3초 만에 시작할 수 있어요.
              </li>
            </ul>

            {/* BUTTONS */}
            <div className="mt-4 flex flex-wrap items-center gap-3">

              {/* GOOGLE BUTTON */}
              <button
                onClick={handleGoogleLogin}
                className="btn-ripple inline-flex items-center justify-center gap-2 px-4 h-[46px] rounded-xl bg-[#191919] text-white text-sm font-medium shadow-md hover:bg-black transition-all"
              >
                {/* 정상 Google Icon */}
                <svg width="16" height="16" viewBox="0 0 533.5 544.3">
                  <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h147.9c-6.4 34.7-25.6 64.1-54.7 83.7l88.5 69c51.9-47.8 79.8-118.3 79.8-197.6z"/>
                  <path fill="#34A853" d="M272 544.3c74.1 0 136.3-24.5 181.7-66.4l-88.5-69c-24.6 16.6-56.2 26.4-93.2 26.4-71.6 0-132.3-48.2-154.1-113.1l-90.4 70c45.3 89 138.2 152.1 244.5 152.1z"/>
                  <path fill="#FBBC05" d="M117.9 322.2c-5.6-16.6-8.8-34.5-8.8-53 0-18.6 3.2-36.5 8.9-53l-90.8-70C9.5 192.7 0 233.3 0 275.5c0 42.1 9.4 82.8 26.6 118.2l91.3-71.5z"/>
                  <path fill="#EA4335" d="M272 107.6c40.2 0 76.4 13.9 104.9 41.2l78.7-78.7C416.1 24.8 346.1 0 272 0 165.5 0 72.3 63.2 27 152.1l90.8 70c21.6-64.7 82.4-113 154.2-113z"/>
                </svg>
                Google로 바로 시작하기
              </button>

              {/* JOIN EVENT */}
              <button
                onClick={handleJoinEvent}
                className="inline-flex items-center justify-center px-4 h-[46px] rounded-xl text-sm font-medium border border-[#D2C7BA] text-[#5A4A3B] bg-white/90 hover:bg-white transition-all"
              >
                초대받은 이벤트에 참여할게요
              </button>

            </div>

            <p className="text-[11px] text-gray-400 mt-2">
              아래로 내려가면 Eventee 기능을 더 자세히 볼 수 있어요.
            </p>

          </div>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}

        <section className="pt-10 pb-4 text-center px-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#C0AC92] uppercase">
            How it works
          </p>
          <h2 className="mt-3 text-xl font-bold text-[#3F342A]">
            Eventee로 이런 것들을 할 수 있어요
          </h2>
        </section>

        {/* STEP 1 */}
        <section className="py-20 flex flex-col items-center text-center px-6 fade-up">
          <img
            src="/assets/login/step1.png"
            className="w-[360px] md:w-[420px] mb-10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.16)] border border-white"
          />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">참여자를 한 눈에 관리</h3>
          <p className="text-gray-500 max-w-md leading-relaxed text-[15px]">
            참여 인원을 한 화면에서 정리할 수 있습니다.
          </p>
        </section>

        {/* STEP 2 */}
        <section className="py-20 flex flex-col items-center text-center px-6 fade-up bg-white/70">
          <img
            src="/assets/login/step2.png"
            className="w-[360px] md:w-[420px] mb-10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.14)] border border-white"
          />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">공지 전달도 클릭 한 번</h3>
          <p className="text-gray-500 max-w-md leading-relaxed text-[15px]">
            중요한 공지, 일정 변경까지 빠르게 전달하세요.
          </p>
        </section>

        {/* STEP 3 */}
        <section className="py-20 flex flex-col items-center text-center px-6 fade-up">
          <img
            src="/assets/login/step3.png"
            className="w-[360px] md:w-[420px] mb-10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.14)] border border-white"
          />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">투표와 게시글로 실시간 소통</h3>
          <p className="text-gray-500 max-w-md leading-relaxed text-[15px]">
            소통과 일정 조율을 한 번에 해결하세요.
          </p>
        </section>

        {/* LOGIN SECTION */}
        <section className="py-24 bg-white flex flex-col items-center text-center px-4 fade-up border-t border-[#E6E0D8]/70">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-gray-500 mb-10 max-w-sm leading-relaxed text-[15px]">
            다음 행사에도 그대로 불러와 더 편하게 운영할 수 있어요.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="btn-ripple w-[280px] bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-3 h-[56px] rounded-xl transition-all shadow-sm mb-4"
          >
            Google로 계속하기
          </button>

          <EventeeButton
            onClick={handleJoinEvent}
            className="w-[280px] h-[56px] rounded-xl text-base font-medium"
          >
            초대받은 이벤트 참여하기
          </EventeeButton>

          <p className="mt-8 text-center text-gray-400 text-xs">
            본 서비스는 소셜 로그인 정보를 기반으로 운영됩니다.
          </p>
        </section>

      </main>
    </div>
  );
}
