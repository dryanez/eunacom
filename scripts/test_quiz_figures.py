import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract_quizzes_clean import process_quiz_pdf
import json

pdf = Path('D:/Telegram_BnB_Videos/PDFs_and_Quizzes/Quizzes/Step 1 - Preclinical/04_Biochemistry/01. Amino Acids-Quiz.pdf')
res = process_quiz_pdf(pdf)

print('=== PROCESSED AMINO ACIDS QUIZ ===')
for q in res['questions']:
    print(f"Q{q['question_number']}: has_figure={q['has_figure']}, figure_image={q['figure_image']}")
    print('  Stem:', q['question'][:120])
    print('  Options:', q['options'])
    print('  Correct:', q['correct_answer'])
