import React, { useState, useEffect } from 'react';
import { useTour } from '../contexts/TourContext';
import { 
  Volume2, VolumeX, RotateCcw, X, ChevronRight, ChevronLeft, 
  Sparkles, CheckCircle, Navigation, Globe, Play, HelpCircle
} from 'lucide-react';

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

  // Compute spotlight highlight rect if target element exists
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

  // If welcome modal prompt is open
  if (showWelcomeModal && !isTourActive) {
    return (
      <div 
        role="dialog" 
        aria-modal="true"
        className="modal-overlay" 
        style={{ 
          zIndex: 99999, 
          animation: 'fadeIn 0.25s ease',
          background: 'rgba(5, 10, 20, 0.75)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div 
          className="modal" 
          style={{ 
            maxWidth: 440, 
            padding: 0, 
            overflow: 'hidden', 
            borderRadius: '24px', 
            border: '1px solid var(--border-active, rgba(56, 189, 248, 0.3))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(37, 99, 235, 0.2)',
            background: 'var(--bg-card, #132338)',
          }}
        >
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            padding: '24px 20px 16px',
            position: 'relative',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <button 
              onClick={() => setShowWelcomeModal(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: 30,
                height: 30,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            {/* Avatar Head / Floating Preview */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, transparent 70%)',
                animation: 'pulseGlow 2s infinite'
              }} />
              <img 
                src="/guide_avatar_bust.png" 
                alt="Priya - Finova Guide" 
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #38bdf8',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            </div>

            <h3 style={{ margin: '12px 0 4px', fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
              👋 Welcome to Finova!
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              ஃபினோவா செயலி வழிகாட்டிக்கு நல்வரவு
            </p>
          </div>

          {/* Body content */}
          <div style={{ padding: '20px 22px' }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Volume2 size={20} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                <strong>Interactive Voice Tour:</strong> Priya will speak in Tamil & English, pointing out each feature step-by-step!
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Would you like a quick 1-minute voice guided tour to discover all tools & features?
              <br />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                அனைத்து ஆப்ஷன்களையும் தெரிந்து கொள்ள 1 நிமிட ஆடியோ வழிகாட்டியை தொடங்கலாமா?
              </span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => startTour()}
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
                }}
              >
                <Sparkles size={18} />
                <span>Start Guided Tour (தொடங்கு)</span>
              </button>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="btn btn-ghost btn-sm"
                style={{
                  width: '100%',
                  color: 'var(--text-muted)',
                  fontSize: 12.5,
                  padding: '8px'
                }}
              >
                Maybe Later (பிறகு பார்க்கலாம்)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If Tour is not active, render nothing
  if (!isTourActive || !currentStep) return null;

  const title = language === 'ta' ? currentStep.titleTa : currentStep.titleEn;
  const description = language === 'ta' ? currentStep.descTa : currentStep.descEn;
  const tip = language === 'ta' ? currentStep.tipTa : currentStep.tipEn;

  return (
    <aside 
      aria-label="App Guided Tour"
      className="tour-portal-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        pointerEvents: 'none',
      }}
    >
      {/* ─── Semi-Transparent Backdrop Overlay with Spotlight Hole ─── */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 14, 25, 0.72)',
          backdropFilter: 'blur(3px)',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
        }}
        onClick={nextStep}
      />

      {/* ─── Target Element Glowing Box Indicator ─── */}
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
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.5), inset 0 0 15px rgba(56, 189, 248, 0.2)',
            pointerEvents: 'none',
            zIndex: 1000000,
            animation: 'pulseGlow 2s infinite',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Arrow pointing to spotlight element */}
          <div style={{
            position: 'absolute',
            bottom: -22,
            left: 20,
            background: '#38bdf8',
            color: '#07111e',
            fontSize: 10,
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Navigation size={10} style={{ transform: 'rotate(-45deg)' }} />
            <span>Target Feature</span>
          </div>
        </div>
      )}

      {/* ─── Floating 2D Guide Character (Priya) + Speech Card ─── */}
      <div
        className="tour-guide-stage"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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
        {/* 2D Guide Avatar (Full Body Standing Character) */}
        <div 
          className="tour-avatar-wrap animate-float-subtle"
          style={{
            position: 'relative',
            flexShrink: 0,
            width: 140,
            height: 250,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))',
          }}
        >
          {/* Speaking Soundwaves Aura */}
          {isSpeaking && (
            <div style={{
              position: 'absolute',
              top: 20,
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px solid rgba(56, 189, 248, 0.7)',
              animation: 'splashPulse 1.4s infinite',
              pointerEvents: 'none'
            }} />
          )}

          {/* Guide Transparent PNG */}
          <img 
            src="/guide_avatar.png" 
            alt="Priya - Finova App Guide"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none',
              transform: isSpeaking ? 'scale(1.02)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          />

          {/* Guide Badge */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            background: 'rgba(10, 20, 35, 0.95)',
            border: '1px solid #38bdf8',
            borderRadius: '100px',
            padding: '3px 8px',
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#38bdf8',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSpeaking ? '#10b981' : '#38bdf8', display: 'inline-block' }} />
            <span>Priya (வழிகாட்டி)</span>
          </div>
        </div>

        {/* ─── Interactive Speech Card ─── */}
        <div 
          className="tour-card"
          style={{
            flex: 1,
            background: 'var(--bg-card, #132338)',
            color: 'var(--text-primary, #f0f7ff)',
            border: '1.5px solid var(--border-active, rgba(56, 189, 248, 0.4))',
            borderRadius: '20px',
            padding: '18px 20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 25px rgba(56, 189, 248, 0.15)',
            position: 'relative',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Card Pointer Tail connecting speech bubble to avatar */}
          <div style={{
            position: 'absolute',
            bottom: 36,
            left: -8,
            width: 16,
            height: 16,
            background: 'var(--bg-card, #132338)',
            borderLeft: '1.5px solid var(--border-active, rgba(56, 189, 248, 0.4))',
            borderBottom: '1.5px solid var(--border-active, rgba(56, 189, 248, 0.4))',
            transform: 'rotate(45deg)',
          }} />

          {/* Top Bar: Step progress + Audio Controls + Language + Close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
            {/* Step Counter Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '100px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                letterSpacing: '0.3px',
              }}>
                {currentStep.badge}
              </span>

              <span style={{ fontSize: 11, color: 'var(--text-muted, #8aaac8)', fontWeight: 600 }}>
                {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>

            {/* Controls Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                title={language === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாற்றவும்'}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Globe size={12} />
                <span>{language === 'ta' ? 'தமிழ்' : 'EN'}</span>
              </button>

              {/* Replay Audio */}
              <button
                onClick={replayAudio}
                title="Replay Voice (மீண்டும் கேட்க)"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RotateCcw size={13} />
              </button>

              {/* Voice Mute/Unmute */}
              <button
                onClick={toggleVoice}
                title={isVoiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
                style={{
                  background: isSpeaking ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: isSpeaking ? '#38bdf8' : 'var(--text-muted)',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                {isSpeaking && (
                  <span style={{
                    position: 'absolute',
                    top: 0, right: 0,
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: '#10b981',
                  }} />
                )}
              </button>

              {/* Close Tour */}
              <button
                onClick={stopTour}
                title="Close Tour (வெளியேறு)"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Title with icon & Sound visualizer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <span>{currentStep.icon}</span>
              <span>{title}</span>
            </h4>

            {/* Animated Sound Bars Visualizer */}
            {isSpeaking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 14 }}>
                <span className="tour-sound-bar" style={{ animationDelay: '0.1s' }} />
                <span className="tour-sound-bar" style={{ animationDelay: '0.3s' }} />
                <span className="tour-sound-bar" style={{ animationDelay: '0.2s' }} />
                <span className="tour-sound-bar" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>

          {/* Description Text */}
          <p style={{
            margin: '0 0 10px 0',
            fontSize: '13px',
            color: 'var(--text-secondary, #cbdff5)',
            lineHeight: 1.55,
          }}>
            {description}
          </p>

          {/* Quick Helpful Tip */}
          {tip && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '3px solid #38bdf8',
              borderRadius: '0 8px 8px 0',
              padding: '6px 10px',
              fontSize: '11.5px',
              color: 'var(--text-muted, #8aaac8)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <HelpCircle size={13} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span>{tip}</span>
            </div>
          )}

          {/* Progress Indicator Track */}
          <div style={{
            width: '100%',
            height: 4,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 14
          }}>
            <div style={{
              height: '100%',
              width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
              background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
              transition: 'width 0.3s ease',
            }} />
          </div>

          {/* Bottom Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <button
              onClick={stopTour}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 12, padding: '6px 10px', color: 'var(--text-muted)' }}
            >
              Skip (முடி)
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12, padding: '6px 12px', gap: 4 }}
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={nextStep}
                className="btn btn-primary btn-sm"
                style={{
                  fontSize: 12.5,
                  padding: '7px 16px',
                  fontWeight: 700,
                  gap: 6,
                  borderRadius: 10,
                  boxShadow: '0 2px 12px rgba(56, 189, 248, 0.35)'
                }}
              >
                <span>{currentStepIndex === totalSteps - 1 ? 'Finish (முடிக்க)' : 'Next (அடுத்து)'}</span>
                {currentStepIndex === totalSteps - 1 ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sound Bar Wave Animation Styles ─── */}
      <style>{`
        .tour-sound-bar {
          width: 3px;
          height: 100%;
          background: #38bdf8;
          border-radius: 2px;
          animation: tourSoundWave 0.8s ease-in-out infinite alternate;
        }
        @keyframes tourSoundWave {
          from { height: 4px; }
          to { height: 16px; }
        }
        @media (max-width: 640px) {
          .tour-guide-stage {
            bottom: 64px !important;
            right: 12px !important;
            left: 12px !important;
            max-width: 100% !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .tour-avatar-wrap {
            height: 130px !important;
            width: 90px !important;
            margin-bottom: -10px !important;
          }
          .tour-card {
            padding: 14px 16px !important;
            width: 100% !important;
          }
        }
      `}</style>
    </aside>
  );
}
