# Vanguard Fencing — Premium Responsive Homepage

Standalone HTML/CSS/JS implementation of the approved one-column desktop and mobile concept.

## Run locally

Open `index.html` directly, or for the most browser-consistent behaviour run a local server:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/`.

## Files

- `index.html` — semantic page structure
- `styles.css` — responsive visual system and accessibility states
- `script.js` — mobile menu, quote dialog, FAQ accordion, pricing disclosure, project lightbox and service-area checker
- `assets/` — local fencing imagery used by the prototype

## Production notes

- The quote form is a front-end UX demo only. Connect it to a real form/CRM endpoint before launch.
- The reviews section intentionally does not publish the placeholder review quotes currently found on the live site's reviews content. Connect genuine Google reviews before launch.
- Confirm every pricing range and service-area postcode immediately before production release.
- Replace prototype imagery with original high-resolution Vanguard project photography when available.


## Photography update

The previous concept-mockup crops are no longer the primary image sources. The page now points to original Vanguard Fencing project images on `vanguardfencing.com.au`, with the bundled prototype JPGs kept only as offline/error fallbacks. See `IMAGE_SOURCES.md` and `TEST_REPORT.md`.
