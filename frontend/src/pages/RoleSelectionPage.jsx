import React from 'react';
import { ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  {
    key: 'ADMIN',
    label: 'Super Admin',
    desc: 'Full system access & control',
    emoji: '👑',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    key: 'AGENT',
    label: 'Collection Agent',
    desc: 'Manage customers & daily collections',
    emoji: '🏍️',
    color: '#059669',
    bg: '#f0fdf4',
    border: '#a7f3d0',
  },
  {
    key: 'CUSTOMER',
    label: 'Customer',
    desc: 'View loans, passbook & payments',
    emoji: '📱',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
];

export default function RoleSelectionPage({ onSelectRole, onBack }) {
  const { isRoleLoggedIn } = useAuth();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      overflow: 'hidden', height: '100dvh', width: '100vw',
    }}>
      {/* Mobile container */}
      <div style={{
        width: '100%', maxWidth: 430, height: '100%',
        background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(16px, 3vh, 24px) 24px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        boxShadow: '0 0 50px rgba(0,0,0,0.06)',
      }}>
        {/* Top bar */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            minHeight: 40, marginBottom: 'clamp(16px, 2.5vh, 28px)',
          }}>
            {onBack ? (
              <button
                onClick={onBack}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
              >
                <ArrowLeft size={18} color="#475569" />
              </button>
            ) : <div style={{ height: 38 }} />}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 'clamp(20px, 3vh, 28px)' }}>
            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 28px)', fontWeight: 800, color: '#0f172a',
              margin: '0 0 6px 0', lineHeight: 1.2, letterSpacing: '-0.3px',
            }}>
              Select Your Role
            </h1>
            <p style={{
              fontSize: 'clamp(13px, 3.4vw, 14px)', color: '#64748b', margin: 0, fontWeight: 400,
            }}>
              Choose your account type to proceed
            </p>
          </div>

          {/* Role cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {roles.map((role) => {
              const loggedIn = isRoleLoggedIn ? isRoleLoggedIn(role.key) : false;

              return (
                <button
                  key={role.key}
                  onClick={() => onSelectRole(role.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 'clamp(14px, 2.2vh, 18px) 16px',
                    background: role.bg,
                    border: loggedIn ? `2px solid ${role.color}` : `1.5px solid ${role.border}`,
                    borderRadius: 18, cursor: 'pointer',
                    textAlign: 'left', width: '100%',
                    transition: 'all 0.18s ease',
                    boxShadow: loggedIn
                      ? `0 4px 14px ${role.color}25`
                      : '0 2px 8px rgba(0,0,0,0.03)',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${role.color}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = loggedIn
                      ? `0 4px 14px ${role.color}25`
                      : '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${role.color}18`,
                    border: `1.5px solid ${role.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                  }}>
                    {role.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      marginBottom: 2,
                    }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700, color: '#0f172a',
                      }}>
                        {role.label}
                      </span>
                      {loggedIn && (
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #86efac',
                          borderRadius: 12,
                          padding: '2px 7px',
                          fontSize: 10.5,
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          <CheckCircle2 size={11} color="#16a34a" /> Logged In
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12.5, color: loggedIn ? '#166534' : '#64748b', fontWeight: loggedIn ? 500 : 400 }}>
                      {loggedIn ? 'Active session • Tap to enter directly' : role.desc}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 10,
                    background: loggedIn ? role.color : `${role.color}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.18s ease',
                  }}>
                    <ChevronRight size={16} color={loggedIn ? '#ffffff' : role.color} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom home bar */}
        <div style={{
          width: 120, height: 4, background: '#0f172a',
          borderRadius: 2, opacity: 0.18,
          margin: '16px auto 0', flexShrink: 0,
        }} />
      </div>
    </div>
  );
}
