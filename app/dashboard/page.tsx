'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'
import SubscriptionStatus from '@/components/SubscriptionStatus'

interface Project {
  id: string
  user_id: string
  input_image_url: string
  output_image_url: string
  prompt: string
  status: string
  created_at: string
}

interface Subscription {
  stripe_price_id: string  // Changé de plan_type à stripe_price_id
  status: string
  quota_limit: number      // Changé de quota_total à quota_limit
  quota_used: number
  current_period_end: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  // Helper pour déterminer le type de plan depuis le price_id
  const getPlanType = (priceId: string): 'basic' | 'pro' => {
    const BASIC_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC
    const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO
    
    if (priceId === PRO_PRICE_ID) {
      return 'pro'
    }
    return 'basic'
  }

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Charger les projets et l'abonnement de l'utilisateur
  useEffect(() => {
    if (user) {
      loadProjects()
      loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    if (!user) return

    setLoadingSubscription(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = pas de résultat
        console.error('Error loading subscription:', error)
      }
      setSubscription(data)
    } catch (err: any) {
      console.error('Error loading subscription:', err)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'accès au portail client')
    }
  }

  const loadProjects = async () => {
    if (!user) return

    setLoadingProjects(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      console.error('Error loading projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !prompt) {
      setError('Veuillez sélectionner une image et entrer un prompt')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Obtenir le token de session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expirée, veuillez vous reconnecter')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('prompt', prompt)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        // Vérifier si l'utilisateur doit s'abonner
        if (data.needsSubscription || data.quotaExceeded) {
          setError(data.error)
          setTimeout(() => {
            router.push('/pricing')
          }, 2000)
          return
        }
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      setSuccess('Image générée avec succès !')
      setFile(null)
      setPreview(null)
      setPrompt('')
      
      // Recharger les projets et l'abonnement
      await loadProjects()
      await loadSubscription()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return

    try {
      // Obtenir le token de session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Session expirée, veuillez vous reconnecter')
      }

      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      setProjects(projects.filter(p => p.id !== projectId))
      setSuccess('Projet supprimé avec succès')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p>Veuillez vous connecter pour accéder au dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec abonnement */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenue, {user.email}</p>
          </div>
          <Link
            href="/"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        {/* Carte d'abonnement */}
        {!loadingSubscription && (
          <>
            {subscription ? (
              <div className="mb-8">
                <SubscriptionStatus
                  planType={getPlanType(subscription.stripe_price_id)}
                  quotaUsed={subscription.quota_used}
                  quotaTotal={subscription.quota_limit}
                  currentPeriodEnd={subscription.current_period_end}
                  onManageSubscription={handleManageSubscription}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-rose-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Aucun abonnement actif
                    </h3>
                    <p className="text-gray-600">
                      Abonnez-vous pour commencer à générer des images avec l'IA
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
                  >
                    Voir les plans
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Formulaire de génération */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-rose-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Générer une nouvelle image</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image d'entrée
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {preview && (
                <div className="mt-4">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Décrivez la transformation souhaitée..."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {subscription && subscription.quota_used >= subscription.quota_limit && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm">
                ⚠️ Quota atteint ({subscription.quota_used}/{subscription.quota_limit}). 
                {getPlanType(subscription.stripe_price_id) === 'basic' ? (
                  <> <Link href="/pricing" className="font-semibold underline">Passez au plan Pro</Link> pour continuer.</>
                ) : (
                  <> Votre quota se renouvellera le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}.</>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (subscription ? subscription.quota_used >= subscription.quota_limit : false)}
              className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Génération en cours...' : (subscription && subscription.quota_used >= subscription.quota_limit) ? 'Quota atteint' : 'Générer'}
            </button>
          </form>
        </div>

        {/* Galerie des projets */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Mes projets</h2>
          
          {loadingProjects ? (
            <div className="text-center py-8">Chargement des projets...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun projet pour le moment. Créez-en un !
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avant</p>
                      <Image
                        src={project.input_image_url}
                        alt="Input"
                        width={200}
                        height={200}
                        className="w-full h-40 object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Après</p>
                      {project.output_image_url ? (
                        <Image
                          src={project.output_image_url}
                          alt="Output"
                          width={200}
                          height={200}
                          className="w-full h-40 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-sm text-gray-500">
                            {project.status === 'processing' ? 'En cours...' : 'En attente'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50">
                    <p className="text-sm text-gray-700 mb-2">{project.prompt}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(project.created_at).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </span>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
