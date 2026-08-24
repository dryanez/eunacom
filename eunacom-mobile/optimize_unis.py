from PIL import Image
import os

src_dir = 'public/img/unis_hd'
dest_dir = 'public/img/unis_clean'
os.makedirs(dest_dir, exist_ok=True)

for fname in os.listdir(src_dir):
    if fname.endswith('.png'):
        fpath = os.path.join(src_dir, fname)
        try:
            with Image.open(fpath) as img:
                img = img.convert('RGBA')
                img.thumbnail((120, 120), Image.Resampling.LANCZOS)
                out_path = os.path.join(dest_dir, fname)
                img.save(out_path, format='PNG', optimize=True)
                print(f"Optimized {fname} -> {os.path.getsize(out_path)} bytes")
        except Exception as e:
            print(f"Error {fname}:", e)
