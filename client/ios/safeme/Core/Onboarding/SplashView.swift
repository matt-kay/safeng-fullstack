import SwiftUI

struct SplashView: View {
    let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"

    var body: some View {
        VStack {
            Spacer()
            
            // Logo
            Image(systemName: "shield.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 100, height: 100)
                .foregroundColor(.blue)
            
            Text("SafeMe")
                .font(.largeTitle)
                .fontWeight(.bold)
                .padding(.top, 10)
            
            Text("Safe, Alert, Community-Driven")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text("v\(appVersion)")
                .font(.footnote)
                .foregroundColor(.gray)
                .padding(.bottom)
        }
    }
}

#Preview {
    SplashView()
}
