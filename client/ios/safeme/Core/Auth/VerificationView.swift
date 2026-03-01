import SwiftUI
import FirebaseAuth

struct VerificationView: View {
    let verificationID: String
    let phoneNumber: String
    
    @State private var otpCode: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    
    @State private var navigateToHome: Bool = false
    @State private var navigateToSetupProfile: Bool = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Verify your number")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Enter the 6-digit code sent to \(phoneNumber)")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            TextField("000000", text: $otpCode)
                .keyboardType(.numberPad)
                .font(.largeTitle)
                .multilineTextAlignment(.center)
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
                .padding(.horizontal, 40)
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.footnote)
            }
            
            Button(action: verifyCode) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Verify")
                        .fontWeight(.bold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(otpCode.count == 6 ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
            }
            .disabled(otpCode.count != 6 || isLoading)
            .padding(.horizontal)
            
            Spacer()
            
            // Navigation Links
            NavigationLink(
                destination: Text("Home Screen"), // Replace with actual HomeView later
                isActive: $navigateToHome,
                label: { EmptyView() }
            )
            NavigationLink(
                destination: SetupProfileView(phoneNumber: phoneNumber),
                isActive: $navigateToSetupProfile,
                label: { EmptyView() }
            )
        }
        .padding(.top, 40)
    }
    
    private func verifyCode() {
        guard otpCode.count == 6 else { return }
        
        isLoading = true
        errorMessage = nil
        
        let credential = PhoneAuthProvider.provider().credential(
            withVerificationID: verificationID,
            verificationCode: otpCode
        )
        
        Auth.auth().signIn(with: credential) { authResult, error in
            if let error = error {
                isLoading = false
                errorMessage = error.localizedDescription
                return
            }
            
            // Successfully authenticated with Firebase
            // Now check if user profile exists via backend API
            checkUserProfileExists()
        }
    }
    
    private func checkUserProfileExists() {
        // Stub implementation for backend check
        // In a real scenario, this would call GET /api/v1/me
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isLoading = false
            // For demonstration, let's assume we go to Setup Profile
            self.navigateToSetupProfile = true
        }
    }
}
