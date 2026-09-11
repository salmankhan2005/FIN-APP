import React, { useState, useRef, useEffect } from 'react';

/* ─── 2D SVG Illustrations ─── */

const IllustrationFinance = ({ active }) => (
  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EEF2FF" />
        <stop offset="100%" stopColor="#E0F2FE" />
      </linearGradient>
      <linearGradient id="card1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="green1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>

    {/* Background blob */}
    <ellipse cx="160" cy="130" rx="150" ry="120" fill="url(#bg1)" />

    {/* Main card */}
    <rect x="40" y="60" width="220" height="130" rx="18" fill="url(#card1)" style={{ filter: 'drop-shadow(0 8px 24px rgba(37,99,235,0.35))' }} />
    <rect x="40" y="60" width="220" height="130" rx="18" fill="url(#card1)" />

    {/* Card shine */}
    <ellipse cx="90" cy="80" rx="50" ry="18" fill="rgba(255,255,255,0.12)" />

    {/* Card chip */}
    <rect x="58" y="90" width="24" height="18" rx="4" fill="#F59E0B" />
    <rect x="62" y="94" width="8" height="3" rx="1" fill="rgba(0,0,0,0.2)" />
    <rect x="62" y="99" width="8" height="3" rx="1" fill="rgba(0,0,0,0.2)" />

    {/* Card text */}
    <rect x="58" y="118" width="80" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
    <rect x="58" y="132" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
    <rect x="178" y="132" width="64" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
    <rect x="58" y="148" width="110" height="7" rx="3.5" fill="rgba(255,255,255,0.7)" />

    {/* Floating balance pill */}
    <rect x="190" y="45" width="100" height="36" rx="18" fill="white" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
    <circle cx="210" cy="63" r="10" fill="#EEF2FF" />
    <text x="210" y="67" textAnchor="middle" fontSize="11" fill="#2563EB" fontWeight="700">₹</text>
    <rect x="224" y="56" width="56" height="5" rx="2.5" fill="#1E293B" />
    <rect x="224" y="65" width="38" height="4" rx="2" fill="#94A3B8" />

    {/* Floating stats card */}
    <rect x="20" y="160" width="110" height="52" rx="14" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.10))' }} />
    <circle cx="40" cy="176" r="10" fill="#ECFDF5" />
    <text x="40" y="180" textAnchor="middle" fontSize="11" fill="#10B981">↑</text>
    <rect x="54" y="170" width="62" height="5" rx="2.5" fill="#1E293B" />
    <rect x="54" y="179" width="42" height="4" rx="2" fill="#94A3B8" />
    <rect x="29" y="192" width="82" height="8" rx="4" fill="#ECFDF5" />
    <rect x="29" y="192" width="58" height="8" rx="4" fill="url(#green1)" />

    {/* Floating graph card */}
    <rect x="190" y="160" width="110" height="52" rx="14" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.10))' }} />
    <text x="208" y="175" fontSize="9" fill="#94A3B8" fontWeight="600">COLLECTIONS</text>
    {/* Mini bar chart */}
    {[18, 30, 22, 36, 28, 40].map((h, i) => (
      <rect key={i} x={200 + i * 14} y={212 - h} width="9" height={h} rx="3"
        fill={i === 5 ? '#2563EB' : '#E0E7FF'} />
    ))}

    {/* Animated coin */}
    <circle cx="160" cy="230" r="14" fill="#FEF3C7" style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.3))' }} />
    <text x="160" y="235" textAnchor="middle" fontSize="13" fill="#F59E0B" fontWeight="800">₹</text>

    {/* Decorative dots */}
    <circle cx="30" cy="55" r="5" fill="#BFDBFE" opacity="0.8" />
    <circle cx="285" cy="55" r="7" fill="#DDD6FE" opacity="0.7" />
    <circle cx="295" cy="200" r="4" fill="#A7F3D0" opacity="0.8" />
  </svg>
);

const IllustrationGrowth = ({ active }) => (
  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F0FDF4" />
        <stop offset="100%" stopColor="#ECFEFF" />
      </linearGradient>
      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="goalBar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>

    <ellipse cx="160" cy="130" rx="145" ry="115" fill="url(#bg2)" />

    {/* Main chart card */}
    <rect x="30" y="50" width="260" height="130" rx="18" fill="white" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))' }} />
    <text x="50" y="75" fontSize="10" fill="#94A3B8" fontWeight="600">DAILY COLLECTION</text>
    <text x="50" y="92" fontSize="18" fill="#0F172A" fontWeight="800">₹2,46,500</text>
    <rect x="196" y="76" width="52" height="20" rx="10" fill="#ECFDF5" />
    <text x="222" y="90" textAnchor="middle" fontSize="10" fill="#10B981" fontWeight="700">+12.4%</text>

    {/* Chart area */}
    <path d="M50 160 L80 145 L110 148 L140 130 L170 120 L200 108 L230 95 L260 85 L260 170 L50 170 Z"
      fill="url(#chartFill)" />
    <path d="M50 160 L80 145 L110 148 L140 130 L170 120 L200 108 L230 95 L260 85"
      stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Chart dots */}
    {[[50,160],[110,148],[170,120],[230,95],[260,85]].map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r={i===4?5:3.5}
        fill={i===4?'#10B981':'white'} stroke="#10B981" strokeWidth="2" />
    ))}

    {/* Tooltip */}
    <rect x="226" y="68" width="56" height="28" rx="8" fill="#0F172A" />
    <polygon points="254,96 250,104 258,104" fill="#0F172A" />
    <text x="254" y="80" textAnchor="middle" fontSize="8" fill="#94A3B8">Today</text>
    <text x="254" y="91" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">₹8,400</text>

    {/* Goal progress card */}
    <rect x="30" y="192" width="170" height="52" rx="14" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.08))' }} />
    <text x="46" y="210" fontSize="9" fill="#94A3B8" fontWeight="600">DAILY GOAL</text>
    <text x="46" y="224" fontSize="13" fill="#0F172A" fontWeight="700">₹10,000</text>
    <rect x="46" y="230" width="138" height="6" rx="3" fill="#E2E8F0" />
    <rect x="46" y="230" width="95" height="6" rx="3" fill="url(#goalBar)" />
    <text x="184" y="236" fontSize="8" fill="#2563EB" fontWeight="700" textAnchor="end">82%</text>

    {/* Floating badge */}
    <rect x="212" y="192" width="84" height="52" rx="14" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.08))' }} />
    <circle cx="254" cy="212" r="12" fill="#EEF2FF" />
    <text x="254" y="216" textAnchor="middle" fontSize="14" fill="#2563EB">🎯</text>
    <text x="254" y="232" textAnchor="middle" fontSize="8" fill="#94A3B8">Target</text>
    <text x="254" y="242" textAnchor="middle" fontSize="10" fill="#0F172A" fontWeight="700">On Track</text>

    {/* Decorative */}
    <circle cx="22" cy="140" r="6" fill="#BBF7D0" opacity="0.8" />
    <circle cx="298" cy="100" r="5" fill="#BFDBFE" opacity="0.8" />
    <circle cx="25" cy="50" r="4" fill="#FDE68A" opacity="0.8" />
  </svg>
);

const IllustrationReports = ({ active }) => (
  <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDF4FF" />
        <stop offset="100%" stopColor="#FFF7ED" />
      </linearGradient>
      <linearGradient id="pie1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>

    <ellipse cx="160" cy="130" rx="145" ry="115" fill="url(#bg3)" />

    {/* Passbook card */}
    <rect x="28" y="45" width="170" height="145" rx="18" fill="white" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.09))' }} />
    <rect x="28" y="45" width="170" height="44" rx="18" fill="#7C3AED" />
    <rect x="28" y="67" width="170" height="22" fill="#7C3AED" />
    <text x="50" y="62" fontSize="9" fill="rgba(255,255,255,0.7)" fontWeight="600">PASSBOOK</text>
    <text x="50" y="77" fontSize="13" fill="white" fontWeight="800">₹1,24,000</text>
    <text x="166" y="77" fontSize="10" fill="#DDD6FE" textAnchor="end">Collected</text>

    {/* Passbook rows */}
    {[
      ['Rajan Kumar', '+₹2,000', '#10B981'],
      ['Meena Devi', '+₹1,500', '#10B981'],
      ['Suresh P.', '+₹3,200', '#10B981'],
      ['Pending x3', '-₹900', '#EF4444'],
    ].map(([name, amt, color], i) => (
      <g key={i}>
        <rect x="36" y={102 + i * 20} width="152" height="16" rx="6"
          fill={i % 2 === 0 ? '#FAFAFA' : 'white'} />
        <circle cx="46" cy={110 + i * 20} r="5" fill={color + '22'} />
        <text x="55" y={113 + i * 20} fontSize="8.5" fill="#334155" fontWeight="500">{name}</text>
        <text x="180" y={113 + i * 20} textAnchor="end" fontSize="8.5" fill={color} fontWeight="700">{amt}</text>
      </g>
    ))}

    {/* Donut chart card */}
    <rect x="210" y="45" width="100" height="100" rx="16" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.09))' }} />
    <text x="260" y="63" textAnchor="middle" fontSize="8.5" fill="#94A3B8" fontWeight="600">LOANS</text>

    {/* Simple pie/donut */}
    <circle cx="260" cy="105" r="28" fill="none" stroke="#E2E8F0" strokeWidth="10" />
    <circle cx="260" cy="105" r="28" fill="none" stroke="#7C3AED" strokeWidth="10"
      strokeDasharray="105 70" strokeDashoffset="17" strokeLinecap="round" />
    <circle cx="260" cy="105" r="28" fill="none" stroke="#10B981" strokeWidth="10"
      strokeDasharray="45 130" strokeDashoffset="-88" strokeLinecap="round" />
    <circle cx="260" cy="105" r="28" fill="none" stroke="#F59E0B" strokeWidth="10"
      strokeDasharray="25 150" strokeDashoffset="-133" strokeLinecap="round" />
    <text x="260" y="109" textAnchor="middle" fontSize="11" fill="#0F172A" fontWeight="800">84%</text>

    {/* Legend */}
    <rect x="210" y="152" width="8" height="8" rx="2" fill="#7C3AED" />
    <text x="222" y="160" fontSize="8" fill="#64748B">Active</text>
    <rect x="210" y="163" width="8" height="8" rx="2" fill="#10B981" />
    <text x="222" y="171" fontSize="8" fill="#64748B">Closed</text>

    {/* Bottom receipt card */}
    <rect x="28" y="200" width="282" height="44" rx="14" fill="white" style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.08))' }} />
    <circle cx="52" cy="222" r="12" fill="#EDE9FE" />
    <text x="52" y="226" textAnchor="middle" fontSize="13">🧾</text>
    <text x="72" y="218" fontSize="10" fill="#0F172A" fontWeight="700">Instant Receipt Generated</text>
    <text x="72" y="231" fontSize="8.5" fill="#94A3B8">Loan #LN-2024-0087 · ₹2,000 collected</text>
    <rect x="268" y="212" width="30" height="20" rx="10" fill="#ECFDF5" />
    <text x="283" y="225" textAnchor="middle" fontSize="9" fill="#10B981" fontWeight="700">✓ OK</text>

    {/* Decorative */}
    <circle cx="300" cy="50" r="6" fill="#FDE68A" opacity="0.8" />
    <circle cx="22" cy="200" r="5" fill="#DDD6FE" opacity="0.8" />
  </svg>
);

/* ─── Slide data ─── */
const slides = [
  {
    title: 'Smart Financial\nManagement',
    desc: 'Effortlessly manage loans, monitor collections, and keep complete control of your finances in one secure place.',
    gradient: ['#2563EB', '#7C3AED'],
    Illustration: IllustrationFinance,
  },
  {
    title: 'Track Growth &\nSet Daily Goals',
    desc: 'Monitor collection targets, track real-time cash flow, and hit your financial milestones every single day.',
    gradient: ['#059669', '#2563EB'],
    Illustration: IllustrationGrowth,
  },
  {
    title: 'Instant Passbook\n& Smart Reports',
    desc: 'Get real-time payment receipts, clear interest breakdowns, and automated collection route tracking on the go.',
    gradient: ['#7C3AED', '#DB2777'],
    Illustration: IllustrationReports,
  },
];

const AUTO_INTERVAL = 4000;

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

  /* Auto-advance */
  const resetAutoTimer = () => {
    clearInterval(autoRef.current);
    if (!paused) {
      autoRef.current = setInterval(() => {
        setCurrent(prev => {
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
  const [c1, c2] = slide.gradient;

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
        @keyframes ob-fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ob-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes ob-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ob-pulse-ring {
          0%   { transform: scale(0.9); opacity: 0.7; }
          70%  { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes ob-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .ob-dot-active {
          width: 28px !important;
          background: var(--ob-c1) !important;
        }
        .ob-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px) scale(1.01);
        }
        .ob-btn:active {
          transform: scale(0.97);
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
          boxShadow: '0 0 60px rgba(0,0,0,0.07)',
          '--ob-c1': c1,
          '--ob-c2': c2,
        }}
      >

        {/* Animated gradient blob background */}
        <div
          style={{
            position: 'absolute', top: -80, left: '50%',
            transform: 'translateX(-50%)',
            width: 340, height: 340,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 40%, ${c1}22, ${c2}18, transparent 70%)`,
            transition: 'background 0.6s ease',
            pointerEvents: 'none', zIndex: 0,
          }}
        />

        {/* Top: Skip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 40, flexShrink: 0, zIndex: 10, position: 'relative',
        }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.5s ease',
              boxShadow: `0 3px 10px ${c1}44`,
            }}>
              <span style={{ fontSize: 14, color: 'white', fontWeight: 800 }}>₹</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>FinanceApp</span>
          </div>

          {!isLast ? (
            <button
              onClick={onFinish}
              style={{
                background: '#F1F5F9', border: 'none',
                borderRadius: 20, padding: '7px 18px',
                fontSize: 13, fontWeight: 600, color: '#64748B',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; }}
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
          zIndex: 2,
        }}>
          {/* Sliding track */}
          <div
            style={{
              display: 'flex',
              height: '100%',
              width: `${slides.length * 100}%`,
              transform: isDragging
                ? `translateX(calc(-${current * (100 / slides.length)}% + ${dragOffset}px))`
                : `translateX(-${current * (100 / slides.length)}%)`,
              transition: isDragging ? 'none' : 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            {slides.map((s, idx) => {
              const isActive = idx === current;
              const Illus = s.Illustration;
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
                  {/* Ambient glow behind illustration */}
                  <div style={{
                    position: 'absolute',
                    width: 220, height: 220,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${s.gradient[0]}18 0%, transparent 70%)`,
                    animation: isActive ? 'ob-pulse-ring 3.5s ease-in-out infinite' : 'none',
                    pointerEvents: 'none',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                  }} />

                  {/* Floating 2D illustration */}
                  <div style={{
                    width: '90%',
                    maxWidth: 300,
                    animation: isActive ? 'ob-float 4s ease-in-out infinite' : 'none',
                    zIndex: 2,
                    position: 'relative',
                  }}>
                    <Illus active={isActive} />
                  </div>

                  {/* Decorative corner dots — only on active */}
                  {isActive && (
                    <>
                      <div style={{
                        position: 'absolute', top: 10, right: 20,
                        width: 8, height: 8, borderRadius: '50%',
                        background: s.gradient[0], opacity: 0.5,
                        animation: 'ob-float 3s ease-in-out infinite',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: 20, left: 16,
                        width: 6, height: 6, borderRadius: '50%',
                        background: s.gradient[1], opacity: 0.45,
                        animation: 'ob-float 3.8s ease-in-out infinite reverse',
                      }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom area */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          zIndex: 5,
        }}>

          {/* Dot indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginBottom: 18,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(autoRef.current); goTo(i); setPaused(false); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 28 : 8,
                  height: 8, borderRadius: 4, border: 'none', padding: 0,
                  background: i === current
                    ? `linear-gradient(90deg, ${slides[i].gradient[0]}, ${slides[i].gradient[1]})`
                    : '#E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: i === current ? `0 2px 8px ${slides[i].gradient[0]}55` : 'none',
                }}
              />
            ))}
          </div>

          {/* Auto-progress thin bar */}
          {!isLast && (
            <div style={{
              width: '100%', height: 2, background: '#F1F5F9',
              borderRadius: 1, marginBottom: 14, overflow: 'hidden',
            }}>
              <div
                key={current}
                style={{
                  height: '100%',
                  width: '100%',
                  background: `linear-gradient(90deg, ${c1}, ${c2})`,
                  borderRadius: 1,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  animation: `ob-shimmer-none ${AUTO_INTERVAL}ms linear forwards`,
                  animationName: 'progress-bar-fill',
                }}
              />
            </div>
          )}

          {/* Text content */}
          <div style={{
            textAlign: 'center',
            marginBottom: 20,
            minHeight: 80,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h2
              key={`title-${current}`}
              style={{
                fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 800, color: '#0F172A',
                margin: '0 0 8px 0', lineHeight: 1.25,
                whiteSpace: 'pre-line',
                letterSpacing: '-0.4px',
                animation: 'ob-fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {slide.title}
            </h2>
            <p
              key={`desc-${current}`}
              style={{
                fontSize: 'clamp(12px, 3.2vw, 13.5px)', color: '#64748B', lineHeight: 1.55,
                margin: '0 auto', fontWeight: 400,
                maxWidth: 295,
                animation: 'ob-fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {slide.desc}
            </p>
          </div>

          {/* CTA Button with gradient */}
          <button
            className="ob-btn"
            onClick={handleNext}
            style={{
              width: '100%', height: 50,
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              color: '#ffffff', border: 'none',
              borderRadius: 25,
              fontSize: 15, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 6px 24px ${c1}50`,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              letterSpacing: '0.2px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer on button */}
            <span style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              animation: 'ob-shimmer 2.5s ease-in-out infinite',
              borderRadius: 25,
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>
              {isLast ? '🚀 Get Started' : `Next  →`}
            </span>
          </button>

          {/* Slide counter */}
          <div style={{
            marginTop: 12,
            fontSize: 11,
            color: '#94A3B8',
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}>
            {current + 1} / {slides.length}
          </div>

          {/* Home bar */}
          <div style={{
            width: 100, height: 4, background: '#0F172A',
            borderRadius: 2, opacity: 0.12,
            marginTop: 8,
          }} />
        </div>
      </div>

      {/* Progress bar fill keyframe (injected via style) */}
      <style>{`
        @keyframes progress-bar-fill {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
