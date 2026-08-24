import SwiftUI
import SwiftData

/// Test Creator screen allowing customizable question count, specialty filters, and test modes.
public struct TestCreatorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    
    @State private var selectedMode: ExamTestMode = .tutor
    @State private var questionCount: Double = 20
    @State private var selectedSpecialties: Set<String> = ["Todas"]
    @State private var onlyFailedQuestions: Bool = false
    @State private var activeTestSession: [QuestionItem]? = nil
    
    private let specialties = [
        "Todas",
        "Cardiología",
        "Pediatría",
        "Medicina Interna",
        "Cirugía",
        "Ginecología",
        "Obstetricia",
        "Infectología",
        "Neurología",
        "Respiratorio",
        "Gastroenterología",
        "Dermatología",
        "Nefrología",
        "Reumatología",
        "Endocrinología",
        "Psiquiatría",
        "Traumatología",
        "Salud Pública"
    ]
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            Form {
                // MARK: - Mode Picker
                Section(header: Text("Modo de Estudio")) {
                    Picker("Modo", selection: $selectedMode) {
                        ForEach(ExamTestMode.allCases) { mode in
                            Text(mode.rawValue).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.vertical, 4)
                    
                    Text(selectedMode.description)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                
                // MARK: - Question Count Slider
                Section(header: Text("Cantidad de Preguntas: \(Int(questionCount))")) {
                    Slider(value: $questionCount, in: 5...90, step: 5)
                        .tint(EUNACOMColor.primaryTeal)
                    
                    HStack {
                        Text("5 preguntas")
                        Spacer()
                        Text("90 preguntas (Medio bloque)")
                    }
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                }
                
                // MARK: - Specialty Filter
                Section(header: Text("Especialidades")) {
                    ForEach(specialties, id: \.self) { specialty in
                        HStack {
                            Circle()
                                .fill(specialty == "Todas" ? EUNACOMColor.primaryTeal : EUNACOMColor.specialtyColor(for: specialty))
                                .frame(width: 10, height: 10)
                            Text(specialty)
                            Spacer()
                            if selectedSpecialties.contains(specialty) {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(EUNACOMColor.primaryTeal)
                                    .fontWeight(.bold)
                            }
                        }
                        .contentShape(Rectangle())
                        .onTapGesture {
                            HapticEngine.shared.selection()
                            if specialty == "Todas" {
                                selectedSpecialties = ["Todas"]
                            } else {
                                selectedSpecialties.remove("Todas")
                                if selectedSpecialties.contains(specialty) {
                                    selectedSpecialties.remove(specialty)
                                    if selectedSpecialties.isEmpty { selectedSpecialties = ["Todas"] }
                                } else {
                                    selectedSpecialties.insert(specialty)
                                }
                            }
                        }
                    }
                }
                
                // MARK: - Smart Filters
                Section(header: Text("Filtros Inteligentes")) {
                    Toggle("Solo preguntas erradas previamente", isOn: $onlyFailedQuestions)
                        .tint(EUNACOMColor.primaryTeal)
                }
            }
            .navigationTitle("Nuevo Test")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Comenzar") {
                        startCustomTest()
                    }
                    .fontWeight(.bold)
                    .foregroundStyle(EUNACOMColor.primaryTeal)
                }
            }
            .fullScreenCover(isPresented: Binding(
                get: { activeTestSession != nil },
                set: { if !$0 { activeTestSession = nil } }
            )) {
                if let testQuestions = activeTestSession {
                    TestRunnerView(questions: testQuestions, mode: selectedMode)
                }
            }
        }
    }
    
    private func startCustomTest() {
        HapticEngine.shared.selection()
        do {
            let descriptor = FetchDescriptor<QuestionItem>()
            let all = try modelContext.fetch(descriptor)
            
            var filtered = all
            if !selectedSpecialties.contains("Todas") {
                filtered = all.filter { selectedSpecialties.contains($0.specialty) }
            }
            
            if filtered.isEmpty {
                filtered = all
            }
            
            let count = min(Int(questionCount), filtered.count)
            let selected = Array(filtered.shuffled().prefix(count))
            self.activeTestSession = selected
        } catch {
            print("Error loading test questions: \(error)")
        }
    }
}
