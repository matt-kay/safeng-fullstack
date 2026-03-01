package com.solutioncrafts.safeme.ui.features

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solutioncrafts.safeme.ui.features.viewmodels.VehicleCheckViewModel

@Composable
fun VehicleCheckScreen(viewModel: VehicleCheckViewModel = viewModel()) {
    var plate by remember { mutableStateOf("") }
    val checkResult by viewModel.checkResult.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Check Vehicle",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(24.dp))
        OutlinedTextField(
            value = plate,
            onValueChange = { plate = it },
            label = { Text("Enter License Plate") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { viewModel.checkVehicle("Abuja", plate = plate) },
            modifier = Modifier.fillMaxWidth(),
            enabled = plate.isNotBlank() && !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF74E7B2), contentColor = Color.Black)
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.Black)
            } else {
                Text("Search Database")
            }
        }

        checkResult?.let { result ->
            Spacer(modifier = Modifier.height(32.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF014342).copy(alpha = 0.1f))
            ) {
                Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Trust Score", fontSize = 14.sp, color = Color.Gray)
                    Text(
                        "${result.trustScore}/100",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Black,
                        color = when {
                            result.trustScore > 70 -> Color(0xFF74E7B2)
                            result.trustScore > 40 -> Color(0xFFF57C00)
                            else -> Color.Red
                        }
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        InfoItem("Sightings", result.sightingsCount.toString())
                        InfoItem("Incidents", result.linkedIncidentCount.toString())
                        InfoItem("Confidence", "${(result.matchConfidence * 100).toInt()}%")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))
        
        Text(
            text = "Scan Plate with Camera",
            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
            color = Color.Gray
        )
    }
}

@Composable
fun InfoItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, fontSize = 10.sp, color = Color.Gray)
        Text(value, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}
