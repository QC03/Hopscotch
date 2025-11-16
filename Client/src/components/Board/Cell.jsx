import React from "react";

const Cell = ({ cell, onClick, playerId }) => {
  const { owner, capturing, locked, row, col } = cell;

  const bgColor = owner ? owner.color : "#eee";
  const style = {
    width: "100px",
    height: "100px",
    border: "1px solid #333",
    backgroundColor: capturing ? `${bgColor}aa` : bgColor,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: locked ? "not-allowed" : "pointer",
    fontSize: "24px",
  };

  const handleClick = () => {
    if (!capturing && !locked) onClick(row, col);
  };

  return <div style={style}>{locked ? "⚔️" : ""}</div>;
};

export default Cell;
