package com.speaklift.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.Toast;
import android.widget.Toolbar;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public final class MainActivity extends Activity {
    private static final int MIC_PERMISSION = 10;
    private static final String LIVE_URL = "https://speaklift-yi-20260923.johnleebob.chatgpt.site/";
    private WebView webView;
    private PermissionRequest pendingRequest;
    private AlertDialog permissionExplanation;
    private boolean foreground;
    private boolean awaitingSystemPermission;
    private boolean permissionResultReady;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.WHITE);
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        Toolbar toolbar = new Toolbar(this);
        toolbar.setTitle(R.string.app_name);
        toolbar.setTitleTextColor(Color.rgb(19, 95, 99));
        root.addView(toolbar, new LinearLayout.LayoutParams(-1, Math.round(48 * getResources().getDisplayMetrics().density)));
        setActionBar(toolbar);
        webView = new WebView(this);
        root.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setSupportMultipleWindows(false);
        settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        WebViewAssetLoader assets = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (RequestPolicy.isLocal(request.getUrl().toString())) {
                    WebResourceResponse response = assets.shouldInterceptRequest(request.getUrl());
                    if (response != null) {
                        String path = request.getUrl().getPath();
                        if (path != null && (path.endsWith(".js") || path.endsWith(".mjs"))) {
                            response.setMimeType("text/javascript");
                            response.setEncoding("UTF-8");
                        }
                        return response;
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(),
                    new ByteArrayInputStream("Not available in the offline app".getBytes(StandardCharsets.UTF_8)));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (RequestPolicy.isLocal(url)) return false;
                if (request.isForMainFrame() && request.hasGesture() && RequestPolicy.isExternalHttps(url)) confirmExternal(url);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> requestMicrophone(request));
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (pendingRequest == request) {
                    pendingRequest = null;
                    if (permissionExplanation != null) permissionExplanation.dismiss();
                }
            }
        });
        webView.loadUrl(RequestPolicy.HOME);
    }

    private void requestMicrophone(PermissionRequest request) {
        if (!foreground || !RequestPolicy.isLocal(webView.getUrl())
                || !RequestPolicy.canCapture(request.getOrigin().toString(), request.getResources())) {
            request.deny();
            return;
        }
        if (pendingRequest != null) { request.deny(); return; }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            return;
        }
        pendingRequest = request;
        permissionExplanation = new AlertDialog.Builder(this)
            .setTitle(R.string.microphone_title).setMessage(R.string.microphone_message)
            .setPositiveButton(R.string.allow, (dialog, which) -> {
                if (pendingRequest == request) {
                    awaitingSystemPermission = true;
                    requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, MIC_PERMISSION);
                }
            })
            .setNegativeButton(R.string.cancel, (dialog, which) -> denyPending())
            .setOnCancelListener(dialog -> denyPending()).show();
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode != MIC_PERMISSION) return;
        awaitingSystemPermission = false;
        if (results.length != 1 || results[0] != PackageManager.PERMISSION_GRANTED) { denyPending(); return; }
        permissionResultReady = true;
        grantPendingWhenResumed();
    }

    private void grantPendingWhenResumed() {
        if (!foreground || !permissionResultReady || pendingRequest == null) return;
        PermissionRequest request = pendingRequest;
        pendingRequest = null;
        permissionResultReady = false;
        if (RequestPolicy.isLocal(webView.getUrl())) request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
        else request.deny();
    }

    private void denyPending() {
        permissionResultReady = false;
        if (pendingRequest != null) {
            pendingRequest.deny();
            pendingRequest = null;
        }
    }

    private void confirmExternal(String url) {
        new AlertDialog.Builder(this).setTitle(R.string.external_title).setMessage(Uri.parse(url).getHost())
            .setPositiveButton(R.string.allow, (dialog, which) -> {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
                catch (ActivityNotFoundException exception) { Toast.makeText(this, R.string.no_browser, Toast.LENGTH_SHORT).show(); }
            }).setNegativeButton(R.string.cancel, null).show();
    }

    @Override public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, 1, 0, R.string.web_version);
        menu.add(0, 2, 1, R.string.about_title);
        return true;
    }
    @Override public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == 1) { confirmExternal(LIVE_URL); return true; }
        if (item.getItemId() == 2) {
            new AlertDialog.Builder(this).setTitle(R.string.about_title).setMessage(R.string.about_message)
                .setPositiveButton(android.R.string.ok, null).show();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    @Override protected void onResume() {
        super.onResume();
        foreground = true;
        if (webView != null) webView.onResume();
        grantPendingWhenResumed();
    }
    @Override protected void onPause() {
        foreground = false;
        // The OS permission dialog may pause the Activity before its result is delivered.
        if (!awaitingSystemPermission) denyPending();
        if (permissionExplanation != null) permissionExplanation.dismiss();
        if (webView != null) {
            if (!awaitingSystemPermission) stopWebRecording();
            webView.onPause();
        }
        super.onPause();
    }
    @Override protected void onStop() {
        denyPending();
        stopWebRecording();
        super.onStop();
    }
    private void stopWebRecording() {
        if (webView != null) webView.evaluateJavascript("window.dispatchEvent(new Event('speaklift:pause'));", null);
    }
    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        denyPending();
        if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
