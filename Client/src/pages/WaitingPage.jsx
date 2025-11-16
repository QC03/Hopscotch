import React, { useEffect, useState } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

const WaitingPage = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("waiting/players", (playerList) => setPlayers(playerList));
    socket.on("game/start", () => navigate("/game"));

    return () => {
      socket.off("waiting/players");
      socket.off("game/start");
    };
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>대기 화면</h2>
      <p>참가 인원: {players.length}</p>
      <ul>{players.map((p, idx) => <li key={idx}>{p.nickname}</li>)}</ul>
      <p>관리자가 게임을 시작할 때까지 기다려주세요.</p>
    </div>
  );
};

export default WaitingPage;
