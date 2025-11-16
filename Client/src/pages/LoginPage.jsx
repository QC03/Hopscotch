import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const LoginPage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    socket.emit("login", { nickname }, (res) => {
      if (res.success) navigate("/waiting");
      else alert(res.message);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>로그인</h2>
      <input type="text" placeholder="닉네임 입력" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} />
      <button onClick={handleLogin} style={{ marginLeft: "10px" }}>입장하기</button>
    </div>
  );
};

export default LoginPage;
