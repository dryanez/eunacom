import SwiftUI
import SwiftData

@Observable
@MainActor
public final class TestRunnerViewModel {
    public var questions: [QuestionItem] = []
    public var currentIndex: Int = 0
    public var userAnswers: [String: String] = [:] // [Question.id: "a"]
    public var eliminatedOptions: [String: Set<String>] = [:] // [Question.id: Set(["b", "c"])]
    public var bookmarkedQuestionIds: Set<String> = []
    
    public var mode: ExamTestMode = .tutor
    public var timeRemainingSeconds: Int = 1800
    public var isTimerRunning: Bool = false
    public var isCompleted: Bool = false
    
    // Sheets
    public var showNormalValues: Bool = false
    public var showAITutor: Bool = false
    public var showResultsSummary: Bool = false
    
    public init() {}
    
    public var currentQuestion: QuestionItem? {
        guard !questions.isEmpty, currentIndex >= 0, currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }
    
    public var currentQuestionAnswer: String? {
        guard let q = currentQuestion else { return nil }
        return userAnswers[q.id]
    }
    
    public var hasAnsweredCurrentQuestion: Bool {
        currentQuestionAnswer != nil
    }
    
    public var isCurrentAnswerCorrect: Bool {
        guard let q = currentQuestion, let ans = currentQuestionAnswer else { return false }
        return ans.lowercased() == q.respuestaCorrecta.lowercased()
    }
    
    public var scorePercent: Double {
        guard !questions.isEmpty else { return 0 }
        var correct = 0
        for q in questions {
            if let ans = userAnswers[q.id], ans.lowercased() == q.respuestaCorrecta.lowercased() {
                correct += 1
            }
        }
        return (Double(correct) / Double(questions.count)) * 100.0
    }
    
    public func selectOption(_ key: String, in modelContext: ModelContext? = nil) {
        guard let q = currentQuestion else { return }
        if mode == .tutor && hasAnsweredCurrentQuestion { return }
        
        userAnswers[q.id] = key.lowercased()
        
        if key.lowercased() == q.respuestaCorrecta.lowercased() {
            HapticEngine.shared.success()
        } else {
            HapticEngine.shared.error()
        }
        
        // Save progress to SwiftData if context provided
        if let context = modelContext {
            let isCorrect = key.lowercased() == q.respuestaCorrecta.lowercased()
            let progress = UserProgress(userId: AuthManager.shared.currentUser?.id ?? "guest", questionId: q.id, isCorrect: isCorrect)
            context.insert(progress)
            try? context.save()
        }
    }
    
    public func toggleElimination(for optionKey: String) {
        guard let q = currentQuestion else { return }
        var set = eliminatedOptions[q.id] ?? Set<String>()
        if set.contains(optionKey) {
            set.remove(optionKey)
        } else {
            set.insert(optionKey)
        }
        eliminatedOptions[q.id] = set
        HapticEngine.shared.selection()
    }
    
    public func isOptionEliminated(_ optionKey: String) -> Bool {
        guard let q = currentQuestion else { return false }
        return eliminatedOptions[q.id]?.contains(optionKey) ?? false
    }
    
    public func toggleBookmarkCurrent() {
        guard let q = currentQuestion else { return }
        if bookmarkedQuestionIds.contains(q.id) {
            bookmarkedQuestionIds.remove(q.id)
        } else {
            bookmarkedQuestionIds.insert(q.id)
        }
        HapticEngine.shared.selection()
    }
    
    public func nextQuestion() {
        if currentIndex < questions.count - 1 {
            currentIndex += 1
            HapticEngine.shared.selection()
        } else {
            finishExam()
        }
    }
    
    public func previousQuestion() {
        if currentIndex > 0 {
            currentIndex -= 1
            HapticEngine.shared.selection()
        }
    }
    
    public func finishExam() {
        self.isCompleted = true
        self.showResultsSummary = true
        HapticEngine.shared.celebration()
    }
}
