import Foundation
import Combine

struct CreateIncidentRequest: Encodable {
    let type: String
    let description: String
    let lat: Double
    let lng: Double
    let reporter_hash: String
    let city: String
    let plate: String?
}

struct IncidentResponse: Decodable, Identifiable {
    let id: String
    let type: String
    let description: String
    let lat: Double
    let lng: Double
    let status: String
    let timestamp: String
}

@MainActor
class IncidentsViewModel: ObservableObject {
    @Published var nearbyIncidents: [IncidentResponse] = []
    @Published var isSubmitting = false
    @Published var submissionSuccess = false
    
    func fetchNearbyIncidents(lat: Double, lng: Double) async {
        do {
            let endpoint = APIEndpoint(
                path: "/incidents/nearby",
                queryItems: [
                    URLQueryItem(name: "lat", value: String(lat)),
                    URLQueryItem(name: "lng", value: String(lng))
                ]
            )
            nearbyIncidents = try await APIClient.shared.request(endpoint, responseType: [IncidentResponse].self)
        } catch {
            print("Error fetching incidents: \(error)")
        }
    }
    
    func reportIncident(type: String, description: String, lat: Double, lng: Double, city: String, plate: String? = nil) async {
        isSubmitting = true
        submissionSuccess = false
        defer { isSubmitting = false }
        
        do {
            let request = CreateIncidentRequest(
                type: type,
                description: description,
                lat: lat,
                lng: lng,
                reporter_hash: "simulated_reporter_hash_ios",
                city: city,
                plate: plate
            )
            let endpoint = APIEndpoint(path: "/incidents", method: "POST", body: try? JSONEncoder().encode(request))
            _ = try await APIClient.shared.request(endpoint, responseType: IncidentResponse.self)
            
            submissionSuccess = true
        } catch {
            print("Error reporting incident: \(error)")
        }
    }
}
