import SwiftUI

/// Digital Medical Library displaying official past EUNACOM reconstructions and high-yield PDF study guides.
public struct BibliotecaView: View {
    private struct ExamReconstruction: Identifiable {
        let id: String
        let title: String
        let dateString: String
        let totalQuestions: Int
        let passingRate: String
    }
    
    private struct StudyGuidePDF: Identifiable {
        let id: String
        let title: String
        let specialty: String
        let pagesCount: Int
    }
    
    private let reconstructions: [ExamReconstruction] = [
        ExamReconstruction(id: "rec_2025_jul", title: "Reconstrucción Oficial Julio 2025", dateString: "Julio 2025", totalQuestions: 180, passingRate: "68% Promedio Nacional"),
        ExamReconstruction(id: "rec_2025_ene", title: "Reconstrucción Oficial Enero 2025", dateString: "Enero 2025", totalQuestions: 180, passingRate: "64% Promedio Nacional"),
        ExamReconstruction(id: "rec_2024_jul", title: "Reconstrucción Oficial Julio 2024", dateString: "Julio 2024", totalQuestions: 180, passingRate: "66% Promedio Nacional")
    ]
    
    private let guides: [StudyGuidePDF] = [
        StudyGuidePDF(id: "guide_cardio", title: "Resumen Clínico de Alto Rendimiento: Cardiología", specialty: "Cardiología", pagesCount: 32),
        StudyGuidePDF(id: "guide_ped", title: "Guía de Diagnóstico Rápido: Pediatría & Neonatología", specialty: "Pediatría", pagesCount: 28),
        StudyGuidePDF(id: "guide_obste", title: "Manual Clínico Perfil EUNACOM: Obstetricia & Ginecología", specialty: "Ginecología", pagesCount: 30),
        StudyGuidePDF(id: "guide_cirugia", title: "Atlas Quirúrgico y Patología de Urgencia", specialty: "Cirugía", pagesCount: 26)
    ]
    
    @State private var selectedTabSection = 0 // 0 = Reconstrucciones, 1 = Guías PDF
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Sección", selection: $selectedTabSection) {
                    Text("Reconstrucciones").tag(0)
                    Text("Guías de Estudio").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                
                ScrollView {
                    if selectedTabSection == 0 {
                        LazyVStack(spacing: 14) {
                            ForEach(reconstructions) { rec in
                                VStack(alignment: .leading, spacing: 10) {
                                    HStack {
                                        Text(rec.dateString)
                                            .font(.caption)
                                            .fontWeight(.bold)
                                            .foregroundStyle(EUNACOMColor.medicalBlue)
                                        Spacer()
                                        Text("\(rec.totalQuestions) Preguntas")
                                            .font(.caption2)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 3)
                                            .background(Color.secondary.opacity(0.12))
                                            .clipShape(Capsule())
                                    }
                                    
                                    Text(rec.title)
                                        .font(.headline)
                                    
                                    Text(rec.passingRate)
                                        .font(.footnote)
                                        .foregroundStyle(.secondary)
                                    
                                    Button {
                                        HapticEngine.shared.selection()
                                    } label: {
                                        HStack {
                                            Image(systemName: "play.fill")
                                            Text("Rendir Reconstrucción")
                                        }
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 10)
                                        .background(EUNACOMColor.medicalBlue)
                                        .foregroundStyle(.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                    }
                                    .padding(.top, 4)
                                }
                                .padding(16)
                                .liquidGlassCard(cornerRadius: 18)
                            }
                        }
                        .padding(16)
                    } else {
                        LazyVStack(spacing: 14) {
                            ForEach(guides) { guide in
                                HStack(spacing: 14) {
                                    Image(systemName: "doc.richtext.fill")
                                        .font(.system(size: 36))
                                        .foregroundStyle(EUNACOMColor.primaryTeal)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(guide.specialty)
                                            .font(.caption)
                                            .fontWeight(.bold)
                                            .foregroundStyle(EUNACOMColor.specialtyColor(for: guide.specialty))
                                        Text(guide.title)
                                            .font(.subheadline)
                                            .fontWeight(.bold)
                                        Text("\(guide.pagesCount) páginas • Formato PDF")
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: "arrow.down.circle.fill")
                                        .font(.title2)
                                        .foregroundStyle(EUNACOMColor.primaryTeal)
                                }
                                .padding(16)
                                .liquidGlassCard(cornerRadius: 18)
                            }
                        }
                        .padding(16)
                    }
                }
            }
            .navigationTitle("Biblioteca")
        }
    }
}
