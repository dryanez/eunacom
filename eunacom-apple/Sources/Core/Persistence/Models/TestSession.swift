import Foundation
import SwiftData

/// SwiftData Persistent Model representing a completed or in-progress exam attempt.
@Model
public final class TestSession {
    @Attribute(.unique) public var id: String
    public var userId: String
    public var title: String
    public var mode: String // "tutor", "exam", "simulation", "review"
    public var totalQuestions: Int
    public var currentIndex: Int
    public var timeLeftSeconds: Int
    public var status: String // "in_progress", "completed", "abandoned"
    public var score: Double // 0.0 to 100.0
    public var correctCount: Int
    public var incorrectCount: Int
    public var omittedCount: Int
    public var createdAt: Date
    public var completedAt: Date?
    public var questionIdsData: Data // JSON Encoded array of question IDs
    public var answersData: Data // JSON Encoded Dictionary [questionId: selectedOptionKey]
    
    public init(
        id: String = UUID().uuidString,
        userId: String,
        title: String,
        mode: String = "exam",
        totalQuestions: Int,
        timeLeftSeconds: Int = 0,
        questionIds: [String] = []
    ) {
        self.id = id
        self.userId = userId
        self.title = title
        self.mode = mode
        self.totalQuestions = totalQuestions
        self.currentIndex = 0
        self.timeLeftSeconds = timeLeftSeconds
        self.status = "in_progress"
        self.score = 0.0
        self.correctCount = 0
        self.incorrectCount = 0
        self.omittedCount = 0
        self.createdAt = Date()
        self.completedAt = nil
        self.questionIdsData = (try? JSONEncoder().encode(questionIds)) ?? Data()
        self.answersData = (try? JSONEncoder().encode([String: String]())) ?? Data()
    }
    
    /// Decoded array of Question IDs in this session.
    public var questionIds: [String] {
        get {
            (try? JSONDecoder().decode([String].self, from: questionIdsData)) ?? []
        }
        set {
            questionIdsData = (try? JSONEncoder().encode(newValue)) ?? Data()
        }
    }
    
    /// Decoded map of user answers `[questionId: selectedOption]`.
    public var answers: [String: String] {
        get {
            (try? JSONDecoder().decode([String: String].self, from: answersData)) ?? [:]
        }
        set {
            answersData = (try? JSONEncoder().encode(newValue)) ?? Data()
        }
    }
}
