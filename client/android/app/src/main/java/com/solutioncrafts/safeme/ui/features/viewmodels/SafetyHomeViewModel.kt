package com.solutioncrafts.safeme.ui.features.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solutioncrafts.safeme.data.network.NetworkClient
import com.solutioncrafts.safeme.data.network.RiskHereResponse
import com.solutioncrafts.safeme.data.network.RiskTileResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SafetyHomeViewModel : ViewModel() {
    private val _riskTiles = MutableStateFlow<List<RiskTileResponse>>(emptyList())
    val riskTiles: StateFlow<List<RiskTileResponse>> = _riskTiles

    private val _userRisk = MutableStateFlow<RiskHereResponse?>(null)
    val userRisk: StateFlow<RiskHereResponse?> = _userRisk

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    fun fetchRiskData(city: String, bbox: String, zoom: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val tiles = NetworkClient.apiService.getRiskTiles(city, bbox, zoom)
                _riskTiles.value = tiles
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun fetchCurrentLocationRisk(city: String, lat: Double, lng: Double) {
        viewModelScope.launch {
            try {
                val risk = NetworkClient.apiService.getRiskHere(city, lat, lng)
                _userRisk.value = risk
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
