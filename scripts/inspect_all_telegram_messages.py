#!/usr/bin/env python3
"""
Inspect all 754 Telegram messages and find the exact 27 difference messages.
Checks if any 'Part 2' or remaining video lessons exist in the Telegram group.
"""

import os
import sys
import json
import re
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import MessageMediaDocument, DocumentAttributeVideo, DocumentAttributeFilename

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "36321519"))
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "97ad5a2457575eae8ee5dd46a3db960b")
SESSION_FILE = Path(__file__).resolve().parent / "telegram_session_string.txt"
BASE_DIR = Path("D:/Telegram_BnB_Videos")


async def main():
    if not SESSION_FILE.exists():
        print("[!] Missing session file.")
        return

    session_str = SESSION_FILE.read_text(encoding="utf-8").strip()
    client = TelegramClient(StringSession(session_str), TELEGRAM_API_ID, TELEGRAM_API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("[!] Client not authorized.")
        return

    dialogs = await client.get_dialogs(limit=50)
    chat = next((d.entity for d in dialogs if "board" in d.name.lower() or "beyond" in d.name.lower()), None)
    if not chat:
        print("[!] Group not found.")
        return

    print(f"📂 Scanning all messages in: {getattr(chat, 'title', 'group')}")

    # Index all existing files on disk by size and clean name
    disk_files = list(BASE_DIR.rglob("*.mp4"))
    disk_sizes = {f.stat().st_size: f for f in disk_files if "transcripts" not in str(f)}

    all_media_messages = []
    undownloaded = []

    async for msg in client.iter_messages(chat):
        if not msg.media:
            continue

        is_video = False
        duration = 0
        file_name = None
        file_size = msg.file.size if msg.file else 0

        if getattr(msg, "video", None):
            is_video = True
            duration = msg.video.attributes[0].duration if msg.video.attributes else 0
        elif isinstance(msg.media, MessageMediaDocument) and msg.document:
            mime = getattr(msg.document, "mime_type", "")
            if mime.startswith("video/"):
                is_video = True
            for attr in msg.document.attributes:
                if isinstance(attr, DocumentAttributeVideo):
                    is_video = True
                    duration = attr.duration
                if isinstance(attr, DocumentAttributeFilename):
                    file_name = attr.file_name

        if is_video or file_size > 1024 * 1024:
            all_media_messages.append({
                "id": msg.id,
                "msg": msg,
                "caption": (msg.message or "").strip(),
                "file_name": file_name,
                "file_size": file_size,
                "duration": duration,
                "is_video": is_video,
            })

    print(f"🎬 Total Video/Media Messages in Telegram Group: {len(all_media_messages)}")

    # Check which ones are not on disk
    for item in all_media_messages:
        f_size = item["file_size"]
        if f_size in disk_sizes:
            continue
        # Also check by message ID prefix
        msg_id_prefix = str(item["id"]).zfill(4)
        found_by_id = any(msg_id_prefix in f.name for f in disk_files)
        if not found_by_id:
            undownloaded.append(item)

    print(f"\nFound {len(undownloaded)} messages in Telegram that were not matched to disk:\n")

    for idx, item in enumerate(undownloaded, 1):
        cap = item["caption"].replace("\n", " ")[:80]
        size_mb = item["file_size"] / (1024 * 1024)
        print(f"[{idx:02d}] Msg ID: #{item['id']} | Size: {size_mb:.1f} MB | Dur: {item['duration']}s | Name: {item['file_name']}")
        print(f"     Caption: {cap}")

    # Output detailed JSON
    out_json = [
        {
            "id": i["id"],
            "file_name": i["file_name"],
            "caption": i["caption"],
            "size_mb": round(i["file_size"] / (1024 * 1024), 2),
            "duration": i["duration"],
        }
        for i in undownloaded
    ]
    Path("scripts/telegram_remaining_messages.json").write_text(
        json.dumps(out_json, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print("\nSaved detailed list to scripts/telegram_remaining_messages.json")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
