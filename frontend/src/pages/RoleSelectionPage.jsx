import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle2, ShieldCheck, Sparkles, User, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  {
    key: 'ADMIN',
    label: 'Super Admin',
    desc: 'Complete control, day book, cash settlements & reports',
    emoji: '👑',
    color: '#3b82f6',
    bgLight: 'rgba(59, 130, 246, 0.08)',
    borderLight: 'rgba(59, 130, 246, 0.25)',
  },
  {
    key: 'AGENT',
    label: 'Collection Agent',
    desc: 'Manage daily loan collections, customers & routes',
    emoji: '🏍️',
    color: '#10b981',
    bgLight: 'rgba(16, 185, 129, 0.08)',
    borderLight: 'rgba(16, 185, 129, 0.25)',
  },
  {
    key: 'CUSTOMER',
    label: 'Customer Portal',
    desc: 'Instant access to personal passbook, EMIs & loan history',
    emoji: '📱',
    color: '#8b5cf6',
    bgLight: 'rgba(139, 92, 246, 0.08)',
    borderLight: 'rgba(139, 92, 246, 0.25)',
  },
];

export default function RoleSelectionPage({ onSelectRole, onBack }) {
  const { isRoleLoggedIn, getStoredRoleSession, user } = useAuth();
  const [showAllRoles, setShowAllRoles] = useState(false);

  // Find any active session
  const adminSession = getStoredRoleSession ? getStoredRoleSession('ADMIN') : null;
  const agentSession = getStoredRoleSession ? getStoredRoleSession('AGENT') : null;
  const customerSession = getStoredRoleSession ? getStoredRoleSession('CUSTOMER') : null;

  // Active primary session if present
  let activeRoleKey = null;
  let activeSessionData = null;

  if (user?.role) {
    activeRoleKey = (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? 'ADMIN' : user.role;
    activeSessionData = { user };
  } else if (adminSession) {
    activeRoleKey = 'ADMIN';
    activeSessionData = adminSession;
  } else if (agentSession) {
    activeRoleKey = 'AGENT';
    activeSessionData = agentSession;
  } else if (customerSession) {
    activeRoleKey = 'CUSTOMER';
    activeSessionData = customerSession;
  }

  const activeRoleConfig = roles.find(r => r.key === activeRoleKey);
  const activeUser = activeSessionData?.user || user;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9990,
      background: 'var(--bg-primary, #0b132b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      overflow: 'hidden',
      height: '100dvh',
      width: '100vw',
    }}>
      {/* Mobile-first app container */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        height: '100%',
        background: 'var(--bg-card, #111c38)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top, 0px) + 16px) 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35)',
        borderLeft: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
        borderRight: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
      }}>
        <div>
          {/* Native Top App Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 44,
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {onBack ? (
                <button
                  onClick={onBack}
                  aria-label="Back"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: 'var(--bg-surface, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    color: 'var(--text-primary, #ffffff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                  }}>
                    <img
                      src="/logo-icon.png"
                      alt="Finova"
                      style={{ width: 22, height: 22, objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 800,
                      letterSpacing: '-0.3px',
                      color: 'var(--text-primary, #ffffff)',
                    }}>
                      Finova
                    </span>
                    <span style={{
                      marginLeft: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 6,
                      background: 'rgba(56, 189, 248, 0.14)',
                      color: '#38bdf8',
                      letterSpacing: '0.4px',
                    }}>
                      PRO
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE SESSION HERO CARD (If user already logged in) */}
          {activeRoleConfig && activeUser && (
            <div style={{
              marginBottom: 22,
              borderRadius: 20,
              padding: '18px 16px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.35)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top status indicator pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#10b981',
                }}>
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    display: 'inline-block',
                    animation: 'pulse 2s infinite',
                  }} />
                  Active Account Session
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted, #94a3b8)', fontSize: 11 }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>Secured</span>
                </div>
              </div>

              {/* User profile row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${activeRoleConfig.color} 0%, #38bdf8 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: `0 4px 14px ${activeRoleConfig.color}40`,
                  flexShrink: 0,
                }}>
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : activeRoleConfig.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: 'var(--text-primary, #ffffff)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {activeUser.name || 'Active User'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 2,
                    fontSize: 12,
                    color: 'var(--text-muted, #94a3b8)',
                  }}>
                    <span style={{
                      color: activeRoleConfig.color,
                      fontWeight: 700,
                    }}>
                      {activeRoleConfig.label}
                    </span>
                    {(activeUser.phone || activeUser.email) && (
                      <>
                        <span>•</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {activeUser.phone || activeUser.email}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Resume Session Button */}
              <button
                type="button"
                onClick={() => onSelectRole(activeRoleKey)}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${activeRoleConfig.color} 0%, #2563eb 100%)`,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 14.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: `0 6px 20px ${activeRoleConfig.color}45`,
                  transition: 'all 0.18s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span>Continue as {activeUser.name ? activeUser.name.split(' ')[0] : activeRoleConfig.label}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Section Heading */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h1 style={{
                fontSize: 'clamp(18px, 4.5vw, 21px)',
                fontWeight: 800,
                color: 'var(--text-primary, #ffffff)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}>
                {activeRoleConfig ? 'Switch Role or Portal' : 'Select Portal'}
              </h1>
              {activeRoleConfig && (
                <button
                  type="button"
                  onClick={() => setShowAllRoles(!showAllRoles)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-accent, #38bdf8)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '4px 6px',
                  }}
                >
                  {showAllRoles ? 'Hide other roles' : 'View all roles'}
                </button>
              )}
            </div>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted, #94a3b8)',
              margin: '4px 0 0 0',
              fontWeight: 400,
            }}>
              Choose your role to access features & collections
            </p>
          </div>

          {/* Role Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {roles
              .filter(role => !activeRoleConfig || showAllRoles || role.key !== activeRoleKey)
              .map((role) => {
                const isSessionSaved = isRoleLoggedIn ? isRoleLoggedIn(role.key) : false;
                const roleSession = getStoredRoleSession ? getStoredRoleSession(role.key) : null;
                const savedUser = roleSession?.user;

                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => onSelectRole(role.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      background: isSessionSaved
                        ? 'var(--bg-surface, rgba(255,255,255,0.04))'
                        : 'var(--bg-surface, rgba(255,255,255,0.03))',
                      border: isSessionSaved
                        ? `1.5px solid ${role.color}80`
                        : '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                      borderRadius: 16,
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.18s ease',
                      boxSizing: 'border-box',
                      boxShadow: isSessionSaved
                        ? `0 4px 16px ${role.color}20`
                        : 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor = role.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = isSessionSaved
                        ? `${role.color}80`
                        : 'var(--border-subtle, rgba(255,255,255,0.08))';
                    }}
                  >
                    {/* Role Icon Container */}
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 13,
                      background: role.bgLight,
                      border: `1px solid ${role.borderLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                    }}>
                      {role.emoji}
                    </div>

                    {/* Role Description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 3,
                      }}>
                        <span style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--text-primary, #ffffff)',
                        }}>
                          {role.label}
                        </span>

                        {isSessionSaved && (
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: 100,
                            padding: '2px 8px',
                            fontSize: 10.5,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}>
                            <CheckCircle2 size={11} color="#10b981" />
                            Session Ready
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: 12,
                        color: isSessionSaved ? '#10b981' : 'var(--text-muted, #94a3b8)',
                        fontWeight: isSessionSaved ? 600 : 400,
                        lineHeight: 1.35,
                      }}>
                        {isSessionSaved
                          ? (savedUser?.name ? `Signed in as ${savedUser.name} • Tap to enter` : 'Active session • Tap to enter directly')
                          : role.desc}
                      </div>
                    </div>

                    {/* Right Chevron */}
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: isSessionSaved ? role.color : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <ChevronRight size={16} color={isSessionSaved ? '#ffffff' : 'var(--text-muted, #94a3b8)'} />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Bottom Safety / Encryption Footer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
          marginTop: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--text-muted, #94a3b8)',
          }}>
            <Shield size={13} color="#10b981" />
            <span>Bank-grade 256-bit SSL encrypted session</span>
          </div>

          {/* Native Mobile Home Bar Indicator */}
          <div style={{
            width: 120,
            height: 4,
            background: 'var(--text-primary, #ffffff)',
            borderRadius: 2,
            opacity: 0.22,
            flexShrink: 0,
          }} />
        </div>
      </div>
    </div>
  );
}
