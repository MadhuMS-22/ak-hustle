import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Round2Page from './rounds/Round2/Round2Page';
import Round2AdminPage from './rounds/Round2/components/AdminDashboard';
import Round3Page from './rounds/Round3/Round3Page';
import Round3AdminPage from './rounds/Round3/Round3AdminPage';
import TeamPage from './pages/TeamPage';
import AdminPage from './pages/AdminPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/round-2" element={<Round2Page />} />
        <Route path="/round2/admin" element={<Round2AdminPage />} />
        <Route path="/round-3" element={<Round3Page />} />
        <Route path="/admin/round3" element={<Round3AdminPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
};

export default App;
