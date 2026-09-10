import React, { useState, useRef } from 'react';

const slides = [
  {
    title: 'Smart Financial\nManagement',
    desc: 'Effortlessly manage loans, monitor collections, and keep complete control of your finances in one secure place.',
    color: '#2563eb',
    image: '/onboard1.jpg',
  },
  {
    title: 'Track Growth &\nSet Daily Goals',
    desc: "Monitor your collection targets, track real-time cash flow, and achieve your financial milestones with ease.",
    color: '#2563eb',
    image: '/onboard2.jpg',
  },
  {
    title: 'Instant Passbook\n& Smart Reports',
    desc: 'Get real-time payment receipts, clear interest breakdowns, and automated collection route tracking on the go.',
    color: '#2563eb',
    image: '/onboard3.jpg',
  },
];

export default function OnboardingSlides({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const touchStartX = useRef(null);

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setFadeIn(false);
    setTimeout(() => {
      setCurrent(idx);
      setFadeIn(true);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (current < slides.length - 1) goTo(current + 1);
    else onFinish();
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && current < slides.length - 1) goTo(current + 1);
      else if (diff < 0 && current > 0) goTo(current - 1);
    }
    touchStartX.current = null;
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        overflow: 'hidden', height: '100dvh', width: '100vw',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile-constrained container */}
      <div
        style={{
          width: '100%', maxWidth: 430, height: '100%',
          background: '#ffffff',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 24px 20px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(0,0,0,0.06)',
        }}
      >
        {/* Top Header / Skip */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          height: 40, flexShrink: 0,
        }}>
          {!isLast ? (
            <button
              onClick={onFinish}
              style={{
                background: '#f1f5f9', border: 'none',
                borderRadius: 20, padding: '7px 18px',
                fontSize: 13, fontWeight: 600, color: '#64748b',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              Skip
            </button>
          ) : <div style={{ height: 32 }} />}
        </div>

        {/* Illustration Area — Scaled up for prominent 2D artwork */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: '52vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'scale(1)' : 'scale(0.96)',
          transition: 'all 0.2s ease',
          padding: 0,
        }}>
          <img
            key={current}
            src={slide.image}
            alt={`Slide ${current + 1}`}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              transform: 'scale(1.26)',
              transformOrigin: 'center center',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Bottom Card Area */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.2s ease',
        }}>
          {/* Pagination Pill Indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginBottom: 12,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 12,
                  height: 5, borderRadius: 3, border: 'none', padding: 0,
                  background: i === current ? '#2563eb' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </div>

          {/* Text Content — reduced font size */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h2 style={{
              fontSize: 'clamp(18px, 4.8vw, 21px)', fontWeight: 800, color: '#0f172a',
              margin: '0 0 6px 0', lineHeight: 1.25,
              whiteSpace: 'pre-line',
              letterSpacing: '-0.3px',
            }}>
              {slide.title}
            </h2>
            <p style={{
              fontSize: 'clamp(11.5px, 3.1vw, 13px)', color: '#64748b', lineHeight: 1.5,
              margin: '0 auto', fontWeight: 400,
              maxWidth: 290,
            }}>
              {slide.desc}
            </p>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            style={{
              width: '100%', height: 48,
              background: '#2563eb',
              color: '#ffffff', border: 'none',
              borderRadius: 24,
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(37,99,235,0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>

          {/* Home indicator bar for native mobile feel */}
          <div style={{
            width: 120, height: 4, background: '#0f172a',
            borderRadius: 2, opacity: 0.18,
            marginTop: 12,
          }} />
        </div>
      </div>
    </div>
  );
}
