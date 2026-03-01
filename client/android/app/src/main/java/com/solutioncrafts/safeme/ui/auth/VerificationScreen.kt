package com.solutioncrafts.safeme.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun VerificationScreen(
    verificationId: String,
    phoneNumber: String,
    onNavigateToHome: () -> Unit,
    onNavigateToSetupProfile: (String) -> Unit
) {
    var otpCode by remember { mutableStateOf("") }
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
            text = "Verify your number",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Enter the 6-digit code sent to $phoneNumber",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = otpCode,
            onValueChange = { if (it.length <= 6) otpCode = it },
            modifier = Modifier.fillMaxWidth(0.8f),
            textStyle = LocalTextStyle.current.copy(
                textAlign = TextAlign.Center,
                fontSize = MaterialTheme.typography.headlineMedium.fontSize
            ),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            placeholder = {
                Text(
                    text = "000000",
                    modifier = Modifier.fillMaxWidth(),
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.headlineMedium
                )
            }
        )

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
                if (otpCode.length == 6) {
                    isLoading = true
                    errorMessage = null

                    // Stub verification and backend check
                    coroutineScope.launch {
                        delay(1500)
                        isLoading = false
                        // For demonstration, route to setup
                        onNavigateToSetupProfile(phoneNumber)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            enabled = otpCode.length == 6 && !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Verify", fontWeight = FontWeight.Bold)
            }
        }
    }
}
