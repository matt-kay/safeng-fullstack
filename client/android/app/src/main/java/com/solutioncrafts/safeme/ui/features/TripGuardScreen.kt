package com.solutioncrafts.safeme.ui.features

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solutioncrafts.safeme.ui.features.viewmodels.TripGuardViewModel

@Composable
fun TripGuardScreen(viewModel: TripGuardViewModel = viewModel()) {
    val isMonitoring by viewModel.isMonitoring.collectAsState()
    val tripId by viewModel.tripId.collectAsState()
    val currentRisk by viewModel.currentRisk.collectAsState()
    val anomalyDetected by viewModel.anomalyDetected.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (!isMonitoring) {
            Text(
                text = "Trip Guard",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Active protection during your commute.",
                textAlign = TextAlign.Center,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(48.dp))
            Button(
                onClick = { viewModel.startMonitoring("Abuja", "Bolt/Uber") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF74E7B2), contentColor = Color.Black)
            ) {
                Text("Start Secure Trip", fontWeight = FontWeight.Bold)
            }
        } else {
            // Active Monitoring UI
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .background(
                        color = if (anomalyDetected) Color.Red.copy(alpha = 0.2f) else Color(0xFF74E7B2).copy(alpha = 0.2f),
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (anomalyDetected) "ANOMALY!" else "SECURE",
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        color = if (anomalyDetected) Color.Red else Color(0xFF014342)
                    )
                    Text(
                        text = "RISK: ${String.format("%.1f", currentRisk)}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(48.dp))
            
            Button(
                onClick = { viewModel.triggerPanic() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Red, contentColor = Color.White)
            ) {
                Text("SEND SOS SIGNAL", fontWeight = FontWeight.Black, fontSize = 18.sp)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(onClick = { viewModel.stopMonitoring() }) {
                Text("End Trip", color = Color.Gray)
            }
        }
    }
}
