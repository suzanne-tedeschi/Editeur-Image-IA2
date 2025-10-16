import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type * as StripeTypes from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    let event: StripeTypes.Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Erreur de signature webhook:', err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    // Créer un client Supabase avec la clé service pour les opérations admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeTypes.Stripe.Checkout.Session
        const userId = session.metadata?.userId
        
        if (userId && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id
          
          const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
          const subscription = subscriptionResponse as any
          
          // Déterminer le plan
          const priceId = subscription.items?.data?.[0]?.price?.id
          let plan: 'basic' | 'pro' = 'basic'
          let quota: number = STRIPE_PLANS.basic.quota
          
          if (priceId === STRIPE_PLANS.pro.priceId) {
            plan = 'pro'
            quota = STRIPE_PLANS.pro.quota
          }

          const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || ''

          // Créer ou mettre à jour l'abonnement
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan_type: plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            quota_total: quota,
            quota_used: 0,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        
        // Déterminer le plan
        const priceId = subscription.items?.data?.[0]?.price?.id
        let plan: 'basic' | 'pro' = 'basic'
        let quota: number = STRIPE_PLANS.basic.quota
        
        if (priceId === STRIPE_PLANS.pro.priceId) {
          plan = 'pro'
          quota = STRIPE_PLANS.pro.quota
        }

        // Mettre à jour l'abonnement
        await supabase
          .from('subscriptions')
          .update({
            plan_type: plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            quota_total: quota,
          })
          .eq('stripe_subscription_id', subscription.id)
        
        // Réinitialiser le quota si c'est un nouveau cycle
        const now = new Date()
        const periodStart = new Date(subscription.current_period_start * 1000)
        
        if (now >= periodStart) {
          await supabase
            .from('subscriptions')
            .update({ quota_used: 0 })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        
        // Marquer l'abonnement comme annulé
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}
