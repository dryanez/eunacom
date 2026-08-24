import SwiftUI
import TipKit

/// TipKit tips teaching user gestures and shortcuts according to Apple HIG.
public struct EliminateOptionTip: Tip {
    public var title: Text {
        Text("Descartar Opciones Incorrectas")
    }
    
    public var message: Text? {
        Text("Toca el icono de bloqueo en cualquier opción para tacharla y concentrarte en las alternativas viables.")
    }
    
    public var image: Image? {
        Image(systemName: "nosign")
    }
}

public struct AITutorTip: Tip {
    public var title: Text {
        Text("Tutor IA Clínico")
    }
    
    public var message: Text? {
        Text("Si tienes dudas con una pregunta, consulta al Tutor IA para obtener un desglose fisiopatológico en tiempo real.")
    }
    
    public var image: Image? {
        Image(systemName: "sparkles")
    }
}
