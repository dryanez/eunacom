import Testing
import Foundation
import SwiftData
@testable import EUNACOMCore

@Suite("EUNACOM Apple App Core Test Suite")
struct EUNACOMTests {
    
    @Test("Question Model and Option Extraction")
    func testQuestionModel() throws {
        let question = QuestionItem(
            id: "test-01",
            pregunta: "¿Cuál es el tratamiento de primera línea?",
            opcionA: "Tratamiento A",
            opcionB: "Tratamiento B",
            opcionC: "Tratamiento C",
            opcionD: "Tratamiento D",
            opcionE: "Tratamiento E",
            respuestaCorrecta: "a",
            explicacionCorrecta: "El tratamiento A es el recomendado.",
            specialty: "Cardiología"
        )
        
        #expect(question.respuestaCorrecta == "a")
        #expect(question.text(for: "a") == "Tratamiento A")
        #expect(question.optionsList.count == 5)
    }
    
    @Test("User Progress Tracking")
    func testUserProgress() throws {
        let progress = UserProgress(userId: "user_123", questionId: "q_456", isCorrect: true)
        
        #expect(progress.timesAttempted == 1)
        #expect(progress.timesCorrect == 1)
        #expect(progress.lastWasCorrect == true)
        #expect(progress.needsReview == false)
        
        progress.recordAttempt(isCorrect: false)
        #expect(progress.timesAttempted == 2)
        #expect(progress.timesCorrect == 1)
        #expect(progress.lastWasCorrect == false)
        #expect(progress.needsReview == true)
    }
    
    @Test("SwiftData In-Memory Persistence Container")
    func testPersistenceController() throws {
        let controller = PersistenceController(inMemory: true)
        let context = controller.container.mainContext
        
        let q = QuestionItem(
            id: "persist-01",
            pregunta: "Pregunta test",
            opcionA: "A",
            opcionB: "B",
            opcionC: "C",
            opcionD: "D",
            opcionE: "E",
            respuestaCorrecta: "b",
            explicacionCorrecta: "Explicación",
            specialty: "Pediatría"
        )
        
        context.insert(q)
        try context.save()
        
        let fetched = try context.fetch(FetchDescriptor<QuestionItem>())
        #expect(fetched.count == 1)
        #expect(fetched.first?.specialty == "Pediatría")
    }
    
    @Test("Streak Timezone Day Calculation")
    func testStreakRecord() throws {
        let record = StreakRecord(userId: "user_test", activityType: "quiz", questionsAnswered: 10)
        #expect(!record.normalizedDay.isEmpty)
        #expect(record.questionsAnswered == 10)
    }
}
