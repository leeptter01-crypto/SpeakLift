package com.speaklift.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class RequestPolicyTest {
    @Test public void localHttpsAssetsAreAllowed() {
        assertTrue(RequestPolicy.isLocal(RequestPolicy.HOME));
        assertTrue(RequestPolicy.isLocal("https://appassets.androidplatform.net:443/"));
    }
    @Test public void lookalikesAndUnsafeSchemesAreRejected() {
        for (String url : new String[] {null, "", "https://appassets.androidplatform.net.evil.test/",
            "http://appassets.androidplatform.net/", "file:///android_asset/index.html", "javascript:alert(1)",
            "https://appassets.androidplatform.net@evil.test/", "https://user@appassets.androidplatform.net/",
            "https://appassets.androidplatform.net:444/"}) assertFalse(url, RequestPolicy.isLocal(url));
    }
    @Test public void onlyMicrophoneFromLocalOriginIsGranted() {
        assertTrue(RequestPolicy.canCapture(RequestPolicy.HOME, new String[] {RequestPolicy.AUDIO}));
        assertFalse(RequestPolicy.canCapture("https://example.com", new String[] {RequestPolicy.AUDIO}));
        assertFalse(RequestPolicy.canCapture(RequestPolicy.HOME, null));
        assertFalse(RequestPolicy.canCapture(RequestPolicy.HOME, new String[] {}));
        assertFalse(RequestPolicy.canCapture(RequestPolicy.HOME, new String[] {"android.webkit.resource.VIDEO_CAPTURE"}));
        assertFalse(RequestPolicy.canCapture(RequestPolicy.HOME, new String[] {RequestPolicy.AUDIO, "future.permission"}));
    }
    @Test public void externalNavigationRequiresHttpsWithoutCredentials() {
        assertTrue(RequestPolicy.isExternalHttps("https://github.com/leeptter01-crypto/SpeakLift"));
        for (String url : new String[] {null, "javascript:alert(1)", "intent://open", "file:///sdcard/a", "http://example.com", "https://user:pass@example.com", RequestPolicy.HOME})
            assertFalse(url, RequestPolicy.isExternalHttps(url));
    }
}
