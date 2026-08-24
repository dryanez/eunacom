import Foundation

public enum AppConfiguration {
    public static let appName = "EUNACOM"
    public static let appVersion = "2026.1.0"
    public static let buildNumber = "1"
    public static let examDate = Calendar.current.date(from: DateComponents(year: 2026, month: 12, day: 16, hour: 8, minute: 30)) ?? Date()
    
    public static let supabaseURL = "https://zmqwpkettikjutgzquri.supabase.co"
    public static let supportEmail = "soporte@eunacom.cl"
    public static let websiteURL = "https://eunacom.cl"
    public static let privacyPolicyURL = "https://eunacom.cl/privacidad"
    public static let termsURL = "https://eunacom.cl/terminos"
}
