'use client'

interface SubscriptionStatusProps {
  planType: string
  quotaUsed: number
  quotaTotal: number
  currentPeriodEnd: string
  onManageSubscription: () => void
}

export default function SubscriptionStatus({
  planType,
  quotaUsed,
  quotaTotal,
  currentPeriodEnd,
  onManageSubscription
}: SubscriptionStatusProps) {
  const percentageUsed = (quotaUsed / quotaTotal) * 100
  const remainingQuota = quotaTotal - quotaUsed

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-rose-100">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Plan {planType.toUpperCase()}
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Quota mensuel:</span>
                <span className="text-sm font-semibold text-gray-700">
                  {remainingQuota} / {quotaTotal} générations restantes
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    percentageUsed >= 90 ? 'bg-red-500' :
                    percentageUsed >= 70 ? 'bg-yellow-500' :
                    'bg-gradient-to-r from-rose-500 to-pink-500'
                  }`}
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Renouvellement: {new Date(currentPeriodEnd).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <button
          onClick={onManageSubscription}
          className="ml-6 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          Gérer mon abonnement
        </button>
      </div>
    </div>
  )
}
