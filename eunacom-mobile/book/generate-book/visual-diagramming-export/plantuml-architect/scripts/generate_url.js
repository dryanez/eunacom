const zlib = require('zlib');
const fs = require('fs');

const inputFile = process.argv[2];

if (!inputFile) {
    console.error('Uso: node generate_url.js <archivo_diagrama.puml>');
    process.exit(1);
}

try {
    // 1. Lectura
    const code = fs.readFileSync(inputFile, 'utf8');

    // 2. Deflate y codificación (Requisito estricto de la API pública de Kroki.io)
    const deflated = zlib.deflateSync(code, { level: 9 });
    const base64url = deflated.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    // 3. Resultado listo para Markdown embed
    const finalUrl = 'https://kroki.io/plantuml/svg/' + base64url;

    console.log('\n✅ Imagen procesada exitosamente.');
    console.log('🔗 URL DE LA IMAGEN SVG PARA ENLAZAR:');
    console.log(finalUrl);
    console.log('\n📝 (Puedes copiar esta URL o inyectarla con sintaxis de imagen markdown: ![Mi diagrama](' + finalUrl + ') )\n');

} catch (err) {
    console.error('❌ Error leyendo o procesando el archivo:', err.message);
    process.exit(1);
}
