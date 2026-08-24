import SwiftUI
import SwiftData

public struct SimulationRunnerView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = SimulationViewModel()
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            if viewModel.isSimulationCompleted {
                SimulationResultsView(viewModel: viewModel, onDismiss: { dismiss() })
            } else if viewModel.isBetweenBlocks {
                BlockBreakView(onContinue: {
                    viewModel.startBlock2()
                })
            } else {
                VStack(spacing: 0) {
                    // Header Bar
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Simulacro Oficial EUNACOM")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.medicalBlue)
                            Text("Bloque \(viewModel.currentBlock): Pregunta \(viewModel.currentIndexInBlock + 1) de \(viewModel.currentQuestionsList.count)")
                                .font(.headline)
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 4) {
                            Image(systemName: "timer")
                            Text(formatTime(viewModel.blockTimeRemainingSeconds))
                                .monospacedDigit()
                        }
                        .font(.caption)
                        .fontWeight(.bold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.secondary.opacity(0.12))
                        .clipShape(Capsule())
                    }
                    .padding(16)
                    .background(.ultraThinMaterial)
                    
                    // Question Area
                    ScrollView {
                        if let q = viewModel.currentQuestion {
                            VStack(alignment: .leading, spacing: 18) {
                                HStack {
                                    Text(q.specialty)
                                        .font(.caption)
                                        .fontWeight(.bold)
                                        .foregroundStyle(EUNACOMColor.specialtyColor(for: q.specialty))
                                    Spacer()
                                    if let code = q.codigoEunacom {
                                        Text(code)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                
                                Text(q.pregunta)
                                    .font(.body)
                                    .lineSpacing(4)
                                
                                VStack(spacing: 10) {
                                    ForEach(q.optionsList, id: \.key) { opt in
                                        let isSelected = viewModel.currentAnswers[q.id]?.lowercased() == opt.key.lowercased()
                                        Button {
                                            viewModel.selectAnswer(opt.key)
                                        } label: {
                                            HStack(alignment: .top, spacing: 12) {
                                                Text(opt.key.uppercased())
                                                    .font(.headline)
                                                    .fontWeight(.heavy)
                                                    .foregroundStyle(isSelected ? .white : .primary)
                                                    .frame(width: 28, height: 28)
                                                    .background {
                                                        Circle().fill(isSelected ? EUNACOMColor.medicalBlue : Color.secondary.opacity(0.2))
                                                    }
                                                
                                                Text(opt.text)
                                                    .font(.callout)
                                                    .foregroundStyle(.primary)
                                                    .frame(maxWidth: .infinity, alignment: .leading)
                                            }
                                            .padding(14)
                                            .background(isSelected ? EUNACOMColor.medicalBlue.opacity(0.18) : Color.secondary.opacity(0.08))
                                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                                    .stroke(isSelected ? EUNACOMColor.medicalBlue : Color.clear, lineWidth: 1.5)
                                            )
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                            }
                            .padding(16)
                        }
                    }
                    
                    // Bottom Navigation
                    HStack(spacing: 16) {
                        Button {
                            if viewModel.currentIndexInBlock > 0 {
                                viewModel.currentIndexInBlock -= 1
                                HapticEngine.shared.selection()
                            }
                        } label: {
                            HStack {
                                Image(systemName: "chevron.left")
                                Text("Anterior")
                            }
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .background(Color.secondary.opacity(0.12))
                            .clipShape(Capsule())
                        }
                        .disabled(viewModel.currentIndexInBlock == 0)
                        
                        Spacer()
                        
                        Button {
                            if viewModel.currentIndexInBlock < viewModel.currentQuestionsList.count - 1 {
                                viewModel.currentIndexInBlock += 1
                                HapticEngine.shared.selection()
                            } else {
                                if viewModel.currentBlock == 1 {
                                    viewModel.completeBlock1()
                                } else {
                                    viewModel.finishFullSimulation()
                                }
                            }
                        } label: {
                            HStack {
                                Text(viewModel.currentIndexInBlock < viewModel.currentQuestionsList.count - 1 ? "Siguiente" : (viewModel.currentBlock == 1 ? "Terminar Bloque 1" : "Finalizar Simulacro"))
                                Image(systemName: "chevron.right")
                            }
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(EUNACOMColor.medicalBlue)
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                        }
                    }
                    .padding(16)
                    .background(.ultraThinMaterial)
                }
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Abandonar") { dismiss() }
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadSimulationQuestions(from: modelContext)
        }
    }
    
    private func formatTime(_ totalSeconds: Int) -> String {
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

private struct BlockBreakView: View {
    let onContinue: () -> Void
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 56))
                .foregroundStyle(EUNACOMColor.warningAmber)
            
            Text("¡Bloque 1 Completado!")
                .font(.system(size: 26, weight: .heavy, design: .rounded))
            
            Text("En el examen real EUNACOM tienes un receso de 30 minutos antes de comenzar el Bloque 2 (90 preguntas adicionales). Tómate un descanso, hidrátate y continúa cuando estés listo.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
            
            Spacer()
            
            Button {
                onContinue()
            } label: {
                Text("Comenzar Bloque 2")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(EUNACOMColor.medicalBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
        .padding(.top, 40)
    }
}

private struct SimulationResultsView: View {
    let viewModel: SimulationViewModel
    let onDismiss: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                ConfettiView().frame(height: 80)
                
                VStack(spacing: 8) {
                    Text("Resultado Simulacro 180")
                        .font(.system(size: 28, weight: .heavy, design: .rounded))
                    Text("Puntaje Final Oficial")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                ZStack {
                    Circle()
                        .fill(viewModel.totalScorePercent >= 51.0 ? EUNACOMColor.successGreen.opacity(0.15) : EUNACOMColor.errorRed.opacity(0.15))
                        .frame(width: 150, height: 150)
                    
                    VStack(spacing: 4) {
                        Text(String(format: "%.1f%%", viewModel.totalScorePercent))
                            .font(.system(size: 44, weight: .heavy, design: .rounded))
                            .foregroundStyle(viewModel.totalScorePercent >= 51.0 ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                        Text(viewModel.totalScorePercent >= 51.0 ? "Aprobado (Corte ≥51%)" : "Reprobado (<51%)")
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundStyle(viewModel.totalScorePercent >= 51.0 ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                    }
                }
                
                Button {
                    HapticEngine.shared.selection()
                    onDismiss()
                } label: {
                    Text("Guardar y Salir")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(EUNACOMColor.primaryTeal)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
            }
            .padding(20)
        }
    }
}
