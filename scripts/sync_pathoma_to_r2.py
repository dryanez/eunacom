#!/usr/bin/env python3
"""
⚡ CLOUDFLARE R2 SYNC FOR PATHOMA 2026 + CLOUD CATALOG BUILDER
==============================================================
- Syncs all 112 Pathoma MP4 Video Lectures + Pathoma 2025 PDF + Anki decks (~7.15 GB)
  to the Cloudflare R2 bucket 'eunacomvideos' under prefix 'Pathoma/'
- Also builds K:/Eunacom/repos/eunacom/bnb-video-player/cloud_catalog.json so the
  Step 1 / Step 2 / Pathoma Studio App works on ANY computer via R2 streaming
  even without local D:/ drives attached!
"""

import os
import sys
import time
import json
import urllib.parse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from boto3.s3.transfer import TransferConfig
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

PATHOMA_ROOT = Path("D:/Telegram_Pathoma_Videos")
BNB_ROOT = Path("D:/Telegram_BnB_Videos")
LOG_FILE = PATHOMA_ROOT / "r2_sync.log"
CLOUD_CATALOG_FILE = Path(__file__).resolve().parent.parent / "bnb-video-player" / "cloud_catalog.json"


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


def fetch_remote_r2_objects(s3, prefix="Pathoma/"):
    log(f"🔍 Indexing existing objects in R2 under '{prefix}'...")
    existing = {}
    paginator = s3.get_paginator("list_objects_v2")
    try:
        for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix):
            for obj in page.get("Contents", []):
                existing[obj["Key"]] = obj["Size"]
    except Exception as e:
        log(f"⚠️ Error fetching remote R2 objects: {e}")
    log(f"   Found {len(existing)} existing objects in R2 under '{prefix}'.")
    return existing


def r2_public_url(r2_key: str) -> str:
    parts = [urllib.parse.quote(p) for p in r2_key.split("/")]
    return f"{PUBLIC_DEV_URL}/{'/'.join(parts)}"


def build_tree_node(dir_path: Path, root_path: Path, r2_prefix: str, virtual_prefix: str = ""):
    rel_dir = "" if dir_path == root_path else str(dir_path.relative_to(root_path)).replace("\\", "/")
    full_rel = f"{virtual_prefix}/{rel_dir}".strip("/") if virtual_prefix else rel_dir

    node = {
        "name": dir_path.name if not (dir_path == root_path and virtual_prefix) else virtual_prefix,
        "relativePath": full_rel,
        "type": "directory",
        "children": [],
        "videos": [],
    }

    if not dir_path.exists():
        return node

    entries = sorted(dir_path.iterdir(), key=lambda e: e.name.lower())
    for entry in entries:
        if entry.is_dir():
            if entry.name in ("PDFs_and_Quizzes", "quizzes_extracted", "Step2_Remote_Worker", "transcripts", "00_Book_and_Anki_Decks") or entry.name.startswith("test_"):
                continue
            sub = build_tree_node(entry, root_path, r2_prefix, virtual_prefix)
            if sub["children"] or sub["videos"]:
                node["children"].append(sub)
        elif entry.is_file() and entry.suffix.lower() in (".mp4", ".mkv", ".webm", ".mov"):
            if entry.name == "test_parallel.mp4":
                continue
            rel_file = str(entry.relative_to(root_path)).replace("\\", "/")
            v_rel = f"{virtual_prefix}/{rel_file}".strip("/") if virtual_prefix else rel_file
            r2_key = f"{r2_prefix}/{rel_file}"
            st = entry.stat()
            import re
            clean_title = re.sub(r"^\d{4}_", "", entry.stem)
            node["videos"].append({
                "filename": entry.name,
                "title": clean_title,
                "relativePath": v_rel,
                "size": st.st_size,
                "sizeFormatted": f"{st.st_size / (1024 * 1024):.1f} MB",
                "r2Key": r2_key,
                "r2Url": r2_public_url(r2_key),
                "url": r2_public_url(r2_key),
            })

    return node


def build_cloud_catalog():
    log("📦 Generating unified Cloud Catalog (Step 1 + Step 2 + Pathoma) for GitHub & App...")
    tree = []

    if BNB_ROOT.exists():
        for step_dir_name in ["Step 1 - Preclinical", "Step 2 - Clinical"]:
            sd = BNB_ROOT / step_dir_name
            if sd.exists():
                node = build_tree_node(sd, BNB_ROOT, "Boards_and_Beyond")
                tree.append(node)

    if PATHOMA_ROOT.exists():
        pathoma_node = build_tree_node(PATHOMA_ROOT, PATHOMA_ROOT, "Pathoma", virtual_prefix="Pathoma - Fundamentals of Pathology")
        tree.append(pathoma_node)

    total_videos = 0
    total_bytes = 0

    def count_all(n):
        nonlocal total_videos, total_bytes
        total_videos += len(n["videos"])
        for v in n["videos"]:
            total_bytes += v["size"]
        for c in n["children"]:
            count_all(c)

    for top in tree:
        count_all(top)

    catalog = {
        "r2BaseUrl": PUBLIC_DEV_URL,
        "bucketName": BUCKET_NAME,
        "pathomaPdfUrl": r2_public_url("Pathoma/00_Book_and_Anki_Decks/Pathoma 2025 Fundamentals of Pathology @Medicine_Its_easy.pdf"),
        "pathomaAnkiUrl": r2_public_url("Pathoma/00_Book_and_Anki_Decks/Slide's Pathoma.apkg"),
        "clinicalsAnkiUrl": r2_public_url("Pathoma/00_Book_and_Anki_Decks/Slide's Clinicals.apkg"),
        "totalVideos": total_videos,
        "totalSize": f"{total_bytes / (1024 ** 3):.2f} GB",
        "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tree": tree,
    }
    CLOUD_CATALOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    CLOUD_CATALOG_FILE.write_text(json.dumps(catalog, indent=2, ensure_ascii=False), encoding="utf-8")
    log(f"✅ Saved cloud catalog to {CLOUD_CATALOG_FILE} ({total_videos} videos, {catalog['totalSize']})")


def main():
    log("=" * 75)
    log("⚡ CLOUDFLARE R2 SYNC: PATHOMA 2026 (VIDEOS + 2025 PDF + ANKI DECKS)")
    log(f"Source Directory:  {PATHOMA_ROOT}")
    log(f"Target R2 Bucket:  {BUCKET_NAME}")
    log(f"Public Base URL:   {PUBLIC_DEV_URL}/Pathoma")
    log("=" * 75)

    build_cloud_catalog()

    s3 = get_r2_client()
    existing_r2 = fetch_remote_r2_objects(s3, prefix="Pathoma/")

    all_files = [
        f for f in sorted(PATHOMA_ROOT.rglob("*"))
        if f.is_file() and f.name != "r2_sync.log" and not f.name.endswith(".temp_dl")
    ]
    total_files = len(all_files)
    total_bytes = sum(f.stat().st_size for f in all_files)
    log(f"\n📂 Found {total_files} Pathoma files to sync ({total_bytes / (1024**3):.2f} GB)")

    pending = []
    skipped_count = 0
    skipped_bytes = 0

    for f in all_files:
        rel = str(f.relative_to(PATHOMA_ROOT)).replace("\\", "/")
        r2_key = f"Pathoma/{rel}"
        f_size = f.stat().st_size
        if r2_key in existing_r2 and existing_r2[r2_key] == f_size:
            skipped_count += 1
            skipped_bytes += f_size
        else:
            pending.append((f, r2_key, f_size))

    log(f"⚡ Already in R2: {skipped_count} files ({skipped_bytes / (1024**3):.2f} GB)")
    log(f"📤 Pending Upload: {len(pending)} files ({sum(x[2] for x in pending) / (1024**3):.2f} GB)\n")

    if not pending:
        log("🎉 All Pathoma files are already 100% synced to Cloudflare R2!")
        return

    transfer_config = TransferConfig(
        multipart_threshold=8 * 1024 * 1024,
        max_concurrency=8,
        multipart_chunksize=8 * 1024 * 1024,
        use_threads=True,
    )

    t_start = time.time()
    uploaded_count = 0
    uploaded_bytes = 0

    def upload_one(idx, f_path: Path, r2_key: str, f_size: int):
        ext = f_path.suffix.lower()
        content_type = (
            "video/mp4" if ext == ".mp4"
            else "application/pdf" if ext == ".pdf"
            else "application/json" if ext == ".json"
            else "application/octet-stream"
        )
        last_err = None
        for attempt in range(1, 6):
            try:
                t0 = time.time()
                client = get_r2_client()
                client.upload_file(
                    str(f_path),
                    BUCKET_NAME,
                    r2_key,
                    ExtraArgs={
                        "ContentType": content_type,
                        "CacheControl": "public, max-age=31536000, immutable",
                    },
                    Config=transfer_config,
                )
                dt = max(0.05, time.time() - t0)
                mb = f_size / (1024 * 1024)
                return idx, f_path.name, r2_key, f_size, mb, dt, mb / dt
            except Exception as e:
                last_err = e
                time.sleep(3.0 * attempt)
        raise last_err

    # Upload 2 files concurrently with 6 threads per file + automatic 5x retry
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [
            pool.submit(upload_one, i, f_path, r2_key, f_size)
            for i, (f_path, r2_key, f_size) in enumerate(pending, 1)
        ]
        for fut in as_completed(futures):
            try:
                idx, fname, r2_key, f_size, mb, dt, spd = fut.result()
                uploaded_count += 1
                uploaded_bytes += f_size
                curr = skipped_count + uploaded_count
                pct = (curr / total_files) * 100
                log(f"[{curr:03d}/{total_files:03d} ({pct:5.1f}%)] ✅ Uploaded {fname} ({mb:.1f} MB in {dt:.1f}s @ {spd:.1f} MB/s)")
            except Exception as e:
                log(f"❌ Upload error: {e}")

    total_elapsed = max(0.1, time.time() - t_start)
    avg_speed = (uploaded_bytes / (1024 * 1024)) / total_elapsed
    log("\n" + "=" * 75)
    log("🎉 CLOUDFLARE R2 PATHOMA SYNC COMPLETE!")
    log(f"• Uploaded:        {uploaded_count} files ({uploaded_bytes / (1024**3):.2f} GB)")
    log(f"• Elapsed Time:    {total_elapsed / 60:.1f} minutes (Avg: {avg_speed:.1f} MB/s)")
    log(f"• Public Base URL: {PUBLIC_DEV_URL}/Pathoma")
    log("=" * 75)


if __name__ == "__main__":
    main()
