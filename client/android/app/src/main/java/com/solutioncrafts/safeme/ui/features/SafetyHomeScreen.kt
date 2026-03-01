package com.solutioncrafts.safeme.ui.features

import androidx.compose.foundation.background
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.solutioncrafts.safeme.ui.features.viewmodels.SafetyHomeViewModel

@Composable
fun SafetyHomeScreen(viewModel: SafetyHomeViewModel = viewModel()) {
    val riskTiles by viewModel.riskTiles.collectAsState()
    val userRisk by viewModel.userRisk.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.fetchRiskData("Abuja", "9.0,7.0,9.2,7.2", 12)
        viewModel.fetchCurrentLocationRisk("Abuja", 9.0765, 7.3986)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF014342)),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(color = Color.White)
        } else {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Safety Heatmap",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(20.dp))
                Text(
                    text = "Loaded ${riskTiles.size} grid cells",
                    color = Color.White.copy(alpha = 0.5f)
                )
                
                userRisk?.let {
                    Spacer(modifier = Modifier.height(32.dp))
                    Box(
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.1f))
                            .padding(16.dp)
                    ) {
                        Column {
                            Text("Current Area Risk", color = Color.Gray, fontSize = 12.sp)
                            Text(
                                "Score: ${it.riskScore} (${it.riskLevel})",
                                color = if (it.riskLevel == "high") Color.Red else Color(0xFF74E7B2)
                            )
                        }
                    }
                }
            }
        }
    }
}
