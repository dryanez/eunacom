import SwiftUI
import SwiftData

public struct SpecialtyProgressInfo: Identifiable {
    public var id: String { name }
    public let name: String
    public let answeredCount: Int
    public let correctCount: Int
    public let totalAvailable: Int
    public var percentage: Double {
        totalAvailable > 0 ? (Double(correctCount) / Double(totalAvailable)) * 100 : 0
    }
}

@Observable
@MainActor
public final class DashboardViewModel {
    public var totalAnswered: Int = 0
    public var totalCorrect: Int = 0
    public var currentStreak: Int = 3
    public var daysUntilExam: Int = 114
    public var overallMasteryPercent: Double = 68.5
    public var specialtiesProgress: [SpecialtyProgressInfo] = []
    
    public init() {
        calculateDaysUntilExam()
    }
    
    public func calculateDaysUntilExam() {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: Date(), to: AppConfiguration.examDate)
        self.daysUntilExam = max(0, components.day ?? 0)
    }
    
    public func loadMetrics(from modelContext: ModelContext) {
        do {
            let progressDescriptor = FetchDescriptor<UserProgress>()
            let allProgress = try modelContext.fetch(progressDescriptor)
            
            self.totalAnswered = allProgress.count
            self.totalCorrect = allProgress.filter { $0.lastWasCorrect }.count
            
            if totalAnswered > 0 {
                self.overallMasteryPercent = (Double(totalCorrect) / Double(totalAnswered)) * 100.0
            }
            
            // Populate sample specialty breakdown
            self.specialtiesProgress = [
                SpecialtyProgressInfo(name: "Cardiología", answeredCount: 45, correctCount: 38, totalAvailable: 418),
                SpecialtyProgressInfo(name: "Pediatría", answeredCount: 52, correctCount: 41, totalAvailable: 301),
                SpecialtyProgressInfo(name: "Cirugía", answeredCount: 38, correctCount: 30, totalAvailable: 330),
                SpecialtyProgressInfo(name: "Ginecología", answeredCount: 29, correctCount: 22, totalAvailable: 259),
                SpecialtyProgressInfo(name: "Medicina Interna", answeredCount: 110, correctCount: 84, totalAvailable: 1059),
                SpecialtyProgressInfo(name: "Infectología", answeredCount: 35, correctCount: 29, totalAvailable: 389),
                SpecialtyProgressInfo(name: "Neurología", answeredCount: 24, correctCount: 19, totalAvailable: 300)
            ]
        } catch {
            print("Error loading dashboard metrics: \(error)")
        }
    }
}
