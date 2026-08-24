import Foundation
import Security

/// Thread-safe service for storing user credentials, JWT tokens, and session secrets in Apple Keychain.
public actor KeychainService {
    public static let shared = KeychainService()
    
    private let service = "com.eunacom.apple.auth"
    private let tokenKey = "auth_session_token"
    private let userIdKey = "auth_user_id"
    
    private init() {}
    
    public func saveAuthToken(_ token: String) {
        save(key: tokenKey, data: Data(token.utf8))
    }
    
    public func getAuthToken() -> String? {
        guard let data = load(key: tokenKey) else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    public func saveUserId(_ userId: String) {
        save(key: userIdKey, data: Data(userId.utf8))
    }
    
    public func getUserId() -> String? {
        guard let data = load(key: userIdKey) else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    public func clearSession() {
        delete(key: tokenKey)
        delete(key: userIdKey)
    }
    
    private func save(key: String, data: Data) {
        delete(key: key)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        SecItemAdd(query as CFDictionary, nil)
    }
    
    private func load(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return data
    }
    
    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}
