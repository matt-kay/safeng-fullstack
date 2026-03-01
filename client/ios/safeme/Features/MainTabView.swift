import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Int = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            SafetyHomeView()
                .tabItem {
                    Label("Home", systemImage: "shield.lefthalf.filled")
                }
                .tag(0)
            
            VehicleCheckView()
                .tabItem {
                    Label("Check", systemImage: "car.2.fill")
                }
                .tag(1)
            
            TripGuardView()
                .tabItem {
                    Label("Protect", systemImage: "bolt.shield.fill")
                }
                .tag(2)
            
            IncidentsView()
                .tabItem {
                    Label("Report", systemImage: "exclamationmark.bubble.fill")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle.fill")
                }
                .tag(4)
        }
        .accentColor(Color(hex: "#014342"))
    }
}

#Preview {
    MainTabView()
}
