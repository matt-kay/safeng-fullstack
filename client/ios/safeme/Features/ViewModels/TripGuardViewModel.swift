import Foundation
import Combine

struct StartTripRequest: Encodable {
    let city: String
    let transportType: String
}

struct TripResponse: Decodable {
    let tripId: String
    let initialRiskScore: Double
}

struct TelemetryReport: Encodable {
    let lat: Double
    let lng: Double
    let timestamp: String
}

struct TelemetryBatchRequest: Encodable {
    let tripId: String
    let user_id_hash: String
    let reports: [TelemetryReport]
}

struct TelemetryResponse: Decodable {
    let anomalyDetected: Bool
    let riskScore: Double
}

struct PanicRequest: Encodable {
    let tripId: String
    let lat: Double
    let lng: Double
}

@MainActor
class TripGuardViewModel: ObservableObject {
    @Published var tripId: String?
    @Published var currentRisk: Double = 0.0
    @Published var isMonitoring = false
    @Published var anomalyDetected = false
    
    private var timer: Timer?
    
    func startMonitoring(city: String, transportType: String) async {
        do {
            let request = StartTripRequest(city: city, transportType: transportType)
            let endpoint = APIEndpoint(path: "/trip-guard/start", method: "POST", body: try? JSONEncoder().encode(request))
            
            let response = try await APIClient.shared.request(endpoint, responseType: TripResponse.self)
            self.tripId = response.tripId
            self.currentRisk = response.initialRiskScore
            self.isMonitoring = true
            
            startTelemetryLoop()
        } catch {
            print("Error starting trip: \(error)")
        }
    }
    
    private func startTelemetryLoop() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { _ in
            Task {
                await self.sendTelemetry()
            }
        }
    }
    
    private func sendTelemetry() async {
        guard let tripId = self.tripId else { return }
        
        do {
            let report = TelemetryReport(
                lat: 9.0765 + (Double.random(in: -0.005...0.005)),
                lng: 7.3986 + (Double.random(in: -0.005...0.005)),
                timestamp: ISO8601DateFormatter().string(from: Date())
            )
            let batch = TelemetryBatchRequest(
                tripId: tripId,
                user_id_hash: "simulated_hash_ios",
                reports: [report]
            )
            
            let endpoint = APIEndpoint(path: "/trip-guard/telemetry", method: "POST", body: try? JSONEncoder().encode(batch))
            let response = try await APIClient.shared.request(endpoint, responseType: TelemetryResponse.self)
            
            self.currentRisk = response.riskScore
            if response.anomalyDetected {
                self.anomalyDetected = true
            }
        } catch {
            print("Error sending telemetry: \(error)")
        }
    }
    
    func triggerPanic() async {
        guard let tripId = self.tripId else { return }
        
        do {
            let request = PanicRequest(tripId: tripId, lat: 9.0765, lng: 7.3986)
            let endpoint = APIEndpoint(path: "/trip-guard/panic", method: "POST", body: try? JSONEncoder().encode(request))
            _ = try await APIClient.shared.request(endpoint, responseType: [String: String].self)
        } catch {
            print("Error triggering panic: \(error)")
        }
    }
    
    func stopMonitoring() {
        isMonitoring = false
        timer?.invalidate()
        tripId = nil
    }
}
