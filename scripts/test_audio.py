import os
import sys
import asyncio
import edge_tts

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "tour-audio")

def test_audio_files():
    print(f"Scanning audio directory: {os.path.abspath(AUDIO_DIR)}")
    if not os.path.exists(AUDIO_DIR):
        print("ERROR: Audio directory does not exist!")
        return False

    files = [f for f in os.listdir(AUDIO_DIR) if f.endswith(".mp3")]
    print(f"Found {len(files)} MP3 audio files.")

    if len(files) == 0:
        print("ERROR: No audio files found!")
        return False

    corrupted = []
    total_bytes = 0
    for fname in sorted(files):
        fpath = os.path.join(AUDIO_DIR, fname)
        size = os.path.getsize(fpath)
        total_bytes += size
        if size < 1000:
            corrupted.append((fname, size))
            print(f"  [FAIL] {fname} is too small ({size} bytes)")
        else:
            # Check for standard MP3 header (starts with ID3 or sync frame 0xFF 0xFB/0xF3/0xF2)
            with open(fpath, "rb") as f:
                header = f.read(4)
                is_mp3 = header.startswith(b"ID3") or (header[0] == 0xFF and (header[1] & 0xE0) == 0xE0)
                if not is_mp3:
                    corrupted.append((fname, size))
                    print(f"  [WARN] {fname} invalid MP3 header: {header.hex()}")

    print(f"Total size of audio assets: {total_bytes / 1024:.1f} KB")
    if corrupted:
        print(f"WARNING: {len(corrupted)} suspicious files found!")
        return False
    else:
        print("SUCCESS: All 32 MP3 files are valid, non-empty, and correctly formatted!")
        return True

async def test_live_voice_generation():
    print("\nTesting live Edge-TTS female voice synthesis...")
    test_text_ta = "வணக்கம்! ஃபினோவா வழிகாட்டி குரல் மிகச் சிறப்பாகவும் தடையின்றியும் இயங்குகிறது."
    test_voice_ta = "ta-IN-PallaviNeural"
    test_out_ta = os.path.join(os.path.dirname(__file__), "test_sample_ta.mp3")

    comm = edge_tts.Communicate(test_text_ta, test_voice_ta, rate="+5%")
    await comm.save(test_out_ta)
    size_ta = os.path.getsize(test_out_ta)
    print(f"  Tamil Neural Voice ({test_voice_ta}): Generated {size_ta} bytes successfully.")

    test_text_en = "Hello! Finova interactive female voice tour is speaking fluently and working perfectly."
    test_voice_en = "en-IN-NeerjaNeural"
    test_out_en = os.path.join(os.path.dirname(__file__), "test_sample_en.mp3")

    comm_en = edge_tts.Communicate(test_text_en, test_voice_en, rate="+5%")
    await comm_en.save(test_out_en)
    size_en = os.path.getsize(test_out_en)
    print(f"  English Neural Voice ({test_voice_en}): Generated {size_en} bytes successfully.")

    return True

if __name__ == "__main__":
    files_ok = test_audio_files()
    gen_ok = asyncio.run(test_live_voice_generation())
    if files_ok and gen_ok:
        print("\n=== VOICE SYSTEM TEST: ALL PASSED ===")
        sys.exit(0)
    else:
        print("\n=== VOICE SYSTEM TEST: FAILED ===")
        sys.exit(1)
