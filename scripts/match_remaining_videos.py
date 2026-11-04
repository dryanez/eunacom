#!/usr/bin/env python3
import os
import sys
import re
import json
import shutil
from pathlib import Path
from difflib import SequenceMatcher

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

base = Path("D:/Telegram_BnB_Videos")
curriculum = json.loads(Path("scripts/bnb_curriculum_master.json").read_text(encoding="utf-8"))

ALIASES = {
    "pcr": "polymerase chain reaction",
    "copd": "chronic obstructive pulmonary disease",
    "cppd": "calcium pyrophosphate deposition",
    "hiv": "human immunodeficiency virus",
    "cns": "central nervous system",
    "cv": "cardiovascular",
    "ekg": "electrocardiogram",
    "ecg": "electrocardiogram",
    "wpw": "wolff parkinson white",
    "tb": "tuberculosis",
}

lookup = []
for step_name, subjects in curriculum.items():
    step_folder = "Step 1 - Preclinical" if "1" in step_name else "Step 2 - Clinical"
    for s_idx, subj in enumerate(subjects, 1):
        subj_name = subj["subject"]
        subj_folder = f"{s_idx:02d}_{subj_name.replace('/', '_')}"
        for sub_idx, subsec in enumerate(subj["subsections"], 1):
            subsec_name = f"{subsec['number']} {subsec['title'].replace('/', '_')}"
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
                    "words": set(re.findall(r"[a-z0-9]+", lesson["title"].lower())),
                })

unmatched = [
    f for f in base.rglob("*.mp4")
    if not str(f).startswith(str(base / "Step 1 - Preclinical"))
    and not str(f).startswith(str(base / "Step 2 - Clinical"))
]

print(f"Attempting to match {len(unmatched)} remaining files...")

moved_count = 0
for f in unmatched:
    if f.name == "test_parallel.mp4":
        continue
    stem = f.stem
    clean_stem = re.sub(r"^\d+[\._\s\-]+", "", stem).lower()

    for k, v in ALIASES.items():
        clean_stem = re.sub(rf"\b{k}\b", v, clean_stem)

    f_words = set(re.findall(r"[a-z0-9]+", clean_stem))
    clean_f = re.sub(r"[^a-zA-Z0-9]", "", clean_stem)

    best_match = None
    best_score = 0.0

    for entry in lookup:
        target = entry["clean_title"]
        if target == clean_f or target in clean_f or clean_f in target:
            best_match = entry
            best_score = 1.0
            break

        common_words = f_words.intersection(entry["words"])
        if len(common_words) >= 1:
            score = len(common_words) / max(len(f_words), len(entry["words"]))
            if score > best_score and score >= 0.4:
                best_score = score
                best_match = entry

        ratio = SequenceMatcher(None, clean_f, target).ratio()
        if ratio > best_score and ratio >= 0.60:
            best_score = ratio
            best_match = entry

    if best_match and best_score >= 0.4:
        target_dir = (
            base
            / best_match["step_folder"]
            / best_match["subject_folder"]
            / best_match["subsection_folder"]
        )
        target_dir.mkdir(parents=True, exist_ok=True)
        clean_name = re.sub(r'[\\/*?:"<>|]', " ", best_match["lesson_title"]).strip()
        new_filename = f"{best_match['lesson_index']:02d}_{clean_name}.mp4"
        target_path = target_dir / new_filename
        shutil.move(str(f), str(target_path))
        print(f"✅ Matched: {f.name} -> [{best_match['step']}] {best_match['subject_name']} / {best_match['lesson_title']}")
        moved_count += 1
    else:
        print(f"❌ Still unmatched: {f.name}")

# Remove empty General_Videos folder if empty
gv = base / "General_Videos"
if gv.exists() and not any(gv.iterdir()):
    gv.rmdir()
    print("Cleaned General_Videos folder.")

print(f"\nTotal moved: {moved_count}")
