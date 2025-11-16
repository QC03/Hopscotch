import React, { useEffect, useState } from "react";

const Cell = ({ cell, onClick, playerId }) => {
  const { owner, capturing, locked, row, col, invulnerable } = cell;
  const [progress, setProgress] = useState(0);
  const [invulnTime, setInvulnTime] = useState(0);

  useEffect(() => {
    if (capturing) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min((elapsed / 5000) * 100, 100);
        setProgress(progressPercent);
      }, 50);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [capturing]);

  useEffect(() => {
    if (invulnerable) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(5000 - elapsed, 0);
        setInvulnTime(Math.ceil(remaining / 1000));
        if (remaining <= 0) clearInterval(timer);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [invulnerable]);

  const bgColor = owner ? owner.color : "#f0f0f0";
  const style = {
    width: "80px",
    height: "80px",
    border: "1px solid #999",
    backgroundColor: capturing ? `${bgColor}99` : bgColor,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: locked || invulnerable ? "not-allowed" : (capturing ? "wait" : "pointer"),
    fontSize: "20px",
    position: "relative",
    overflow: "hidden",
    transition: "background-color 0.2s",
    boxShadow: invulnerable ? "0 0 10px gold inset" : "none",
  };

  const handleClick = () => {
    // 무적 상태는 클릭 불가, 나머지는 모두 가능 (서버에서 검증)
    if (!invulnerable) onClick(row, col);
  };

  return (
    <div style={style} onClick={handleClick} title={owner ? `${owner.nickname}의 영역${invulnerable ? " (무적 중)" : ""}` : "비어있음"}>
      {/* 점령 진행도 바 */}
      {capturing && (
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: "4px",
          backgroundColor: "#FFD700",
          transition: "width 0.05s"
        }} />
      )}
      {locked && <span style={{ fontSize: "28px" }}>⚔️</span>}
      {invulnerable && <span style={{ fontSize: "24px" }}>🛡️{invulnTime}</span>}
    </div>
  );
};

export default Cell;
