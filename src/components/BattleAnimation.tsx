import "../styles/cannon.css";

interface BattleProps {
  fire: boolean;
  explode: boolean;
  result: string | null;
}

export default function Battle({ fire, explode, result }: BattleProps) {
  // 아무 상태도 아니면 렌더링 안 함
  if (!fire && !explode) return null;

  return (
    <div className="battle-field">
      {/* 대포 */}
      <div className={`cannon ${fire ? "fire" : ""}`}>🧨</div>

      {/* 포탄 */}
      {fire && <div className="bullet" />}

      {/* 폭발 */}
      {explode && (
        <div className="explosion">
          💥
          <div className="result-text">{result}</div>
        </div>
      )}
    </div>
  );
}
