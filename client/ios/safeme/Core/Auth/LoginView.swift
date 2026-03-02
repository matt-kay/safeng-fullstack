import SwiftUI
import FirebaseAuth

struct LoginView: View {
    @State private var phoneNumber: String = ""
    @State private var countryCode: String = "+234"
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    @State private var navigateToVerify: Bool = false
    @State private var verificationID: String = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Enter your phone number")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Text("We will send a code to verify your number.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                HStack {
                    // Country Code Picker (Simplified)
                    Menu {
                        Button("+1 (US)") { countryCode = "+1" }
                        Button("+44 (UK)") { countryCode = "+44" }
                        Button("+234 (NG)") { countryCode = "+234" }
                    } label: {
                        Text(countryCode)
                            .foregroundColor(.primary)
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                    }
                    
                    TextField("Phone Number", text: $phoneNumber)
                        .keyboardType(.numberPad)
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
                
                Button(action: sendVerificationCode) {
                    if isLoading {
                        ProgressView()
                    } else {
                        Text("Continue")
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(phoneNumber.isEmpty ? Color.gray : Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                }
                .disabled(phoneNumber.isEmpty || isLoading)
                .padding(.horizontal)
                
                Spacer()
            }
            .navigationDestination(isPresented: $navigateToVerify) {
                VerificationView(verificationID: verificationID, phoneNumber: "\(countryCode)\(phoneNumber)")
            }
            .padding(.top, 40)
            .navigationBarHidden(true)
        }
    }
    
    private func sendVerificationCode() {
        guard !phoneNumber.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        let fullPhoneNumber = "\(countryCode)\(phoneNumber)"
        
        PhoneAuthProvider.provider().verifyPhoneNumber(fullPhoneNumber, uiDelegate: nil) { verificationID, error in
            isLoading = false
            
            if let error = error {
                errorMessage = error.localizedDescription
                return
            }
            
            if let verificationID = verificationID {
                // Save verificationID locally
                UserDefaults.standard.set(verificationID, forKey: "authVerificationID")
                self.verificationID = verificationID
                self.navigateToVerify = true
            }
        }
    }
}

#Preview {
    LoginView()
}
