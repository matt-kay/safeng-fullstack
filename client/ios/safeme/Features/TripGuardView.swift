import SwiftUI

struct TripGuardView: View {
    @StateObject private var viewModel = TripGuardViewModel()
    
    var body: some View {
        VStack(spacing: 30) {
            if !viewModel.isMonitoring {
                Text("Trip Guard")
                    .font(.system(size: 32, weight: .bold))
                
                Text("Active protection during your commute. We monitor your route for anomalies.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.gray)
                    .padding(.horizontal)
                
                Spacer()
                
                Button(action: {
                    Task {
                        await viewModel.startMonitoring(city: "Abuja", transportType: "Bolt/Uber")
                    }
                }) {
                    Text("Start Secure Trip")
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(hex: "#74E7B2"))
                        .foregroundColor(.black)
                        .cornerRadius(15)
                }
                .padding(.horizontal)
            } else {
                // Active Monitoring
                Spacer()
                
                ZStack {
                    Circle()
                        .frame(width: 200, height: 200)
                        .overlay(Text("Protecting You").bold())
                    
                    Spacer()
                    
                    Button(action: { viewModel.stopMonitoring() }) {
                        Text("End Trip Safely")
                            .foregroundColor(.white)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(10)
                    }
                }
                .padding()
            }
        }
    }
}
