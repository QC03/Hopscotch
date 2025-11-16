const { Server } = require("socket.io");
const io = new Server(3000, { cors: { origin: "*" } });

let players = {}; // id -> { nickname, color, socketId, inTyping }
let board = []; // 2차원 배열, [{row, col, owner, capturing, locked}]
let typingMatches = {}; // matchId -> { cellKey, players, words, progress, winner }

// 초기 보드 생성
const initBoard = (rows = 20, cols = 20) => {
  board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      owner: null,
      capturing: null,
      locked: false
    }))
  );
};

initBoard();

io.on("connection", (socket) => {
  console.log("유저 접속:", socket.id);

  // 로그인 이벤트
  socket.on("login", ({ nickname }, callback) => {
    if (Object.values(players).some((p) => p.nickname === nickname)) {
      callback({ success: false, message: "닉네임 중복" });
      return;
    }

    const color = "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
    players[socket.id] = { nickname, color, socketId: socket.id, inTyping: false };
    callback({ success: true });
    io.emit("players/update", Object.values(players));
    socket.emit("board/init", board, socket.id);
  });

  // 셀 점령 시도
  socket.on("cell/attemptCapture", ({ row, col }) => {
    const cell = board[row][col];

    // 이미 점령 중이면 locked + 타자게임
    if (cell.capturing) {
      cell.locked = true;
      cell.lockContestants = [cell.capturing.playerId, socket.id];

      startTypingGame(cell.lockContestants, `${row}_${col}`);
      io.emit("board/update", cell);
      return;
    }

    // 점령 시작
    cell.capturing = { playerId: socket.id, finishAt: Date.now() + 5000 }; // 기본 5초
    io.emit("board/update", cell);

    // 5초 뒤 점령 완료
    setTimeout(() => {
      if (!cell.locked && cell.capturing?.playerId === socket.id) {
        cell.owner = players[socket.id];
        cell.capturing = null;
        io.emit("board/update", cell);
      }
    }, 5000);
  });

  socket.on("typing/input", ({ matchId, word }) => {
    const match = typingMatches[matchId];
    if (!match) return;

    const idx = match.words.indexOf(word);
    if (idx === 0) {
      match.words.shift(); // 단어 제거
      io.to(match.players[0]).emit("typing/update", match.words);
      io.to(match.players[1]).emit("typing/update", match.words);
    } else {
      io.to(socket.id).emit("typing/error", "오타 발생");
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

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players/update", Object.values(players));
  });
});

// 타자게임 시작
function startTypingGame(playerIds, cellKey) {
  const words = ["apple", "banana", "cat", "dog", "egg", "fish", "goat", "hat"]; // 예시
  const matchId = cellKey + "_" + Date.now();
  typingMatches[matchId] = {
    cellKey,
    players: playerIds,
    words: [...words],
    progress: {},
    winner: null,
  };
  playerIds.forEach((id) => {
    io.to(id).emit("typing/start", { matchId, words });
  });
}
