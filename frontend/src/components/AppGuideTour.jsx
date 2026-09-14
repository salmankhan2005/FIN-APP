import React, { useState, useEffect, useRef } from 'react';
import { useTour, VOICE_MODEL_OPTIONS } from '../contexts/TourContext';
import {
  Volume2, VolumeX, RotateCcw, X, ChevronRight, ChevronLeft,
  ChevronUp, ChevronDown,
  Sparkles, CheckCircle, Navigation, Globe, Play, HelpCircle,
  Mic, MicOff, Headphones, Sliders, Check
} from 'lucide-react';

/* ─── Mobile detection hook ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function AppGuideTour() {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    language,
    isVoiceEnabled,
    isSpeaking,
    speechRate,
    voiceModel,
    setVoiceModel,
    audioProgress,
    previewVoice,
    showWelcomeModal,
    setShowWelcomeModal,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    replayAudio,
    toggleLanguage,
    toggleVoice,
    setSpeechRate,
  } = useTour();

  const [highlightRect, setHighlightRect] = useState(null);
  const isMobile = useIsMobile();
  const cardRef = useRef(null);

  const activeModelOption = VOICE_MODEL_OPTIONS.find(m => m.id === voiceModel) || VOICE_MODEL_OPTIONS[0];

  const activeModelDisplay = voiceModel === 'indic-parler'
    ? 'Indic-Parler · AI4Bharat'
    : voiceModel === 'synth'
      ? 'Device Synth'
      : language === 'ta'
        ? 'Pallavi Neural (பல்லவி)'
        : 'Neerja Neural (நீரஜா)';

  const speakerName = language === 'ta' ? 'பல்லவி' : 'Neerja';
  const speakerBadge = language === 'ta' ? 'பல்லவி (வழிகாட்டி)' : 'Neerja (Guide)';

  // Mobile expandable details state
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Touch swipe support for mobile cards (horizontal navigation + vertical expand/collapse)
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    // Vertical swipe: swipe up to expand, swipe down to collapse
    if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) setIsMobileExpanded(true);
      else setIsMobileExpanded(false);
      return;
    }

    // Horizontal swipe: next / back step
    if (Math.abs(dx) < 40) return;
    if (dx < 0) nextStep();
    else prevStep();
  };

  // Spotlight highlight rect
  useEffect(() => {
    if (!isTourActive || !currentStep?.selector) {
      setHighlightRect(null);
      return;
    }
    const updateRect = () => {
      try {
        const el = document.querySelector(currentStep.selector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
        } else {
          setHighlightRect(null);
        }
      } catch {
        setHighlightRect(null);
      }
    };
    updateRect();
    const timer = setTimeout(updateRect, 500);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isTourActive, currentStep]);

  // ─── Welcome Modal ───────────────────────────────────────────────
  if (showWelcomeModal && !isTourActive) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="modal-overlay"
        style={{
          zIndex: 99999,
          animation: 'fadeIn 0.25s ease',
          background: 'rgba(5, 10, 20, 0.82)',
          backdropFilter: 'blur(10px)',
          padding: isMobile ? '0 0 0 0' : undefined,
          alignItems: isMobile ? 'flex-end' : 'center',
        }}
      >
        <div
          className="modal"
          style={{
            maxWidth: isMobile ? '100%' : 440,
            width: '100%',
            padding: 0,
            overflow: 'hidden',
            borderRadius: isMobile ? '24px 24px 0 0' : '24px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.55), 0 0 30px rgba(37, 99, 235, 0.2)',
            background: 'var(--bg-card, #0f1f3a)',
            animation: isMobile ? 'slideUpSheet 0.38s cubic-bezier(0.16, 1, 0.3, 1)' : 'fadeIn 0.25s ease',
          }}
        >
          {/* Mobile drag handle */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
            </div>
          )}

          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            padding: isMobile ? '16px 20px 14px' : '24px 20px 16px',
            position: 'relative',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <button
              onClick={() => setShowWelcomeModal(false)}
              style={{
                position: 'absolute', top: 12, right: 12,
                background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
                width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>

            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                position: 'absolute', inset: -6, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.55) 0%, transparent 70%)',
                animation: 'pulseGlow 2s infinite',
              }} />
              <img
                src="/guide_avatar_bust.png"
                alt={`${speakerName} - Finova Guide`}
                style={{
                  width: isMobile ? 76 : 92,
                  height: isMobile ? 76 : 92,
                  borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid #38bdf8',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  position: 'relative', zIndex: 2,
                }}
              />
            </div>

            <h3 style={{ margin: '10px 0 3px', fontSize: isMobile ? 18 : 20, fontWeight: 800, color: '#ffffff' }}>
              👋 Welcome to Finova!
            </h3>
            <p style={{ margin: 0, fontSize: isMobile ? 12 : 13, color: '#94a3b8' }}>
              ஃபினோவா செயலி வழிகாட்டிக்கு நல்வரவு
            </p>

            {/* Female voice model badge */}
            <div style={{
              marginTop: 8,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(236, 72, 153, 0.45)',
              borderRadius: 100, padding: '3px 12px',
              fontSize: 11, fontWeight: 700, color: '#f472b6',
              boxShadow: '0 0 12px rgba(236, 72, 153, 0.25)'
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isSpeaking ? '#ec4899' : '#38bdf8',
                boxShadow: isSpeaking ? '0 0 8px #ec4899' : 'none',
              }} />
              <span>{language === 'ta' ? 'Pallavi Neural AI (பல்லவி பெண் குரல்)' : 'Neerja Neural AI (Neerja Indian English Voice)'}</span>
            </div>
          </div>

          {/* Body content */}
          <div style={{ padding: isMobile ? '16px 18px' : '20px 22px' }}>
            {/* Interactive Voice Tour Highlight */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '14px', padding: '12px',
              marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.18)', color: '#38bdf8',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Volume2 size={18} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                <strong>Interactive Voice Tour:</strong> Spoken by <strong>Pallavi (பல்லவி)</strong> in Tamil & <strong>Neerja (நீரஜா)</strong> in Indian English!
              </div>
            </div>

            {/* Voice Preview & 1.5x Speed Bar */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '14px', padding: '12px 14px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 11.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100,
                  background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.4)'
                }}>
                  ⚡ {speechRate}x Speed
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {language === 'ta' ? 'பல்லவி தமிழ் குரல்' : 'Neerja English Voice'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => previewVoice()}
                style={{
                  background: isSpeaking ? '#ec4899' : 'rgba(236, 72, 153, 0.2)',
                  border: '1px solid rgba(236, 72, 153, 0.4)',
                  borderRadius: 100, padding: '5px 12px',
                  color: '#fff', fontSize: 11.5, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Volume2 size={13} />
                <span>{isSpeaking ? 'Playing...' : 'Test Voice (கேட்க)'}</span>
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Would you like a quick 1-minute voice guided tour to discover all tools & features?
              <br />
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                அனைத்து ஆப்ஷன்களையும் தெரிந்து கொள்ள 1 நிமிட ஆடியோ வழிகாட்டியை தொடங்கலாமா?
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => startTour()}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%', borderRadius: '14px', fontWeight: 800, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.45)',
                  height: 48,
                }}
              >
                <Sparkles size={18} />
                <span>Start Guided Tour (தொடங்கு)</span>
              </button>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: 'var(--text-muted)', fontSize: 12.5, padding: '10px' }}
              >
                Maybe Later (பிறகு பார்க்கலாம்)
              </button>
            </div>

            {/* Safe-area bottom spacer for mobile */}
            {isMobile && <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />}
          </div>
        </div>
      </div>
    );
  }

  if (!isTourActive || !currentStep) return null;

  const title = language === 'ta' ? currentStep.titleTa : currentStep.titleEn;
  const description = language === 'ta' ? currentStep.descTa : currentStep.descEn;
  const tip = language === 'ta' ? currentStep.tipTa : currentStep.tipEn;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <aside
      aria-label="App Guided Tour"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    >
      {/* ─── Backdrop Overlay ─── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5, 12, 22, 0.75)',
          backdropFilter: 'blur(3px)',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
        }}
        onClick={nextStep}
      />

      {/* ─── Spotlight Highlight ─── */}
      {highlightRect && (
        <div
          style={{
            position: 'absolute',
            top: highlightRect.top - 6,
            left: highlightRect.left - 6,
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            borderRadius: '16px',
            border: '2px solid #38bdf8',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.55), inset 0 0 15px rgba(56, 189, 248, 0.18)',
            pointerEvents: 'none',
            zIndex: 1000000,
            animation: 'pulseGlow 2s infinite',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{
            position: 'absolute', bottom: -22, left: 14,
            background: '#38bdf8', color: '#07111e',
            fontSize: 10, fontWeight: 800,
            padding: '2px 8px', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Navigation size={10} style={{ transform: 'rotate(-45deg)' }} />
            <span>Target Feature</span>
          </div>
        </div>
      )}

      {/* ─── MOBILE: Ultra-Compact Dynamic Floating Island Layout ─── */}
      {isMobile ? (
        <div
          ref={cardRef}
          style={{
            position: 'fixed',
            bottom: 'max(10px, env(safe-area-inset-bottom, 8px))',
            left: 10, right: 10,
            zIndex: 1000001,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'rgba(9, 19, 36, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1.2px solid rgba(56, 189, 248, 0.35)',
            borderRadius: 18,
            boxShadow: '0 12px 36px rgba(0,0,0,0.65), 0 0 20px rgba(56, 189, 248, 0.15)',
            padding: '8px 12px 9px',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Drag Indicator */}
          <div
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', paddingBottom: 5,
            }}
          >
            <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
          </div>

          {/* Header Row: Avatar + Title + Status + Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
            {/* Avatar + Title Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
              <div style={{ position: 'relative', width: 34, height: 34, flexShrink: 0 }}>
                <img
                  src="/guide_avatar_bust.png"
                  alt={speakerName}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', objectFit: 'cover',
                    border: isSpeaking ? '2px solid #ec4899' : '2px solid #38bdf8',
                    boxShadow: isSpeaking ? '0 0 10px rgba(236, 72, 153, 0.6)' : '0 2px 6px rgba(0,0,0,0.4)',
                    transition: 'all 0.2s ease',
                  }}
                />
                {isSpeaking && (
                  <span style={{
                    position: 'absolute', bottom: -1, right: -1,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#ec4899', border: '1.5px solid #091324',
                    boxShadow: '0 0 6px #ec4899',
                  }} />
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    fontSize: 9.5, fontWeight: 800, color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.15)', padding: '1px 5px',
                    borderRadius: 4, letterSpacing: '0.2px', flexShrink: 0,
                  }}>
                    {currentStepIndex + 1}/{totalSteps}
                  </span>
                  <span style={{
                    fontSize: 12.5, fontWeight: 800, color: '#ffffff',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {title}
                  </span>
                </div>

                {/* Subtitle / Speaking indicator + Details toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  {isSpeaking ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 9 }}>
                        {[0.1, 0.3, 0.2, 0.4].map((delay, i) => (
                          <span key={i} className="tour-sound-bar" style={{ animationDelay: `${delay}s`, background: '#ec4899', width: 2 }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: '#ec4899', fontWeight: 700 }}>
                        {language === 'ta' ? 'பேசுகிறார்' : 'Speaking'}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {speakerName}
                    </span>
                  )}
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>•</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileExpanded(!isMobileExpanded);
                    }}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      fontSize: 10, color: '#38bdf8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 2,
                    }}
                  >
                    <span>{isMobileExpanded ? 'Hide info' : 'Details'}</span>
                    {isMobileExpanded ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              {/* Speed Button */}
              <button
                type="button"
                onClick={() => {
                  const next = speechRate === 1.5 ? 1.25 : speechRate === 1.25 ? 1.75 : 1.5;
                  setSpeechRate(next);
                }}
                title="Speed (வேகம்)"
                style={{
                  background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8', fontSize: 10, fontWeight: 800, padding: '2px 6px',
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                ⚡{speechRate}x
              </button>

              {/* Language Button */}
              <button
                onClick={toggleLanguage}
                title="Toggle Language"
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-primary)', fontSize: 10, fontWeight: 700, padding: '2px 6px',
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                {language === 'ta' ? 'தமிழ்' : 'EN'}
              </button>

              {/* Voice Mute Toggle */}
              <button
                onClick={toggleVoice}
                title={isVoiceEnabled ? 'Mute' : 'Unmute'}
                style={{
                  background: isSpeaking ? 'rgba(236, 72, 153, 0.18)' : 'rgba(255,255,255,0.06)',
                  border: 'none', color: isSpeaking ? '#ec4899' : 'var(--text-muted)',
                  width: 24, height: 24, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </button>

              {/* Close Tour */}
              <button
                onClick={stopTour}
                title="Close"
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  color: 'var(--text-muted)', width: 24, height: 24, borderRadius: '50%',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Expandable Details Section */}
          {isMobileExpanded && (
            <div style={{
              paddingTop: 3, paddingBottom: 6,
              animation: 'fadeIn 0.2s ease',
            }}>
              <p style={{
                margin: '0 0 6px 0', fontSize: 11.5, lineHeight: 1.45,
                color: 'var(--text-secondary, #cbdff5)',
              }}>
                {description}
              </p>
              {tip && (
                <div style={{
                  background: 'rgba(56, 189, 248, 0.07)',
                  borderLeft: '2.5px solid #38bdf8',
                  borderRadius: '0 6px 6px 0',
                  padding: '4px 8px', fontSize: 10.5,
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <HelpCircle size={11} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span>{tip}</span>
                </div>
              )}
            </div>
          )}

          {/* Slim Progress bar */}
          <div style={{
            width: '100%', height: 2, background: 'rgba(255,255,255,0.08)',
            borderRadius: 10, overflow: 'hidden', margin: '3px 0 6px',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #ec4899 0%, #38bdf8 100%)',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Bottom Row: Skip + Back/Next */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <button
              onClick={stopTour}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: 11, cursor: 'pointer', padding: '3px 6px',
              }}
            >
              Skip
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-primary)', fontSize: 11.5, fontWeight: 700,
                    padding: '4px 9px', borderRadius: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <ChevronLeft size={13} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={nextStep}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  border: 'none', color: '#ffffff',
                  fontSize: 12, fontWeight: 700, padding: '5px 14px',
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
                }}
              >
                <span>{currentStepIndex === totalSteps - 1 ? 'Finish ✓' : 'Next'}</span>
                {currentStepIndex === totalSteps - 1 ? <CheckCircle size={13} /> : <ChevronRight size={13} />}
              </button>
            </div>
          </div>
        </div>

      ) : (
        /* ─── DESKTOP: Side-by-side floating layout ─── */
        <div
          style={{
            position: 'fixed',
            bottom: 24, right: 24,
            maxWidth: 'min(580px, calc(100vw - 32px))',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 16,
            zIndex: 1000001,
            pointerEvents: 'auto',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* 2D Guide Avatar */}
          <div style={{
            position: 'relative',
            flexShrink: 0,
            width: 140,
            height: 250,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))',
            animation: 'floatSubtle 3s ease-in-out infinite',
          }}>
            {/* Speaking Aura */}
            {isSpeaking && (
              <div style={{
                position: 'absolute', top: 20,
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid rgba(236, 72, 153, 0.7)',
                animation: 'splashPulse 1.4s infinite',
                pointerEvents: 'none',
              }} />
            )}

            <img
              src="/guide_avatar.png"
              alt={`${speakerName} - Finova App Guide`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain',
                userSelect: 'none', pointerEvents: 'none',
                transform: isSpeaking ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            />

            {/* Guide Badge */}
            <div style={{
              position: 'absolute', bottom: 0,
              background: 'rgba(10, 20, 35, 0.95)',
              border: '1px solid #38bdf8', borderRadius: '100px',
              padding: '3px 8px', fontSize: '9.5px', fontWeight: 800, color: '#38bdf8',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isSpeaking ? '#ec4899' : '#38bdf8',
                display: 'inline-block',
                boxShadow: isSpeaking ? '0 0 6px #ec4899' : 'none',
              }} />
              <span>{speakerBadge}</span>
            </div>
          </div>

          {/* Speech Card */}
          <div style={{
            flex: 1,
            background: 'var(--bg-card, #132338)',
            color: 'var(--text-primary, #f0f7ff)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '20px',
            padding: '18px 20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.15)',
            position: 'relative',
            backdropFilter: 'blur(16px)',
          }}>
            {/* Speech bubble tail */}
            <div style={{
              position: 'absolute', bottom: 36, left: -8,
              width: 16, height: 16,
              background: 'var(--bg-card, #132338)',
              borderLeft: '1.5px solid rgba(56, 189, 248, 0.4)',
              borderBottom: '1.5px solid rgba(56, 189, 248, 0.4)',
              transform: 'rotate(45deg)',
            }} />

            {/* Top controls bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8',
                  fontSize: '10.5px', fontWeight: 800, padding: '2px 8px',
                  borderRadius: '100px', border: '1px solid rgba(56, 189, 248, 0.3)',
                }}>
                  {currentStep.badge}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {currentStepIndex + 1} / {totalSteps}
                </span>

                {/* Speed Toggle Badge Button (Default 1.5x) */}
                <button
                  type="button"
                  onClick={() => {
                    const next = speechRate === 1.5 ? 1.25 : speechRate === 1.25 ? 1.75 : 1.5;
                    setSpeechRate(next);
                  }}
                  title="Toggle Voice Speed (1.25x / 1.5x / 1.75x)"
                  style={{
                    background: 'rgba(56, 189, 248, 0.14)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '100px',
                    padding: '2px 9px',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex', alignItems: 'center', gap: 3,
                    cursor: 'pointer'
                  }}
                >
                  <span>⚡ {speechRate}x</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={toggleLanguage}
                  title={language === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாற்றவும்'}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '100px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Globe size={12} />
                  <span>{language === 'ta' ? 'தமிழ்' : 'EN'}</span>
                </button>

                <button onClick={replayAudio} title="Replay"
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)', width: 28, height: 28, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <RotateCcw size={13} />
                </button>

                <button onClick={toggleVoice} title={isVoiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
                  style={{
                    background: isSpeaking ? 'rgba(236, 72, 153, 0.22)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: isSpeaking ? '#ec4899' : 'var(--text-muted)',
                    width: 28, height: 28, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {isSpeaking && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0,
                      width: 7, height: 7, borderRadius: '50%', background: '#ec4899',
                      boxShadow: '0 0 5px #ec4899',
                    }} />
                  )}
                </button>

                <button onClick={stopTour} title="Close Tour"
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none',
                    color: 'var(--text-muted)', width: 28, height: 28, borderRadius: '50%',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>



            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <h4 style={{
                margin: 0, fontSize: '16px', fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>{currentStep.icon}</span>
                <span>{title}</span>
              </h4>

              {isSpeaking && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 14 }}>
                  {[0.1, 0.3, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="tour-sound-bar" style={{ animationDelay: `${d}s`, background: '#ec4899' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Speaking audio progress bar (Desktop) */}
            {isSpeaking && (
              <div style={{
                marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(236, 72, 153, 0.08)',
                border: '1px solid rgba(236, 72, 153, 0.25)',
                borderRadius: 8, padding: '4px 10px',
              }}>
                <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, flex: 1 }}>
                  {language === 'ta' ? `பல்லவி பேசுகிறார் (${speechRate}x)` : `Neerja speaking (${speechRate}x)`}
                </span>
                <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${audioProgress}%`,
                    background: activeModelOption.badgeColor, transition: 'width 0.2s linear'
                  }} />
                </div>
              </div>
            )}

            {/* Description */}
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text-secondary, #cbdff5)', lineHeight: 1.55 }}>
              {description}
            </p>

            {/* Tip */}
            {tip && (
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                borderLeft: '3px solid #38bdf8', borderRadius: '0 8px 8px 0',
                padding: '6px 10px', fontSize: '11.5px',
                color: 'var(--text-muted)', marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <HelpCircle size={13} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>{tip}</span>
              </div>
            )}

            {/* Progress bar */}
            <div style={{
              width: '100%', height: 4, background: 'rgba(255,255,255,0.08)',
              borderRadius: 10, overflow: 'hidden', marginBottom: 14,
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, #ec4899 0%, #38bdf8 100%)',
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <button onClick={stopTour} className="btn btn-ghost btn-sm"
                style={{ fontSize: 12, padding: '6px 10px', color: 'var(--text-muted)' }}
              >
                Skip (முடி)
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {currentStepIndex > 0 && (
                  <button onClick={prevStep} className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, padding: '6px 12px', gap: 4 }}
                  >
                    <ChevronLeft size={14} />
                    <span>Back</span>
                  </button>
                )}

                <button onClick={nextStep} className="btn btn-primary btn-sm"
                  style={{
                    fontSize: 12.5, padding: '7px 16px', fontWeight: 700,
                    gap: 6, borderRadius: 10,
                    boxShadow: '0 2px 12px rgba(56, 189, 248, 0.35)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <span>{currentStepIndex === totalSteps - 1 ? 'Finish (முடிக்க)' : 'Next (அடுத்து)'}</span>
                  {currentStepIndex === totalSteps - 1 ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Global Keyframe Animations ─── */}
      <style>{`
        .tour-sound-bar {
          width: 3px;
          height: 100%;
          border-radius: 2px;
          animation: tourSoundWave 0.8s ease-in-out infinite alternate;
        }
        @keyframes tourSoundWave {
          from { height: 4px; }
          to   { height: 16px; }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes floatSubtle {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes splashPulse {
          0%   { transform: scale(1);    opacity: 0.9; }
          100% { transform: scale(2.0);  opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.4); }
          50%       { box-shadow: 0 0 40px rgba(56,189,248,0.8); }
        }
      `}</style>
    </aside>
  );
}
