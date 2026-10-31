# Frontend

The frontend is a static HTML, CSS, and JavaScript site published at [GitHub Pages](https://bigwrapes.github.io/Stripe-payment-method-/). It calls the hosted Supabase Edge Functions to create and verify Stripe Checkout sessions.

## Files

- `.gitignore` — excludes `node_modules/`, `.playwright-mcp/`, `supabase/.env`, and `supabase/.temp/` from Git.
- `index.html` — book preview, paywall, unlock button, premium content, and status message.
- `index.js` — calls the hosted checkout and verification functions. The practice user ID and book ID are demo values.
- `package.json` — declares the Supabase CLI as a development dependency; it does not define frontend build scripts.
- `package-lock.json` — locks the npm dependency versions for repeatable CLI installs.
- `style.css` — page layout, book styling, paywall, and unlocked-content states.

## Local preview

The frontend can be served as static files. For example, from the project root:

```powershell
npx serve .
```

Or open the folder with a static-server extension configured for port `5500`. The Supabase functions allow requests from `http://localhost:5500` and `http://127.0.0.1:5500`. Checkout return URLs are configured for the hosted Pages site.

## GitHub Pages deployment

`.github/workflows/deploy-pages.yml` copies `index.html`, `index.js`, and `style.css` into a clean deployment directory and publishes it with GitHub Pages. Push changes to `main`; the workflow deploys automatically. The repository's Pages source should be set to **GitHub Actions**.

This is a demo frontend, not a production storefront: the user ID is hardcoded, and frontend checks are not a substitute for real authentication and server-side authorization.
