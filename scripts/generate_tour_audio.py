# -*- coding: utf-8 -*-
import asyncio
import os
import edge_tts

# Fluent, continuous, natural human phrasing without choppy breaks or pauses
STEPS = {
    # Admin
    "admin_welcome": {
        "ta": "வணக்கம், நான் உங்கள் வழிகாட்டி பிரியா. ஃபினோவா நிதி மேலாண்மை அமைப்பின் அனைத்து முக்கிய அம்சங்களையும் உங்களுக்கு எளிமையாக விளக்குகிறேன், வாருங்கள்.",
        "en": "Hello! I am Priya, your Finova digital advisor. I will guide you through all the core features of your finance management system. Let us take a quick walkthrough."
    },
    "admin_financials": {
        "ta": "இங்கே நீங்கள் வழங்கிய மொத்த கடன், அசல் நிலுவை, வட்டி லாபம் மற்றும் இன்றைய வசூல் தொகையை ஒரே பார்வையில் விரிவாகக் கண்காணிக்கலாம்.",
        "en": "Live Financial Analytics. Here you can track Total Disbursed capital, Principal outstanding, Interest profit earned, and today's recoveries at a single glance."
    },
    "admin_customers": {
        "ta": "வாடிக்கையாளர் விபரம், ஆதார் புகைப்படம், இருப்பிடம் மற்றும் ஜாமீன் சரிபார்ப்புகளைப் பாதுகாப்பாகப் பதிவு செய்து நிர்வகிக்கலாம்.",
        "en": "Customer Profiles and Guarantor KYC. Manage all your borrowers with security. Capture full profiles, documents, and complete guarantor KYC."
    },
    "admin_create_loan": {
        "ta": "வட்டி கடன், கழிவு கடன் அல்லது தவணை கடன்களை தினசரி, வாராந்திர மற்றும் மாதாந்திர தவணைகளுடன் தானியங்கி கணக்கீட்டுடன் எளிதாக உருவாக்கலாம்.",
        "en": "Adaptive Smart Loan Creation. Create Flat interest loans, Kandhu Vatti, or EMI loans with daily, weekly, or monthly repayment schedules."
    },
    "admin_collections": {
        "ta": "இன்றைய வசூல் நிலுவைகளைப் பார்வையிட்டு தொகையைப் பதிவு செய்து, வாடிக்கையாளரின் வாட்ஸ்அப் எண்ணிற்கு உடனடி டிஜிட்டல் ரசீதை அனுப்பலாம்.",
        "en": "Doorstep Collections and WhatsApp Receipts. View today's due list, record collections with single-click pay, and send instant receipts to customers."
    },
    "admin_daybook": {
        "ta": "தினசரி ரொக்க வரவு செலவுகள், கிளை செலவுகள் மற்றும் கள முகவர்கள் வசூலித்த பணத்தை மாலையில் சரிபார்த்து எளிதாகக் கணக்கை முடிக்கலாம்.",
        "en": "Day Book and Evening Cash Settlement. Balance your daily cash register effortlessly, log branch expenses, and verify evening agent handovers."
    },
    "admin_themes_settings": {
        "ta": "டேலைட், டீப் ஓஷன், ஸ்லேட் உட்பட ஐந்து பிரீமியம் தீம்களைப் பயன்படுத்தலாம் மற்றும் முழுமையான எக்செல் அறிக்கைகளையும் பதிவிறக்கம் செய்து கொள்ளலாம்.",
        "en": "Five Premium Themes and Excel Backup. Personalize your workspace with five beautiful themes, and download full audit Excel reports anytime."
    },

    # Agent
    "agent_agent_home": {
        "ta": "வணக்கம், நான் உங்கள் வழிகாட்டி பிரியா. உங்கள் போர்ட்டலில் இன்று வசூலிக்க வேண்டிய இலக்கு மற்றும் வாடிக்கையாளர் பட்டியலை எளிதாகக் காணலாம்.",
        "en": "Welcome Agent! Here on your portal you can see your collection target for today, remaining dues, and customer visit list."
    },
    "agent_agent_collections": {
        "ta": "வாடிக்கையாளரிடம் சென்றதும் தவணைத் தொகையைப் பதிவு செய்து, உடனடி வாட்ஸ்அப் ரசீதை ஒரே கிளிக்கில் அவர்களுக்கு அனுப்பி விடலாம்.",
        "en": "Doorstep Recovery and Instant Receipts. Collect installments on the spot, enter the amount, and send automatic WhatsApp payment receipts."
    },
    "agent_agent_routes": {
        "ta": "லைவ் மேப் வழிகாட்டி மூலம் நீங்கள் செல்ல வேண்டிய வாடிக்கையாளர்களின் இருப்பிடங்களை வரிசையாகப் பார்த்து விரைவாக வசூல் செய்யலாம்.",
        "en": "Live GPS Map and Collection Route. Use map navigation to see all due locations along your route, saving travel time and ensuring recovery."
    },
    "agent_agent_credentials": {
        "ta": "வாடிக்கையாளர்கள் தங்கள் சொந்த மொபைலில் கணக்குகளைப் பார்க்க, டிஜிட்டல் பாஸ்புக் உள்நுழைவு விவரங்களை எளிதில் பகிர்ந்துகொள்ளலாம்.",
        "en": "Customer Passbook Sharing. Help your customers access their digital passbook by sharing their login credentials directly to their phone."
    },
    "agent_agent_handover": {
        "ta": "மாலை நேரம் வசூல் முடிந்ததும், வசூலான மொத்தப் பணத்தை அட்மினிடம் ஒப்படைத்து உடனடி ஒப்புதல் பெற்றுக்கொள்ளலாம்.",
        "en": "Evening Cash Handover. At the end of your shift, view your verified collection total and hand over the cash to the branch admin."
    },

    # Customer
    "customer_customer_welcome": {
        "ta": "உங்கள் டிஜிட்டல் பாஸ்புக்கிற்கு நல்வரவு. உங்கள் நடப்புக் கடன்கள், திருப்பிச் செலுத்திய தொகை மற்றும் நிலுவையை எப்போது வேண்டுமானாலும் இங்கே பார்க்கலாம்.",
        "en": "Your 24/7 Digital Passbook. Welcome to your personal loan passbook! Here you can check your active loans, total repaid, and remaining balance."
    },
    "customer_customer_dues": {
        "ta": "அடுத்த தவணைத் தேதி, செலுத்த வேண்டிய தொகை மற்றும் முழுமையான பரிவர்த்தனை வரலாற்றை முன்கூட்டியே தெளிவாக அறிந்து கொள்ளலாம்.",
        "en": "Due Dates and Upcoming Schedules. Never miss a due date. View your upcoming installment amount, due calendar, and transaction history."
    },
    "customer_customer_receipts": {
        "ta": "நீங்கள் செலுத்தும் ஒவ்வொரு தவணைக்கும் டிஜிட்டல் ரசீது உடனே பதிவாகும். உங்களுக்குப் பிடித்த வண்ண தீம்களையும் எளிதில் மாற்றிக் கொள்ளலாம்.",
        "en": "Verified Digital Receipts. Every installment paid is recorded with verified digital receipts, and you can customize the app with beautiful themes."
    },

    # Modal prompt
    "welcome_modal": {
        "ta": "வணக்கம், ஃபினோவா நிதி மேலாண்மை செயலிக்கு நல்வரவு. முக்கிய அம்சங்களை அறிந்துகொள்ள ஒரு நிமிட குரல் வழிகாட்டியைத் தொடங்கலாமா?",
        "en": "Welcome to Finova! Would you like a quick 1-minute voice guided tour to discover all tools and features?"
    }
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "tour-audio")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE_TA = "ta-IN-PallaviNeural"  # Microsoft Azure Neural Female Tamil Voice
VOICE_EN = "en-IN-NeerjaNeural"   # Microsoft Azure Neural Female Indian English Voice

async def generate_all():
    total = len(STEPS) * 2
    count = 0
    print(f"Regenerating all {total} clips with fluent, natural phrasing and rate=+5%...")

    for key, text_dict in STEPS.items():
        # Tamil (smooth, fluent pace with rate=+5%)
        out_ta = os.path.join(OUTPUT_DIR, f"{key}_ta.mp3")
        comm_ta = edge_tts.Communicate(text_dict["ta"], VOICE_TA, rate="+5%")
        await comm_ta.save(out_ta)
        print(f"[{count+1}/{total}] Regenerated {key}_ta.mp3 (Fluent Tamil)")
        count += 1

        # English (smooth, fluent pace with rate=+5%)
        out_en = os.path.join(OUTPUT_DIR, f"{key}_en.mp3")
        comm_en = edge_tts.Communicate(text_dict["en"], VOICE_EN, rate="+5%")
        await comm_en.save(out_en)
        print(f"[{count+1}/{total}] Regenerated {key}_en.mp3 (Fluent English)")
        count += 1

    print("\nAll 32 clips successfully regenerated with ultra-fluent, professional speech!")

if __name__ == "__main__":
    asyncio.run(generate_all())
