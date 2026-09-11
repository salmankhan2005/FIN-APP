import React, { useState, useRef, useEffect } from 'react';

/* ─── 5 Slide Definitions with Full 2D Visual Illustrations ─── */
const slides = [
  {
    image: '/slide1_smart_lending.jpg',
    badge: 'SMART LOANS',
    title: 'Smart Micro-Lending\n& Adaptive Loans',
    desc: 'Easily manage daily, weekly & monthly loans with automated interest recalculations and instant balance tracking.',
    gradient: ['#2563EB', '#1D4ED8'],
  },
  {
    image: '/slide2_field_collection.jpg',
    badge: 'FIELD COLLECTIONS',
    title: 'Field Collection &\nReal-Time GPS Route',
    desc: 'Empower agents with interactive map navigation, instant doorstep receipts, and live daily target tracking.',
    gradient: ['#059669', '#047857'],
  },
  {
    image: '/slide3_jamin_kyc.jpg',
    badge: 'GUARANTOR & KYC',
    title: 'Guarantor (Jamin) KYC\n& ID Verification',
    desc: 'Protect every loan with complete guarantor (ஜாமீன்) records, Aadhaar photo uploads, and location pinning.',
    gradient: ['#1E40AF', '#2563EB'],
  },
  {
    image: '/slide4_passbook_receipts.jpg',
    badge: 'DIGITAL PASSBOOK',
    title: 'Digital Passbook &\nInstant Receipts',
    desc: 'Deliver instant SMS & WhatsApp transaction receipts, digital passbook histories, and real-time cash records.',
    gradient: ['#0F172A', '#10B981'],
  },
  {
    image: '/slide5_excel_reports.jpg',
    badge: 'EXCEL EXPORTS & REPORTS',
    title: 'Master Excel (.xlsx)\nExtraction & Analytics',
    desc: 'Export full color-coded multi-sheet Excel workbooks with live balances, recovery stats, and audit logs.',
    gradient: ['#059669', '#2563EB'],
  },
];

const AUTO_INTERVAL = 4500;

export default function OnboardingSlides({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const autoRef = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= slides.length) return;
    setCurrent(idx);
  };

  /* Auto-advance carousel */
  const resetAutoTimer = () => {
    clearInterval(autoRef.current);
    if (!paused) {
      autoRef.current = setInterval(() => {
        setCurrent((prev) => {
          if (prev < slides.length - 1) return prev + 1;
          clearInterval(autoRef.current);
          return prev;
        });
      }, AUTO_INTERVAL);
    }
  };

  useEffect(() => {
    resetAutoTimer();
    return () => clearInterval(autoRef.current);
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    clearInterval(autoRef.current);
    if (current < slides.length - 1) goTo(current + 1);
    else onFinish();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    setPaused(true);
    clearInterval(autoRef.current);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.touches[0].clientX - touchStartX.current;
    if ((current === 0 && diff > 0) || (current === slides.length - 1 && diff < 0)) {
      setDragOffset(diff * 0.28);
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    setIsDragging(false);
    setPaused(false);
    if (dragOffset < -50 && current < slides.length - 1) goTo(current + 1);
    else if (dragOffset > 50 && current > 0) goTo(current - 1);
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
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'hidden', height: '100dvh', width: '100vw',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style>{`
        @keyframes ob-fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ob-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .ob-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Mobile-constrained app container */}
      <div
        style={{
          width: '100%', maxWidth: 430, height: '100%',
          background: '#ffffff',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '14px 18px 18px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(0,0,0,0.07)',
          borderLeft: '1px solid rgba(0,0,0,0.05)',
          borderRight: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {/* Top App Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 38, flexShrink: 0, zIndex: 10,
        }}>
          {/* Logo brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
            }}>
              <span style={{ fontSize: 15, color: 'white', fontWeight: 800 }}>₹</span>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Finova</div>
              <div style={{ fontSize: 9, color: '#64748B', fontWeight: 500 }}>Smart Micro-Finance</div>
            </div>
          </div>

          {!isLast ? (
            <button
              onClick={onFinish}
              style={{
                background: '#F1F5F9', border: 'none',
                borderRadius: 20, padding: '5px 14px',
                fontSize: 12, fontWeight: 600, color: '#64748B',
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
            >
              Skip
            </button>
          ) : (
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: '#10B981',
              background: '#ECFDF5', padding: '3px 9px', borderRadius: 10,
            }}>
              Ready
            </div>
          )}
        </div>

        {/* ─── Single-Image Carousel Viewport (100% Full Width per Slide) ─── */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          maxHeight: '48vh',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 18,
          background: '#F8FAFC',
          border: '1px solid #F1F5F9',
        }}>
          {/* Sliding Track */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: isDragging
                ? `translateX(calc(-${current * 100}% + ${dragOffset}px))`
                : `translateX(-${current * 100}%)`,
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            {slides.map((s, idx) => (
              <div
                key={idx}
                style={{
                  width: '100%',
                  minWidth: '100%',
                  maxWidth: '100%',
                  height: '100%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={s.image}
                    alt={s.badge}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Area */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          zIndex: 5,
          paddingTop: 8,
        }}>

          {/* Dot Indicators (1 Dot Per Slide, Total 5 Dots) */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginBottom: 10,
          }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(autoRef.current); goTo(i); setPaused(false); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 6,
                  height: 6, borderRadius: 3, border: 'none', padding: 0,
                  background: i === current ? '#2563EB' : '#E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            ))}
          </div>

          {/* Feature Badge */}
          <div
            key={`badge-${current}`}
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: '0.8px',
              color: '#2563EB',
              background: '#EFF6FF',
              padding: '2.5px 9px',
              borderRadius: 6,
              marginBottom: 6,
              border: '1px solid #DBEAFE',
              animation: 'ob-fadeUp 0.3s ease',
            }}
          >
            {slide.badge}
          </div>

          {/* Text Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: 14,
            minHeight: 76,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h2
              key={`title-${current}`}
              style={{
                fontSize: 'clamp(17px, 4.6vw, 20px)', fontWeight: 800, color: '#0F172A',
                margin: '0 0 5px 0', lineHeight: 1.25,
                whiteSpace: 'pre-line',
                letterSpacing: '-0.3px',
                animation: 'ob-fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {slide.title}
            </h2>
            <p
              key={`desc-${current}`}
              style={{
                fontSize: 'clamp(11.5px, 3.1vw, 12.5px)', color: '#64748B', lineHeight: 1.45,
                margin: '0 auto', fontWeight: 400,
                maxWidth: 310,
                animation: 'ob-fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {slide.desc}
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            className="ob-btn"
            onClick={handleNext}
            style={{
              width: '100%', height: 46,
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: '#ffffff', border: 'none',
              borderRadius: 14,
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <span>{isLast ? '🚀 Launch Finova App' : 'Next Step →'}</span>
          </button>

          {/* Slide counter */}
          <div style={{
            marginTop: 6,
            fontSize: 10,
            color: '#94A3B8',
            fontWeight: 500,
          }}>
            {current + 1} of {slides.length}
          </div>
        </div>
      </div>
    </div>
  );
}
