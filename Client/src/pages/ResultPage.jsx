import React, { useEffect, useState } from "react";
import { socket, sessionManager } from "../socket";
import { useNavigate } from "react-router-dom";

const ResultPage = () => {
  const [ranking, setRanking] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionManager.getSession();
    setCurrentPlayer(session);

    console.log("📋 결과 페이지 로드");

    // sessionStorage에서 게임 결과 읽기
    const savedResult = sessionStorage.getItem("gameResult");
    if (savedResult) {
      try {
        const ranking = JSON.parse(savedResult);
        console.log("💾 sessionStorage에서 결과 복원:", ranking);
        setRanking(ranking);
        // 한 번 사용했으니 삭제
        sessionStorage.removeItem("gameResult");
      } catch (err) {
        console.error("❌ 결과 파싱 에러:", err);
      }
    } else {
      console.log("⚠️ sessionStorage에 결과 없음, socket 리스너 대기");
    }

    // game/result 이벤트 리스너 설정 (대비용)
    const handleGameResult = (rankedPlayers) => {
      console.log("🔔 game/result 이벤트 수신:", rankedPlayers);
      setRanking(rankedPlayers);
    };

    socket.on("game/result", handleGameResult);

    return () => {
      socket.off("game/result", handleGameResult);
    };
  }, []);

  const handleReturnToLogin = () => {
    sessionManager.clearSession();
    navigate("/");
  };

  const getMedalEmoji = (index) => {
    const medals = ["🥇", "🥈", "🥉"];
    return medals[index] || "🎖️";
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", textAlign: "center" }}>
          <h1 style={{ fontSize: "36px", marginBottom: "30px" }}>🎉 게임 결과</h1>

          {ranking.length > 0 ? (
            <div>
              {ranking.map((player, idx) => {
                const isCurrentPlayer = currentPlayer?.nickname === player.nickname;
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      fontSize: "18px", 
                      margin: "15px 0", 
                      padding: "15px", 
                      backgroundColor: isCurrentPlayer ? "#fff3cd" : player.color,
                      borderRadius: "10px",
                      color: isCurrentPlayer ? "#333" : "white",
                      fontWeight: "bold",
                      border: isCurrentPlayer ? "2px solid #ffc107" : "none",
                      transform: idx === 0 ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    <span style={{ fontSize: "24px", marginRight: "10px" }}>{getMedalEmoji(idx)}</span>
                    <strong>{idx + 1}위:</strong> {player.nickname}
                    <span style={{ float: "right" }}>영역: <strong>{player.cellsOwned || 0}</strong>개</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#999", fontSize: "16px" }}>게임 결과를 기다리는 중입니다...</p>
          )}

          <div style={{ marginTop: "40px" }}>
            <button 
              onClick={handleReturnToLogin}
              style={{ 
                padding: "12px 20px", 
                fontSize: "16px", 
                fontWeight: "bold",
                backgroundColor: "#ff6b6b", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: "pointer",
                width: "100%"
              }}
            >
              로그인 화면으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;