import SwiftUI

/// Interactive 14-slide full-screen presentation deck viewer with keyboard shortcuts and swipe transitions.
public struct MasterclassDeckView: View {
    let topic: MasterclassTopic
    @Environment(\.dismiss) private var dismiss
    @State private var currentSlideIndex: Int = 0
    
    public init(topic: MasterclassTopic) {
        self.topic = topic
    }
    
    public var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Presentation Bar
                HStack {
                    Button {
                        HapticEngine.shared.selection()
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.white.opacity(0.8))
                    }
                    
                    Spacer()
                    
                    VStack(spacing: 2) {
                        Text(topic.title)
                            .font(.caption)
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                            .lineLimit(1)
                        Text(topic.eunacomCode)
                            .font(.caption2)
                            .foregroundStyle(EUNACOMColor.goldFounder)
                    }
                    
                    Spacer()
                    
                    Text("\(currentSlideIndex + 1)/\(max(1, topic.slides.count))")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundStyle(.white.opacity(0.8))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.15))
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(.ultraThinMaterial)
                
                // Slides TabView
                if topic.slides.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundStyle(EUNACOMColor.primaryTeal)
                        Text("Diapositivas en Sincronización")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(topic.summary)
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    TabView(selection: $currentSlideIndex) {
                        ForEach(Array(topic.slides.enumerated()), id: \.offset) { index, slide in
                            SlideCardView(slide: slide)
                                .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                }
                
                // Bottom Navigation Controls
                HStack(spacing: 20) {
                    Button {
                        if currentSlideIndex > 0 {
                            HapticEngine.shared.selection()
                            withAnimation { currentSlideIndex -= 1 }
                        }
                    } label: {
                        HStack {
                            Image(systemName: "chevron.left")
                            Text("Anterior")
                        }
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundStyle(currentSlideIndex > 0 ? .white : .white.opacity(0.3))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Capsule())
                    }
                    .disabled(currentSlideIndex == 0)
                    
                    Spacer()
                    
                    Button {
                        if currentSlideIndex < topic.slides.count - 1 {
                            HapticEngine.shared.selection()
                            withAnimation { currentSlideIndex += 1 }
                        } else {
                            HapticEngine.shared.celebration()
                            dismiss()
                        }
                    } label: {
                        HStack {
                            Text(currentSlideIndex < topic.slides.count - 1 ? "Siguiente" : "Finalizar")
                            Image(systemName: currentSlideIndex < topic.slides.count - 1 ? "chevron.right" : "checkmark")
                        }
                        .font(.subheadline)
                        .fontWeight(.bold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(EUNACOMColor.primaryTeal)
                        .clipShape(Capsule())
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(.ultraThinMaterial)
            }
        }
    }
}

private struct SlideCardView: View {
    let slide: ClinicalSlide
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 6) {
                    Text(slide.title)
                        .font(.system(size: 24, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    Text(slide.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.8))
                }
                
                // Key Bullets
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(slide.keyBullets, id: \.self) { bullet in
                        HStack(alignment: .top, spacing: 10) {
                            Circle()
                                .fill(EUNACOMColor.primaryTeal)
                                .frame(width: 8, height: 8)
                                .padding(.top, 6)
                            Text(bullet)
                                .font(.body)
                                .foregroundStyle(.white.opacity(0.95))
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                .padding(18)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                
                // Diagnostic Pearl Card
                if let pearl = slide.diagnosticPearl {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                                .foregroundStyle(EUNACOMColor.goldFounder)
                            Text("Perla Diagnóstica")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.goldFounder)
                                .textCase(.uppercase)
                        }
                        Text(pearl)
                            .font(.callout)
                            .fontWeight(.medium)
                            .foregroundStyle(.white)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(EUNACOMColor.goldFounder.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                
                // Treatment Algorithm Card
                if let algorithm = slide.treatmentAlgorithm {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Image(systemName: "cross.case.fill")
                                .foregroundStyle(EUNACOMColor.primaryTeal)
                            Text("Algoritmo Terapéutico")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.primaryTeal)
                                .textCase(.uppercase)
                        }
                        Text(algorithm)
                            .font(.callout)
                            .fontWeight(.medium)
                            .foregroundStyle(.white)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(EUNACOMColor.primaryTeal.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                
                // EUNACOM Trap Alert
                if let trap = slide.eunacomTrap {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(EUNACOMColor.errorRed)
                            Text("Trampa Clásica EUNACOM")
                                .font(.caption)
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.errorRed)
                                .textCase(.uppercase)
                        }
                        Text(trap)
                            .font(.callout)
                            .fontWeight(.medium)
                            .foregroundStyle(.white)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(EUNACOMColor.errorRed.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
            .padding(20)
        }
    }
}
