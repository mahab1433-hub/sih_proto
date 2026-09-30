import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Profile Page
 * Displays authorized officer credentials, unit information, and cryptographic identity.
 */
export default function Profile() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '4px' }}>
            Officer Profile & Credentials
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Authorized field investigator identity and digital signing credentials.
          </p>
        </div>

        <Link to="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
          ← Dashboard
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '20px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            border: '2px solid #000000',
          }}
        >
          🛡️
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)' }}>
              Officer (1023)
            </h2>
            <span className="badge badge-verified">ACTIVE DUTY</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Specialized Narcotic Field Investigation Unit • Central Division
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span>ID: <strong className="mono" style={{ color: 'var(--text-main)' }}>1023</strong></span>
            <span>Badge: <strong className="mono" style={{ color: 'var(--text-main)' }}>#B-8941-K</strong></span>
            <span>Station: <strong style={{ color: 'var(--text-main)' }}>Central Precinct</strong></span>
          </div>
        </div>
      </div>

      {/* Security & Cryptographic Identity Card */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>
          Cryptographic Hardware Identity
        </h3>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '4px' }}>
            DEVICE SIGNING PUBLIC KEY (ED25519)
          </div>
          <div
            className="mono"
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--card-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: 'var(--text-main)',
              wordBreak: 'break-all',
            }}
          >
            PUBKEY-ED25519-7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1A2B3C4D5E6F7A8B
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
          All presumptive digital test records captured through this terminal are deterministically signed
          using this officer keypair, ensuring verifiable chain-of-custody integrity under FIPS 180-4 standard.
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: '0.82rem' }}
          >
            <span>🚪</span> Switch Operator / Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
