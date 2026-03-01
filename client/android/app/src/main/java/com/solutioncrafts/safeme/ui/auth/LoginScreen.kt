package com.solutioncrafts.safeme.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    onNavigateToVerify: (String, String) -> Unit
) {
    var phoneNumber by remember { mutableStateOf("") }
    var countryCode by remember { mutableStateOf("+234") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))
        
        Text(
            text = "Enter your phone number",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "We will send a code to verify your number.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Simplified country code (could use an ExposedDropdownMenuBox)
            OutlinedTextField(
                value = countryCode,
                onValueChange = { countryCode = it },
                modifier = Modifier.weight(0.3f),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it },
                modifier = Modifier.weight(0.7f),
                label = { Text("Phone Number") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (errorMessage != null) {
            Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        Button(
            onClick = {
                if (phoneNumber.isNotEmpty()) {
                    isLoading = true
                    errorMessage = null
                    
                    // Stub Firebase Auth PhoneVerification
                    coroutineScope.launch {
                        delay(1500) // Simulate network delay
                        isLoading = false
                        val verificationId = "dummy-verification-id"
                        onNavigateToVerify(verificationId, "$countryCode$phoneNumber")
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            enabled = phoneNumber.isNotEmpty() && !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Continue", fontWeight = FontWeight.Bold)
            }
        }
    }
}
