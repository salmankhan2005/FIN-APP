import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, THEMES } from '../contexts/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme, currentTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      {compact ? (
        <button
          id="theme-toggle-btn-compact"
          onClick={() => setOpen(o => !o)}
          title={`Current Theme: ${currentTheme.label} - Tap to change`}
          aria-label="Change theme"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 150ms ease',
          }}
        >
          <Palette size={19} style={{ color: 'var(--text-accent, var(--primary-400))' }} />
        </button>
      ) : (
        <button
          id="theme-toggle-btn"
          onClick={() => setOpen(o => !o)}
          title="Change theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--sidebar-border)',
            background: 'var(--sidebar-item-hover)',
            color: 'var(--sidebar-text-muted)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 150ms ease',
          }}
        >
          <Palette size={16} style={{ flexShrink: 0, color: 'var(--primary-400, #60a5fa)' }} />
          <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTheme.icon} {currentTheme.label}
          </span>
          <span style={{
            fontSize: 10,
            opacity: 0.5,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 200ms',
          }}>▾</span>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: compact ? 'auto' : '110%',
          top: compact ? 'calc(100% + 8px)' : 'auto',
          right: compact ? 0 : 'auto',
          left: compact ? 'auto' : 0,
          width: 220,
          background: 'var(--dropdown-bg)',
          border: '1px solid var(--dropdown-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)',
          padding: '6px',
          zIndex: 9999,
          animation: 'fadeInUp 150ms ease',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--text-muted)',
            padding: '4px 8px 8px',
          }}>
            App Theme
          </div>

          {THEMES.map(t => (
            <button
              key={t.id}
              id={`theme-option-${t.id}`}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: theme === t.id ? 'var(--primary-500, #3b82f6)' : 'transparent',
                color: theme === t.id ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
                transition: 'background 120ms ease',
              }}
            >
              {/* Color preview dots */}
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {t.preview.map((c, i) => (
                  <div key={i} style={{
                    width: i === 0 ? 14 : 9,
                    height: i === 0 ? 14 : 9,
                    borderRadius: '50%',
                    background: c,
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    marginTop: i === 0 ? 0 : 2.5,
                  }} />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, lineHeight: 1.2 }}>{t.icon} {t.label}</div>
                <div style={{
                  fontSize: 10,
                  opacity: 0.7,
                  marginTop: 1,
                  color: theme === t.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                }}>
                  {t.description}
                </div>
              </div>
              {theme === t.id && <Check size={14} style={{ flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
