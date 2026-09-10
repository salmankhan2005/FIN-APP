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
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        filter: 'blur(30px)',
      }} />

      {/* Wave/curve decoration at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 160,
        background: 'linear-gradient(180deg, rgba(37,99,235,0.08) 0%, transparent 100%)',
      }} />

      {/* Main content */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 0, zIndex: 1,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(29,78,216,0.5), 0 0 120px rgba(6,182,212,0.2)',
          marginBottom: 28,
          position: 'relative',
        }}>
          {/* Pulse ring */}
          <div style={{
            position: 'absolute', inset: -8, borderRadius: 36,
            border: '2px solid rgba(37,99,235,0.3)',
            animation: 'splashPulse 2s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', inset: -18, borderRadius: 46,
            border: '1px solid rgba(6,182,212,0.15)',
            animation: 'splashPulse 2s ease-in-out infinite 0.4s',
          }} />
          <img
            src="/logo-icon.png"
            alt="Finova"
            style={{ width: 64, height: 64, objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML += `<span style="color:#fff;font-size:36px;font-weight:900;letter-spacing:-2px">F</span>`;
            }}
          />
        </div>

        {/* Brand name */}
        <h1 style={{
          fontSize: 42, fontWeight: 900, color: '#ffffff',
          margin: '0 0 6px 0', letterSpacing: '-1px',
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        }}>
          FINOVA
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 14, color: 'rgba(148,197,255,0.8)', fontWeight: 500,
          margin: '0 0 32px 0', letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          Finance. People. Progress.
        </p>

        {/* Divider */}
        <div style={{
          width: 48, height: 2,
          background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, transparent)',
          marginBottom: 24, borderRadius: 1,
        }} />

        {/* Subtitle */}
        <p style={{
          fontSize: 18, color: 'rgba(255,255,255,0.75)', fontWeight: 400,
          textAlign: 'center', lineHeight: 1.6, margin: 0,
          maxWidth: 260,
        }}>
          Smarter Finance<br />
          <span style={{ fontWeight: 700, color: '#ffffff' }}>for a Better Tomorrow</span>
        </p>
      </div>

      {/* Bottom section */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: 40,
      }}>
        <p style={{
          fontSize: 12, color: 'rgba(148,197,255,0.5)', fontWeight: 500,
          letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 14px 0',
        }}>
          Building Stronger Communities
        </p>
        {/* Animated gradient bar */}
        <div style={{
          width: '60%', height: 3, borderRadius: 2,
          background: 'linear-gradient(90deg, #1d4ed8, #06b6d4, #1d4ed8)',
          backgroundSize: '200% 100%',
          animation: 'splashBarSlide 2s linear infinite',
        }} />
      </div>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        @keyframes splashBarSlide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
    </div>
  );
}
