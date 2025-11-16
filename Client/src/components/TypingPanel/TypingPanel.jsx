import React, { useEffect, useState } from "react";
import { socket } from "../../socket";

const TypingPanel = () => {
  const [activeMatch, setActiveMatch] = useState(null);
  const [words, setWords] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("typing/start", ({ matchId, words }) => {
      setActiveMatch(matchId);
      setWords(words);
      setInput("");
    });

    socket.on("typing/update", (words) => {
      setWords(words);
      setInput("");
    });

    socket.on("typing/error", () => {
      setInput("");
    });

    return () => {
      socket.off("typing/start");
      socket.off("typing/update");
      socket.off("typing/error");
    };
  }, []);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (words[0] && e.target.value === words[0]) {
      socket.emit("typing/input", { matchId: activeMatch, word: words[0] });
      setInput("");
    }
  };

  if (!activeMatch) return <div>타자게임 진행중이 아닙니다.</div>;

  return (
    <div style={{ padding: "10px" }}>
      <h3>타자게임!</h3>
      <div>{words.map((w, i) => <div key={i}>{w}</div>)}</div>
      <input
        type="text"
        value={input}
        onChange={handleInput}
        autoFocus
        style={{ width: "100%", marginTop: "5px" }}
      />
    </div>
  );
};

export default TypingPanel;
