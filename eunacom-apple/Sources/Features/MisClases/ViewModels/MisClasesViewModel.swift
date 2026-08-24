import SwiftUI

@Observable
@MainActor
public final class MisClasesViewModel {
    public var selectedSpecialty: String = "Todas"
    public var searchText: String = ""
    public var masterclasses: [MasterclassTopic] = []
    public var activeMasterclass: MasterclassTopic? = nil
    public var isPlayingAudio: Bool = false
    public var audioProgress: Double = 0.0 // 0.0 to 1.0
    
    public let specialtiesList: [String] = [
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
    
    public init() {
        loadCatalog()
    }
    
    public var filteredClasses: [MasterclassTopic] {
        masterclasses.filter { item in
            let matchesSpecialty = (selectedSpecialty == "Todas" || item.specialty == selectedSpecialty)
            let matchesSearch = searchText.isEmpty || item.title.localizedCaseInsensitiveContains(searchText) || item.specialty.localizedCaseInsensitiveContains(searchText) || item.eunacomCode.localizedCaseInsensitiveContains(searchText)
            return matchesSpecialty && matchesSearch
        }
    }
    
    public func loadCatalog() {
        self.masterclasses = [
            MasterclassTopic(
                id: "cardio_01",
                title: "Síndrome Coronario Agudo: SCACEST y SCASEST",
                specialty: "Cardiología",
                eunacomCode: "1.01.2.001",
                durationMinutes: 28,
                audioUrl: "https://media.eunacom.cl/audio/cardio_sca.mp3",
                summary: "Diagnóstico diferencial electrocardiográfico, tiempos de reperfusión (angioplastia vs trombolisis), doble antiagregación y manejo post-evento.",
                slides: [
                    ClinicalSlide(
                        id: 1,
                        title: "1. Definición y Fisiopatología",
                        subtitle: "Ruptura de placa ateroesclerótica y trombosis oclusiva",
                        keyBullets: [
                            "SCACEST: Oclusión trombótica transmural completa (trombo rojo/fibrina).",
                            "SCASEST: Oclusión subtotal o intermitente con necrosis miocárdica (troponinas positivas).",
                            "Angina Inestable: Isquemia miocárdica sin necrosis enzimática detectable."
                        ],
                        diagnosticPearl: "El ECG de 12 derivaciones debe tomarse e interpretarse en < 10 minutos desde el primer contacto médico.",
                        treatmentAlgorithm: "Aspirina 250 mg + Inhibidor P2Y12 (Ticagrelor 180 mg o Clopidogrel 300-600 mg).",
                        eunacomTrap: "No administrar nitroglicerina si hay infarto de ventrículo derecho (V3R-V4R) o uso reciente de inhibidores de PDE-5 (sildenafil)."
                    ),
                    ClinicalSlide(
                        id: 2,
                        title: "2. Criterios Electrocardiográficos SCACEST",
                        subtitle: "Derivaciones clave y equivalentes de ST",
                        keyBullets: [
                            "Supradesnivel ≥ 1 mm en ≥ 2 derivaciones contiguas (≥ 2 mm en V2-V3 en hombres ≥ 40 años).",
                            "Pared Anterior: V1 a V4 (Arteria Descendente Anterior).",
                            "Pared Inferior: II, III y aVF (Arteria Coronaria Derecha o Circunfleja).",
                            "Pared Lateral: I, aVL, V5, V6 (Arteria Circunfleja)."
                        ],
                        diagnosticPearl: "Infradesnivel en V1-V3 con onda R prominente representa un Infarto de Pared Posterior (solicitar V7-V9).",
                        treatmentAlgorithm: "Tiempo puerta-balón < 90 min (o < 120 min si requiere traslado). Trombolisis en < 10 min si traslado > 120 min.",
                        eunacomTrap: "El bloqueo completo de rama izquierda (BCRI) nuevo o presumiblemente nuevo debe tratarse como SCACEST."
                    )
                ]
            ),
            MasterclassTopic(
                id: "ped_01",
                title: "Obstrucción de Vía Aérea Superior: Crup y Epiglotitis",
                specialty: "Pediatría",
                eunacomCode: "3.01.1.004",
                durationMinutes: 24,
                audioUrl: "https://media.eunacom.cl/audio/ped_crup.mp3",
                summary: "Diferenciación clínica entre Laringotraqueítis aguda, Epiglotitis y Cuerpo extraño. Dosificación de dexametasona y adrenalina.",
                slides: [
                    ClinicalSlide(
                        id: 1,
                        title: "1. Crup Laríngeo (Laringotraqueítis)",
                        subtitle: "Etiología por virus Parainfluenza en niños de 6 meses a 3 años",
                        keyBullets: [
                            "Tríada clínica: Tos perruna/metálica, disfonía y estridor inspiratorio.",
                            "Comienzo insidioso precedido de coriza y febrícula.",
                            "Rx de cuello (Signo de la punta de lápiz o aguja) solo en caso de duda diagnóstica."
                        ],
                        diagnosticPearl: "La gravedad se clasifica según la escala de Taussig o Westley: estridor en reposo define cuadro moderado/severo.",
                        treatmentAlgorithm: "Dexametasona 0.15 - 0.6 mg/kg VO/IM (dosis única) + Adrenalina corriente nebulizada si hay estridor en reposo.",
                        eunacomTrap: "No utilizar corticoides inhalados de rutina ni antihistamínicos o sedantes."
                    )
                ]
            ),
            MasterclassTopic(
                id: "cir_01",
                title: "Abdomen Agudo Quirúrgico: Apendicitis y Peritonitis",
                specialty: "Cirugía",
                eunacomCode: "2.01.1.002",
                durationMinutes: 26,
                audioUrl: "https://media.eunacom.cl/audio/cir_apendicitis.mp3",
                summary: "Cronología de Murphy, signos peritoneales cardinales, score de Alvarado e indicación quirúrgica.",
                slides: []
            ),
            MasterclassTopic(
                id: "gin_01",
                title: "Estados Hipertensivos del Embarazo: Preeclampsia Severa",
                specialty: "Obstetricia",
                eunacomCode: "3.02.2.001",
                durationMinutes: 30,
                audioUrl: "https://media.eunacom.cl/audio/obste_preeclampsia.mp3",
                summary: "Protocolo de Sulfato de Magnesio (Zuspan), crisis hipertensiva con labetalol y criterios de interrupción.",
                slides: []
            ),
            MasterclassTopic(
                id: "med_01",
                title: "Cetoacidosis Diabética y Síndrome Hiperosmolar",
                specialty: "Medicina Interna",
                eunacomCode: "1.04.2.001",
                durationMinutes: 32,
                audioUrl: "https://media.eunacom.cl/audio/med_cetoacidosis.mp3",
                summary: "Criterios diagnósticos, reposición volumétrica vigorosa, protocolo de infusión de insulina y manejo del potasio.",
                slides: []
            )
        ]
    }
}
