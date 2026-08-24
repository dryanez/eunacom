#!/usr/bin/env python3
"""
High-Speed Telegram Video Downloader & Category Organizer
==========================================================
- Reliable High-Speed Streaming (cryptg C-accelerated) with Live Percentage & Speed
- Smart Category & Topic Auto-Organizing (BnB Subjects, Forum Topics, Hashtags, Lesson Numbers)
- Destination: D:\Telegram_BnB_Videos
"""

import os
import sys
import re
import json
import asyncio
from pathlib import Path
from datetime import datetime

# UTF-8 Encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from tqdm import tqdm

try:
    from telethon import TelegramClient, errors
    from telethon.tl.types import (
        MessageMediaDocument,
        DocumentAttributeVideo,
        DocumentAttributeFilename,
    )
    from telethon.tl.functions.messages import GetForumTopicsRequest
    import boto3
    from boto3.s3.transfer import TransferConfig
    import qrcode
    import cryptg
except ImportError:
    print("\n[!] Missing dependencies. Run: pip install telethon boto3 python-dotenv tqdm qrcode[pil] cryptg\n")
    sys.exit(1)

# Environment configuration
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID", "36321519")
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "97ad5a2457575eae8ee5dd46a3db960b")

# Storage on Drive D
BASE_DOWNLOAD_DIR = Path("D:/Telegram_BnB_Videos")
MANIFEST_FILE = BASE_DOWNLOAD_DIR / "telegram_video_manifest.json"
SESSION_NAME = str(Path(__file__).resolve().parent / "telegram_session")
QR_IMAGE_PATH = Path(__file__).resolve().parent / "qr_login.png"

# Known Boards & Beyond / Medical Topics for Automatic Detection
BNB_KNOWN_SUBJECTS = [
    "Biochemistry", "Cardiology", "Cell Biology", "Dermatology", "Endocrinology",
    "Gastroenterology", "Genetics", "Hematology", "Immunology", "Infectious Disease",
    "Musculoskeletal", "Neurology", "Pathology", "Pharmacology", "Psychiatry",
    "Pulmonary", "Renal", "Reproductive", "Pediatrics", "Surgery", "Epidemiology",
    "Biostatistics", "Anatomy", "Physiology", "Microbiology", "Ophthalmology",
    "ENT", "Emergency Medicine", "Obstetrics", "Gynecology"
]


def sanitize_name(name: str) -> str:
    """Sanitize string for Windows directories and filenames."""
    if not name:
        return "General"
    clean = re.sub(r'[\\/*?:"<>|]', " ", name)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:100] if clean else "General"


def extract_topic_and_title(msg, topics_map: dict) -> tuple[str, str]:
    """Extracts the subject/topic and lesson title/number."""
    topic_name = "General_Videos"
    raw_text = (msg.message or "").strip()
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    # 1. Telegram Forum Topic match
    if msg.reply_to:
        reply_id = getattr(msg.reply_to, "reply_to_top_id", None) or getattr(msg.reply_to, "reply_to_msg_id", None)
        if reply_id and reply_id in topics_map:
            topic_name = topics_map[reply_id]

    # 2. Check hashtags (e.g. #Biochemistry, #Cardio)
    if topic_name == "General_Videos":
        hashtags = re.findall(r"#([A-Za-z0-9_]+)", raw_text)
        for ht in hashtags:
            for subj in BNB_KNOWN_SUBJECTS:
                if ht.lower() in subj.lower() or subj.lower() in ht.lower():
                    topic_name = subj
                    break
            if topic_name != "General_Videos":
                break

    # 3. Check known BnB subject keywords in text lines
    if topic_name == "General_Videos":
        for line in lines:
            for subj in BNB_KNOWN_SUBJECTS:
                if re.search(rf"\b{re.escape(subj)}\b", line, re.IGNORECASE):
                    topic_name = subj
                    break
            if topic_name != "General_Videos":
                break

    # 4. Multi-line caption check: if line 1 looks like a section header
    if topic_name == "General_Videos" and len(lines) >= 2:
        if len(lines[0]) < 40 and not re.search(r"\.(mp4|mkv|avi)$", lines[0], re.I):
            topic_name = lines[0]

    # Extract lesson title
    title = ""
    if lines:
        title = lines[-1] if len(lines) > 1 and topic_name in lines[0] else lines[0]

    # Fallback to document original filename
    if (not title or title == topic_name) and msg.document:
        for attr in msg.document.attributes:
            if isinstance(attr, DocumentAttributeFilename):
                title = Path(attr.file_name).stem

    if not title:
        title = f"lesson_{msg.id}"

    return sanitize_name(topic_name), sanitize_name(title)


def load_manifest() -> dict:
    if MANIFEST_FILE.exists():
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_manifest(data: dict):
    BASE_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


async def authenticate_telegram(client: TelegramClient):
    await client.connect()
    if await client.is_user_authorized():
        print("✅ Telegram session authorized!")
        return

    print("\n" + "=" * 60)
    print("🔐 TELEGRAM LOGIN")
    print("=" * 60)
    print("[1] Scan QR Code on Screen (Instant - No code needed)")
    print("[2] Enter Phone Number & Telegram Code")
    choice = input("\nSelect [1] or [2] (default 1): ").strip() or "1"

    if choice == "1":
        qr_login = await client.qr_login()
        print("\n" + "-" * 60)
        print("📱 SCAN THIS QR CODE WITH YOUR PHONE TELEGRAM APP:")
        print("Telegram -> Settings -> Devices -> Link Desktop Device")
        print("-" * 60)

        qr = qrcode.QRCode()
        qr.add_data(qr_login.url)
        qr.print_ascii(invert=True)

        qr_img = qrcode.make(qr_login.url)
        qr_img.save(QR_IMAGE_PATH)
        print(f"\n🖼️ QR Code image opened: {QR_IMAGE_PATH}")
        try:
            if sys.platform == "win32":
                os.startfile(str(QR_IMAGE_PATH))
        except Exception:
            pass

        print("⏳ Waiting for scan from your Telegram app...")
        while True:
            try:
                await qr_login.wait(timeout=60)
                break
            except asyncio.TimeoutError:
                print("🔄 Refreshing QR code...")
                await qr_login.recreate()
                qr_img = qrcode.make(qr_login.url)
                qr_img.save(QR_IMAGE_PATH)
            except errors.SessionPasswordNeededError:
                pwd = input("\nEnter your 2-Step Verification Password: ").strip()
                await client.sign_in(password=pwd)
                break

        print("\n🎉 Logged in successfully!")
        if QR_IMAGE_PATH.exists():
            try:
                QR_IMAGE_PATH.unlink()
            except Exception:
                pass
    else:
        phone = input("\nEnter phone (with country code): ").strip()
        await client.send_code_request(phone)
        code = input("Enter code received in Telegram: ").strip()
        try:
            await client.sign_in(phone, code)
        except errors.SessionPasswordNeededError:
            pwd = input("Enter 2-Step Verification password: ").strip()
            await client.sign_in(password=pwd)


async def select_target_chat(client: TelegramClient, auto_match: str = None):
    print("\n🔍 Loading your Telegram groups...")
    dialogs = await client.get_dialogs(limit=50)
    groups = [d for d in dialogs if d.is_group or d.is_channel]

    # Auto match if specified via argument or fallback
    if auto_match:
        for g in groups:
            if auto_match.lower() in g.name.lower():
                print(f"🎯 Auto-selected group: {g.name} (ID: {g.id})")
                return g.entity

    print("\n--- Available Groups / Channels ---")
    for idx, g in enumerate(groups):
        print(f"[{idx + 1}] {g.name}")
    print("[M] Paste group invite link / username manually")

    if not sys.stdin.isatty():
        # Non-interactive mode: find Boards and Beyonds or first group
        for g in groups:
            if "board" in g.name.lower() or "beyond" in g.name.lower() or "bnb" in g.name.lower():
                print(f"🎯 Auto-selected: {g.name}")
                return g.entity
        return groups[0].entity if groups else None

    choice = input("\nSelect group number or 'M': ").strip()
    if choice.upper() == "M":
        link = input("Enter group invite link or @username: ").strip()
        return await client.get_entity(link)
    elif choice.isdigit() and 1 <= int(choice) <= len(groups):
        return groups[int(choice) - 1].entity
    return None


async def main():
    print("=" * 70)
    print("⚡ HIGH-SPEED TELEGRAM VIDEO DOWNLOADER")
    print(f"📂 Destination Folder: {BASE_DOWNLOAD_DIR} (Volume D)")
    print("=" * 70)

    BASE_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()

    client = TelegramClient(SESSION_NAME, int(TELEGRAM_API_ID), TELEGRAM_API_HASH)
    await authenticate_telegram(client)

    group_arg = None
    if len(sys.argv) > 1:
        group_arg = " ".join(sys.argv[1:]).replace("--group", "").strip()
    target_chat = await select_target_chat(client, auto_match=group_arg or "Boards and beyond")
    if not target_chat:
        print("[!] No group selected.")
        return

    chat_title = getattr(target_chat, "title", "group")
    print(f"\n📂 Scanning Group: {chat_title}")

    # Load Forum Topics if group is a forum
    topics_map = {}
    if getattr(target_chat, "forum", False):
        try:
            res = await client(GetForumTopicsRequest(
                channel=target_chat,
                offset_date=0,
                offset_id=0,
                offset_topic=0,
                limit=100,
            ))
            for t in res.topics:
                topics_map[t.id] = t.title
            print(f"📑 Identified {len(topics_map)} Forum Topics in group!")
        except Exception:
            pass

    print("⏳ Scanning messages for videos...\n")

    video_items = []
    async for message in client.iter_messages(target_chat):
        if not message.media:
            continue

        is_video = False
        duration = 0
        if getattr(message, "video", None):
            is_video = True
        elif isinstance(message.media, MessageMediaDocument) and message.document:
            mime = getattr(message.document, "mime_type", "")
            if mime.startswith("video/"):
                is_video = True
            for attr in message.document.attributes:
                if isinstance(attr, DocumentAttributeVideo):
                    is_video = True
                    duration = attr.duration

        if is_video:
            topic_name, lesson_title = extract_topic_and_title(message, topics_map)
            video_items.append({
                "message": message,
                "topic": topic_name,
                "title": lesson_title,
                "duration": duration,
            })

    total_videos = len(video_items)
    print(f"🎬 Found {total_videos} videos.")
    if total_videos == 0:
        return

    # Process chronologically (oldest to newest)
    video_items.reverse()

    downloaded_count = 0
    skipped_count = 0

    for idx, item in enumerate(video_items, 1):
        msg = item["message"]
        msg_id = str(msg.id)

        if msg_id in manifest:
            skipped_count += 1
            continue

        topic_folder = BASE_DOWNLOAD_DIR / item["topic"]
        topic_folder.mkdir(parents=True, exist_ok=True)

        filename = f"{msg_id.zfill(4)}_{item['title']}.mp4"
        local_filepath = topic_folder / filename
        file_size = msg.file.size if msg.file else 0

        print(f"\n[{idx}/{total_videos}] 📁 Topic: {item['topic']} | 🎬 {filename}")

        # Real-Time Progress Bar with Speed & Percentage
        with tqdm(
            total=file_size,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
            desc=f"⚡ Downloading {filename[:22]}",
            leave=True,
            miniters=1,
            smoothing=0.1,
        ) as pbar:
            last_bytes = 0

            def progress_callback(received, total):
                nonlocal last_bytes
                pbar.update(received - last_bytes)
                last_bytes = received

            try:
                await client.download_media(
                    msg,
                    file=str(local_filepath),
                    progress_callback=progress_callback,
                )
            except Exception as e:
                print(f"[!] Download failed for #{msg_id}: {e}")
                if local_filepath.exists():
                    try:
                        local_filepath.unlink()
                    except Exception:
                        pass
                continue

        # Record in manifest
        manifest[msg_id] = {
            "topic": item["topic"],
            "title": item["title"],
            "filename": filename,
            "local_path": str(local_filepath),
            "date": str(msg.date),
            "duration": item["duration"],
            "file_size": file_size,
            "downloaded_at": datetime.utcnow().isoformat(),
        }
        save_manifest(manifest)
        downloaded_count += 1

    print("\n" + "=" * 70)
    print("🎉 ALL VIDEOS DOWNLOADED AND ORGANIZED!")
    print(f"📁 Destination Folder: {BASE_DOWNLOAD_DIR}")
    print(f"• Total videos: {total_videos}")
    print(f"• Newly downloaded: {downloaded_count}")
    print(f"• Skipped (Already done): {skipped_count}")
    print(f"• Manifest catalog: {MANIFEST_FILE}")
    print("=" * 70)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🛑 Stopped by user. Progress saved in manifest.")
