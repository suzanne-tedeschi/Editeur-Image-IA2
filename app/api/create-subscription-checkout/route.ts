import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'priceId requis' }, { status: 400 })
    }

    console.log('Authorization header:', req.headers.get('authorization'))

    // Récupérer l'utilisateur connecté
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: req.headers.get('authorization') || '',
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('User:', user)
    console.log('Auth error:', authError)

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const stripe = getStripe()

    // Vérifier si l'utilisateur a déjà un customer Stripe
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = existingSub?.stripe_customer_id

    // Créer un nouveau customer si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erreur create-subscription-checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
