import Foundation

public enum NetworkError: LocalizedError, Sendable {
    case invalidURL
    case unauthorized
    case forbidden
    case notFound
    case serverError(statusCode: Int, message: String?)
    case decodingError(String)
    case offline
    case unknown(String)
    
    public var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida."
        case .unauthorized:
            return "Sesión no autorizada o expirada. Inicia sesión nuevamente."
        case .forbidden:
            return "No tienes permisos suficientes (requiere Plan Premium)."
        case .notFound:
            return "Recurso no encontrado en el servidor."
        case .serverError(let code, let msg):
            return "Error del servidor (\(code)): \(msg ?? "Intenta nuevamente más tarde.")"
        case .decodingError(let detail):
            return "Error procesando la respuesta del servidor: \(detail)"
        case .offline:
            return "Sin conexión a internet. Los cambios se sincronizarán automáticamente al reconectar."
        case .unknown(let msg):
            return "Error de red: \(msg)"
        }
    }
}
