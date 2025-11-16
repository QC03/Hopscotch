import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket, sessionManager } from "../socket";

const LoginPage = () => {
  const [nickname, setNickname] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 기존 세션이 있으면 자동 복구 시도
    if (sessionManager.hasSession()) {
      setIsRestoring(true);
      const { sessionId } = sessionManager.getSession();
      socket.emit("session/restore", { sessionId }, (res) => {
        if (res.success) {
          navigate("/waiting");
        } else {
          sessionManager.clearSession();
          setIsRestoring(false);
        }
      });
    }
  }, [navigate]);

  const handleLogin = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요");
      return;
    }
    socket.emit("login", { nickname }, (res) => {
      if (res.success) {
        sessionManager.saveSession(res.sessionId, nickname, res.color || "#" + Math.random().toString(16).slice(2, 8));
        navigate("/waiting");
      } else {
        alert(res.message);
      }
    });
  };

  if (isRestoring) {
    return <div style={{ padding: "20px", textAlign: "center" }}>세션 복구 중...</div>;
  }

  return (
    <div style={{ padding: "40px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
      <h1>🏁 땅따먹기 게임</h1>
      <div style={{ backgroundColor: "#f0f0f0", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <h2>로그인</h2>
        <input 
          type="text" 
          placeholder="닉네임 입력 (1-20자)" 
          value={nickname} 
          onChange={e => setNickname(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleLogin()}
          maxLength={20}
          style={{ padding: "10px", fontSize: "16px", width: "100%", boxSizing: "border-box", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd" }}
        />
        <button 
          onClick={handleLogin}
          style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: "bold", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          입장하기
        </button>
      </div>
      <button 
        onClick={() => navigate("/admin")}
        style={{ position: "absolute", bottom: "20px", right: "20px", padding: "10px 15px", fontSize: "14px", backgroundColor: "#666", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        관리자
      </button>
    </div>
  );
};

export default LoginPage;
