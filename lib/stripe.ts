import Stripe from 'stripe'

// Lazy initialization de Stripe pour éviter les erreurs au build
let stripeInstance: Stripe | null = null

export const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

// Pour compatibilité avec le code existant
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return (getStripe() as any)[prop]
  }
})

export const STRIPE_PLANS = {
  basic: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC!,
    name: 'Basic',
    price: 9,
    quota: 50,
    features: [
      '50 générations d\'images par mois',
      'Accès aux modèles IA de base',
      'Historique sauvegardé',
      'Support par email'
    ]
  },
  pro: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
    name: 'Pro',
    price: 19,
    quota: 200,
    features: [
      '200 générations d\'images par mois',
      'Accès à tous les modèles IA',
      'Historique illimité',
      'Support prioritaire',
      'Téléchargements en haute qualité'
    ]
  }
} as const
