# Playwright MCP

Playwright MCP is a browser-automation tool available in the agent environment. It was used to open the hosted demo, inspect its rendered page, and follow the Unlock button to Stripe Checkout. It is **not** a runtime dependency of this site, and visitors do not need to install it.

## What to check

1. Open the [live demo](https://bigwrapes.github.io/Stripe-payment-method-/).
2. Confirm the preview and $1.99 unlock button render.
3. Click **Unlock Book (Stripe)** and check that Stripe Checkout opens in **Sandbox** mode with the expected product and price.
4. To exercise a successful test payment, use Stripe's test card `4242 4242 4242 4242`, any future expiry date, and any CVC. Use test details only; never enter a real card.
5. After returning to the site, confirm a paid session unlocks the book. An unpaid or invalid session must not unlock it.

Completing the test checkout submits a payment in Stripe's test environment, but does not charge real money. The browser test can also stop at the checkout page without submitting a payment.

## Artifacts and project files

Playwright MCP browser snapshots, logs, and screenshots may be written to `.playwright-mcp/`. This is a local scratch directory and is excluded from Git. The project itself does not contain Playwright test scripts or a Playwright package.
