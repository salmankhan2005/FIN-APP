import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

const roles = [
  {
    key: 'ADMIN',
    label: 'Super Admin',
    desc: 'Full system access',
    emoji: '👑',
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    key: 'AGENT',
    label: 'Collection Agent',
    desc: 'Manage customers & collections',
    emoji: '🏍️',
    color: '#059669',
    bg: '#f0fdf4',
    border: '#a7f3d0',
  },
  {
    key: 'CUSTOMER',
    label: 'Customer',
    desc: 'View your finance & payments',
    emoji: '📱',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
];

export default function RoleSelectionPage({ onSelectRole, onBack }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9990,
      background: '#f8fafc',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 24px 0',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'white', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <ArrowLeft size={18} color="#475569" />
          </button>
        )}
      </div>

      {/* Title */}
      <div style={{ padding: '32px 28px 8px' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: '#0f172a',
          margin: '0 0 8px 0', lineHeight: 1.2,
        }}>
          Select Your Role
        </h1>
        <p style={{
          fontSize: 14, color: '#64748b', margin: 0, fontWeight: 400,
        }}>
          Choose your account type to continue
        </p>
      </div>

      {/* Role cards */}
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {roles.map((role) => (
          <button
            key={role.key}
            onClick={() => onSelectRole(role.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 20px',
              background: role.bg, border: `1.5px solid ${role.border}`,
              borderRadius: 18, cursor: 'pointer',
              textAlign: 'left', width: '100%',
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${role.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              background: `${role.color}18`,
              border: `1.5px solid ${role.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {role.emoji}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: '#0f172a',
                marginBottom: 3,
              }}>
                {role.label}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>
                {role.desc}
              </div>
            </div>

            {/* Arrow */}
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `${role.color}14`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ChevronRight size={18} color={role.color} />
            </div>
          </button>
        ))}
      </div>

      {/* Bottom safe area */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
