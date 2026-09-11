import React, { useState, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   2D Lottie-Style Animated Vector Illustrations (Finova Color Theme)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Slide 1: Smart Micro-Lending & Instant Loan Disbursal (2D Motion Scene)
 */
const IllustrationFinance = () => (
  <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="s1Card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="s1GoldCoin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="s1Glow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
      </linearGradient>
    </defs>

    {/* Ambient radial glow */}
    <circle cx="170" cy="130" r="115" fill="url(#s1Glow)" />

    {/* 2D Floating Loan Approval Document */}
    <g style={{ filter: 'drop-shadow(0 8px 20px rgba(15,23,42,0.12))' }}>
      <rect x="25" y="45" width="105" height="135" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      {/* Doc header */}
      <rect x="37" y="58" width="55" height="7" rx="3.5" fill="#2563EB" />
      <rect x="37" y="70" width="80" height="4" rx="2" fill="#E2E8F0" />
      <rect x="37" y="78" width="65" height="4" rx="2" fill="#E2E8F0" />
      <rect x="37" y="86" width="72" height="4" rx="2" fill="#E2E8F0" />

      {/* Checkmark Stamp */}
      <circle cx="95" cy="140" r="15" fill="#DCFCE7" stroke="#10B981" strokeWidth="1.5" />
      <path d="M89 140 L93 144 L101 135" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="37" y="145" fontSize="8" fill="#15803D" fontWeight="800">APPROVED</text>
    </g>

    {/* Main Finova Active Loan Card */}
    <g style={{ filter: 'drop-shadow(0 12px 28px rgba(37,99,235,0.38))' }}>
      <rect x="95" y="32" width="220" height="130" rx="18" fill="url(#s1Card)" />

      {/* Top Card Details */}
      <circle cx="120" cy="54" r="12" fill="rgba(255,255,255,0.2)" />
      <text x="120" y="58.5" textAnchor="middle" fontSize="12" fill="#FFFFFF" fontWeight="800">₹</text>
      <text x="138" y="52" fontSize="9.5" fill="rgba(255,255,255,0.75)" fontWeight="600">SMART LOAN</text>
      <text x="138" y="63" fontSize="11" fill="#FFFFFF" fontWeight="800">LN-2026-0042</text>

      {/* Active Status Badge */}
      <rect x="250" y="44" width="52" height="18" rx="9" fill="rgba(16,185,129,0.3)" stroke="#34D399" strokeWidth="1" />
      <text x="276" y="56" textAnchor="middle" fontSize="8.5" fill="#A7F3D0" fontWeight="700">● ACTIVE</text>

      {/* Balance Figures */}
      <text x="116" y="94" fontSize="9" fill="rgba(255,255,255,0.7)" fontWeight="500">Principal Amount</text>
      <text x="116" y="114" fontSize="18" fill="#FFFFFF" fontWeight="800">₹25,000</text>

      <text x="225" y="94" fontSize="9" fill="rgba(255,255,255,0.7)" fontWeight="500">Weekly Due</text>
      <text x="225" y="114" fontSize="15" fill="#FDE047" fontWeight="800">₹1,250</text>

      {/* Footer Info */}
      <line x1="116" y1="128" x2="295" y2="128" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
      <text x="116" y="141" fontSize="8" fill="rgba(255,255,255,0.7)">Interest: 2% Flat  •  Partial Principal Drop</text>
    </g>

    {/* Animated Floating Golden Coin 1 */}
    <g className="anim-coin-1" style={{ filter: 'drop-shadow(0 4px 10px rgba(245,158,11,0.45))' }}>
      <circle cx="285" cy="180" r="18" fill="url(#s1GoldCoin)" />
      <circle cx="285" cy="180" r="14" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
      <text x="285" y="186" textAnchor="middle" fontSize="16" fill="#78350F" fontWeight="900">₹</text>
    </g>

    {/* Floating Feature Badge (Adaptive Interest) */}
    <g style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.08))' }}>
      <rect x="35" y="195" width="225" height="46" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
      <circle cx="58" cy="218" r="13" fill="#EFF6FF" />
      <text x="58" y="223" textAnchor="middle" fontSize="14">⚡</text>
      <text x="78" y="212" fontSize="10.5" fill="#0F172A" fontWeight="800">Automatic Interest Recalculation</text>
      <text x="78" y="225" fontSize="8.5" fill="#059669" fontWeight="600">Principal reduces interest weekly</text>
    </g>
  </svg>
);

/**
 * Slide 2: Field Agent GPS Collections & Route Tracking (2D Motion Scene)
 */
const IllustrationGrowth = () => (
  <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="s2GreenCard" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="s2Road" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="50%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>

    {/* Daily Target Progress Card */}
    <g style={{ filter: 'drop-shadow(0 10px 25px rgba(5,150,105,0.32))' }}>
      <rect x="25" y="24" width="290" height="95" rx="18" fill="url(#s2GreenCard)" />
      <text x="45" y="46" fontSize="9.5" fill="#A7F3D0" fontWeight="700" letterSpacing="0.6">TODAY'S FIELD COLLECTION</text>
      <text x="45" y="72" fontSize="22" fill="#FFFFFF" fontWeight="800">₹48,500</text>
      
      <rect x="228" y="36" width="70" height="22" rx="11" fill="rgba(255,255,255,0.2)" />
      <text x="263" y="50.5" textAnchor="middle" fontSize="9.5" fill="#FFFFFF" fontWeight="700">✓ 38 Collected</text>

      {/* Progress Bar */}
      <text x="45" y="93" fontSize="8.5" fill="#D1FAE5">Target: ₹50,000 (97% Completed)</text>
      <rect x="45" y="100" width="250" height="7" rx="3.5" fill="rgba(0,0,0,0.25)" />
      <rect x="45" y="100" width="235" height="7" rx="3.5" fill="#34D399" />
    </g>

    {/* 2D Interactive Route Map Scene */}
    <g style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.07))' }}>
      <rect x="25" y="132" width="290" height="108" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />

      {/* Curved Road Track */}
      <path d="M45 200 C90 160, 140 220, 200 175 C230 150, 270 170, 295 160"
        stroke="#93C5FD" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M45 200 C90 160, 140 220, 200 175 C230 150, 270 170, 295 160"
        stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" fill="none" />

      {/* Agent Vehicle Icon (Animated) */}
      <g className="anim-bike" transform="translate(125, 170)">
        <circle cx="0" cy="0" r="16" fill="#2563EB" style={{ filter: 'drop-shadow(0 4px 8px rgba(37,99,235,0.4))' }} />
        <text x="0" y="5" textAnchor="middle" fontSize="15">🏍️</text>
      </g>

      {/* Destination Pin 1 */}
      <g transform="translate(50, 195)">
        <circle cx="0" cy="0" r="10" fill="#10B981" />
        <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontWeight="800">✓</text>
      </g>

      {/* Active Destination Radar Pin (Animated) */}
      <g className="anim-radar" transform="translate(285, 155)">
        <circle cx="0" cy="0" r="16" fill="#EF4444" opacity="0.2" className="anim-pulse-ring" />
        <circle cx="0" cy="0" r="10" fill="#EF4444" />
        <text x="0" y="3.5" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="800">📍</text>
      </g>

      {/* Route Badge Description */}
      <rect x="38" y="142" width="165" height="20" rx="6" fill="#EFF6FF" />
      <text x="44" y="155.5" fontSize="8.5" fill="#1E40AF" fontWeight="700">Ward 4 Route • 14 Doorstep Dues</text>
    </g>
  </svg>
);

/**
 * Slide 3: Guarantor (Jamin) KYC & Biometric Security (2D Motion Scene)
 */
const IllustrationKYC = () => (
  <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="s3KycCard" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>

    {/* Customer KYC Card */}
    <g style={{ filter: 'drop-shadow(0 10px 25px rgba(30,58,138,0.3))' }}>
      <rect x="25" y="24" width="290" height="98" rx="18" fill="url(#s3KycCard)" />

      {/* Avatar */}
      <circle cx="60" cy="58" r="20" fill="#DBEAFE" />
      <text x="60" y="65" textAnchor="middle" fontSize="20">👤</text>

      {/* Customer Info */}
      <text x="92" y="50" fontSize="13.5" fill="#FFFFFF" fontWeight="800">R. Salman Khan</text>
      <text x="92" y="66" fontSize="10" fill="#BFDBFE">+91 93422 98949  •  Salem City</text>

      {/* Badges */}
      <rect x="92" y="76" width="86" height="18" rx="6" fill="rgba(16,185,129,0.25)" />
      <text x="135" y="88.5" textAnchor="middle" fontSize="9" fill="#6EE7B7" fontWeight="700">✓ Aadhaar Verified</text>

      <rect x="184" y="76" width="70" height="18" rx="6" fill="rgba(255,255,255,0.15)" />
      <text x="219" y="88.5" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="600">GPS Pinned 📍</text>
    </g>

    {/* Connecting Security Node Line */}
    <path d="M170 122 L170 134" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 3" />

    {/* Guarantor (Jamin) Verification Card */}
    <g style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.08))' }}>
      <rect x="25" y="134" width="290" height="104" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />

      {/* Jamin Tag */}
      <rect x="40" y="145" width="125" height="20" rx="6" fill="#FEF3C7" />
      <text x="46" y="158.5" fontSize="9" fill="#B45309" fontWeight="800">🤝 GUARANTOR (ஜாமீன்) KYC</text>

      <text x="40" y="180" fontSize="12" fill="#0F172A" fontWeight="800">K. Thouhith Khan (Brother)</text>
      <text x="40" y="195" fontSize="9.5" fill="#64748B">Aadhaar: XXXX-XXXX-8942  •  Phone Verified</text>
      <text x="40" y="210" fontSize="9" fill="#059669" fontWeight="700">✓ Photo ID &amp; Digital Signature Uploaded</text>

      {/* Security Shield Icon (Animated) */}
      <g className="anim-shield" transform="translate(270, 182)">
        <circle cx="0" cy="0" r="18" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
        <text x="0" y="6" textAnchor="middle" fontSize="16">🛡️</text>
      </g>
    </g>
  </svg>
);

/**
 * Slide 4: Digital Passbook, Instant Receipts & Excel Extraction (2D Motion Scene)
 */
const IllustrationReports = () => (
  <svg viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="s4NavyCard" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
    </defs>

    {/* Instant Digital Receipt Card */}
    <g style={{ filter: 'drop-shadow(0 10px 25px rgba(15,23,42,0.32))' }}>
      <rect x="25" y="24" width="290" height="106" rx="18" fill="url(#s4NavyCard)" />

      <text x="45" y="46" fontSize="9" fill="#94A3B8" fontWeight="600" letterSpacing="0.6">DIGITAL COLLECTION RECEIPT</text>
      <rect x="235" y="35" width="62" height="20" rx="10" fill="#059669" />
      <text x="266" y="48.5" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="700">✓ CASH</text>

      <text x="45" y="74" fontSize="20" fill="#34D399" fontWeight="800">₹2,000 RECEIVED</text>
      <text x="45" y="90" fontSize="9.5" fill="#E2E8F0">Loan #LN-0001 • Week 12 of 20 (₹8,000 Bal)</text>
      <text x="45" y="104" fontSize="8.5" fill="#64748B">Instant WhatsApp SMS Alert Sent 📲</text>
    </g>

    {/* Master Excel Export Card */}
    <g style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.08))' }}>
      <rect x="25" y="142" width="290" height="98" rx="16" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.8" />

      <circle cx="52" cy="180" r="16" fill="#ECFDF5" />
      <text x="52" y="186" textAnchor="middle" fontSize="16">📊</text>

      <text x="76" y="168" fontSize="11.5" fill="#065F46" fontWeight="800">1-Click Master Excel (.xlsx) Export</text>
      <text x="76" y="183" fontSize="9.5" fill="#475569">6 Color-Coded Sheets With Live Balances</text>

      {/* Sheet Pills */}
      <rect x="76" y="194" width="56" height="18" rx="5" fill="#EFF6FF" />
      <text x="104" y="206" textAnchor="middle" fontSize="8" fill="#2563EB" fontWeight="700">Customers</text>

      <rect x="136" y="194" width="44" height="18" rx="5" fill="#FAF5FF" />
      <text x="158" y="206" textAnchor="middle" fontSize="8" fill="#7C3AED" fontWeight="700">Loans</text>

      <rect x="184" y="194" width="56" height="18" rx="5" fill="#FFFBEB" />
      <text x="212" y="206" textAnchor="middle" fontSize="8" fill="#D97706" fontWeight="700">Schedules</text>

      <rect x="244" y="194" width="54" height="18" rx="5" fill="#ECFDF5" />
      <text x="271" y="206" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="700">Payments</text>
    </g>
  </svg>
);

/* ─── Slide Definitions Matching App Workflow ─── */
const slides = [
  {
    title: 'Smart Micro-Lending\n& Adaptive Loans',
    desc: 'Create daily & weekly loans with automatic interest recalculation and instant principal drop tracking.',
    gradient: ['#2563EB', '#1D4ED8'],
    Illustration: IllustrationFinance,
    badge: 'LOAN MANAGEMENT',
  },
  {
    title: 'Field Collection &\nReal-Time GPS Route',
    desc: 'Empower field agents with interactive map routes, instant door-to-door cash/UPI receipts, and live targets.',
    gradient: ['#059669', '#047857'],
    Illustration: IllustrationGrowth,
    badge: 'FIELD COLLECTIONS',
  },
  {
    title: 'Guarantor (Jamin) KYC\n& ID Verification',
    desc: 'Protect every loan with complete guarantor (ஜாமீன்) records, Aadhaar photo uploads, and location pinning.',
    gradient: ['#1E40AF', '#2563EB'],
    Illustration: IllustrationKYC,
    badge: 'GUARANTOR & KYC',
  },
  {
    title: 'Digital Passbook &\nExcel Sheet Extracts',
    desc: 'Generate instant payment receipts, digital passbooks, and export color-coded multi-sheet Excel reports with 1 click.',
    gradient: ['#0F172A', '#1E293B'],
    Illustration: IllustrationReports,
    badge: 'DATA EXPORTS & REPORTS',
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

  /* Auto-advance timer */
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
    >
      <style>{`
        @keyframes ob-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes animCoinBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-7px) scale(1.04); }
        }
        @keyframes animBikeRide {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes animShieldPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
        @keyframes animPulseRing {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .anim-coin-1 {
          animation: animCoinBounce 3s ease-in-out infinite;
          transform-origin: center;
        }
        .anim-bike {
          animation: animBikeRide 1.8s ease-in-out infinite;
        }
        .anim-shield {
          animation: animShieldPulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .anim-pulse-ring {
          animation: animPulseRing 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          transform-origin: center;
        }
        .ob-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .ob-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Mobile-sized container matching App Card System */}
      <div
        style={{
          width: '100%', maxWidth: 430, height: '100%',
          background: '#ffffff',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px 20px 20px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(0,0,0,0.06)',
          borderLeft: '1px solid rgba(0,0,0,0.05)',
          borderRight: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {/* Top App Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          height: 42, flexShrink: 0, zIndex: 10,
        }}>
          {/* Logo brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
            }}>
              <span style={{ fontSize: 16, color: 'white', fontWeight: 800 }}>₹</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>Finova</div>
              <div style={{ fontSize: 9.5, color: '#64748B', fontWeight: 500 }}>Smart Micro-Finance</div>
            </div>
          </div>

          {!isLast ? (
            <button
              onClick={onFinish}
              style={{
                background: '#F1F5F9', border: 'none',
                borderRadius: 20, padding: '6px 16px',
                fontSize: 12.5, fontWeight: 600, color: '#64748B',
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
            >
              Skip
            </button>
          ) : (
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#10B981',
              background: '#ECFDF5', padding: '4px 10px', borderRadius: 12,
            }}>
              Ready
            </div>
          )}
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
          display: 'flex',
          alignItems: 'center',
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
              transition: isDragging ? 'none' : 'transform 0.48s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            {slides.map((s, idx) => {
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
                    padding: '0 4px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    width: '100%',
                    maxWidth: 325,
                    zIndex: 2,
                  }}>
                    <Illus />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Area */}
        <div style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          zIndex: 5,
        }}>

          {/* Dot Indicators */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginBottom: 12,
          }}>
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => { clearInterval(autoRef.current); goTo(i); setPaused(false); }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 26 : 7,
                  height: 7, borderRadius: 4, border: 'none', padding: 0,
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
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.8px',
              color: '#2563EB',
              background: '#EFF6FF',
              padding: '3px 10px',
              borderRadius: 6,
              marginBottom: 8,
              border: '1px solid #DBEAFE',
              animation: 'ob-fadeUp 0.3s ease',
            }}
          >
            {slide.badge}
          </div>

          {/* Text Content */}
          <div style={{
            textAlign: 'center',
            marginBottom: 16,
            minHeight: 82,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <h2
              key={`title-${current}`}
              style={{
                fontSize: 'clamp(18px, 4.8vw, 21px)', fontWeight: 800, color: '#0F172A',
                margin: '0 0 6px 0', lineHeight: 1.25,
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
                fontSize: 'clamp(12px, 3.2vw, 13px)', color: '#64748B', lineHeight: 1.5,
                margin: '0 auto', fontWeight: 400,
                maxWidth: 300,
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
              width: '100%', height: 48,
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: '#ffffff', border: 'none',
              borderRadius: 14,
              fontSize: 14.5, fontWeight: 700,
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
            marginTop: 8,
            fontSize: 10.5,
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
