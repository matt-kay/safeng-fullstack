import Foundation
import Combine

struct RiskTile: Decodable, Identifiable {
    let gridCellId: String
    let riskScore: Double
    let riskLevel: String
    let centroid: Centroid
    
    var id: String { gridCellId }
}

struct Centroid: Decodable {
    let lat: Double
    let lng: Double
}

struct RiskHere: Decodable {
    let riskScore: Double
    let riskLevel: String
    let gridCellId: String
}

@MainActor
class SafetyHomeViewModel: ObservableObject {
    @Published var riskTiles: [RiskTile] = []
    @Published var userRisk: RiskHere?
    @Published var isLoading = false
    
    func fetchRiskData(city: String, bbox: String, zoom: Int) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let endpoint = APIEndpoint(
                path: "/risk/tiles",
                queryItems: [
                    URLQueryItem(name: "city", value: city),
                    URLQueryItem(name: "bbox", value: bbox),
                    URLQueryItem(name: "zoom", value: String(zoom))
                ]
            )
            
            riskTiles = try await APIClient.shared.request(endpoint, responseType: [RiskTile].self)
        } catch {
            print("Error fetching risk tiles: \(error)")
        }
    }
    
    func fetchCurrentLocationRisk(city: String, lat: Double, lng: Double) async {
        do {
            let endpoint = APIEndpoint(
                path: "/risk/here",
                queryItems: [
                    URLQueryItem(name: "city", value: city),
                    URLQueryItem(name: "lat", value: String(lat)),
                    URLQueryItem(name: "lng", value: String(lng))
                ]
            )
            
            userRisk = try await APIClient.shared.request(endpoint, responseType: RiskHere.self)
        } catch {
            print("Error fetching user risk: \(error)")
        }
    }
}
