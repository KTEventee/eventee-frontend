export type RPSType = "ROCK" | "PAPER" | "SCISSOR";

// 서버 PlayerDto
export interface PlayerDto {
  memberId: number;
  nickname: string;
  type?: RPSType; // start 단계에는 없음
}

// /sub/game/{eventId}/start
export interface StartGameDto {
  eventId: number;
  winnerCnt: number;
  leader: PlayerDto;
  players: PlayerDto[];
}

// /sub/game/{eventId}/round
export interface GamePlayDto {
  leader: PlayerDto;
  players: PlayerDto[];
  gameId: number;
  eventId: number;
}