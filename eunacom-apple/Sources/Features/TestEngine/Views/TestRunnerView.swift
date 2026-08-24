import SwiftUI
import SwiftData

/// Interactive examination runner supporting timed mode, strike-through elimination, question bookmarks, and results summary.
public struct TestRunnerView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var viewModel = TestRunnerViewModel()
    
    public init(questions: [QuestionItem], mode: ExamTestMode = .tutor) {
        let vm = TestRunnerViewModel()
        vm.questions = questions
        vm.mode = mode
        vm.timeRemainingSeconds = questions.count * 70 // 70 seconds per question (EUNACOM standard)
        _viewModel = State(initialValue: vm)
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Top Progress Bar & Timer Header
                VStack(spacing: 8) {
                    HStack {
                        // Question Counter
                        Text("Pregunta \(viewModel.currentIndex + 1) de \(viewModel.questions.count)")
                            .font(.headline)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        // Bookmark button
                        Button {
                            viewModel.toggleBookmarkCurrent()
                        } label: {
                            Image(systemName: viewModel.currentQuestion != nil && viewModel.bookmarkedQuestionIds.contains(viewModel.currentQuestion!.id) ? "bookmark.fill" : "bookmark")
                                .foregroundStyle(EUNACOMColor.warningAmber)
                                .font(.title3)
                        }
                        
                        // Lab Values Button
                        Button {
                            HapticEngine.shared.selection()
                            viewModel.showNormalValues = true
                        } label: {
                            Image(systemName: "cross.vial")
                                .foregroundStyle(EUNACOMColor.medicalBlue)
                                .font(.title3)
                        }
                        
                        // Timer Indicator
                        HStack(spacing: 4) {
                            Image(systemName: "timer")
                            Text(formatTime(viewModel.timeRemainingSeconds))
                                .monospacedDigit()
                        }
                        .font(.caption)
                        .fontWeight(.bold)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.secondary.opacity(0.12))
                        .clipShape(Capsule())
                    }
                    
                    // Linear Progress Bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.secondary.opacity(0.15))
                                .frame(height: 6)
                            Capsule()
                                .fill(EUNACOMColor.primaryTeal)
                                .frame(width: max(0, geo.size.width * (CGFloat(viewModel.currentIndex + 1) / CGFloat(max(1, viewModel.questions.count)))), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(.ultraThinMaterial)
                
                // Question Content Scroll Area
                ScrollView {
                    if let q = viewModel.currentQuestion {
                        QuestionCardView(
                            question: q,
                            mode: viewModel.mode,
                            selectedOption: viewModel.currentQuestionAnswer,
                            isOptionEliminated: { optKey in
                                viewModel.isOptionEliminated(optKey)
                            },
                            onSelectOption: { optKey in
                                viewModel.selectOption(optKey, in: modelContext)
                            },
                            onToggleElimination: { optKey in
                                viewModel.toggleElimination(for: optKey)
                            },
                            onOpenAITutor: {
                                viewModel.showAITutor = true
                            }
                        )
                        .padding(16)
                    }
                }
                
                // Bottom Navigation Action Bar
                HStack(spacing: 16) {
                    Button {
                        viewModel.previousQuestion()
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
                        .foregroundStyle(viewModel.currentIndex > 0 ? .primary : .secondary.opacity(0.4))
                        .clipShape(Capsule())
                    }
                    .disabled(viewModel.currentIndex == 0)
                    
                    Spacer()
                    
                    Button {
                        viewModel.nextQuestion()
                    } label: {
                        HStack {
                            Text(viewModel.currentIndex < viewModel.questions.count - 1 ? "Siguiente" : "Finalizar Test")
                            Image(systemName: viewModel.currentIndex < viewModel.questions.count - 1 ? "chevron.right" : "checkmark.circle.fill")
                        }
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(EUNACOMColor.primaryTeal)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(.ultraThinMaterial)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Salir") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $viewModel.showNormalValues) {
                NormalValuesSheet()
            }
            .sheet(isPresented: $viewModel.showAITutor) {
                if let q = viewModel.currentQuestion {
                    AITutorSheet(questionContext: q)
                }
            }
            .sheet(isPresented: $viewModel.showResultsSummary) {
                TestResultsSummaryView(
                    scorePercent: viewModel.scorePercent,
                    totalQuestions: viewModel.questions.count,
                    correctCount: viewModel.questions.filter { q in
                        viewModel.userAnswers[q.id]?.lowercased() == q.respuestaCorrecta.lowercased()
                    }.count,
                    onDismiss: {
                        dismiss()
                    }
                )
            }
        }
    }
    
    private func formatTime(_ totalSeconds: Int) -> String {
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}

private struct TestResultsSummaryView: View {
    let scorePercent: Double
    let totalQuestions: Int
    let correctCount: Int
    let onDismiss: () -> Void
    
    var body: some View {
        VStack(spacing: 24) {
            ConfettiView()
                .frame(height: 100)
            
            VStack(spacing: 8) {
                Text("¡Test Completado!")
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                Text("Resultado de la sesión")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            
            // Score Badge
            ZStack {
                Circle()
                    .fill(scorePercent >= 51.0 ? EUNACOMColor.successGreen.opacity(0.15) : EUNACOMColor.errorRed.opacity(0.15))
                    .frame(width: 140, height: 140)
                
                VStack(spacing: 2) {
                    Text("\(Int(scorePercent))%")
                        .font(.system(size: 42, weight: .heavy, design: .rounded))
                        .foregroundStyle(scorePercent >= 51.0 ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                    Text(scorePercent >= 51.0 ? "Aprobado (≥51%)" : "Reprobado (<51%)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(scorePercent >= 51.0 ? EUNACOMColor.successGreen : EUNACOMColor.errorRed)
                }
            }
            
            HStack(spacing: 20) {
                VStack {
                    Text("\(correctCount)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(EUNACOMColor.successGreen)
                    Text("Correctas")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(14)
                .frame(maxWidth: .infinity)
                .liquidGlassCard(cornerRadius: 14)
                
                VStack {
                    Text("\(totalQuestions - correctCount)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundStyle(EUNACOMColor.errorRed)
                    Text("Incorrectas")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(14)
                .frame(maxWidth: .infinity)
                .liquidGlassCard(cornerRadius: 14)
            }
            .padding(.horizontal, 24)
            
            Spacer()
            
            Button {
                HapticEngine.shared.selection()
                onDismiss()
            } label: {
                Text("Volver al Inicio")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(EUNACOMColor.primaryTeal)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 20)
        }
        .padding(.top, 24)
    }
}
