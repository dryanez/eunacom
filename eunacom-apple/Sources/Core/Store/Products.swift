import Foundation

/// Product IDs for EUNACOM Apple In-App Purchases and Subscriptions.
public enum EUNACOMProducts {
    public static let monthly = "cl.eunacom.subscription.monthly"
    public static let semestral = "cl.eunacom.subscription.semestral"
    public static let annual = "cl.eunacom.subscription.annual"
    public static let lifetimeFounder = "cl.eunacom.iap.founder.lifetime"
    
    public static let allSubscriptionIDs: Set<String> = [
        monthly,
        semestral,
        annual,
        lifetimeFounder
    ]
    
    public struct PlanInfo: Identifiable {
        public let id: String
        public let title: String
        public let subtitle: String
        public let priceString: String
        public let period: String
        public let isPopular: Bool
        public let savingsBadge: String?
        public let features: [String]
    }
    
    public static let defaultPlans: [PlanInfo] = [
        PlanInfo(
            id: monthly,
            title: "Plan Mensual",
            subtitle: "Flexibilidad total mes a mes",
            priceString: "$24.990 CLP",
            period: "/mes",
            isPopular: false,
            savingsBadge: nil,
            features: [
                "Acceso a +6.000 preguntas EUNACOM",
                "Simulacros ilimitados de 180 preguntas",
                "Tutor IA Médico con explicaciones al instante",
                "Estudio offline en metro y hospital"
            ]
        ),
        PlanInfo(
            id: semestral,
            title: "Plan Semestral",
            subtitle: "Preparación completa intensiva",
            priceString: "$119.990 CLP",
            period: "/6 meses",
            isPopular: true,
            savingsBadge: "Ahorra 20%",
            features: [
                "Todo lo del plan mensual",
                "24 Masterclasses completas en video y audio",
                "Calendario inteligente de repetición espaciada",
                "Reconstrucciones de exámenes oficiales 2024-2025"
            ]
        ),
        PlanInfo(
            id: annual,
            title: "Plan Anual",
            subtitle: "Máximo rendimiento y garantía de pase",
            priceString: "$189.990 CLP",
            period: "/año",
            isPopular: false,
            savingsBadge: "Ahorra 37%",
            features: [
                "Acceso completo por 12 meses",
                "Todas las Masterclasses + Guías PDF de resumen",
                "Simulador con ranking y percentil nacional",
                "MedLingo Pro con vidas infinitas y congeladores"
            ]
        ),
        PlanInfo(
            id: lifetimeFounder,
            title: "Pase Fundador Vitalicio",
            subtitle: "Un solo pago, acceso para siempre",
            priceString: "$299.990 CLP",
            period: "pago único",
            isPopular: false,
            savingsBadge: "Acceso Ilimitado",
            features: [
                "Acceso de por vida a todas las actualizaciones",
                "Insignia dorada de Fundador en perfil y ligas",
                "Soporte prioritario y contacto directo con docentes",
                "Todas las futuras especialidades y casos clínicos"
            ]
        )
    ]
}
