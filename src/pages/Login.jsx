import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Login Page
 * Secure Officer / Operator Authentication Terminal.
 * Provides credentials entry, quick demo fill, hardware vault indicators,
 * and seamless navigation to the forensic dashboard.
 */
export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [operatorId, setOperatorId] = useState('1023');
  const [station, setStation] = useState('Central Precinct • Station #04');
  const [pin, setPin] = useState('4829');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!operatorId.trim()) {
      setError('Please provide an authorized Operator ID.');
      return;
    }

    if (!pin.trim() || pin.trim().length < 4) {
      setError('Security PIN must be at least 4 digits.');
      return;
    }

    setIsLoading(true);

    // Simulate cryptographic keypair unlock & session registration
    setTimeout(() => {
      const sessionData = {
        operatorId: operatorId.trim().toUpperCase(),
        station,
        loginTime: new Date().toISOString(),
        keyringId: 'ED25519-VAULT-ACTIVE',
      };

      localStorage.setItem('OFFICER_SESSION', JSON.stringify(sessionData));

      if (onLoginSuccess) {
        onLoginSuccess(sessionData);
      }

      setIsLoading(false);
      navigate('/');
    }, 450);
  };

  const handleDemoFill = () => {
    setOperatorId('1023');
    setStation('Central Precinct • Station #04');
    setPin('4829');
    setError('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-header">
          <div className="login-shield-badge">
            <span className="login-shield-icon">🛡️</span>
          </div>
          <h1 className="login-system-title">COLORIMETRIC FIELD</h1>
          <p className="login-system-subtitle">
            Automated Interpretation & Tamper-Evident Digital Recording
          </p>
          <div className="login-tag-pill">
            <span className="live-dot-pulse" />
            <span>STANDALONE FORENSIC TERMINAL</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="login-form-card">
          <div className="login-form-header">
            <h2 className="login-form-title">Operator Terminal Access</h2>
            <p className="login-form-desc">
              Authenticate authorized field investigator identity and unlock hardware signing vault.
            </p>
          </div>

          {error && (
            <div className="login-error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            {/* Operator ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="operatorId">
                OPERATOR / BADGE ID
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input
                  id="operatorId"
                  type="text"
                  className="form-input mono"
                  placeholder="e.g. 1023 or OP-7042"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Station / Division */}
            <div className="form-group">
              <label className="form-label" htmlFor="station">
                ASSIGNED STATION / PRECINCT
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🏢</span>
                <select
                  id="station"
                  className="form-select"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                >
                  <option value="Central Precinct • Station #04">Central Precinct • Station #04</option>
                  <option value="North Division Crime Investigation">North Division Crime Investigation</option>
                  <option value="South Tactical Narcotics Unit">South Tactical Narcotics Unit</option>
                  <option value="Forensic Mobile Rapid Field Unit">Forensic Mobile Rapid Field Unit</option>
                </select>
              </div>
            </div>

            {/* Security PIN */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="pin">
                  SECURITY PIN / PASSCODE
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin((prev) => !prev)}
                  className="login-toggle-btn"
                >
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  className="form-input mono"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-glow-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Unlocking Terminal Vault...</span>
              ) : (
                <>
                  <span>LOGIN TO FORENSIC TERMINAL</span>
                  <span>→</span>
                </>
              )}
            </button>

            {/* Quick Demo Fill Button */}
            <button
              type="button"
              onClick={handleDemoFill}
              className="btn btn-secondary login-demo-btn"
            >
              <span>⚡</span> Use Officer 1023 Demo Credentials
            </button>
          </form>

          {/* Hardware Security Telemetry Strip */}
          <div className="login-telemetry-strip">
            <div className="telemetry-item">
              <span className="telemetry-dot green" />
              <span>SHA-256 Ledger Active</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-dot green" />
              <span>Ed25519 Vault Ready</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-dot green" />
              <span>Offline Database Fixed</span>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="login-disclaimer">
          <strong>Mandatory Regulatory Notice:</strong> This software produces a presumptive field-test indication based on optical colorimetry. Confirmatory laboratory evidence (GC-MS / LC-MS) must be submitted for courtroom proceedings.
        </div>
      </div>
    </div>
  );
}
