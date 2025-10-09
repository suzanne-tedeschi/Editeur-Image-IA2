'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

interface Project {
  id: string
  user_id: string
  input_image_url: string
  output_image_url: string
  prompt: string
  status: string
  created_at: string
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

  // Rediriger si non authentifié
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Charger les projets de l'utilisateur
  useEffect(() => {
    if (user) {
      loadProjects()
    }
  }, [user])

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
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      setSuccess('Image générée avec succès !')
      setFile(null)
      setPreview(null)
      setPrompt('')
      
      // Recharger les projets
      await loadProjects()
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Mon Dashboard</h1>

        {/* Formulaire de génération */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Générer une nouvelle image</h2>
          
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

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Génération en cours...' : 'Générer'}
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
