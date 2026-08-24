import SwiftUI
import SwiftData
import TipKit

/// Main entry point for the native EUNACOM Apple multiplatform application.
@main
struct EUNACOMApp: App {
    let persistenceController = PersistenceController.shared
    @State private var storeKitManager = StoreKitManager.shared
    @State private var authManager = AuthManager.shared
    
    init() {
        // Initialize TipKit rules
        try? Tips.configure([
            .displayFrequency(.immediate),
            .datastoreLocation(.applicationDefault)
        ])
    }
    
    var body: some Scene {
        WindowGroup {
            MainContentView()
                .modelContainer(persistenceController.container)
                .task {
                    await storeKitManager.updatePurchasedStatus()
                }
        }
    }
}
