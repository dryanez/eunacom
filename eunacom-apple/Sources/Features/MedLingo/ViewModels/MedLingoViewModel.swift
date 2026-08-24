import SwiftUI
import SwiftData

@Observable
@MainActor
public final class MedLingoViewModel {
    public var xp: Int = 340
    public var gems: Int = 180
    public var hearts: Int = 5
    public var maxHearts: Int = 5
    public var currentStreak: Int = 4
    public var streakFreezes: Int = 2
    public var currentLeague: String = "Oro"
    
    public var units: [MedLingoUnit] = []
    public var selectedNodeForLesson: MedLingoNode? = nil
    public var selectedChestForReward: MedLingoNode? = nil
    public var showRefillHeartsSheet: Bool = false
    
    public init() {
        loadDefaultPathway()
    }
    
    public func loadDefaultPathway() {
        self.units = [
            MedLingoUnit(
                id: "unit_cardio_1",
                unitNumber: 1,
                title: "Unidad 1: Urgencias Cardiovasculares",
                description: "Domina el diagnóstico de infarto agudo, arritmias ventriculares y shock cardiogénico.",
                specialty: "Cardiología",
                nodes: [
                    MedLingoNode(id: "node_1_1", title: "Infarto con Supradesnivel", specialty: "Cardiología", iconName: "heart.fill", isCompleted: true, isUnlocked: true),
                    MedLingoNode(id: "node_1_2", title: "Angina Inestable vs Infarto", specialty: "Cardiología", iconName: "waveform.path.ecg", isCompleted: true, isUnlocked: true),
                    MedLingoNode(id: "node_1_chest", title: "Cofre de Urgencias", specialty: "Cardiología", iconName: "shippingbox.fill", nodeType: .chest, gemsReward: 50, isCompleted: true, isUnlocked: true),
                    MedLingoNode(id: "node_1_3", title: "Fibrilación Auricular y Anticoagulación", specialty: "Cardiología", iconName: "bolt.heart.fill", isCompleted: false, isUnlocked: true),
                    MedLingoNode(id: "node_1_4", title: "Insuficiencia Cardíaca Aguda", specialty: "Cardiología", iconName: "cross.fill", isCompleted: false, isUnlocked: false),
                    MedLingoNode(id: "node_1_boss", title: "Examen Jefe: Cardio Urgencias", specialty: "Cardiología", iconName: "trophy.fill", nodeType: .boss, xpReward: 100, gemsReward: 80, isCompleted: false, isUnlocked: false)
                ]
            ),
            MedLingoUnit(
                id: "unit_ped_1",
                unitNumber: 2,
                title: "Unidad 2: Pediatría & Neonatología",
                description: "Patología respiratoria pediátrica, vacunas y reanimación neonatal.",
                specialty: "Pediatría",
                nodes: [
                    MedLingoNode(id: "node_2_1", title: "Crup Laríngeo y Estridor", specialty: "Pediatría", iconName: "person.crop.circle.fill", isCompleted: false, isUnlocked: false),
                    MedLingoNode(id: "node_2_2", title: "Bronquiolitis y VRS", specialty: "Pediatría", iconName: "lungs.fill", isCompleted: false, isUnlocked: false),
                    MedLingoNode(id: "node_2_chest", title: "Cofre Pediátrico", specialty: "Pediatría", iconName: "shippingbox.fill", nodeType: .chest, gemsReward: 50, isCompleted: false, isUnlocked: false)
                ]
            )
        ]
    }
    
    public func handleNodeTap(_ node: MedLingoNode) {
        guard node.isUnlocked else {
            HapticEngine.shared.error()
            return
        }
        
        if node.nodeType == .chest {
            HapticEngine.shared.celebration()
            self.selectedChestForReward = node
        } else {
            if hearts <= 0 {
                HapticEngine.shared.warning()
                self.showRefillHeartsSheet = true
            } else {
                HapticEngine.shared.selection()
                self.selectedNodeForLesson = node
            }
        }
    }
    
    public func deductHeart() {
        if hearts > 0 {
            hearts -= 1
            HapticEngine.shared.error()
        }
    }
    
    public func refillHearts() {
        if gems >= 50 {
            gems -= 50
            hearts = maxHearts
            HapticEngine.shared.celebration()
        }
    }
    
    public func completeLesson(nodeId: String, earnedXP: Int, earnedGems: Int) {
        self.xp += earnedXP
        self.gems += earnedGems
        
        // Mark node completed and unlock next
        for uIndex in 0..<units.count {
            for nIndex in 0..<units[uIndex].nodes.count {
                if units[uIndex].nodes[nIndex].id == nodeId {
                    units[uIndex].nodes[nIndex].isCompleted = true
                    if nIndex + 1 < units[uIndex].nodes.count {
                        units[uIndex].nodes[nIndex + 1].isUnlocked = true
                    }
                }
            }
        }
        HapticEngine.shared.celebration()
    }
}
