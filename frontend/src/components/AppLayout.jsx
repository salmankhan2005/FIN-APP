import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { notificationsAPI } from '../services/api';
import {
  LayoutDashboard, Users, Landmark, HandCoins, ChevronRight, Plus,
  FileBarChart, Shield, UserCog, LogOut, Menu, X, Settings, Bell, History
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout, isSuperAdmin, isAdmin, isCustomer } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [inAppNotifs, setInAppNotifs] = useState([]);
  const location = useLocation();

  useEffect(() => {
    notificationsAPI.getInApp().then(setInAppNotifs).catch(() => {});
  }, [location.pathname]);

  const handleMarkRead = (id) => {
    notificationsAPI.markRead(id).then(() => {
      setInAppNotifs(prev => prev.filter(n => n.id !== id));
    });
  };

  // Navigation links based on role
  const links = isSuperAdmin
    ? [
        { section: 'System', items: [
          { to: '/', icon: LayoutDashboard, label: 'Super Panel' },
        ]},
        { section: 'Config', items: [
          { to: '/notifications', icon: Bell, label: 'Notifications' },
          { to: '/settings', icon: Settings, label: 'Settings & Backup' },
        ]},
      ]
    : isAdmin
    ? [
        { section: 'Overview', items: [
          { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        ]},
        { section: 'Management', items: [
          { to: '/customers', icon: Users, label: 'Customers' },
          { to: '/loans', icon: Landmark, label: 'Loans' },
          { to: '/loans/create', icon: Plus, label: 'Create Loan' },
        ]},
        { section: 'Operations', items: [
          { to: '/collections', icon: HandCoins, label: 'Collections' },
          { to: '/payment-history', icon: History, label: 'History' },
        ]},
        { section: 'Admin', items: [
          { to: '/notifications', icon: Bell, label: 'Notifications' },
          { to: '/users', icon: UserCog, label: 'User Management' },
          { to: '/settings', icon: Settings, label: 'Settings & Backup' },
        ]},
      ]
    : isCustomer
    ? [
        { section: 'My Passbook', items: [
          { to: '/', icon: LayoutDashboard, label: 'Passbook Overview' },
          { to: '/loans', icon: Landmark, label: 'My Loans' },
        ]},
        { section: 'Account', items: [
          { to: '/notifications', icon: Bell, label: 'Due Alerts' },
        ]},
      ]
    : [
        { section: 'My Work', items: [
          { to: '/', icon: LayoutDashboard, label: 'Home' },
          { to: '/collections', icon: HandCoins, label: 'Collections' },
        ]},
        { section: 'Data', items: [
          { to: '/customers', icon: Users, label: 'Customers' },
          { to: '/loans', icon: Landmark, label: 'Loans' },
          { to: '/loans/create', icon: Plus, label: 'Create Loan' },
        ]},
        { section: 'Tools', items: [
          { to: '/notifications', icon: Bell, label: 'Notifications' },
        ]},
      ];

  // Bottom nav items (most used pages)
  const bottomNavItems = isSuperAdmin
    ? [
        { to: '/', icon: LayoutDashboard, label: 'Home' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ]
    : isAdmin
    ? [
        { to: '/', icon: LayoutDashboard, label: 'Home' },
        { to: '/customers', icon: Users, label: 'Customers' },
        { to: '/loans', icon: Landmark, label: 'Loans' },
        { to: '/collections', icon: HandCoins, label: 'Collections' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ]
    : isCustomer
    ? [
        { to: '/', icon: LayoutDashboard, label: 'Passbook' },
        { to: '/loans', icon: Landmark, label: 'My Loans' },
        { to: '/notifications', icon: Bell, label: 'Alerts' },
      ]
    : [
        { to: '/', icon: LayoutDashboard, label: 'Home' },
        { to: '/collections', icon: HandCoins, label: 'Collections' },
        { to: '/customers', icon: Users, label: 'Customers' },
        { to: '/loans', icon: Landmark, label: 'Loans' },
        { to: '/settings', icon: Settings, label: 'Settings' },
      ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const handleLogout = async () => { await logout(); };

  // Get current page label for header title
  const currentPage = [
    { to: '/', label: isSuperAdmin ? 'Super Admin Panel' : 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/loans/create', label: 'Create Loan' },
    { to: '/loans', label: 'Loans' },
    { to: '/collections', label: 'Collections' },
    { to: '/payment-history', label: 'History' },
    { to: '/users', label: 'Users' },
  ].find(l => l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to))?.label || 'Finova';

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="mobile-header-brand">
          <span className="mobile-header-title">{currentPage}</span>
        </div>
        <div className="mobile-header-user" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>

          {/* Notification Bell Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowProfileDropdown(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {inAppNotifs.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: '800',
                  borderRadius: '10px',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }}>
                  {inAppNotifs.length}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                  onClick={() => setShowNotificationDropdown(false)} 
                />
                <div className="profile-dropdown animate-in" style={{ 
                  zIndex: 999, 
                  width: '320px', 
                  right: -40, 
                  maxHeight: '400px', 
                  overflowY: 'auto' 
                }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <strong style={{ fontSize: 13 }}>Alerts & Notifications</strong>
                    <span className="badge badge-info" style={{ fontSize: 10 }}>
                      {inAppNotifs.length} New
                    </span>
                  </div>

                  {inAppNotifs.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                      No new notifications
                    </div>
                  ) : (
                    inAppNotifs.map((n) => (
                      <div 
                        key={n.id}
                        style={{
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: n.isAgentAlert ? 'rgba(245, 158, 11, 0.06)' : 'transparent',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 800, 
                            color: n.isAgentAlert ? '#f59e0b' : 'var(--primary-500)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            {n.isAgentAlert ? '🔑 Agent Credential Alert' : '📢 Reminder'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              fontSize: 10, 
                              color: 'var(--text-muted)', 
                              cursor: 'pointer' 
                            }}
                          >
                            Mark read
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}

                  <div style={{ padding: '10px 16px', textAlign: 'center', background: 'var(--bg-subtle)' }}>
                    <Link 
                      to="/notifications" 
                      onClick={() => setShowNotificationDropdown(false)}
                      style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)', textDecoration: 'none' }}
                    >
                      View All Notifications →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <div 
            className="sidebar-avatar" 
            onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotificationDropdown(false); }} 
            style={{ width: 32, height: 32, fontSize: 13, cursor: 'pointer' }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {showProfileDropdown && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                onClick={() => setShowProfileDropdown(false)} 
              />
              <div className="profile-dropdown animate-in" style={{ zIndex: 999 }}>
                <div className="profile-dropdown-header">
                  <strong>{user?.name}</strong>
                  <span>{user?.email || user?.phone}</span>
                  <div style={{ marginTop: 4 }}>
                    <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px', display: 'inline-block' }}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <div className="profile-dropdown-divider" />
                <button 
                  className="profile-dropdown-item text-danger" 
                  onClick={async () => { 
                    setShowProfileDropdown(false); 
                    await handleLogout(); 
                  }}
                >
                  <LogOut size={16} /> Switch Account
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="app-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <img src="/logo-icon.png" alt="Finova" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'contain' }} />
            <div>
              <h1>Finova</h1>
              <span>{isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin Panel' : 'Agent Panel'}</span>
            </div>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(false)}
              style={{ marginLeft: 'auto', display: sidebarOpen ? 'flex' : 'none' }}>
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {links.map((section) => (
              <div key={section.section} className="sidebar-section">
                <div className="sidebar-section-title">{section.section}</div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <button className="mobile-menu-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (mobile only) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
