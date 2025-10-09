import { NextResponse } from 'next/server'
import { supabaseAdmin, SUPABASE_INPUT_BUCKET, SUPABASE_OUTPUT_BUCKET } from '../../../lib/supabaseServer'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: Request) {
  try {
    console.log('🗑️ Début de la suppression...')
    
    // Vérifier l'authentification via le header Authorization
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      console.error('❌ Aucun token fourni')
      return NextResponse.json({ error: 'Non authentifié - token manquant' }, { status: 401 })
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Non authentifié:', authError)
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    const { projectId } = await req.json()
    
    if (!projectId) {
      return NextResponse.json({ error: 'ID du projet manquant' }, { status: 400 })
    }
    
    console.log('📋 Récupération du projet:', projectId)
    
    // Récupérer le projet pour vérifier qu'il appartient à l'utilisateur
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (fetchError || !project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }
    
    // Vérifier que le projet appartient bien à l'utilisateur
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    
    console.log('🗑️ Suppression des images du storage...')
    
    // Extraire les paths des URLs
    const extractPath = (url: string, bucket: string) => {
      try {
        const urlObj = new URL(url)
        const pathMatch = urlObj.pathname.match(new RegExp(`${bucket}/(.+)`))
        return pathMatch ? pathMatch[1] : null
      } catch {
        return null
      }
    }
    
    // Supprimer l'image d'entrée
    if (project.input_image_url) {
      const inputPath = extractPath(project.input_image_url, SUPABASE_INPUT_BUCKET)
      if (inputPath) {
        const { error: deleteInputError } = await supabaseAdmin
          .storage
          .from(SUPABASE_INPUT_BUCKET)
          .remove([inputPath])
        
        if (deleteInputError) {
          console.error('❌ Erreur suppression image d\'entrée:', deleteInputError)
        } else {
          console.log('✅ Image d\'entrée supprimée')
        }
      }
    }
    
    // Supprimer l'image de sortie
    if (project.output_image_url) {
      const outputPath = extractPath(project.output_image_url, SUPABASE_OUTPUT_BUCKET)
      if (outputPath) {
        const { error: deleteOutputError } = await supabaseAdmin
          .storage
          .from(SUPABASE_OUTPUT_BUCKET)
          .remove([outputPath])
        
        if (deleteOutputError) {
          console.error('❌ Erreur suppression image de sortie:', deleteOutputError)
        } else {
          console.log('✅ Image de sortie supprimée')
        }
      }
    }
    
    console.log('🗑️ Suppression du projet de la base...')
    
    // Supprimer le projet de la base de données
    const { error: deleteError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (deleteError) {
      throw deleteError
    }
    
    console.log('✅ Projet supprimé avec succès')
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la suppression:', error)
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la suppression'
    }, { status: 500 })
  }
}
