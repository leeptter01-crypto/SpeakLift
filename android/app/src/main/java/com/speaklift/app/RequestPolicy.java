package com.speaklift.app;

import java.net.URI;
import java.net.URISyntaxException;

final class RequestPolicy {
    static final String HOST = "appassets.androidplatform.net";
    static final String HOME = "https://" + HOST + "/assets/web/index.html";
    static final String AUDIO = "android.webkit.resource.AUDIO_CAPTURE";

    static boolean isLocal(String url) {
        try {
            URI uri = new URI(url);
            return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443) && uri.getUserInfo() == null;
        } catch (URISyntaxException | NullPointerException ignored) { return false; }
    }

    static boolean canCapture(String origin, String[] resources) {
        return isLocal(origin) && resources != null && resources.length == 1 && AUDIO.equals(resources[0]);
    }

    static boolean isExternalHttps(String url) {
        try {
            URI uri = new URI(url);
            return "https".equals(uri.getScheme()) && uri.getHost() != null
                && uri.getUserInfo() == null && !isLocal(url);
        } catch (URISyntaxException | NullPointerException ignored) { return false; }
    }
}
