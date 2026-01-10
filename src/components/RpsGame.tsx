import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import EventeeButton from "./EventeeButton";
import { RPSType, PlayerDto, StartGameDto, GamePlayDto } from "./../types/game/rps";

interface Props {
  eventId: number;
  apiUrl: string;
  myMemberId: number;
  myNickname: string;
}

export default function RpsGame({
  eventId,
  apiUrl,
  myMemberId,
  myNickname,
}: Props) {
  const [client, setClient] = useState<any>(null);

  const [started, setStarted] = useState(false);
  const [leader, setLeader] = useState<PlayerDto | null>(null);
  const [players, setPlayers] = useState<PlayerDto[]>([]);
  const [gameId, setGameId] = useState<number | null>(null);
  const [isAlive, setIsAlive] = useState(true);

  /* ===========================
     WebSocket 연결
  =========================== */
  useEffect(() => {
    const socket = new SockJS(`${apiUrl}/ws`);
    const stomp = Stomp.over(socket);

    stomp.connect({}, () => {
      // 게임 시작
      stomp.subscribe(`/sub/game/${eventId}/start`, (msg) => {
        const data: StartGameDto = JSON.parse(msg.body);
        setStarted(true);
        setLeader(data.leader);
        setPlayers(data.players);
        setGameId(data.gameId ?? 0); // 바로 플레이 가능
        setIsAlive(true);
      });

      // 라운드 결과
      stomp.subscribe(`/sub/game/${eventId}/round`, (msg) => {
        const data: GamePlayDto = JSON.parse(msg.body);
        setLeader(data.leader);
        setPlayers(data.players);
        setGameId(data.gameId);

        const me = data.players.find(p => p.memberId === myMemberId);
        setIsAlive(!!me);
      });
    });

    setClient(stomp);

    return () => {
      stomp.disconnect(() => {});
    };
  }, [eventId, apiUrl, myMemberId]);

  /* ===========================
     선택 전송
  =========================== */
  const play = async (type: RPSType) => {
    if (!isAlive || !gameId) return;

    await fetch(`${apiUrl}/api/v1/game/rsp/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        gameId,
        leader,
        players: players.map(p =>
          p.memberId === myMemberId ? { ...p, type } : p
        ),
      }),
    });
  };

  /* ===========================
     게임 시작 (사회자)
  =========================== */
  const startGame = async (winnerCnt: number) => {
    await fetch(`${apiUrl}/api/v1/game/rsp/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        winnerCnt,
        leader: {
          memberId: myMemberId,
          nickname: myNickname,
        },
        players: [], // 서버에서 채움
      }),
    });
  };

  /* ===========================
     UI
  =========================== */
  return (
    <div className="bg-white rounded-xl p-4 shadow space-y-3">
      <h3 className="font-bold text-sm">✊✌️✋ 가위바위보</h3>

      {!started && (
        <EventeeButton variant="outline" onClick={() => startGame(1)}>
          가위바위보 시작
        </EventeeButton>
      )}

      {started && (
        <>
          <p className="text-xs text-gray-600">
            🎤 사회자: <b>{leader?.nickname}</b>
          </p>

          <ul className="text-xs list-disc ml-4">
            {players.map(p => (
              <li key={p.memberId}>{p.nickname}</li>
            ))}
          </ul>
        </>
      )}

      {started && gameId && isAlive && (
        <div className="flex gap-2 justify-center pt-2">
          <RpsButton label="✊" type="ROCK" onClick={play} />
          <RpsButton label="✌️" type="SCISSOR" onClick={play} />
          <RpsButton label="✋" type="PAPER" onClick={play} />
        </div>
      )}

      {started && !isAlive && (
        <p className="text-red-500 text-sm font-bold text-center">❌ 탈락</p>
      )}
    </div>
  );
}

/* ===========================
   버튼 컴포넌트
=========================== */
function RpsButton({
  label,
  type,
  onClick,
}: {
  label: string;
  type: RPSType;
  onClick: (t: RPSType) => void;
}) {
  return (
    <button
      onClick={() => onClick(type)}
      className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 text-2xl"
    >
      {label}
    </button>
  );
}
