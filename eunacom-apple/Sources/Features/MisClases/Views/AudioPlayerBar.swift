import SwiftUI

/// Floating audio player for Masterclass audio narrations.
public struct AudioPlayerBar: View {
    let topic: MasterclassTopic
    @Binding var isPlaying: Bool
    @Binding var progress: Double
    
    public var body: some View {
        HStack(spacing: 12) {
            Button {
                HapticEngine.shared.selection()
                isPlaying.toggle()
            } label: {
                Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .frame(width: 38, height: 38)
                    .background(EUNACOMColor.primaryTeal)
                    .clipShape(Circle())
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(topic.title)
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .lineLimit(1)
                Text("\(topic.specialty) • \(topic.durationMinutes) min")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Button {
                HapticEngine.shared.selection()
                withAnimation {
                    progress = min(1.0, progress + 0.1)
                }
            } label: {
                Image(systemName: "goforward.15")
                    .font(.title3)
                    .foregroundStyle(.primary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .liquidGlassCard(cornerRadius: 20)
        .padding(.horizontal, 16)
        .padding(.bottom, 8)
    }
}
