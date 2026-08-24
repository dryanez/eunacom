import Foundation
import SwiftData

/// SwiftData Persistent Model representing user's MedLingo clinical gamification progress.
@Model
public final class MedLingoState {
    @Attribute(.unique) public var userId: String
    public var xp: Int
    public var gems: Int
    public var hearts: Int
    public var maxHearts: Int
    public var lastHeartRefillTime: Date
    public var currentStreak: Int
    public var longestStreak: Int
    public var streakFreezes: Int
    public var currentLeague: String // "bronze", "silver", "gold", "diamond"
    public var completedNodesData: Data // JSON Set of node IDs
    public var claimedChestsData: Data // JSON Set of chest IDs
    public var activeModuleId: String
    
    public init(
        userId: String,
        xp: Int = 0,
        gems: Int = 100,
        hearts: Int = 5,
        maxHearts: Int = 5,
        lastHeartRefillTime: Date = Date(),
        currentStreak: Int = 0,
        longestStreak: Int = 0,
        streakFreezes: Int = 2,
        currentLeague: String = "bronze",
        activeModuleId: String = "cardiologia"
    ) {
        self.userId = userId
        self.xp = xp
        self.gems = gems
        self.hearts = hearts
        self.maxHearts = maxHearts
        self.lastHeartRefillTime = lastHeartRefillTime
        self.currentStreak = currentStreak
        self.longestStreak = longestStreak
        self.streakFreezes = streakFreezes
        self.currentLeague = currentLeague
        self.activeModuleId = activeModuleId
        self.completedNodesData = (try? JSONEncoder().encode([String]())) ?? Data()
        self.claimedChestsData = (try? JSONEncoder().encode([String]())) ?? Data()
    }
    
    public var completedNodes: Set<String> {
        get {
            let list = (try? JSONDecoder().decode([String].self, from: completedNodesData)) ?? []
            return Set(list)
        }
        set {
            completedNodesData = (try? JSONEncoder().encode(Array(newValue))) ?? Data()
        }
    }
    
    public var claimedChests: Set<String> {
        get {
            let list = (try? JSONDecoder().decode([String].self, from: claimedChestsData)) ?? []
            return Set(list)
        }
        set {
            claimedChestsData = (try? JSONEncoder().encode(Array(newValue))) ?? Data()
        }
    }
}
