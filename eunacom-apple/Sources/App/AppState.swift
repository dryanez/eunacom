import SwiftUI

public enum AppTab: String, CaseIterable, Identifiable, Sendable {
    case dashboard = "Inicio"
    case misClases = "Mis Clases"
    case testEngine = "Simulador"
    case medLingo = "MedLingo"
    case biblioteca = "Biblioteca"
    case settings = "Ajustes"
    
    public var id: String { rawValue }
    
    public var iconName: String {
        switch self {
        case .dashboard: return "square.grid.2x2.fill"
        case .misClases: return "play.rectangle.fill"
        case .testEngine: return "pencil.and.list.clipboard"
        case .medLingo: return "flame.fill"
        case .biblioteca: return "books.vertical.fill"
        case .settings: return "gearshape.fill"
        }
    }
}

/// Global observable application state.
@Observable
@MainActor
public final class AppState {
    public static let shared = AppState()
    
    public var selectedTab: AppTab = .dashboard
    public var showPaywall: Bool = false
    public var showOnboarding: Bool = false
    public var showAuthModal: Bool = false
    
    // Quick action triggers
    public var activeTestSessionId: String? = nil
    
    private init() {
        let hasSeenOnboarding = UserDefaults.standard.bool(forKey: "has_seen_onboarding")
        self.showOnboarding = !hasSeenOnboarding
    }
    
    public func completeOnboarding() {
        self.showOnboarding = false
        UserDefaults.standard.set(true, forKey: "has_seen_onboarding")
        HapticEngine.shared.selection()
    }
}
