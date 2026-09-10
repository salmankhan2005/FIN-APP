import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish, duration = 2400 }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const showTimer = setTimeout(() => setVisible(true), 50);
    const finishTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => { if (onFinish) onFinish(); }, 500);
    }, duration);

    return () => { clearTimeout(showTimer); clearTimeout(finishTimer); };
  }, [duration, onFinish]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => { if (onFinish) onFinish(); }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(160deg, #0a1628 0%, #0d1f3c 40%, #0a2040 70%, #061530 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: fadeOut ? 0 : (visible ? 1 : 0),
        transition: 'opacity 0.5s ease',
        cursor: 'pointer', overflow: 'hidden',
        userSelect: 'none',
        height: '100dvh', width: '100vw',
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
        filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      {/* Main content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px', zIndex: 1, width: '100%', maxWidth: 380,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Full Circle Logo */}
        <div style={{
          position: 'relative',
          marginBottom: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Circular Pulse rings */}
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            border: '2px solid rgba(37,99,235,0.4)',
            animation: 'splashPulse 2s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -22, borderRadius: '50%',
            border: '1px solid rgba(6,182,212,0.2)',
            animation: 'splashPulse 2s ease-in-out infinite 0.4s',
          }} />

          {/* Full circle logo container */}
          <div style={{
            width: 106, height: 106, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 45px rgba(29,78,216,0.6), 0 0 90px rgba(6,182,212,0.25)',
            overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.2)',
            position: 'relative',
          }}>
            <img
              src="/logo-icon.png"
              alt="Finova"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.18)',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += `<span style="color:#fff;font-size:42px;font-weight:900;letter-spacing:-2px">F</span>`;
              }}
            />
          </div>
        </div>

        {/* Brand name */}
        <h1 style={{
          fontSize: 'clamp(32px, 8vw, 42px)', fontWeight: 900, color: '#ffffff',
          margin: '0 0 6px 0', letterSpacing: '-0.5px',
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          textAlign: 'center',
        }}>
          FINOVA
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 'clamp(12px, 3.2vw, 14px)', color: 'rgba(148,197,255,0.85)', fontWeight: 600,
          margin: '0 0 24px 0', letterSpacing: '2px', textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          Finance. People. Progress.
        </p>

        {/* Divider */}
        <div style={{
          width: 48, height: 2,
          background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, transparent)',
          marginBottom: 20, borderRadius: 1,
        }} />

        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(15px, 4vw, 17px)', color: 'rgba(255,255,255,0.8)', fontWeight: 400,
          textAlign: 'center', lineHeight: 1.5, margin: 0,
          maxWidth: 280,
        }}>
          Smarter Finance<br />
          <span style={{ fontWeight: 700, color: '#ffffff' }}>for a Better Tomorrow</span>
        </p>
      </div>

      {/* Bottom section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: 'clamp(24px, 5vh, 40px)',
      }}>
        <p style={{
          fontSize: 11, color: 'rgba(148,197,255,0.5)', fontWeight: 500,
          letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 12px 0',
        }}>
          Building Stronger Communities
        </p>
        {/* Animated gradient bar */}
        <div style={{
          width: 140, height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #1d4ed8, #06b6d4, #1d4ed8)',
          backgroundSize: '200% 100%',
          animation: 'splashBarSlide 2s linear infinite',
        }} />
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.08); }
        }
        @keyframes splashBarSlide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
