#!/usr/bin/env python3
"""
⚡ HIGH-SPEED CLOUDFLARE R2 SYNC FOR BOARDS & BEYOND QUIZ IMAGES
================================================================
- Uploads all extracted quiz figures & 4K lecture slides/tables from
  D:/Telegram_BnB_Videos/quizzes_extracted/**/images/*.png
  to Cloudflare R2 bucket 'eunacomvideos' under 'Boards_and_Beyond/quizzes_extracted/...'
- Uses 24 parallel worker threads for small PNG files
- Resume-capable: skips already uploaded PNGs matching byte size
"""

import os
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from botocore.config import Config
import boto3

os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["PYTHONUNBUFFERED"] = "1"
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
        sys.stderr.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)
    except Exception:
        pass

ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "1feadf1b0863cb9b502faaa828b563aa")
BUCKET_NAME = os.environ.get("R2_BUCKET", "eunacomvideos")
ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID", "543b4c368c26b7bc4f210e26e82ff596")
SECRET_ACCESS_KEY = os.environ.get(
    "R2_SECRET_ACCESS_KEY",
    "1b2c3df467dcc3b664d3d353239b995b3b9a146a901d7296830d9f6910e10fec",
)
ENDPOINT_URL = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"
PUBLIC_DEV_URL = "https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev"

QUIZZES_ROOT = Path("D:/Telegram_BnB_Videos/quizzes_extracted")
LOG_FILE = Path("D:/Telegram_BnB_Videos/r2_quiz_images_sync.log")
R2_PREFIX = "Boards_and_Beyond/quizzes_extracted"


def log(msg: str):
    print(msg, flush=True)
    try:
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception:
        pass


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=SECRET_ACCESS_KEY,
        config=Config(
            signature_version="s3v4",
            max_pool_connections=32,
            retries={"max_attempts": 5, "mode": "adaptive"},
        ),
        region_name="auto",
    )


def fetch_existing(s3):
    log(f"🔍 Indexing existing quiz images in R2 under '{R2_PREFIX}/'...")
    existing = {}
    paginator = s3.get_paginator("list_objects_v2")
    try:
        for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=f"{R2_PREFIX}/"):
            for obj in page.get("Contents", []):
                existing[obj["Key"]] = obj["Size"]
    except Exception as e:
        log(f"⚠️ Error listing R2 objects: {e}")
    log(f"   Found {len(existing)} existing quiz objects in R2.")
    return existing


def main():
    log("=" * 75)
    log("⚡ CLOUDFLARE R2 SYNC: BOARDS & BEYOND QUIZ IMAGES (717 QUIZZES)")
    log(f"Source: {QUIZZES_ROOT}")
    log(f"Target: {PUBLIC_DEV_URL}/{R2_PREFIX}/...")
    log("=" * 75)

    s3 = get_r2_client()
    existing = fetch_existing(s3)

    all_imgs = [
        f for f in sorted(QUIZZES_ROOT.rglob("*"))
        if f.is_file() and f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp", ".json")
    ]
    total_files = len(all_imgs)
    total_bytes = sum(f.stat().st_size for f in all_imgs)
    log(f"📂 Found {total_files} quiz files/images ({total_bytes / (1024**2):.1f} MB total)")

    pending = []
    skipped = 0
    for f in all_imgs:
        rel = str(f.relative_to(QUIZZES_ROOT)).replace("\\", "/")
        r2_key = f"{R2_PREFIX}/{rel}"
        sz = f.stat().st_size
        if r2_key in existing and existing[r2_key] == sz:
            skipped += 1
        else:
            pending.append((f, r2_key, sz))

    log(f"⚡ Already in R2: {skipped} files")
    log(f"📤 Pending Upload: {len(pending)} files ({sum(x[2] for x in pending) / (1024**2):.1f} MB)\n")

    if not pending:
        log("🎉 All quiz images are 100% synced to Cloudflare R2!")
        return

    t_start = time.time()
    uploaded = 0
    uploaded_bytes = 0

    def upload_one(item):
        f_path, r2_key, sz = item
        ext = f_path.suffix.lower()
        ct = "image/png" if ext == ".png" else "application/json" if ext == ".json" else "image/jpeg"
        last_err = None
        for attempt in range(1, 5):
            try:
                s3.upload_file(
                    str(f_path),
                    BUCKET_NAME,
                    r2_key,
                    ExtraArgs={
                        "ContentType": ct,
                        "CacheControl": "public, max-age=31536000, immutable",
                    },
                )
                return sz
            except Exception as e:
                last_err = e
                time.sleep(1.5 * attempt)
        raise last_err

    with ThreadPoolExecutor(max_workers=24) as pool:
        futures = [pool.submit(upload_one, item) for item in pending]
        for fut in as_completed(futures):
            try:
                sz = fut.result()
                uploaded += 1
                uploaded_bytes += sz
                curr = skipped + uploaded
                if uploaded % 100 == 0 or curr == total_files:
                    elapsed = max(0.1, time.time() - t_start)
                    pct = (curr / total_files) * 100
                    spd = (uploaded_bytes / (1024 * 1024)) / elapsed
                    log(f"[{curr}/{total_files} ({pct:.1f}%)] ✅ Uploaded {uploaded} files ({uploaded_bytes / (1024**2):.1f} MB @ {spd:.1f} MB/s)")
            except Exception as e:
                log(f"❌ Error uploading quiz asset: {e}")

    elapsed = max(0.1, time.time() - t_start)
    log("\n" + "=" * 75)
    log(f"🎉 QUIZ IMAGES R2 SYNC COMPLETE! Uploaded {uploaded} files ({uploaded_bytes / (1024**2):.1f} MB) in {elapsed / 60:.1f} min")
    log("=" * 75)


if __name__ == "__main__":
    main()
