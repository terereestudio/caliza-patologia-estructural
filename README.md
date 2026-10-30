# CALIZA · Patología Estructural — Landing

Sitio estático (HTML + CSS + JS vanilla, sin build). Netlify publica la raíz del repo.

- `index.html` — página principal. `assets/js/main.js` — todo el JS (sin scripts inline, compatible con CSP).
- `privacidad.html` — política de privacidad (Ley 25.326). `404.html` — página de error.
- `_headers` / `_redirects` — cabeceras de seguridad y reglas de Netlify.
- `robots.txt`, `.well-known/security.txt`.
- `assets/img/` — imágenes en WebP (logo original, isotipo, foto de los socios, portadas de reels y firma de Tereré Estudio). Quedan en PNG/JPG solo el favicon, el apple-touch-icon y la imagen para redes (og), por compatibilidad.

Pendientes legales: buscar `[COMPLETAR` en `privacidad.html`.
