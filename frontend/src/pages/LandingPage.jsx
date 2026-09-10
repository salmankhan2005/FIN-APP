import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Smartphone, Zap, MapPin, 
  TrendingUp, Users, CheckCircle2, ChevronRight, Calculator, 
  BarChart3, MessageSquare, DollarSign, Calendar, Lock, Award, 
  Sparkles, RefreshCw, UserCheck, ChevronDown, Check, SmartphoneCharging
} from 'lucide-react';

export default function LandingPage({ onOpenLogin }) {
  // Interactive Calculator State
  const [calcPrincipal, setCalcPrincipal] = useState(25000);
  const [calcRate, setCalcRate] = useState(2); // 2% per month
  const [simulatePartial, setSimulatePartial] = useState(true);
  const [partialAmount, setPartialAmount] = useState(10000);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ADMIN' | 'AGENT' | 'CUSTOMER'
  const [activeAccordion, setActiveAccordion] = useState(null);

  // Calculations
  const periodInterestInitial = Math.round(calcPrincipal * (calcRate / 100));
  const newOutstanding = simulatePartial ? Math.max(0, calcPrincipal - partialAmount) : calcPrincipal;
  const newPeriodInterest = Math.round(newOutstanding * (calcRate / 100));
  const interestSaved = periodInterestInitial - newPeriodInterest;

  const quickAmounts = [10000, 25000, 50000, 100000];

  return (
    <div className="mobile-landing-wrapper">
      <div className="mobile-landing-container">
        
        {/* ─── Top App Bar ────────────────────────────────────────────── */}
        <header className="mobile-appbar">
          <div className="mobile-appbar-brand">
            <div className="mobile-brand-icon-wrap">
              <img src="/logo-icon.png" alt="Finova" className="mobile-brand-icon" />
              <div className="mobile-brand-pulse" />
            </div>
            <div>
              <div className="mobile-brand-title">Finova</div>
              <div className="mobile-brand-sub">Smart Micro-Finance</div>
            </div>
          </div>

          <button 
            type="button"
            onClick={onOpenLogin}
            className="mobile-appbar-login-btn"
          >
            <span>Sign In</span>
            <ChevronRight size={15} />
          </button>
        </header>

        {/* ─── Mobile Hero Section ────────────────────────────────────── */}
        <section className="mobile-hero-card">
          <div className="mobile-hero-badge">
            <Sparkles size={13} className="text-emerald-400" />
            <span>Next-Gen Micro-Lending OS</span>
          </div>

          <h1 className="mobile-hero-heading">
            Lending Made Simple. <br />
            <span className="mobile-hero-gradient">Interest That Adapts.</span>
          </h1>

          <p className="mobile-hero-desc">
            The smart micro-finance platform built for field collections, instant guarantor KYC, and automatic partial payment interest reduction.
          </p>

          {/* Quick Stats Grid */}
          <div className="mobile-hero-stats">
            <div className="mobile-stat-box">
              <div className="mobile-stat-value">₹14.5L+</div>
              <div className="mobile-stat-label">Disbursed</div>
            </div>
            <div className="mobile-stat-divider" />
            <div className="mobile-stat-box">
              <div className="mobile-stat-value">98.8%</div>
              <div className="mobile-stat-label">Collection Rate</div>
            </div>
            <div className="mobile-stat-divider" />
            <div className="mobile-stat-box">
              <div className="mobile-stat-value">Instant</div>
              <div className="mobile-stat-label">Recalculation</div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            type="button"
            onClick={onOpenLogin}
            className="mobile-primary-cta"
          >
            <span>Launch App Portal</span>
            <ArrowRight size={18} />
          </button>
        </section>

        {/* ─── Interactive Partial Payment Calculator (Mobile-First) ──── */}
        <section className="mobile-section-card">
          <div className="mobile-section-header">
            <div className="mobile-section-icon bg-emerald-500/10 text-emerald-400">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="mobile-section-title">Live Interest Simulator</h2>
              <p className="mobile-section-subtitle">See how partial payments drop future interest</p>
            </div>
          </div>

          <div className="mobile-calc-body">
            {/* Principal Presets */}
            <div className="mobile-field-group">
              <div className="mobile-field-top">
                <label>Loan Principal</label>
                <span className="mobile-field-highlight">₹{calcPrincipal.toLocaleString('en-IN')}</span>
              </div>
              <div className="mobile-chips-row">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcPrincipal(amt)}
                    className={`mobile-chip ${calcPrincipal === amt ? 'mobile-chip-active' : ''}`}
                  >
                    ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                  </button>
                ))}
              </div>
              <input 
                type="range" 
                min="5000" 
                max="200000" 
                step="5000"
                value={calcPrincipal}
                onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                className="mobile-slider"
              />
            </div>

            {/* Interest Rate Selector */}
            <div className="mobile-field-group">
              <div className="mobile-field-top">
                <label>Interest Rate (% per month)</label>
                <span className="mobile-field-highlight">{calcRate}% / mo</span>
              </div>
              <div className="mobile-chips-row">
                {[1.5, 2.0, 2.5, 3.0].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCalcRate(r)}
                    className={`mobile-chip ${calcRate === r ? 'mobile-chip-active' : ''}`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Partial Payment Toggle */}
            <div className="mobile-partial-toggle-card">
              <div className="mobile-partial-left">
                <div className="mobile-partial-title">
                  <Zap size={15} className="text-amber-400" />
                  <span>Simulate Partial Payment</span>
                </div>
                <div className="mobile-partial-sub">
                  Pay ₹{partialAmount.toLocaleString('en-IN')} towards principal
                </div>
              </div>
              <label className="mobile-switch">
                <input 
                  type="checkbox" 
                  checked={simulatePartial} 
                  onChange={(e) => setSimulatePartial(e.target.checked)} 
                />
                <span className="mobile-switch-slider" />
              </label>
            </div>

            {simulatePartial && (
              <div className="mobile-partial-slider-wrap">
                <div className="mobile-field-top">
                  <span className="text-xs text-slate-400">Partial Amount Paid</span>
                  <span className="text-xs font-semibold text-emerald-400">₹{partialAmount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max={calcPrincipal - 1000} 
                  step="1000"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(Number(e.target.value))}
                  className="mobile-slider mobile-slider-amber"
                />
              </div>
            )}

            {/* Live Visual Comparison Output */}
            <div className="mobile-calc-results">
              <div className="mobile-result-row">
                <div className="mobile-result-item">
                  <span className="mobile-res-lbl">Initial Monthly Interest</span>
                  <span className="mobile-res-val">₹{periodInterestInitial.toLocaleString('en-IN')}</span>
                  <span className="mobile-res-sub">on ₹{calcPrincipal.toLocaleString('en-IN')}</span>
                </div>

                <div className="mobile-result-arrow">
                  <ArrowRight size={18} />
                </div>

                <div className="mobile-result-item mobile-res-success">
                  <span className="mobile-res-lbl">New Monthly Interest</span>
                  <span className="mobile-res-val font-bold text-emerald-400">
                    ₹{newPeriodInterest.toLocaleString('en-IN')}
                  </span>
                  <span className="mobile-res-sub">on remaining ₹{newOutstanding.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {simulatePartial && interestSaved > 0 && (
                <div className="mobile-savings-pill">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>
                    Customer saves <strong>₹{interestSaved.toLocaleString('en-IN')}/month</strong> on future interest!
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Role-Based App Workspaces ───────────────────────────────── */}
        <section className="mobile-section-card">
          <div className="mobile-section-header">
            <div className="mobile-section-icon bg-indigo-500/10 text-indigo-400">
              <Users size={18} />
            </div>
            <div>
              <h2 className="mobile-section-title">3 Dedicated Portals</h2>
              <p className="mobile-section-subtitle">Tailored interfaces for every stakeholder</p>
            </div>
          </div>

          <div className="mobile-role-cards">
            {/* Admin Card */}
            <div 
              className="mobile-role-item"
              onClick={onOpenLogin}
              role="button"
              tabIndex={0}
            >
              <div className="mobile-role-header">
                <div className="mobile-role-avatar bg-amber-500/10 text-amber-400">👑</div>
                <div className="mobile-role-titles">
                  <div className="mobile-role-name">Super Admin</div>
                  <div className="mobile-role-tag">Full Executive Control</div>
                </div>
                <ChevronRight size={18} className="mobile-role-arrow" />
              </div>
              <p className="mobile-role-desc">
                Disburse loans, monitor real-time business profit, track agent GPS live, and manage full portfolio risk.
              </p>
              <div className="mobile-role-features">
                <span>• Live Profit Analytics</span>
                <span>• Loan Pre-closure</span>
                <span>• Jamin KYC Approvals</span>
              </div>
            </div>

            {/* Agent Card */}
            <div 
              className="mobile-role-item"
              onClick={onOpenLogin}
              role="button"
              tabIndex={0}
            >
              <div className="mobile-role-header">
                <div className="mobile-role-avatar bg-blue-500/10 text-blue-400">🏍️</div>
                <div className="mobile-role-titles">
                  <div className="mobile-role-name">Field Agent</div>
                  <div className="mobile-role-tag">Daily Route & Collection</div>
                </div>
                <ChevronRight size={18} className="mobile-role-arrow" />
              </div>
              <p className="mobile-role-desc">
                GPS-optimized daily collection routes, instant offline-ready payment logging, and customer geocoding.
              </p>
              <div className="mobile-role-features">
                <span>• Map-based Routes</span>
                <span>• Instant WhatsApp Receipt</span>
                <span>• Offline Sync</span>
              </div>
            </div>

            {/* Customer Card */}
            <div 
              className="mobile-role-item"
              onClick={onOpenLogin}
              role="button"
              tabIndex={0}
            >
              <div className="mobile-role-header">
                <div className="mobile-role-avatar bg-emerald-500/10 text-emerald-400">📱</div>
                <div className="mobile-role-titles">
                  <div className="mobile-role-name">Customer Passbook</div>
                  <div className="mobile-role-tag">Digital Self-Service</div>
                </div>
                <ChevronRight size={18} className="mobile-role-arrow" />
              </div>
              <p className="mobile-role-desc">
                View outstanding principal, live interest schedule, download payment receipts, and track loan status 24/7.
              </p>
              <div className="mobile-role-features">
                <span>• Live Passbook</span>
                <span>• EMI Reminders</span>
                <span>• 100% Transparency</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mobile Key Feature Pills ────────────────────────────────── */}
        <section className="mobile-section-card">
          <div className="mobile-section-header">
            <div className="mobile-section-icon bg-cyan-500/10 text-cyan-400">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="mobile-section-title">Built for Modern Lending</h2>
              <p className="mobile-section-subtitle">Everything needed to run daily operations</p>
            </div>
          </div>

          <div className="mobile-feature-list">
            <div className="mobile-feature-row">
              <div className="mobile-feat-bullet bg-emerald-500/20 text-emerald-400">
                <Check size={14} />
              </div>
              <div className="mobile-feat-text">
                <strong>Partial Principal Recalculation:</strong> Automatically drops future interest rates when a customer makes partial payments.
              </div>
            </div>

            <div className="mobile-feature-row">
              <div className="mobile-feat-bullet bg-blue-500/20 text-blue-400">
                <Check size={14} />
              </div>
              <div className="mobile-feat-text">
                <strong>Agent Route Maps & Live GPS:</strong> Visual pinpoints with shortest driving distance to visit daily borrowers.
              </div>
            </div>

            <div className="mobile-feature-row">
              <div className="mobile-feat-bullet bg-purple-500/20 text-purple-400">
                <Check size={14} />
              </div>
              <div className="mobile-feat-text">
                <strong>Guarantor (Jamin) KYC & Photo:</strong> Capture Aadhaar, phone, and portrait verification for uncollateralized security.
              </div>
            </div>

            <div className="mobile-feature-row">
              <div className="mobile-feat-bullet bg-amber-500/20 text-amber-400">
                <Check size={14} />
              </div>
              <div className="mobile-feat-text">
                <strong>Instant WhatsApp & SMS Notifications:</strong> Automated receipt generation and overdue reminder alerts.
              </div>
            </div>

            <div className="mobile-feature-row">
              <div className="mobile-feat-bullet bg-rose-500/20 text-rose-400">
                <Check size={14} />
              </div>
              <div className="mobile-feat-text">
                <strong>Bank-Grade Data Security:</strong> Role-based access control (RBAC), encrypted tokens, and full audit trails.
              </div>
            </div>
          </div>
        </section>

        {/* ─── Android APK & Cross-Platform Banner ─────────────────────── */}
        <section className="mobile-download-card">
          <div className="mobile-dl-content">
            <SmartphoneCharging size={28} className="text-emerald-400 mobile-dl-icon" />
            <div>
              <div className="mobile-dl-title">Available on Android & iOS</div>
              <div className="mobile-dl-sub">Powered by Capacitor native runtime</div>
            </div>
          </div>
          <div className="mobile-dl-badges">
            <div className="mobile-app-badge">⚡ Instant APK</div>
            <div className="mobile-app-badge">🔒 Biometric Ready</div>
            <div className="mobile-app-badge">📶 Offline Sync</div>
          </div>
        </section>

        {/* ─── Mobile Bottom Spacer (so content isn't hidden behind fixed bar) */}
        <div style={{ height: '90px' }} />

        {/* ─── Floating Mobile Bottom Action Bar ──────────────────────── */}
        <div className="mobile-floating-bar">
          <button 
            type="button"
            onClick={onOpenLogin}
            className="mobile-bottom-btn"
          >
            <span>Sign In to Your Workspace</span>
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
