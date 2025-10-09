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
  }

  return (

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-rose-50 py-12">
          <div className="w-full max-w-6xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Editeur Image IA</h1>
                <p className="text-gray-600 text-lg">Applique des transformations créatives à tes photos en un clic — powered by Replicate & Supabase.</p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <a href="#editor" className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-5 py-3 rounded-lg shadow hover:scale-105 transition-transform">🎨 Commencer</a>
                  <button onClick={() => window.open('https://github.com','_blank')} className="inline-flex items-center gap-3 border border-gray-200 px-5 py-3 rounded-lg text-gray-700 hover:bg-gray-50">📂 Voir le repo</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-gray-500">Résolution</div>
                    <div className="font-semibold">1024×1024+</div>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-xs text-gray-500">Modèles</div>
                    <div className="font-semibold">Photomaker et plus</div>
                  </div>
                </div>
              </div>

              <div id="editor" className="bg-white rounded-2xl shadow-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex gap-4">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="w-1/2">
                      <label className="text-xs font-medium text-gray-600 mb-2 block">Image</label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 h-48 flex items-center justify-center">
                        {preview ? (
                          <img src={preview} alt="preview" className="object-cover w-full h-full rounded-md" />
                        ) : (
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-gray-500">Cliquez pour uploader ou glisser-déposer</button>
                        )}
                      </div>
                    </div>

                    <div className="w-1/2">
                      <label className="text-xs font-medium text-gray-600 mb-2 block">Prompt</label>
                      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full p-3 border rounded-lg resize-none text-sm" placeholder="Ex: Transform into a dreamy portrait with soft lighting and pastel colors..."></textarea>

                      <div className="flex items-center justify-between mt-3">
                        <button type="button" onClick={() => setShowExamples(!showExamples)} className="text-sm text-pink-600">💡 Exemples</button>
                        <div className="text-xs text-gray-400">Conseil : sois précis pour de meilleurs résultats</div>
                      </div>
                    </div>
                  </div>

                  {showExamples && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {examplePrompts.map((example, i) => (
                        <button key={i} type="button" onClick={() => handleExamplePrompt(example.prompt)} className="text-left p-3 bg-gray-50 rounded-md hover:shadow"> 
                          <div className="text-xs text-pink-600 font-medium">{example.title}</div>
                          <div className="text-xs text-gray-500">{example.category}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                  <div className="flex gap-3">
                    <button type="submit" disabled={loading || !file || !prompt.trim()} className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-60">{loading ? 'Génération...' : 'Générer'}</button>
                    <button type="button" onClick={handleReset} className="px-4 py-3 border rounded-lg">Recommencer</button>
                  </div>

                  {result && result.success && result.output_image_url && (
                    <div className="mt-4 border-t pt-4">
                      <div className="text-sm text-gray-600 mb-2">Résultat</div>
                      <div className="rounded-lg overflow-hidden shadow">
                        <img src={result.output_image_url} alt="generated" className="w-full h-72 object-cover" />
                      </div>
                      <div className="flex gap-3 mt-3">
                        <a href={result.output_image_url} target="_blank" rel="noreferrer" className="inline-block px-4 py-2 bg-emerald-500 text-white rounded">Télécharger</a>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
            <footer className="mt-10 text-center text-xs text-gray-400">Propulsé par Replicate · Supabase</footer>
          </div>
        </div>
      )
    }
