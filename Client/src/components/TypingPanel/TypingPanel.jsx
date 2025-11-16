import React, { useEffect, useState } from "react";
import { socket } from "../../socket";

const TypingPanel = () => {
  const [activeMatch, setActiveMatch] = useState(null);
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    socket.on("typing/start", ({ matchId, words }) => {
      setActiveMatch(matchId);
      setWords(words);
      setInput("");
      setErrorMessage("");
    });

    socket.on("typing/update", (words) => {
      setWords(words);
      setInput("");
      setErrorMessage("");
    });

    socket.on("typing/error", () => {
      setErrorMessage("❌ 오타입니다!");
      setInput("");
      setTimeout(() => setErrorMessage(""), 1000);
    });

    socket.on("typing/end", () => {
      console.log("✓ 타자게임 종료");
      setActiveMatch(null);
      setWords([]);
      setInput("");
      setErrorMessage("");
    });

    return () => {
      socket.off("typing/start");
      socket.off("typing/update");
      socket.off("typing/error");
      socket.off("typing/end");
    };
  }, []);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (words[0] && e.target.value === words[0]) {
      socket.emit("typing/input", { matchId: activeMatch, word: words[0] });
      setInput("");
    }
  };

  if (!activeMatch) {
    return (
      <div style={{ 
        padding: "15px", 
        textAlign: "center", 
        color: "#999",
        backgroundColor: "#f0f0f0",
        borderRadius: "5px"
      }}>
        ⏸️ 타자게임 대기 중
      </div>
    );
  }

  return (
    <div style={{ padding: "15px", backgroundColor: "#fff9e6", borderRadius: "5px", border: "2px solid #FFD700" }}>
      <h3 style={{ marginTop: 0, color: "#d4af37" }}>⌨️ 타자게임!</h3>
      
      <div style={{ marginBottom: "10px", minHeight: "60px" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#333" }}>
          남은 단어: <strong style={{ color: "#ff6b6b" }}>{words.length}</strong>개
        </div>
        
        {words.length > 0 && (
          <div style={{ 
            backgroundColor: "#fff", 
            padding: "10px", 
            borderRadius: "5px", 
            border: "2px solid #FFD700",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center"
          }}>
            {words[0]}
          </div>
        )}
      </div>

      <input
        type="text"
        value={input}
        onChange={handleInput}
        autoFocus
        placeholder="단어를 입력하세요"
        style={{ 
          width: "100%", 
          padding: "8px", 
          marginBottom: "10px", 
          borderRadius: "5px", 
          border: "1px solid #ddd",
          fontSize: "16px",
          boxSizing: "border-box"
        }}
      />

      {errorMessage && (
        <div style={{ 
          color: "#ff6b6b", 
          fontWeight: "bold", 
          textAlign: "center",
          animation: "shake 0.3s"
        }}>
          {errorMessage}
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default TypingPanel;
