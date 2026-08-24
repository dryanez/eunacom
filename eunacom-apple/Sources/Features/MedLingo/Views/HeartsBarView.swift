import SwiftUI

/// Top navigation bar for MedLingo displaying daily streak, gems, and remaining hearts.
public struct HeartsBarView: View {
    let streakCount: Int
    let gemsCount: Int
    let heartsCount: Int
    let maxHearts: Int
    let onHeartsTap: () -> Void
    
    public var body: some View {
        HStack(spacing: 16) {
            // Streak Flame
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                    .foregroundStyle(EUNACOMColor.streakFlame)
                Text("\(streakCount)")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundStyle(EUNACOMColor.streakFlame)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(EUNACOMColor.streakFlame.opacity(0.12))
            .clipShape(Capsule())
            
            Spacer()
            
            // Gems Cyan
            HStack(spacing: 4) {
                Image(systemName: "diamond.fill")
                    .foregroundStyle(EUNACOMColor.gemCyan)
                Text("\(gemsCount)")
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .foregroundStyle(EUNACOMColor.gemCyan)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(EUNACOMColor.gemCyan.opacity(0.12))
            .clipShape(Capsule())
            
            // Hearts Red
            Button(action: onHeartsTap) {
                HStack(spacing: 4) {
                    Image(systemName: "heart.fill")
                        .foregroundStyle(EUNACOMColor.heartRed)
                    Text("\(heartsCount)")
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundStyle(EUNACOMColor.heartRed)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(EUNACOMColor.heartRed.opacity(0.12))
                .clipShape(Capsule())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial)
    }
}
