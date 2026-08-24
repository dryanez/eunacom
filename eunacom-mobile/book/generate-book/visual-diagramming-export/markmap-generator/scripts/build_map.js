const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'mindmap_result.html';

if (!inputFile) {
    console.error('Uso: node build_map.js <archivo_origen.md> [archivo_destino.html]');
    process.exit(1);
}

try {
    console.log(`[Markmap Builder] Iniciando proceso para ${path.basename(inputFile)}...`);

    // Ejecuta el comando NPX de manera silenciosa pero heredando los outputs críticos
    execSync(`npx -y markmap-cli "${inputFile}" --no-open -o "${outputFile}"`, { stdio: 'inherit' });

    console.log(`[Markmap Builder] ✅ Éxito! Archivo HTML renderizado en: ${outputFile}`);

    // Funcionalidad de Auto-Limpieza: elimina el archivo .md si usamos el prefijo temp_
    if (fs.existsSync(inputFile) && path.basename(inputFile).startsWith('temp_')) {
        fs.unlinkSync(inputFile);
        console.log(`[Markmap Builder] 🧹 Limpieza de entorno: Se borró el archivo temporal ${path.basename(inputFile)}.`);
    }
} catch (err) {
    console.error('[Markmap Builder] ❌ Error compilando el esquema en HTML:', err.message);
    process.exit(1);
}
