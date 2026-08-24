import SwiftUI

public struct AITutorMessage: Identifiable {
    public let id = UUID()
    public let isUser: Bool
    public let text: String
}

public struct AITutorSheet: View {
    let questionContext: QuestionItem
    @Environment(\.dismiss) private var dismiss
    
    @State private var messages: [AITutorMessage] = []
    @State private var inputText: String = ""
    @State private var isLoading: Bool = false
    
    public init(questionContext: QuestionItem) {
        self.questionContext = questionContext
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Header context summary
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Pregunta: \(questionContext.specialty)")
                            .font(.caption2)
                            .fontWeight(.bold)
                            .foregroundStyle(EUNACOMColor.purpleAccent)
                        Text(questionContext.pregunta)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }
                    Spacer()
                }
                .padding(12)
                .background(EUNACOMColor.purpleAccent.opacity(0.08))
                
                // Chat dialogue
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(messages) { msg in
                                HStack {
                                    if msg.isUser { Spacer() }
                                    Text(msg.text)
                                        .font(.callout)
                                        .padding(14)
                                        .background(msg.isUser ? EUNACOMColor.purpleAccent : Color.secondary.opacity(0.12))
                                        .foregroundStyle(msg.isUser ? .white : .primary)
                                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    if !msg.isUser { Spacer() }
                                }
                            }
                            
                            if isLoading {
                                HStack {
                                    ProgressView()
                                        .padding(12)
                                        .background(Color.secondary.opacity(0.12))
                                        .clipShape(Circle())
                                    Spacer()
                                }
                            }
                        }
                        .padding(16)
                    }
                }
                
                Divider()
                
                // Input bar
                HStack(spacing: 10) {
                    TextField("Pregúntale al Tutor IA Médico...", text: $inputText)
                        .textFieldStyle(.plain)
                        .padding(10)
                        .background(Color.secondary.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    
                    Button {
                        sendMessage()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundStyle(inputText.isEmpty ? .secondary : EUNACOMColor.purpleAccent)
                    }
                    .disabled(inputText.isEmpty || isLoading)
                }
                .padding(12)
            }
            .navigationTitle("Tutor IA Médico")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
            }
            .onAppear {
                loadInitialGreeting()
            }
        }
    }
    
    private func loadInitialGreeting() {
        if messages.isEmpty {
            let greeting = "Hola colega. Analicemos juntos esta pregunta de \(questionContext.specialty). La opción correcta es la \(questionContext.respuestaCorrecta.uppercased()): \(questionContext.text(for: questionContext.respuestaCorrecta)). ¿Qué aspecto fisiopatológico o diagnóstico diferencial te gustaría profundizar?"
            messages.append(AITutorMessage(isUser: false, text: greeting))
        }
    }
    
    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        
        messages.append(AITutorMessage(isUser: true, text: text))
        inputText = ""
        isLoading = true
        HapticEngine.shared.selection()
        
        Task {
            try? await Task.sleep(for: .milliseconds(900))
            let aiReply = "Excelente pregunta. En el contexto de \(questionContext.specialty), la clave diagnóstica para el EUNACOM radica en recordar los criterios mayores y el tratamiento de primera línea: \(questionContext.explicacionCorrecta)"
            messages.append(AITutorMessage(isUser: false, text: aiReply))
            isLoading = false
            HapticEngine.shared.selection()
        }
    }
}
