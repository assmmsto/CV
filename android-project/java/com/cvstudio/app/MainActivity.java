package com.cvstudio.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * CV Studio — offline-first WebView shell.
 *
 * The entire Next.js static export lives in assets/ and is served through an
 * interceptor under the stable origin https://appassets.local/ so that
 * absolute "/_next/..." asset URLs resolve, and localStorage persists.
 *
 * PDF export:
 *  - online  → the app calls the hosted /api/export/pdf (Bun + Chromium engine)
 *  - offline → fetch() fails → the UI falls back to AndroidBridge.printHtml()
 *              which drives the Android system print framework ("Save as PDF").
 */
public class MainActivity extends Activity {

    private static final String ORIGIN = "https://appassets.local/";
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#0C0A09"));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new AssetLoaderClient());
        webView.addJavascriptInterface(new PrintBridge(), "AndroidBridge");
        setContentView(webView);

        webView.loadUrl(ORIGIN + "index.html");
    }

    /** Serves APK assets under a stable https origin. */
    private class AssetLoaderClient extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (!"appassets.local".equals(url.getHost())) return null;

            String path = url.getPath();
            if (path == null || path.isEmpty() || "/".equals(path)) path = "/index.html";
            path = path.substring(1); // strip leading '/'

            try {
                InputStream in = getAssets().open(path);
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", "*");
                return new WebResourceResponse(guessMime(path), "utf-8", 200, "OK", headers, in);
            } catch (IOException e) {
                if (path.startsWith("api/")) {
                    // No server runtime inside the APK → the UI falls back to print.
                    String body = "{\"error\":\"offline\",\"message\":\"PDF engine API is not available offline; the app will use the print fallback.\"}";
                    Map<String, String> headers = new HashMap<>();
                    headers.put("Content-Type", "application/json");
                    headers.put("Access-Control-Allow-Origin", "*");
                    return new WebResourceResponse("application/json", "utf-8", 404, "Not Found",
                            headers, new ByteArrayInputStream(body.getBytes()));
                }
                return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found",
                        null, new ByteArrayInputStream(new byte[0]));
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if ("appassets.local".equals(url.getHost())) return false;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, url));
            } catch (Exception ignored) {
            }
            return true;
        }
    }

    private static String guessMime(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html") || p.endsWith(".htm")) return "text/html";
        if (p.endsWith(".js") || p.endsWith(".mjs")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".gif")) return "image/gif";
        if (p.endsWith(".ico")) return "image/x-icon";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".woff")) return "font/woff";
        if (p.endsWith(".ttf") || p.endsWith(".otf")) return "font/ttf";
        if (p.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    /** JS bridge: window.AndroidBridge.printHtml(document) → Android print dialog. */
    private class PrintBridge {
        @JavascriptInterface
        public void printHtml(final String html) {
            runOnUiThread(() -> doPrint(html));
        }
    }

    private void doPrint(final String html) {
        try {
            final PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
            final WebView pw = new WebView(this);
            pw.getSettings().setJavaScriptEnabled(false);

            pw.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                    return true;
                }

                @Override
                public void onPageFinished(WebView v, String url) {
                    // small delay so webfonts/images settle before pagination
                    v.postDelayed(() -> {
                        float d = getResources().getDisplayMetrics().density;
                        int w = Math.round(794f * d);   // 210mm @96dpi
                        int h = Math.round(1123f * d);  // 297mm @96dpi
                        v.layout(0, 0, w, h);

                        PrintDocumentAdapter adapter = v.createPrintDocumentAdapter("CV-Studio");
                        PrintAttributes attrs = new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 600, 600))
                                .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                                .build();
                        pm.print(getString(R.string.app_name), adapter, attrs);
                    }, 500);
                }
            });

            pw.loadDataWithBaseURL(ORIGIN, html, "text/html", "utf-8", null);
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
