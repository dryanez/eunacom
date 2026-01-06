
// Q1 (Bold Letter)
const q1_expl = '**A) 3 meses:** Es demasiado temprano...\n**C) 9 meses, D) 10 meses, E) 12 meses:** Iniciar la alimentación...'

const test_cases = [
    { name: 'Q1 (Bold Letter)', text: q1_expl, keys: ['A', 'C', 'D', 'E'] }
]

const getIncorrectExplanation = (text, optionKey) => {
    const lowerKey = optionKey.toLowerCase()

    // Looser Regex:
    // Precursor: Start, Newline, OR Comma/Space (for grouped items)
    // (?:^|[\n,\s])

    const regex = new RegExp(
        `(?:^|[\\n,\\s])[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s\\S]*?(?=(?:\\n)[\\*\\s]*(?:\\*\\*)?[a-e](?:\\*\\*)?[\\)\\:]|$)`,
        'gi'
    )

    const match = text.match(regex)

    if (match && match[0]) {
        // Clean up
        const result = match[0].replace(
            new RegExp(`^(?:[\\n,\\s])?[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s]*`, 'i'),
            ''
        ).trim()

        console.log(`✅ MATCH ${optionKey}: ${result.substring(0, 30)}...`)
        return result
    } else {
        console.log(`❌ NO MATCH ${optionKey}`)
        return null
    }
}

console.log('--- Testing LOOSER Regex ---')
test_cases.forEach(tc => {
    console.log(`\nTesting ${tc.name}:`)
    tc.keys.forEach(k => getIncorrectExplanation(tc.text, k))
})
