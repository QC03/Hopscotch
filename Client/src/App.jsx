import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import WaitingPage from "./pages/WaitingPage";
import GamePage from "./pages/GamePage";
import AdminPage from "./pages/AdminPage";
import ResultPage from "./pages/ResultPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/result" element={<ResultPage />} />
      {/* 존재하지 않는 경로는 로그인 페이지로 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
