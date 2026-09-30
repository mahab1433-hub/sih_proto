import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NewTest from './pages/NewTest';
import CameraPage from './pages/CameraPage';
import Analysis from './pages/Analysis';
import Result from './pages/Result';
import TestHistory from './pages/TestHistory';
import TestDetails from './pages/TestDetails';
import Profile from './pages/Profile';

/**
 * Root Application Component
 * Manages full-screen authentication at /login and
 * standard desktop sidebar + content workspace layout for authenticated routes.
 */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Full-screen standalone view for Login page
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Fixed Left Sidebar on Desktop / Drawer on Mobile */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-test" element={<NewTest />} />
            <Route path="/test" element={<Navigate to="/new-test" replace />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/result" element={<Result />} />
            <Route path="/history" element={<TestHistory />} />
            <Route path="/record/:testId" element={<TestDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
