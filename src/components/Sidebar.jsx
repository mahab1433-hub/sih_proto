import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sidebar Component
 * Fixed dark navy navigation bar matching the user's reference dashboard.
 */
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* System Branding Header */}
        <div className="sidebar-header">
          <div className="officer-badge-card">
            <div className="officer-avatar">🔬</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="officer-name" style={{ fontSize: '0.84rem', letterSpacing: '-0.01em' }}>
                Colorimetric Field
              </div>
              <div className="officer-sub" style={{ fontSize: '0.68rem', color: 'var(--sidebar-text)' }}>
                Optical Diagnostics
              </div>
            </div>
            <div className="officer-unit-pill">Active</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-section-title">Main Navigation</div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/new-test"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">🔬</span>
            <span>Start New Test</span>
          </NavLink>

          <NavLink
            to="/history"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">📋</span>
            <span>Test History</span>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">👤</span>
            <span>Officer Profile</span>
          </NavLink>

          <NavLink
            to="/login"
            onClick={onClose}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">🔐</span>
            <span>Terminal Login</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
