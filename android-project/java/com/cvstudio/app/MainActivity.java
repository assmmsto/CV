package com.cvstudio.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.JsResult;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * CV Studio — offline-first WebView shell.
 *
 * The entire Next.js static export lives in assets/ and is served through an
 * interceptor under the stable origin https://appassets.local/ so that
 * absolute "/_next/..." asset URLs resolve, and localStorage persists.
 *
 * PDF export (v1.1.0+):
 *  - PDFs are generated INSIDE the WebView (html2canvas-pro + jsPDF), so
 *    downloads work fully offline on every device.
 *  - AndroidBridge.saveFile(name, mime, base64) writes the generated file
 *    into the device Downloads folder (MediaStore on Android 10+).
 *  - AndroidBridge.printHtml(html) still drives the system print framework
 *    as a secondary "selectable text" option.
 *
 * Photo upload:
 *  - WebChromeClient.onShowFileChooser enables <input type="file"> inside
 *    the WebView (gallery + camera pickers) — this was missing before.
 */
public class MainActivity extends Activity {

    private static final String ORIGIN = "https://appassets.local/";
    private static final int REQ_FILE_CHOOSER = 1001;
    private static final int REQ_WRITE_STORAGE = 2002;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private Runnable pendingSave;

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
        webView.setWebChromeClient(new ChromeClient());
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
                    // No server runtime inside the APK → PDFs are generated client-side.
                    String body = "{\"error\":\"offline\",\"message\":\"PDFs are generated inside the app itself.\"}";
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

    /** Enables <input type="file"> (photo upload from gallery or camera). */
    private class ChromeClient extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView wv, ValueCallback<Uri[]> callback,
                                         FileChooserParams params) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(null);
            }
            filePathCallback = callback;
            try {
                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                startActivityForResult(intent, REQ_FILE_CHOOSER);
            } catch (Exception e) {
                filePathCallback = null;
                return false;
            }
            return true;
        }

        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show();
            result.confirm();
            return true;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE_CHOOSER) {
            if (filePathCallback != null) {
                filePathCallback.onReceiveValue(
                        WebChromeClient.FileChooserParams.parseResult(resultCode, data));
                filePathCallback = null;
            }
            return;
        }
        if (requestCode == REQ_WRITE_STORAGE) {
            // user granted legacy storage → retry the pending save
            if (pendingSave != null) {
                Runnable r = pendingSave;
                pendingSave = null;
                if (resultCode == RESULT_OK) r.run();
                else Toast.makeText(this, R.string.save_failed, Toast.LENGTH_LONG).show();
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
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
        if (p.endsWith(".pdf")) return "application/pdf";
        if (p.endsWith(".zip")) return "application/zip";
        if (p.endsWith(".txt")) return "text/plain";
        return "application/octet-stream";
    }

    /** JS bridge: window.AndroidBridge.printHtml / saveFile. */
    private class PrintBridge {
        @JavascriptInterface
        public void printHtml(final String html) {
            runOnUiThread(() -> doPrint(html));
        }

        @JavascriptInterface
        public void saveFile(final String name, final String mime, final String base64) {
            runOnUiThread(() -> saveToDownloads(name, mime, base64));
        }
    }

    /** Writes a base64 payload (PDF/ZIP) into the public Downloads folder. */
    private void saveToDownloads(String name, String mime, String base64) {
        try {
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            if (mime == null || mime.trim().isEmpty()) mime = "application/pdf";

            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.Downloads.DISPLAY_NAME, name);
                cv.put(MediaStore.Downloads.MIME_TYPE, mime);
                cv.put(MediaStore.Downloads.IS_PENDING, 1);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                if (uri == null) throw new IOException("MediaStore insert failed");
                OutputStream os = getContentResolver().openOutputStream(uri);
                if (os == null) throw new IOException("openOutputStream failed");
                try {
                    os.write(bytes);
                    os.flush();
                } finally {
                    os.close();
                }
                ContentValues done = new ContentValues();
                done.put(MediaStore.Downloads.IS_PENDING, 0);
                getContentResolver().update(uri, done, null, null);
            } else {
                // Android 8/9 — needs the legacy WRITE_EXTERNAL_STORAGE permission
                if (checkSelfPermission("android.permission.WRITE_EXTERNAL_STORAGE")
                        != PackageManager.PERMISSION_GRANTED) {
                    final String fName = name;
                    final String fMime = mime;
                    final String fB64 = base64;
                    pendingSave = () -> saveToDownloads(fName, fMime, fB64);
                    requestPermissions(
                            new String[]{"android.permission.WRITE_EXTERNAL_STORAGE"},
                            REQ_WRITE_STORAGE);
                    Toast.makeText(this, R.string.grant_storage, Toast.LENGTH_LONG).show();
                    return;
                }
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!dir.exists()) dir.mkdirs();
                File out = new File(dir, name);
                FileOutputStream fos = new FileOutputStream(out);
                try {
                    fos.write(bytes);
                    fos.flush();
                } finally {
                    fos.close();
                }
            }
            Toast.makeText(this, getString(R.string.saved_downloads) + ": " + name,
                    Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            Toast.makeText(this, R.string.save_failed, Toast.LENGTH_LONG).show();
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
