import SwiftUI

public struct MisClasesView: View {
    @State private var viewModel = MisClasesViewModel()
    @State private var selectedDeckToPresent: MasterclassTopic? = nil
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Specialty Horizontal Filter Bar
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(viewModel.specialtiesList, id: \.self) { specialty in
                            let isSelected = viewModel.selectedSpecialty == specialty
                            Button {
                                HapticEngine.shared.selection()
                                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                    viewModel.selectedSpecialty = specialty
                                }
                            } label: {
                                Text(specialty)
                                    .font(.subheadline)
                                    .fontWeight(isSelected ? .bold : .medium)
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background {
                                        if isSelected {
                                            Capsule().fill(EUNACOMColor.primaryTeal)
                                        } else {
                                            Capsule().fill(Color.secondary.opacity(0.12))
                                        }
                                    }
                                    .foregroundStyle(isSelected ? .white : .primary)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                }
                
                // Masterclasses List
                ScrollView {
                    LazyVStack(spacing: 14) {
                        ForEach(viewModel.filteredClasses) { topic in
                            MasterclassCardView(topic: topic) {
                                HapticEngine.shared.selection()
                                selectedDeckToPresent = topic
                            } onPlayAudio: {
                                HapticEngine.shared.selection()
                                viewModel.activeMasterclass = topic
                                viewModel.isPlayingAudio = true
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }
                
                // Bottom Audio Player Bar if active
                if let activeClass = viewModel.activeMasterclass {
                    AudioPlayerBar(
                        topic: activeClass,
                        isPlaying: $viewModel.isPlayingAudio,
                        progress: $viewModel.audioProgress
                    )
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .searchable(text: $viewModel.searchText, prompt: "Buscar clase, código o tema...")
            .navigationTitle("Mis Clases")
            .fullScreenCover(item: $selectedDeckToPresent) { topic in
                MasterclassDeckView(topic: topic)
            }
        }
    }
}

private struct MasterclassCardView: View {
    let topic: MasterclassTopic
    let onOpenDeck: () -> Void
    let onPlayAudio: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(EUNACOMColor.specialtyColor(for: topic.specialty))
                        .frame(width: 8, height: 8)
                    Text(topic.specialty)
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(EUNACOMColor.specialtyColor(for: topic.specialty))
                }
                
                Spacer()
                
                Text(topic.eunacomCode)
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.secondary.opacity(0.12))
                    .clipShape(Capsule())
            }
            
            Text(topic.title)
                .font(.headline)
                .foregroundStyle(.primary)
            
            Text(topic.summary)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                    Text("\(topic.durationMinutes) min")
                }
                .font(.caption)
                .foregroundStyle(.secondary)
                
                Spacer()
                
                Button(action: onPlayAudio) {
                    HStack(spacing: 4) {
                        Image(systemName: "headphones")
                        Text("Audio")
                    }
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color.secondary.opacity(0.12))
                    .clipShape(Capsule())
                }
                
                Button(action: onOpenDeck) {
                    HStack(spacing: 4) {
                        Image(systemName: "play.fill")
                        Text("Ver Clase")
                    }
                    .font(.caption)
                    .fontWeight(.bold)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(EUNACOMColor.primaryTeal)
                    .foregroundStyle(.white)
                    .clipShape(Capsule())
                }
            }
        }
        .padding(16)
        .liquidGlassCard(cornerRadius: 18)
    }
}
