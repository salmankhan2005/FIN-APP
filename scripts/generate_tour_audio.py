# -*- coding: utf-8 -*-
import asyncio
import os
import edge_tts

STEPS = {
    # Admin
    "admin_welcome": {
        "ta": "Finova நிர்வாகி வழிகாட்டிக்கு வரவேற்கிறோம்! வணக்கம்! நான் உங்கள் டிஜிட்டல் வழிகாட்டி பிரியா. உங்கள் ஃபினோவா நிதி மேலாண்மை அமைப்பின் அனைத்து முக்கிய அம்சங்களையும் உங்களுக்கு எளிமையாக விளக்குகிறேன். வாருங்கள்!",
        "en": "Welcome to Finova Admin Tour. Hello! I am Priya, your Finova digital advisor. I will guide you through all the core features of your finance management system. Let's take a quick 1-minute walkthrough!"
    },
    "admin_financials": {
        "ta": "முழுமையான வணிக நிதி நிலவரம். இங்கே நீங்கள் வழங்கிய மொத்த கடன், அசல் நிலுவை, வட்டி லாபம் மற்றும் இன்றைய வசூல் தொகையை ஒரே பார்வையில் கண்காணிக்கலாம். விவரங்களுக்கு கார்டுகளை கிளிக் செய்யலாம்.",
        "en": "Live Financial Analytics & Metrics. Here you can track Total Disbursed capital, Principal outstanding, Interest profit earned, and today's recoveries at a single glance. Tap any card for a full drill-down breakdown."
    },
    "admin_customers": {
        "ta": "வாடிக்கையாளர் பதிவு மற்றும் ஜாமீன் சரிபார்ப்பு. கடன் வாங்குபவர்களை பாதுகாப்பாக நிர்வகிக்கலாம். வாடிக்கையாளர் விபரம், ஆதார் புகைப்படம், இருப்பிடம் மற்றும் ஜாமீன் விபரங்களை எளிதாக பதிவு செய்யலாம்.",
        "en": "Customer Profiles & Guarantor KYC. Manage all your borrowers with security. Capture full profiles, identity documents, GPS location, and complete Guarantor KYC to prevent risk."
    },
    "admin_create_loan": {
        "ta": "புதிய கடன் உருவாக்கம். வட்டி கடன், கழிவு கடன் அல்லது தவணை கடன்களை தினசரி, வாராந்திர அல்லது மாதாந்திர தவணைகளுடன் எளிதாக உருவாக்கலாம். கணக்கீடுகள் தானாகவே நடக்கும்.",
        "en": "Adaptive Smart Loan Creation. Create Regular Flat interest loans, Deduction-based Kandhu Vatti, or EMI loans with daily, weekly, or monthly repayment schedules. Dynamic calculations are done automatically."
    },
    "admin_collections": {
        "ta": "கள வசூல் மற்றும் உடனடி டிஜிட்டல் ரசீதுகள். இன்றைய வசூல் நிலுவைகளை பார்வையிட்டு, தொகையை பதிவு செய்து, வாடிக்கையாளரின் வாட்ஸ்அப் அல்லது எஸ்.எம்.எஸ்-க்கு ரசீதை உடனே அனுப்பலாம்.",
        "en": "Doorstep Collections & WhatsApp Receipts. View today's due list, record collections with single-click quick pay, and send instant WhatsApp and SMS payment receipts directly to customers."
    },
    "admin_daybook": {
        "ta": "நாட்குறிப்பு வரவு செலவு மற்றும் பண ஒப்படைப்பு. தினசரி ரொக்க வரவு செலவுகளை சமநிலைப்படுத்தலாம். கிளை செலவுகள் மற்றும் கள முகவர்கள் வசூலித்த பணத்தை மாலையில் சரிபார்த்து ஒப்புதல் அளிக்கலாம்.",
        "en": "Day Book & Evening Cash Settlement. Balance your daily cash register effortlessly. Log branch expenses, verify evening cash handovers from collection agents, and close the day with audit logs."
    },
    "admin_themes_settings": {
        "ta": "5 பிரீமியம் தீம்கள் மற்றும் எக்செல் பேக்கப். டேலைட், டீப் ஓஷன், ஸ்லேட், ஃபாரஸ்ட், ராயல் இண்டிகோ என 5 தீம்களை பயன்படுத்தலாம். மேலும் முழுமையான எக்செல் பேக்கப்பையும் டவுன்லோட் செய்யலாம்!",
        "en": "5 Premium Themes & Excel Backup. Personalize your workspace with Daylight, Deep Ocean, Slate Obsidian, Forest Finance, or Royal Indigo themes. Download full multi-sheet audit Excel reports anytime!"
    },

    # Agent
    "agent_agent_home": {
        "ta": "வணக்கம் ஏஜென்ட்! இன்றைய வசூல் இலக்கு. வணக்கம்! நான் உங்கள் வழிகாட்டி பிரியா. இங்கே நீங்கள் இன்று வசூலிக்க வேண்டிய மொத்த தொகை, மீதமுள்ள நிலுவை மற்றும் சந்திக்க வேண்டிய வாடிக்கையாளர் பட்டியலை காணலாம்.",
        "en": "Welcome Agent! Today's Target. Hello! I am Priya, your field assistant. Here on your agent portal you can see your total due collection target for today, remaining dues, and list of customers to visit."
    },
    "agent_agent_collections": {
        "ta": "வீட்டு வாசல் வசூல் மற்றும் உடனடி ரசீதுகள். வாடிக்கையாளரிடம் சென்றதும் தொகையை பதிவு செய்து, உடனடி வாட்ஸ்அப் ரசீதை ஒரே கிளிக்கில் அவர்களுக்கு அனுப்பி விடலாம்.",
        "en": "Doorstep Recovery & Instant Receipts. Collect installments on the spot. Search by customer name, enter the amount, and send automatic WhatsApp payment receipts in seconds."
    },
    "agent_agent_routes": {
        "ta": "லைவ் ஜி.பி.எஸ் மேப் மற்றும் ரூட் மேனேஜர். மேப் நேவிகேஷன் மூலம் நீங்கள் செல்ல வேண்டிய அனைத்து வாடிக்கையாளர்களின் இருப்பிடங்களையும் வரிசையாக பார்த்து விரைவாக வசூல் செய்யலாம்.",
        "en": "Live GPS Map & Collection Route. Use interactive map navigation to see all due locations mapped out along your route, saving travel time and ensuring 100% recovery."
    },
    "agent_agent_credentials": {
        "ta": "வாடிக்கையாளர் பாஸ்புக் உள்நுழைவு. வாடிக்கையாளர்கள் தங்கள் சொந்த மொபைலில் கணக்குகளை பார்க்க பாஸ்புக் உள்நுழைவு விவரங்களை எளிதில் பகிர்ந்துகொள்ளலாம்.",
        "en": "Customer Passbook Sharing. Help your customers access their digital passbook. Share their one-click login credentials directly to their phone."
    },
    "agent_agent_handover": {
        "ta": "மாலை நேர ரொக்க ஒப்படைப்பு. மாலை நேரம் வசூல் முடிந்ததும், வசூலான மொத்த பணத்தை அட்மினிடம் ஒப்படைத்து கணக்கை உடனே முடித்துக் கொள்ளலாம்.",
        "en": "Evening Cash Handover to Admin. At the end of your field shift, view your verified collection total, hand over the cash to the branch admin, and obtain closing confirmation."
    },

    # Customer
    "customer_customer_welcome": {
        "ta": "உங்கள் 24/7 டிஜிட்டல் பாஸ்புக். உங்கள் கடன் பாஸ்புக்கிற்கு வரவேற்கிறோம்! உங்கள் நடப்புக் கடன்கள், திருப்பி செலுத்திய தொகை மற்றும் மீதமுள்ள நிலுவையை எப்போது வேண்டுமானாலும் இங்கே பார்க்கலாம்.",
        "en": "Your 24/7 Digital Passbook. Welcome to your personal loan passbook! Here you can check your active loans, total borrowed amount, total repaid, and remaining balance anytime."
    },
    "customer_customer_dues": {
        "ta": "தவணை தேதிகள் மற்றும் தொகை. அடுத்த தவணை தேதி மற்றும் செலுத்த வேண்டிய தொகையை முன்கூட்டியே தெளிவாக அறிந்து கொள்ளலாம்.",
        "en": "Due Dates & Upcoming Schedules. Never miss a due date. View your upcoming installment amount, due calendar, and complete transaction history."
    },
    "customer_customer_receipts": {
        "ta": "டிஜிட்டல் கட்டண ரசீதுகள் மற்றும் தீம்கள். நீங்கள் செலுத்தும் ஒவ்வொரு தவணைக்கும் டிஜிட்டல் ரசீது உடனே பதிவாகும். உங்களுக்கு பிடித்த வண்ண தீம்களையும் எளிதில் மாற்றிக் கொள்ளலாம்!",
        "en": "Verified Digital Receipts & Notifications. Every installment paid is recorded with verified digital receipts. You can also customize your app with 5 beautiful themes to match your mood!"
    },

    # Modal prompt
    "welcome_modal": {
        "ta": "வணக்கம்! ஃபினோவா செயலிக்கு நல்வரவு. அனைத்து ஆப்ஷன்களையும் தெரிந்து கொள்ள 1 நிமிட ஆடியோ வழிகாட்டியை தொடங்கலாமா?",
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
    print(f"Generating {total} voice model audio clips into {OUTPUT_DIR}...")

    for key, text_dict in STEPS.items():
        # Tamil
        out_ta = os.path.join(OUTPUT_DIR, f"{key}_ta.mp3")
        if not os.path.exists(out_ta):
            comm = edge_tts.Communicate(text_dict["ta"], VOICE_TA)
            await comm.save(out_ta)
            print(f"[{count+1}/{total}] Generated {key}_ta.mp3 ({VOICE_TA})")
        else:
            print(f"[{count+1}/{total}] Skipped existing {key}_ta.mp3")
        count += 1

        # English
        out_en = os.path.join(OUTPUT_DIR, f"{key}_en.mp3")
        if not os.path.exists(out_en):
            comm = edge_tts.Communicate(text_dict["en"], VOICE_EN)
            await comm.save(out_en)
            print(f"[{count+1}/{total}] Generated {key}_en.mp3 ({VOICE_EN})")
        else:
            print(f"[{count+1}/{total}] Skipped existing {key}_en.mp3")
        count += 1

    print("\nAll female neural voice model files generated successfully!")

if __name__ == "__main__":
    asyncio.run(generate_all())
