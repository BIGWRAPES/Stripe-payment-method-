import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const allowedOrigins = [
  'https://bigwrapes.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]

function getCorsHeaders(origin: string | null) {
  return {
    ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Stripe is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { userId, bookId } = await req.json()

    if (!userId || !bookId) {
      return new Response(JSON.stringify({ error: 'Missing userId or bookId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const form = new URLSearchParams({
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Unlock Remaining Chapters: Mysterious Island',
      'line_items[0][price_data][product_data][description]': `Full permanent digital access to Book ID: ${bookId}`,
      'line_items[0][price_data][unit_amount]': '199',
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: 'https://bigwrapes.github.io/Stripe-payment-method-/?payment=success&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://bigwrapes.github.io/Stripe-payment-method-/?payment=cancelled',
      'metadata[user_id]': userId,
      'metadata[book_id]': bookId,
    })

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    })
    const session = await stripeResponse.json()

    if (!stripeResponse.ok || !session.url) {
      console.error('Stripe checkout session creation failed:', session.error?.message ?? stripeResponse.status)
      return new Response(JSON.stringify({ error: 'Unable to create Stripe Checkout session' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
