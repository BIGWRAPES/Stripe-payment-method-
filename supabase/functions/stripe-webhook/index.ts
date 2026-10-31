import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createSubtleCryptoProvider(),
    })

    const body = await req.text()
    // Validates that this request securely originated from Stripe
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SIGNING_SECRET || ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { user_id, book_id } = session.metadata || {}

      if (session.payment_status === 'paid' && user_id && book_id) {
        const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

        // Corrected columns matching our database schema
        const { error } = await supabase
          .from('book_access')
          .upsert({
            user_id: user_id,
            book_id: book_id,
            has_access: true,
            purchased_at: new Date().toISOString()
          }, { onConflict: 'user_id,book_id' })

        if (error) {
          console.error('Database update failed:', error)
          return new Response('DB Error', { status: 500 })
        }

        console.log(`Successfully unlocked ${book_id} for user ${user_id}`)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
