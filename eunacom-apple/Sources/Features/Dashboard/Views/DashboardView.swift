import SwiftUI
import SwiftData

public struct DashboardView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = DashboardViewModel()
    @State private var showNewTestCreator = false
    @State private var showSimulation = false
    @State private var showReviewErrors = false
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // MARK: - Hero Exam Countdown Banner
                    HStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 6) {
                                Image(systemName: "calendar.badge.clock")
                                    .foregroundStyle(EUNACOMColor.goldFounder)
                                Text("EUNACOM Diciembre 2026")
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .foregroundStyle(EUNACOMColor.goldFounder)
                                    .textCase(.uppercase)
                            }
                            
                            Text("Faltan \(viewModel.daysUntilExam) días")
                                .font(.system(size: 26, weight: .heavy, design: .rounded))
                                .foregroundStyle(.white)
                            
                            Text("Meta diaria: 25 preguntas • 1 Masterclass")
                                .font(.footnote)
                                .foregroundStyle(.white.opacity(0.85))
                        }
                        
                        Spacer()
                        
                        // Circular Progress Ring
                        ZStack {
                            Circle()
                                .stroke(Color.white.opacity(0.2), lineWidth: 8)
                                .frame(width: 68, height: 68)
                            Circle()
                                .trim(from: 0, to: CGFloat(min(1.0, viewModel.overallMasteryPercent / 100.0)))
                                .stroke(EUNACOMColor.primaryTeal, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                                .frame(width: 68, height: 68)
                            
                            VStack(spacing: 0) {
                                Text("\(Int(viewModel.overallMasteryPercent))%")
                                    .font(.system(size: 15, weight: .bold, design: .rounded))
                                    .foregroundStyle(.white)
                                Text("Acierto")
                                    .font(.system(size: 9))
                                    .foregroundStyle(.white.opacity(0.8))
                            }
                        }
                    }
                    .padding(20)
                    .background(
                        LinearGradient(
                            colors: [Color(red: 0.08, green: 0.16, blue: 0.30), Color(red: 0.05, green: 0.30, blue: 0.38)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(Color.white.opacity(0.18), lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.15), radius: 12, x: 0, y: 6)
                    
                    // MARK: - Quick Action Buttons
                    HStack(spacing: 12) {
                        Button {
                            HapticEngine.shared.selection()
                            showNewTestCreator = true
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title2)
                                    .foregroundStyle(EUNACOMColor.primaryTeal)
                                Text("Crear Test")
                                    .font(.headline)
                                    .foregroundStyle(.primary)
                                Text("Por especialidad")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .liquidGlassCard(cornerRadius: 18)
                        }
                        
                        Button {
                            HapticEngine.shared.selection()
                            showSimulation = true
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Image(systemName: "timer")
                                    .font(.title2)
                                    .foregroundStyle(EUNACOMColor.medicalBlue)
                                Text("Simulacro")
                                    .font(.headline)
                                    .foregroundStyle(.primary)
                                Text("180 Preguntas")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .liquidGlassCard(cornerRadius: 18)
                        }
                        
                        Button {
                            HapticEngine.shared.selection()
                            showReviewErrors = true
                        } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                Image(systemName: "arrow.triangle.2.circlepath.circle.fill")
                                    .font(.title2)
                                    .foregroundStyle(EUNACOMColor.errorRed)
                                Text("Repasar")
                                    .font(.headline)
                                    .foregroundStyle(.primary)
                                Text("Mis Errores")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(16)
                            .liquidGlassCard(cornerRadius: 18)
                        }
                    }
                    
                    // MARK: - MedLingo Streak Card
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(EUNACOMColor.streakFlame.opacity(0.18))
                                .frame(width: 52, height: 52)
                            Image(systemName: "flame.fill")
                                .font(.title)
                                .foregroundStyle(EUNACOMColor.streakFlame)
                        }
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text("¡Racha Activa de \(viewModel.currentStreak) Días!")
                                .font(.headline)
                            Text("Completa una lección de MedLingo hoy para no perderla.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                        }
                        
                        Spacer()
                        
                        Button {
                            HapticEngine.shared.selection()
                            AppState.shared.selectedTab = .medLingo
                        } label: {
                            Text("Jugar")
                                .font(.subheadline)
                                .fontWeight(.bold)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(EUNACOMColor.streakFlame)
                                .foregroundStyle(.white)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(16)
                    .liquidGlassCard(cornerRadius: 18)
                    
                    // MARK: - Specialty Mastery Section
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("Rendimiento por Especialidad")
                                .font(.title3)
                                .fontWeight(.bold)
                            Spacer()
                            NavigationLink {
                                MisClasesView()
                            } label: {
                                Text("Ver todas")
                                    .font(.subheadline)
                                    .foregroundStyle(EUNACOMColor.primaryTeal)
                            }
                        }
                        
                        ForEach(viewModel.specialtiesProgress) { item in
                            VStack(spacing: 6) {
                                HStack {
                                    Circle()
                                        .fill(EUNACOMColor.specialtyColor(for: item.name))
                                        .frame(width: 10, height: 10)
                                    Text(item.name)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Spacer()
                                    Text("\(item.correctCount)/\(item.answeredCount) correctas (\(Int(item.percentage))%)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                
                                GeometryReader { geo in
                                    ZStack(alignment: .leading) {
                                        Capsule()
                                            .fill(Color.secondary.opacity(0.15))
                                            .frame(height: 7)
                                        Capsule()
                                            .fill(EUNACOMColor.specialtyColor(for: item.name))
                                            .frame(width: max(0, geo.size.width * CGFloat(item.percentage / 100.0)), height: 7)
                                    }
                                }
                                .frame(height: 7)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .padding(18)
                    .liquidGlassCard(cornerRadius: 20)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .navigationTitle("EUNACOM 2026")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        HapticEngine.shared.selection()
                        AppState.shared.showPaywall = true
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "crown.fill")
                                .foregroundStyle(EUNACOMColor.goldFounder)
                            Text("Pro")
                                .fontWeight(.bold)
                                .foregroundStyle(EUNACOMColor.goldFounder)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(.ultraThinMaterial)
                        .clipShape(Capsule())
                    }
                }
            }
            .onAppear {
                viewModel.loadMetrics(from: modelContext)
            }
            .sheet(isPresented: $showNewTestCreator) {
                TestCreatorView()
            }
            .sheet(isPresented: $showSimulation) {
                SimulationRunnerView()
            }
            .sheet(isPresented: $showReviewErrors) {
                ReviewErrorsView()
            }
        }
    }
}
