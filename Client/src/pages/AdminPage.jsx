import React from "react";
import { socket } from "../socket";

const AdminPage = () => {
  const startGame = () => socket.emit("admin/startGame");

  return (
    <div style={{ padding: "20px" }}>
      <h2>관리자 페이지</h2>
      <button onClick={startGame} style={{ padding: "10px 20px", fontSize: "16px" }}>게임 시작</button>
    </div>
  );
};

export default AdminPage;
