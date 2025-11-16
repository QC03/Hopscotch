import React from "react";
import Cell from "./Cell";

const Board = ({ board, onCellClick, playerId }) => {
  const rows = board?.length || 0;
  const cols = board?.[0]?.length || 0;
  
  console.log("Board component - rows:", rows, "cols:", cols, "board length:", board?.length);

  if (!board || board.length === 0) {
    return (
      <div style={{ 
        padding: "40px", 
        fontSize: "18px", 
        color: "#999",
        textAlign: "center",
        border: "2px dashed #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
        <div>보드 로딩 중...</div>
        <div style={{ fontSize: "12px", marginTop: "10px", color: "#bbb" }}>게임이 시작되길 기다리고 있습니다</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${rows}, 80px)`,
        gridTemplateColumns: `repeat(${cols}, 80px)`,
        gap: "2px",
        padding: "10px",
        backgroundColor: "#ccc",
        borderRadius: "5px",
        border: "3px solid #333",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      {board.flat().map((cell) => (
        <Cell key={`${cell.row}-${cell.col}`} cell={cell} onClick={onCellClick} playerId={playerId} />
      ))}
    </div>
  );
};

export default Board;
