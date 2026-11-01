# Teja portfolio

A responsive static portfolio built with HTML, CSS, and JavaScript. GSAP and ScrollTrigger progressively enhance section entrances. The page and navigation also work if those CDN scripts fail. There is no build step.

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Deploy the repository root to the existing static host.

## Editing

- `index.html`: content, project links, illustrations, and assistant markup.
- `styles.css`: layout, responsive breakpoints, semantic light/dark theme tokens.
- `assets/js/main.js`: navigation, persisted theme, optional section reveals, email copying.
- `assets/css/assistant.css` and `assets/js/assistant.js`: assistant presentation and interactions.
- `assets/img/portrait.webp`: optimized hero portrait. `img.png` is the original.
- `assets/img/img1.png`: existing Vital Plasma dashboard screenshot.

Campus Connect and QuantumCrop use decorative illustrations, not product screenshots. Replace their visual blocks with real screenshots when available. Keep the crop project labelled as a concept unless its scope changes.

Animation has one owner: GSAP manages optional section entrances; CSS manages hover/focus transitions. Content is visible without JavaScript, and the reduced-motion preference removes animated entrances. The default theme is light; an explicit choice is saved when browser storage is available.

## Verification

Check 320, 390, 768, 980, and 1440px widths in a browser, including theme changes, menu open/close and Escape, project links, résumé download, email copy, and the assistant. Check reduced motion, JavaScript disabled, and blocked animation CDNs. Test an actual assistant response only against a configured backend; the frontend retains the existing AWS Lambda URL.

```sh
node --check assets/js/main.js
node --check assets/js/assistant.js
git diff --check
```

The existing `api/` and `lambda/` implementations are independent of the visual redesign. Keep API credentials on the server.
