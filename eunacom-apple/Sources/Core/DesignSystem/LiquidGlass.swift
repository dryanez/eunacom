import SwiftUI

/// Liquid Glass and Translucent Materials styling conforming to Apple Human Interface Guidelines.
public struct LiquidGlassCardModifier: ViewModifier {
    public var cornerRadius: CGFloat
    public var strokeColor: Color
    public var strokeOpacity: Double
    public var shadowRadius: CGFloat
    
    public init(
        cornerRadius: CGFloat = 20,
        strokeColor: Color = .white,
        strokeOpacity: Double = 0.15,
        shadowRadius: CGFloat = 10
    ) {
        self.cornerRadius = cornerRadius
        self.strokeColor = strokeColor
        self.strokeOpacity = strokeOpacity
        self.shadowRadius = shadowRadius
    }
    
    public func body(content: Content) -> some View {
        content
            .background {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay {
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .stroke(
                                LinearGradient(
                                    colors: [
                                        strokeColor.opacity(strokeOpacity * 1.5),
                                        strokeColor.opacity(strokeOpacity * 0.4),
                                        .clear
                                    ],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                lineWidth: 1
                            )
                    }
                    .shadow(color: Color.black.opacity(0.12), radius: shadowRadius, x: 0, y: 6)
            }
    }
}

public struct LiquidGlassButtonModifier: ViewModifier {
    public var isHighlighted: Bool
    public var tint: Color
    
    public init(isHighlighted: Bool = false, tint: Color = EUNACOMColor.primaryTeal) {
        self.isHighlighted = isHighlighted
        self.tint = tint
    }
    
    public func body(content: Content) -> some View {
        content
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(isHighlighted ? tint : Color.secondary.opacity(0.12))
                    .overlay {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(Color.white.opacity(isHighlighted ? 0.3 : 0.1), lineWidth: 1)
                    }
            }
            .foregroundStyle(isHighlighted ? .white : .primary)
            .font(.system(.body, design: .rounded).weight(.semibold))
    }
}

public extension View {
    /// Applies a modern Apple Liquid Glass translucent card container.
    func liquidGlassCard(
        cornerRadius: CGFloat = 20,
        strokeColor: Color = .white,
        strokeOpacity: Double = 0.15,
        shadowRadius: CGFloat = 10
    ) -> some View {
        modifier(LiquidGlassCardModifier(
            cornerRadius: cornerRadius,
            strokeColor: strokeColor,
            strokeOpacity: strokeOpacity,
            shadowRadius: shadowRadius
        ))
    }
    
    /// Applies a Liquid Glass pill or button style.
    func liquidGlassButton(isHighlighted: Bool = false, tint: Color = EUNACOMColor.primaryTeal) -> some View {
        modifier(LiquidGlassButtonModifier(isHighlighted: isHighlighted, tint: tint))
    }
}

/// A container view designed to host multiple glass elements with optimized rendering performance.
public struct GlassEffectContainer<Content: View>: View {
    private let content: Content
    
    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    public var body: some View {
        content
            .compositingGroup()
    }
}
