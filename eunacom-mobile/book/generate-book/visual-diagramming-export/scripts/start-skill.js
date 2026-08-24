const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log("==================================================");
console.log("🚀 SMARTbrain Activity - Instalador de Dependencias");
console.log("==================================================\n");

// Un pequeño archivo bandera para que quede constancia de que este setup ya se corrió
const flagFile = path.join(__dirname, '.setup_complete');

// Si el flag existe, Node ya estaba instalado y validado previamente por este script
if (fs.existsSync(flagFile)) {
    console.log("✅ El entorno ya fue configurado anteriormente. ¡Todo listo para diagramar!");
    process.exit(0);
}

try {
    // Comprueba silenciosamente si npm/node está en el sistema
    execSync('npm -v', { stdio: 'ignore' });
    console.log("✅ Node.js detectado nativamente en el sistema. ¡Configuración completada!");
    fs.writeFileSync(flagFile, 'Setup completed and Node.js verified.', 'utf8');
    process.exit(0);
} catch (error) {
    console.error("⚠️ ALERTA DE DEPENDENCIAS: Node.js NO DETECTADO");
    console.error("La colección 'visual-diagramming-export' necesita Node.js para renderizar formatos avanzados localmente ( मार्कmap y PlantUML ).\n");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("¿Quieres que se instale Node.js automáticamente en tu sistema ahora? (S/N): ", (answer) => {
        if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            console.log("\n⏳ Instalando Node.js de forma desatendida...");
            try {
                if (os.platform() === 'win32') {
                    console.log("-> Ejecutando Windows Package Manager (winget)...");
                    execSync('winget install OpenJS.NodeJS -e --silent', { stdio: 'inherit' });
                } else if (os.platform() === 'darwin') {
                    console.log("-> Ejecutando Homebrew...");
                    execSync('brew install node', { stdio: 'inherit' });
                } else {
                    console.log("-> Ejecutando apt-get (Linux)...");
                    execSync('sudo apt-get update && sudo apt-get install -y nodejs npm', { stdio: 'inherit' });
                }

                fs.writeFileSync(flagFile, 'Setup completed and Node.js automatically installed.', 'utf8');
                console.log("\n✅ ¡Node.js instalado correctamente!");
                console.log("⚠️ IMPORTANTE: Necesitas REINICIAR este chat / terminal para que Windows/Mac detecte el nuevo comando 'node'.");
            } catch (installError) {
                console.error("\n❌ Hubo un error al intentar instalar Node.js con el gestor de paquetes.");
                console.error("Por favor, descárgalo e instálalo manualmente desde: https://nodejs.org/");
            }
        } else {
            console.log("\n🛑 Instalación omitida. Recuerda que no podrás compilar Markmaps ni PlantUML hasta que instales Node.js (https://nodejs.org/).");
        }
        rl.close();
        process.exit(1);
    });
}
