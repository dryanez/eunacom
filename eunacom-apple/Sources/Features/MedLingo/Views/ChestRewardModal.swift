import SwiftUI

/// Reward modal presented when claiming milestone chests.
public struct ChestRewardModal: View {
    let node: MedLingoNode
    let onClaim: () -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var isOpened: Bool = false
    
    public init(node: MedLingoNode, onClaim: @escaping () -> Void) {
        self.node = node
        self.onClaim = onClaim
    }
    
    public var body: some View {
        ZStack {
            VStack(spacing: 24) {
                if isOpened {
                    ConfettiView().frame(height: 120)
                }
                
                Image(systemName: isOpened ? "shippingbox.and.arrow.backward.fill" : "shippingbox.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(EUNACOMColor.goldFounder)
                    .scaleEffect(isOpened ? 1.2 : 1.0)
                    .animation(.spring(response: 0.4, dampingFraction: 0.6), value: isOpened)
                
                VStack(spacing: 8) {
                    Text(node.title)
                        .font(.title2)
                        .fontWeight(.heavy)
                    
                    if isOpened {
                        HStack(spacing: 6) {
                            Image(systemName: "diamond.fill")
                                .foregroundStyle(EUNACOMColor.gemCyan)
                            Text("+\(node.gemsReward) Gemas Conseguidas")
                                .font(.headline)
                                .foregroundStyle(EUNACOMColor.gemCyan)
                        }
                    } else {
                        Text("¡Toca el cofre para reclamar tus gemas!")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                
                Spacer()
                
                Button {
                    if !isOpened {
                        HapticEngine.shared.celebration()
                        withAnimation { isOpened = true }
                        onClaim()
                    } else {
                        dismiss()
                    }
                } label: {
                    Text(isOpened ? "¡Excelente!" : "Abrir Cofre")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(EUNACOMColor.primaryTeal)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }
            .padding(.top, 40)
        }
    }
}
