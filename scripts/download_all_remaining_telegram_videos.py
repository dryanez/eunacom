#!/usr/bin/env python3
"""
⚡ CONCURRENT MULTI-FILE TURBO DOWNLOADER
=========================================
- Downloads 3-4 video files concurrently to bypass single-file Telegram DC throttling
- Auto-retries on connection drops
- Skips already completed videos
"""

import os
import sys
import re
import json
import time
import asyncio
from pathlib import Path
from difflib import SequenceMatcher

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from tqdm import tqdm
from telethon import TelegramClient
from telethon.sessions import StringSession

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "36321519"))
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "97ad5a2457575eae8ee5dd46a3db960b")
SESSION_FILE = Path(__file__).resolve().parent / "telegram_session_string.txt"
BASE_DOWNLOAD_DIR = Path("D:/Telegram_BnB_Videos")
CURRICULUM_FILE = Path(__file__).resolve().parent / "bnb_curriculum_master.json"

CONCURRENT_FILES = 3  # 3 video files downloading simultaneously


def sanitize(name: str) -> str:
    if not name:
        return "General"
    clean = re.sub(r'[\\/*?:"<>|]', " ", name)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:90] if clean else "General"


def load_curriculum_lookup():
    if not CURRICULUM_FILE.exists():
        return []
    curriculum = json.loads(CURRICULUM_FILE.read_text(encoding="utf-8"))
    lookup = []
    for step_name, subjects in curriculum.items():
        step_folder = "Step 1 - Preclinical" if "1" in step_name else "Step 2 - Clinical"
        for s_idx, subj in enumerate(subjects, 1):
            subj_name = subj["subject"]
            subj_folder = f"{s_idx:02d}_{sanitize(subj_name)}"
            for sub_idx, subsec in enumerate(subj["subsections"], 1):
                subsec_name = f"{subsec['number']} {sanitize(subsec['title'])}"
                for l_idx, lesson in enumerate(subsec["lessons"], 1):
                    clean_title = re.sub(r"[^a-zA-Z0-9]", "", lesson["title"].lower())
                    lookup.append({
                        "step": step_name,
                        "step_folder": step_folder,
                        "subject_folder": subj_folder,
                        "subject_name": subj_name,
                        "subsection_folder": subsec_name,
                        "lesson_index": l_idx,
                        "lesson_title": lesson["title"],
                        "clean_title": clean_title,
                    })
    return lookup


def match_lesson(filename: str, caption: str, lookup: list) -> dict:
    text = (filename or caption or "").strip()
    clean = re.sub(r"^\d+[\._\s\-]+", "", text).replace(".mp4", "")
    clean_search = re.sub(r"[^a-zA-Z0-9]", "", clean.lower())

    best_match = None
    best_score = 0.0

    for entry in lookup:
        target = entry["clean_title"]
        if target == clean_search or target in clean_search or clean_search in target:
            return entry

        ratio = SequenceMatcher(None, clean_search, target).ratio()
        if ratio > best_score and ratio >= 0.60:
            best_score = ratio
            best_match = entry

    return best_match


async def download_single_video(client: TelegramClient, msg, target_path: Path, filename: str, position: int):
    file_size = msg.file.size
    temp_path = target_path.with_suffix(".temp_dl")

    for attempt in range(1, 4):
        try:
            with tqdm(
                total=file_size,
                unit="B",
                unit_scale=True,
                unit_divisor=1024,
                desc=f"📥 {filename[:25]}",
                position=position,
                leave=False,
            ) as pbar:
                last_b = 0
                def progress_cb(rec, tot):
                    nonlocal last_b
                    pbar.update(rec - last_b)
                    last_b = rec

                t0 = time.time()
                await client.download_media(
                    message=msg,
                    file=str(temp_path),
                    progress_callback=progress_cb
                )

                if temp_path.exists() and temp_path.stat().st_size == file_size:
                    if target_path.exists():
                        try:
                            target_path.unlink()
                        except Exception:
                            pass
                    temp_path.rename(target_path)
                    elapsed = time.time() - t0
                    speed = (file_size / (1024 * 1024)) / max(0.1, elapsed)
                    print(f"✅ Downloaded: {filename} ({speed:.1f} MB/s in {elapsed:.0f}s)")
                    return True
        except Exception as e:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass
            await asyncio.sleep(2.0)

    return False


async def main():
    print("=" * 70)
    print(f"🚀 CONCURRENT TELEGRAM DOWNLOADER ({CONCURRENT_FILES} Parallel Video Streams)")
    print(f"📂 Destination: {BASE_DOWNLOAD_DIR}")
    print("=" * 70)

    if not SESSION_FILE.exists():
        print("[!] Missing session file.")
        return

    lookup = load_curriculum_lookup()
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

    rem_file = Path("scripts/telegram_remaining_messages.json")
    items = json.loads(rem_file.read_text(encoding="utf-8"))
    video_items = [i for i in items if i.get("file_name", "").endswith(".mp4")]

    msg_ids = [i["id"] for i in video_items]
    messages = await client.get_messages(chat, ids=msg_ids)

    # Filter out already existing files
    pending_tasks = []
    skipped_count = 0

    for msg in messages:
        if not msg or not msg.file:
            continue

        raw_filename = next(
            (attr.file_name for attr in (msg.document.attributes if msg.document else []) if hasattr(attr, "file_name")),
            f"video_{msg.id}.mp4"
        )
        msg_id_str = str(msg.id).zfill(4)
        file_size = msg.file.size

        match = match_lesson(raw_filename, msg.message or "", lookup)
        if match:
            target_folder = (
                BASE_DOWNLOAD_DIR
                / match["step_folder"]
                / match["subject_folder"]
                / match["subsection_folder"]
            )
            filename = f"{msg_id_str}_{sanitize(raw_filename)}"
        else:
            target_folder = BASE_DOWNLOAD_DIR / "Step 2 - Clinical" / "99_General" / "I. General Topics"
            filename = f"{msg_id_str}_{sanitize(raw_filename)}"

        target_folder.mkdir(parents=True, exist_ok=True)
        target_path = target_folder / filename

        exists = False
        if target_path.exists() and target_path.stat().st_size == file_size:
            exists = True
        else:
            for f in target_folder.glob("*.mp4"):
                if f.stat().st_size == file_size:
                    exists = True
                    break

        if exists:
            skipped_count += 1
        else:
            pending_tasks.append((msg, target_path, filename))

    print(f"Skipped {skipped_count} completed files. Remaining to download: {len(pending_tasks)}\n")

    # Download in parallel batches of CONCURRENT_FILES
    sem = asyncio.Semaphore(CONCURRENT_FILES)

    async def worker(task_data, pos):
        msg, target_path, filename = task_data
        async with sem:
            await download_single_video(client, msg, target_path, filename, pos)

    tasks = [worker(t, idx % CONCURRENT_FILES) for idx, t in enumerate(pending_tasks)]
    await asyncio.gather(*tasks)

    print("\n" + "=" * 70)
    print("🎉 ALL REMAINING VIDEOS DOWNLOADED!")
    print("=" * 70)


if __name__ == "__main__":
    while True:
        try:
            asyncio.run(main())
            break
        except Exception as e:
            print(f"⚠️ Reconnecting in 5s: {e}")
            time.sleep(5)
