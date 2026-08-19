import os

galeria_dir = r'd:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria'

f1 = 'figura_taquicardia_ventricular_monomorfica.png'
f2 = 'figura_torsades_de_pointes.png'

print(f"Checking {f1}: exists={os.path.exists(os.path.join(galeria_dir, f1))}")
print(f"Checking {f2}: exists={os.path.exists(os.path.join(galeria_dir, f2))}")
