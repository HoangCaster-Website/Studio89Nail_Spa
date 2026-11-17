# Studio 89 Nail Spa

An English-language boutique salon website using HTML5, CSS3 and vanilla JavaScript. No framework, package installation, database or API keys are required.

## Preview

Open `index.html` directly, or run `npm start` and visit `http://127.0.0.1:8089`. On Windows PowerShell with script execution disabled, use `npm.cmd start` or `node scripts/serve.mjs`.

## Build

Run `npm run build`. This checks the page's local asset references and copies the website into `dist/`, ready for static hosting. Source files are in `index.html`, `css/`, `js/` and `assets/`.

## Editing

- All 36 supplied price entries are in the HTML under `#price-content`. Keep the supplied amounts when editing labels. No prices are fetched from a third-party service.
- Colours, spacing, typography and responsive layouts are in `css/style.css`. Fonts are served locally from `assets/fonts/`.
- The supplied original logo and price menu are retained in `assets/logo/original-logo.webp` and `assets/images/original-price-menu.webp`. The orange logo ink is used without recolouring.
- Replace the illustrative photographs in `assets/images/` with the salon's actual work when available, and update the gallery captions, alt text, and disclosure together. No actual salon/customer photographs were present in the supplied files.
- Booking and call links use `tel:0894535225`. There is no online reservation form or booking backend. On a phone, the links open the dialler; desktop behaviour depends on installed calling software.
- The location uses a Google Maps embed using the supplied Eircode (F45 E447) to avoid ambiguous street-name matches. The address and directions remain available if the third-party map cannot load. Google Maps needs an internet connection.
- Instagram and Facebook links use the exact addresses supplied in the brief and open in new tabs.
- The canonical URL and social metadata reflect the configured Sites URL. Update both, plus JSON-LD, when moving to another domain.

## Accessibility and interaction

Keyboard navigation, visible focus rings, a skip link, accessible price tabs with arrow/Home/End keys, a native dialog lightbox with Escape and arrow controls, reduced-motion support, lazy-loaded images, mobile booking controls and print styles are included. All menu prices remain available when JavaScript is disabled.

## Photography sources

Illustrative photography is downloaded locally from Unsplash. These images do not claim to show Studio 89's own work or premises.

- `hero.webp`: https://images.unsplash.com/photo-1604654894610-df63bc536371
- `manicure.webp`: https://images.unsplash.com/photo-1610992015732-2449b76344bc
- `nail-detail.webp`: https://images.unsplash.com/photo-1519014816548-bf5fe059798b
- `polish.webp`: https://images.unsplash.com/photo-1632345031435-8727f6897d53
- `nude.webp`: https://unsplash.com/photos/a-person-getting-the-nails-painted-DzMmp0uewcg
- `gloss.webp`: https://images.unsplash.com/photo-1659391542239-9648f307c0b1
- `coffee.webp`: https://images.unsplash.com/photo-1442512595331-e89e73853f31

The brand images belong to the supplied Studio 89 materials. Font files are from Google Fonts: Cormorant Garamond and DM Sans (SIL Open Font License).
