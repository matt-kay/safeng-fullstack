import Foundation
import FirebaseAuth

class AuthInterceptor {
    static let shared = AuthInterceptor()
    
    private init() {}
    
    /// Intercepts a generic `URLRequest` to attach the `Authorization` header containing the Firebase ID Token.
    /// - Parameter request: The original `URLRequest` to authorize.
    /// - Returns: An updated `URLRequest` with the token attached, or throws if unauthenticated.
    func intercept(_ request: URLRequest) async throws -> URLRequest {
        var mutableRequest = request
        
        guard let currentUser = Auth.auth().currentUser else {
            // Unauthenticated state
            throw APIError.unauthorized
        }
        
        do {
            let token = try await currentUser.getIDToken()
            mutableRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            return mutableRequest
        } catch {
            // Failed to fetch token, throw unauthorized to trigger global sign-out
            throw APIError.unauthorized
        }
    }
}
