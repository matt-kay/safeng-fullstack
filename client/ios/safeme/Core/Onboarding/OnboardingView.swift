import SwiftUI

struct OnboardingSlide: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let imageName: String
}

struct OnboardingView: View {
    @AppStorage("isFirstLaunch") var isFirstLaunch: Bool = true
    @State private var currentPage = 0
    
    let slides: [OnboardingSlide] = [
        OnboardingSlide(title: "Safe", description: "Crowdsourced transport safety at your fingertips.", imageName: "shield.fill"),
        OnboardingSlide(title: "Alert", description: "Real-time warnings about transport-related crimes.", imageName: "exclamationmark.triangle.fill"),
        OnboardingSlide(title: "Community-Driven", description: "A network of users looking out for each other.", imageName: "person.3.fill")
    ]
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(0..<slides.count, id: \.self) { index in
                    VStack(spacing: 20) {
                        Spacer()
                        
                        Image(systemName: slides[index].imageName)
                            .resizable()
                            .scaledToFit()
                            .frame(width: 150, height: 150)
                            .foregroundColor(.blue)
                        
                        Text(slides[index].title)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text(slides[index].description)
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .always))
            
            // Navigation Buttons
            HStack {
                if currentPage < slides.count - 1 {
                    Button("Skip") {
                        completeOnboarding()
                    }
                    .padding()
                    
                    Spacer()
                    
                    Button("Next") {
                        withAnimation {
                            currentPage += 1
                        }
                    }
                    .padding()
                } else {
                    Button(action: {
                        completeOnboarding()
                    }) {
                        Text("Get Started")
                            .fontWeight(.bold)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.bottom, 20)
        }
    }
    
    private func completeOnboarding() {
        isFirstLaunch = false
    }
}

#Preview {
    OnboardingView()
}
