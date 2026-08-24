import SwiftUI
import StoreKit

/// Full-screen StoreKit 2 subscription paywall following Apple's high-conversion guidelines.
public struct PaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var storeManager = StoreKitManager.shared
    @State private var selectedPlanId: String = EUNACOMProducts.semestral
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header Banner
                    VStack(spacing: 10) {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [EUNACOMColor.goldFounder, Color(red: 1.0, green: 0.6, blue: 0.0)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                        
                        Text("Pasa el EUNACOM 2026")
                            .font(.system(size: 28, weight: .heavy, design: .rounded))
                            .multilineTextAlignment(.center)
                        
                        Text("Acceso completo a la plataforma #1 de preparación médica en Chile.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 16)
                    }
                    .padding(.top, 16)
                    
                    // Subscription Tiers List
                    VStack(spacing: 12) {
                        ForEach(EUNACOMProducts.defaultPlans) { plan in
                            let isSelected = selectedPlanId == plan.id
                            Button {
                                HapticEngine.shared.selection()
                                selectedPlanId = plan.id
                            } label: {
                                HStack(alignment: .center, spacing: 14) {
                                    Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                                        .font(.title2)
                                        .foregroundStyle(isSelected ? EUNACOMColor.primaryTeal : .secondary)
                                    
                                    VStack(alignment: .leading, spacing: 3) {
                                        HStack {
                                            Text(plan.title)
                                                .font(.headline)
                                                .fontWeight(.bold)
                                            if let badge = plan.savingsBadge {
                                                Text(badge)
                                                    .font(.caption2)
                                                    .fontWeight(.heavy)
                                                    .padding(.horizontal, 6)
                                                    .padding(.vertical, 2)
                                                    .background(EUNACOMColor.primaryTeal.opacity(0.18))
                                                    .foregroundStyle(EUNACOMColor.primaryTeal)
                                                    .clipShape(Capsule())
                                            }
                                        }
                                        Text(plan.subtitle)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    
                                    Spacer()
                                    
                                    VStack(alignment: .trailing, spacing: 1) {
                                        Text(plan.priceString)
                                            .font(.subheadline)
                                            .fontWeight(.heavy)
                                            .foregroundStyle(.primary)
                                        Text(plan.period)
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                .padding(16)
                                .background(isSelected ? EUNACOMColor.primaryTeal.opacity(0.1) : Color.secondary.opacity(0.06))
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                                        .stroke(isSelected ? EUNACOMColor.primaryTeal : Color.clear, lineWidth: 2)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 16)
                    
                    // Value Propositions Checklist
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Todo lo que incluye tu plan:")
                            .font(.headline)
                            .padding(.bottom, 4)
                        
                        FeatureRow(text: "+6.000 Preguntas con retroalimentación instantánea")
                        FeatureRow(text: "24 Masterclasses completas en Video y Audio")
                        FeatureRow(text: "Simulacros oficiales cronometrados de 180 preguntas")
                        FeatureRow(text: "Tutor IA Médico 24/7 para dudas clínicas complejas")
                        FeatureRow(text: "Modo Offline: Estudia sin internet en cualquier lugar")
                        FeatureRow(text: "MedLingo: Gamificación diaria y ligas competitivas")
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .liquidGlassCard(cornerRadius: 20)
                    .padding(.horizontal, 16)
                    
                    // Purchase Action Button
                    VStack(spacing: 12) {
                        Button {
                            handlePurchase()
                        } label: {
                            HStack {
                                if storeManager.isPurchasing {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Suscribirme Ahora")
                                        .font(.headline)
                                        .fontWeight(.heavy)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(EUNACOMColor.primaryTeal)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        }
                        .disabled(storeManager.isPurchasing)
                        
                        // Restore Purchases & Legal Links
                        HStack(spacing: 16) {
                            Button("Restaurar Compras") {
                                Task {
                                    await storeManager.restorePurchases()
                                }
                            }
                            Text("•")
                            Link("Términos", destination: URL(string: AppConfiguration.termsURL)!)
                            Text("•")
                            Link("Privacidad", destination: URL(string: AppConfiguration.privacyPolicyURL)!)
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }
    
    private func handlePurchase() {
        HapticEngine.shared.selection()
        if let realProduct = storeManager.products.first(where: { $0.id == selectedPlanId }) {
            Task {
                let success = await storeManager.purchase(realProduct)
                if success {
                    dismiss()
                }
            }
        } else {
            // Local fallback for demo
            AuthManager.shared.setPremiumTier("premium")
            HapticEngine.shared.celebration()
            dismiss()
        }
    }
}

private struct FeatureRow: View {
    let text: String
    
    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(EUNACOMColor.primaryTeal)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.primary)
        }
    }
}
