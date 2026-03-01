import SwiftUI
import FirebaseAuth

enum AppState {
    case splash
    case onboarding
    case auth
    case home
}

struct ContentView: View {
    @AppStorage("isFirstLaunch") var isFirstLaunch: Bool = true
    @State private var appState: AppState = .splash
    
    var body: some View {
        Group {
            switch appState {
            case .splash:
                SplashView()
                    .onAppear {
                        checkSession()
                    }
            case .onboarding:
                OnboardingView()
                    .onChange(of: isFirstLaunch) { _ in
                        determineNextState()
                    }
            case .auth:
                LoginView()
            case .home:
                // Stub for Home
                VStack {
                    Text("Home Screen")
                    Button("Simulate Logout") {
                        try? Auth.auth().signOut()
                        appState = .auth
                    }
                }
            }
        }
    }
    
    private func checkSession() {
        // Simulate a brief loading delay for session restore
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            determineNextState()
        }
    }
    
    private func determineNextState() {
        if isFirstLaunch {
            withAnimation {
                appState = .onboarding
            }
        } else {
            if Auth.auth().currentUser != nil {
                withAnimation {
                    appState = .home
                }
            } else {
                withAnimation {
                    appState = .auth
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
