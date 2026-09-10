import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    title: 'Manage Finance',
    highlight: 'Made Simple',
    desc: 'A complete platform for agents and customers to manage finances, collections and repayments.',
    color: '#2563eb',
    bg: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)',
    image: '/onboard1.jpg',
  },
  {
    title: 'Track Every',
    highlight: 'Collection',
    desc: 'Field agents get GPS-mapped daily routes and can record payments on the spot, in real time.',
    color: '#059669',
    bg: 'linear-gradient(160deg, #f0fdf4 0%, #d1fae5 100%)',
    image: '/onboard2.jpg',
  },
  {
    title: 'Your Loans',
    highlight: 'At a Glance',
    desc: 'Customers can view loan balances, upcoming installments, payment history, and receipts anytime.',
    color: '#7c3aed',
    bg: 'linear-gradient(160deg, #f5f3ff 0%, #ede9fe 100%)',
    image: '/onboard3.jpg',
  },
];

export default function OnboardingSlides({ onFinish }) {
  const [current, setCurrent] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [slideDir, setSlideDir] = useState('none'); // 'left' | 'right' | 'none'
  const touchStartX = useRef(null);

  const goTo = (idx, dir = 'left') => {
    if (sliding) return;
    setSliding(true);
    setSlideDir(dir);
    setTimeout(() => {
      setCurrent(idx);
      setSlideDir('none');
      setSliding(false);
    }, 320);
  };

  const handleNext = () => {
    if (current < slides.length - 1) goTo(current + 1, 'left');
    else onFinish();
  };

  const handleSkip = () => onFinish();

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && current < slides.length - 1) goTo(current + 1, 'left');
      else if (diff < 0 && current > 0) goTo(current - 1, 'right');
    }
    touchStartX.current = null;
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  const imgTransform =
    slideDir === 'left'  ? 'translateX(-60px)' :
    slideDir === 'right' ? 'translateX(60px)'  : 'translateX(0)';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: slide.bg,
        transition: 'background 0.5s ease',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
        overflow: 'hidden',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '52px 28px 0', zIndex: 2 }}>
        {!isLast && (
          <button
            onClick={handleSkip}
            style={{
              background: 'rgba(0,0,0,0.07)', border: 'none',
              borderRadius: 20, padding: '6px 18px',
              fontSize: 13, fontWeight: 600, color: '#475569',
              cursor: 'pointer', letterSpacing: '0.2px',
            }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Illustration image */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px 24px 0', overflow: 'hidden',
      }}>
        <img
          key={current}
          src={slide.image}
          alt={`Slide ${current + 1}`}
          style={{
            width: '100%',
            maxWidth: 340,
            height: 'auto',
            maxHeight: '55vh',
            objectFit: 'contain',
            borderRadius: 20,
            opacity: slideDir === 'none' ? 1 : 0,
            transform: imgTransform,
            transition: 'opacity 0.32s ease, transform 0.32s ease',
            filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.12))',
          }}
        />
      </div>

      {/* Bottom sheet */}
      <div style={{
        background: 'white',
        borderRadius: '32px 32px 0 0',
        padding: '32px 28px 44px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.08)',
        opacity: slideDir === 'none' ? 1 : 0,
        transform: slideDir === 'none' ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.32s ease, transform 0.32s ease',
      }}>
        {/* Heading */}
        <h2 style={{
          fontSize: 26, fontWeight: 800, color: '#0f172a',
          margin: '0 0 8px 0', lineHeight: 1.25,
        }}>
          {slide.title}{' '}
          <span style={{ color: slide.color }}>{slide.highlight}</span>
        </h2>
        <p style={{
          fontSize: 14, color: '#64748b', lineHeight: 1.7,
          margin: '0 0 28px 0', fontWeight: 400, maxWidth: 320,
        }}>
          {slide.desc}
        </p>

        {/* Dots + Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Pagination dots */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => !sliding && goTo(i, i > current ? 'left' : 'right')}
                style={{
                  width: i === current ? 28 : 8,
                  height: 8, borderRadius: 4, border: 'none', padding: 0,
                  background: i === current ? slide.color : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleNext}
            style={{
              background: slide.color,
              color: 'white', border: 'none',
              borderRadius: 50, padding: '14px 26px',
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              boxShadow: `0 8px 24px ${slide.color}55`,
              transition: 'all 0.2s ease',
              letterSpacing: '-0.2px',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
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
