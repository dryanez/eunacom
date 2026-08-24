import SwiftUI
import AuthenticationServices

public struct AuthUser: Codable, Identifiable, Sendable {
    public let id: String
    public let email: String
    public let fullName: String?
    public let isPremium: Bool
    public let planTier: String // "free", "monthly", "semestral", "annual", "founder"
    public let expiresAt: Date?
    
    public init(
        id: String,
        email: String,
        fullName: String? = nil,
        isPremium: Bool = false,
        planTier: String = "free",
        expiresAt: Date? = nil
    ) {
        self.id = id
        self.email = email
        self.fullName = fullName
        self.isPremium = isPremium
        self.planTier = planTier
        self.expiresAt = expiresAt
    }
}

/// Observable authentication manager for state management and Sign in with Apple flow.
@Observable
@MainActor
public final class AuthManager {
    public static let shared = AuthManager()
    
    public var currentUser: AuthUser?
    public var isAuthenticated: Bool { currentUser != nil }
    public var isLoading: Bool = true
    public var authErrorMessage: String?
    
    private init() {
        Task {
            await restoreSession()
        }
    }
    
    /// Restores previously saved user session from Keychain / UserDefaults.
    public func restoreSession() async {
        isLoading = true
        defer { isLoading = false }
        
        if let token = await KeychainService.shared.getAuthToken(),
           let userId = await KeychainService.shared.getUserId() {
            // Restore session
            self.currentUser = AuthUser(
                id: userId,
                email: UserDefaults.standard.string(forKey: "eunacom_user_email") ?? "doctor@eunacom.cl",
                fullName: UserDefaults.standard.string(forKey: "eunacom_user_name") ?? "Médico EUNACOM",
                isPremium: UserDefaults.standard.bool(forKey: "eunacom_is_premium"),
                planTier: UserDefaults.standard.string(forKey: "eunacom_plan_tier") ?? "free"
            )
        } else {
            // Default to guest doctor
            self.currentUser = AuthUser(
                id: "guest_doctor_\(UUID().uuidString.prefix(6))",
                email: "invitado@eunacom.cl",
                fullName: "Médico Invitado",
                isPremium: false,
                planTier: "free"
            )
        }
    }
    
    /// Handles Sign in with Apple authorization completion.
    public func handleSignInWithAppleCompletion(_ result: Result<ASAuthorization, Error>) async {
        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                let userId = appleIDCredential.user
                let email = appleIDCredential.email ?? "apple_user@eunacom.cl"
                let givenName = appleIDCredential.fullName?.givenName ?? ""
                let familyName = appleIDCredential.fullName?.familyName ?? ""
                let fullName = "\(givenName) \(familyName)".trimmingCharacters(in: .whitespaces)
                let name = fullName.isEmpty ? "Médico EUNACOM" : fullName
                
                await KeychainService.shared.saveUserId(userId)
                if let identityTokenData = appleIDCredential.identityToken,
                   let tokenString = String(data: identityTokenData, encoding: .utf8) {
                    await KeychainService.shared.saveAuthToken(tokenString)
                } else {
                    await KeychainService.shared.saveAuthToken(UUID().uuidString)
                }
                
                UserDefaults.standard.set(email, forKey: "eunacom_user_email")
                UserDefaults.standard.set(name, forKey: "eunacom_user_name")
                
                self.currentUser = AuthUser(
                    id: userId,
                    email: email,
                    fullName: name,
                    isPremium: false,
                    planTier: "free"
                )
                HapticEngine.shared.success()
            }
        case .failure(let error):
            self.authErrorMessage = error.localizedDescription
            HapticEngine.shared.error()
        }
    }
    
    /// Standard email/password login.
    public func signIn(email: String, password: String) async throws {
        guard !email.isEmpty && !password.isEmpty else {
            throw NetworkError.unknown("Por favor ingresa correo y contraseña")
        }
        
        let dummyUserId = "user_\(email.replacingOccurrences(of: "@", with: "_").replacingOccurrences(of: ".", with: "_"))"
        let token = "jwt_\(UUID().uuidString)"
        
        await KeychainService.shared.saveUserId(dummyUserId)
        await KeychainService.shared.saveAuthToken(token)
        
        UserDefaults.standard.set(email, forKey: "eunacom_user_email")
        
        self.currentUser = AuthUser(
            id: dummyUserId,
            email: email,
            fullName: email.components(separatedBy: "@").first ?? "Médico EUNACOM",
            isPremium: true, // Dev / Full Access
            planTier: "founder"
        )
        HapticEngine.shared.success()
    }
    
    /// Sign out and clear stored tokens.
    public func signOut() async {
        await KeychainService.shared.clearSession()
        UserDefaults.standard.removeObject(forKey: "eunacom_user_email")
        UserDefaults.standard.removeObject(forKey: "eunacom_user_name")
        UserDefaults.standard.removeObject(forKey: "eunacom_is_premium")
        
        self.currentUser = AuthUser(
            id: "guest_\(UUID().uuidString.prefix(6))",
            email: "invitado@eunacom.cl",
            fullName: "Médico Invitado",
            isPremium: false,
            planTier: "free"
        )
        HapticEngine.shared.selection()
    }
    
    /// Upgrade or activate premium entitlement.
    public func setPremiumTier(_ tier: String) {
        guard var user = currentUser else { return }
        user = AuthUser(
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isPremium: true,
            planTier: tier,
            expiresAt: Date().addingTimeInterval(365 * 24 * 3600)
        )
        self.currentUser = user
        UserDefaults.standard.set(true, forKey: "eunacom_is_premium")
        UserDefaults.standard.set(tier, forKey: "eunacom_plan_tier")
    }
}
