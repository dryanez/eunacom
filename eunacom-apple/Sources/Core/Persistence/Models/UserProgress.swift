import Foundation
import SwiftData

/// SwiftData Persistent Model tracking the student's mastery of specific questions.
@Model
public final class UserProgress {
    @Attribute(.unique) public var id: String // e.g. "\(userId)_\(questionId)"
    public var userId: String
    public var questionId: String
    public var timesAttempted: Int
    public var timesCorrect: Int
    public var lastAttemptDate: Date
    public var lastWasCorrect: Bool
    public var isBookmarked: Bool
    public var isOmitted: Bool
    public var personalNotes: String?
    public var needsReview: Bool
    public var masteryScore: Double // 0.0 to 1.0 (spaced repetition algorithm)
    
    public init(
        userId: String,
        questionId: String,
        isCorrect: Bool,
        isOmitted: Bool = false,
        isBookmarked: Bool = false,
        personalNotes: String? = nil
    ) {
        self.id = "\(userId)_\(questionId)"
        self.userId = userId
        self.questionId = questionId
        self.timesAttempted = 1
        self.timesCorrect = isCorrect ? 1 : 0
        self.lastAttemptDate = Date()
        self.lastWasCorrect = isCorrect
        self.isBookmarked = isBookmarked
        self.isOmitted = isOmitted
        self.personalNotes = personalNotes
        self.needsReview = !isCorrect
        self.masteryScore = isCorrect ? 0.6 : 0.1
    }
    
    /// Update progress after an answer attempt.
    public func recordAttempt(isCorrect: Bool, isOmitted: Bool = false) {
        self.timesAttempted += 1
        if isCorrect {
            self.timesCorrect += 1
            self.masteryScore = min(1.0, self.masteryScore + 0.25)
            self.needsReview = false
        } else {
            self.masteryScore = max(0.0, self.masteryScore - 0.35)
            self.needsReview = true
        }
        self.lastWasCorrect = isCorrect
        self.isOmitted = isOmitted
        self.lastAttemptDate = Date()
    }
}
