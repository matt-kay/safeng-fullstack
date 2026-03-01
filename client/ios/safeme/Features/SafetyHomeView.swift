import SwiftUI

struct SafetyHomeView: View {
    @StateObject private var viewModel = SafetyHomeViewModel()
    
    var body: some View {
        ZStack {
            Color(hex: "#014342").ignoresSafeArea()
            VStack {
                if viewModel.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Safety Heatmap")
                        .font(.title)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Text("Loaded \(viewModel.riskTiles.count) grid cells")
                        .foregroundColor(.white.opacity(0.6))
                    
                    Spacer()
                    
                    if let userRisk = viewModel.userRisk {
                        // Risk Pulse Card
                        VStack(alignment: .leading) {
                            Text("CURRENT LOCATION")
                                .font(.caption)
                                .foregroundColor(.gray)
                            Text("Risk Score: \(String(format: "%.1f", userRisk.riskScore)) (\(userRisk.riskLevel))")
                                .font(.headline)
                                .foregroundColor(userRisk.riskLevel == "high" ? .red : Color(hex: "#74E7B2"))
                        }
                        .padding()
                        .background(Color.black.opacity(0.6))
                        .cornerRadius(15)
                        .padding()
                    }
                }
            }
        }
        .task {
            await viewModel.fetchRiskData(city: "Abuja", bbox: "9.0,7.0,9.2,7.2", zoom: 12)
            await viewModel.fetchCurrentLocationRisk(city: "Abuja", lat: 9.0765, lng: 7.3986)
        }
    }
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
