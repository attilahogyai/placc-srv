package com.myplacc.util;


import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;

import se.walkercrou.places.RequestHandler;

public class PlacesRequestHandler implements RequestHandler {
    /**
     * The default and recommended character encoding.
     */
    public static final String DEFAULT_CHARACTER_ENCODING = "UTF-8";
    private final CloseableHttpClient client = HttpClients.createMinimal(new BasicHttpClientConnectionManager());
    private String characterEncoding;

    /**
     * Creates a new handler with the specified character encoding.
     *
     * @param characterEncoding to use
     */
    public PlacesRequestHandler(String characterEncoding) {
        this.characterEncoding = characterEncoding;
    }

    /**
     * Creates a new handler with UTF-8 character encoding.
     */
    public PlacesRequestHandler() {
        this(DEFAULT_CHARACTER_ENCODING);
    }

    /**
     * Returns the character encoding used by this handler.
     *
     * @return character encoding
     */
    @Override
    public String getCharacterEncoding() {
        return characterEncoding;
    }

    /**
     * Sets the character encoding used by this handler.
     *
     * @param characterEncoding to use
     */
    @Override
    public void setCharacterEncoding(String characterEncoding) {
        this.characterEncoding = characterEncoding;
    }

    private String readString(HttpResponse response) throws IOException {
        String str = IOUtils.toString(response.getEntity().getContent(), characterEncoding);
        if (str == null || str.trim().length() == 0) {
            return null;
        }
        return str.trim();
    }

    @Override
    public InputStream getInputStream(String uri) throws IOException {
        try {
            HttpGet get = new HttpGet(uri);
            return client.execute(get).getEntity().getContent();
        } catch (Exception e) {
            throw new IOException(e);
        }
    }

    @Override
    public String get(String uri) throws IOException {
        try {
            HttpGet get = new HttpGet(uri);
            return readString(client.execute(get));
        } catch (Exception e) {
            throw new IOException(e);
        }
    }

    @Override
    public String post(HttpPost data) throws IOException {
        try {
            return readString(client.execute(data));
        } catch (Exception e) {
            throw new IOException(e);
        }
    }
}
