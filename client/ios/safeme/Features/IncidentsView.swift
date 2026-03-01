import SwiftUI

struct IncidentsView: View {
    @StateObject private var viewModel = IncidentsViewModel()
    @State private var type = "Safety Hazard"
    @State private var description = ""
    
    let types = ["Hazard", "Crime", "Accident"]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 30) {
                Text("Report Incident")
                    .font(.system(size: 28, weight: .bold))
                
                VStack(alignment: .leading, spacing: 10) {
                    Text("INCIDENT TYPE")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Picker("Type", selection: $type) {
                        ForEach(types, id: \.self) {
                            Text($0)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                .padding(.horizontal)
                
                VStack(alignment: .leading, spacing: 10) {
                    Text("DESCRIPTION")
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    TextEditor(text: $description)
                        .frame(height: 150)
                        .padding(8)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(12)
                }
                .padding(.horizontal)
                
                Button(action: {
                    Task {
                        await viewModel.reportIncident(type: type, description: description, lat: 9.0765, lng: 7.3986, city: "Abuja")
                    }
                }) {
                    if viewModel.isSubmitting {
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else if viewModel.submissionSuccess {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Report Submitted")
                        }
                        .foregroundColor(.black)
                    } else {
                        Text("Submit Report")
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(viewModel.submissionSuccess ? Color(hex: "#74E7B2") : Color(hex: "#014342"))
                .cornerRadius(15)
                .padding(.horizontal)
                .disabled(description.isEmpty || viewModel.isSubmitting || viewModel.submissionSuccess)
                
                if viewModel.submissionSuccess {
                    Text("Thank you for keeping Abuja safe.")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            .padding(.top, 40)
        }
    }
}
