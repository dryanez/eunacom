import Foundation

public enum MedLingoNodeType: String, Codable, Sendable {
    case lesson = "lesson"
    case chest = "chest"
    case milestone = "milestone"
    case boss = "boss"
}

public struct MedLingoNode: Identifiable, Sendable {
    public let id: String
    public let title: String
    public let specialty: String
    public let iconName: String
    public let nodeType: MedLingoNodeType
    public let xpReward: Int
    public let gemsReward: Int
    public let requiredStars: Int
    public var isCompleted: Bool
    public var isUnlocked: Bool
    
    public init(
        id: String,
        title: String,
        specialty: String,
        iconName: String,
        nodeType: MedLingoNodeType = .lesson,
        xpReward: Int = 20,
        gemsReward: Int = 15,
        requiredStars: Int = 0,
        isCompleted: Bool = false,
        isUnlocked: Bool = false
    ) {
        self.id = id
        self.title = title
        self.specialty = specialty
        self.iconName = iconName
        self.nodeType = nodeType
        self.xpReward = xpReward
        self.gemsReward = gemsReward
        self.requiredStars = requiredStars
        self.isCompleted = isCompleted
        self.isUnlocked = isUnlocked
    }
}

public struct MedLingoUnit: Identifiable, Sendable {
    public let id: String
    public let unitNumber: Int
    public let title: String
    public let description: String
    public let specialty: String
    public let nodes: [MedLingoNode]
    
    public init(
        id: String,
        unitNumber: Int,
        title: String,
        description: String,
        specialty: String,
        nodes: [MedLingoNode]
    ) {
        self.id = id
        self.unitNumber = unitNumber
        self.title = title
        self.description = description
        self.specialty = specialty
        self.nodes = nodes
    }
}
