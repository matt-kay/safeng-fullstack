import SwiftUI

struct ProfileView: View {
    var body: some View {
        List {
            Section(header: Text("Account Details")) {
                Text("Name: John Doe")
                Text("Email: john.doe@example.com")
            }
            
            Section(header: Text("Safety Settings")) {
                Text("Emergency Contacts")
                Text("Report History")
            }
            
            Section {
                Button("Logout") {
                    // Logout logic
                }
                .foregroundColor(.red)
            }
        }
        .listStyle(InsetGroupedListStyle())
        .navigationTitle("Profile")
    }
}
