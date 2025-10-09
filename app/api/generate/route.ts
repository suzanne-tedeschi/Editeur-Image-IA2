import { NextResponse } from 'next/server'
import { supabaseAdmin, SUPABASE_INPUT_BUCKET, SUPABASE_OUTPUT_BUCKET } from '../../../lib/supabaseServer'
import { v4 as uuidv4 } from 'uuid'
import Replicate from 'replicate'

async function uploadBufferToBucket(bucket: string, path: string, buffer: Buffer, contentType?: string) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, {
    contentType: contentType || 'application/octet-stream',
    cacheControl: '3600',
    upsert: false,
  } as any)
  if (error) throw error
  return data
}

async function getPublicUrl(bucket: string, path: string) {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

async function generateImageWithReplicate(imageUrl: string, prompt: string) {
  const token = process.env.REPLICATE_API_TOKEN
  const model = process.env.REPLICATE_MODEL || 'google/nano-banana'
  
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN not set')
  }

  const replicate = new Replicate({
    auth: token,
  })

  console.log('🤖 Génération avec Replicate...')
  console.log('📝 Prompt:', prompt)
  console.log('🖼️ Image URL:', imageUrl)
  console.log('🔧 Modèle:', model)

  try {
    // Configuration spécifique pour google/nano-banana
    if (model.includes('nano-banana')) {
      console.log('🍌 Utilisation de Google nano-banana avec le bon format...')
      
      const output = await replicate.run("google/nano-banana", {
        input: {
          prompt: prompt,
          image_input: [imageUrl]  // nano-banana attend un array d'images
        }
      })
      
      console.log('✅ Génération réussie:', output)
      return output
    }
    
    // Gestion flexible des paramètres selon les erreurs API
    let inputParams: any = {
      image: imageUrl,
      prompt: prompt,
      num_inference_steps: 20,
      guidance_scale: 7.5
    }

    // Configuration spécifique pour google/nano-banana
    if (model.includes('nano-banana')) {
      inputParams = {
        image: imageUrl,
        prompt: prompt,
        num_inference_steps: 25,
        guidance_scale: 8.0,
        strength: 0.7
      }
    }
    
    // Configuration spécifique pour instruct-pix2pix
    if (model.includes('instruct-pix2pix')) {
      inputParams = {
        image: imageUrl,
        prompt: prompt,
        num_inference_steps: 10,
        guidance_scale: 7.5,
        image_guidance_scale: 1.5
      }
    }

    const output = await replicate.run(model as any, {
      input: inputParams
    })

    console.log('✅ Génération terminée:', output)
    return output
  } catch (error: any) {
    console.error('❌ Erreur Replicate:', error)
    
    // Gestion spécifique des erreurs API pour google/nano-banana
    if (error.message && error.message.includes('input_image is required')) {
      console.log('🔄 Tentative avec input_image pour Google...')
      try {
        const retryOutput = await replicate.run(model as any, {
          input: {
            input_image: imageUrl,
            prompt: prompt,
            num_inference_steps: 25,
            guidance_scale: 8.0
          }
        })
        console.log('✅ Réussi avec input_image:', retryOutput)
        return retryOutput
      } catch (retryError: any) {
        console.error('❌ Échec du retry:', retryError)
        throw new Error(`Erreur lors de la génération: ${retryError.message}`)
      }
    }
    
    if (error.message && error.message.includes('trigger word')) {
      console.log('🔄 Google nano-banana a aussi besoin du préfixe img...')
      // Réessayer avec le préfixe "img"
      const promptWithImg = prompt.startsWith('img ') ? prompt : `img ${prompt}`
      try {
        const retryOutput = await replicate.run(model as any, {
          input: {
            image: imageUrl,
            prompt: promptWithImg,
            num_inference_steps: 25,
            guidance_scale: 8.0,
            strength: 0.7
          }
        })
        console.log('✅ Réussi avec img pour Google:', retryOutput)
        return retryOutput
      } catch (retryError: any) {
        console.error('❌ Échec du retry img Google:', retryError)
        throw new Error(`Erreur: Le modèle Google nécessite "img" dans le prompt`)
      }
    }
    
    throw new Error(`Erreur lors de la génération: ${error.message}`)
  }
}

export async function POST(req: Request) {
  try {
    console.log('🚀 Début de la génération d\'image...')
    
    const form = await req.formData()
    const file = form.get('image') as File | null
    const prompt = String(form.get('prompt') || '')
    
    if (!file) {
      return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 })
    }
    if (!prompt) {
      return NextResponse.json({ error: 'Aucun prompt fourni' }, { status: 400 })
    }

    console.log('📁 Upload de l\'image d\'entrée...')
    
    // Upload de l'image d'entrée
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = (file.name || 'upload').split('.').pop() || 'png'
    const inputPath = `input-${uuidv4()}.${ext}`

    await uploadBufferToBucket(SUPABASE_INPUT_BUCKET, inputPath, buffer, file.type)
    const inputPublicUrl = await getPublicUrl(SUPABASE_INPUT_BUCKET, inputPath)
    
    console.log('📤 Image uploadée:', inputPublicUrl)

    // Génération avec Replicate
    const output = await generateImageWithReplicate(inputPublicUrl, prompt)

    // Debug: voir le format exact de la sortie
    console.log('🔍 Type de sortie:', typeof output)
    console.log('🔍 Sortie complète:', JSON.stringify(output, null, 2))
    console.log('🔍 Output methods:', output && typeof output === 'object' ? Object.getOwnPropertyNames(Object.getPrototypeOf(output)) : 'N/A')

    // Traitement de la sortie
    let outputImageUrl: string | null = null
    
    // Nano-banana retourne un objet FileOutput avec méthode .url()
    if (output && typeof output === 'object' && 'url' in output && typeof output.url === 'function') {
      outputImageUrl = output.url()
      console.log('✅ URL extraite avec .url():', outputImageUrl)
    } else if (Array.isArray(output) && output.length > 0) {
      outputImageUrl = output[0] as string
      console.log('✅ URL extraite du tableau:', outputImageUrl)
    } else if (typeof output === 'string') {
      outputImageUrl = output
      console.log('✅ URL directe:', outputImageUrl)
    } else if (output && typeof output === 'object') {
      // Essayer différentes propriétés possibles
      const outputObj = output as any
      const possibleKeys = ['url', 'image', 'output', 'result', 'data']
      for (const key of possibleKeys) {
        if (outputObj[key]) {
          if (typeof outputObj[key] === 'string') {
            outputImageUrl = outputObj[key]
            console.log(`✅ URL trouvée dans ${key}:`, outputImageUrl)
            break
          } else if (Array.isArray(outputObj[key]) && outputObj[key].length > 0) {
            outputImageUrl = outputObj[key][0]
            console.log(`✅ URL trouvée dans ${key}[0]:`, outputImageUrl)
            break
          }
        }
      }
      
      if (!outputImageUrl) {
        console.log('❌ Propriétés disponibles:', Object.keys(outputObj))
        throw new Error(`Format de sortie objet non reconnu. Propriétés: ${Object.keys(outputObj).join(', ')}`)
      }
    } else {
      throw new Error(`Format de sortie non reconnu. Type: ${typeof output}, Contenu: ${JSON.stringify(output)}`)
    }

    if (!outputImageUrl) {
      throw new Error('Aucune image générée')
    }

    console.log('⬇️ Téléchargement de l\'image générée...')

    // Téléchargement et upload de l'image générée
    const response = await fetch(outputImageUrl)
    if (!response.ok) {
      throw new Error('Échec du téléchargement de l\'image générée')
    }

    const outputBuffer = Buffer.from(await response.arrayBuffer())
    const outputPath = `output-${uuidv4()}.png`
    
    await uploadBufferToBucket(SUPABASE_OUTPUT_BUCKET, outputPath, outputBuffer, 'image/png')
    const outputPublicUrl = await getPublicUrl(SUPABASE_OUTPUT_BUCKET, outputPath)

    console.log('💾 Sauvegarde du projet...')

    // Sauvegarde dans la base de données
    const { error: insertError } = await supabaseAdmin.from('projects').insert({
      id: uuidv4(),
      input_image_url: inputPublicUrl,
      output_image_url: outputPublicUrl,
      prompt,
      status: 'completed',
      created_at: new Date().toISOString()
    })

    if (insertError) {
      console.error('❌ Erreur lors de la sauvegarde:', insertError)
    } else {
      console.log('✅ Projet sauvegardé avec succès')
    }

    return NextResponse.json({ 
      success: true,
      output_image_url: outputPublicUrl,
      input_image_url: inputPublicUrl
    })

  } catch (error: any) {
    console.error('❌ Erreur générale:', error)
    
    // Tentative de sauvegarde de l'erreur
    try {
      await supabaseAdmin.from('projects').insert({
        id: uuidv4(),
        input_image_url: null,
        output_image_url: null,
        prompt: error.message || 'Erreur inconnue',
        status: 'failed',
        created_at: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('❌ Erreur lors de la sauvegarde de l\'erreur:', dbError)
    }

    return NextResponse.json({ 
      error: error.message || 'Une erreur est survenue lors de la génération'
    }, { status: 500 })
  }
}
