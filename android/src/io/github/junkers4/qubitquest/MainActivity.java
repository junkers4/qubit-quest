package io.github.junkers4.qubitquest;

import android.app.Activity;
import android.graphics.Insets;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.DisplayCutout;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/**
 * The whole app: the web game (assets/index.html and assets/src, the same files as the web
 * version) in a full-screen WebView. Progress is kept by the game in localStorage, which the
 * WebView keeps on the phone. The back button is the game's Esc; on the title screen it
 * leaves the app. The game stays inside the safe area: never under a camera cut-out, the
 * status bar's place or the gesture bar (Android 15 draws apps edge to edge).
 */
public class MainActivity extends Activity {
    static final String TAG = "qubit-quest";
    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(0xff0d0c0b);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // localStorage: the stars
        s.setAllowFileAccess(true);             // the game's own files
        s.setAllowContentAccess(false);
        s.setTextZoom(100);                     // the pixel font is drawn on a canvas
        s.setBuiltInZoomControls(false);
        s.setSupportZoom(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.startsWith("file:///android_asset/"); // nothing from elsewhere
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                // for the tests (logcat): which simulator core runs, and how many levels
                view.evaluateJavascript("QQ.engine + ' ' + QQ.LEVELS.length", new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        Log.i(TAG, "ready " + value);
                    }
                });
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage m) {
                // the game's own errors reach logcat (the tests fail on them)
                if (m.messageLevel() == ConsoleMessage.MessageLevel.ERROR)
                    Log.e(TAG, "console error: " + m.message() + " (" + m.sourceId() + ":" + m.lineNumber() + ")");
                return true;
            }
        });
        if (state != null)
            web.restoreState(state);
        else
            web.loadUrl("file:///android_asset/index.html");
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(0xff0d0c0b);
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
                int[] pad = safeArea(in);
                v.setPadding(pad[0], pad[1], pad[2], pad[3]);
                Log.i(TAG, "safe area left " + pad[0] + " top " + pad[1] + " right " + pad[2] + " bottom " + pad[3]);
                return in;
            }
        });
        setContentView(root);
        hideBars();
    }

    /**
     * The edges to keep clear, left top right bottom: the camera cut-out and the system bars
     * (counted even while hidden, so a bar swiped in never covers the game's buttons).
     */
    @SuppressWarnings("deprecation")
    static int[] safeArea(WindowInsets in) {
        if (Build.VERSION.SDK_INT >= 30) {
            Insets i = in.getInsetsIgnoringVisibility(WindowInsets.Type.systemBars()
                    | WindowInsets.Type.displayCutout());
            return new int[] {i.left, i.top, i.right, i.bottom};
        }
        int[] pad = {in.getStableInsetLeft(), in.getStableInsetTop(), in.getStableInsetRight(),
                in.getStableInsetBottom()};
        if (Build.VERSION.SDK_INT >= 28 && in.getDisplayCutout() != null) {
            DisplayCutout c = in.getDisplayCutout();
            pad[0] = Math.max(pad[0], c.getSafeInsetLeft());
            pad[1] = Math.max(pad[1], c.getSafeInsetTop());
            pad[2] = Math.max(pad[2], c.getSafeInsetRight());
            pad[3] = Math.max(pad[3], c.getSafeInsetBottom());
        }
        return pad;
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus)
            hideBars();
    }

    @SuppressWarnings("deprecation")
    private void hideBars() {
        // immersive: the status and navigation bars come back with a swipe
        web.setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        if (Build.VERSION.SDK_INT >= 28)
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        web.evaluateJavascript("window.QQ && QQ.game ? QQ.game.G.screen : ''", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String screen) {
                if ("\"title\"".equals(screen) || "\"\"".equals(screen)) {
                    finish();
                    return;
                }
                web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))", null);
            }
        });
    }
}
