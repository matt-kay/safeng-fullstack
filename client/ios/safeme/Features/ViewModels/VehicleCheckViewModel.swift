import Foundation
import Combine

struct VehicleCheckRequest: Encodable {
    let city: String
    let plate: String?
    let platePartial: String?
    let vehicleMake: String?
    let vehicleColor: String?
    let transportType: String?
    
    init(city: String, plate: String? = nil, platePartial: String? = nil, vehicleMake: String? = nil, vehicleColor: String? = nil, transportType: String? = nil) {
        self.city = city
        self.plate = plate
        self.platePartial = platePartial
        self.vehicleMake = vehicleMake
        self.vehicleColor = vehicleColor
        self.transportType = transportType
    }
}

struct VehicleCheckResponse: Decodable {
    let trustScore: Int
    let sightingsCount: Int
    let linkedIncidentCount: Int
    let matchConfidence: Double
}

@MainActor
class VehicleCheckViewModel: ObservableObject {
    @Published var checkResult: VehicleCheckResponse?
    @Published var isLoading = false
    
    func checkVehicle(city: String, plate: String? = nil, platePartial: String? = nil) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let request = VehicleCheckRequest(city: city, plate: plate, platePartial: platePartial)
            let endpoint = APIEndpoint(
                path: "/vehicle/check",
                method: "POST",
                body: try? JSONEncoder().encode(request)
            )
            
            checkResult = try await APIClient.shared.request(endpoint, responseType: VehicleCheckResponse.self)
        } catch {
            print("Error checking vehicle: \(error)")
        }
    }
}
