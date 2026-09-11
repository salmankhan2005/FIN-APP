import React, { useState, useRef, useEffect } from 'react';

/* ─── Finova App-Themed 2D UI Mockups (Matching Application Design System) ─── */

/**
 * Slide 1: Smart Micro-Lending & Loan Contract UI
 */
const IllustrationFinance = () => (
  <svg viewBox="0 0 320 250" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="finCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="finBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EFF6FF" />
        <stop offset="100%" stopColor="#DBEAFE" />
      </linearGradient>
    </defs>

    {/* Soft backdrop */}
    <rect x="15" y="10" width="290" height="230" rx="24" fill="url(#finBgGrad)" opacity="0.6" />

    {/* Main Finova Loan Card */}
    <rect x="30" y="32" width="260" height="135" rx="18" fill="url(#finCardGrad)" style={{ filter: 'drop-shadow(0 10px 25px rgba(37,99,235,0.35))' }} />

    {/* Card Header */}
    <circle cx="56" cy="58" r="14" fill="rgba(255,255,255,0.2)" />
    <text x="56" y="63" textAnchor="middle" fontSize="14" fill="#FFFFFF" fontWeight="800">₹</text>
    <text x="78" y="55" fontSize="11" fill="rgba(255,255,255,0.75)" fontWeight="600">ACTIVE LOAN CONTRACT</text>
    <text x="78" y="68" fontSize="13" fill="#FFFFFF" fontWeight="800" letterSpacing="0.5">LN-2026-0042</text>

    {/* Status badge on card */}
    <rect x="222" y="48" width="54" height="20" rx="10" fill="rgba(16,185,129,0.25)" stroke="#34D399" strokeWidth="1" />
    <text x="249" y="62" textAnchor="middle" fontSize="9.5" fill="#A7F3D0" fontWeight="700">● ACTIVE</text>

    {/* Card Balance & Stats */}
    <text x="52" y="105" fontSize="10" fill="rgba(255,255,255,0.7)" fontWeight="500">Principal Disbursed</text>
    <text x="52" y="126" fontSize="20" fill="#FFFFFF" fontWeight="800">₹25,000</text>

    <text x="185" y="105" fontSize="10" fill="rgba(255,255,255,0.7)" fontWeight="500">Weekly EMI</text>
    <text x="185" y="126" fontSize="16" fill="#FDE047" fontWeight="800">₹1,250</text>

    {/* Card shine line */}
    <line x1="52" y1="145" x2="268" y2="145" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
    <text x="52" y="156" fontSize="8.5" fill="rgba(255,255,255,0.6)">Interest: 2.0% Flat  •  Tenure: 20 Weeks</text>

    {/* Floating Interest Recalculation Badge */}
    <g style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))' }}>
      <rect x="38" y="180" width="135" height="48" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="58" cy="204" r="12" fill="#ECFDF5" />
      <text x="58" y="209" textAnchor="middle" fontSize="12" fill="#059669">⚡</text>
      <text x="76" y="198" fontSize="8.5" fill="#64748B" fontWeight="600">PARTIAL PAYMENT</text>
      <text x="76" y="212" fontSize="11" fill="#0F172A" fontWeight="800">Auto Interest Drop</text>
    </g>

    {/* Floating Recovery Badge */}
    <g style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))' }}>
      <rect x="185" y="180" width="105" height="48" rx="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <text x="198" y="198" fontSize="8.5" fill="#64748B" fontWeight="600">RECOVERY RATE</text>
      <text x="198" y="214" fontSize="14" fill="#2563EB" fontWeight="800">98.5%</text>
      <rect x="198" y="218" width="78" height="4" rx="2" fill="#EFF6FF" />
      <rect x="198" y="218" width="68" height="4" rx="2" fill="#2563EB" />
    </g>
  </svg>
);

/**
 * Slide 2: Field Agent Collections & Route Tracking
 */
const IllustrationGrowth = () => (
  <svg viewBox="0 0 320 250" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="agentCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#065F46" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="agentBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F0FDF4" />
        <stop offset="100%" stopColor="#DCFCE7" />
      </linearGradient>
    </defs>

    {/* Soft backdrop */}
    <rect x="15" y="10" width="290" height="230" rx="24" fill="url(#agentBgGrad)" opacity="0.6" />

    {/* Daily Collection Metric Card */}
    <rect x="30" y="28" width="260" height="120" rx="18" fill="url(#agentCardGrad)" style={{ filter: 'drop-shadow(0 10px 25px rgba(5,150,105,0.3))' }} />

    {/* Header */}
    <text x="50" y="52" fontSize="10" fill="#A7F3D0" fontWeight="600" letterSpacing="0.5">TODAY'S FIELD COLLECTION</text>
    <text x="50" y="78" fontSize="22" fill="#FFFFFF" fontWeight="800">₹48,500</text>
    <rect x="198" y="40" width="74" height="22" rx="11" fill="rgba(255,255,255,0.18)" />
    <text x="235" y="55" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">✓ 38 Paid</text>

    {/* Progress Bar */}
    <text x="50" y="102" fontSize="9" fill="#D1FAE5">Target: ₹50,000 (97% Completed)</text>
    <rect x="50" y="110" width="220" height="8" rx="4" fill="rgba(0,0,0,0.2)" />
    <rect x="50" y="110" width="205" height="8" rx="4" fill="#34D399" />

    {/* Route & Map Collection Entry */}
    <g style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))' }}>
      <rect x="30" y="160" width="260" height="68" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      {/* Route Icon */}
      <circle cx="54" cy="194" r="16" fill="#EFF6FF" />
      <text x="54" y="200" textAnchor="middle" fontSize="16">🏍️</text>

      {/* Details */}
      <text x="78" y="186" fontSize="11" fill="#0F172A" fontWeight="700">Ward 4 - Gandhi Nagar Route</text>
      <text x="78" y="200" fontSize="9" fill="#64748B">Agent: Murugan S. • GPS Tracked</text>
      <text x="78" y="214" fontSize="9" fill="#059669" fontWeight="700">● 14 Nearby Dues Pending</text>

      {/* Action Button tag */}
      <rect x="224" y="180" width="54" height="26" rx="8" fill="#2563EB" />
      <text x="251" y="197" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="700">Map 📍</text>
    </g>
  </svg>
);

/**
 * Slide 3: Guarantor (Jamin) KYC & Aadhaar Verification
 */
const IllustrationKYC = () => (
  <svg viewBox="0 0 320 250" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="kycCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1E3A8A" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="kycBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#E2E8F0" />
      </linearGradient>
    </defs>

    <rect x="15" y="10" width="290" height="230" rx="24" fill="url(#kycBgGrad)" opacity="0.6" />

    {/* Customer KYC Profile Card */}
    <rect x="30" y="28" width="260" height="110" rx="18" fill="url(#kycCardGrad)" style={{ filter: 'drop-shadow(0 10px 25px rgba(30,58,138,0.3))' }} />

    {/* Avatar */}
    <circle cx="58" cy="62" r="18" fill="#DBEAFE" />
    <text x="58" y="68" textAnchor="middle" fontSize="18">👤</text>

    {/* Name and Phone */}
    <text x="86" y="55" fontSize="13" fill="#FFFFFF" fontWeight="800">R. Salman Khan</text>
    <text x="86" y="70" fontSize="10" fill="#BFDBFE">+91 93422 98949  •  Salem</text>

    {/* Verified badge */}
    <rect x="86" y="80" width="80" height="18" rx="6" fill="rgba(16,185,129,0.25)" />
    <text x="126" y="93" textAnchor="middle" fontSize="9" fill="#6EE7B7" fontWeight="700">✓ Aadhaar Verified</text>

    <rect x="174" y="80" width="70" height="18" rx="6" fill="rgba(255,255,255,0.15)" />
    <text x="209" y="93" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="600">GPS Pinned 📍</text>

    {/* Jamin (Guarantor) Card Highlight */}
    <g style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))' }}>
      <rect x="30" y="148" width="260" height="80" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Jamin Header */}
      <rect x="42" y="158" width="85" height="18" rx="6" fill="#FEF3C7" />
      <text x="84" y="171" textAnchor="middle" fontSize="9" fill="#B45309" fontWeight="800">🤝 GUARANTOR (ஜாமீன்)</text>

      <text x="42" y="194" fontSize="11" fill="#0F172A" fontWeight="700">K. Thouhith (Brother)</text>
      <text x="42" y="208" fontSize="9" fill="#64748B">Ph: 98421 XXXXX  •  Aadhaar: XXXX-8942</text>
      <text x="42" y="220" fontSize="8.5" fill="#059669" fontWeight="600">✓ Photo &amp; Digital Signature Uploaded</text>

      <circle cx="260" cy="188" r="16" fill="#ECFDF5" />
      <text x="260" y="193" textAnchor="middle" fontSize="14" fill="#059669">🛡️</text>
    </g>
  </svg>
);

/**
 * Slide 4: Digital Passbook & Excel Data Extraction
 */
const IllustrationReports = () => (
  <svg viewBox="0 0 320 250" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="repCardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="repBgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>

    <rect x="15" y="10" width="290" height="230" rx="24" fill="url(#repBgGrad)" opacity="0.6" />

    {/* Digital Passbook Receipt */}
    <rect x="30" y="26" width="260" height="116" rx="18" fill="url(#repCardGrad)" style={{ filter: 'drop-shadow(0 10px 25px rgba(15,23,42,0.35))' }} />

    <text x="50" y="48" fontSize="9" fill="#94A3B8" fontWeight="600" letterSpacing="0.5">INSTANT PAYMENT RECEIPT</text>
    <rect x="218" y="38" width="58" height="20" rx="10" fill="#059669" />
    <text x="247" y="52" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="700">✓ CASH</text>

    <text x="50" y="74" fontSize="18" fill="#34D399" fontWeight="800">₹2,000 RECEIVED</text>
    <text x="50" y="90" fontSize="9.5" fill="#E2E8F0">Loan #LN-0001 • Week 12 of 20</text>
    <text x="50" y="104" fontSize="8.5" fill="#94A3B8">Remaining Outstanding: ₹8,000</text>
    <text x="50" y="118" fontSize="8" fill="#64748B">Collected by Admin • Today 01:15 PM</text>

    {/* Excel Extraction Card Feature */}
    <g style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.08))' }}>
      <rect x="30" y="152" width="260" height="74" rx="16" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5" />
      
      <circle cx="54" cy="189" r="16" fill="#ECFDF5" />
      <text x="54" y="195" textAnchor="middle" fontSize="16">📊</text>

      <text x="78" y="176" fontSize="11" fill="#065F46" fontWeight="800">1-Click Full Excel (.xlsx) Extract</text>
      <text x="78" y="191" fontSize="9" fill="#64748B">Customers • Loans • Schedules • Collections</text>
      <text x="78" y="206" fontSize="8.5" fill="#059669" fontWeight="700">Color-Coded Headers &amp; Status Badges</text>

      <rect x="232" y="174" width="46" height="26" rx="8" fill="#059669" />
      <text x="255" y="191" textAnchor="middle" fontSize="9.5" fill="#FFFFFF" fontWeight="700">.XLSX</text>
    </g>
  </svg>
);

/* ─── Slide Definitions strictly matching Application Features & Colors ─── */
const slides = [
  {
    title: 'Smart Micro-Lending\n& Adaptive Loans',
    desc: 'Effortlessly create daily & weekly loans with automatic interest recalculation and instant balance tracking.',
    gradient: ['#2563EB', '#1D4ED8'],
    Illustration: IllustrationFinance,
    badge: 'LOAN MANAGEMENT',
  },
  {
    title: 'Field Collection &\nReal-Time GPS Route',
    desc: 'Empower agents with interactive map routes, instant door-to-door cash/UPI receipts, and live daily targets.',
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
    desc: 'Generate instant payment receipts, customer passbooks, and export color-coded Excel backups with 1 click.',
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
  const [c1, c2] = slide.gradient;

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
        @keyframes ob-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .ob-btn:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        .ob-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Mobile container matching App Layout */}
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
          maxHeight: '50vh',
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
                    padding: '0 4px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{
                    width: '100%',
                    maxWidth: 310,
                    animation: isActive ? 'ob-float 3.5s ease-in-out infinite' : 'none',
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
            marginBottom: 14,
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
            marginBottom: 18,
            minHeight: 84,
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

          {/* Primary Action Button (Matching App Primary Buttons) */}
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
            marginTop: 10,
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
