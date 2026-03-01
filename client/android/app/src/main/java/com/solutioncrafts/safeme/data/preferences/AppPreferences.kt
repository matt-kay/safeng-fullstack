package com.solutioncrafts.safeme.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// Setting up DataStore extension property
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class AppPreferences(private val context: Context) {
    
    companion object {
        private val IS_FIRST_TIME_INSTALL = booleanPreferencesKey("is_first_time_install")
    }
    
    val isFirstTimeInstall: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            // Default to true if not set yet
            preferences[IS_FIRST_TIME_INSTALL] ?: true
        }
        
    suspend fun setFirstTimeInstallCompleted() {
        context.dataStore.edit { preferences ->
            preferences[IS_FIRST_TIME_INSTALL] = false
        }
    }
}
