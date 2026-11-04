import sys
import time
import subprocess
import os
import json
import urllib.request
from pathlib import Path

# Force UTF-8 on Windows Console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

video = list(Path("D:/Telegram_BnB_Videos").rglob("*.mp4"))[0]
print("Testing video:", video.name)

# 1. Extract lightweight MP3 audio (32 kbps mono is crystal clear for speech)
temp_mp3 = "D:/Telegram_BnB_Videos/transcripts/test_groq.mp3"
t0 = time.time()
cmd = ["ffmpeg", "-nostdin", "-y", "-i", str(video), "-vn", "-ar", "16000", "-ac", "1", "-b:a", "32k", temp_mp3]
subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print(f"1. Extracted 32k MP3 ({os.path.getsize(temp_mp3)/1024:.1f} KB) in {time.time()-t0:.2f}s")

# 2. Upload to Groq Whisper Large V3 Turbo
api_key = os.environ.get("GROQ_API_KEY", "")

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = bytearray()

def add_field(name, value):
    global body
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode("utf-8"))

def add_file(name, filename, file_bytes):
    global body
    body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\nContent-Type: audio/mpeg\r\n\r\n'.encode("utf-8"))
    body.extend(file_bytes)
    body.extend(b"\r\n")

with open(temp_mp3, "rb") as fp:
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
        "Authorization": f"Bearer {api_key}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "User-Agent": "Groq-Client/1.0"
    }
)

t1 = time.time()
with urllib.request.urlopen(req) as resp:
    res_data = json.loads(resp.read().decode("utf-8"))

elapsed = time.time() - t1
print(f"2. ⚡ Groq Transcribed in {elapsed:.2f}s! Duration: {res_data.get('duration')}s")
print(f"   Total Segments: {len(res_data.get('segments', []))}")
if res_data.get("segments"):
    print("   Sample segment 1:", res_data["segments"][0].get("text"))

if os.path.exists(temp_mp3):
    os.remove(temp_mp3)
