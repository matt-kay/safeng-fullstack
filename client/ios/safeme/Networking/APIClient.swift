import Foundation

enum NetworkEnvironment {
    case dev
    case staging
    case prod
}

struct APIEndpoint {
    var path: String
    var method: String = "GET"
    var queryItems: [URLQueryItem]? = nil
    var body: Data? = nil
    
    // Default config values
    static var environment: NetworkEnvironment = .dev
    
    static var baseURL: String {
        switch environment {
        case .dev:
            // Since we use the emulator locally for Auth, we assume a local or standard dev URL
            // Adjust to the right IP or localhost depending on simulator vs real device
            return "http://127.0.0.1:3000/api/v1"
        case .staging:
            return "https://staging.safeme.app/api/v1"
        case .prod:
            return "https://api.safeme.app/api/v1"
        }
    }
}

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case unauthorized
    case invalidResponse
    case decodingError(Error)
    case serverError(Int)
}

class APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func request<T: Decodable>(_ endpoint: APIEndpoint, responseType: T.Type) async throws -> T {
        guard var urlComponents = URLComponents(string: APIEndpoint.baseURL + endpoint.path) else {
            throw APIError.invalidURL
        }
        
        if let queryItems = endpoint.queryItems {
            urlComponents.queryItems = queryItems
        }
        
        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if let body = endpoint.body {
            request.httpBody = body
        }
        
        // Inject Auth Token
        request = try await AuthInterceptor.shared.intercept(request)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        if httpResponse.statusCode == 401 {
            AuthManager.shared.forceSignOut()
            throw APIError.unauthorized
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw APIError.serverError(httpResponse.statusCode)
        }
        
        do {
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }
}
