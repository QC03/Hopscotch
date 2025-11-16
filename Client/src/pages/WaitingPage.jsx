import React, { useEffect, useState } from "react";
import { socket, sessionManager } from "../socket";
import { useNavigate } from "react-router-dom";

const WaitingPage = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = sessionManager.getSession();
    
    // 세션이 없으면 로그인 페이지로
    if (!session || !session.sessionId) {
      console.log("❌ 세션이 없음, 로그인 페이지로 이동");
      navigate("/");
      return;
    }

    setCurrentPlayer(session);
    console.log("✓ 세션 확인됨:", session.nickname);

    // 리스너 등록
    socket.on("waiting/players", (playerList) => {
      console.log("👥 참가 인원 업데이트:", playerList.length, "명");
      setTimeout(() => {
        setPlayers(playerList);
      }, 400);
    });
    
    socket.on("game/start", () => {
      console.log("📢 game/start 수신, 게임 페이지로 이동");
      setTimeout(() => {
        console.log("▶️ 게임 페이지로 네비게이션");
        navigate("/game");
      }, 400);
    });

    return () => {
      socket.off("waiting/players");
      socket.off("game/start");
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionManager.clearSession();
    window.location.href = "/";
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>⏳ 대기 화면</h1>
          <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            로그아웃
          </button>
        </div>

        {currentPlayer && (
          <div style={{ backgroundColor: currentPlayer.color, padding: "15px", borderRadius: "5px", marginBottom: "20px", color: "white", textAlign: "center" }}>
            <strong>📍 내 정보: {currentPlayer.nickname}</strong>
          </div>
        )}

        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#333", marginBottom: "15px" }}>참가 인원: {players.length}명</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px", marginBottom: "20px" }}>
            {players.map((p, idx) => {
              const isLightColor = parseInt(p.color.slice(1), 16) > 0xFFFFFF / 2;
              return (
                <div key={idx} style={{ backgroundColor: p.color, padding: "15px", borderRadius: "8px", textAlign: "center", color: isLightColor ? "#333" : "white", fontWeight: "bold" }}>
                  #{idx + 1} {p.nickname}
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            👨‍💼 관리자가 게임을 시작할 때까지 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;
