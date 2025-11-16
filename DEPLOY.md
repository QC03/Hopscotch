# 🚀 Hopscotch - 온라인 배포 가이드

## Render에 자동 배포하기

### 📋 사전 준비

1. **GitHub 계정** - 코드 푸시 필요
2. **Render 계정** - https://render.com (무료)
3. **프로젝트 Push** - 모든 변경사항을 GitHub에 커밋

```bash
cd c:\Users\QC\Desktop\Develop\Hopscotch
git add .
git commit -m "온라인 배포 준비: render.yaml 추가"
git push origin develop
```

### 🔧 Render 배포 단계

#### 1단계: Render 프로젝트 생성

1. https://render.com 접속 → **Sign up/Login**
2. **Dashboard** → **New +** → **Blueprint**
3. **GitHub** 연결 (처음이면 승인 요청)
4. 레포 선택: `hopscotch`
5. **Branch:** `develop`
6. **Deploy** 클릭

#### 2단계: 환경변수 설정

**백엔드 서버 설정:**
- Render Dashboard → `hopscotch-server` 선택
- **Environment** → 환경변수 확인
- 기본값이 자동으로 설정됨

**프론트엔드 클라이언트 설정:**
- Render Dashboard → `hopscotch-client` 선택
- **Environment** → **VITE_SERVER_URL** 확인
- 값: `https://hopscotch-server-[random].onrender.com` (서버 배포 후 자동 갱신)

#### 3단계: 배포 확인

1. Render Dashboard에서 배포 진행 상황 모니터링
2. 백엔드 URL 확인: `https://hopscotch-server-[random].onrender.com`
3. 프론트엔드 URL 확인: `https://hopscotch-client-[random].onrender.com`

### 📝 예상 URL 형식

```
Backend:  https://hopscotch-server-xxxxx.onrender.com
Frontend: https://hopscotch-client-xxxxx.onrender.com
```

### ⚠️ 주의사항

- **무료 플랜:** 15분 이상 요청이 없으면 절전 모드 진입
  - 첫 요청 시 10-30초 대기 가능
  - 해결: Render 유료 플랜 업그레이드 또는 정기적인 ping 서비스 이용

- **CORS 설정:**
  - 서버는 모든 오리진 허용 중 (`cors: { origin: "*" }`)
  - 필요시 프론트엔드 도메인만 허용하도록 변경 가능

- **데이터 저장소:**
  - 현재 메모리 기반 (서버 재시작 시 초기화)
  - 필요시 MongoDB 등의 데이터베이스 통합 가능

### 🔄 지속적 배포

- 이후 `develop` 브랜치에 `git push` 하면 자동 배포됨
- Render는 GitHub 변경사항을 자동으로 감지

### 🛠️ 수동 재배포

- Render Dashboard → 프로젝트 선택
- **Manual Deploy** → **Redeploy**

### 📱 로컬에서 원격 서버로 테스트

프로덕션 환경 변수로 로컬 테스트:

```bash
# 클라이언트 디렉토리에서
set VITE_SERVER_URL=https://hopscotch-server-xxxxx.onrender.com
npm run build
npm run preview
```

### ❓ 트러블슈팅

**연결 실패:**
- 브라우저 콘솔에서 URL 확인: `📡 Socket.IO 연결 대상: ...`
- 확인된 URL이 정상인지 브라우저에서 직접 접속해보기

**빌드 실패:**
- Render Logs 확인
- `npm install` 또는 빌드 오류 메시지 확인
- GitHub에 모든 변경사항 푸시 확인

**정적 페이지 표시 안 됨:**
- `Client/vite.config.js`의 `base` 설정 확인
- `dist` 폴더가 정상 생성되었는지 확인

---

**배포 완료 후 URL을 공유하면 누구나 게임을 플레이할 수 있습니다! 🎮**
