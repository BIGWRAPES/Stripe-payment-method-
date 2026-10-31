import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

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
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createSubtleCryptoProvider(),
    })

    const { userId, bookId } = await req.json()

    if (!userId || !bookId) {
      return new Response(JSON.stringify({ error: 'Missing userId or bookId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Unlock Remaining Chapters: Mysterious Island',
              description: `Full permanent digital access to Book ID: ${bookId}`,
            },
            unit_amount: 199, // $1.99 USD in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://bigwrapes.github.io/Stripe-payment-method-/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://bigwrapes.github.io/Stripe-payment-method-/?payment=cancelled`,
      metadata: {
        user_id: userId,
        book_id: bookId,
      },
    })

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
