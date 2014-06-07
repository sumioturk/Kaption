package com.example.myapp;

import android.app.ActionBar;
import android.app.Activity;
import android.graphics.Canvas;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;

public class MyActivity extends Activity {
    /**
     * Called when the activity is first created.
     */
    private WebView webView;


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        webView = new WebView(this) {
            @Override
            protected void onDraw(Canvas canvas) {
                super.onDraw(canvas);
                Log.w("HD", canvas.isHardwareAccelerated() + "");
            }
        };
        webView.getSettings().setJavaScriptEnabled(true);
        webView.loadUrl("http://192.168.20.7:1337/kaption?url=http://www.picturesnew.com/media/images/image-background.jpg");
        webView.setLayoutParams(new ActionBar.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        ((LinearLayout) findViewById(R.id.container)).addView(webView);
    }
}
