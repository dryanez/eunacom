import SwiftUI
import ActivityKit
import WidgetKit

public struct ExamTimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable, Sendable {
        public var currentQuestion: Int
        public var totalQuestions: Int
        public var endTime: Date
        
        public init(currentQuestion: Int, totalQuestions: Int, endTime: Date) {
            self.currentQuestion = currentQuestion
            self.totalQuestions = totalQuestions
            self.endTime = endTime
        }
    }
    
    public var examTitle: String
    
    public init(examTitle: String) {
        self.examTitle = examTitle
    }
}

public struct ExamTimerActivityView: View {
    let context: ActivityViewContext<ExamTimerAttributes>
    
    public var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(EUNACOMColor.medicalBlue.opacity(0.2))
                    .frame(width: 44, height: 44)
                Image(systemName: "timer")
                    .font(.title3)
                    .foregroundStyle(EUNACOMColor.medicalBlue)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(context.attributes.examTitle)
                    .font(.subheadline)
                    .fontWeight(.bold)
                Text("Pregunta \(context.state.currentQuestion) de \(context.state.totalQuestions)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                .font(.headline)
                .fontWeight(.heavy)
                .monospacedDigit()
                .foregroundStyle(EUNACOMColor.medicalBlue)
        }
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.75))
    }
}
