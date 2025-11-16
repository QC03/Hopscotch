import { io } from "socket.io-client";

export const socket = io("http://localhost:3000", { transports: ["websocket", "polling"] });

// 세션 관리 (탭별 독립적 세션 + 영구 세션)
export const sessionManager = {
  // sessionStorage: 탭별 독립 세션
  // localStorage: 영구 세션
  saveSession: (sessionId, nickname, color) => {
    sessionStorage.setItem("sessionId", sessionId);
    sessionStorage.setItem("nickname", nickname);
    sessionStorage.setItem("color", color);
    // 영구 저장은 하지 않음 (새 탭마다 새 로그인 필요)
  },
  getSession: () => {
    return {
      sessionId: sessionStorage.getItem("sessionId"),
      nickname: sessionStorage.getItem("nickname"),
      color: sessionStorage.getItem("color"),
    };
  },
  clearSession: () => {
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("nickname");
    sessionStorage.removeItem("color");
  },
  hasSession: () => {
    return sessionStorage.getItem("sessionId") !== null;
  }
};
