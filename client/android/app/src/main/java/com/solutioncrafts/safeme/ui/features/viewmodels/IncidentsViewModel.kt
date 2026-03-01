package com.solutioncrafts.safeme.ui.features.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.solutioncrafts.safeme.data.network.CreateIncidentRequest
import com.solutioncrafts.safeme.data.network.IncidentResponse
import com.solutioncrafts.safeme.data.network.NetworkClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class IncidentsViewModel : ViewModel() {
    private val _nearbyIncidents = MutableStateFlow<List<IncidentResponse>>(emptyList())
    val nearbyIncidents: StateFlow<List<IncidentResponse>> = _nearbyIncidents

    private val _isSubmitting = MutableStateFlow(false)
    val isSubmitting: StateFlow<Boolean> = _isSubmitting

    private val _submissionSuccess = MutableStateFlow(false)
    val submissionSuccess: StateFlow<Boolean> = _submissionSuccess

    fun fetchNearbyIncidents(lat: Double, lng: Double) {
        viewModelScope.launch {
            try {
                val incidents = NetworkClient.apiService.getNearbyIncidents(lat, lng)
                _nearbyIncidents.value = incidents
            } catch (e: Exception) {
                // handle error
            }
        }
    }

    fun reportIncident(
        type: String,
        description: String,
        lat: Double,
        lng: Double,
        city: String,
        plate: String? = null
    ) {
        viewModelScope.launch {
            _isSubmitting.value = true
            _submissionSuccess.value = false
            try {
                val request = CreateIncidentRequest(
                    type = type,
                    description = description,
                    lat = lat,
                    lng = lng,
                    reporter_hash = "simulated_reporter_hash",
                    city = city,
                    plate = plate
                )
                NetworkClient.apiService.createIncident(request)
                _submissionSuccess.value = true
            } catch (e: Exception) {
                // handle error
            } finally {
                _isSubmitting.value = false
            }
        }
    }
}
