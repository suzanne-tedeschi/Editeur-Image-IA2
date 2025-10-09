'use client'

import { useState, useRef } from 'react'
import { examplePrompts } from '../lib/examples'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Veuillez sélectionner une image')
      return
    }
    
    if (!prompt.trim()) {
      setError('Veuillez saisir un prompt de transformation')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = new FormData()
      data.append('image', file)
      data.append('prompt', prompt.trim())

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: data,
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        // Si la réponse n'est pas du JSON, récupérer le texte brut
        const textResponse = await response.text()
        console.error('Erreur JSON:', jsonError)
        console.error('Réponse brute:', textResponse)
        throw new Error('Erreur de format de réponse du serveur')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la génération')
      }

      setResult(result)
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

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="logo">AI</div>
          <span>ImageAI Studio</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          <div className="center" style={{ marginBottom: '32px' }}>
            <h1 className="title">Transformez vos images avec l'IA</h1>
            <p className="subtitle">Créez des œuvres d'art extraordinaires en quelques clics</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="stack">
              {/* Upload Section */}
              <div>
                <label>Votre image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={preview} 
                        alt="preview" 
                        style={{ 
                          maxHeight: '200px', 
                          maxWidth: '100%', 
                          borderRadius: '12px', 
                          marginBottom: '12px' 
                        }} 
                      />
                      <p className="helper">Cliquez pour changer d'image</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                      <h3 style={{ marginBottom: '8px' }}>Glissez votre image ici</h3>
                      <p className="helper">ou cliquez pour parcourir vos fichiers</p>
                      <p className="helper">PNG, JPG, WEBP • Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Section */}
              <div>
                <label>Décrivez votre transformation</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="field"
                  placeholder="Ex: transform into a cyberpunk style with neon lights..."
                  rows={4}
                />
              </div>



              {/* Error Display */}
              {error && (
                <div className="error">
                  ⚠️ {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="actions">
                <button
                  type="submit"
                  disabled={loading || !file || !prompt.trim()}
                  className="btn"
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <div className="loader"></div>
                      Génération...
                    </span>
                  ) : (
                    '✨ Transformer l\'image'
                  )}
                </button>
                
                {(file || prompt || result) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn ghost"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results */}
          {result && result.success && result.output_image_url && (
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="stack">
                <div className="center">
                  <h2 className="title">🎉 Transformation réussie !</h2>
                  <p className="helper">Comparez votre création</p>
                </div>
                
                <div className="thumbs">
                  {preview && (
                    <div className="thumb">
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--muted)' }}>Avant</h4>
                      <img src={preview} alt="original" />
                    </div>
                  )}
                  
                  <div className="thumb">
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>Après</h4>
                    <img src={result.output_image_url} alt="generated" />
                  </div>
                </div>
                
                <div className="actions">
                  <a
                    href={result.output_image_url}
                    download
                    className="btn"
                    style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                  >
                    💾 Télécharger HD
                  </a>
                  <button
                    onClick={handleReset}
                    className="btn ghost"
                  >
                    🔄 Nouvelle création
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <p>Powered by Replicate AI • Next.js • Supabase</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>© 2025 ImageAI Studio. Créativité sans limites.</p>
        </div>
      </footer>
    </div>
  )
}