package com.solutioncrafts.safeme

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.solutioncrafts.safeme.data.preferences.AppPreferences
import com.solutioncrafts.safeme.ui.auth.LoginScreen
import com.solutioncrafts.safeme.ui.auth.SetupProfileScreen
import com.solutioncrafts.safeme.ui.auth.VerificationScreen
import com.solutioncrafts.safeme.ui.features.MainScreen
import com.solutioncrafts.safeme.ui.onboarding.OnboardingScreen
import com.solutioncrafts.safeme.ui.splash.WelcomeViewModel
import com.solutioncrafts.safeme.ui.theme.SafeMeTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Handle the splash screen transition.
        val splashScreen = installSplashScreen()
        
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        val appPreferences = AppPreferences(applicationContext)

        setContent {
            SafeMeTheme {
                val viewModelFactory = object : ViewModelProvider.Factory {
                    override fun <T : ViewModel> create(modelClass: Class<T>): T {
                        return WelcomeViewModel(appPreferences) as T
                    }
                }
                val welcomeViewModel: WelcomeViewModel = viewModel(factory = viewModelFactory)
                val isLoading by welcomeViewModel.isLoading.collectAsState()
                val startDestination by welcomeViewModel.startDestination.collectAsState()
                val coroutineScope = rememberCoroutineScope()

                // Keep the splash screen visible for this Activity
                splashScreen.setKeepOnScreenCondition { isLoading }

                if (!isLoading) {
                    val navController = rememberNavController()
                    
                    Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                        NavHost(
                            navController = navController,
                            startDestination = startDestination,
                            modifier = Modifier.padding(innerPadding)
                        ) {
                            composable("splash") {
                                // Fallback, shouldn't be reached as splash is handled natively
                            }
                            composable("onboarding") {
                                OnboardingScreen(
                                    onFinish = {
                                        coroutineScope.launch {
                                            appPreferences.setFirstTimeInstallCompleted()
                                            navController.navigate("login") {
                                                popUpTo("onboarding") { inclusive = true }
                                            }
                                        }
                                    }
                                )
                            }
                            composable("login") {
                                LoginScreen(
                                    onNavigateToVerify = { verificationId, phone ->
                                        // Need to clear backstack if necessary, but leaving as is for a normal push
                                        navController.navigate("verification/$verificationId/$phone")
                                    }
                                )
                            }
                            composable("verification/{verificationId}/{phone}") { backStackEntry ->
                                val verificationId = backStackEntry.arguments?.getString("verificationId") ?: ""
                                val phone = backStackEntry.arguments?.getString("phone") ?: ""
                                VerificationScreen(
                                    verificationId = verificationId,
                                    phoneNumber = phone,
                                    onNavigateToHome = {
                                        navController.navigate("home") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    },
                                    onNavigateToSetupProfile = { p ->
                                        navController.navigate("setup_profile/$p") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    }
                                )
                            }
                            composable("setup_profile/{phone}") { backStackEntry ->
                                val phone = backStackEntry.arguments?.getString("phone") ?: ""
                                SetupProfileScreen(
                                    phoneNumber = phone,
                                    onNavigateToHome = {
                                        navController.navigate("home") {
                                            popUpTo("login") { inclusive = true }
                                        }
                                    }
                                )
                            }
                            composable("home") {
                                MainScreen()
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    SafeMeTheme {
        Greeting("Android")
    }
}