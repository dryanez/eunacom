import SwiftUI

/// Spaced Repetition Study Planner Calendar (Plan Felipe EUNACOM 2026).
public struct CalendarPlannerView: View {
    private struct StudyWeek: Identifiable {
        let id: Int
        let weekTitle: String
        let specialty: String
        let targetQuestions: Int
        let masterclassTopic: String
        let isCurrent: Bool
        let isDone: Bool
    }
    
    private let weeks: [StudyWeek] = [
        StudyWeek(id: 1, weekTitle: "Semana 1", specialty: "Cardiología", targetQuestions: 150, masterclassTopic: "SCACEST, Insuficiencia Cardíaca y Arritmias", isCurrent: true, isDone: false),
        StudyWeek(id: 2, weekTitle: "Semana 2", specialty: "Pediatría", targetQuestions: 120, masterclassTopic: "Crup, Bronquiolitis, Vacunas PNI", isCurrent: false, isDone: false),
        StudyWeek(id: 3, weekTitle: "Semana 3", specialty: "Cirugía", targetQuestions: 130, masterclassTopic: "Abdomen Agudo, Hernias y Trauma", isCurrent: false, isDone: false),
        StudyWeek(id: 4, weekTitle: "Semana 4", specialty: "Obstetricia & Ginecología", targetQuestions: 140, masterclassTopic: "Preeclampsia, Hemorragias del 3er Trimestre", isCurrent: false, isDone: false),
        StudyWeek(id: 5, weekTitle: "Semana 5", specialty: "Medicina Interna", targetQuestions: 200, masterclassTopic: "Diabetes, Nefropatías y Neumonías", isCurrent: false, isDone: false)
    ]
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header card
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundStyle(EUNACOMColor.primaryTeal)
                            Text("Plan de Estudio Personalizado")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.primaryTeal)
                                .textCase(.uppercase)
                        }
                        
                        Text("Ruta Hacia el 100% de Aprobación")
                            .font(.title2)
                            .fontWeight(.heavy)
                        
                        Text("Basado en el algoritmo de repetición espaciada y los ponderadores oficiales de EUNACOM.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .liquidGlassCard(cornerRadius: 20)
                    
                    // Weekly Cards
                    VStack(spacing: 14) {
                        ForEach(weeks) { week in
                            HStack(spacing: 16) {
                                ZStack {
                                    Circle()
                                        .fill(week.isCurrent ? EUNACOMColor.primaryTeal : Color.secondary.opacity(0.15))
                                        .frame(width: 48, height: 48)
                                    Text("\(week.id)")
                                        .font(.headline)
                                        .fontWeight(.heavy)
                                        .foregroundStyle(week.isCurrent ? .white : .primary)
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(week.weekTitle)
                                            .font(.caption)
                                            .fontWeight(.bold)
                                            .foregroundStyle(.secondary)
                                        if week.isCurrent {
                                            Text("EN CURSO")
                                                .font(.caption2)
                                                .fontWeight(.heavy)
                                                .padding(.horizontal, 6)
                                                .padding(.vertical, 2)
                                                .background(EUNACOMColor.primaryTeal.opacity(0.2))
                                                .foregroundStyle(EUNACOMColor.primaryTeal)
                                                .clipShape(Capsule())
                                        }
                                    }
                                    
                                    Text(week.specialty)
                                        .font(.headline)
                                    
                                    Text(week.masterclassTopic)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                        .lineLimit(1)
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("\(week.targetQuestions)")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundStyle(EUNACOMColor.medicalBlue)
                                    Text("preguntas")
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(16)
                            .liquidGlassCard(cornerRadius: 18)
                        }
                    }
                }
                .padding(16)
            }
            .navigationTitle("Calendario")
        }
    }
}
