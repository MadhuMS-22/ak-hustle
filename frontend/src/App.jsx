import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Round2Page from './rounds/Round2/Round2Page';
import Round2AdminPage from './rounds/Round2/components/AdminDashboard';
import Round3Page from './rounds/Round3/Round3Page';
import Round3AdminPage from './rounds/Round3/Round3AdminPage';
import TeamPage from './pages/TeamPage';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import TestAdminLogin from './pages/TestAdminLogin';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/round-2" element={<ErrorBoundary><Round2Page /></ErrorBoundary>} />
          <Route path="/round2/admin" element={<Round2AdminPage />} />
          <Route path="/round-3" element={<Round3Page />} />
          <Route path="/admin/round3" element={
            <ProtectedAdminRoute>
              <Round3AdminPage />
            </ProtectedAdminRoute>
          } />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/test-admin" element={<TestAdminLogin />} />
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
