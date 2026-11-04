#!/usr/bin/env python3
"""
Boards & Beyond PDF Curriculum Auto-Organizer
=============================================
Organizes downloaded videos in D:\Telegram_BnB_Videos into the exact official
Step 1 (Preclinical) and Step 2 (Clinical) hierarchy from the PDF checklists.
"""

import os
import sys
import re
import json
import shutil
from pathlib import Path
from difflib import SequenceMatcher

# Windows Console UTF-8 Fix
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path("D:/Telegram_BnB_Videos")
CURRICULUM_FILE = Path(__file__).resolve().parent / "bnb_curriculum_master.json"
MANIFEST_FILE = BASE_DIR / "telegram_video_manifest.json"


def sanitize(name: str) -> str:
    clean = re.sub(r'[\\/*?:"<>|]', " ", name)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean[:90] if clean else "General"


def load_curriculum():
    if not CURRICULUM_FILE.exists():
        print(f"[!] Missing {CURRICULUM_FILE}")
        sys.exit(1)
    return json.loads(CURRICULUM_FILE.read_text(encoding="utf-8"))


def build_lookup_table(curriculum):
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
                        "subject_index": s_idx,
                        "subject_name": subj_name,
                        "subject_folder": subj_folder,
                        "subsection_folder": subsec_name,
                        "lesson_index": l_idx,
                        "lesson_title": lesson["title"],
                        "duration": lesson["duration"],
                        "clean_title": clean_title,
                    })
    return lookup


def find_best_match(filename: str, lookup: list):
    stem = Path(filename).stem
    clean_stem = re.sub(r"^\d+[\._\s\-]+", "", stem)
    clean_f = re.sub(r"[^a-zA-Z0-9]", "", clean_stem.lower())

    best_match = None
    best_score = 0.0

    for entry in lookup:
        target = entry["clean_title"]
        if target == clean_f:
            return entry, 1.0
        if target in clean_f or clean_f in target:
            score = len(target) / max(len(clean_f), len(target))
            if score > best_score:
                best_score = score
                best_match = entry
                continue

        ratio = SequenceMatcher(None, clean_f, target).ratio()
        if ratio > best_score and ratio >= 0.72:
            best_score = ratio
            best_match = entry

    return best_match, best_score


def organize_existing_files():
    print("=" * 70)
    print("📚 ORGANIZING BNBDOWNLOADS BY STEP 1 & STEP 2 PDF CHECKLISTS")
    print("=" * 70)

    curriculum = load_curriculum()
    lookup = build_lookup_table(curriculum)
    print(f"Loaded {len(lookup)} official lessons from PDF checklists.")

    # Find all MP4s in D:\Telegram_BnB_Videos
    all_files = list(BASE_DIR.rglob("*.mp4"))
    print(f"Found {len(all_files)} video files to process.\n")

    organized_count = 0
    already_placed = 0
    unmatched_count = 0

    new_manifest = {}
    if MANIFEST_FILE.exists():
        try:
            old_manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
        except Exception:
            old_manifest = {}
    else:
        old_manifest = {}

    for f in all_files:
        # Check if already inside Step 1 or Step 2 folder structure
        parts = f.relative_to(BASE_DIR).parts
        if len(parts) >= 4 and parts[0] in ["Step 1 - Preclinical", "Step 2 - Clinical"]:
            already_placed += 1
            continue

        match, score = find_best_match(f.name, lookup)
        if match and score >= 0.70:
            target_dir = (
                BASE_DIR
                / match["step_folder"]
                / match["subject_folder"]
                / sanitize(match["subsection_folder"])
            )
            target_dir.mkdir(parents=True, exist_ok=True)

            lesson_num = f"{match['lesson_index']:02d}"
            new_filename = f"{lesson_num}_{sanitize(match['lesson_title'])}.mp4"
            target_path = target_dir / new_filename

            # If moving from temp/general location
            if f.resolve() != target_path.resolve():
                shutil.move(str(f), str(target_path))
                print(f"✅ Moved: {f.name} \n   -> [{match['step']}] {match['subject_folder']}/{match['subsection_folder']}/{new_filename}")
                organized_count += 1
        else:
            print(f"⚠️ Could not match precisely: {f.name}")
            unmatched_count += 1

    # Clean up empty legacy folders
    for item in BASE_DIR.iterdir():
        if item.is_dir() and item.name not in ["Step 1 - Preclinical", "Step 2 - Clinical"]:
            try:
                # Remove if empty
                if not any(item.rglob("*.mp4")):
                    shutil.rmtree(str(item))
                    print(f"🧹 Cleaned empty folder: {item.name}")
            except Exception:
                pass

    print("\n" + "=" * 70)
    print("🎉 PDF CURRICULUM ORGANIZATION COMPLETED!")
    print(f"• Successfully organized: {organized_count}")
    print(f"• Already in place: {already_placed}")
    print(f"• Unmatched: {unmatched_count}")
    print("=" * 70)


if __name__ == "__main__":
    organize_existing_files()
