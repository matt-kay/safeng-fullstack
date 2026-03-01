package com.solutioncrafts.safeme.ui.features.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solutioncrafts.safeme.data.network.NetworkClient
import com.solutioncrafts.safeme.data.network.VehicleCheckRequest
import com.solutioncrafts.safeme.data.network.VehicleCheckResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class VehicleCheckViewModel : ViewModel() {
    private val _checkResult = MutableStateFlow<VehicleCheckResponse?>(null)
    val checkResult: StateFlow<VehicleCheckResponse?> = _checkResult

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    fun checkVehicle(city: String, plate: String? = null, platePartial: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val request = VehicleCheckRequest(
                    city = city,
                    plate = plate,
                    platePartial = platePartial
                )
                val response = NetworkClient.apiService.checkVehicle(request)
                _checkResult.value = response
            } catch (e: Exception) {
                // handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}
