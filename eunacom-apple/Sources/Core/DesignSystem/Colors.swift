import SwiftUI

/// Semantic color palette for EUNACOM Apple native app conforming to Apple HIG.
public enum EUNACOMColor {
    // Primary Brand Colors
    public static let primaryTeal = Color(red: 0.05, green: 0.65, blue: 0.62)
    public static let medicalBlue = Color(red: 0.12, green: 0.45, blue: 0.88)
    public static let darkNavy = Color(red: 0.07, green: 0.11, blue: 0.18)
    public static let lightNavy = Color(red: 0.11, green: 0.16, blue: 0.25)
    
    // Status & Accent Colors
    public static let successGreen = Color(red: 0.16, green: 0.75, blue: 0.47)
    public static let errorRed = Color(red: 0.92, green: 0.26, blue: 0.35)
    public static let warningAmber = Color(red: 0.98, green: 0.68, blue: 0.15)
    public static let purpleAccent = Color(red: 0.58, green: 0.34, blue: 0.92)
    public static let goldFounder = Color(red: 1.0, green: 0.82, blue: 0.25)
    
    // Gamification Colors (MedLingo)
    public static let streakFlame = Color(red: 1.0, green: 0.42, blue: 0.12)
    public static let heartRed = Color(red: 0.95, green: 0.22, blue: 0.32)
    public static let gemCyan = Color(red: 0.18, green: 0.80, blue: 0.95)
    public static let xpYellow = Color(red: 1.0, green: 0.78, blue: 0.10)
    
    // Specialty Colors
    public static func specialtyColor(for name: String) -> Color {
        let normalized = name.lowercased()
        if normalized.contains("cardio") { return Color(red: 0.94, green: 0.28, blue: 0.35) }
        if normalized.contains("pediatr") || normalized.contains("neona") { return Color(red: 0.22, green: 0.74, blue: 0.92) }
        if normalized.contains("gineco") || normalized.contains("obste") { return Color(red: 0.92, green: 0.38, blue: 0.72) }
        if normalized.contains("cirug") { return Color(red: 0.98, green: 0.54, blue: 0.18) }
        if normalized.contains("medicina interna") { return Color(red: 0.20, green: 0.55, blue: 0.92) }
        if normalized.contains("infecto") { return Color(red: 0.30, green: 0.78, blue: 0.45) }
        if normalized.contains("neuro") { return Color(red: 0.62, green: 0.38, blue: 0.92) }
        if normalized.contains("respira") { return Color(red: 0.18, green: 0.82, blue: 0.82) }
        if normalized.contains("gastro") { return Color(red: 0.90, green: 0.60, blue: 0.20) }
        if normalized.contains("derma") { return Color(red: 0.92, green: 0.45, blue: 0.55) }
        if normalized.contains("nefro") { return Color(red: 0.45, green: 0.60, blue: 0.88) }
        if normalized.contains("reuma") { return Color(red: 0.85, green: 0.35, blue: 0.50) }
        if normalized.contains("endocri") { return Color(red: 0.95, green: 0.70, blue: 0.20) }
        if normalized.contains("psiqui") { return Color(red: 0.52, green: 0.48, blue: 0.88) }
        if normalized.contains("trauma") { return Color(red: 0.88, green: 0.45, blue: 0.25) }
        if normalized.contains("salud p") { return Color(red: 0.20, green: 0.72, blue: 0.65) }
        return medicalBlue
    }
}

public extension ShapeStyle where Self == Color {
    static var eunacomTeal: Color { EUNACOMColor.primaryTeal }
    static var eunacomBlue: Color { EUNACOMColor.medicalBlue }
    static var eunacomDarkNavy: Color { EUNACOMColor.darkNavy }
    static var eunacomStreakFlame: Color { EUNACOMColor.streakFlame }
    static var eunacomHeart: Color { EUNACOMColor.heartRed }
    static var eunacomGem: Color { EUNACOMColor.gemCyan }
    static var eunacomFounder: Color { EUNACOMColor.goldFounder }
}
