package com.solutioncrafts.safeme.network

import com.google.firebase.auth.FirebaseAuth
import com.solutioncrafts.safeme.auth.AuthRepository
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        // If we get a 401 Unauthorized, we handle token SDK revocation.
        if (response.code == 401) {
            // Force sign out local Firebase User
            FirebaseAuth.getInstance().signOut()
            
            // Notify AuthRepository or global session state
            AuthRepository.getInstance().forceSignOut()

            // Do not retry the request by returning null
            return null
        }
        return null
    }
}
