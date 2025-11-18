# 🏁 Hopscotch - 땅따먹기 게임

다중 플레이어 실시간 웹 게임으로, 10x10 보드에서 플레이어들이 셀을 점령하고 타자 게임으로 경쟁하는 게임입니다.

## 🎮 게임 특징

- **실시간 멀티플레이** - WebSocket 기반 즉시 동기화
- **타자 게임 충돌** - 두 플레이어가 같은 셀을 점령할 때 타자 게임으로 승부
- **5초 점령 메커닉** - 각 셀 점령에 5초 소요
- **무적 상태** - 타자 게임 승리 후 5초간 무적
- **게임 관리** - 관리자가 게임 시작/강제 종료 가능

## 🚀 온라인 배포

**배포되어 있는 게임:**
- 프론트엔드: [여기서 플레이](https://hopscotch-1.onrender.com/)

> 자세한 배포 가이드는 [DEPLOY.md](./DEPLOY.md) 참고

## 💻 로컬 개발

### 사전 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

**1. 레포 클론**
```bash
git clone <repo-url>
cd Hopscotch
```

**2. 서버 실행**
```bash
cd Server
npm install
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다.

**3. 클라이언트 실행 (새 터미널)**
```bash
cd Client
npm install
npm run dev
```

클라이언트는 `http://localhost:5173`에서 실행됩니다.

**4. 브라우저에서 열기**
- http://localhost:5173 접속
- 닉네임 입력 후 로그인
- 여러 브라우저/탭에서 다른 닉네임으로 로그인하여 멀티플레이 테스트

## 📁 프로젝트 구조

```
Hopscotch/
├── Client/                 # React + Vite 프론트엔드
│   ├── src/
│   │   ├── pages/         # 로그인, 대기, 게임, 관리자, 결과 페이지
│   │   ├── components/    # 보드, 셀, 타자 게임 패널
│   │   ├── socket.js      # Socket.IO 클라이언트 설정
│   │   └── main.jsx
│   └── package.json
├── Server/                 # Node.js + Express + Socket.IO 백엔드
│   ├── src/
│   │   └── index.js       # 게임 로직, 이벤트 핸들러
│   └── package.json
├── render.yaml            # Render 배포 설정
├── DEPLOY.md              # 배포 가이드
└── README.md
```

## 🎯 주요 게임 플로우

1. **로그인** - 닉네임 입력 후 대기 화면으로 이동
2. **대기** - 다른 플레이어 대기 중, 관리자가 게임 시작
3. **게임 진행** - 셀 점령 (5초) 또는 타자 게임으로 경쟁
4. **타자 게임** - 8개 단어를 먼저 입력한 플레이어가 셀 소유
5. **무적 상태** - 승리자는 5초간 무적
6. **게임 종료** - 5분 후 자동 또는 관리자가 강제 종료
7. **결과** - 최종 순위 표시 후 로그인 화면으로 복귀

## 🛠️ 기술 스택

**프론트엔드:**
- React 19.2.0
- React Router 7.9.6
- Socket.IO Client 4.8.1
- Vite 7.2.2

**백엔드:**
- Node.js + Express 5.1.0
- Socket.IO 4.8.1
- CORS 2.8.5

## 📊 게임 보드

- **크기:** 10x10 그리드 (100개 셀)
- **셀 상태:** 빈칸, 점령 중, 소유됨, 타자 게임 중, 무적
- **시각화:** 색상 구분 및 진행도 바

## 🔄 Socket.IO 이벤트

**클라이언트 → 서버:**
- `login` - 로그인
- `session/restore` - 세션 복구 (새로고침 시)
- `game/requestBoard` - 보드 초기화 요청
- `cell/attemptCapture` - 셀 점령 시도
- `typing/input` - 타자 게임 입력
- `admin/startGame` - 게임 시작 (관리자)
- `admin/forceEndGame` - 게임 강제 종료 (관리자)

**서버 → 클라이언트:**
- `waiting/players` - 현재 대기 중인 플레이어 목록
- `game/start` - 게임 시작 신호
- `board/init` - 보드 초기화 데이터
- `board/update` - 보드 셀 상태 변경
- `typing/start` - 타자 게임 시작
- `typing/update` - 타자 게임 진행 상황
- `typing/end` - 타자 게임 종료
- `game/result` - 최종 순위 결과

## 📝 라이선스

MIT

## 👨‍💻 개발자

QC03

---

**게임을 즐기세요! 🎮**
