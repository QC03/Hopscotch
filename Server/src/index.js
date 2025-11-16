import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {}; // socketId -> { nickname, color, inTyping: false }
let board = [];   // 20x20 보드

const rows = 20;
const cols = 20;
const captureTime = 5000; // 점령 시간 5초
const typingWords = ["apple","banana","cat","dog","egg","fish","goat","hat"];
let typingMatches = {}; // matchId -> { players, words, cellKey, winner }

// 보드 초기화
for (let r = 0; r < rows; r++) {
  board[r] = [];
  for (let c = 0; c < cols; c++) {
    board[r][c] = { row: r, col: c, owner: null, capturing: null, locked: false };
  }
}

io.on("connection", (socket) => {
  console.log("유저 접속:", socket.id);

  // 로그인
  socket.on("login", ({ nickname }, callback) => {
    if (!nickname || Object.values(players).some(p => p.nickname === nickname)) {
      callback({ success: false, message: "닉네임 중복 또는 입력 없음" });
      return;
    }
    const color = "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
    players[socket.id] = { nickname, color, inTyping: false };
    callback({ success: true });
    
    io.emit("waiting/players", Object.values(players));
    socket.emit("board/init", board, socket.id);
  });

  // 대기 화면 참가 인원 갱신
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("waiting/players", Object.values(players));
  });

  // 관리자 게임 시작
  socket.on("admin/startGame", () => {
    io.emit("game/start");
  });

  // 셀 점령 시도
  socket.on("cell/attemptCapture", ({ row, col }) => {
    const cell = board[row][col];
    if (cell.capturing) {
      cell.locked = true;
      startTypingGame([cell.capturing.playerId, socket.id], `${row}_${col}`);
      io.emit("board/update", cell);
      return;
    }

    cell.capturing = { playerId: socket.id, finishAt: Date.now() + captureTime };
    io.emit("board/update", cell);

    setTimeout(() => {
      if (!cell.locked && cell.capturing?.playerId === socket.id) {
        cell.owner = players[socket.id];
        cell.capturing = null;
        io.emit("board/update", cell);
      }
    }, captureTime);
  });

  // 타자게임 입력
  socket.on("typing/input", ({ matchId, word }) => {
    const match = typingMatches[matchId];
    if (!match) return;

    if (match.words[0] === word) {
      match.words.shift();
      match.players.forEach((id) => io.to(id).emit("typing/update", match.words));
    } else {
      io.to(socket.id).emit("typing/error");
    }

    if (match.words.length === 0) {
      match.winner = socket.id;
      const [r, c] = match.cellKey.split("_");
      const cell = board[parseInt(r)][parseInt(c)];
      cell.owner = players[socket.id];
      cell.capturing = null;
      cell.locked = false;
      io.emit("board/update", cell);
    }
  });
});

// 타자게임 시작
function startTypingGame(playerIds, cellKey) {
  const matchId = cellKey + "_" + Date.now();
  typingMatches[matchId] = { players: playerIds, words: [...typingWords], cellKey, winner: null };
  playerIds.forEach((id) => io.to(id).emit("typing/start", { matchId, words: typingWords }));
}

server.listen(3000, () => console.log("Socket.IO 서버 3000번 포트 실행"));
