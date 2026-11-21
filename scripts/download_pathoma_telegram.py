#!/usr/bin/env python3
"""
⚡ TURBO PATHOMA 2026 TELEGRAM DOWNLOADER & CHAPTER ORGANIZER
==============================================================
- Downloads all 19 chapters of Pathoma videos + PDF & Anki decks from https://t.me/pathoma2026
- Organizes automatically into D:/Telegram_Pathoma_Videos/01_Chapter_Name/...
- Uses a Persistent 16-Connection Independent TCP Pool (_create_exported_sender) to bypass per-socket DC throttling
- Generates D:/Telegram_Pathoma_Videos/pathoma_video_manifest.json
"""

import os
import sys
import re
import json
import math
import time
import asyncio
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import (
    MessageMediaDocument,
    DocumentAttributeVideo,
    DocumentAttributeFilename,
    InputDocumentFileLocation,
)
from telethon.tl.functions.upload import GetFileRequest

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "36321519"))
TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "97ad5a2457575eae8ee5dd46a3db960b")
SESSION_FILE = Path(__file__).resolve().parent / "telegram_session_string.txt"

CHANNEL_URL = "https://t.me/pathoma2026"
BASE_DOWNLOAD_DIR = Path("D:/Telegram_Pathoma_Videos")
MANIFEST_FILE = BASE_DOWNLOAD_DIR / "pathoma_video_manifest.json"

POOL_SIZE = 6  # 6 independent TCP connections to DC 2 (optimal limit before DC 2 drops sockets)

PATHOMA_CHAPTERS = {
    1: "01_Growth Adaptations, Cellular Injury, and Cell Death",
    2: "02_Inflammation, Inflammatory Disorders, and Healing",
    3: "03_Principles of Neoplasia",
    4: "04_Hemostasis and Related Disorders",
    5: "05_Red Blood Cell Disorders",
    6: "06_White Blood Cell Disorders",
    7: "07_Vascular Pathology",
    8: "08_Cardiac Pathology",
    9: "09_Respiratory Tract Pathology",
    10: "10_Gastrointestinal Pathology",
    11: "11_Exocrine Pancreas, Gallbladder, and Liver Pathology",
    12: "12_Kidney and Urinary Tract Pathology",
    13: "13_Female Genital System and Gestational Pathology",
    14: "14_Male Genital System Pathology",
    15: "15_Endocrine Pathology",
    16: "16_Breast Pathology",
    17: "17_Central Nervous System Pathology",
    18: "18_Musculoskeletal Pathology",
    19: "19_Skin Pathology",
}


def sanitize_filename(name: str) -> str:
    clean = re.sub(r'[\\/*?:"<>|]', "_", name)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def detect_chapter_folder(filename: str) -> str:
    m = re.match(r"^(\d{1,2})[\._]", filename.strip())
    if m:
        ch_num = int(m.group(1))
        if ch_num in PATHOMA_CHAPTERS:
            return PATHOMA_CHAPTERS[ch_num]
    return "99_General"


class PersistentSenderPool:
    def __init__(self, client: TelegramClient, pool_size: int = POOL_SIZE):
        self.client = client
        self.pool_size = pool_size
        self.pools = {}  # dc_id -> list of MTProtoSender
        self.lock = asyncio.Lock()

    async def get_senders(self, dc_id: int):
        async with self.lock:
            if dc_id == self.client.session.dc_id:
                return [self.client._sender]
            if dc_id in self.pools and len(self.pools[dc_id]) >= 2:
                return self.pools[dc_id]

            print(f"🔌 Opening {self.pool_size} independent TCP connections to Telegram DC {dc_id}...", flush=True)
            t0 = time.time()
            senders = []
            for i in range(self.pool_size):
                try:
                    s = await asyncio.wait_for(self.client._create_exported_sender(dc_id), timeout=12.0)
                    senders.append(s)
                    print(f"  ✓ Socket #{i+1}/{self.pool_size} connected to DC {dc_id}", flush=True)
                except Exception as e:
                    print(f"  [!] Sender #{i+1} creation warning: {e}", flush=True)
                    await asyncio.sleep(0.5)
            self.pools[dc_id] = senders
            print(f"⚡ Pool ready: {len(senders)} active TCP connections to DC {dc_id} ({time.time()-t0:.1f}s)", flush=True)
            return senders

    async def replace_sender(self, dc_id: int, idx: int):
        async with self.lock:
            try:
                old = self.pools[dc_id][idx]
                try:
                    await asyncio.wait_for(old.disconnect(), timeout=3.0)
                except Exception:
                    pass
                new_s = await asyncio.wait_for(self.client._create_exported_sender(dc_id), timeout=12.0)
                self.pools[dc_id][idx] = new_s
                return new_s
            except Exception:
                return self.pools[dc_id][idx]

    async def close_all(self):
        for dc_id, senders in self.pools.items():
            for s in senders:
                try:
                    await s.disconnect()
                except Exception:
                    pass


async def fast_pool_download(
    pool: PersistentSenderPool,
    entity,
    msg,
    temp_path: Path,
    idx: int,
    total: int,
):
    doc = msg.document
    if not doc:
        await msg.download_media(file=str(temp_path))
        return

    file_size = doc.size
    chunk_size = 512 * 1024
    total_chunks = math.ceil(file_size / chunk_size)
    dc_id = doc.dc_id

    senders = await pool.get_senders(dc_id)
    if not senders:
        raise ConnectionError(f"No senders available for DC {dc_id}")

    location = InputDocumentFileLocation(
        id=doc.id,
        access_hash=doc.access_hash,
        file_reference=doc.file_reference,
        thumb_size="",
    )

    temp_path.parent.mkdir(parents=True, exist_ok=True)
    with open(temp_path, "wb") as f:
        if file_size > 0:
            f.seek(file_size - 1)
            f.write(b"\0")

    queue = asyncio.Queue()
    for i in range(total_chunks):
        queue.put_nowait((i, i * chunk_size))

    file_lock = asyncio.Lock()
    bytes_done = 0
    t0 = time.time()
    last_log = t0

    async def worker(s_idx: int):
        nonlocal bytes_done, last_log, location
        sender = senders[s_idx]
        while not queue.empty():
            try:
                part_idx, offset = queue.get_nowait()
            except asyncio.QueueEmpty:
                break

            try:
                res = await asyncio.wait_for(
                    sender.send(
                        GetFileRequest(
                            location=location,
                            offset=offset,
                            limit=chunk_size,
                            precise=True,
                        )
                    ),
                    timeout=25.0,
                )
                valid_bytes = res.bytes[: min(len(res.bytes), file_size - offset)]
                async with file_lock:
                    with open(temp_path, "r+b") as f:
                        f.seek(offset)
                        f.write(valid_bytes)
                    bytes_done += len(valid_bytes)
                    now = time.time()
                    if now - last_log >= 15.0:
                        last_log = now
                        mb_done = bytes_done / (1024 * 1024)
                        mb_tot = file_size / (1024 * 1024)
                        spd = mb_done / max(0.1, now - t0)
                        pct = (bytes_done / max(1, file_size)) * 100
                        print(
                            f"   ↳ [{idx:03d}/{total:03d}] {temp_path.stem}: {mb_done:.1f}/{mb_tot:.1f} MB ({pct:.0f}%) @ {spd:.2f} MB/s",
                            flush=True,
                        )
            except Exception as e:
                err_str = str(e)
                if "FILE_REFERENCE" in err_str.upper():
                    try:
                        fresh_msg = await pool.client.get_messages(entity, ids=msg.id)
                        fresh_doc = fresh_msg.document
                        location = InputDocumentFileLocation(
                            id=fresh_doc.id,
                            access_hash=fresh_doc.access_hash,
                            file_reference=fresh_doc.file_reference,
                            thumb_size="",
                        )
                    except Exception:
                        pass
                else:
                    sender = await pool.replace_sender(dc_id, s_idx)
                queue.put_nowait((part_idx, offset))
                await asyncio.sleep(0.5)
            finally:
                queue.task_done()

    num_workers = min(len(senders), total_chunks)
    tasks = [asyncio.create_task(worker(i)) for i in range(num_workers)]
    await asyncio.gather(*tasks)


async def download_with_retry(pool: PersistentSenderPool, entity, msg, target_path: Path, idx: int, total: int):
    file_size = msg.file.size if msg.file else 0
    temp_path = target_path.with_suffix(target_path.suffix + ".temp_dl")
    target_path.parent.mkdir(parents=True, exist_ok=True)

    for attempt in range(1, 4):
        try:
            t0 = time.time()
            await fast_pool_download(pool, entity, msg, temp_path, idx, total)
            if temp_path.exists() and temp_path.stat().st_size == file_size:
                if target_path.exists():
                    try:
                        target_path.unlink()
                    except Exception:
                        pass
                temp_path.rename(target_path)
                elapsed = max(0.1, time.time() - t0)
                mb = file_size / (1024 * 1024)
                speed = mb / elapsed
                print(
                    f"[{idx:03d}/{total:03d}] ✅ {target_path.parent.name}/{target_path.name} "
                    f"({mb:.1f} MB @ {speed:.2f} MB/s in {elapsed:.1f}s)",
                    flush=True,
                )
                return True
        except Exception as e:
            print(f"[{idx:03d}/{total:03d}] ⚠️ Attempt {attempt} error on {target_path.name}: {e}", flush=True)
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass
            await asyncio.sleep(1.5)

    return False


async def main():
    print("=" * 75, flush=True)
    print(f"🚀 TURBO PATHOMA 2026 TELEGRAM DOWNLOADER ({POOL_SIZE}-Socket Persistent DC Pool)", flush=True)
    print(f"🔗 Source: {CHANNEL_URL}", flush=True)
    print(f"📂 Destination: {BASE_DOWNLOAD_DIR}", flush=True)
    print("=" * 75, flush=True)

    if not SESSION_FILE.exists():
        print(f"[!] Missing Telegram session file: {SESSION_FILE}", flush=True)
        return

    BASE_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    for tf in BASE_DOWNLOAD_DIR.rglob("*.temp_dl"):
        try:
            tf.unlink()
        except Exception:
            pass

    session_str = SESSION_FILE.read_text(encoding="utf-8").strip()
    client = TelegramClient(StringSession(session_str), TELEGRAM_API_ID, TELEGRAM_API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("[!] Telegram session is not authorized.", flush=True)
        return

    entity = await client.get_entity(CHANNEL_URL)
    print(f"✅ Connected to channel: {getattr(entity, 'title', 'Pathoma')} (@{getattr(entity, 'username', 'pathoma2026')})", flush=True)

    items_to_process = []
    manifest_entries = []

    async for msg in client.iter_messages(entity, reverse=True):
        if not msg.media or not msg.file:
            continue

        orig_name = None
        is_video = False
        duration = 0
        file_size = msg.file.size if msg.file else 0

        if getattr(msg, "video", None):
            is_video = True

        if isinstance(msg.media, MessageMediaDocument) and msg.document:
            mime = getattr(msg.document, "mime_type", "")
            if mime.startswith("video/"):
                is_video = True
            for attr in msg.document.attributes:
                if isinstance(attr, DocumentAttributeVideo):
                    is_video = True
                    duration = getattr(attr, "duration", 0)
                if isinstance(attr, DocumentAttributeFilename):
                    orig_name = attr.file_name

        if not orig_name:
            if not is_video:
                continue
            orig_name = f"video_{msg.id:03d}.mp4"

        clean_name = sanitize_filename(orig_name)
        if is_video:
            chapter_folder = detect_chapter_folder(clean_name)
            target_dir = BASE_DOWNLOAD_DIR / chapter_folder
        else:
            chapter_folder = "00_Book_and_Anki_Decks"
            target_dir = BASE_DOWNLOAD_DIR / chapter_folder

        target_path = target_dir / clean_name

        manifest_entries.append({
            "msg_id": msg.id,
            "type": "video" if is_video else "document",
            "chapter_folder": chapter_folder,
            "filename": clean_name,
            "relative_path": f"{chapter_folder}/{clean_name}",
            "size_bytes": file_size,
            "size_mb": round(file_size / (1024 * 1024), 2),
            "duration_sec": duration,
        })

        items_to_process.append((msg, target_path, file_size, is_video))

    MANIFEST_FILE.write_text(json.dumps(manifest_entries, indent=2, ensure_ascii=False), encoding="utf-8")

    total_items = len(items_to_process)
    total_mb = sum(x[2] for x in items_to_process) / (1024 * 1024)
    print(f"📋 Found {total_items} downloadable files ({total_mb / 1024:.2f} GB total).", flush=True)

    pool = PersistentSenderPool(client, pool_size=POOL_SIZE)
    downloaded = 0
    skipped = 0
    t_start = time.time()

    try:
        for idx, (msg, target_path, file_size, is_video) in enumerate(items_to_process, 1):
            if target_path.exists() and target_path.stat().st_size == file_size:
                skipped += 1
                continue

            ok = await download_with_retry(pool, entity, msg, target_path, idx, total_items)
            if ok:
                downloaded += 1
    finally:
        await pool.close_all()
        await client.disconnect()

    elapsed_total = max(0.1, time.time() - t_start)
    print("\n" + "=" * 75, flush=True)
    print("🎉 PATHOMA 2026 DOWNLOAD SUMMARY", flush=True)
    print(f"• Total Files in Channel: {total_items}", flush=True)
    print(f"• Newly Downloaded:       {downloaded}", flush=True)
    print(f"• Already Existed:        {skipped}", flush=True)
    print(f"• Elapsed Time:           {elapsed_total / 60:.1f} minutes", flush=True)
    print(f"• Saved to:               {BASE_DOWNLOAD_DIR}", flush=True)
    print("=" * 75, flush=True)


if __name__ == "__main__":
    asyncio.run(main())
