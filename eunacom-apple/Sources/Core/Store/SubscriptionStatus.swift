import Foundation

public enum SubscriptionStatus: Equatable, Sendable {
    case unknown
    case notSubscribed
    case subscribed(tier: String, expiresDate: Date?)
    case lifetimeFounder
    case expired
    
    public var isEntitled: Bool {
        switch self {
        case .subscribed, .lifetimeFounder:
            return true
        case .unknown, .notSubscribed, .expired:
            return false
        }
    }
}
