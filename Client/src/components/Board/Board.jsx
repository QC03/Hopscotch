import React from "react";
import Cell from "./Cell";

const Board = ({ board, onCellClick, playerId }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${board.length}, 100px)`,
        gridTemplateColumns: `repeat(${board[0]?.length || 20}, 100px)`,
        gap: "2px",
      }}
    >
      {board.flat().map((cell) => (
        <Cell key={`${cell.row}-${cell.col}`} cell={cell} onClick={onCellClick} playerId={playerId} />
      ))}
    </div>
  );
};

export default Board;
