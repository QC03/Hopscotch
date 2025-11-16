// GamePage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import Board from "../components/Board/Board";
import TypingPanel from "../components/TypingPanel/TypingPanel";

const GamePage = () => {
  const [board, setBoard] = useState([]);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    socket.on("board/init", (initBoard, id) => { setBoard(initBoard); setPlayerId(id); });
    socket.on("board/update", (cell) => setBoard(prev => prev.map(row => row.map(c => (c.row === cell.row && c.col === cell.col ? cell : c)))));
    return () => { socket.off("board/init"); socket.off("board/update"); };
  }, []);

  const handleCellClick = (row, col) => socket.emit("cell/attemptCapture", { row, col });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "20%", borderRight: "1px solid #333" }}><TypingPanel /></div>
      <div style={{ width: "80%" }}><Board board={board} onCellClick={handleCellClick} playerId={playerId} /></div>
    </div>
  );
};

export default GamePage;
