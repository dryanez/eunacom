#!/usr/bin/env python3
"""
Clean PDF Checklist Parser for Boards & Beyond (Step 1 & Step 2)
Handles multiline wrapped lesson titles and durations cleanly.
"""

import os
import sys
import re
import json
import pypdf
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

pdf1 = Path(r"C:\Users\PC\Downloads\Telegram Desktop\step 1 bnb.pdf")
pdf2 = Path(r"C:\Users\PC\Downloads\Telegram Desktop\step2 bnb.pdf")


def extract_clean_curriculum(pdf_path, step_name):
    reader = pypdf.PdfReader(str(pdf_path))
    full_text = "\n".join(p.extract_text() or "" for p in reader.pages)

    # Clean lines
    lines = []
    for l in full_text.splitlines():
        l = l.strip()
        if not l or "Checklist" in l or "Copyright" in l:
            continue
        lines.append(l)

    # Join split lines where checkbox is on one line and duration on next
    merged_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if i + 1 < len(lines):
            next_line = lines[i + 1]
            if not next_line.startswith("□") and not "(" in line and "(" in next_line:
                line = line + " " + next_line
                i += 1
            elif line.startswith("□") and not "(" in line and "(" in next_line and next_line.startswith("□"):
                # Case: □ Chest Trauma \n □ (15 minutes)
                clean_next = next_line.replace("□", "").strip()
                line = line + " " + clean_next
                i += 1
        merged_lines.append(line)
        i += 1

    curriculum = []
    current_subject = None
    current_subsection = None

    subject_re = re.compile(r"^([A-Za-z0-9\s/&-]+)\s*\(\s*(\d+)\s*videos?[;,]\s*([^)]+)\)", re.I)
    subsection_re = re.compile(r"^[□\s]*([IVXLCDM]+\.|\d+\.)\s*([^(]+)\s*\(([^)]+)\)", re.I)
    lesson_re = re.compile(r"^[□\s]*([^(]+)\s*\(([^)]+)\)", re.I)

    for line in merged_lines:
        sm = subject_re.match(line)
        if sm:
            subj_name = sm.group(1).strip()
            num_vids = int(sm.group(2))
            dur = sm.group(3).strip()
            current_subject = {
                "step": step_name,
                "subject": subj_name,
                "total_videos": num_vids,
                "duration": dur,
                "subsections": [],
            }
            curriculum.append(current_subject)
            current_subsection = None
            continue

        if current_subject is not None:
            subm = subsection_re.match(line)
            if subm:
                num = subm.group(1).strip()
                title = subm.group(2).strip()
                dur = subm.group(3).strip()
                current_subsection = {
                    "number": num,
                    "title": title,
                    "duration": dur,
                    "lessons": [],
                }
                current_subject["subsections"].append(current_subsection)
                continue

            lm = lesson_re.match(line)
            if lm:
                title = lm.group(1).strip()
                dur = lm.group(2).strip()
                if title.startswith("I.") or title.startswith("II.") or title.startswith("III."):
                    continue
                if current_subsection is None:
                    current_subsection = {
                        "number": "I.",
                        "title": "General Topics",
                        "duration": "",
                        "lessons": [],
                    }
                    current_subject["subsections"].append(current_subsection)

                current_subsection["lessons"].append({
                    "title": title,
                    "duration": dur,
                })

    return curriculum


step1 = extract_clean_curriculum(pdf1, "Step 1 - Preclinical")
step2 = extract_clean_curriculum(pdf2, "Step 2 - Clinical")

master = {"Step 1 - Preclinical": step1, "Step 2 - Clinical": step2}
Path("scripts/bnb_curriculum_master.json").write_text(json.dumps(master, indent=2, ensure_ascii=False), encoding="utf-8")

total_s1 = sum(sum(len(sub["lessons"]) for sub in s["subsections"]) for s in step1)
total_s2 = sum(sum(len(sub["lessons"]) for sub in s["subsections"]) for s in step2)

print(f"Step 1: {len(step1)} subjects, {total_s1} lessons")
print(f"Step 2: {len(step2)} subjects, {total_s2} lessons")
print(f"Total Curriculum Lessons: {total_s1 + total_s2}")
