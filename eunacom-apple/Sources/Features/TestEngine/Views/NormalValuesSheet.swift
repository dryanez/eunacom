import SwiftUI

/// Laboratory normal reference values sheet for quick in-exam lookup.
public struct NormalValuesSheet: View {
    @Environment(\.dismiss) private var dismiss
    @State private var searchText = ""
    
    private struct LabCategory: Identifiable {
        let id = UUID()
        let title: String
        let items: [(name: String, range: String, unit: String)]
    }
    
    private let categories: [LabCategory] = [
        LabCategory(title: "Hemograma y Coagulación", items: [
            ("Hemoglobina (Hombres)", "13.8 - 17.2", "g/dL"),
            ("Hemoglobina (Mujeres)", "12.1 - 15.1", "g/dL"),
            ("Hematocrito (Hombres)", "40.7 - 50.3", "%"),
            ("Hematocrito (Mujeres)", "36.1 - 44.3", "%"),
            ("Leucocitos", "4.500 - 11.000", "/mm³"),
            ("Plaquetas", "150.000 - 450.000", "/mm³"),
            ("INR", "0.8 - 1.2", "ratio"),
            ("TTPA", "25 - 35", "segundos")
        ]),
        LabCategory(title: "Electrólitos y Función Renal", items: [
            ("Sodio (Na+)", "135 - 145", "mEq/L"),
            ("Potasio (K+)", "3.5 - 5.0", "mEq/L"),
            ("Cloro (Cl-)", "96 - 106", "mEq/L"),
            ("Calcio Total", "8.5 - 10.2", "mg/dL"),
            ("Fósforo", "2.5 - 4.5", "mg/dL"),
            ("Magnesio", "1.7 - 2.2", "mg/dL"),
            ("Creatinina", "0.7 - 1.3", "mg/dL"),
            ("BUN (Nitrógeno Ureico)", "7 - 20", "mg/dL")
        ]),
        LabCategory(title: "Gases Arteriales (FiO2 0.21 a nivel del mar)", items: [
            ("pH", "7.35 - 7.45", ""),
            ("PaO2", "80 - 100", "mmHg"),
            ("PaCO2", "35 - 45", "mmHg"),
            ("HCO3- (Bicarbonato)", "22 - 26", "mEq/L"),
            ("Exceso de Bases (BE)", "-2 a +2", "mEq/L"),
            ("Saturación O2", "95 - 100", "%")
        ]),
        LabCategory(title: "Perfil Hepático y Metabólico", items: [
            ("Bilirrubina Total", "0.3 - 1.2", "mg/dL"),
            ("Bilirrubina Directa", "0.0 - 0.3", "mg/dL"),
            ("GOT / AST", "10 - 40", "U/L"),
            ("GPT / ALT", "7 - 56", "U/L"),
            ("Fosfatasa Alcalina", "44 - 147", "U/L"),
            ("GGT", "9 - 48", "U/L"),
            ("Glicemia en ayunas", "70 - 99", "mg/dL"),
            ("HbA1c", "< 5.7", "%")
        ])
    ]
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            List {
                ForEach(categories) { category in
                    Section(header: Text(category.title).fontWeight(.bold)) {
                        ForEach(category.items, id: \.name) { item in
                            HStack {
                                Text(item.name)
                                    .font(.subheadline)
                                Spacer()
                                Text(item.range)
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundStyle(EUNACOMColor.medicalBlue)
                                if !item.unit.isEmpty {
                                    Text(item.unit)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Valores Normales")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Cerrar") { dismiss() }
                }
            }
        }
    }
}
