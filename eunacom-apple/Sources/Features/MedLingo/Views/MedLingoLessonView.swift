import SwiftUI

/// Micro-lesson view for MedLingo clinical vignettes with immediate feedback and heart deduction.
public struct MedLingoLessonView: View {
    let node: MedLingoNode
    let onFinish: (Int, Int) -> Void // (earnedXP, earnedGems)
    let onDeductHeart: () -> Void
    
    @Environment(\.dismiss) private var dismiss
    @State private var currentStep: Int = 0
    @State private var selectedAnswer: Int? = nil
    @State private var hasChecked: Bool = false
    @State private var isCorrect: Bool = false
    
    private struct MicroQuestion {
        let vignette: String
        let options: [String]
        let correctIndex: Int
        let explanation: String
    }
    
    private let questions: [MicroQuestion] = [
        MicroQuestion(
            vignette: "Paciente de 55 años con dolor torácico opresivo de 30 min y supradesnivel del ST en V1-V4. ¿Cuál es el tratamiento antiplaquetario inicial de elección?",
            options: [
                "Aspirina 250 mg + Inhibidor P2Y12 (Ticagrelor o Clopidogrel)",
                "Monoterapia con Heparina no fraccionada",
                "Acenocumarol oral en bolo",
                "Ácido acetilsalicílico 100 mg cada 24h sin carga"
            ],
            correctIndex: 0,
            explanation: "En SCACEST la doble antiagregación con carga inicial de Aspirina y un inhibidor P2Y12 es mandatoria antes de la reperfusión urgente."
        ),
        MicroQuestion(
            vignette: "¿Cuál es el tiempo máximo recomendado puerta-balón para angioplastia primaria en un centro con hemodinamia disponible?",
            options: [
                "Menos de 90 minutos",
                "Menos de 180 minutos",
                "Menos de 24 horas",
                "Menos de 6 horas"
            ],
            correctIndex: 0,
            explanation: "El estándar internacional de tiempo puerta-balón en centros con hemodinamia es < 90 minutos desde el ingreso del paciente."
        )
    ]
    
    public init(node: MedLingoNode, onFinish: @escaping (Int, Int) -> Void, onDeductHeart: @escaping () -> Void) {
        self.node = node
        self.onFinish = onFinish
        self.onDeductHeart = onDeductHeart
    }
    
    public var body: some View {
        ZStack {
            VStack(spacing: 20) {
                // Top Exit & Progress Bar
                HStack(spacing: 16) {
                    Button {
                        HapticEngine.shared.selection()
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                    
                    ProgressView(value: Double(currentStep + 1), total: Double(questions.count))
                        .tint(EUNACOMColor.primaryTeal)
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
                
                let q = questions[currentStep]
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        Text(q.vignette)
                            .font(.title3)
                            .fontWeight(.bold)
                            .lineSpacing(4)
                        
                        VStack(spacing: 12) {
                            ForEach(Array(q.options.enumerated()), id: \.offset) { index, option in
                                let isSelected = selectedAnswer == index
                                Button {
                                    if !hasChecked {
                                        HapticEngine.shared.selection()
                                        selectedAnswer = index
                                    }
                                } label: {
                                    HStack {
                                        Text(option)
                                            .font(.body)
                                            .multilineTextAlignment(.leading)
                                        Spacer()
                                        if hasChecked && index == q.correctIndex {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundStyle(EUNACOMColor.successGreen)
                                        } else if hasChecked && isSelected && !isCorrect {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundStyle(EUNACOMColor.errorRed)
                                        }
                                    }
                                    .padding(16)
                                    .background(isSelected ? EUNACOMColor.primaryTeal.opacity(0.15) : Color.secondary.opacity(0.08))
                                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .stroke(isSelected ? EUNACOMColor.primaryTeal : Color.clear, lineWidth: 2)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(20)
                }
                
                // Bottom Validation Bar
                VStack(spacing: 12) {
                    if hasChecked {
                        HStack {
                            Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .font(.title2)
                                .foregroundStyle(isCorrect ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(isCorrect ? "¡Excelente!" : "¡Incorrecto!")
                                    .font(.headline)
                                    .foregroundStyle(isCorrect ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                                Text(q.explanation)
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, 16)
                    }
                    
                    Button {
                        if !hasChecked {
                            guard let ans = selectedAnswer else { return }
                            hasChecked = true
                            isCorrect = (ans == q.correctIndex)
                            if isCorrect {
                                HapticEngine.shared.success()
                            } else {
                                onDeductHeart()
                                HapticEngine.shared.error()
                            }
                        } else {
                            if currentStep < questions.count - 1 {
                                currentStep += 1
                                selectedAnswer = nil
                                hasChecked = false
                                isCorrect = false
                            } else {
                                onFinish(node.xpReward, node.gemsReward)
                                dismiss()
                            }
                        }
                    } label: {
                        Text(!hasChecked ? "Comprobar" : "Continuar")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(selectedAnswer != nil ? (hasChecked ? (isCorrect ? EUNACOMColor.successGreen : EUNACOMColor.errorRed) : EUNACOMColor.primaryTeal) : Color.secondary.opacity(0.2))
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .disabled(selectedAnswer == nil)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
                }
                .background(.ultraThinMaterial)
            }
        }
    }
}
