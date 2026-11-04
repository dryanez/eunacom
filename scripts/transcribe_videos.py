#!/usr/bin/env python3
"""
⚡ CLOUD GROQ WHISPER-LARGE-V3 TURBO TRANSCRIBER FOR BOARDS & BEYOND
===================================================================
- Model: whisper-large-v3-turbo on Groq LPU Cloud
- Speed: ~2.5s to 3.5s per 15-minute lecture
- Local GPU Load: ZERO (0%)
- Local CPU Load: MINIMAL (< 5% FFmpeg audio prep)
- Full Output:
    1. Full Text Transcripts (.txt)
    2. Interactive Timestamped JSON (.json)
    3. Subtitles (.vtt)
- Automatic rate-limit handling & resume
"""

import os
import sys
import re
import json
import time
import subprocess
import tempfile
import urllib.request
from pathlib import Path

# Force UTF-8 on Windows Console
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUNBUFFERED"] = "1"
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
VIDEOS_DIR = Path("D:/Telegram_BnB_Videos")
TRANSCRIPTS_DIR = Path("D:/Telegram_BnB_Videos/transcripts")
MANIFEST_FILE = TRANSCRIPTS_DIR / "transcription_manifest.json"
LOG_FILE = TRANSCRIPTS_DIR / "transcriber.log"


def format_timestamp(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"


def load_manifest() -> dict:
    if MANIFEST_FILE.exists():
        try:
            return json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_manifest(manifest: dict):
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_FILE.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")


def log(msg: str):
    print(msg, flush=True)
    try:
        TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass


def extract_light_audio(video_path: Path, temp_mp3_path: str) -> bool:
    cmd = [
        "ffmpeg", "-nostdin", "-y", "-i", str(video_path),
        "-vn", "-ar", "16000", "-ac", "1", "-b:a", "32k",
        temp_mp3_path
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=45)
        return res.returncode == 0 and os.path.exists(temp_mp3_path) and os.path.getsize(temp_mp3_path) > 1000
    except Exception:
        return False


def call_groq_whisper(mp3_path: str) -> dict:
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()

    def add_field(name, value):
        nonlocal body
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode("utf-8"))

    def add_file(name, filename, file_bytes):
        nonlocal body
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode("utf-8"))
        body.extend(file_bytes)
        body.extend(b"\r\n")

    with open(mp3_path, "rb") as fp:
        audio_data = fp.read()

    add_file("file", "audio.mp3", audio_data)
    add_field("model", "whisper-large-v3-turbo")
    add_field("response_format", "verbose_json")
    add_field("temperature", "0")
    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        data=bytes(body),
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "User-Agent": "Groq-Client/1.0"
        }
    )

    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    log("=" * 70)
    log("⚡ CLOUD GROQ WHISPER-LARGE-V3 TURBO TRANSCRIBER")
    log(f"Videos Directory: {VIDEOS_DIR}")
    log(f"Transcripts Directory: {TRANSCRIPTS_DIR}")
    log("=" * 70)

    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    temp_dir = tempfile.gettempdir()

    while True:
        all_videos = [f for f in VIDEOS_DIR.rglob("*.mp4") if "transcripts" not in str(f)]
        total_videos = len(all_videos)

        pending_videos = []
        for v in all_videos:
            rel_path = v.relative_to(VIDEOS_DIR)
            out_stem = TRANSCRIPTS_DIR / rel_path.with_suffix("")
            json_file = out_stem.with_suffix(".json")
            txt_file = out_stem.with_suffix(".txt")
            if json_file.exists() and txt_file.exists() and txt_file.stat().st_size > 100:
                continue
            pending_videos.append((v, rel_path, out_stem, json_file, txt_file))

        completed_count = total_videos - len(pending_videos)
        log(f"\n🔄 Library Status: {completed_count}/{total_videos} completed ({(completed_count/max(1, total_videos))*100:.1f}%). {len(pending_videos)} pending.")

        if not pending_videos:
            log("🎉 ALL VIDEOS TRANSCRIBED! Waiting 60s for new videos...")
            time.sleep(60)
            continue

        for idx, (video_path, rel_path, out_stem, json_file, txt_file) in enumerate(pending_videos, 1):
            curr_completed = total_videos - len(pending_videos) + idx
            pct = (curr_completed / total_videos) * 100
            log(f"[{curr_completed}/{total_videos} ({pct:.1f}%)] ☁️ Groq Transcribing: {video_path.name}")
            t0 = time.time()
            temp_mp3 = os.path.join(temp_dir, f"bnb_groq_{os.getpid()}_{idx}.mp3")

            vtt_file = out_stem.with_suffix(".vtt")

            try:
                # 1. Quick audio extraction (< 2s)
                extracted = extract_light_audio(video_path, temp_mp3)
                if not extracted:
                    log(f"   ⚠️ FFmpeg audio extraction failed for {video_path.name}, skipping.")
                    continue

                # 2. Cloud Whisper Turbo Call (2-3s)
                retries = 3
                res_data = None
                for attempt in range(retries):
                    try:
                        res_data = call_groq_whisper(temp_mp3)
                        break
                    except urllib.error.HTTPError as he:
                        if he.code == 429: # Rate limit
                            log(f"   ⏳ Rate limited by Groq. Sleeping 10s... (attempt {attempt+1}/{retries})")
                            time.sleep(10)
                        else:
                            log(f"   ❌ Groq HTTP Error {he.code}: {he.read().decode('utf-8', errors='ignore')}")
                            time.sleep(3)
                    except Exception as ex:
                        log(f"   ❌ Network error: {ex}. Retrying...")
                        time.sleep(3)

                if not res_data:
                    log(f"   ❌ Failed to transcribe {video_path.name} via Groq.")
                    continue

                # 3. Parse segments
                raw_segments = res_data.get("segments", [])
                segment_list = []
                full_text_lines = []
                vtt_lines = ["WEBVTT", ""]

                for s_idx, seg in enumerate(raw_segments, 1):
                    text_clean = seg.get("text", "").strip()
                    start_sec = seg.get("start", 0.0)
                    end_sec = seg.get("end", 0.0)
                    segment_list.append({
                        "id": s_idx,
                        "start": round(start_sec, 2),
                        "end": round(end_sec, 2),
                        "start_formatted": format_timestamp(start_sec),
                        "text": text_clean,
                    })
                    full_text_lines.append(text_clean)
                    vtt_lines.append(f"{format_timestamp(start_sec)} --> {format_timestamp(end_sec)}")
                    vtt_lines.append(text_clean)
                    vtt_lines.append("")

                duration = res_data.get("duration", 0.0)
                out_stem.parent.mkdir(parents=True, exist_ok=True)
                txt_file.write_text("\n".join(full_text_lines), encoding="utf-8")
                json_file.write_text(json.dumps({
                    "video": video_path.name,
                    "duration": duration,
                    "segments": segment_list,
                    "full_text": " ".join(full_text_lines),
                }, indent=2, ensure_ascii=False), encoding="utf-8")
                vtt_file.write_text("\n".join(vtt_lines), encoding="utf-8")

                elapsed = time.time() - t0
                log(f"   ✅ Done in {elapsed:.1f}s ({len(segment_list)} segments, audio: {duration:.1f}s) -> {txt_file.name}")

                manifest[str(rel_path)] = {
                    "txt": str(txt_file),
                    "json": str(json_file),
                    "vtt": str(vtt_file),
                    "duration": duration,
                    "segments_count": len(segment_list),
                    "transcribed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "engine": "groq-whisper-large-v3-turbo"
                }
                save_manifest(manifest)

            except Exception as e:
                log(f"   ❌ Error on {video_path.name}: {e}")
            finally:
                if os.path.exists(temp_mp3):
                    try:
                        os.remove(temp_mp3)
                    except Exception:
                        pass

            # Polite 1s pause between requests to respect rate limits
            time.sleep(1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("Transcriber stopped.")
