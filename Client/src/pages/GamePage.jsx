import React, { useEffect, useState } from "react";
import { socket, sessionManager } from "../socket";
import Board from "../components/Board/Board";
import TypingPanel from "../components/TypingPanel/TypingPanel";
import { useNavigate } from "react-router-dom";

const GamePage = () => {
  const [board, setBoard] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const [gameTime, setGameTime] = useState(300); // 5분
  const [playerStats, setPlayerStats] = useState([]);
  const [gameActive, setGameActive] = useState(true);
  const navigate = useNavigate();

  const updatePlayerStats = (boardData) => {
    if (!boardData || boardData.length === 0) return;
    const stats = {};
    boardData.flat().forEach(cell => {
      if (cell.owner?.nickname) {
        stats[cell.owner.nickname] = (stats[cell.owner.nickname] || 0) + 1;
      }
    });
    const sorted = Object.entries(stats)
      .map(([nickname, count]) => ({ nickname, count }))
      .sort((a, b) => b.count - a.count);
    setPlayerStats(sorted);
  };

  // 보드 초기화 및 이벤트 리스너
  useEffect(() => {
    console.log("🎮 GamePage 마운트됨");
    
    const session = sessionManager.getSession();
    if (!session) {
      console.log("❌ 세션이 없음, 로그인 페이지로 이동");
      navigate("/");
      return;
    }

    let mounted = true;

    // 이벤트 핸들러 정의
    const handleBoardInit = (initBoard) => { 
      if (!mounted) return;
      
      console.log("✅ board/init 이벤트 수신!");
      console.log("📊 보드 크기:", initBoard?.length, "x", initBoard?.[0]?.length);
      
      if (!initBoard || initBoard.length === 0) {
        console.error("❌ 보드가 비어있습니다!");
        return;
      }
      
      console.log("📍 setBoard 호출 - 상태 업데이트");
      setBoard(initBoard); 
      setPlayerId(initBoard[0][0]?.playerId || null);
      updatePlayerStats(initBoard);
    };

    const handleBoardUpdate = (cell) => {
      if (!mounted) return;
      setBoard(prev => {
        if (!prev || prev.length === 0) return prev;
        const newBoard = prev.map(row => row.map(c => (c.row === cell.row && c.col === cell.col ? cell : c)));
        updatePlayerStats(newBoard);
        return newBoard;
      });
    };

    const handleGameResult = (ranking) => {
      if (!mounted) return;
      console.log("🏁 게임 결과 수신:", ranking);
      console.log("📊 순위:", ranking.map(p => `${p.nickname}: ${p.cellsOwned}`).join(", "));
      
      // 결과를 sessionStorage에 저장
      sessionStorage.setItem("gameResult", JSON.stringify(ranking));
      
      setGameActive(false);
      setTimeout(() => {
        console.log("▶️ 결과 페이지로 이동");
        navigate("/result");
      }, 300);
    };

    // 리스너 등록
    console.log("📡 socket 리스너 등록 중...");
    socket.on("board/init", handleBoardInit);
    socket.on("board/update", handleBoardUpdate);
    socket.on("game/result", handleGameResult);
    
    console.log("✓ socket 리스너 등록 완료");
    
    // 서버에 board/init 요청
    console.log("🔄 서버에 board/init 요청...");
    socket.emit("game/requestBoard");
    
    return () => { 
      console.log("🗑️ socket 리스너 정리 중...");
      mounted = false;
      socket.off("board/init", handleBoardInit); 
      socket.off("board/update", handleBoardUpdate); 
      socket.off("game/result", handleGameResult);
    }; 
  }, [navigate]);

  // 게임 타이머
  useEffect(() => {
    if (!gameActive || gameTime <= 0) return;
    
    const timer = setInterval(() => {
      setGameTime(prevTime => {
        const newTime = prevTime - 1;
        
        if (newTime <= 0) {
          setGameActive(false);
          socket.emit("game/end");
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);

  const handleCellClick = (row, col) => socket.emit("cell/attemptCapture", { row, col });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndGame = () => {
    if (window.confirm("게임을 종료하시겠습니까?")) {
      setGameActive(false);
      socket.emit("game/end");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f0f0f0" }}>
      {/* 왼쪽 패널 */}
      <div style={{ width: "20%", borderRight: "2px solid #333", backgroundColor: "white", overflow: "auto", padding: "15px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#333" }}>⏱️ 남은 시간</h3>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: gameTime < 60 ? "#ff6b6b" : "#4CAF50", textAlign: "center", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
            {formatTime(gameTime)}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#333" }}>🏆 현재 순위</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {playerStats.map((stat, idx) => (
              <div key={idx} style={{ padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "5px", fontSize: "14px", color: "#333" }}>
                <strong>#{idx + 1}</strong> {stat.nickname}: <strong style={{ color: "#4CAF50" }}>{stat.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <TypingPanel />

        <button 
          onClick={handleEndGame}
          style={{ width: "100%", marginTop: "20px", padding: "10px", backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
        >
          게임 종료
        </button>
      </div>

      {/* 오른쪽 보드 */}
      <div style={{ width: "80%", overflow: "auto", padding: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Board board={board} onCellClick={handleCellClick} playerId={playerId} />
      </div>
    </div>
  );
};

export default GamePage;
