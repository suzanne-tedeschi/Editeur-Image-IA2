'use client'
import React, { useState, useRef } from 'react'
import { examplePrompts } from '../lib/examples'

interface GenerationResult {
  success: boolean
  output_image_url?: string
  input_image_url?: string
  error?: string
}

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showExamples, setShowExamples] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    
    if (!file) {
      setError('Veuillez choisir une image')
      return
    }
    
    if (!prompt.trim()) {
      setError('Veuillez saisir un prompt de transformation')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('prompt', prompt)

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      setResult(data)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setPreview(null)
    setPrompt('')
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt)
    setShowExamples(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50"></div>
      
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
            Éditeur d'Images IA
          </h1>
          <p className="text-gray-600 text-lg">
            Transformez vos photos avec l'intelligence artificielle
          </p>
        </header>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-200/50 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📸 Votre image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-2xl hover:border-pink-400 transition-all duration-300 flex items-center justify-center bg-gray-50/50 hover:bg-pink-50/50 group"
                >
                  {preview ? (
                    <div className="relative w-full h-full p-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          Changer
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="text-5xl mb-4">🎨</div>
                      <p className="text-gray-500 font-medium">Cliquez pour uploader</p>
                      <p className="text-gray-400 text-sm mt-2">JPG, PNG ou WEBP</p>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ✍️ Décrivez la transformation
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Transform into a magical fairy with butterfly wings, dreamy atmosphere, fantasy art..."
                  className="flex-1 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none bg-white/50 text-gray-700 placeholder-gray-400"
                  rows={6}
                />
                
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  className="mt-3 text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 self-start"
                >
                  <span>💡</span>
                  {showExamples ? 'Masquer les exemples' : 'Voir des exemples'}
                </button>
              </div>
            </div>

            {showExamples && (
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-700 mb-4">Idées créatives :</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExamplePrompt(example.prompt)}
                      className="text-left p-3 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-transparent hover:border-pink-200"
                    >
                      <div className="font-medium text-pink-600 text-sm mb-1">{example.title}</div>
                      <div className="text-xs text-gray-500">{example.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !file || !prompt.trim()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-semibold text-lg disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-pink-200 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Génération...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    Générer
                  </span>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Recommencer
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🎨</div>
              <h3 className="text-xl font-semibold text-gray-800">
                Création en cours...
              </h3>
              <p className="text-gray-600">
                L'IA transforme votre image. Cela peut prendre 30s à 2min.
              </p>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-400 to-rose-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {result && result.success && result.output_image_url && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-200/50 p-8">
            <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              ✨ Votre création est prête !
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {result.input_image_url && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Image originale</h4>
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={result.input_image_url}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm">Résultat IA</h4>
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl ring-2 ring-pink-200">
                  <img
                    src={result.output_image_url}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <a
                href={result.output_image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-emerald-200"
              >
                <span>📥</span>
                Télécharger
              </a>
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Propulsé par Replicate & Supabase</p>
        </footer>
      </div>
    </div>
  )
}