import Foundation
import FirebaseAuth
import SwiftUI

#if canImport(Observation)
import Observation

@Observable
class AuthManager {
    static let shared = AuthManager()
    
    var isAuthenticated: Bool = false
    var userProfile: UserProfile? = nil
    var isCheckingAuthStatus: Bool = true
    
    private var authStateHandle: AuthStateDidChangeListenerHandle?
    
    private init() {
        startListeningToAuthState()
        
        // Emulators Setup (only in DEBUG mode)
        #if DEBUG
        // Auth.auth().useEmulator(withHost: "127.0.0.1", port: 9099)
        #endif
    }
    
    private func startListeningToAuthState() {
        authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] auth, user in
            guard let self = self else { return }
            
            DispatchQueue.main.async {
                if let _ = user {
                    self.isAuthenticated = true
                    // In a full implementation, trigger a fetch of `/api/v1/me/profile`.
                    // We can set self.userProfile by querying the backend here.
                } else {
                    self.isAuthenticated = false
                    self.userProfile = nil
                    self.clearSession()
                }
                self.isCheckingAuthStatus = false
            }
        }
    }
    
    /// Called when the AuthInterceptor or APIClient receives a 401 Unauthorized globally.
    func forceSignOut() {
        do {
            try Auth.auth().signOut()
            DispatchQueue.main.async {
                self.isAuthenticated = false
                self.userProfile = nil
            }
            clearSession()
        } catch {
            print("Error signing out: \(error.localizedDescription)")
        }
    }
    
    private func clearSession() {
        // Clear User Defaults, Keychain, or other locally cached session data
        UserDefaults.standard.removeObject(forKey: "user_session")
    }
    
    deinit {
        if let handle = authStateHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }
}

// User Profile model mapping to backend's /api/v1/me/profile response
struct UserProfile: Codable, Identifiable {
    var id: String { uid }
    let uid: String
    let phoneNumber: String
    let email: String?
    let name: String?
}

#endif
