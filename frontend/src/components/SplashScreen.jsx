import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish, duration = 1800 }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 350);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 200);
  };

  return (
    <div 
      className={`splash-container ${fadeOut ? 'splash-fade-out' : ''}`}
      onClick={handleSkip}
      title="Tap to continue"
    >
      {/* Background ambient lighting effects */}
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />

      <div className="splash-content">
        {/* Pulsing Icon Wrapper */}
        <div className="splash-logo-box">
          <div className="splash-pulse-ring" />
          <div className="splash-pulse-ring-2" />
          <img 
            src="/logo-icon.png" 
            alt="Finova Logo" 
            className="splash-logo-img"
          />
        </div>

        {/* Brand Typography */}
        <div className="splash-text-group">
          <h1 className="splash-title">Finova</h1>
          <p className="splash-subtitle">Smart Money. Better Future.</p>
          <div className="splash-badge">Next-Gen Micro-Finance Platform</div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="splash-loader-group">
          <div className="splash-progress-track">
            <div 
              className="splash-progress-fill" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="splash-status-text">
            <span>Loading secure workspace...</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
