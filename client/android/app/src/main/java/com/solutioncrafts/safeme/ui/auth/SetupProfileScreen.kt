package com.solutioncrafts.safeme.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun SetupProfileScreen(
    phoneNumber: String,
    onNavigateToHome: () -> Unit
) {
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    val isFormValid = firstName.isNotEmpty() && lastName.isNotEmpty() && email.contains("@")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))

        Text(
            text = "Complete Your Profile",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
        )

        Spacer(modifier = Modifier.height(32.dp))

        OutlinedTextField(
            value = firstName,
            onValueChange = { firstName = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("First Name") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = lastName,
            onValueChange = { lastName = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Last Name") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Words)
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email Address") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
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

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                if (isFormValid) {
                    isLoading = true
                    errorMessage = null

                    // Stub backend profile creation API
                    coroutineScope.launch {
                        delay(1500)
                        isLoading = false
                        onNavigateToHome()
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
                .padding(bottom = 24.dp),
            enabled = isFormValid && !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Text("Complete Setup", fontWeight = FontWeight.Bold)
            }
        }
    }
}
