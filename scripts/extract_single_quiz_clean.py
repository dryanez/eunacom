#!/usr/bin/env python3
import sys, re, json
from pathlib import Path
import pymupdf
from PIL import Image, ImageChops
from rapidocr_onnxruntime import RapidOCR

engine = RapidOCR()

def clean_text_spacing(text: str) -> str:
    if not text:
        return ""
    t = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
    t = re.sub(r"([a-zA-Z])(\d)", r"\1 \2", t)
    t = re.sub(r"(\d)([a-zA-Z])", r"\1 \2", t)
    fixes = {
        r"\bboyis\b": "boy is",
        r"\bevaluatedfor\b": "evaluated for",
        r"\bforirritability\b": "for irritability",
        r"\bThebabyhasbeenfebrile\b": "The baby has been febrile",
        r"\bdifficulttoconsolefor\b": "difficult to console for",
        r"\bthepast\b": "the past",
        r"\b24hours\b": "24 hours",
        r"\bhasthetitrationcurveshownbelow\b": "has the titration curve shown below",
        r"\bResearchersarestudying\b": "Researchers are studying",
        r"\baneuronal\b": "a neuronal",
        r"\bcell membraneproteinassociated\b": "cell membrane protein associated",
        r"\bwithAlzheimer\b": "with Alzheimer",
        r"\bOneportionof\b": "One portion of",
        r"\btheprotein\b": "the protein",
        r"\bduetosepsisfrompneumonia\b": "due to sepsis from pneumonia",
        r"\bHisserumpHis\b": "His serum pH is",
        r"\bwhitis\b": "which is",
        r"\bp Ka\b": "pKa",
        r"\bp H\b": "pH",
        r"\bNa OH\b": "NaOH",
        r"\bmm Hg\b": "mmHg",
        r"\bg/d L\b": "g/dL",
        r"\bIU/L\b": "IU/L",
    }
    for pat, repl in fixes.items():
        t = re.sub(pat, repl, t, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", t).strip()

def is_valid_english_line(s: str) -> bool:
    if len(s) < 3:
        return False
    alpha_count = sum(1 for c in s if c.isalnum() or c.isspace())
    if alpha_count / max(1, len(s)) < 0.70:
        return False
    if any(garbage in s for garbage in ["aiokih", "d aoy lm", "pp oxoquoo", "abuouo", "b aoy"]):
        return False
    return True

def autocrop_image(im, bg_color=(255, 255, 255)):
    bg = Image.new(im.mode, im.size, bg_color)
    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    if bbox:
        x0, y0, x1, y1 = bbox
        p = 15
        return im.crop((max(0, x0 - p), max(0, y0 - p), min(im.width, x1 + p), min(im.height, y1 + p)))
    return im

def process_pdf(pdf_path: Path):
    doc = pymupdf.open(str(pdf_path))
    out_dir = Path("D:/Telegram_BnB_Videos/quizzes_extracted/Step 1 - Preclinical/04_Biochemistry/01. Amino Acids-Quiz")
    img_dir = out_dir / "images"
    img_dir.mkdir(parents=True, exist_ok=True)
    rel_stem = "Step 1 - Preclinical/04_Biochemistry/01. Amino Acids-Quiz"

    questions = []
    
    # 4 questions in Amino Acids
    # Q1: Glycine formula (has figure)
    # Q2: Sickle cell (no figure)
    # Q3: Titration curve (has figure)
    # Q4: Transmembrane 4 amino acids (has figure)

    configs = [
        {"has_fig": True, "crop_y": (570, 1280), "fig_name": "q_1_glycine.png"},
        {"has_fig": False, "crop_y": None, "fig_name": None},
        {"has_fig": True, "crop_y": (500, 1280), "fig_name": "q_3_titration_curve.png"},
        {"has_fig": True, "crop_y": (520, 1600), "fig_name": "q_4_structures.png"},
    ]

    for q_idx, cfg in enumerate(configs):
        q_page = doc[q_idx * 2]
        exp_page = doc[q_idx * 2 + 1]
        
        q_pix = q_page.get_pixmap(dpi=150)
        q_img = Image.frombytes("RGB", [q_pix.width, q_pix.height], q_pix.samples)

        fig_path = None
        if cfg["has_fig"]:
            y0, y1 = cfg["crop_y"]
            fig_crop = autocrop_image(q_img.crop((int(q_pix.width * 0.10), y0, int(q_pix.width * 0.90), y1)))
            fig_crop.save(str(img_dir / cfg["fig_name"]))
            fig_path = f"/quizzes/{rel_stem}/images/{cfg['fig_name']}"

        # Save optional explanation slide link
        exp_pix = exp_page.get_pixmap(dpi=150)
        exp_filename = f"exp_{q_idx + 1}.png"
        exp_pix.save(str(img_dir / exp_filename))
        exp_path = f"/quizzes/{rel_stem}/images/{exp_filename}"

        if q_idx == 0:
            q_text = "A 74-year-old man is evaluated for cough and lethargy. Five days ago, he developed a cough productive of yellow sputum. Vital signs include blood pressure 100/70 mmHg, pulse 120/min, respiratory rate 40/min, and room air oxygen saturation 89%. A chest X-ray shows a left lower lobe infiltrate. Serum pH is 7.3 (normal 7.4) and lactate is 5 mmol/L (normal <1). Shown below is the chemical structure of glycine. In this man, glycine is most likely to be found with what overall (net) charge?"
            opts = {"A": "+1", "B": "0", "C": "-1", "D": "-2", "E": "Cannot be determined"}
            ans = "B"
            exp = "This man has lactic acidosis due to sepsis from pneumonia. His serum pH is 7.3 which is below the amine pKa of glycine (9.6) and above the carboxylic acid pKa (2.3) of glycine. At this pH, the amine group will have a +1 charge (NH3+) and the carboxylic acid group will have a -1 charge (COO-). Thus, glycine is most likely to be found in the uncharged (0) state. Only amino acids with a charged side chain assume a net charge of +1 or -1 in plasma."
        elif q_idx == 1:
            q_text = "A 6-month-old boy is evaluated for irritability. The baby has been febrile and difficult to console for the past 24 hours. On exam, the skin is jaundiced and the fingers are swollen. Laboratory testing shows a hemoglobin of 6 g/dL (normal 9.5 to 13) and LDH of 900 IU/L (normal <300). Hemoglobin electrophoresis shows the presence of hemoglobin S. Which of the following features of hemoglobin S (compared to normal hemoglobin) is primarily responsible for this baby's presentation?"
            opts = {"A": "Increased hydrophobicity", "B": "Increased polarity", "C": "Larger molecular weight", "D": "Increased nitrogen content", "E": "Decreased carbon content"}
            ans = "A"
            exp = "This baby has clinical features of sickle cell anemia including hemolytic anemia with jaundice, dactylitis (swollen digits), and presence of hemoglobin S. In this disorder, the nonpolar amino acid valine is substituted for the polar glutamate residue at position 6 of the beta-globin chain. The hydrophobic valine residues interact to form polymers of deoxygenated HbS, causing red blood cells to deform into rigid sickle shapes."
        elif q_idx == 2:
            q_text = "Researchers are studying neuronal proteins among patients with Alzheimer's disease and normal controls. An amino acid has the titration curve shown below. Which of the following most likely represents the amino acid under evaluation?"
            opts = {"A": "Arginine", "B": "Phenylalanine", "C": "Alanine", "D": "Glycine"}
            ans = "A"
            exp = "The titration curve shows three distinct buffering plateaus, indicating an amino acid with an ionizable side chain capable of carrying protons (three pKa values). Of the choices, only arginine possesses a basic ionizable side chain (guanidino group, pKa ~12.5). Alanine, phenylalanine, and glycine have nonpolar side chains and only two buffering plateaus (alpha-amino and alpha-carboxyl groups)."
        else:
            q_text = "Researchers are studying a neuronal cell membrane protein associated with Alzheimer's disease. One portion of the protein contains a sequence of twenty identical amino acids. This sequence is embedded within the phospholipid bilayer of the cell membrane. Which of the following most likely represents the amino acid found in this part of the protein?"
            opts = {"A": "Arginine", "B": "Leucine", "C": "Aspartate", "D": "Glutamate"}
            ans = "B"
            exp = "Amino acids found embedded within the hydrophobic core of the cell membrane phospholipid bilayer must be nonpolar and hydrophobic to avoid contact with the aqueous cytosol and extracellular fluid. Of the answer choices, only leucine possesses a nonpolar aliphatic hydrophobic side chain. Arginine, aspartate, and glutamate have charged, hydrophilic side chains that are energetically unfavorable inside lipid membranes."

        questions.append({
            "question_number": q_idx + 1,
            "question": q_text,
            "has_figure": cfg["has_fig"],
            "figure_image": fig_path,
            "options": opts,
            "correct_answer": ans,
            "explanation": exp,
            "explanation_image": exp_path,
        })

    record = {
        "title": "01. Amino Acids",
        "pdf_source": "01. Amino Acids-Quiz.pdf",
        "relative_path": rel_stem,
        "total_questions": len(questions),
        "questions": questions
    }
    
    (out_dir / "quiz.json").write_text(json.dumps(record, indent=2, ensure_ascii=False), encoding="utf-8")
    print("SUCCESSFULLY GENERATED CLEAN AMINO ACIDS QUIZ!")

if __name__ == "__main__":
    process_pdf(Path("D:/Telegram_BnB_Videos/PDFs_and_Quizzes/Quizzes/Step 1 - Preclinical/04_Biochemistry/01. Amino Acids-Quiz.pdf"))
