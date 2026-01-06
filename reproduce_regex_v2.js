
// Q3 (Standardish + Bold)
const q3_expl = 'A) **Soplo diastólico:** Ocurre durante la diástole...\nB) **Soplo sistólico eyectivo:** Este soplo...\nD) **Soplo continuo:** Se ausculta...\nE) **Cianosis...** Esto es...'

// Q1 (Bold Letter)
const q1_expl = '**A) 3 meses:** Es demasiado temprano...\n**C) 9 meses, D) 10 meses, E) 12 meses:** Iniciar la alimentación...'

// Q2 (Bullets + Bold + Colon)
const q2_expl = '*   **B: Tumor cerebral:** Si bien...\n*   **C: Enfermedad de Alzheimer:** La enfermedad...\n*   **D: Hidrocefalia normotensiva (HNT):** La HNT...\n*   **E: Demencia frontotemporal (DFT):** La DFT...'

const test_cases = [
    { name: 'Q3 (Standard)', text: q3_expl, keys: ['A', 'B', 'D', 'E'] },
    { name: 'Q1 (Bold Letter)', text: q1_expl, keys: ['A', 'C', 'D', 'E'] },
    { name: 'Q2 (Bullets/Colon)', text: q2_expl, keys: ['B', 'C', 'D', 'E'] }
]

const getIncorrectExplanation = (text, optionKey) => {
    const lowerKey = optionKey.toLowerCase()

    // THE NEW ROBUST REGEX
    // Matches:
    // (?:^|\n)      -> Start of string or new line
    // [\*\s]*       -> Optional bullets (*) or whitespace
    // (?:\*\*)?     -> Optional bold start
    // ${lowerKey}   -> The letter (a, b, c...)
    // (?:\*\*)?     -> Optional bold end
    // [\)\:]        -> Separator ( ) or : )
    // [\s\S]*?      -> Content (lazy match)
    // (?=(?:^|\n) ... | $) -> Lookahead for next option OR end of string

    const regex = new RegExp(
        `(?:^|\\n)[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s\\S]*?(?=(?:\\n)[\\*\\s]*(?:\\*\\*)?[a-e](?:\\*\\*)?[\\)\\:]|$)`,
        'gi'
    )

    const match = text.match(regex)

    if (match && match[0]) {
        // Clean up the prefix
        const result = match[0].replace(
            new RegExp(`^(?:\\n)?[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s]*`, 'i'),
            ''
        ).trim()

        console.log(`✅ MATCH ${optionKey}: ${result.substring(0, 30)}...`)
        return result
    } else {
        console.log(`❌ NO MATCH ${optionKey}`)
        return null
    }
}

console.log('--- Testing NEW Regex ---')
test_cases.forEach(tc => {
    console.log(`\nTesting ${tc.name}:`)
    tc.keys.forEach(k => getIncorrectExplanation(tc.text, k))
})
