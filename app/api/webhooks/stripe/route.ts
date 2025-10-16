import { NextRequest, NextResponse } from 'next/server'
import { getStripe, STRIPE_PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Signature manquante')
      return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
    }

    const stripe = getStripe()
    let event

    // Vérifier la signature du webhook
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('❌ Erreur de signature webhook:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    console.log('✅ Webhook reçu:', event.type)

    // Client Supabase avec service role key pour les opérations admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Gérer les événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        console.log('💳 Checkout complété pour:', session.customer)

        if (!session.subscription) {
          console.log('⚠️ Pas de subscription dans le checkout')
          break
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = session.metadata?.user_id

        if (!userId) {
          console.error('❌ user_id manquant dans metadata')
          break
        }

        // Déterminer le plan
        const priceId = subscription.items.data[0]?.price?.id
        let planType: 'basic' | 'pro' = 'basic'
        let quotaTotal: number = STRIPE_PLANS.basic.quota

        if (priceId === STRIPE_PLANS.pro.priceId) {
          planType = 'pro'
          quotaTotal = STRIPE_PLANS.pro.quota
        }

        // Créer ou mettre à jour l'abonnement
        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          quota_total: quotaTotal,
          quota_used: 0,
        })

        if (error) {
          console.error('❌ Erreur Supabase:', error)
        } else {
          console.log('✅ Subscription créée/mise à jour')
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as any
        console.log('🆕 Nouvelle subscription:', subscription.id)

        // Récupérer l'user_id via le customer
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (!existingSub?.user_id) {
          console.error('❌ user_id non trouvé pour customer:', subscription.customer)
          break
        }

        const priceId = subscription.items.data[0]?.price?.id
        let planType: 'basic' | 'pro' = 'basic'
        let quotaTotal: number = STRIPE_PLANS.basic.quota

        if (priceId === STRIPE_PLANS.pro.priceId) {
          planType = 'pro'
          quotaTotal = STRIPE_PLANS.pro.quota
        }

        await supabase.from('subscriptions').upsert({
          user_id: existingSub.user_id,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          quota_total: quotaTotal,
          quota_used: 0,
        })

        console.log('✅ Subscription créée')
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        console.log('🔄 Subscription mise à jour:', subscription.id)

        const priceId = subscription.items.data[0]?.price?.id
        let planType: 'basic' | 'pro' = 'basic'
        let quotaTotal: number = STRIPE_PLANS.basic.quota

        if (priceId === STRIPE_PLANS.pro.priceId) {
          planType = 'pro'
          quotaTotal = STRIPE_PLANS.pro.quota
        }

        await supabase
          .from('subscriptions')
          .update({
            plan_type: planType,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            quota_total: quotaTotal,
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log('✅ Subscription mise à jour')
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        console.log('❌ Subscription annulée:', subscription.id)

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        console.log('✅ Subscription marquée comme annulée')
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any
        console.log('💰 Paiement réussi pour invoice:', invoice.id)

        // Si c'est un renouvellement (pas la première facture)
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscriptionId = invoice.subscription

          // Réinitialiser le quota
          const { error } = await supabase
            .from('subscriptions')
            .update({ quota_used: 0 })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('❌ Erreur reset quota:', error)
          } else {
            console.log('✅ Quota réinitialisé pour nouveau cycle')
          }
        }
        break
      }

      default:
        console.log(`ℹ️ Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur webhook' },
      { status: 500 }
    )
  }
}
