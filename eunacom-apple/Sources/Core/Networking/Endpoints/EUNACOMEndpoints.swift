import Foundation

// MARK: - Generic API Response Envelope
public struct APIResponse<T: Decodable & Sendable>: Decodable, Sendable {
    public let data: T?
    public let error: String?
    public let message: String?
}

// MARK: - Question DTO
public struct QuestionDTO: Decodable, Identifiable, Sendable {
    public let id: String
    public let numero: Int?
    public let pregunta: String?
    public let question: String? // Alternative key
    public let opcionA: String?
    public let opcionB: String?
    public let opcionC: String?
    public let opcionD: String?
    public let opcionE: String?
    public let respuestaCorrecta: String?
    public let explicacionCorrecta: String?
    public let porQueIncorrectas: String?
    public let codigoEunacom: String?
    public let specialty: String?
    public let tags: String?
    
    public var effectiveQuestion: String {
        pregunta ?? question ?? "Pregunta médica EUNACOM"
    }
}

// MARK: - Endpoints
public enum EUNACOMEndpoints {
    
    /// Endpoint to fetch user study progress
    public struct FetchProgress: APIEndpoint {
        public typealias Response = APIResponse<[String: Int]>
        
        public let userId: String
        public var path: String { "/rest/v1/user_progress" }
        public var method: HTTPMethod { .get }
        public var queryItems: [URLQueryItem]? {
            [URLQueryItem(name: "user_id", value: "eq.\(userId)")]
        }
        
        public init(userId: String) {
            self.userId = userId
        }
    }
    
    /// Endpoint to record user quiz progress
    public struct RecordProgress: APIEndpoint {
        public typealias Response = APIResponse<Bool>
        
        public let userId: String
        public let questionId: String
        public let isCorrect: Bool
        public let isOmitted: Bool
        
        public var path: String { "/rest/v1/user_progress" }
        public var method: HTTPMethod { .post }
        public var body: Data? {
            let dict: [String: Any] = [
                "user_id": userId,
                "question_id": questionId,
                "is_correct": isCorrect,
                "is_omitted": isOmitted,
                "updated_at": ISO8601DateFormatter().string(from: Date())
            ]
            return try? JSONSerialization.data(withJSONObject: dict)
        }
        
        public init(userId: String, questionId: String, isCorrect: Bool, isOmitted: Bool = false) {
            self.userId = userId
            self.questionId = questionId
            self.isCorrect = isCorrect
            self.isOmitted = isOmitted
        }
    }
    
    /// Endpoint for AI Medical Tutor clinical questions
    public struct AskAITutor: APIEndpoint {
        public struct TutorResponse: Decodable, Sendable {
            public let message: String
            public let keyPoints: [String]?
        }
        
        public typealias Response = TutorResponse
        
        public let prompt: String
        public let questionContext: String
        
        public var path: String { "/functions/v1/ai-tutor" }
        public var method: HTTPMethod { .post }
        public var body: Data? {
            let dict: [String: String] = [
                "prompt": prompt,
                "question_context": questionContext
            ]
            return try? JSONSerialization.data(withJSONObject: dict)
        }
        
        public init(prompt: String, questionContext: String) {
            self.prompt = prompt
            self.questionContext = questionContext
        }
    }
}
