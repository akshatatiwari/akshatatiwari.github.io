# akshatatiwari.github.io

Personal site — plain HTML, CSS and a little JavaScript. No build step.

| File | What it holds |
|------|---------------|
| `index.html` | All content (edit text here) |
| `styles.css` | Colour tokens at the top (light + dark follow the system setting until the visitor flips the toggle, which is remembered), then layout |
| `main.js` | Nav highlighting, the light/dark toggle, and the small hover and scroll effects |
| `assets/` | Avatar (400/800px) and favicon |

Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000.

Deploy: push to `main`; GitHub Pages serves the repo root (Settings → Pages → Deploy from a branch → `main` / root).
