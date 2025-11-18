import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error("에러:", err);
  res.status(500).json({ error: "서버 오류" });
});

let players = {}; // socketId -> { nickname, color, inTyping: false, sessionId, capturingCell: null }
let board = [];   // 보드
let sessionData = {}; // sessionId -> { nickname, color, cellsOwned }
let gameActive = false; // 현재 게임 진행 상태

let rows = 10;
let cols = 10;
const captureTime = 5000; // 점령 시간 5초
const typingWords = ["apple","banana","cat","dog","egg","fish","goat","hat","ice","jam","kite","lion","moon","nest","owl","pig","queen","rat","sun","tree"];
let typingMatches = {}; // matchId -> { players, words, cellKey, winner }
let gameRemainingTime = 300; // 게임 남은 시간 (초)
let gameTimer = null; // 게임 타이머

// 보드 초기화 함수
function initializeBoard() {
  board = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = { row: r, col: c, owner: null, capturing: null, locked: false, invulnerable: false };
    }
  }
}

// 초기 보드 생성
initializeBoard();

io.on("connection", (socket) => {
  console.log("유저 접속:", socket.id);

  // 재접속 시 세션 복구
  socket.on("session/restore", ({ sessionId }, callback) => {
    try {
      if (sessionId && sessionData[sessionId]) {
        const session = sessionData[sessionId];
        players[socket.id] = { ...session, socketId: socket.id };
        callback({ success: true, player: players[socket.id] });
        
        io.emit("waiting/players", Object.values(players));
        socket.emit("board/init", board, socket.id);
        console.log("세션 복구:", sessionId, session.nickname);
      } else {
        callback({ success: false });
      }
    } catch (err) {
      console.error("세션 복구 에러:", err);
      callback({ success: false });
    }
  });

  // 로그인
  socket.on("login", ({ nickname }, callback) => {
    try {
      if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
        callback({ success: false, message: "유효한 닉네임을 입력해주세요" });
        return;
      }
      if (Object.values(players).some(p => p.nickname === nickname)) {
        callback({ success: false, message: "이미 사용 중인 닉네임입니다" });
        return;
      }
      const color = "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
      const sessionId = `${socket.id}_${Date.now()}`;
      players[socket.id] = { nickname, color, inTyping: false, socketId: socket.id, capturingCell: null };
      sessionData[sessionId] = { nickname, color, inTyping: false };
      callback({ success: true, sessionId });
      
      // 모든 클라이언트에 참가 인원 업데이트 (본인 포함)
      console.log("✓ 로그인 완료:", nickname, "색상:", color);
      io.emit("waiting/players", Object.values(players));
      setTimeout(() => { 
        io.emit("waiting/players", Object.values(players));
      }, 500);
        
      socket.emit("board/init", board, socket.id);
      console.log("  참가 인원:", Object.keys(players).length, "명");
    } catch (err) {
      console.error("로그인 에러:", err);
      callback({ success: false, message: "로그인 중 오류 발생" });
    }
  });

  // 대기 화면 참가 인원 갱신
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("waiting/players", Object.values(players));
  });

  // 관리자 보드 크기 설정
  socket.on("admin/setRowCol", ({ row, col }, callback) => {
    rows = row;
    cols = col;
    board = [];
    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = { row: r, col: c, owner: null, capturing: null, locked: false, invulnerable: false };
      }
    }
    console.log(`✓ 보드 크기 설정 완료: ${rows} x ${cols}`);
  });

  // 관리자 게임 시작
  socket.on("admin/startGame", () => {
    console.log("\n╔════════════════════════════════╗");
    console.log("║      게임 시작 신호 수신        ║");
    console.log("╚════════════════════════════════╝");
    console.log("플레이어 수:", Object.keys(players).length);
    console.log("보드 크기:", board.length, "x", (board[0]?.length || 0));

    // 게임 상태 활성화
    gameActive = true;

    // 보드 초기화: 이전 게임의 소유/잠금/캡처 상태 제거
    console.log("🧹 새 게임을 위해 보드 초기화 중...");
    initializeBoard();

    gameRemainingTime = 300; // 게임 시간 5분으로 초기화

    // 기존 타자 매치 정리
    typingMatches = {};

    // 플레이어의 점령 상태 초기화 (capturingCell 등)
    Object.keys(players).forEach(id => {
      if (players[id]) {
        players[id].capturingCell = null;
        players[id].inTyping = false;
      }
    });


    // 게임 타이머 초기화
    if (gameTimer) {
      gameRemainingTime = 300;
      clearInterval(gameTimer);
    }

    // 게임 타이머 시작
    gameTimer = setInterval(() => {
      gameRemainingTime--;
      io.emit("game/time", gameRemainingTime);

      if (gameRemainingTime <= 0) {
        endGame();
        clearInterval(gameTimer);
        gameTimer = null;
      }
    }, 1000);

    // 모든 클라이언트에게 게임 시작 및 초기화된 보드 전송
    console.log("📢 game/start 브로드캐스트 및 board/init 전송");
    io.emit("game/start");
    io.emit("board/init", board);
    console.log("✓ game/start 및 board/init 전송 완료\n");
  });

  

  function endGame() {
    gameActive = false;
    try {
      const ranking = Object.entries(players)
        .map(([id, player]) => {
          const cellsOwned = board.flat().filter(cell => cell.owner?.nickname === player.nickname).length;
          return { ...player, socketId: id, cellsOwned };
        })
        .sort((a, b) => b.cellsOwned - a.cellsOwned);
      
      io.emit("game/result", ranking);

      // 보드 초기화 (이전 게임 데이터 제거)
      console.log("🧹 게임 강제 종료로 보드 초기화 중...");
      initializeBoard();

      // 게임 시간 초기화
      console.log("⏳ 게임 시간 초기화 중...");
      gameRemainingTime = 300;
      clearInterval(gameTimer);

      // 타자 매치 정리
      typingMatches = {};

      // 플레이어/세션 정보 초기화
      console.log("🗑️ 게임 강제 종료, 플레이어 정보 정리 중...");
      players = {};
      sessionData = {};

      // 클라이언트에게 초기화된 보드 전송
      io.emit("board/init", board);
      
      console.log("✓ 플레이어 정보 초기화 완료");
    } catch (err) {
      console.error("게임 종료 에러:", err);
    }
  }

  // 관리자 게임 강제 종료
  socket.on("admin/forceEndGame", () => {
    console.log("게임 강제 종료");
    endGame();
  });

  // 게임 종료 및 결과 계산
  socket.on("game/end", () => {
    console.log("게임 종료 신호 수신");
    endGame();
  });

  // 클라이언트가 보드를 요청할 때
  socket.on("game/requestBoard", () => {
    console.log("📋 game/requestBoard 수신 from", socket.id);
    console.log("   보드 데이터 전송 중...");
    socket.emit("board/init", board);
    console.log("   ✓ board/init 전송 완료");
  });

  // 셀 점령 시도
  socket.on("cell/attemptCapture", ({ row, col }) => {
    try {
      if (typeof row !== "number" || typeof col !== "number" || row < 0 || row >= rows || col < 0 || col >= cols) {
        socket.emit("error", "유효하지 않은 셀 좌표");
        return;
      }

      // 현재 플레이어가 이미 다른 셀을 점령 중인지 확인
      if (players[socket.id]?.capturingCell !== null) {
        socket.emit("error", "이미 점령 중인 셀이 있습니다. 현재 점령을 완료하거나 취소한 후 다시 시도해주세요.");
        return;
      }

      const cell = board[row][col];
      
      // 무적 상태인 셀은 점령 불가
      if (cell.invulnerable) {
        socket.emit("error", "현재 무적 상태인 셀입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      // 타자게임 진행 중인 셀은 제3자 접근 불가
      if (cell.locked) {
        socket.emit("error", "현재 타자게임이 진행 중입니다. 다른 셀을 선택해주세요.");
        return;
      }

      if (cell.capturing) {
        cell.locked = true;
        startTypingGame([cell.capturing.playerId, socket.id], `${row}_${col}`);
        io.emit("board/update", cell);
        return;
      }

      cell.capturing = { playerId: socket.id, finishAt: Date.now() + captureTime };
      players[socket.id].capturingCell = `${row}_${col}`;
      io.emit("board/update", cell);

      setTimeout(() => {
        if (!cell.locked && cell.capturing?.playerId === socket.id && players[socket.id]) {
          cell.owner = players[socket.id];
          cell.capturing = null;
          players[socket.id].capturingCell = null;
          io.emit("board/update", cell);
        }
      }, captureTime);
    } catch (err) {
      console.error("셀 점령 에러:", err);
      socket.emit("error", "셀 점령 중 오류 발생");
    }
  });

  // 타자게임 입력
  socket.on("typing/input", ({ matchId, word }) => {
    try {
      const match = typingMatches[matchId];
      if (!match) {
        socket.emit("error", "매치가 존재하지 않습니다");
        return;
      }

      if (typeof word !== "string") {
        socket.emit("typing/error");
        return;
      }

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
        cell.invulnerable = true; // 5초 무적 설정
        
        // 타자 게임에 참여한 두 플레이어 모두의 capturingCell 초기화
        match.players.forEach(playerId => {
          if (players[playerId]) {
            players[playerId].capturingCell = null;
          }
        });
        
        io.emit("board/update", cell);
        
        // 타자 게임 종료 이벤트 발송 (클라이언트가 UI 상태 초기화)
        match.players.forEach(playerId => {
          io.to(playerId).emit("typing/end");
        });
        
        delete typingMatches[matchId];
        
        // 5초 후 무적 해제
        setTimeout(() => {
          cell.invulnerable = false;
          io.emit("board/update", cell);
        }, 5000);
      }
    } catch (err) {
      console.error("타자게임 입력 에러:", err);
      socket.emit("error", "타자게임 처리 중 오류 발생");
    }
  });
});

// 타자게임 시작
function startTypingGame(playerIds, cellKey) {
  const matchId = cellKey + "_" + Date.now();
  // typingWords를 섞기 (Fisher-Yates 셔플)
  const shuffledWords = [...typingWords].sort(() => Math.random() - 0.5).slice(0, 7);
  typingMatches[matchId] = { players: playerIds, words: shuffledWords, cellKey, winner: null };
  playerIds.forEach((id) => io.to(id).emit("typing/start", { matchId, words: shuffledWords }));
}

server.on("error", (err) => {
  console.error("서버 에러:", err);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO 서버 http://localhost:${PORT} 실행 중...`);
  console.log("보드 크기: " + rows + "x" + cols);
});
