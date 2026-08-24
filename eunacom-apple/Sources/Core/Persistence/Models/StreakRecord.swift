import Foundation
import SwiftData

/// SwiftData Persistent Model for user streak tracking and daily activity logs.
@Model
public final class StreakRecord {
    @Attribute(.unique) public var id: String // "\(userId)_\(dateString)"
    public var userId: String
    public var activityDate: Date
    public var normalizedDay: String // "yyyy-MM-dd" in user's local timezone
    public var activityType: String // "quiz", "lesson", "simulation", "flashcard"
    public var questionsAnswered: Int
    public var minutesStudied: Int
    public var wasFreezeUsed: Bool
    
    public init(
        userId: String,
        activityDate: Date = Date(),
        activityType: String = "quiz",
        questionsAnswered: Int = 1,
        minutesStudied: Int = 5,
        wasFreezeUsed: Bool = false
    ) {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.timeZone = calendar.timeZone
        let dayString = formatter.string(from: activityDate)
        
        self.id = "\(userId)_\(dayString)"
        self.userId = userId
        self.activityDate = activityDate
        self.normalizedDay = dayString
        self.activityType = activityType
        self.questionsAnswered = questionsAnswered
        self.minutesStudied = minutesStudied
        self.wasFreezeUsed = wasFreezeUsed
    }
}
