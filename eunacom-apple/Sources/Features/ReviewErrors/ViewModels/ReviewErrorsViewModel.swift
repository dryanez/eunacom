import SwiftUI
import SwiftData

@Observable
@MainActor
public final class ReviewErrorsViewModel {
    public var failedQuestions: [QuestionItem] = []
    public var selectedSpecialty: String = "Todas"
    public var activeReviewSession: [QuestionItem]? = nil
    
    public init() {}
    
    public func loadFailedQuestions(from modelContext: ModelContext) {
        do {
            let progressDescriptor = FetchDescriptor<UserProgress>(predicate: #Predicate { $0.needsReview == true })
            let userProgress = try modelContext.fetch(progressDescriptor)
            let failedQuestionIds = Set(userProgress.map { $0.questionId })
            
            let questionsDescriptor = FetchDescriptor<QuestionItem>()
            let allQuestions = try modelContext.fetch(questionsDescriptor)
            
            self.failedQuestions = allQuestions.filter { failedQuestionIds.contains($0.id) }
            
            // If empty in fresh environment, provide demo failed items from seed database
            if self.failedQuestions.isEmpty {
                self.failedQuestions = Array(allQuestions.prefix(3))
            }
        } catch {
            print("Error loading review errors: \(error)")
        }
    }
}
