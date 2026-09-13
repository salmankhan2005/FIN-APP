import React from 'react';

/**
 * Premium 2D Vector Illustrations with smooth SVG animations
 */

// 1. Evening Cash Handover & Settlement Illustration
export function CashHandoverIllustration({ width = 160, height = 120, className = '' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={`vector-illustration ${className}`}>
      {/* Background Soft Glow */}
      <circle cx="100" cy="75" r="60" fill="url(#handover-glow)" opacity="0.4" />

      {/* Desk / Base Mat */}
      <ellipse cx="100" cy="120" rx="75" ry="14" fill="#E2E8F0" />
      <ellipse cx="100" cy="118" rx="65" ry="10" fill="#CBD5E1" opacity="0.6" />

      {/* Safe Vault / Cash Box */}
      <rect x="35" y="55" width="55" height="60" rx="8" fill="#1E293B" />
      <rect x="40" y="60" width="45" height="50" rx="6" fill="#334155" />
      <circle cx="62.5" cy="85" r="12" fill="#0F172A" stroke="#64748B" strokeWidth="2" />
      <circle cx="62.5" cy="85" r="4" fill="#38BDF8" />
      <line x1="62.5" y1="75" x2="62.5" y2="79" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="62.5" y1="91" x2="62.5" y2="95" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="52.5" y1="85" x2="56.5" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="68.5" y1="85" x2="72.5" y2="85" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* Stack of Banknotes */}
      <g className="animate-float-slow">
        {/* Note 3 */}
        <rect x="105" y="85" width="58" height="28" rx="4" fill="#059669" transform="rotate(-6 105 85)" />
        {/* Note 2 */}
        <rect x="108" y="75" width="58" height="28" rx="4" fill="#10B981" transform="rotate(3 108 75)" />
        {/* Note 1 (Top Note) */}
        <rect x="102" y="65" width="60" height="30" rx="4" fill="#34D399" />
        <circle cx="132" cy="80" r="7" fill="#059669" opacity="0.3" />
        <text x="132" y="83" fontSize="8" fontWeight="bold" fill="#064E3B" textAnchor="middle">₹</text>
        <rect x="106" y="70" width="8" height="6" rx="1" fill="#059669" opacity="0.4" />
        <rect x="150" y="85" width="8" height="6" rx="1" fill="#059669" opacity="0.4" />
      </g>

      {/* Floating Verification Shield Badge */}
      <g className="animate-float">
        <circle cx="102" cy="40" r="18" fill="#10B981" />
        <circle cx="102" cy="40" r="14" fill="#059669" />
        <path d="M96 40L100 44L108 36" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating Shiny Coins */}
      <circle cx="168" cy="55" r="8" fill="#F59E0B" className="animate-pulse-glow" />
      <circle cx="168" cy="55" r="6" fill="#FBBF24" />
      <text x="168" y="58" fontSize="7" fontWeight="bold" fill="#78350F" textAnchor="middle">₹</text>

      <circle cx="38" cy="42" r="6" fill="#F59E0B" className="animate-pulse-glow" />
      <circle cx="38" cy="42" r="4.5" fill="#FBBF24" />

      {/* Gradients */}
      <defs>
        <radialGradient id="handover-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 75) rotate(90) scale(60)">
          <stop stopColor="#10B981" stopOpacity="0.4" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// 2. Day Book & Daily Cash Ledger Illustration
export function DayBookIllustration({ width = 160, height = 120, className = '' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={`vector-illustration ${className}`}>
      {/* Background Soft Glow */}
      <circle cx="100" cy="75" r="65" fill="url(#daybook-glow)" opacity="0.35" />

      {/* Shadow */}
      <ellipse cx="100" cy="122" rx="70" ry="12" fill="#E2E8F0" />

      {/* Main Ledger Book */}
      <g className="animate-float-subtle">
        {/* Left Book Page */}
        <path d="M40 45C55 42 85 45 98 52V115C85 108 55 105 40 108V45Z" fill="#F8FAFC" stroke="#6366F1" strokeWidth="2" />
        {/* Book Spine */}
        <path d="M98 52C99 51.5 101 51.5 102 52V115C101 114.5 99 114.5 98 115V52Z" fill="#4338CA" />
        {/* Right Book Page */}
        <path d="M160 45C145 42 115 45 102 52V115C115 108 145 105 160 108V45Z" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />

        {/* Ledger Page Lines (Inflow & Outflow Columns) */}
        <line x1="50" y1="60" x2="88" y2="62" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
        <line x1="50" y1="72" x2="82" y2="74" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="84" x2="85" y2="86" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="96" x2="78" y2="98" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />

        <line x1="112" y1="62" x2="150" y2="60" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        <line x1="112" y1="74" x2="144" y2="72" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="86" x2="146" y2="84" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="112" y1="98" x2="140" y2="96" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />

        {/* Bookmark Ribbon */}
        <path d="M100 52V122L105 118L110 122V52H100Z" fill="#EC4899" />
      </g>

      {/* Floating Calculator & Coin */}
      <g className="animate-float">
        <rect x="140" y="28" width="34" height="46" rx="6" fill="#1E293B" />
        <rect x="145" y="34" width="24" height="10" rx="2" fill="#0EA5E9" opacity="0.3" />
        <circle cx="150" cy="52" r="2" fill="#94A3B8" />
        <circle cx="157" cy="52" r="2" fill="#94A3B8" />
        <circle cx="164" cy="52" r="2" fill="#94A3B8" />
        <circle cx="150" cy="60" r="2" fill="#94A3B8" />
        <circle cx="157" cy="60" r="2" fill="#94A3B8" />
        <circle cx="164" cy="60" r="2" fill="#10B981" />
      </g>

      {/* Floating Coin Inflow / Outflow */}
      <circle cx="34" cy="38" r="9" fill="#F59E0B" className="animate-pulse-glow" />
      <circle cx="34" cy="38" r="7" fill="#FBBF24" />
      <text x="34" y="41" fontSize="8" fontWeight="bold" fill="#78350F" textAnchor="middle">₹</text>

      <defs>
        <radialGradient id="daybook-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 75) rotate(90) scale(65)">
          <stop stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="1" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// 3. Top-Up Loan & Renewal Rollover Illustration
export function TopUpIllustration({ width = 120, height = 90, className = '' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={`vector-illustration ${className}`}>
      {/* Background Glow */}
      <circle cx="80" cy="60" r="50" fill="url(#topup-glow)" opacity="0.3" />

      {/* Circular Rollover Arrow */}
      <path
        d="M50 70C42 55 52 35 72 32C92 29 110 42 114 62C118 80 102 96 84 96C70 96 60 88 56 78"
        stroke="#4F46E5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="6 4"
      />
      <path d="M48 78L56 70L64 78" fill="#4F46E5" />

      {/* Rocket / Fresh Growth Emblem */}
      <g className="animate-float">
        <circle cx="82" cy="58" r="22" fill="#4F46E5" />
        <circle cx="82" cy="58" r="18" fill="#6366F1" />
        {/* Upward Growth Arrow */}
        <path d="M82 46V70M82 46L74 54M82 46L90 54" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Sparkles */}
      <circle cx="125" cy="35" r="5" fill="#F59E0B" className="animate-pulse-glow" />
      <circle cx="35" cy="85" r="4" fill="#10B981" />

      <defs>
        <radialGradient id="topup-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 60) rotate(90) scale(50)">
          <stop stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// 4. Empty State / Zero Records Illustration
export function EmptyRecordsIllustration({ width = 140, height = 100, className = '' }) {
  return (
    <svg width={width} height={height} viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={`vector-illustration ${className}`}>
      <ellipse cx="80" cy="98" rx="50" ry="8" fill="#F1F5F9" />
      <rect x="52" y="35" width="56" height="60" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="62" y="46" width="36" height="4" rx="2" fill="#E2E8F0" />
      <rect x="62" y="56" width="28" height="4" rx="2" fill="#E2E8F0" />
      <rect x="62" y="66" width="32" height="4" rx="2" fill="#E2E8F0" />
      
      {/* Magnifier Glass */}
      <g className="animate-float">
        <circle cx="102" cy="72" r="14" fill="white" stroke="#6366F1" strokeWidth="2.5" />
        <circle cx="102" cy="72" r="10" fill="#EEF2FF" />
        <line x1="112" y1="82" x2="122" y2="92" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="70" r="3" fill="#6366F1" opacity="0.6" />
      </g>
    </svg>
  );
}
