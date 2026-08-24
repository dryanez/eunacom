import Foundation
import Network

public struct QueuedOperation: Codable, Identifiable, Sendable {
    public let id: String
    public let endpointPath: String
    public let method: String
    public let payload: Data
    public let timestamp: Date
    public var retryCount: Int
    
    public init(endpointPath: String, method: String, payload: Data) {
        self.id = UUID().uuidString
        self.endpointPath = endpointPath
        self.method = method
        self.payload = payload
        self.timestamp = Date()
        self.retryCount = 0
    }
}

/// Actor managing offline request queuing and automatic synchronisation when connectivity returns.
public actor OfflineQueue {
    public static let shared = OfflineQueue()
    
    private var queue: [QueuedOperation] = []
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "com.eunacom.networkmonitor")
    private var isConnected: Bool = true
    private let storageKey = "eunacom_offline_queue"
    
    private init() {
        loadPersistedQueue()
        startMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            guard let self else { return }
            Task {
                await self.updateConnectionStatus(path.status == .satisfied)
            }
        }
        monitor.start(queue: monitorQueue)
    }
    
    private func updateConnectionStatus(_ online: Bool) async {
        self.isConnected = online
        if online && !queue.isEmpty {
            await processQueue()
        }
    }
    
    public func enqueue(endpointPath: String, method: String, payload: Data) {
        let op = QueuedOperation(endpointPath: endpointPath, method: method, payload: payload)
        queue.append(op)
        saveQueue()
        
        if isConnected {
            Task {
                await processQueue()
            }
        }
    }
    
    public func processQueue() async {
        guard isConnected, !queue.isEmpty else { return }
        
        var remaining: [QueuedOperation] = []
        for var op in queue {
            do {
                // Execute sync request through APIClient
                try await syncOperation(op)
            } catch {
                op.retryCount += 1
                if op.retryCount < 5 {
                    remaining.append(op)
                }
            }
        }
        
        self.queue = remaining
        saveQueue()
    }
    
    private func syncOperation(_ op: QueuedOperation) async throws {
        // Mock execution / direct HTTP dispatch
        try await Task.sleep(for: .milliseconds(50))
    }
    
    private func saveQueue() {
        if let data = try? JSONEncoder().encode(queue) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
    
    private func loadPersistedQueue() {
        if let data = UserDefaults.standard.data(forKey: storageKey),
           let loaded = try? JSONDecoder().decode([QueuedOperation].self, from: data) {
            self.queue = loaded
        }
    }
    
    public func isNetworkAvailable() -> Bool {
        return isConnected
    }
}
