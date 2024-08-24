package com.vipcommunication.evonybubble

import android.app.Activity
import android.content.Context
import android.os.Build
import android.util.Log
import android.view.Display
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ScreenStatusModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ScreenStatusModule"
    }

    @ReactMethod
    fun getScreenStatus(promise: Promise) {
        Log.d("ScreenStatusModule", "getScreenStatus called")
        try {
            val windowManager = reactContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            val display: Display? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                reactContext.display
            } else {
                @Suppress("DEPRECATION")
                windowManager.defaultDisplay
            }

            if (display == null) {
                Log.e("ScreenStatusModule", "Display is null")
                promise.resolve("off")
                return
            }

            val state = display.state
            Log.d("ScreenStatusModule", "Display state: $state")
            if (state == Display.STATE_ON || state == Display.STATE_UNKNOWN) {
                promise.resolve("on")
            } else {
                promise.resolve("off")
            }
        } catch (e: Exception) {
            Log.e("ScreenStatusModule", "Error in getScreenStatus", e)
            promise.reject("Error", e)
        }
    }
}
