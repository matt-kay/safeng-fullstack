package com.solutioncrafts.safeme.data.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {
    @GET("risk/tiles")
    suspend fun getRiskTiles(
        @Query("city") city: String,
        @Query("bbox") bbox: String,
        @Query("zoom") zoom: Int,
        @Query("timebucket") timeBucket: String? = null
    ): List<RiskTileResponse>

    @GET("risk/here")
    suspend fun getRiskHere(
        @Query("city") city: String,
        @Query("lat") lat: Double,
        @Query("lng") lng: Double
    ): RiskHereResponse

    @POST("vehicle/check")
    suspend fun checkVehicle(
        @Body request: VehicleCheckRequest
    ): VehicleCheckResponse

    @POST("trip-guard/start")
    suspend fun startTrip(
        @Body request: StartTripRequest
    ): TripResponse

    @POST("trip-guard/telemetry")
    suspend fun sendTelemetry(
        @Body request: TelemetryBatchRequest
    ): TelemetryResponse

    @POST("trip-guard/panic")
    suspend fun triggerPanic(
        @Body request: PanicRequest
    ): Map<String, String>

    @POST("incidents")
    suspend fun createIncident(
        @Body request: CreateIncidentRequest
    ): IncidentResponse

    @GET("incidents/nearby")
    suspend fun getNearbyIncidents(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius") radiusKm: Double = 5.0
    ): List<IncidentResponse>
}

data class CreateIncidentRequest(
    val type: String,
    val description: String,
    val lat: Double,
    val lng: Double,
    val reporter_hash: String,
    val city: String,
    val plate: String? = null
)

data class IncidentResponse(
    val id: String,
    val type: String,
    val description: String,
    val lat: Double,
    val lng: Double,
    val status: String,
    val timestamp: String,
    val verificationCount: Int
)

data class StartTripRequest(
    val city: String,
    val transportType: String,
    val destination: Destination? = null
)

data class Destination(
    val lat: Double,
    val lng: Double,
    val address: String? = null
)

data class TripResponse(
    val tripId: String,
    val startTime: String,
    val initialRiskScore: Double
)

data class TelemetryBatchRequest(
    val tripId: String,
    val user_id_hash: String,
    val reports: List<TelemetryReport>
)

data class TelemetryReport(
    val lat: Double,
    val lng: Double,
    val timestamp: String,
    val sensorData: Map<String, Double>? = null
)

data class TelemetryResponse(
    val anomalyDetected: Boolean,
    val riskScore: Double,
    val actions: List<String>? = null
)

data class PanicRequest(
    val tripId: String,
    val lat: Double,
    val lng: Double
)

data class VehicleCheckRequest(
    val city: String,
    val plate: String? = null,
    val platePartial: String? = null,
    val vehicleMake: String? = null,
    val vehicleColor: String? = null,
    val transportType: String? = null
)

data class VehicleCheckResponse(
    val trustScore: Int,
    val sightingsCount: Int,
    val linkedIncidentCount: Int,
    val matchConfidence: Double
)

data class RiskTileResponse(
    val gridCellId: String,
    val riskScore: Double,
    val riskLevel: String,
    val centroid: Centroid
)

data class RiskHereResponse(
    val riskScore: Double,
    val riskLevel: String,
    val gridCellId: String
)

data class Centroid(
    val lat: Double,
    val lng: Double
)
