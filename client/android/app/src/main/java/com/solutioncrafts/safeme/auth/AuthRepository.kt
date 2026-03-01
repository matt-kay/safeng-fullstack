package com.solutioncrafts.safeme.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

// A simplified model of the user state
data class UserSession(
    val isAuthenticated: Boolean = false,
    val firebaseUser: FirebaseUser? = null,
    val isFetchingProfile: Boolean = false
)

class AuthRepository private constructor() {

    private val auth = FirebaseAuth.getInstance()
    
    private val _userSession = MutableStateFlow(UserSession())
    val userSession: StateFlow<UserSession> = _userSession.asStateFlow()

    init {
        // Use emulator explicitly in Dev/Local mode if needed.
        // auth.useEmulator("10.0.2.2", 9099)
        
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                // User is signed in
                _userSession.value = UserSession(isAuthenticated = true, firebaseUser = user)
                
                // Here, you would normally launch a coroutine to fetch the backend profile /api/v1/me/profile
                // ProfileRepository.getInstance().fetchUserProfile()
            } else {
                // User is signed out
                _userSession.value = UserSession(isAuthenticated = false, firebaseUser = null)
            }
        }
    }

    /**
     * Called by TokenAuthenticator upon intercepting a global 401 response from the API.
     */
    fun forceSignOut() {
        auth.signOut()
        _userSession.value = UserSession(isAuthenticated = false, firebaseUser = null)
        
        // Also clear local DataStore or EncryptedSharedPreferences here
        // SessionDataStore.clearSession()
    }

    companion object {
        @Volatile
        private var INSTANCE: AuthRepository? = null

        fun getInstance(): AuthRepository {
            return INSTANCE ?: synchronized(this) {
                val instance = AuthRepository()
                INSTANCE = instance
                instance
            }
        }
    }
}
