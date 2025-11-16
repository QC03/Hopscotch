import React, { useEffect, useState } from "react";
import { socket, sessionManager } from "../socket";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("waiting/players", (playerList) => setPlayers(playerList));
    socket.on("game/start", () => setGameStarted(true));
    socket.on("game/result", () => {
      setGameStarted(false);
      setGameEnded(true);
    });

    return () => {
      socket.off("waiting/players");
      socket.off("game/start");
      socket.off("game/result");
    };
  }, []);

  const handleStartGame = () => {
    if (players.length < 2) {
      alert("최소 2명 이상의 플레이어가 필요합니다.");
      return;
    }
    if (window.confirm(`${players.length}명의 플레이어로 게임을 시작하시겠습니까?`)) {
      setGameEnded(false);
      socket.emit("admin/startGame");
    }
  };

  const handleForceEndGame = () => {
    if (window.confirm("게임을 강제 종료하시겠습니까?")) {
      socket.emit("admin/forceEndGame");
      setGameStarted(false);
      setGameEnded(true);
    }
  };

  const handleLogout = () => {
    sessionManager.clearSession();
    navigate("/");
  };

  return (
    <div style={{ padding: "40px", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>👨‍💼 관리자 페이지</h1>
          <button onClick={handleLogout} style={{ padding: "8px 16px", backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            로그아웃
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          {/* 플레이어 목록 */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <h2 style={{ color: "#333", marginBottom: "15px" }}>👥 참가 플레이어 ({players.length}명)</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflow: "auto" }}>
              {players.length > 0 ? (
                players.map((player, idx) => {
                  const isLightColor = parseInt(player.color.slice(1), 16) > 0xFFFFFF / 2;
                  return (
                    <div key={idx} style={{ backgroundColor: player.color, padding: "12px", borderRadius: "5px", color: isLightColor ? "#333" : "white", fontWeight: "bold" }}>
                      #{idx + 1} {player.nickname}
                    </div>
                  );
                })
              ) : (
                <p style={{ color: "#999" }}>대기 중인 플레이어가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 게임 시작 영역 */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "12px" }}>
            <h2 style={{ color: "#333" }}>🎮 게임 제어</h2>
            <p style={{ color: "#666", marginBottom: "10px", textAlign: "center", fontSize: "14px" }}>
              {gameStarted ? "게임이 시작되었습니다!" : gameEnded ? "게임이 종료되었습니다." : "최소 2명 이상이 참가하면 게임을 시작할 수 있습니다."}
            </p>
            <button 
              onClick={handleStartGame}
              disabled={gameStarted || players.length < 2}
              style={{ 
                width: "100%", 
                padding: "14px", 
                fontSize: "16px", 
                fontWeight: "bold", 
                backgroundColor: gameStarted || players.length < 2 ? "#ccc" : "#4CAF50", 
                color: "white", 
                border: "none", 
                borderRadius: "5px", 
                cursor: gameStarted || players.length < 2 ? "not-allowed" : "pointer"
              }}
            >
              {gameStarted ? "✓ 게임 진행 중" : "게임 시작"}
            </button>
            {gameStarted && (
              <button 
                onClick={handleForceEndGame}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  fontSize: "14px", 
                  fontWeight: "bold", 
                  backgroundColor: "#ff6b6b", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "5px", 
                  cursor: "pointer"
                }}
              >
                🛑 게임 강제 종료
              </button>
            )}
          </div>
        </div>

        {/* 상태 정보 */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#333" }}>📊 게임 상태</h3>
          <p style={{ color: "#555" }}><strong>게임 상태:</strong> {gameStarted ? "🔴 진행 중" : "🟢 대기 중"}</p>
          <p style={{ color: "#555" }}><strong>현재 인원:</strong> {players.length}명</p>
          <p style={{ color: "#555" }}><strong>게임 시작 가능:</strong> {players.length >= 2 ? "✓ 가능" : "✗ 불가능 (최소 2명 필요)"}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
