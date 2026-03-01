import SwiftUI
import FirebaseAuth

struct SetupProfileView: View {
    let phoneNumber: String
    
    @State private var firstName: String = ""
    @State private var lastName: String = ""
    @State private var email: String = ""
    
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var navigateToHome: Bool = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Complete Your Profile")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 15) {
                TextField("First Name", text: $firstName)
                    .autocapitalization(.words)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                
                TextField("Last Name", text: $lastName)
                    .autocapitalization(.words)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                
                TextField("Email Address", text: $email)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
            }
            .padding(.horizontal)
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.footnote)
            }
            
            Button(action: saveProfile) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Complete Setup")
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isFormValid ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .disabled(!isFormValid || isLoading)
            .padding(.horizontal)
            
            Spacer()
            
            NavigationLink(
                destination: Text("Home Screen"), // Replace with actual HomeView
                isActive: $navigateToHome,
                label: { EmptyView() }
            )
        }
        .padding(.top, 40)
        .navigationBarBackButtonHidden(true)
    }
    
    private var isFormValid: Bool {
        return !firstName.isEmpty && !lastName.isEmpty && email.contains("@")
    }
    
    private func saveProfile() {
        isLoading = true
        errorMessage = nil
        
        // Stub implementation for creating user profile
        // In a real scenario, this would call POST /api/v1/users/profile
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isLoading = false
            self.navigateToHome = true
        }
    }
}
