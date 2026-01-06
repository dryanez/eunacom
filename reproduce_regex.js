
const incorrect_explanations = 'A) **Soplo diastólico:** Ocurre durante la diástole (relajación ventricular) y se asocia a insuficiencia de las válvulas semilunares (aórtica o pulmonar) o estenosis de las válvulas auriculoventriculares (mitral o tricuspídea). No corresponde al shunt sistólico de la CIV.\nB) **Soplo sistólico eyectivo:** Este soplo tiene una morfología en "diamante" (crescendo-decrescendo). Se produce por el paso de sangre a través de un tracto de salida estrechado, como en la estenosis aórtica o pulmonar. El soplo de la CIV no es eyectivo porque el flujo a través del defecto no depende de la eyección hacia la aorta o la pulmonar, sino del gradiente de presión interventricular que dura toda la sístole.\nD) **Soplo continuo:** Se ausculta tanto en sístole como en diástole sin interrupción, classicamente en "maquinaria". Es el soplo típico del Ductus Arterioso Persistente (DAP), donde existe un gradiente de presión constante entre la aorta y la arteria pulmonar.\nE) **Cianosis que no responde a oxígeno al 100%:** Esto es característico de las cardiopatías congénitas cianóticas con un shunt de derecha a izquierda (la sangre venosa pasa a la circulación sistémica sin oxigenarse). Una CIV no complicada es una cardiopatía acianótica con un shunt de izquierda a derecha. La cianosis solo aparecería en una CIV muy grande con hipertensión pulmonar severa que invierte el shunt (Síndrome de Eisenmenger), lo cual es una complicación tardía y no la manifestación semiológica habitual.';

const getIncorrectExplanation = (optionKey) => {
    const lowerKey = optionKey.toLowerCase()

    // The previous failed logic from the file (Format 2 robust)
    const regex = new RegExp(`(?:^|\\n)\\s*${lowerKey}\\)[\\s\\S]*?(?=(?:\\n|^)\\s*[a-e]\\)|$)`, 'gi')
    const match = incorrect_explanations.match(regex)

    if (match && match[0]) {
        console.log(`✅ MATCH FOUND for ${optionKey}:`)
        const result = match[0].replace(new RegExp(`(?:^|\\n)\\s*${lowerKey}\\)[\\s]*`, 'i'), '').trim()
        console.log(result.substring(0, 50) + '...')
        return result
    } else {
        console.log(`❌ NO MATCH for ${optionKey}`)
        return null
    }
}

console.log('--- Testing Regex ---')
getIncorrectExplanation('A')
getIncorrectExplanation('B')
getIncorrectExplanation('D')
getIncorrectExplanation('E')
