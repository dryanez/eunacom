import os
from PIL import Image

media_path = r'C:\Users\PC\.gemini\antigravity\brain\d1bdaf6b-4817-4e18-9fdd-07c6dc0667c0\.user_uploaded\media_1787137071093.png'
galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

if not os.path.exists(galeria_dir):
    os.makedirs(galeria_dir, exist_ok=True)

with Image.open(media_path) as img:
    w, h = img.size
    print(f"Uploaded reference image size: {w}x{h} px")
    
    # 1. 1st-degree AV block (Top strip)
    crop1 = img.crop((0, int(h*0.04), w, int(h*0.22)))
    crop1.save(os.path.join(galeria_dir, 'figura_bloqueo_av_1er_grado.png'), 'PNG')
    
    # 2. 2nd-degree Mobitz I (Wenckebach) (2nd strip)
    crop2 = img.crop((0, int(h*0.27), w, int(h*0.47)))
    crop2.save(os.path.join(galeria_dir, 'figura_bloqueo_av_2do_grado_mobitz_1_wenckebach.png'), 'PNG')

    # 3. 2nd-degree Mobitz II (3rd strip)
    crop3 = img.crop((0, int(h*0.52), w, int(h*0.72)))
    crop3.save(os.path.join(galeria_dir, 'figura_bloqueo_av_2do_grado_mobitz_2.png'), 'PNG')

    # 4. 3rd-degree / Complete AV block (4th strip)
    crop4 = img.crop((0, int(h*0.77), w, int(h*0.97)))
    crop4.save(os.path.join(galeria_dir, 'figura_bloqueo_av_3er_grado_completo.png'), 'PNG')

print("\n=== CROPPED THE 4 AV BLOCKS FROM USER REFERENCE SHEET ===")
print(" [*] figura_bloqueo_av_1er_grado.png: Bloqueo AV de 1er grado")
print(" [*] figura_bloqueo_av_2do_grado_mobitz_1_wenckebach.png: Bloqueo AV de 2do grado Mobitz I (Wenckebach)")
print(" [*] figura_bloqueo_av_2do_grado_mobitz_2.png: Bloqueo AV de 2do grado Mobitz II")
print(" [*] figura_bloqueo_av_3er_grado_completo.png: Bloqueo AV completo (3er grado)")
