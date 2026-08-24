import Foundation
import SwiftData

/// SwiftData Persistent Model representing a high-yield EUNACOM clinical question.
@Model
public final class QuestionItem {
    @Attribute(.unique) public var id: String
    public var numero: Int?
    public var pregunta: String
    public var opcionA: String
    public var opcionB: String
    public var opcionC: String
    public var opcionD: String
    public var opcionE: String
    public var respuestaCorrecta: String // "a", "b", "c", "d", or "e"
    public var explicacionCorrecta: String
    public var porQueIncorrectas: String
    public var videoRecomendado: String?
    public var codigoEunacom: String? // e.g. "1.01.1.001"
    public var specialty: String
    public var tags: String? // Comma-separated tags
    public var isHighYield: Bool
    
    public init(
        id: String = UUID().uuidString,
        numero: Int? = nil,
        pregunta: String,
        opcionA: String,
        opcionB: String,
        opcionC: String,
        opcionD: String,
        opcionE: String,
        respuestaCorrecta: String,
        explicacionCorrecta: String,
        porQueIncorrectas: String = "",
        videoRecomendado: String? = nil,
        codigoEunacom: String? = nil,
        specialty: String,
        tags: String? = nil,
        isHighYield: Bool = true
    ) {
        self.id = id
        self.numero = numero
        self.pregunta = pregunta
        self.opcionA = opcionA
        self.opcionB = opcionB
        self.opcionC = opcionC
        self.opcionD = opcionD
        self.opcionE = opcionE
        self.respuestaCorrecta = respuestaCorrecta.lowercased()
        self.explicacionCorrecta = explicacionCorrecta
        self.porQueIncorrectas = porQueIncorrectas
        self.videoRecomendado = videoRecomendado
        self.codigoEunacom = codigoEunacom
        self.specialty = specialty
        self.tags = tags
        self.isHighYield = isHighYield
    }
    
    /// Helper to retrieve the text for a given option key ("a", "b", "c", "d", "e").
    public func text(for optionKey: String) -> String {
        switch optionKey.lowercased() {
        case "a": return opcionA
        case "b": return opcionB
        case "c": return opcionC
        case "d": return opcionD
        case "e": return opcionE
        default: return ""
        }
    }
    
    /// Array of options formatted as tuple pairs: (key, text).
    public var optionsList: [(key: String, text: String)] {
        [
            ("a", opcionA),
            ("b", opcionB),
            ("c", opcionC),
            ("d", opcionD),
            ("e", opcionE)
        ].filter { !$0.text.isEmpty }
    }
}
