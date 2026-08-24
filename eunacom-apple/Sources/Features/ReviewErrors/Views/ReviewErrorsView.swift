import SwiftUI
import SwiftData

/// Dedicated error review & spaced repetition screen for mastering past failed questions.
public struct ReviewErrorsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = ReviewErrorsViewModel()
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Header overview card
                HStack(spacing: 16) {
                    ZStack {
                        Circle()
                            .fill(EUNACOMColor.errorRed.opacity(0.18))
                            .frame(width: 56, height: 56)
                        Image(systemName: "arrow.triangle.2.circlepath.circle.fill")
                            .font(.title)
                            .foregroundStyle(EUNACOMColor.errorRed)
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(viewModel.failedQuestions.count) Preguntas por Repasar")
                            .font(.headline)
                        Text("El algoritmo de repetición espaciada prioriza tus conceptos más débiles.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                .padding(16)
                .liquidGlassCard(cornerRadius: 18)
                .padding(.horizontal, 16)
                
                // List of failed questions
                List {
                    ForEach(viewModel.failedQuestions) { q in
                        VStack(alignment: .leading, spacing: 8) {
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
                                .font(.subheadline)
                                .lineLimit(3)
                            
                            HStack {
                                Text("Respuesta: Opción \(q.respuestaCorrecta.uppercased())")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundStyle(EUNACOMColor.successGreen)
                                Spacer()
                                Text("Repasar")
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .foregroundStyle(EUNACOMColor.primaryTeal)
                            }
                            .padding(.top, 4)
                        }
                        .padding(.vertical, 4)
                    }
                }
                .listStyle(.plain)
                
                // Start Review Session Button
                Button {
                    HapticEngine.shared.selection()
                    viewModel.activeReviewSession = viewModel.failedQuestions
                } label: {
                    HStack {
                        Image(systemName: "play.fill")
                        Text("Iniciar Sesión de Repaso")
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(EUNACOMColor.errorRed)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
                .disabled(viewModel.failedQuestions.isEmpty)
            }
            .navigationTitle("Repaso de Errores")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
            }
            .onAppear {
                viewModel.loadFailedQuestions(from: modelContext)
            }
            .fullScreenCover(isPresented: Binding(
                get: { viewModel.activeReviewSession != nil },
                set: { if !$0 { viewModel.activeReviewSession = nil } }
            )) {
                if let questions = viewModel.activeReviewSession {
                    TestRunnerView(questions: questions, mode: .tutor)
                }
            }
        }
    }
}
