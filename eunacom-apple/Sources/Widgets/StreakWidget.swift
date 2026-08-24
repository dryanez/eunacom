import SwiftUI
import WidgetKit

public struct StreakEntry: TimelineEntry {
    public let date: Date
    public let streakCount: Int
    public let hasStudiedToday: Bool
    public let daysUntilExam: Int
}

public struct StreakTimelineProvider: TimelineProvider {
    public typealias Entry = StreakEntry
    
    public func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: Date(), streakCount: 5, hasStudiedToday: true, daysUntilExam: 114)
    }
    
    public func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        let entry = StreakEntry(date: Date(), streakCount: 5, hasStudiedToday: true, daysUntilExam: 114)
        completion(entry)
    }
    
    public func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        let entry = StreakEntry(date: Date(), streakCount: 4, hasStudiedToday: false, daysUntilExam: 114)
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

public struct StreakWidgetView: View {
    let entry: StreakEntry
    @Environment(\.widgetFamily) var family
    
    public var body: some View {
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 1) {
                    Image(systemName: "flame.fill")
                        .font(.caption2)
                    Text("\(entry.streakCount)")
                        .font(.headline)
                        .fontWeight(.heavy)
                }
            }
        case .accessoryInline:
            HStack {
                Image(systemName: "flame.fill")
                Text("Racha EUNACOM: \(entry.streakCount) días (\(entry.daysUntilExam)d para examen)")
            }
        default:
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    ZStack {
                        Circle()
                            .fill(EUNACOMColor.streakFlame.opacity(0.2))
                            .frame(width: 38, height: 38)
                        Image(systemName: "flame.fill")
                            .font(.headline)
                            .foregroundStyle(EUNACOMColor.streakFlame)
                    }
                    Spacer()
                    Text("EUNACOM")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(.secondary)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(entry.streakCount) Días")
                        .font(.system(size: 24, weight: .heavy, design: .rounded))
                    Text(entry.hasStudiedToday ? "Meta de hoy lograda" : "¡Completa tu lección!")
                        .font(.caption2)
                        .foregroundStyle(entry.hasStudiedToday ? EUNACOMColor.successGreen : EUNACOMColor.streakFlame)
                }
                
                Spacer()
                
                Text("Faltan \(entry.daysUntilExam) días para el examen")
                    .font(.system(size: 9))
                    .foregroundStyle(.secondary)
            }
            .padding(14)
            .containerBackground(for: .widget) {
                Color.clear
            }
        }
    }
}
