
// DIU Question
const diu_expl = '**A) Retirar el DIU inmediatamente:** Esta opción es incorrecta...\n\n**C) Iniciar antibióticos...** Si bien...\n\n**D) Solicitar TAC...** El diagnóstico...\n\n**E) Resolver quirúrgicamente:** El manejo...'

const test_cases = [
    { name: 'DIU Question', text: diu_expl, keys: ['A', 'C', 'D', 'E'] }
]

const getIncorrectExplanation = (text, optionKey) => {
    const lowerKey = optionKey.toLowerCase()

    // The "Ultimate" Regex currently in the file
    const regex = new RegExp(
        `(?:^|[\\n,\\s])[\\*\\s]*(?:\\*\\*)?${lowerKey}(?:\\*\\*)?[\\)\\:][\\s\\S]*?(?=(?:\\n)[\\*\\s]*(?:\\*\\*)?[a-e](?:\\*\\*)?[\\)\\:]|$)`,
        'gi'
    )

    const match = text.match(regex)

    if (match && match[0]) {
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

console.log('--- Testing ULTIMATE Regex on DIU ---')
test_cases.forEach(tc => {
    console.log(`\nTesting ${tc.name}:`)
    tc.keys.forEach(k => getIncorrectExplanation(tc.text, k))
})
