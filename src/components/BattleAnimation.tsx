import "../styles/cannon.css";

interface BattleProps {
  fire: boolean;
  explode: boolean;
  result: string | null;
}

export default function Battle({ fire, explode, result }: BattleProps) {
  if (!fire && !explode && !result) return null;

  return (
    <div className="battle-overlay">
      <div className="battle-stage">
        {/* 대포 */}
        <div className={`cannon ${fire ? "fire" : ""}`}>
          🧨
        </div>

        {/* 포탄 */}
        {fire && <div className="bullet" />}

        {/* 폭발 */}
        {explode && (
          <div className="explosion">
            💥
          </div>
        )}

        {/* 결과 */}
        {result && !fire && !explode && (
          <div className="result-card">
            <p className="result-label">🎯 선택된 참가자</p>
            <h2 className="result-name">{result}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
