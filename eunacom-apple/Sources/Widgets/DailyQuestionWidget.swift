import SwiftUI
import WidgetKit

public struct DailyQuestionEntry: TimelineEntry {
    public let date: Date
    public let specialty: String
    public let vignette: String
    public let questionId: String
}

public struct DailyQuestionWidgetView: View {
    let entry: DailyQuestionEntry
    
    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Circle()
                    .fill(EUNACOMColor.specialtyColor(for: entry.specialty))
                    .frame(width: 8, height: 8)
                Text(entry.specialty)
                    .font(.caption2)
                    .fontWeight(.bold)
                    .foregroundStyle(EUNACOMColor.specialtyColor(for: entry.specialty))
                Spacer()
                Text("Pregunta del Día")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.secondary)
            }
            
            Text(entry.vignette)
                .font(.caption)
                .lineLimit(4)
                .foregroundStyle(.primary)
            
            Spacer()
            
            HStack {
                Text("Toca para responder")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(EUNACOMColor.primaryTeal)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 8))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(14)
        .containerBackground(for: .widget) {
            Color.clear
        }
    }
}
