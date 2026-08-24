import SwiftUI

/// Option card and question presentation view with strike-through elimination and clinical explanation reveal.
public struct QuestionCardView: View {
    let question: QuestionItem
    let mode: ExamTestMode
    let selectedOption: String?
    let isOptionEliminated: (String) -> Bool
    let onSelectOption: (String) -> Void
    let onToggleElimination: (String) -> Void
    let onOpenAITutor: () -> Void
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            // Header Info
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(EUNACOMColor.specialtyColor(for: question.specialty))
                        .frame(width: 8, height: 8)
                    Text(question.specialty)
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(EUNACOMColor.specialtyColor(for: question.specialty))
                }
                
                Spacer()
                
                if let code = question.codigoEunacom {
                    Text(code)
                        .font(.caption2)
                        .fontWeight(.bold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.secondary.opacity(0.12))
                        .clipShape(Capsule())
                }
            }
            
            // Question Clinical Vignette
            Text(question.pregunta)
                .font(.body)
                .lineSpacing(4)
                .foregroundStyle(.primary)
            
            // Options List
            VStack(spacing: 10) {
                ForEach(question.optionsList, id: \.key) { opt in
                    OptionRowView(
                        optionKey: opt.key,
                        optionText: opt.text,
                        isSelected: selectedOption?.lowercased() == opt.key.lowercased(),
                        isCorrect: question.respuestaCorrecta.lowercased() == opt.key.lowercased(),
                        isEliminated: isOptionEliminated(opt.key),
                        showAnswerFeedback: mode == .tutor && selectedOption != nil,
                        onSelect: {
                            onSelectOption(opt.key)
                        },
                        onEliminate: {
                            onToggleElimination(opt.key)
                        }
                    )
                }
            }
            
            // Tutor Mode Immediate Explanation
            if mode == .tutor, selectedOption != nil {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: selectedOption?.lowercased() == question.respuestaCorrecta.lowercased() ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.title3)
                            .foregroundStyle(selectedOption?.lowercased() == question.respuestaCorrecta.lowercased() ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                        Text(selectedOption?.lowercased() == question.respuestaCorrecta.lowercased() ? "¡Respuesta Correcta!" : "Respuesta Incorrecta (Opción \(question.respuestaCorrecta.uppercased()))")
                            .font(.headline)
                            .foregroundStyle(selectedOption?.lowercased() == question.respuestaCorrecta.lowercased() ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                    }
                    
                    Text(question.explicacionCorrecta)
                        .font(.callout)
                        .foregroundStyle(.primary)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    if !question.porQueIncorrectas.isEmpty {
                        Divider()
                        Text("¿Por qué son incorrectas las demás opciones?")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundStyle(.secondary)
                        Text(question.porQueIncorrectas)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    
                    // AI Tutor Trigger Button
                    Button {
                        HapticEngine.shared.selection()
                        onOpenAITutor()
                    } label: {
                        HStack {
                            Image(systemName: "sparkles")
                                .foregroundStyle(EUNACOMColor.purpleAccent)
                            Text("Consultar al Tutor IA Médico")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.purpleAccent)
                        }
                        .padding(.vertical, 8)
                        .frame(maxWidth: .infinity)
                        .background(EUNACOMColor.purpleAccent.opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                    .padding(.top, 4)
                }
                .padding(16)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
            }
        }
    }
}

private struct OptionRowView: View {
    let optionKey: String
    let optionText: String
    let isSelected: Bool
    let isCorrect: Bool
    let isEliminated: Bool
    let showAnswerFeedback: Bool
    let onSelect: () -> Void
    let onEliminate: () -> Void
    
    private var backgroundColor: Color {
        if showAnswerFeedback {
            if isCorrect {
                return EUNACOMColor.successGreen.opacity(0.18)
            } else if isSelected {
                return EUNACOMColor.errorRed.opacity(0.18)
            }
        }
        if isSelected {
            return EUNACOMColor.primaryTeal.opacity(0.18)
        }
        return Color.secondary.opacity(0.08)
    }
    
    private var borderColor: Color {
        if showAnswerFeedback {
            if isCorrect { return EUNACOMColor.successGreen }
            if isSelected { return EUNACOMColor.errorRed }
        }
        if isSelected { return EUNACOMColor.primaryTeal }
        return Color.clear
    }
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Option Key Badge (A, B, C, D, E)
            Text(optionKey.uppercased())
                .font(.headline)
                .fontWeight(.heavy)
                .foregroundStyle(isSelected ? .white : .primary)
                .frame(width: 28, height: 28)
                .background {
                    Circle().fill(isSelected ? (showAnswerFeedback ? (isCorrect ? EUNACOMColor.successGreen : EUNACOMColor.errorRed) : EUNACOMColor.primaryTeal) : Color.secondary.opacity(0.2))
                }
            
            // Option Text
            Text(optionText)
                .font(.callout)
                .strikethrough(isEliminated, color: .secondary)
                .opacity(isEliminated ? 0.4 : 1.0)
                .foregroundStyle(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Strike-through Elimination Button
            Button(action: onEliminate) {
                Image(systemName: isEliminated ? "arrow.uturn.backward" : "nosign")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(6)
                    .background(Color.secondary.opacity(0.1))
                    .clipShape(Circle())
            }
        }
        .padding(14)
        .background(backgroundColor)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(borderColor, lineWidth: 1.5)
        )
        .contentShape(Rectangle())
        .onTapGesture {
            if !isEliminated {
                onSelect()
            }
        }
    }
}
