import SwiftUI
import AuthenticationServices

/// Modular application settings screen conforming to Apple HIG.
public struct SettingsView: View {
    @State private var authManager = AuthManager.shared
    @State private var storeManager = StoreKitManager.shared
    @AppStorage("notifications_daily_reminder") private var dailyReminder: Bool = true
    @AppStorage("notifications_streak_at_risk") private var streakReminder: Bool = true
    @AppStorage("offline_auto_sync") private var offlineAutoSync: Bool = true
    @AppStorage("haptics_enabled") private var hapticsEnabled: Bool = true
    
    @State private var showDeleteAccountAlert = false
    @State private var showSignOutAlert = false
    
    public init() {}
    
    public var body: some View {
        NavigationStack {
            Form {
                // MARK: - User Account Section
                Section(header: Text("Cuenta de Usuario")) {
                    HStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(EUNACOMColor.medicalBlue)
                                .frame(width: 48, height: 48)
                            Text(String(authManager.currentUser?.fullName?.prefix(1) ?? "M"))
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundStyle(.white)
                        }
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text(authManager.currentUser?.fullName ?? "Médico EUNACOM")
                                .font(.headline)
                            Text(authManager.currentUser?.email ?? "doctor@eunacom.cl")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        
                        Spacer()
                        
                        if authManager.currentUser?.isPremium == true {
                            Text("PRO")
                                .font(.caption2)
                                .fontWeight(.heavy)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(EUNACOMColor.goldFounder)
                                .foregroundStyle(.black)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.vertical, 4)
                    
                    if authManager.currentUser?.isPremium != true {
                        Button {
                            HapticEngine.shared.selection()
                            AppState.shared.showPaywall = true
                        } label: {
                            HStack {
                                Image(systemName: "crown.fill")
                                    .foregroundStyle(EUNACOMColor.goldFounder)
                                Text("Mejorar a Plan Pro")
                                    .fontWeight(.bold)
                                    .foregroundStyle(EUNACOMColor.goldFounder)
                            }
                        }
                    }
                }
                
                // MARK: - Notifications
                Section(header: Text("Notificaciones & Recordatorios")) {
                    Toggle("Recordatorio de estudio diario", isOn: $dailyReminder)
                        .tint(EUNACOMColor.primaryTeal)
                    Toggle("Alerta de racha en riesgo", isOn: $streakReminder)
                        .tint(EUNACOMColor.streakFlame)
                }
                
                // MARK: - Study & Performance Preferences
                Section(header: Text("Preferencias de Estudio")) {
                    Toggle("Sincronización automática offline", isOn: $offlineAutoSync)
                        .tint(EUNACOMColor.primaryTeal)
                    Toggle("Vibración y retroalimentación táctil", isOn: $hapticsEnabled)
                        .tint(EUNACOMColor.primaryTeal)
                }
                
                // MARK: - Support & Legal
                Section(header: Text("Información & Soporte")) {
                    HStack {
                        Text("Versión de la App")
                        Spacer()
                        Text("\(AppConfiguration.appVersion) (\(AppConfiguration.buildNumber))")
                            .foregroundStyle(.secondary)
                    }
                    
                    Link(destination: URL(string: "mailto:\(AppConfiguration.supportEmail)")!) {
                        HStack {
                            Text("Contacto y Soporte Médico")
                            Spacer()
                            Image(systemName: "envelope.fill")
                                .foregroundStyle(EUNACOMColor.medicalBlue)
                        }
                    }
                    
                    Link(destination: URL(string: AppConfiguration.privacyPolicyURL)!) {
                        HStack {
                            Text("Política de Privacidad")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundStyle(.secondary)
                        }
                    }
                    
                    Link(destination: URL(string: AppConfiguration.termsURL)!) {
                        HStack {
                            Text("Términos y Condiciones")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                
                // MARK: - Account Management & Sign Out
                Section {
                    Button("Cerrar Sesión") {
                        showSignOutAlert = true
                    }
                    .foregroundStyle(EUNACOMColor.warningAmber)
                    
                    Button("Eliminar Cuenta y Datos") {
                        showDeleteAccountAlert = true
                    }
                    .foregroundStyle(EUNACOMColor.errorRed)
                }
            }
            .navigationTitle("Ajustes")
            .alert("¿Cerrar Sesión?", isPresented: $showSignOutAlert) {
                Button("Cancelar", role: .cancel) {}
                Button("Cerrar Sesión", role: .destructive) {
                    Task {
                        await authManager.signOut()
                    }
                }
            }
            .alert("¿Eliminar Cuenta?", isPresented: $showDeleteAccountAlert) {
                Button("Cancelar", role: .cancel) {}
                Button("Eliminar Definitivamente", role: .destructive) {
                    Task {
                        await authManager.signOut()
                    }
                }
            } message: {
                Text("Esta acción borrará permanentemente todo tu progreso, historial de simulacros y datos personales de acuerdo con las directrices de privacidad de Apple.")
            }
        }
    }
}
