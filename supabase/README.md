# Supabase

The hosted project reference used by the demo is `clmvpmoivnggwwwvvjkd`. The project contains three Edge Functions and the `book_access` table migration.

## Components

- `functions/stripe-checkout/` creates a $1.99 USD Stripe Checkout session and attaches `user_id` and `book_id` metadata.
- `functions/stripe-verify/` retrieves a Checkout session from Stripe and confirms payment before the frontend unlocks the book.
- `functions/stripe-webhook/` validates Stripe's signature and upserts paid sessions into `book_access`.
- `migrations/20231031_create_book_access.sql` defines the purchase table and its access policy. The demo uses a text practice user ID and does not use Supabase Auth.
- `config.toml` contains Supabase CLI project and local development configuration.

## Required secrets

Set these in the Supabase project's Edge Function secrets. Do not put secret values in Git, frontend JavaScript, or these docs.

- `STRIPE_SECRET_KEY` — a Stripe **test-mode** secret key.
- `STRIPE_WEBHOOK_SIGNING_SECRET` — the signing secret for the Stripe webhook endpoint.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — required by the webhook to save access. Supabase provides these system secrets to deployed functions in the hosted project.

The local `supabase/.env` is ignored by Git. It may be used for local development; never share or commit it.

## Hosted deployment

The migration and functions have been deployed to the configured project. With the Supabase CLI authenticated and the project linked, deploy later changes with:

```powershell
npm exec supabase -- db push --linked
npm exec supabase -- functions deploy stripe-checkout stripe-verify stripe-webhook --project-ref clmvpmoivnggwwwvvjkd --no-verify-jwt --use-api
```

`--use-api` deploys functions without a local Docker installation. Apply database migrations deliberately and check the CLI output before confirming.

Set a Stripe test secret from a local environment file without putting its value in shell history:

```powershell
npm exec supabase -- secrets set --env-file .\supabase\.env --project-ref clmvpmoivnggwwwvvjkd
```

The hosted Stripe test webhook must point to:

```text
https://clmvpmoivnggwwwvvjkd.supabase.co/functions/v1/stripe-webhook
```

Subscribe it to `checkout.session.completed`, then store its signing secret as `STRIPE_WEBHOOK_SIGNING_SECRET` in Supabase. The webhook endpoint and secrets are environment configuration; do not commit signing keys.

## Local development

Running the Supabase stack locally requires Docker Desktop. Start it with:

```powershell
npm exec supabase -- start
npm exec supabase -- functions serve
```

The hosted Pages frontend uses the hosted project URL. For a real local end-to-end test, configure local function secrets and use Stripe CLI to forward test events to the local webhook.

## Important demo limitation

The frontend sends the hardcoded user ID `user_practice_123`. The project intentionally has no user authentication and is not suitable for real payments, production access control, or real customer data.
