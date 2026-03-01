package com.solutioncrafts.safeme.ui.features

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.OutlinedTextField
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay

@Composable
fun IncidentsScreen(viewModel: IncidentsViewModel = viewModel()) {
    var type by remember { mutableStateOf("Safety Hazard") }
    var description by remember { mutableStateOf("") }
    val isSubmitting by viewModel.isSubmitting.collectAsState()
    val success by viewModel.submissionSuccess.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Report Incident", fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("What did you see?", modifier = Modifier.fillMaxWidth(), fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.height(8.dp))
        
        // Incident Type Chooser (Simplified)
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Hazard", "Crime", "Accident").forEach { item ->
                FilterChip(
                    selected = type == item,
                    onClick = { type = item },
                    label = { Text(item) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Details (max 280 chars)") },
            modifier = Modifier.fillMaxWidth().height(150.dp)
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { viewModel.reportIncident(type, description, 9.0765, 7.3986, "Abuja") },
            modifier = Modifier.fillMaxWidth(),
            enabled = description.isNotBlank() && !isSubmitting,
            colors = ButtonDefaults.buttonColors(containerColor = if (success) Color(0xFF74E7B2) else Color(0xFF014342))
        ) {
            if (isSubmitting) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White)
            } else if (success) {
                Text("Report Submitted!", color = Color.Black)
            } else {
                Text("Submit Report", color = Color.White)
            }
        }

        if (success) {
            LaunchedEffect(Unit) {
                delay(3000)
                description = ""
                // Reset success state if needed
            }
        }
    }
}
