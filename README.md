# Stripe Payment Method Practice

A small payment-flow demo for unlocking the remaining chapters of *The Mysterious Island*. The frontend is hosted on GitHub Pages; Supabase Edge Functions create and verify Stripe Checkout sessions, and a Stripe webhook records completed purchases.

## Live demo

- [Open the demo site](https://bigwrapes.github.io/Stripe-payment-method-/)
- [Open the GitHub repository](https://github.com/BIGWRAPES/Stripe-payment-method-)
- Supabase project: `clmvpmoivnggwwwvvjkd`

## Payment flow

1. The frontend calls `stripe-checkout` to create a $1.99 USD Stripe Checkout session.
2. Stripe redirects back to the Pages site with the Checkout session ID.
3. The frontend calls `stripe-verify`; the book unlocks only when Stripe confirms the session is paid.
4. Stripe sends `checkout.session.completed` to `stripe-webhook`, which records access in `book_access`.

The browser uses the practice ID `user_practice_123`; there is no real sign-in. This project is for learning and Stripe **test mode**, not for production payments or access control.

## Documentation

- [Frontend files and local preview](README-FRONTEND.md)
- [Supabase functions, database, and deployment](supabase/README.md)
- [Playwright MCP browser testing](README-PLAYWRIGHT-MCP.md)

## Hosting

The GitHub Actions workflow at `.github/workflows/deploy-pages.yml` publishes the static frontend when changes are pushed to `main`. Supabase Edge Functions and database migrations are deployed separately; see [Supabase setup](supabase/README.md).

Do not commit `supabase/.env`, Supabase temporary state, or `node_modules`. These paths are excluded in `.gitignore`.
