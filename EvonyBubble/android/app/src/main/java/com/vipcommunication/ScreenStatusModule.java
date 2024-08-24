package com.evonybubble;

import android.app.Activity;
import android.content.Context;
import android.view.Display;
import android.view.WindowManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class ScreenStatusModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    ScreenStatusModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "ScreenStatusModule";
    }

    @ReactMethod
    public void getScreenStatus(Promise promise) {
        try {
            WindowManager windowManager = (WindowManager) reactContext.getSystemService(Context.WINDOW_SERVICE);
            Display display = windowManager.getDefaultDisplay();
            int state = display.getState();
            if (state == Display.STATE_ON || state == Display.STATE_UNKNOWN) {
                promise.resolve("on");
            } else {
                promise.resolve("off");
            }
        } catch (Exception e) {
            promise.reject("Error", e);
        }
    }
}
