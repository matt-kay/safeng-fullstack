import SwiftUI

struct VehicleCheckView: View {
    @StateObject private var viewModel = VehicleCheckViewModel()
    @State private var plate: String = ""
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Check Vehicle")
                    .font(.system(size: 28, weight: .bold))
                
                VStack(alignment: .leading) {
                    Text("LICENSE PLATE")
                        .font(.caption)
                        .foregroundColor(.gray)
                    TextField("Enter Plate (e.g. ABC-123)", text: $plate)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.allCharacters)
                }
                .padding(.horizontal)
                
                Button(action: {
                    Task {
                        await viewModel.checkVehicle(city: "Abuja", plate: plate)
                    }
                }) {
                    if viewModel.isLoading {
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .black))
                    } else {
                        Text("Search Database")
                            .fontWeight(.bold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(plate.isEmpty ? Color.gray : Color(hex: "#74E7B2"))
                .foregroundColor(.black)
                .cornerRadius(12)
                .padding(.horizontal)
                .disabled(plate.isEmpty || viewModel.isLoading)

                if let result = viewModel.checkResult {
                    VStack(spacing: 20) {
                        VStack {
                            Text("Trust Score")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text("\(result.trustScore)/100")
                                .font(.system(size: 48, weight: .black))
                                .foregroundColor(scoreColor(result.trustScore))
                        }
                        
                        HStack {
                            DetailItem(label: "Sightings", value: "\(result.sightingsCount)")
                            Spacer()
                            DetailItem(label: "Incidents", value: "\(result.linkedIncidentCount)")
                            Spacer()
                            DetailItem(label: "Confidence", value: "\(Int(result.matchConfidence * 100))%")
                        }
                        .padding(.horizontal)
                    }
                    .padding()
                    .background(Color.white.opacity(0.05))
                    .cornerRadius(20)
                    .padding(.horizontal)
                }
                
                Spacer()
                
                HStack {
                    Image(systemName: "camera.viewfinder")
                    Text("Scan Plate with Camera")
                }
                .foregroundColor(.gray)
                .font(.subheadline)
            }
            .padding(.top, 40)
        }
    }
    
    private func scoreColor(_ score: Int) -> Color {
        if score > 70 { return Color(hex: "#74E7B2") }
        if score > 40 { return .orange }
        return .red
    }
}

struct DetailItem: View {
    let label: String
    let value: String
    
    var body: some View {
        VStack {
            Text(label)
                .font(.system(size: 10))
                .foregroundColor(.gray)
            Text(value)
                .font(.headline)
        }
    }
}
