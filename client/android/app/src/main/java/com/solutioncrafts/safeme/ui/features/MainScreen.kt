package com.solutioncrafts.safeme.ui.features

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("safety_home", "Home", Icons.Default.Shield)
    object VehicleCheck : Screen("vehicle_check", "Check", Icons.Default.DirectionsCar)
    object TripGuard : Screen("trip_guard", "Protect", Icons.Default.Security)
    object Incidents : Screen("incidents", "Report", Icons.Default.Report)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val items = listOf(
        Screen.Home,
        Screen.VehicleCheck,
        Screen.TripGuard,
        Screen.Incidents,
        Screen.Profile
    )
    
    var selectedItem by remember { mutableIntStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                contentColor = Color(0xFF014342)
            ) {
                items.forEachIndexed { index, screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title) },
                        selected = selectedItem == index,
                        onClick = {
                            selectedItem = index
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF014342),
                            unselectedIconColor = Color.Gray,
                            indicatorColor = Color(0xFF74E7B2).copy(alpha = 0.2f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) { SafetyHomeScreen() }
            composable(Screen.VehicleCheck.route) { VehicleCheckScreen() }
            composable(Screen.TripGuard.route) { TripGuardScreen() }
            composable(Screen.Incidents.route) { IncidentsScreen() }
            composable(Screen.Profile.route) { ProfileScreen() }
        }
    }
}
