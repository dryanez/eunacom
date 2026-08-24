import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// Tactile feedback service using CoreHaptics & UIKit feedback generators.
@MainActor
public final class HapticEngine {
    public static let shared = HapticEngine()
    
    private init() {}
    
    /// Light tap for button clicks and menu selections.
    public func selection() {
        #if os(iOS)
        let generator = UISelectionFeedbackGenerator()
        generator.prepare()
        generator.selectionChanged()
        #endif
    }
    
    /// Tactile bump for choosing an answer option or option elimination.
    public func impact(style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        #if os(iOS)
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
        #endif
    }
    
    /// Success haptic for answering correctly, completing a test, or levelling up.
    public func success() {
        #if os(iOS)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.success)
        #endif
    }
    
    /// Error haptic for incorrect answers or heart deductions.
    public func error() {
        #if os(iOS)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.error)
        #endif
    }
    
    /// Warning haptic for exam timer reaching low thresholds or streak at risk.
    public func warning() {
        #if os(iOS)
        let generator = UINotificationFeedbackGenerator()
        generator.prepare()
        generator.notificationOccurred(.warning)
        #endif
    }
    
    /// Multi-pulse celebration haptic for treasure chests, streak milestones, and exam completion.
    public func celebration() {
        #if os(iOS)
        Task { @MainActor in
            let generator = UINotificationFeedbackGenerator()
            generator.prepare()
            generator.notificationOccurred(.success)
            try? await Task.sleep(for: .milliseconds(150))
            let impact = UIImpactFeedbackGenerator(style: .heavy)
            impact.impactOccurred()
            try? await Task.sleep(for: .milliseconds(120))
            impact.impactOccurred()
        }
        #endif
    }
}
