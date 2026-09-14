import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Tour Steps Definition per Role ─── */
export const TOUR_STEPS_BY_ROLE = {
  admin: [
    {
      id: 'welcome',
      titleEn: 'Welcome to Finova Admin Tour',
      titleTa: 'Finova நிர்வாகி வழிகாட்டிக்கு வரவேற்கிறோம்!',
      descEn: 'Hello! I am Neerja, your Finova digital advisor. I will guide you through all the core features of your finance management system. Let us take a quick walkthrough.',
      descTa: 'வணக்கம், நான் உங்கள் வழிகாட்டி பல்லவி. ஃபினோவா நிதி மேலாண்மை அமைப்பின் அனைத்து முக்கிய அம்சங்களையும் உங்களுக்கு எளிமையாக விளக்குகிறேன், வாருங்கள்.',
      path: '/',
      selector: '.stats-grid',
      badge: 'FINOVA TOUR · படி 1',
      icon: '👋',
      tipEn: 'Explore your daily disbursals and recovery metrics in real-time.',
      tipTa: 'உங்கள் தினசரி கடன் மற்றும் வசூல் விபரங்களை உடனுக்குடன் கண்காணிக்கலாம்.',
    },
    {
      id: 'financials',
      titleEn: 'Live Financial Analytics & Metrics',
      titleTa: 'முழுமையான வணிக நிதி நிலவரம்',
      descEn: 'Live Financial Analytics. Here you can track Total Disbursed capital, Principal outstanding, Interest profit earned, and today\'s recoveries at a single glance.',
      descTa: 'இங்கே நீங்கள் வழங்கிய மொத்த கடன், அசல் நிலுவை, வட்டி லாபம் மற்றும் இன்றைய வசூல் தொகையை ஒரே பார்வையில் விரிவாகக் கண்காணிக்கலாம்.',
      path: '/',
      selector: '.stats-grid',
      badge: 'FINANCIALS · படி 2',
      icon: '📊',
      tipEn: 'Tap any stat card to open detailed loan lists and filters.',
      tipTa: 'எந்த கார்டையும் கிளிக் செய்து அதிலுள்ள கடன்களை விரிவாக பார்க்கலாம்.',
    },
    {
      id: 'customers',
      titleEn: 'Customer Profiles & Guarantor KYC',
      titleTa: 'வாடிக்கையாளர் பதிவு & ஜாமீன் சரிபார்ப்பு',
      descEn: 'Customer Profiles and Guarantor KYC. Manage all your borrowers with security. Capture full profiles, documents, and complete guarantor KYC.',
      descTa: 'வாடிக்கையாளர் விபரம், ஆதார் புகைப்படம், இருப்பிடம் மற்றும் ஜாமீன் சரிபார்ப்புகளைப் பாதுகாப்பாகப் பதிவு செய்து நிர்வகிக்கலாம்.',
      path: '/customers',
      selector: '.search-bar, .btn-primary',
      badge: 'CUSTOMERS · படி 3',
      icon: '👥',
      tipEn: 'Search customers instantly by name, phone, or Aadhaar number.',
      tipTa: 'பெயர், மொபைல் எண் அல்லது ஆதார் மூலம் வாடிக்கையாளர்களை உடனே தேடலாம்.',
    },
    {
      id: 'create_loan',
      titleEn: 'Adaptive Smart Loan Creation',
      titleTa: 'புதிய கடன் உருவாக்கம் (Daily / Weekly / Monthly)',
      descEn: 'Adaptive Smart Loan Creation. Create Flat interest loans, Kandhu Vatti, or EMI loans with daily, weekly, or monthly repayment schedules.',
      descTa: 'வட்டி கடன், கழிவு கடன் அல்லது தவணை கடன்களை தினசரி, வாராந்திர மற்றும் மாதாந்திர தவணைகளுடன் தானியங்கி கணக்கீட்டுடன் எளிதாக உருவாக்கலாம்.',
      path: '/loans/create',
      selector: '.form-group, .card',
      badge: 'NEW LOAN · படி 4',
      icon: '📝',
      tipEn: 'Flexible interest modes with top-up options and instant agreement preview.',
      tipTa: 'டாப்-அப் கடன் வசதி மற்றும் உடனடி ஒப்பந்த விபரங்கள் இதில் உண்டு.',
    },
    {
      id: 'collections',
      titleEn: 'Doorstep Collections & WhatsApp Receipts',
      titleTa: 'கள வசூல் மற்றும் உடனடி டிஜிட்டல் ரசீதுகள்',
      descEn: 'Doorstep Collections and WhatsApp Receipts. View today\'s due list, record collections with single-click pay, and send instant receipts to customers.',
      descTa: 'இன்றைய வசூல் நிலுவைகளைப் பார்வையிட்டு தொகையைப் பதிவு செய்து, வாடிக்கையாளரின் வாட்ஸ்அப் எண்ணிற்கு உடனடி டிஜிட்டல் ரசீதை அனுப்பலாம்.',
      path: '/collections',
      selector: '.collection-card, .tabs',
      badge: 'COLLECTIONS · படி 5',
      icon: '💰',
      tipEn: 'Filter by Today, Tomorrow, Overdue, or All pending dues.',
      tipTa: 'இன்று, நாளை அல்லது தவணை தவறிய நிலுவைகளை தனித்தனியாக பார்க்கலாம்.',
    },
    {
      id: 'daybook',
      titleEn: 'Day Book & Evening Cash Settlement',
      titleTa: 'நாட்குறிப்பு வரவு-செலவு & பண ஒப்படைப்பு',
      descEn: 'Day Book and Evening Cash Settlement. Balance your daily cash register effortlessly, log branch expenses, and verify evening agent handovers.',
      descTa: 'தினசரி ரொக்க வரவு செலவுகள், கிளை செலவுகள் மற்றும் கள முகவர்கள் வசூலித்த பணத்தை மாலையில் சரிபார்த்து எளிதாகக் கணக்கை முடிக்கலாம்.',
      path: '/daybook',
      selector: '.card, .btn-primary',
      badge: 'DAY BOOK · படி 6',
      icon: '📖',
      tipEn: 'Reconcile collected cash vs expenses and export daily closing balances.',
      tipTa: 'வசூலான ரொக்கம் மற்றும் செலவுகளை ஒப்பிட்டு கணக்கை முடிக்கலாம்.',
    },
    {
      id: 'themes_settings',
      titleEn: '5 Premium Themes & Excel Backup',
      titleTa: '5 பிரீமியம் தீம்கள் & எக்செல் பேக்கப்',
      descEn: 'Five Premium Themes and Excel Backup. Personalize your workspace with five beautiful themes, and download full audit Excel reports anytime.',
      descTa: 'டேலைட், டீப் ஓஷன், ஸ்லேட் உட்பட ஐந்து பிரீமியம் தீம்களைப் பயன்படுத்தலாம் மற்றும் முழுமையான எக்செல் அறிக்கைகளையும் பதிவிறக்கம் செய்து கொள்ளலாம்.',
      path: '/settings',
      selector: '#theme-toggle-btn, .btn',
      badge: 'SETTINGS · படி 7',
      icon: '🎨',
      tipEn: 'Switch themes anytime using the palette button in the header or sidebar.',
      tipTa: 'ஹெடரிலுள்ள பேலட் பட்டனை அழுத்தி எப்போது வேண்டுமானாலும் தீம் மாற்றலாம்.',
    },
  ],

  agent: [
    {
      id: 'agent_home',
      titleEn: "Welcome Agent! Today's Target",
      titleTa: 'வணக்கம் ஏஜென்ட்! இன்றைய வசூல் இலக்கு',
      descEn: "Welcome Agent! Here on your portal you can see your collection target for today, remaining dues, and customer visit list.",
      descTa: 'வணக்கம், நான் உங்கள் வழிகாட்டி பிரியா. உங்கள் போர்ட்டலில் இன்று வசூலிக்க வேண்டிய இலக்கு மற்றும் வாடிக்கையாளர் பட்டியலை எளிதாகக் காணலாம்.',
      path: '/',
      selector: '.stats-grid',
      badge: 'AGENT PORTAL · படி 1',
      icon: '🎯',
      tipEn: "Check your pending collections and track daily completion progress.",
      tipTa: 'இன்றைய வசூல் இலக்கை எளிதாக கண்காணிக்கலாம்.',
    },
    {
      id: 'agent_collections',
      titleEn: 'Doorstep Recovery & Instant Receipts',
      titleTa: 'வீட்டு வாசல் வசூல் & உடனடி ரசீதுகள்',
      descEn: 'Doorstep Recovery and Instant Receipts. Collect installments on the spot, enter the amount, and send automatic WhatsApp payment receipts.',
      descTa: 'வாடிக்கையாளரிடம் சென்றதும் தவணைத் தொகையைப் பதிவு செய்து, உடனடி வாட்ஸ்அப் ரசீதை ஒரே கிளிக்கில் அவர்களுக்கு அனுப்பி விடலாம்.',
      path: '/collections',
      selector: '.collection-card',
      badge: 'DOORSTEP PAY · படி 2',
      icon: '🧾',
      tipEn: 'Tap Quick Pay to record payment and dispatch customer receipt instantly.',
      tipTa: 'குவிக் பே மூலம் பணம் பெற்று ரசீதை உடனே அனுப்பலாம்.',
    },
    {
      id: 'agent_routes',
      titleEn: 'Live GPS Map & Collection Route',
      titleTa: 'லைவ் ஜி.பி.எஸ் மேப் & ரூட் மேனேஜர்',
      descEn: 'Live GPS Map and Collection Route. Use map navigation to see all due locations along your route, saving travel time and ensuring recovery.',
      descTa: 'லைவ் மேப் வழிகாட்டி மூலம் நீங்கள் செல்ல வேண்டிய வாடிக்கையாளர்களின் இருப்பிடங்களை வரிசையாகப் பார்த்து விரைவாக வசூல் செய்யலாம்.',
      path: '/collection-routes',
      selector: '.card, .leaflet-container',
      badge: 'GPS ROUTE · படி 3',
      icon: '🗺️',
      tipEn: 'Navigate directly with Google Maps integration for each customer stop.',
      tipTa: 'கூகுள் மேப் வழிகாட்டி மூலம் வாடிக்கையாளர் வீட்டுக்கு எளிதில் செல்லலாம்.',
    },
    {
      id: 'agent_credentials',
      titleEn: 'Customer Passbook Sharing',
      titleTa: 'வாடிக்கையாளர் பாஸ்புக் உள்நுழைவு',
      descEn: 'Customer Passbook Sharing. Help your customers access their digital passbook by sharing their login credentials directly to their phone.',
      descTa: 'வாடிக்கையாளர்கள் தங்கள் சொந்த மொபைலில் கணக்குகளைப் பார்க்க, டிஜிட்டல் பாஸ்புக் உள்நுழைவு விவரங்களை எளிதில் பகிர்ந்துகொள்ளலாம்.',
      path: '/',
      selector: '#agent-credentials-section',
      badge: 'PASSBOOK ACCESS · படி 4',
      icon: '🔑',
      tipEn: 'Borrowers can track their own loans and avoid payment confusion.',
      tipTa: 'வாடிக்கையாளர்களும் தங்கள் கடனை பார்த்துக்கொள்ள முடியும்.',
    },
    {
      id: 'agent_handover',
      titleEn: 'Evening Cash Handover to Admin',
      titleTa: 'மாலை நேர ரொக்க ஒப்படைப்பு',
      descEn: 'Evening Cash Handover. At the end of your shift, view your verified collection total and hand over the cash to the branch admin.',
      descTa: 'மாலை நேரம் வசூல் முடிந்ததும், வசூலான மொத்தப் பணத்தை அட்மினிடம் ஒப்படைத்து உடனடி ஒப்புதல் பெற்றுக்கொள்ளலாம்.',
      path: '/settlements',
      selector: '.card',
      badge: 'CASH HANDOVER · படி 5',
      icon: '🤝',
      tipEn: 'Your daily handover generates a transparent audit trail.',
      tipTa: 'உங்கள் ஒப்படைப்பு கணக்கு வெளிப்படையாக பதிவாகிவிடும்.',
    },
  ],

  customer: [
    {
      id: 'customer_welcome',
      titleEn: 'Your 24/7 Digital Passbook',
      titleTa: 'உங்கள் 24/7 டிஜிட்டல் பாஸ்புக்',
      descEn: 'Your 24/7 Digital Passbook. Welcome to your personal loan passbook! Here you can check your active loans, total repaid, and remaining balance.',
      descTa: 'உங்கள் டிஜிட்டல் பாஸ்புக்கிற்கு நல்வரவு. உங்கள் நடப்புக் கடன்கள், திருப்பிச் செலுத்திய தொகை மற்றும் நிலுவையை எப்போது வேண்டுமானாலும் இங்கே பார்க்கலாம்.',
      path: '/',
      selector: '.stat-card',
      badge: 'PASSBOOK · படி 1',
      icon: '📱',
      tipEn: 'Track your repayments anywhere, anytime on your mobile phone.',
      tipTa: 'உங்கள் மொபைலிலேயே கணக்குகளை எப்போது வேண்டுமானாலும் சரிபார்க்கலாம்.',
    },
    {
      id: 'customer_dues',
      titleEn: 'Due Dates & Upcoming Schedules',
      titleTa: 'தவணை தேதிகள் மற்றும் தொகை',
      descEn: 'Due Dates and Upcoming Schedules. Never miss a due date. View your upcoming installment amount, due calendar, and transaction history.',
      descTa: 'அடுத்த தவணைத் தேதி, செலுத்த வேண்டிய தொகை மற்றும் முழுமையான பரிவர்த்தனை வரலாற்றை முன்கூட்டியே தெளிவாக அறிந்து கொள்ளலாம்.',
      path: '/loans',
      selector: '.card, .collection-card',
      badge: 'SCHEDULE · படி 2',
      icon: '🗓️',
      tipEn: 'See full weekly or monthly repayment calendar and balance progress.',
      tipTa: 'முழுமையான தவணை அட்டவணை மற்றும் முன்னேற்றத்தை பார்க்கலாம்.',
    },
    {
      id: 'customer_receipts',
      titleEn: 'Verified Digital Receipts & Notifications',
      titleTa: 'டிஜிட்டல் கட்டண ரசீதுகள் & தீம்கள்',
      descEn: 'Verified Digital Receipts. Every installment paid is recorded with verified digital receipts, and you can customize the app with beautiful themes.',
      descTa: 'நீங்கள் செலுத்தும் ஒவ்வொரு தவணைக்கும் டிஜிட்டல் ரசீது உடனே பதிவாகும். உங்களுக்குப் பிடித்த வண்ண தீம்களையும் எளிதில் மாற்றிக் கொள்ளலாம்.',
      path: '/notifications',
      selector: '#theme-toggle-btn, .card',
      badge: 'RECEIPTS · படி 3',
      icon: '✨',
      tipEn: 'Instant receipt copies are always saved in your digital passbook.',
      tipTa: 'ரசீதுகள் அனைத்தும் உங்கள் பாஸ்புக்கில் எப்போதும் பாதுகாப்பாக இருக்கும்.',
    },
  ],
};

export const VOICE_MODEL_OPTIONS = [
  {
    id: 'indic-parler',
    name: 'AI4Bharat Indic-Parler-TTS',
    tag: 'IIT Madras AI',
    subtext: 'Open-Source Indic Neural Female (Tamil & English)',
    shortName: 'Indic-Parler',
    badgeColor: '#10b981',
  },
  {
    id: 'neural',
    name: 'Pallavi & Neerja Studio Neural',
    tag: 'Studio HD',
    subtext: 'Tamil (Pallavi) & Indian English (Neerja)',
    shortName: 'Pallavi / Neerja',
    badgeColor: '#ec4899',
  },
  {
    id: 'synth',
    name: 'Device Synthesizer',
    tag: 'Web Speech',
    subtext: 'Client Device Female Synthesizer',
    shortName: 'Device Synth',
    badgeColor: '#38bdf8',
  },
];

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const { user, isAdmin, isSuperAdmin, isCustomer, isAgent } = useAuth();
  const navigate = useNavigate();

  // Determine user role
  const resolvedRole = (isSuperAdmin || isAdmin) ? 'admin' : isCustomer ? 'customer' : 'agent';

  // Tour active state
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState(() => localStorage.getItem('finova_tour_lang') || 'ta'); // 'ta' (Tamil) or 'en' (English)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Voice model selection: 'indic-parler' (AI4Bharat Indic-Parler-TTS), 'neural' (Studio HD), or 'synth' (Web Speech API)
  const [voiceModel, setVoiceModel] = useState(() => localStorage.getItem('finova_tour_voice_model') || 'indic-parler');
  const [audioProgress, setAudioProgress] = useState(0);

  const utteranceRef = useRef(null);
  const audioRef = useRef(typeof Audio !== 'undefined' ? new Audio() : null);

  // Available steps for active role
  const steps = TOUR_STEPS_BY_ROLE[resolvedRole] || TOUR_STEPS_BY_ROLE.admin;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto prompt on first visit (only once per role)
  useEffect(() => {
    if (!user) return;
    const tourSeenKey = `finova_tour_seen_${resolvedRole}_${user.id || user.phone || 'default'}`;
    const hasSeen = localStorage.getItem(tourSeenKey);
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [user, resolvedRole]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('finova_tour_lang', language);
  }, [language]);

  // Save voice model preference
  useEffect(() => {
    localStorage.setItem('finova_tour_voice_model', voiceModel);
  }, [voiceModel]);

  // Stop any ongoing speech or audio
  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeaking(false);
    setAudioProgress(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Helper: pick best female voice from available browser voices
  const pickFemaleVoice = useCallback((voices, lang) => {
    const femaleKeywords = ['female', 'woman', 'girl', 'priya', 'zira', 'samantha', 'karen', 'moira',
      'fiona', 'tessa', 'victoria', 'heather', 'ava', 'allison', 'susan', 'joanna', 'salli',
      'kimberly', 'kendra', 'ivy', 'aria', 'jenny', 'ana', 'neerja', 'lekha', 'aditi', 'raveena', 'pallavi'];

    if (lang === 'ta') {
      const tamilFemale = voices.find(v =>
        (v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil')) &&
        femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
      if (tamilFemale) return { voice: tamilFemale, lang: 'ta-IN' };

      const tamilAny = voices.find(v => v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilAny) return { voice: tamilAny, lang: 'ta-IN' };

      const inFemale = voices.find(v =>
        (v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')) &&
        femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
      if (inFemale) return { voice: inFemale, lang: 'en-IN' };

      const enFemale = voices.find(v =>
        v.lang.startsWith('en') && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
      if (enFemale) return { voice: enFemale, lang: 'en-IN' };

      return { voice: null, lang: 'ta-IN' };
    } else {
      const inFemale = voices.find(v =>
        (v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')) &&
        femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
      if (inFemale) return { voice: inFemale, lang: 'en-IN' };

      const inAny = voices.find(v => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india'));
      if (inAny) return { voice: inAny, lang: 'en-IN' };

      const enFemale = voices.find(v =>
        v.lang.startsWith('en') && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
      );
      if (enFemale) return { voice: enFemale, lang: 'en-US' };

      const enAny = voices.find(v => v.lang.startsWith('en'));
      return { voice: enAny || null, lang: 'en-US' };
    }
  }, []);

  // Web Speech API fallback engine
  const speakViaSpeechSynthesis = useCallback((text, lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      utterance.rate = speechRate;
      utterance.pitch = 1.15; // Natural female pitch
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices() || [];
      const { voice, lang: resolvedLang } = pickFemaleVoice(voices, lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = resolvedLang;
      } else {
        utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAudioProgress(10);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setAudioProgress(100);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setAudioProgress(0);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      setIsSpeaking(false);
    }
  }, [speechRate, pickFemaleVoice]);

  // Main Speech Engine: Plays Neural Audio Clip or falls back to Web Speech Synthesis
  const speakStepText = useCallback((step, langOverride) => {
    if (!isVoiceEnabled || !step) {
      return;
    }

    const currentLang = langOverride || language;
    const textToSpeak = currentLang === 'ta'
      ? `${step.titleTa}. ${step.descTa}`
      : `${step.titleEn}. ${step.descEn}`;

    stopSpeech();

    // 1. Neural / Indic-Parler AI Voice Model (High-Fidelity Studio Female Clips)
    if ((voiceModel === 'indic-parler' || voiceModel === 'neural') && audioRef.current) {
      const audioUrl = `/tour-audio/${resolvedRole}_${step.id}_${currentLang}.mp3`;
      const audio = audioRef.current;
      audio.src = audioUrl;
      audio.playbackRate = speechRate;

      audio.onplay = () => {
        setIsSpeaking(true);
      };
      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setAudioProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioProgress(100);
      };
      audio.onerror = (e) => {
        console.warn('Neural/Indic-Parler audio file error:', e);
        if (voiceModel === 'synth') {
          speakViaSpeechSynthesis(textToSpeak, currentLang);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === 'AbortError') return;
          console.warn('Audio play prevented or interrupted:', err);
          if (voiceModel === 'synth') {
            speakViaSpeechSynthesis(textToSpeak, currentLang);
          }
        });
      }
    } else {
      // 2. Synthesizer Voice Model
      speakViaSpeechSynthesis(textToSpeak, currentLang);
    }
  }, [isVoiceEnabled, language, resolvedRole, voiceModel, speechRate, stopSpeech, speakViaSpeechSynthesis]);

  // Preview voice sample (can be triggered from modal or settings)
  const previewVoice = useCallback((langOverride, modelOverride) => {
    const lang = langOverride || language;
    const model = modelOverride || voiceModel;
    stopSpeech();

    if ((model === 'indic-parler' || model === 'neural') && audioRef.current) {
      const audio = audioRef.current;
      audio.src = `/tour-audio/welcome_modal_${lang}.mp3`;
      audio.playbackRate = speechRate;
      audio.onplay = () => setIsSpeaking(true);
      audio.ontimeupdate = () => {
        if (audio.duration) setAudioProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioProgress(100);
      };
      audio.onerror = () => {
        if (model === 'synth') {
          const fallbackText = lang === 'ta'
            ? 'வணக்கம்! நான் உங்கள் வழிகாட்டி பல்லவி. உங்கள் ஃபினோவா நிதி மேலாண்மை செயலிக்கு நல்வரவு!'
            : 'Hello! I am Neerja, your Finova digital advisor. Welcome to your finance management app!';
          speakViaSpeechSynthesis(fallbackText, lang);
        }
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name === 'AbortError') return;
          console.warn('Preview audio playback prevented:', err);
          if (model === 'synth') {
            const fallbackText = lang === 'ta'
              ? 'வணக்கம்! நான் உங்கள் வழிகாட்டி பல்லவி.'
              : 'Hello! I am Neerja, your Finova digital advisor.';
            speakViaSpeechSynthesis(fallbackText, lang);
          }
        });
      }
    } else {
      const sampleText = lang === 'ta'
        ? 'வணக்கம்! நான் உங்கள் வழிகாட்டி பல்லவி. இது கணினி பெண் குரல் மாதிரி.'
        : 'Hello! I am Neerja, testing your device synthesizer female voice.';
      speakViaSpeechSynthesis(sampleText, lang);
    }
  }, [language, voiceModel, speechRate, stopSpeech, speakViaSpeechSynthesis]);

  // Start Tour
  const startTour = useCallback((customRole) => {
    setShowWelcomeModal(false);
    setIsTourActive(true);
    setCurrentStepIndex(0);

    const activeSteps = TOUR_STEPS_BY_ROLE[customRole || resolvedRole] || steps;
    const firstStep = activeSteps[0];

    // Mark as seen
    if (user) {
      const tourSeenKey = `finova_tour_seen_${customRole || resolvedRole}_${user.id || user.phone || 'default'}`;
      localStorage.setItem(tourSeenKey, 'true');
    }

    if (firstStep?.path && window.location.pathname !== firstStep.path) {
      navigate(firstStep.path);
    }

    // Direct synchronous call maintains browser user-gesture autoplay privilege
    speakStepText(firstStep);
  }, [resolvedRole, steps, user, navigate, speakStepText]);

  // Stop / Close Tour
  const stopTour = useCallback(() => {
    stopSpeech();
    setIsTourActive(false);
  }, [stopSpeech]);

  // Go to Next Step
  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      const nxt = steps[nextIdx];
      setCurrentStepIndex(nextIdx);

      if (nxt?.path && window.location.pathname !== nxt.path) {
        navigate(nxt.path);
      }

      // Direct synchronous call maintains browser user-gesture autoplay privilege
      speakStepText(nxt);
    } else {
      stopTour();
    }
  }, [currentStepIndex, steps, navigate, speakStepText, stopTour]);

  // Go to Previous Step
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      const prv = steps[prevIdx];
      setCurrentStepIndex(prevIdx);

      if (prv?.path && window.location.pathname !== prv.path) {
        navigate(prv.path);
      }

      // Direct synchronous call maintains browser user-gesture autoplay privilege
      speakStepText(prv);
    }
  }, [currentStepIndex, steps, navigate, speakStepText]);

  // Replay current step audio
  const replayAudio = useCallback(() => {
    if (currentStep) {
      speakStepText(currentStep);
    }
  }, [currentStep, speakStepText]);

  // Toggle Language
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(newLang);
    if (isTourActive && currentStep) {
      speakStepText(currentStep, newLang);
    }
  }, [language, isTourActive, currentStep, speakStepText]);

  // Toggle Voice Mute
  const toggleVoice = useCallback(() => {
    if (isVoiceEnabled) {
      stopSpeech();
      setIsVoiceEnabled(false);
    } else {
      setIsVoiceEnabled(true);
      if (currentStep) {
        speakStepText(currentStep);
      }
    }
  }, [isVoiceEnabled, stopSpeech, currentStep, speakStepText]);

  // Pre-load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStep,
        currentStepIndex,
        totalSteps: steps.length,
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
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside a TourProvider');
  return ctx;
}
