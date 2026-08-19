import os
import shutil

book_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book'

keep_files = {
    'ALGORITHMS.pdf',
    'First_Aid_Clinical_Algorithms_for_the_USMLE_Step_2_Ck.pdf',
    'Perfil2026.pdf',
    'cardiologia.pdf',
    'cardio_online_classes.json',
    'capitulos_v3',
    'figuras_galeria',
    'generate-book',
    'generate_individual_chapter_pdfs_v3.cjs',
    'fix_graphs_and_update_capitulos.py',
    'build_all_cardio_svgs.cjs',
    'build_rich_cardiology_data.cjs'
}

items = os.listdir(book_dir)
deleted_count = 0
moved_scripts_count = 0

scripts_dir = os.path.join(book_dir, 'scripts')
os.makedirs(scripts_dir, exist_ok=True)

for item in items:
    if item in keep_files or item == 'scripts' or item == 'cleanup_book_folder.py':
        continue
    
    item_path = os.path.join(book_dir, item)
    
    if item.endswith('.pdf') or item.endswith('.txt') or item in ['capitulos', 'capitulos_v2']:
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)
        deleted_count += 1
        print(f" [-] Deleted obsolete item: {item}")
        
    elif item.endswith('.py') or item.endswith('.cjs') or item.endswith('.js'):
        dest_path = os.path.join(scripts_dir, item)
        if os.path.exists(dest_path):
            os.remove(dest_path)
        shutil.move(item_path, dest_path)
        moved_scripts_count += 1
        print(f" [*] Moved script to scripts/: {item}")

print(f"\n=== CLEANUP COMPLETED ===")
print(f"Deleted obsolete files/folders: {deleted_count}")
print(f"Moved helper scripts to scripts/: {moved_scripts_count}")
