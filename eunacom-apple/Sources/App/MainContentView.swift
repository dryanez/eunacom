import SwiftUI

/// Adaptive top-level view switching between TabView on iPhone and NavigationSplitView on iPad / macOS.
public struct MainContentView: View {
    @State private var appState = AppState.shared
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    
    public init() {}
    
    public var body: some View {
        Group {
            if horizontalSizeClass == .regular {
                // iPad & macOS Three-Column Navigation Split View
                NavigationSplitView {
                    List(AppTab.allCases, selection: $appState.selectedTab) { tab in
                        Label(tab.rawValue, systemImage: tab.iconName)
                            .tag(tab)
                    }
                    .navigationTitle("EUNACOM")
                } detail: {
                    tabContent(for: appState.selectedTab)
                }
            } else {
                // iPhone Native TabView
                TabView(selection: $appState.selectedTab) {
                    DashboardView()
                        .tabItem {
                            Label(AppTab.dashboard.rawValue, systemImage: AppTab.dashboard.iconName)
                        }
                        .tag(AppTab.dashboard)
                    
                    MisClasesView()
                        .tabItem {
                            Label(AppTab.misClases.rawValue, systemImage: AppTab.misClases.iconName)
                        }
                        .tag(AppTab.misClases)
                    
                    MedLingoPathView()
                        .tabItem {
                            Label(AppTab.medLingo.rawValue, systemImage: AppTab.medLingo.iconName)
                        }
                        .tag(AppTab.medLingo)
                    
                    BibliotecaView()
                        .tabItem {
                            Label(AppTab.biblioteca.rawValue, systemImage: AppTab.biblioteca.iconName)
                        }
                        .tag(AppTab.biblioteca)
                    
                    SettingsView()
                        .tabItem {
                            Label(AppTab.settings.rawValue, systemImage: AppTab.settings.iconName)
                        }
                        .tag(AppTab.settings)
                }
                .tint(EUNACOMColor.primaryTeal)
            }
        }
        .fullScreenCover(isPresented: $appState.showOnboarding) {
            OnboardingView()
        }
        .sheet(isPresented: $appState.showPaywall) {
            PaywallView()
        }
    }
    
    @ViewBuilder
    private func tabContent(for tab: AppTab) -> some View {
        switch tab {
        case .dashboard: DashboardView()
        case .misClases: MisClasesView()
        case .testEngine: TestCreatorView()
        case .medLingo: MedLingoPathView()
        case .biblioteca: BibliotecaView()
        case .settings: SettingsView()
        }
    }
}
