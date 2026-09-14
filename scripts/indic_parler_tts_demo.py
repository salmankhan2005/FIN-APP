# -*- coding: utf-8 -*-
"""
AI4Bharat Indic-Parler-TTS Demo & Inference Script
Model: ai4bharat/indic-parler-tts (or ai4bharat/indic-parler-tts-pretrained)
License: Apache 2.0 (AI4Bharat / IIT Madras)

This script demonstrates how to generate natural female speech in Tamil & Indian English
using AI4Bharat's state-of-the-art Indic-Parler-TTS model.
"""

import sys
import os

# Voice prompt descriptions for Priya character
PRIYA_PROMPTS = {
    "ta": {
        "text": "வணக்கம்! நான் உங்கள் டிஜிட்டல் வழிகாட்டி பிரியா. ஃபினோவா செயலிக்கு உங்களை அன்போடு வரவேற்கிறேன்.",
        "description": "A female speaker delivers a clear, warm and expressive Tamil speech with natural prosody and studio audio quality."
    },
    "en": {
        "text": "Hello! I am Priya, your Finova digital advisor. Welcome to your personal finance management system.",
        "description": "A female speaker delivers a clear, warm and expressive Indian English speech with natural prosody and studio audio quality."
    }
}

def generate_with_parler_tts(lang="ta", output_path="priya_indic_parler.wav"):
    try:
        import torch
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        import soundfile as sf
    except ImportError:
        print("[Notice] To run local Indic-Parler-TTS inference, install:")
        print("pip install git+https://github.com/huggingface/parler-tts.git soundfile")
        return False

    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"Loading ai4bharat/indic-parler-tts on device: {device}...")

    model_id = "ai4bharat/indic-parler-tts"
    model = ParlerTTSForConditionalGeneration.from_pretrained(model_id).to(device)
    tokenizer = AutoTokenizer.from_pretrained(model_id)

    prompt_info = PRIYA_PROMPTS.get(lang, PRIYA_PROMPTS["ta"])
    text = prompt_info["text"]
    description = prompt_info["description"]

    print(f"Synthesizing [{lang}] Text: {text}")
    print(f"Voice Description: {description}")

    input_ids = tokenizer(description, return_tensors="pt").input_ids.to(device)
    prompt_input_ids = tokenizer(text, return_tensors="pt").input_ids.to(device)

    with torch.no_grad():
        generation = model.generate(input_ids=input_ids, prompt_input_ids=prompt_input_ids)

    audio_arr = generation.cpu().numpy().squeeze()
    sf.write(output_path, audio_arr, model.config.sampling_rate)
    print(f"Saved generated audio to: {output_path}")
    return True

if __name__ == "__main__":
    lang = sys.argv[1] if len(sys.argv) > 1 else "ta"
    print("=== AI4Bharat Indic-Parler-TTS Generator ===")
    generate_with_parler_tts(lang)
