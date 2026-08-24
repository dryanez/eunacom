import SwiftUI

/// Particle confetti effect for level-ups, chest unlocks, and high exam scores with Reduce Motion support.
public struct ConfettiView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var animate = false
    
    private let colors: [Color] = [
        EUNACOMColor.primaryTeal,
        EUNACOMColor.streakFlame,
        EUNACOMColor.gemCyan,
        EUNACOMColor.goldFounder,
        EUNACOMColor.purpleAccent,
        EUNACOMColor.successGreen
    ]
    
    public init() {}
    
    public var body: some View {
        if reduceMotion {
            // Simplified non-moving pulse when user has enabled Reduce Motion in Accessibility settings
            Circle()
                .fill(EUNACOMColor.goldFounder.opacity(0.3))
                .scaleEffect(animate ? 1.5 : 0.8)
                .opacity(animate ? 0 : 0.8)
                .onAppear {
                    withAnimation(.easeOut(duration: 1.0)) {
                        animate = true
                    }
                }
        } else {
            GeometryReader { geo in
                ZStack {
                    ForEach(0..<45, id: \.self) { i in
                        ConfettiPiece(
                            index: i,
                            color: colors[i % colors.count],
                            parentSize: geo.size,
                            isAnimating: animate
                        )
                    }
                }
                .onAppear {
                    animate = true
                }
            }
            .allowsHitTesting(false)
        }
    }
}

private struct ConfettiPiece: View {
    let index: Int
    let color: Color
    let parentSize: CGSize
    let isAnimating: Bool
    
    @State private var xOffset: CGFloat = 0
    @State private var yOffset: CGFloat = 0
    @State private var rotation: Double = 0
    @State private var opacity: Double = 1.0
    @State private var scale: CGFloat = 1.0
    
    private let targetX: CGFloat
    private let targetY: CGFloat
    private let targetRotation: Double
    private let duration: Double
    
    init(index: Int, color: Color, parentSize: CGSize, isAnimating: Bool) {
        self.index = index
        self.color = color
        self.parentSize = parentSize
        self.isAnimating = isAnimating
        
        let randomAngle = Double.random(in: 0...(2 * .pi))
        let randomDistance = CGFloat.random(in: 60...min(parentSize.width, parentSize.height) * 0.7)
        self.targetX = cos(randomAngle) * randomDistance
        self.targetY = sin(randomAngle) * randomDistance - CGFloat.random(in: 20...120)
        self.targetRotation = Double.random(in: 180...720)
        self.duration = Double.random(in: 1.2...2.2)
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: 3)
            .fill(color)
            .frame(width: CGFloat.random(in: 8...14), height: CGFloat.random(in: 6...10))
            .scaleEffect(scale)
            .rotationEffect(.degrees(rotation))
            .offset(x: xOffset, y: yOffset)
            .opacity(opacity)
            .onChange(of: isAnimating) { _, newValue in
                if newValue {
                    withAnimation(.easeOut(duration: duration)) {
                        xOffset = targetX
                        yOffset = targetY
                        rotation = targetRotation
                        scale = CGFloat.random(in: 0.6...1.2)
                    }
                    withAnimation(.easeIn(duration: duration * 0.4).delay(duration * 0.6)) {
                        opacity = 0
                    }
                }
            }
    }
}
