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
    desc: 'Monitor your collection targets, track real-time cash flow, and achieve your financial milestones with ease.',
    color: '#2563eb',
    image: '/onboard2.jpg',
    tag: '⚡ Real-Time Tracking & Goals',
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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= slides.length) return;
    setCurrent(idx);
  };

  const handleNext = () => {
    if (current < slides.length - 1) goTo(current + 1);
    else onFinish();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    // Dampen drag at boundaries
    if ((current === 0 && diff > 0) || (current === slides.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.28);
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    setIsDragging(false);
    if (dragOffset < -50 && current < slides.length - 1) {
      goTo(current + 1);
    } else if (dragOffset > 50 && current > 0) {
      goTo(current - 1);
    }
    setDragOffset(0);
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        @keyframes slide2SmoothFloat {
          0%, 100% {
            transform: scale(1.24) translateY(0px);
            filter: drop-shadow(0 10px 24px rgba(37, 99, 235, 0.14));
          }
          50% {
            transform: scale(1.27) translateY(-8px);
            filter: drop-shadow(0 16px 36px rgba(37, 99, 235, 0.26));
          }
        }
        @keyframes slide2BadgePulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.2);
          }
          50% {
            transform: translateY(-4px) scale(1.03);
            box-shadow: 0 8px 22px rgba(37, 99, 235, 0.35);
          }
        }
        @keyframes slide2Aura {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.65;
            transform: scale(1.08);
          }
        }
      `}</style>

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
          height: 40, flexShrink: 0, zIndex: 10,
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

        {/* Carousel Viewport */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: '52vh',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}>
          {/* Continuous Sliding Track for butter-smooth transitions */}
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: `${slides.length * 100}%`,
              transform: isDragging
                ? `translateX(calc(-${current * (100 / slides.length)}% + ${dragOffset}px))`
                : `translateX(-${current * (100 / slides.length)}%)`,
              transition: isDragging ? 'none' : 'transform 0.48s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            {slides.map((s, idx) => {
              const isActive = idx === current;
              const isSlide2 = idx === 1;

              return (
                <div
                  key={idx}
                  style={{
                    width: `${100 / slides.length}%`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '0 8px',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Subtle ambient aura for Slide 2 */}
                  {isSlide2 && (
                    <div
                      style={{
                        position: 'absolute',
                        width: '260px',
                        height: '260px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0) 70%)',
                        animation: isActive ? 'slide2Aura 4s ease-in-out infinite' : 'none',
                        pointerEvents: 'none',
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Artwork image with custom smooth animation for slide 2 */}
                  <img
                    src={s.image}
                    alt={`Slide ${idx + 1}`}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      transform: isSlide2 && isActive
                        ? 'scale(1.26)'
                        : 'scale(1.24)',
                      transformOrigin: 'center center',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      zIndex: 2,
                      animation: isSlide2 && isActive ? 'slide2SmoothFloat 3.8s ease-in-out infinite alternate' : 'none',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease',
                    }}
                  />

                  {/* Floating chip for Slide 2 (Track Growth & Goals) */}
                  {isSlide2 && isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        zIndex: 3,
                        background: 'rgba(255, 255, 255, 0.94)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        borderRadius: 20,
                        padding: '6px 14px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#1e40af',
                        animation: 'slide2BadgePulse 3.5s ease-in-out infinite',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        pointerEvents: 'none',
                      }}
                    >
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                      <span>{s.tag}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Card Area */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Pagination Pill Indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginBottom: 14,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 26 : 10,
                  height: 5, borderRadius: 3, border: 'none', padding: 0,
                  background: i === current ? '#2563eb' : '#e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            ))}
          </div>

          {/* Text Content with smooth height and cross-fade */}
          <div style={{
            textAlign: 'center',
            marginBottom: 20,
            minHeight: '74px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h2
              key={`title-${current}`}
              style={{
                fontSize: 'clamp(18px, 4.8vw, 21px)', fontWeight: 800, color: '#0f172a',
                margin: '0 0 6px 0', lineHeight: 1.25,
                whiteSpace: 'pre-line',
                letterSpacing: '-0.3px',
                animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {slide.title}
            </h2>
            <p
              key={`desc-${current}`}
              style={{
                fontSize: 'clamp(11.5px, 3.1vw, 13px)', color: '#64748b', lineHeight: 1.5,
                margin: '0 auto', fontWeight: 400,
                maxWidth: 295,
                animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
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
