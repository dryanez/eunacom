import SwiftUI
import AuthenticationServices

/// Value-moment-first onboarding experience guiding new medical students to rapid value.
public struct OnboardingView: View {
    @State private var currentStep: Int = 0
    @State private var selectedExamDate = Date()
    @State private var selectedSpecialtyFocus = "Cardiología"
    
    public init() {}
    
    public var body: some View {
        ZStack {
            // Ambient Gradient Background
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.08, blue: 0.16), Color(red: 0.02, green: 0.22, blue: 0.28)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 24) {
                Spacer()
                
                // Hero Icon
                ZStack {
                    Circle()
                        .fill(EUNACOMColor.primaryTeal.opacity(0.18))
                        .frame(width: 110, height: 110)
                    Image(systemName: "cross.case.fill")
                        .font(.system(size: 52))
                        .foregroundStyle(EUNACOMColor.primaryTeal)
                }
                
                // Titles
                VStack(spacing: 8) {
                    Text("Bienvenido a EUNACOM")
                        .font(.system(size: 32, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                    
                    Text("La plataforma nativa de alto rendimiento médico diseñada para aprobar el Examen Único Nacional de Medicina en Chile.")
                        .font(.body)
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                }
                
                // Core Value Badges
                VStack(spacing: 12) {
                    OnboardingBadge(icon: "checkmark.seal.fill", title: "+6.000 Preguntas con retroalimentación inmediata", color: EUNACOMColor.primaryTeal)
                    OnboardingBadge(icon: "play.rectangle.fill", title: "Masterclasses interactivas y narración en audio", color: EUNACOMColor.medicalBlue)
                    OnboardingBadge(icon: "flame.fill", title: "MedLingo: Hábito diario y gamificación clínica", color: EUNACOMColor.streakFlame)
                }
                .padding(.horizontal, 20)
                
                Spacer()
                
                // Sign in with Apple & Guest Mode
                VStack(spacing: 12) {
                    SignInWithAppleButton(.continue) { request in
                        request.requestedScopes = [.fullName, .email]
                    } onCompletion: { result in
                        Task {
                            await AuthManager.shared.handleSignInWithAppleCompletion(result)
                            AppState.shared.completeOnboarding()
                        }
                    }
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 52)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .padding(.horizontal, 24)
                    
                    Button {
                        HapticEngine.shared.selection()
                        AppState.shared.completeOnboarding()
                    } label: {
                        Text("Continuar como Invitado")
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundStyle(.white.opacity(0.8))
                    }
                    .padding(.top, 4)
                }
                .padding(.bottom, 32)
            }
        }
    }
}

private struct OnboardingBadge: View {
    let icon: String
    let title: String
    let color: Color
    
    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundStyle(.white)
            Spacer()
        }
        .padding(14)
        .background(Color.white.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
