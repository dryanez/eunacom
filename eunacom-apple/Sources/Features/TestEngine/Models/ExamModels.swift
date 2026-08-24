import Foundation

public enum ExamTestMode: String, CaseIterable, Identifiable, Sendable {
    case tutor = "Modo Tutor"
    case exam = "Modo Examen"
    case simulation = "Simulacro 180"
    
    public var id: String { rawValue }
    
    public var description: String {
        switch self {
        case .tutor: return "Feedback inmediato y explicación detallada tras cada respuesta."
        case .exam: return "Condiciones reales con temporizador y puntaje al finalizar."
        case .simulation: return "180 preguntas en 2 bloques oficiales cronometrados de 90 preguntas."
        }
    }
}
