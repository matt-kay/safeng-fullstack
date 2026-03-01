package com.solutioncrafts.safeme.ui.splash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solutioncrafts.safeme.data.preferences.AppPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class WelcomeViewModel(private val appPreferences: AppPreferences) : ViewModel() {

    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    private val _startDestination = MutableStateFlow("splash")
    val startDestination = _startDestination.asStateFlow()

    init {
        viewModelScope.launch {
            appPreferences.isFirstTimeInstall.collect { isFirstTime ->
                if (isFirstTime) {
                    _startDestination.value = "onboarding"
                } else {
                    _startDestination.value = "login"
                }
                _isLoading.value = false
            }
        }
    }
}
