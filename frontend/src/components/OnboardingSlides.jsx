import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'Manage Finance',
    highlight: 'Made Simple',
    desc: 'A complete platform for agents and customers to manage finances, collections and repayments.',
    emoji: '📊',
    color: '#2563eb',
    bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    illustration: (
      <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Dashboard card */}
        <rect x="20" y="20" width="180" height="140" rx="16" fill="white" opacity="0.9"/>
        <rect x="20" y="20" width="180" height="140" rx="16" stroke="#dbeafe" strokeWidth="1.5"/>
        {/* Header bar */}
        <rect x="32" y="32" width="80" height="10" rx="5" fill="#bfdbfe"/>
        <rect x="32" y="48" width="50" height="8" rx="4" fill="#93c5fd"/>
        {/* Big number */}
        <text x="32" y="78" fontSize="22" fontWeight="800" fill="#1d4ed8">₹2,45,000</text>
        <text x="32" y="92" fontSize="9" fill="#64748b">Total Portfolio</text>
        {/* Bar chart */}
        <rect x="32" y="105" width="14" height="30" rx="4" fill="#3b82f6"/>
        <rect x="52" y="115" width="14" height="20" rx="4" fill="#93c5fd"/>
        <rect x="72" y="100" width="14" height="35" rx="4" fill="#1d4ed8"/>
        <rect x="92" y="110" width="14" height="25" rx="4" fill="#3b82f6"/>
        <rect x="112" y="95" width="14" height="40" rx="4" fill="#2563eb"/>
        {/* Arrow up */}
        <path d="M155 75 L170 55 L185 65" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="185" cy="65" r="5" fill="#10b981"/>
        {/* Trend line */}
        <path d="M140 120 Q160 95 185 85" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" opacity="0.6"/>
      </svg>
    ),
  },
  {
    title: 'Track Every',
    highlight: 'Collection',
    desc: 'Field agents get GPS-mapped daily routes and can record payments on the spot, in real time.',
    emoji: '🗺️',
    color: '#059669',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
    illustration: (
      <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Map background */}
        <rect x="20" y="20" width="180" height="140" rx="16" fill="white" opacity="0.9"/>
        {/* Road lines */}
        <path d="M60 160 Q110 100 160 60" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round"/>
        <path d="M60 160 Q110 100 160 60" stroke="white" strokeWidth="18" strokeLinecap="round" strokeDasharray="12 8"/>
        {/* Location pins */}
        <circle cx="70" cy="148" r="10" fill="#10b981"/>
        <text x="65" y="153" fontSize="10" fill="white">A</text>
        <circle cx="110" cy="102" r="10" fill="#3b82f6"/>
        <text x="105" y="107" fontSize="10" fill="white">B</text>
        <circle cx="155" cy="65" r="10" fill="#f59e0b"/>
        <text x="150" y="70" fontSize="10" fill="white">C</text>
        {/* Bike icon */}
        <text x="97" y="122" fontSize="18">🏍️</text>
        {/* Checkmarks */}
        <circle cx="175" cy="120" r="14" fill="#d1fae5"/>
        <path d="M169 120 L173 124 L181 116" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Your Loans',
    highlight: 'At a Glance',
    desc: 'Customers can view loan balances, upcoming installments, payment history, and receipts anytime.',
    emoji: '📱',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    illustration: (
      <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Phone frame */}
        <rect x="70" y="15" width="80" height="150" rx="14" fill="#1e1b4b"/>
        <rect x="75" y="25" width="70" height="130" rx="10" fill="white"/>
        {/* Screen content */}
        <rect x="80" y="32" width="60" height="8" rx="4" fill="#ede9fe"/>
        <text x="85" y="52" fontSize="7" fill="#64748b">Outstanding</text>
        <text x="83" y="63" fontSize="11" fontWeight="800" fill="#7c3aed">₹12,500</text>
        {/* Progress bar */}
        <rect x="80" y="68" width="60" height="4" rx="2" fill="#ede9fe"/>
        <rect x="80" y="68" width="36" height="4" rx="2" fill="#7c3aed"/>
        <text x="80" y="80" fontSize="6" fill="#94a3b8">60% paid</text>
        {/* Installment rows */}
        <rect x="80" y="86" width="60" height="14" rx="4" fill="#f5f3ff"/>
        <rect x="80" y="104" width="60" height="14" rx="4" fill="#f5f3ff"/>
        <rect x="80" y="122" width="60" height="14" rx="4" fill="#d1fae5"/>
        <circle cx="91" cy="93" r="4" fill="#c4b5fd"/>
        <circle cx="91" cy="111" r="4" fill="#c4b5fd"/>
        <circle cx="91" cy="129" r="4" fill="#10b981"/>
        <rect x="99" y="90" width="30" height="3" rx="2" fill="#ddd8fe"/>
        <rect x="99" y="95" width="20" height="3" rx="2" fill="#ede9fe"/>
        <rect x="99" y="108" width="30" height="3" rx="2" fill="#ddd8fe"/>
        <rect x="99" y="113" width="20" height="3" rx="2" fill="#ede9fe"/>
        <rect x="99" y="126" width="30" height="3" rx="2" fill="#a7f3d0"/>
        <rect x="99" y="131" width="20" height="3" rx="2" fill="#d1fae5"/>
      </svg>
    ),
  },
];

export default function OnboardingSlides({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const touchStartX = useRef(null);

  const goTo = (idx, dir = 'next') => {
    setAnimDir(dir);
    setTimeout(() => {
      setCurrent(idx);
      setAnimDir(null);
    }, 250);
  };

  const handleNext = () => {
    if (current < slides.length - 1) goTo(current + 1, 'next');
    else onFinish();
  };

  const handleSkip = () => onFinish();

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < slides.length - 1) goTo(current + 1, 'next');
      else if (diff < 0 && current > 0) goTo(current - 1, 'prev');
    }
    touchStartX.current = null;
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: slide.bg, transition: 'background 0.4s ease',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '52px 28px 0' }}>
        {!isLast && (
          <button onClick={handleSkip} style={{
            background: 'rgba(0,0,0,0.06)', border: 'none',
            borderRadius: 20, padding: '6px 16px',
            fontSize: 13, fontWeight: 600, color: '#64748b',
            cursor: 'pointer',
          }}>
            Skip
          </button>
        )}
      </div>

      {/* Illustration */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 40px 0',
        opacity: animDir ? 0 : 1,
        transform: animDir === 'next' ? 'translateX(-30px)' : animDir === 'prev' ? 'translateX(30px)' : 'translateX(0)',
        transition: 'all 0.25s ease',
      }}>
        <div style={{ width: '100%', maxWidth: 280, aspectRatio: '4/3' }}>
          {slide.illustration}
        </div>
      </div>

      {/* Text + Controls */}
      <div style={{
        background: 'white',
        borderRadius: '32px 32px 0 0',
        padding: '36px 32px 48px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
        opacity: animDir ? 0 : 1,
        transform: animDir ? 'translateY(10px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
      }}>
        {/* Heading */}
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: '#0f172a',
          margin: '0 0 6px 0', lineHeight: 1.2,
        }}>
          {slide.title}{' '}
          <span style={{ color: slide.color }}>{slide.highlight}</span>
        </h2>
        <p style={{
          fontSize: 15, color: '#64748b', lineHeight: 1.65,
          margin: '0 0 32px 0', fontWeight: 400,
        }}>
          {slide.desc}
        </p>

        {/* Dots + Button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Pagination dots */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8, borderRadius: 4, border: 'none',
                  background: i === current ? slide.color : '#e2e8f0',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNext}
            style={{
              background: slide.color,
              color: 'white', border: 'none',
              borderRadius: 50, padding: '14px 28px',
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${slide.color}44`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span>{isLast ? 'Get Started' : 'Next'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
