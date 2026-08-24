import Foundation
import SwiftData

/// Manages the SwiftData ModelContainer configuration and seed data initialization.
@MainActor
public final class PersistenceController {
    public static let shared = PersistenceController()
    
    public let container: ModelContainer
    
    public init(inMemory: Bool = false) {
        let schema = Schema([
            QuestionItem.self,
            UserProgress.self,
            TestSession.self,
            StreakRecord.self,
            MedLingoState.self
        ])
        
        let configuration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: inMemory
        )
        
        do {
            self.container = try ModelContainer(for: schema, configurations: [configuration])
            if !inMemory {
                preloadSeedQuestionsIfNeeded()
            }
        } catch {
            fatalError("Failed to initialize SwiftData ModelContainer: \(error)")
        }
    }
    
    /// Preloads high-yield starter questions across specialties if database is empty.
    private func preloadSeedQuestionsIfNeeded() {
        let context = container.mainContext
        var count = 0
        do {
            let descriptor = FetchDescriptor<QuestionItem>()
            count = try context.fetchCount(descriptor)
        } catch {
            count = 0
        }
        
        guard count == 0 else { return }
        
        // Insert essential foundational questions for Cardiología, Pediatría, Medicina Interna, Cirugía, etc.
        let seedQuestions: [QuestionItem] = [
            QuestionItem(
                id: "cardio-001",
                numero: 1,
                pregunta: "Hombre de 62 años, hipertenso y dislipidémico, consulta por dolor retroesternal opresivo de 45 minutos de evolución irradiado a mandíbula y brazo izquierdo, acompañado de diaforesis. ECG muestra supradesnivel del segmento ST de 2.5 mm en derivaciones V1 a V4. ¿Cuál es la conducta terapéutica inmediata más adecuada?",
                opcionA: "Administrar aspirina 250 mg + clopidogrel 300 mg y coordinar angioplastia primaria de inmediato.",
                opcionB: "Indicar nitroglicerina sublingual y solicitar nueva curva de troponinas en 6 horas.",
                opcionC: "Solicitar ecocardiograma transtorácico de urgencia antes de iniciar cualquier terapia antiagregante.",
                opcionD: "Iniciar anticoagulación oral con rivaroxabán 20 mg y observar en sala básica.",
                opcionE: "Realizar test de esfuerzo para estratificar riesgo cardiovascular.",
                respuestaCorrecta: "a",
                explicacionCorrecta: "El cuadro clínico y electrocardiográfico corresponde a un Síndrome Coronario Agudo con Supradesnivel del ST (SDST) de pared anterior (V1-V4). La indicación urgente es la terapia de reperfusión inmediata (angioplastia primaria como primera elección si el tiempo de traslado es <120 min, o trombolisis inmediata) junto con doble antiagregación plaquetaria con Aspirina y un inhibidor P2Y12 (clopidogrel o ticagrelor).",
                porQueIncorrectas: "B: Esperar enzimas retrasa la reperfusión crítica en infarto con SDST. C: El ecocardiograma no debe retrasar la angioplastia primaria. D: Los anticoagulantes orales directos no son la terapia aguda de reperfusión en SCACEST. E: El test de esfuerzo está contraindicado en SCA agudo.",
                codigoEunacom: "1.01.2.001",
                specialty: "Cardiología",
                tags: "Infarto, SCACEST, Angioplastia, Reperfusión"
            ),
            QuestionItem(
                id: "ped-001",
                numero: 2,
                pregunta: "Lactante de 8 meses presenta tos perruna, estridor inspiratorio en reposo y dificultad respiratoria moderada con retracción intercostal. Al examen físico está afebril y vigil. ¿Cuál es el tratamiento farmacológico de primera elección?",
                opcionA: "Nebulización con Salbutamol 0.5% cada 20 minutos.",
                opcionB: "Dexametasona 0.6 mg/kg vía oral en dosis única + Adrenalina racémica / corriente nebulizada.",
                opcionC: "Amoxicilina 80 mg/kg/día vía oral dividida en 3 dosis.",
                opcionD: "Prednisona oral 2 mg/kg/día por 10 días.",
                opcionE: "Antihistamínicos orales y kinesioterapia respiratoria motora.",
                respuestaCorrecta: "b",
                explicacionCorrecta: "El cuadro clínico corresponde a un Crup laríngeo (Laringotraqueítis aguda) de severidad moderada (estridor en reposo + retracciones). El pilar del tratamiento es el corticoide sistémico (Dexametasona 0.15 a 0.6 mg/kg en dosis única) y adrenalina nebulizada para disminuir rápidamente el edema subglótico.",
                porQueIncorrectas: "A: El salbutamol no actúa a nivel subglótico laríngeo. C: El crup es de etiología viral (Parainfluenza), los antibióticos no están indicados. D: No se requiere curso prolongado de corticoides. E: La kinesioterapia puede aumentar la agitación y empeorar la obstrucción.",
                codigoEunacom: "3.01.1.004",
                specialty: "Pediatría",
                tags: "Crup, Laringotraqueítis, Dexametasona, Estridor"
            ),
            QuestionItem(
                id: "cir-001",
                numero: 3,
                pregunta: "Mujer de 24 años consulta por dolor abdominal que comenzó en epigastrio hace 14 horas y migró a fosa ilíaca derecha. Presenta náuseas, anorexia y febrícula de 37.8°C. Al examen físico destaca signo de Blumberg (+) y signo de McBurney (+). ¿Cuál es el diagnóstico más probable?",
                opcionA: "Apendicitis aguda.",
                opcionB: "Colecistitis aguda.",
                opcionC: "Diverticulitis aguda del colon izquierdo.",
                opcionD: "Gastroenteritis viral aguda.",
                opcionE: "Urolitiasis derecha.",
                respuestaCorrecta: "a",
                explicacionCorrecta: "La cronología de Murphy (dolor periumbilical/epigástrico que migra a FID), asociada a anorexia, náuseas y signos de irritación peritoneal en el punto de McBurney, es clásica de apendicitis aguda.",
                porQueIncorrectas: "B: La colecistitis presenta dolor en hipocondrio derecho con signo de Murphy. C: La diverticulitis típicamente compromete el colon sigmoides en FII. D: La gastroenteritis presenta diarrea abundante y sin dolor focalizado con peritonismo. E: El cólico renal es paroxístico e irradia a genitales sin irritación peritoneal franca.",
                codigoEunacom: "2.01.1.002",
                specialty: "Cirugía",
                tags: "Apendicitis, Abdomen agudo, McBurney, Murphy"
            ),
            QuestionItem(
                id: "med-001",
                numero: 4,
                pregunta: "Paciente de 58 años, diabético tipo 2, con creatinina sérica 1.4 mg/dL y relación albúmina/creatinina en orina de 180 mg/g (microalbuminuria confirmada). Su presión arterial en consulta es 142/88 mmHg. ¿Cuál es el fármaco antihipertensivo de elección?",
                opcionA: "Inhibidor de la ECA (Enalapril) o Antagonista del receptor de Angiotensina II (Losartán).",
                opcionB: "Hidroclorotiazida 25 mg/día.",
                opcionC: "Atenolol 50 mg/día.",
                opcionD: "Amlodipino 10 mg/día como monoterapia.",
                opcionE: "Furosemida 40 mg cada 12 horas.",
                respuestaCorrecta: "a",
                explicacionCorrecta: "En pacientes diabéticos con albuminuria (A2: 30-300 mg/g o A3: >300 mg/g) e hipertensión, los IECA o ARA-II son los fármacos de primera línea debido a su demostrado efecto nefroprotector al reducir la presión intraglomerular y retardar la progresión a enfermedad renal crónica.",
                porQueIncorrectas: "B, C, D: Aunque reducen la presión arterial, no poseen la evidencia nefroprotectora específica de primera línea en nefropatía diabética albuminúrica que tienen los bloqueadores del SRAA. E: La furosemida es un diurético de asa indicado en sobrecarga de volumen o filtraciones glomerulares muy bajas, no como antihipertensivo de primera línea.",
                codigoEunacom: "1.08.1.003",
                specialty: "Medicina Interna",
                tags: "Diabetes, Nefroprotección, IECA, Albuminuria"
            ),
            QuestionItem(
                id: "gin-001",
                numero: 5,
                pregunta: "Primigesta de 34 semanas consulta por cefalea intensa holocraneana y fosfenos. Su presión arterial es 165/110 mmHg. Al examen físico presenta ROT exaltados con clonus agotable. El frotis sanguíneo y pruebas de laboratorio confirman proteinuria de 4 g/24h. ¿Cuál es la medida inmediata para prevención de eclampsia?",
                opcionA: "Sulfato de Magnesio (bolo 4-5 g EV en 20 min seguido de mantención de 1-2 g/h).",
                opcionB: "Diazepam 10 mg EV en bolo lento.",
                opcionC: "Fenitoína sódica 1000 mg en infusión.",
                opcionD: "Labetalol oral 200 mg sin otra medida.",
                opcionE: "Inducción inmediata del parto sin estabilización materna previa.",
                respuestaCorrecta: "a",
                explicacionCorrecta: "El cuadro corresponde a una Preeclampsia Severa con criterios de severidad neurológicos (cefalea, fosfenos, hiperreflexia). El fármaco de elección para la prevención y tratamiento de las convulsiones eclámpticas es el Sulfato de Magnesio (esquema de Zuspan o Pritchard).",
                porQueIncorrectas: "B, C: Las benzodiacepinas y la fenitoína son significativamente inferiores al sulfato de magnesio en preeclampsia/eclampsia según los ensayos clínicos internacionales (Magpie Trial). D: El labetalol o hidralazina deben usarse para la crisis hipertensiva, pero no reemplazan la profilaxis anticonvulsivante con MgSO4. E: Primero debe estabilizarse a la madre.",
                codigoEunacom: "3.02.2.001",
                specialty: "Obstetricia y Ginecología",
                tags: "Preeclampsia, Eclampsia, Sulfato de Magnesio, Crisis Hipertensiva"
            )
        ]
        
        for q in seedQuestions {
            context.insert(q)
        }
        try? context.save()
    }
}
