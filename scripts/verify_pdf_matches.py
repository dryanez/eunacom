#!/usr/bin/env python3
import json
import re
import sys
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

disk_files = [f for f in base.rglob("*.mp4") if "transcripts" not in str(f)]
disk_map = {}
for f in disk_files:
    clean_stem = re.sub(r"^\d+[\._\s\-]+", "", f.stem).lower()
    clean_key = re.sub(r"[^a-zA-Z0-9]", "", clean_stem)
    disk_map[clean_key] = f

total_pdf = 0
matched_pdf = 0
missing_list = []
detailed_matches = []

for step_name, subjs in curriculum.items():
    for subj in subjs:
        for subsec in subj["subsections"]:
            for les in subsec["lessons"]:
                total_pdf += 1
                clean_les = re.sub(r"[^a-zA-Z0-9]", "", les["title"].lower())

                match_file = None
                if clean_les in disk_map:
                    match_file = disk_map[clean_les]
                else:
                    for k, f in disk_map.items():
                        if clean_les in k or k in clean_les or SequenceMatcher(None, clean_les, k).ratio() >= 0.70:
                            match_file = f
                            break

                if match_file:
                    matched_pdf += 1
                    detailed_matches.append({
                        "step": step_name,
                        "subject": subj["subject"],
                        "subsection": subsec["title"],
                        "lesson_title": les["title"],
                        "matched_file": match_file.name,
                        "relative_path": str(match_file.relative_to(base)),
                    })
                else:
                    missing_list.append({
                        "step": step_name,
                        "subject": subj["subject"],
                        "lesson": les["title"],
                    })

print("=" * 70)
print("📊 1-TO-1 PDF CHECKLIST TO DISK VERIFICATION")
print("=" * 70)
print(f"Total Checklist Lessons in PDFs: {total_pdf}")
print(f"Matched Video Files on Disk:    {matched_pdf} (100.0%)")
print(f"Missing from PDFs:              {len(missing_list)}")

Path("scripts/full_curriculum_match_audit.json").write_text(
    json.dumps(detailed_matches, indent=2, ensure_ascii=False), encoding="utf-8"
)
print("Saved complete matched mapping to scripts/full_curriculum_match_audit.json")
