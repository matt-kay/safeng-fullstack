package com.solutioncrafts.safeme.ui.features.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solutioncrafts.safeme.data.network.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.*

class TripGuardViewModel : ViewModel() {
    private val _tripId = MutableStateFlow<String?>(null)
    val tripId: StateFlow<String?> = _tripId

    private val _currentRisk = MutableStateFlow(0.0)
    val currentRisk: StateFlow<Double> = _currentRisk

    private val _isMonitoring = MutableStateFlow(false)
    val isMonitoring: StateFlow<Boolean> = _isMonitoring

    private val _anomalyDetected = MutableStateFlow(false)
    val anomalyDetected: StateFlow<Boolean> = _anomalyDetected

    private var telemetryJob: Job? = null

    fun startMonitoring(city: String, transportType: String) {
        viewModelScope.launch {
            try {
                val startRequest = StartTripRequest(city, transportType)
                val response = NetworkClient.apiService.startTrip(startRequest)
                _tripId.value = response.tripId
                _currentRisk.value = response.initialRiskScore
                _isMonitoring.value = true
                startTelemetryLoop()
            } catch (e: Exception) {
                // handle error
            }
        }
    }

    private fun startTelemetryLoop() {
        telemetryJob?.cancel()
        telemetryJob = viewModelScope.launch {
            while (_isMonitoring.value) {
                delay(10000) // Send telemetry every 10 seconds
                sendTelemetry()
            }
        }
    }

    private suspend fun sendTelemetry() {
        val tripId = _tripId.value ?: return
        try {
            val report = TelemetryReport(
                lat = 9.0765 + (Math.random() - 0.5) * 0.01,
                lng = 7.3986 + (Math.random() - 0.5) * 0.01,
                timestamp = Date().toString()
            )
            val batch = TelemetryBatchRequest(
                tripId = tripId,
                user_id_hash = "simulated_hash",
                reports = listOf(report)
            )
            val response = NetworkClient.apiService.sendTelemetry(batch)
            _currentRisk.value = response.riskScore
            if (response.anomalyDetected) {
                _anomalyDetected.value = true
            }
        } catch (e: Exception) {
            // handle error
        }
    }

    fun triggerPanic() {
        viewModelScope.launch {
            val tripId = _tripId.value ?: return@launch
            try {
                NetworkClient.apiService.triggerPanic(
                    PanicRequest(tripId, 9.0765, 7.3986)
                )
                // Panic triggered
            } catch (e: Exception) {
                // handle error
            }
        }
    }

    fun stopMonitoring() {
        _isMonitoring.value = false
        telemetryJob?.cancel()
        _tripId.value = null
    }
}
