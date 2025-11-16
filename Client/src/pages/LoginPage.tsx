import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!nickname) return alert("닉네임을 입력해주세요.");
    // 서버에 로그인 요청 (추후 Socket.IO 연결)
    navigate("/waiting");
  };

  return (
    <div className="login-page">
      <h1>땅따먹기 게임 로그인</h1>
      <input
        type="text"
        placeholder="닉네임 입력"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        maxLength={20}
      />
      <button onClick={handleLogin}>입장하기</button>
    </div>
  );
};

export default LoginPage;
