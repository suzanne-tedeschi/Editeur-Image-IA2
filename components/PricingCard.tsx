'use client'

import { useState } from 'react'

interface PricingCardProps {
  name: string
  price: number
  quota: number
  features: readonly string[]
  priceId: string
  isPopular?: boolean
}

export default function PricingCard({ 
  name, 
  price, 
  quota, 
  features, 
  priceId,
  isPopular = false 
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur lors de la création de la session de paiement')
        setLoading(false)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 transition-all hover:shadow-xl ${
      isPopular ? 'border-rose-300 hover:border-rose-400' : 'border-rose-100 hover:border-rose-300'
    }`}>
      {isPopular && (
        <div className="absolute top-0 right-0 bg-rose-600 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
          Populaire
        </div>
      )}
      
      <div className={`text-center ${isPopular ? 'mt-4' : ''}`}>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="mb-6">
          <span className="text-5xl font-bold text-rose-600">€{price}</span>
          <span className="text-gray-600">/mois</span>
        </div>
        <p className="text-gray-600 font-medium mb-6">
          {quota} générations par mois
        </p>
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="w-6 h-6 text-rose-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`${isPopular ? 'font-medium' : ''} text-gray-700`}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isPopular
            ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white'
            : 'bg-rose-600 hover:bg-rose-700 text-white'
        }`}
      >
        {loading ? 'Chargement...' : `S'abonner au plan ${name}`}
      </button>
    </div>
  )
}
