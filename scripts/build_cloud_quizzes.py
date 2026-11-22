#!/usr/bin/env python3
"""
1. Builds cloud_quizzes.json and step1-prep/app/public/data/bnb-quizzes.json
   with all quiz images (figure_image, lecture_slide_image, explanation_image)
   pointing directly to the online Cloudflare R2 public URL:
   https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev/Boards_and_Beyond/quizzes_extracted/...
2. Also indexes all R2 videos/PDFs (Boards_and_Beyond/, Pathoma/, Sketchy/) into
   step1-prep/app/public/data/r2-videos.json so the online deployed page works 100% static!
"""
import json
import re
import urllib.parse
from pathlib import Path
from botocore.config import Config
import boto3

QUIZZES_DIR = Path("D:/Telegram_BnB_Videos/quizzes_extracted")
R2_PUBLIC_BASE = "https://pub-779a681676944ef9acf0f9492f86ba03.r2.dev"
ACCOUNT_ID = "1feadf1b0863cb9b502faaa828b563aa"
BUCKET_NAME = "eunacomvideos"
ACCESS_KEY_ID = "543b4c368c26b7bc4f210e26e82ff596"
SECRET_ACCESS_KEY = "1b2c3df467dcc3b664d3d353239b995b3b9a146a901d7296830d9f6910e10fec"

OUT_FILES = [
    Path("K:/Eunacom/repos/eunacom/bnb-video-player/cloud_quizzes.json"),
    Path("K:/Eunacom/repos/bnb-video-studio/cloud_quizzes.json"),
    Path("K:/Eunacom/repos/step1-prep/app/public/data/bnb-quizzes.json"),
]

R2_VIDEOS_JSON = Path("K:/Eunacom/repos/step1-prep/app/public/data/r2-videos.json")


def clean_key(name: str) -> str:
    s = re.sub(r"^\d+[\._\s\-]+", "", name)
    s = re.sub(r"-quiz$", "", s, flags=re.IGNORECASE)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def to_r2_image_url(img_path: str) -> str:
    if not img_path:
        return img_path
    if img_path.startswith("http://") or img_path.startswith("https://"):
        return img_path
    rel = img_path.replace("\\", "/")
    if rel.startswith("/quizzes/"):
        rel = rel[len("/quizzes/"):]
    elif rel.startswith("quizzes/"):
        rel = rel[len("quizzes/"):]
    rel = rel.lstrip("/")
    encoded_parts = [urllib.parse.quote(p) for p in rel.split("/")]
    return f"{R2_PUBLIC_BASE}/Boards_and_Beyond/quizzes_extracted/{'/'.join(encoded_parts)}"


def export_r2_videos_index():
    try:
        s3 = boto3.client(
            "s3",
            endpoint_url=f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=ACCESS_KEY_ID,
            aws_secret_access_key=SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
        paginator = s3.get_paginator("list_objects_v2")
        items = []
        for prefix in ("Boards_and_Beyond/", "Pathoma/", "Sketchy/"):
            for page in paginator.paginate(Bucket=BUCKET_NAME, Prefix=prefix):
                for obj in page.get("Contents", []):
                    k = obj["Key"]
                    if "/quizzes_extracted/" in k:
                        continue
                    if k.lower().endswith((".mp4", ".pdf")):
                        items.append({"key": k, "size": obj["Size"]})
        R2_VIDEOS_JSON.parent.mkdir(parents=True, exist_ok=True)
        R2_VIDEOS_JSON.write_text(json.dumps({"items": items}, ensure_ascii=False), encoding="utf-8")
        print(f"Saved {R2_VIDEOS_JSON}: {len(items)} online video/PDF items indexed from R2")
    except Exception as e:
        print(f"Warning indexing R2 videos: {e}")


def main():
    bundle = {}
    count = 0
    total_q = 0
    total_imgs = 0

    for qf in sorted(QUIZZES_DIR.rglob("quiz.json")):
        try:
            data = json.loads(qf.read_text(encoding="utf-8"))
            folder_name = qf.parent.name
            key = clean_key(folder_name)
            if not key:
                continue

            for q in data.get("questions", []):
                for field in ("figure_image", "lecture_slide_image", "explanation_image"):
                    if q.get(field):
                        q[field] = to_r2_image_url(q[field])
                        total_imgs += 1
                vmeta = q.get("visual_metadata")
                if isinstance(vmeta, dict) and vmeta.get("image_rel"):
                    vmeta["image_rel"] = to_r2_image_url(vmeta["image_rel"])

            bundle[key] = data
            count += 1
            total_q += len(data.get("questions", []))
        except Exception:
            pass

    payload = json.dumps(bundle, ensure_ascii=False)
    for out_f in OUT_FILES:
        if out_f.parent.exists():
            out_f.write_text(payload, encoding="utf-8")
            size_mb = out_f.stat().st_size / (1024 * 1024)
            print(f"Saved {out_f}: {count} quizzes ({total_q} questions, {total_imgs} online R2 image links, {size_mb:.2f} MB)")

    export_r2_videos_index()


if __name__ == "__main__":
    main()
