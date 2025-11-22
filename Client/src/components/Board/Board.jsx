import React, { useState } from "react";
import Cell from "./Cell";

const Board = ({ board, onCellClick, playerId }) => {
  const [zoom, setZoom] = useState(100);
  const rows = board?.length || 0;
  const cols = board?.[0]?.length || 0;

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

  const cellSize = 80 * (zoom / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* 줌 컨트롤 */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        padding: "10px", 
        backgroundColor: "#f0f0f0", 
        borderRadius: "5px",
        justifyContent: "center"
      }}>
        <button 
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          style={{ 
            padding: "6px 12px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          −
        </button>
        <span style={{ minWidth: "60px", textAlign: "center", fontWeight: "bold" }}>
          {zoom}%
        </span>
        <button 
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          style={{ 
            padding: "6px 12px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          +
        </button>
        <button 
          onClick={() => setZoom(100)}
          style={{ 
            padding: "6px 12px", 
            backgroundColor: "#2196F3", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "10px"
          }}
        >
          초기화
        </button>
      </div>

      {/* 스크롤 가능한 보드 컨테이너 */}
      <div style={{
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "calc(100vh - 150px)",
        border: "3px solid #333",
        borderRadius: "5px",
        padding: "10px",
        backgroundColor: "#ccc"
      }}>
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gap: "2px",
            backgroundColor: "#ccc",
            borderRadius: "5px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            width: "fit-content"
          }}
        >
          {board.flat().map((cell) => (
            <Cell key={`${cell.row}-${cell.col}`} cell={cell} onClick={onCellClick} playerId={playerId} cellSize={cellSize} />
          ))}
        </div>
      </div>

      {/* 보드 크기 정보 */}
      <div style={{ 
        textAlign: "center", 
        fontSize: "12px", 
        color: "#666",
        padding: "5px"
      }}>
        보드 크기: {rows} × {cols}
      </div>
    </div>
  );
};

export default Board;
