package com.solutioncrafts.safeme.network

import com.google.android.gms.tasks.Tasks
import com.google.firebase.auth.FirebaseAuth
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()

        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser != null) {
            try {
                // Fetch the ID token synchronously block thread until it completes
                val task = currentUser.getIdToken(false)
                val result = Tasks.await(task)
                val token = result.token

                if (token != null) {
                    request = request.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                }
            } catch (e: Exception) {
                // Token fetch failed, proceed without token or handle error
                e.printStackTrace()
            }
        }

        return chain.proceed(request)
    }
}
