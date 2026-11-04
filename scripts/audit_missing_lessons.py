#!/usr/bin/env python3
import sys
import json
import re
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

downloaded_files = list(base.rglob("*.mp4"))
downloaded_clean = []
for f in downloaded_files:
    if "transcripts" in str(f):
        continue
    stem = f.stem
    clean_stem = re.sub(r"^\d+[\._\s\-]+", "", stem).lower()
    clean_key = re.sub(r"[^a-zA-Z0-9]", "", clean_stem)
    downloaded_clean.append({
        "path": f,
        "filename": f.name,
        "clean_key": clean_key,
        "stem_lower": clean_stem,
    })

print(f"Total video files on disk: {len(downloaded_clean)}")

missing_by_step = {"Step 1 - Preclinical": [], "Step 2 - Clinical": []}
matched_count = 0
total_pdf_lessons = 0

for step_name, subjects in curriculum.items():
    step_key = "Step 1 - Preclinical" if "1" in step_name else "Step 2 - Clinical"
    for s_idx, subj in enumerate(subjects, 1):
        subj_name = subj["subject"]
        for sub_idx, subsec in enumerate(subj["subsections"], 1):
            subsec_name = f"{subsec['number']} {subsec['title']}"
            for l_idx, lesson in enumerate(subsec["lessons"], 1):
                total_pdf_lessons += 1
                lesson_title = lesson["title"]
                clean_title = re.sub(r"[^a-zA-Z0-9]", "", lesson_title.lower())

                is_matched = False
                matched_file = None

                for df in downloaded_clean:
                    if clean_title == df["clean_key"] or clean_title in df["clean_key"] or df["clean_key"] in clean_title:
                        is_matched = True
                        matched_file = df["filename"]
                        break
                    ratio = SequenceMatcher(None, clean_title, df["clean_key"]).ratio()
                    if ratio >= 0.70:
                        is_matched = True
                        matched_file = df["filename"]
                        break

                if is_matched:
                    matched_count += 1
                else:
                    missing_by_step[step_key].append({
                        "subject": subj_name,
                        "subsection": subsec_name,
                        "lesson": lesson_title,
                        "duration": lesson.get("duration", ""),
                    })

print("=" * 70)
print("📊 PDF CURRICULUM AUDIT RESULTS")
print("=" * 70)
print(f"Total Official Lessons in PDFs: {total_pdf_lessons}")
print(f"Total Downloaded & Matched:    {matched_count} ({matched_count/total_pdf_lessons*100:.1f}%)")
s1_missing_count = len(missing_by_step['Step 1 - Preclinical'])
s2_missing_count = len(missing_by_step['Step 2 - Clinical'])
print(f"Total Missing from PDFs:        {s1_missing_count + s2_missing_count}")

print("\n" + "=" * 70)
print(f"📘 STEP 1 MISSING LESSONS ({s1_missing_count} missing):")
print("=" * 70)
curr_subj = ""
for m in missing_by_step["Step 1 - Preclinical"]:
    if m["subject"] != curr_subj:
        curr_subj = m["subject"]
        print(f"\n📂 {curr_subj}:")
    print(f"   ❌ {m['lesson']} ({m['duration']}) [{m['subsection']}]")

print("\n" + "=" * 70)
print(f"📙 STEP 2 MISSING LESSONS ({s2_missing_count} missing):")
print("=" * 70)
curr_subj = ""
for m in missing_by_step["Step 2 - Clinical"]:
    if m["subject"] != curr_subj:
        curr_subj = m["subject"]
        print(f"\n📂 {curr_subj}:")
    print(f"   ❌ {m['lesson']} ({m['duration']}) [{m['subsection']}]")
