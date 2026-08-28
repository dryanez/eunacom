#!/usr/bin/env python3
"""
⚡ TURBO TELEGRAM PDF & QUIZ DOWNLOADER
======================================
Downloads all official Boards & Beyond materials from the Telegram channel:
1. All Slide Books & Full-Size Slide Decks (.pdf)
2. All Lesson Lecture Notes (.pdf)
3. All Chapter Quizzes (*-Quiz.pdf)
Organizes them cleanly into D:\Telegram_BnB_Videos\PDFs_and_Quizzes
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
from telethon.tl.types import MessageMediaDocument, DocumentAttributeFilename

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "36321519"))
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "97ad5a2457575eae8ee5dd46a3db960b")
SESSION_FILE = Path(__file__).resolve().parent / "telegram_session_string.txt"
BASE_DIR = Path("D:/Telegram_BnB_Videos/PDFs_and_Quizzes")
CURRICULUM_FILE = Path(__file__).resolve().parent / "bnb_curriculum_master.json"

CONCURRENT_DOWNLOADS = 4


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


def match_curriculum(filename: str, lookup: list):
    clean = re.sub(r"^\d+[\._\s\-]+", "", filename).replace("-Quiz.pdf", "").replace(".pdf", "")
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


async def download_file(client: TelegramClient, msg, target_path: Path, filename: str, position: int):
    file_size = msg.file.size
    temp_path = target_path.with_suffix(".pdf_dl")

    for attempt in range(3):
        try:
            with tqdm(
                total=file_size,
                unit="B",
                unit_scale=True,
                unit_divisor=1024,
                desc=f"📄 {filename[:28]}",
                position=position,
                leave=False,
            ) as pbar:
                last_b = 0
                def progress_cb(rec, tot):
                    nonlocal last_b
                    pbar.update(rec - last_b)
                    last_b = rec

                await client.download_media(
                    message=msg,
                    file=str(temp_path),
                    progress_callback=progress_cb
                )

                if temp_path.exists() and temp_path.stat().st_size == file_size:
                    if target_path.exists():
                        target_path.unlink()
                    temp_path.rename(target_path)
                    return True
        except Exception:
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass
            await asyncio.sleep(1.0)

    return False


async def main():
    print("=" * 70)
    print("📚 DOWNLOADING ALL BOARDS & BEYOND QUIZZES & SLIDE PDFS")
    print(f"📂 Destination: {BASE_DIR}")
    print("=" * 70)

    if not SESSION_FILE.exists():
        print("[!] Missing session file.")
        return

    BASE_DIR.mkdir(parents=True, exist_ok=True)
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

    print(f"Scanning all PDF messages in: {getattr(chat, 'title', 'group')}...")

    pdf_messages = []
    async for msg in client.iter_messages(chat):
        if not msg.media:
            continue

        filename = None
        if isinstance(msg.media, MessageMediaDocument) and msg.document:
            for attr in msg.document.attributes:
                if isinstance(attr, DocumentAttributeFilename):
                    filename = attr.file_name

        if filename and filename.lower().endswith(".pdf"):
            pdf_messages.append({
                "id": msg.id,
                "msg": msg,
                "filename": filename,
                "size": msg.file.size if msg.file else 0,
            })

    print(f"Found {len(pdf_messages)} total PDF files in Telegram group.\n")

    # Reverse to download in chronological order
    pdf_messages.reverse()

    queue = []
    skipped = 0

    for item in pdf_messages:
        filename = item["filename"]
        file_size = item["size"]
        msg = item["msg"]

        is_quiz = "-Quiz" in filename or "Quiz" in filename

        # Match to curriculum
        match = match_curriculum(filename, lookup)

        if match:
            folder_type = "Quizzes" if is_quiz else "Slides_and_Notes"
            target_dir = BASE_DIR / folder_type / match["step_folder"] / match["subject_folder"]
        else:
            folder_type = "Quizzes" if is_quiz else "Slides_and_Notes"
            target_dir = BASE_DIR / folder_type / "General"

        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / filename

        if target_path.exists() and target_path.stat().st_size == file_size:
            skipped += 1
            continue

        queue.append((msg, target_path, filename))

    print(f"Skipped {skipped} already-downloaded PDFs. Queue to download: {len(queue)}\n")

    sem = asyncio.Semaphore(CONCURRENT_DOWNLOADS)

    async def worker(task_item, pos):
        msg, target_path, filename = task_item
        async with sem:
            ok = await download_file(client, msg, target_path, filename, pos)
            if ok:
                print(f"✅ Saved: {filename} -> {target_path.parent.name}")

    tasks = [worker(item, idx % CONCURRENT_DOWNLOADS) for idx, item in enumerate(queue)]
    await asyncio.gather(*tasks)

    print("\n" + "=" * 70)
    print(f"🎉 ALL PDFS & QUIZZES DOWNLOADED! (Total on disk: {len(list(BASE_DIR.rglob('*.pdf')))})")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
