import SwiftUI

/// Duolingo-style winding clinical learning tree view for daily habit formation.
public struct MedLingoPathView: View {
    @State private var viewModel = MedLingoViewModel()
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Top Hearts & Gems Header
                HeartsBarView(
                    streakCount: viewModel.currentStreak,
                    gemsCount: viewModel.gems,
                    heartsCount: viewModel.hearts,
                    maxHearts: viewModel.maxHearts,
                    onHeartsTap: {
                        viewModel.showRefillHeartsSheet = true
                    }
                )
                
                // Winding Path Scroll View
                ScrollView {
                    VStack(spacing: 32) {
                        ForEach(viewModel.units) { unit in
                            UnitSectionView(unit: unit) { node in
                                viewModel.handleNodeTap(node)
                            }
                        }
                    }
                    .padding(.vertical, 24)
                }
            }
            .navigationTitle("MedLingo Clínico")
            .navigationBarTitleDisplayMode(.inline)
            .fullScreenCover(item: $viewModel.selectedNodeForLesson) { node in
                MedLingoLessonView(node: node) { xp, gems in
                    viewModel.completeLesson(nodeId: node.id, earnedXP: xp, earnedGems: gems)
                } onDeductHeart: {
                    viewModel.deductHeart()
                }
            }
            .sheet(item: $viewModel.selectedChestForReward) { chest in
                ChestRewardModal(node: chest) {
                    viewModel.gems += chest.gemsReward
                }
            }
            .sheet(isPresented: $viewModel.showRefillHeartsSheet) {
                RefillHeartsSheet(
                    currentGems: viewModel.gems,
                    onRefill: {
                        viewModel.refillHearts()
                    }
                )
            }
        }
    }
}

private struct UnitSectionView: View {
    let unit: MedLingoUnit
    let onSelectNode: (MedLingoNode) -> Void
    
    var body: some View {
        VStack(spacing: 24) {
            // Unit Header Banner
            VStack(alignment: .leading, spacing: 4) {
                Text(unit.title)
                    .font(.headline)
                    .fontWeight(.heavy)
                    .foregroundStyle(.white)
                Text(unit.description)
                    .font(.footnote)
                    .foregroundStyle(.white.opacity(0.85))
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(
                    colors: [EUNACOMColor.specialtyColor(for: unit.specialty), EUNACOMColor.medicalBlue],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .padding(.horizontal, 16)
            
            // Winding Nodes Sequence
            VStack(spacing: 20) {
                ForEach(Array(unit.nodes.enumerated()), id: \.offset) { index, node in
                    let xOffset: CGFloat = sin(Double(index) * 1.1) * 60
                    
                    PathNodeButton(node: node) {
                        onSelectNode(node)
                    }
                    .offset(x: xOffset)
                }
            }
        }
    }
}

private struct PathNodeButton: View {
    let node: MedLingoNode
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Background Circle with Ring
                Circle()
                    .fill(node.isCompleted ? EUNACOMColor.successGreen : (node.isUnlocked ? EUNACOMColor.primaryTeal : Color.secondary.opacity(0.25)))
                    .frame(width: 68, height: 68)
                    .shadow(color: (node.isUnlocked ? EUNACOMColor.primaryTeal : Color.clear).opacity(0.4), radius: 8, x: 0, y: 4)
                
                // Icon
                Image(systemName: node.nodeType == .chest ? "shippingbox.fill" : (node.isCompleted ? "checkmark" : node.iconName))
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(.white)
            }
        }
        .disabled(!node.isUnlocked)
    }
}

private struct RefillHeartsSheet: View {
    let currentGems: Int
    let onRefill: () -> Void
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "heart.slash.fill")
                .font(.system(size: 64))
                .foregroundStyle(EUNACOMColor.heartRed)
            
            Text("¡Te has quedado sin vidas!")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Puedes recargar tus 5 vidas con 50 gemas o esperar a que se regeneren automáticamente.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
            
            Spacer()
            
            Button {
                onRefill()
                dismiss()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "diamond.fill")
                    Text("Recargar 5 Vidas (50 Gemas)")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(currentGems >= 50 ? EUNACOMColor.heartRed : Color.secondary.opacity(0.2))
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .disabled(currentGems < 50)
            .padding(.horizontal, 24)
            .padding(.bottom, 24)
        }
        .padding(.top, 40)
    }
}
