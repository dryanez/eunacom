import SwiftUI
import SwiftData

@Observable
@MainActor
public final class SimulationViewModel {
    public var currentBlock: Int = 1 // Block 1 (1-90) or Block 2 (91-180)
    public var block1Questions: [QuestionItem] = []
    public var block2Questions: [QuestionItem] = []
    public var currentIndexInBlock: Int = 0
    public var block1Answers: [String: String] = [:]
    public var block2Answers: [String: String] = [:]
    public var blockTimeRemainingSeconds: Int = 6300 // 105 minutes (1h 45m) per block
    
    public var isSimulationCompleted: Bool = false
    public var isBetweenBlocks: Bool = false
    
    public init() {}
    
    public var currentQuestionsList: [QuestionItem] {
        currentBlock == 1 ? block1Questions : block2Questions
    }
    
    public var currentAnswers: [String: String] {
        get { currentBlock == 1 ? block1Answers : block2Answers }
        set {
            if currentBlock == 1 {
                block1Answers = newValue
            } else {
                block2Answers = newValue
            }
        }
    }
    
    public var currentQuestion: QuestionItem? {
        guard !currentQuestionsList.isEmpty, currentIndexInBlock >= 0, currentIndexInBlock < currentQuestionsList.count else { return nil }
        return currentQuestionsList[currentIndexInBlock]
    }
    
    public func selectAnswer(_ key: String) {
        guard let q = currentQuestion else { return }
        if currentBlock == 1 {
            block1Answers[q.id] = key
        } else {
            block2Answers[q.id] = key
        }
        HapticEngine.shared.selection()
    }
    
    public func loadSimulationQuestions(from modelContext: ModelContext) {
        do {
            let descriptor = FetchDescriptor<QuestionItem>()
            let all = try modelContext.fetch(descriptor)
            
            let shuffled = all.shuffled()
            let half = max(1, shuffled.count / 2)
            self.block1Questions = Array(shuffled.prefix(half))
            self.block2Questions = Array(shuffled.dropFirst(half))
        } catch {
            print("Error loading simulation questions: \(error)")
        }
    }
    
    public func completeBlock1() {
        self.isBetweenBlocks = true
        HapticEngine.shared.success()
    }
    
    public func startBlock2() {
        self.currentBlock = 2
        self.currentIndexInBlock = 0
        self.blockTimeRemainingSeconds = 6300
        self.isBetweenBlocks = false
        HapticEngine.shared.selection()
    }
    
    public func finishFullSimulation() {
        self.isSimulationCompleted = true
        HapticEngine.shared.celebration()
    }
    
    public var totalScorePercent: Double {
        let totalCount = block1Questions.count + block2Questions.count
        guard totalCount > 0 else { return 0 }
        
        var correct = 0
        for q in block1Questions {
            if block1Answers[q.id]?.lowercased() == q.respuestaCorrecta.lowercased() {
                correct += 1
            }
        }
        for q in block2Questions {
            if block2Answers[q.id]?.lowercased() == q.respuestaCorrecta.lowercased() {
                correct += 1
            }
        }
        return (Double(correct) / Double(totalCount)) * 100.0
    }
}
