import Foundation

/// Protocol for network client abstractions and testing mocks.
public protocol APIClientProtocol: Sendable {
    func request<E: APIEndpoint>(_ endpoint: E) async throws -> E.Response
}

/// URLSession-based API client for EUNACOM cloud endpoints and Supabase.
public final class APIClient: APIClientProtocol, @unchecked Sendable {
    public static let shared = APIClient()
    
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    
    public init(
        baseURL: URL = URL(string: "https://zmqwpkettikjutgzquri.supabase.co")!,
        session: URLSession = .shared
    ) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601
    }
    
    public func request<E: APIEndpoint>(_ endpoint: E) async throws -> E.Response {
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: true)
        if let queryItems = endpoint.queryItems, !queryItems.isEmpty {
            components?.queryItems = queryItems
        }
        
        guard let url = components?.url else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Supabase anon key default
        request.setValue("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcXdwa2V0dGlranV0Z3pxdXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Njk5MDQsImV4cCI6MjA4MjQ0NTkwNH0.ywCIODkJ9ysaT8BfBSOYyI9Kp7MPRYLrmPtiZTK2ssQ", forHTTPHeaderField: "apikey")
        
        // Inject user Bearer token if logged in
        if let token = await KeychainService.shared.getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let customHeaders = endpoint.headers {
            for (key, value) in customHeaders {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
        
        if let body = endpoint.body {
            request.httpBody = body
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.unknown("Respuesta HTTP inválida")
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                do {
                    return try decoder.decode(E.Response.self, from: data)
                } catch {
                    throw NetworkError.decodingError(error.localizedDescription)
                }
            case 401:
                throw NetworkError.unauthorized
            case 403:
                throw NetworkError.forbidden
            case 404:
                throw NetworkError.notFound
            default:
                let msg = String(data: data, encoding: .utf8)
                throw NetworkError.serverError(statusCode: httpResponse.statusCode, message: msg)
            }
        } catch let netErr as NetworkError {
            throw netErr
        } catch {
            throw NetworkError.unknown(error.localizedDescription)
        }
    }
}
