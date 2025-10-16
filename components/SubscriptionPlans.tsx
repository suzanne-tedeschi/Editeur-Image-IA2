'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PLANS } from '@/lib/stripe'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSubscribe = async (priceId: string, planName: string) => {
    try {
      setLoading(planName)

      // Récupérer le token d'accès
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Vous devez être connecté pour vous abonner')
        setLoading(null)
        return
      }

      // Appeler l'API pour créer une session Stripe Checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        alert('Erreur lors de la création de la session de paiement')
        setLoading(null)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
      setLoading(null)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto p-6">
      {/* Plan Basic */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-rose-100 hover:border-rose-300 transition-all hover:shadow-xl">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{STRIPE_PLANS.basic.name}</h3>
          <div className="mb-6">
            <span className="text-5xl font-bold text-rose-600">€{STRIPE_PLANS.basic.price}</span>
            <span className="text-gray-600">/mois</span>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {STRIPE_PLANS.basic.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-6 h-6 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleSubscribe(STRIPE_PLANS.basic.priceId, STRIPE_PLANS.basic.name)}
          disabled={loading !== null}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading === STRIPE_PLANS.basic.name ? 'Chargement...' : 'Choisir Basic'}
        </button>
      </div>

      {/* Plan Pro */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl shadow-lg p-8 border-2 border-rose-300 hover:border-rose-400 transition-all hover:shadow-2xl relative">
        <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
          Populaire
        </div>
        
        <div className="text-center mt-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{STRIPE_PLANS.pro.name}</h3>
          <div className="mb-6">
            <span className="text-5xl font-bold text-rose-600">€{STRIPE_PLANS.pro.price}</span>
            <span className="text-gray-600">/mois</span>
          </div>
        </div>
        
        <ul className="space-y-4 mb-8">
          {STRIPE_PLANS.pro.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-6 h-6 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleSubscribe(STRIPE_PLANS.pro.priceId, STRIPE_PLANS.pro.name)}
          disabled={loading !== null}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          {loading === STRIPE_PLANS.pro.name ? 'Chargement...' : 'Choisir Pro'}
        </button>
      </div>
    </div>
  )
}
