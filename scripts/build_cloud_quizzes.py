#!/usr/bin/env python3
"""
Builds K:/Eunacom/repos/eunacom/bnb-video-player/cloud_quizzes.json from all 730 extracted
Boards & Beyond Step 1 & Step 2 quizzes so the Mac has 100% of the questions, options,
peer statistics, and explanations immediately via GitHub!
"""
import json
import re
from pathlib import Path

QUIZZES_DIR = Path("D:/Telegram_BnB_Videos/quizzes_extracted")
OUT_FILE = Path("K:/Eunacom/repos/eunacom/bnb-video-player/cloud_quizzes.json")


def clean_key(name: str) -> str:
    s = re.sub(r"^\d+[\._\s\-]+", "", name)
    s = re.sub(r"-quiz$", "", s, flags=re.IGNORECASE)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    bundle = {}
    count = 0
    total_q = 0
    for qf in sorted(QUIZZES_DIR.rglob("quiz.json")):
        try:
            data = json.loads(qf.read_text(encoding="utf-8"))
            folder_name = qf.parent.name
            key = clean_key(folder_name)
            if not key:
                continue
            bundle[key] = data
            count += 1
            total_q += len(data.get("questions", []))
        except Exception:
            pass

    OUT_FILE.write_text(json.dumps(bundle, ensure_ascii=False), encoding="utf-8")
    size_mb = OUT_FILE.stat().st_size / (1024 * 1024)
    print(f"Built {OUT_FILE}: {count} quizzes ({total_q} questions, {size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
