import Foundation

public struct ClinicalSlide: Identifiable, Sendable {
    public let id: Int
    public let title: String
    public let subtitle: String
    public let keyBullets: [String]
    public let diagnosticPearl: String?
    public let treatmentAlgorithm: String?
    public let eunacomTrap: String? // "Trampa clásica EUNACOM"
    
    public init(
        id: Int,
        title: String,
        subtitle: String,
        keyBullets: [String],
        diagnosticPearl: String? = nil,
        treatmentAlgorithm: String? = nil,
        eunacomTrap: String? = nil
    ) {
        self.id = id
        self.title = title
        self.subtitle = subtitle
        self.keyBullets = keyBullets
        self.diagnosticPearl = diagnosticPearl
        self.treatmentAlgorithm = treatmentAlgorithm
        self.eunacomTrap = eunacomTrap
    }
}

public struct MasterclassTopic: Identifiable, Sendable {
    public let id: String
    public let title: String
    public let specialty: String
    public let eunacomCode: String
    public let durationMinutes: Int
    public let videoUrl: String?
    public let audioUrl: String?
    public let summary: String
    public let slides: [ClinicalSlide]
    
    public init(
        id: String,
        title: String,
        specialty: String,
        eunacomCode: String,
        durationMinutes: Int = 25,
        videoUrl: String? = nil,
        audioUrl: String? = nil,
        summary: String,
        slides: [ClinicalSlide] = []
    ) {
        self.id = id
        self.title = title
        self.specialty = specialty
        self.eunacomCode = eunacomCode
        self.durationMinutes = durationMinutes
        self.videoUrl = videoUrl
        self.audioUrl = audioUrl
        self.summary = summary
        self.slides = slides
    }
}
