package com.financefriend.app;

import android.graphics.Color;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private WindowInsetsControllerCompat insetsController;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);

        // Set initial colors to match light theme
        int lightBg = Color.parseColor("#F5F7F5");
        window.setStatusBarColor(lightBg);
        window.setNavigationBarColor(lightBg);

        // Set light status bar and nav bar (dark icons for light background)
        insetsController = WindowCompat.getInsetsController(window, window.getDecorView());
        insetsController.setAppearanceLightStatusBars(true);
        insetsController.setAppearanceLightNavigationBars(true);
    }

    @Override
    public void onStart() {
        super.onStart();
        // Add JavaScript interface for navigation bar color control
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new NavBarBridge(), "AndroidNavBar");
    }

    private class NavBarBridge {
        @JavascriptInterface
        public void setColor(String hexColor, boolean lightButtons) {
            runOnUiThread(() -> {
                Window window = getWindow();
                try {
                    int color = Color.parseColor(hexColor);
                    window.setNavigationBarColor(color);
                    if (insetsController != null) {
                        insetsController.setAppearanceLightNavigationBars(!lightButtons);
                    }
                } catch (Exception e) {
                    // Ignore invalid color
                }
            });
        }
    }
}
