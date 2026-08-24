import SwiftUI
import StoreKit

/// StoreKit 2 manager for product loading, purchases, entitlement verification, and Transaction.updates monitoring.
@Observable
@MainActor
public final class StoreKitManager {
    public static let shared = StoreKitManager()
    
    public var products: [Product] = []
    public var subscriptionStatus: SubscriptionStatus = .notSubscribed
    public var isPurchasing: Bool = false
    public var purchaseErrorMessage: String?
    
    private var updatesTask: Task<Void, Never>?
    
    private init() {
        self.updatesTask = listenForTransactions()
        Task {
            await loadProducts()
            await updatePurchasedStatus()
        }
    }
    
    deinit {
        updatesTask?.cancel()
    }
    
    /// Loads products from the App Store.
    public func loadProducts() async {
        do {
            let loadedProducts = try await Product.products(for: EUNACOMProducts.allSubscriptionIDs)
            self.products = loadedProducts.sorted { $0.price < $1.price }
        } catch {
            // If offline or local testing without config, products will be empty and default plans will show in PaywallView
            self.purchaseErrorMessage = "No se pudieron cargar los productos: \(error.localizedDescription)"
        }
    }
    
    /// Initiates the purchase flow for a product.
    public func purchase(_ product: Product) async -> Bool {
        isPurchasing = true
        defer { isPurchasing = false }
        
        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    await transaction.finish()
                    await updatePurchasedStatus()
                    HapticEngine.shared.celebration()
                    return true
                case .unverified(_, let error):
                    self.purchaseErrorMessage = "Transacción no verificada: \(error.localizedDescription)"
                    HapticEngine.shared.error()
                    return false
                }
            case .userCancelled:
                return false
            case .pending:
                return false
            @unknown default:
                return false
            }
        } catch {
            self.purchaseErrorMessage = error.localizedDescription
            HapticEngine.shared.error()
            return false
        }
    }
    
    /// Restores previously completed purchases and active subscriptions.
    public func restorePurchases() async {
        isPurchasing = true
        defer { isPurchasing = false }
        
        try? await AppStore.sync()
        await updatePurchasedStatus()
        HapticEngine.shared.success()
    }
    
    /// Checks current entitlements using StoreKit 2 Transaction.currentEntitlements.
    public func updatePurchasedStatus() async {
        var highestStatus: SubscriptionStatus = .notSubscribed
        
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            
            if transaction.revocationDate == nil {
                if transaction.productID == EUNACOMProducts.lifetimeFounder {
                    highestStatus = .lifetimeFounder
                    break
                } else {
                    highestStatus = .subscribed(
                        tier: transaction.productID,
                        expiresDate: transaction.expirationDate
                    )
                }
            }
        }
        
        self.subscriptionStatus = highestStatus
        if highestStatus.isEntitled {
            AuthManager.shared.setPremiumTier("premium")
        }
    }
    
    /// Background listener for external purchases, renewals, or family sharing updates.
    private func listenForTransactions() -> Task<Void, Never> {
        Task.detached {
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await transaction.finish()
                    await self.updatePurchasedStatus()
                }
            }
        }
    }
}
