#!/usr/bin/env python3
"""
Telegram Group Video Downloader & Cloudflare R2 / S3 Cloud Uploader
===================================================================
Extracts ONLY video files from a specified Telegram group/channel,
downloads them locally, and streams/uploads them directly into your Cloud Storage (R2 / S3),
cleaning up local storage immediately to save disk space.
"""

import os
import sys
import re
import json
import asyncio
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from tqdm import tqdm

# Third-party modules (install via pip install -r scripts/requirements_telegram.txt)
try:
    from telethon import TelegramClient, events
    from telethon.tl.types import (
        MessageMediaDocument,
        DocumentAttributeVideo,
        DocumentAttributeFilename,
    )
    import boto3
    from boto3.s3.transfer import TransferConfig
except ImportError:
    print("\n[!] Missing required dependencies.")
    print("Please install them with: pip install telethon boto3 python-dotenv tqdm\n")
    sys.exit(1)

# Load .env from workspace or current directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()  # Fallback to local .env

# Configuration Constants
TELEGRAM_API_ID = os.getenv("TELEGRAM_API_ID")
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH")
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID") or os.getenv("VITE_R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID") or os.getenv("VITE_R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY") or os.getenv("VITE_R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET") or os.getenv("VITE_R2_BUCKET") or "eunacomvideos"
R2_PREFIX = os.getenv("R2_PREFIX", "bnb_videos/")

TEMP_DOWNLOAD_DIR = Path(__file__).resolve().parent / "temp_downloads"
MANIFEST_FILE = Path(__file__).resolve().parent / "telegram_video_manifest.json"
SESSION_NAME = str(Path(__file__).resolve().parent / "telegram_session")


def sanitize_filename(name: str) -> str:
    """Removes invalid filesystem/URL characters."""
    clean = re.sub(r'[\\/*?:"<>|]', "", name)
    clean = re.sub(r"\s+", "_", clean.strip())
    return clean[:120] if clean else "video"


def init_s3_client():
    """Initializes Cloudflare R2 / S3 client."""
    if not R2_ACCOUNT_ID or not R2_ACCESS_KEY_ID or not R2_SECRET_ACCESS_KEY:
        print("\n[!] Warning: Missing Cloudflare R2 credentials in .env")
        print("Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY")
        print("Videos will still be downloaded locally to temp_downloads/ until credentials are set.\n")
        return None

    endpoint = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def load_manifest() -> dict:
    """Loads history of already uploaded videos to avoid duplicates."""
    if MANIFEST_FILE.exists():
        try:
            with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_manifest(data: dict):
    """Saves updated manifest."""
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def upload_to_r2(s3_client, local_file_path: Path, r2_key: str) -> bool:
    """Uploads file to Cloudflare R2 with multipart acceleration and progress bar."""
    if not s3_client:
        return False

    file_size = local_file_path.stat().st_size
    config = TransferConfig(
        multipart_threshold=1024 * 25,  # 25MB
        max_concurrency=10,
        multipart_chunksize=1024 * 25,
        use_threads=True,
    )

    with tqdm(
        total=file_size,
        unit="B",
        unit_scale=True,
        unit_divisor=1024,
        desc=f"☁️ Uploading {local_file_path.name[:25]}",
        leave=False,
    ) as pbar:
        try:
            s3_client.upload_file(
                str(local_file_path),
                R2_BUCKET,
                r2_key,
                Config=config,
                Callback=lambda bytes_transferred: pbar.update(bytes_transferred),
                ExtraArgs={"ContentType": "video/mp4"},
            )
            return True
        except Exception as e:
            print(f"\n[!] Upload error for {local_file_path.name}: {e}")
            return False


async def select_target_chat(client: TelegramClient):
    """Prompts the user to select the Telegram group/channel or provide a link."""
    print("\n🔍 Scanning your Telegram dialogs...")
    dialogs = await client.get_dialogs(limit=30)
    groups = [d for d in dialogs if d.is_group or d.is_channel]

    print("\n--- Recent Groups / Channels ---")
    for idx, g in enumerate(groups):
        print(f"[{idx + 1}] {g.name} (ID: {g.id})")
    print("[M] Enter group username / invite link manually")

    choice = input("\nSelect group number or 'M': ").strip()
    if choice.upper() == "M":
        manual_input = input("Enter group invite link or @username: ").strip()
        return await client.get_entity(manual_input)
    elif choice.isdigit() and 1 <= int(choice) <= len(groups):
        return groups[int(choice) - 1].entity
    else:
        print("[!] Invalid selection.")
        return None


async def main():
    print("=" * 65)
    print("🚀 Telegram Group Video Downloader & Cloud Storage Uploader")
    print("=" * 65)

    global TELEGRAM_API_ID, TELEGRAM_API_HASH, R2_PREFIX

    # Validate Telegram credentials
    if not TELEGRAM_API_ID or not TELEGRAM_API_HASH:
        print("\n[!] Telegram API credentials missing.")
        print("Get your API ID and API Hash from: https://my.telegram.org (under 'API development tools')")
        TELEGRAM_API_ID = input("Enter TELEGRAM_API_ID: ").strip()
        TELEGRAM_API_HASH = input("Enter TELEGRAM_API_HASH: ").strip()

    TEMP_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    s3_client = init_s3_client()

    print("\n🔐 Connecting to Telegram...")
    client = TelegramClient(SESSION_NAME, int(TELEGRAM_API_ID), TELEGRAM_API_HASH)
    await client.start()
    print("✅ Telegram authentication successful!")

    target_chat = await select_target_chat(client)
    if not target_chat:
        print("[!] No group selected. Exiting.")
        return

    chat_title = getattr(target_chat, "title", "group")
    print(f"\n📂 Target Group: {chat_title}")
    print(f"☁️ Destination Bucket: {R2_BUCKET}/{R2_PREFIX}")
    print("⏳ Scanning messages for videos...\n")

    # Count & collect video messages
    video_messages = []
    async for message in client.iter_messages(target_chat):
        if not message.media:
            continue

        # Check if media is a video
        is_video = False
        duration = 0
        original_filename = None

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
                if isinstance(attr, DocumentAttributeFilename):
                    original_filename = attr.file_name

        if is_video:
            video_messages.append({
                "message": message,
                "duration": duration,
                "original_filename": original_filename,
            })

    total_videos = len(video_messages)
    print(f"🎬 Found {total_videos} videos in '{chat_title}'.")
    if total_videos == 0:
        print("No videos found to download.")
        return

    # Process videos chronologically (oldest to newest)
    video_messages.reverse()

    uploaded_count = 0
    skipped_count = 0

    for idx, item in enumerate(video_messages, 1):
        msg = item["message"]
        msg_id = str(msg.id)

        # Check if already processed
        if msg_id in manifest:
            skipped_count += 1
            continue

        caption = (msg.message or "").strip().split("\n")[0]
        base_name = item["original_filename"] or caption or f"video_msg_{msg_id}"
        clean_name = sanitize_filename(base_name)
        if not clean_name.endswith(".mp4"):
            clean_name += ".mp4"

        final_filename = f"{msg_id.zfill(5)}_{clean_name}"
        local_filepath = TEMP_DOWNLOAD_DIR / final_filename
        r2_key = f"{R2_PREFIX.rstrip('/')}/{final_filename}"

        print(f"\n[{idx}/{total_videos}] Processing: {final_filename}")

        # Step 1: Download from Telegram with progress bar
        with tqdm(
            total=msg.file.size if msg.file else 0,
            unit="B",
            unit_scale=True,
            unit_divisor=1024,
            desc="📥 Downloading from Telegram",
            leave=False,
        ) as pbar:
            last_bytes = 0

            def download_callback(received_bytes, total_bytes):
                nonlocal last_bytes
                pbar.update(received_bytes - last_bytes)
                last_bytes = received_bytes

            try:
                await msg.download_media(
                    file=str(local_filepath),
                    progress_callback=download_callback,
                )
            except Exception as e:
                print(f"[!] Failed to download message {msg_id}: {e}")
                if local_filepath.exists():
                    local_filepath.unlink()
                continue

        # Step 2: Upload to Cloudflare R2 / S3
        if s3_client and local_filepath.exists():
            upload_success = upload_to_r2(s3_client, local_filepath, r2_key)
            if upload_success:
                print(f"✅ Uploaded to cloud: {r2_key}")
                # Update manifest
                manifest[msg_id] = {
                    "r2_key": r2_key,
                    "filename": final_filename,
                    "date": str(msg.date),
                    "caption": msg.message or "",
                    "duration": item["duration"],
                    "file_size": local_filepath.stat().st_size,
                    "uploaded_at": datetime.utcnow().isoformat(),
                }
                save_manifest(manifest)
                uploaded_count += 1

                # Clean up local file immediately to save disk space
                try:
                    local_filepath.unlink()
                except Exception:
                    pass
            else:
                print(f"[!] Upload failed, local file preserved in {local_filepath}")
        else:
            # If no R2 client configured, keep local file
            print(f"📁 Saved locally to {local_filepath}")
            manifest[msg_id] = {
                "local_path": str(local_filepath),
                "filename": final_filename,
                "date": str(msg.date),
                "caption": msg.message or "",
                "duration": item["duration"],
                "saved_at": datetime.utcnow().isoformat(),
            }
            save_manifest(manifest)

    print("\n" + "=" * 65)
    print("🎉 All operations completed!")
    print(f"• Total videos found: {total_videos}")
    print(f"• Newly uploaded: {uploaded_count}")
    print(f"• Previously skipped: {skipped_count}")
    print(f"• Manifest catalog saved to: {MANIFEST_FILE.name}")
    print("=" * 65)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🛑 Process stopped by user. Progress was saved in manifest.")
