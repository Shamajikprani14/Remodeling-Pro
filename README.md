# Remodeling Pro landing page

Static landing page hosted on Hostinger behind Cloudflare. There is no build step: upload the files as they are to `public_html`.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Page markup (includes the inline SVG icon sprite) |
| `css/styles.css` | All styles, including the `@font-face` rules and color variables in `:root` |
| `js/config.js` | Site settings: lead form endpoint (Google Apps Script), offer deadline and label, GTM container ID |
| `js/main.js` | Page behavior: countdown, form validation and submission, UTM/fbclid attribution, sticky bar, scroll-to-top, GTM loading |
| `img/` | Logo, icons, hero and before/after photos (WebP) |
| `fonts/` | Self-hosted Archivo and Karla (`.woff2`) |
| `.htaccess` | Compression, file types and cache headers |

`js/config.js` must load before `js/main.js`, because `main.js` reads the global `CONFIG` object.

## Caching

`.htaccess` tells browsers to recheck `.html`, `.css` and `.js` on every visit, so edits show up right away. Images are cached for 30 days and fonts for 1 year. If you replace an image, give it a new filename. Cloudflare may also cache files; purge its cache after deploying if a change doesn't appear.

## Local preview

Run `python3 -m http.server` in this folder and open http://localhost:8000. GTM doesn't load on `localhost` or `file://` previews, so testing doesn't send data to GA or Meta.
