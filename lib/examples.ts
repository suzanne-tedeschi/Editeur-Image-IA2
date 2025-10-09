// Exemples de prompts pour tester l'application

export const examplePrompts = [
  {
    title: "Superhéros",
    prompt: "Transform this person into a superhero with a cape and mask, dramatic lighting, cinematic style",
    category: "Fantasy"
  },
  {
    title: "Peinture Renaissance",
    prompt: "Convert to a renaissance painting style, oil painting, classical art, museum quality",
    category: "Art Style"
  },
  {
    title: "Cyberpunk",
    prompt: "Transform into a cyberpunk character with neon lights, futuristic city background, high tech aesthetic",
    category: "Sci-Fi"
  },
  {
    title: "Aquarelle",
    prompt: "Convert to watercolor painting style with soft pastel colors, artistic brushstrokes",
    category: "Art Style"
  },
  {
    title: "Vintage",
    prompt: "Transform into a vintage 1920s style portrait, sepia tones, classic photography",
    category: "Photography"
  },
  {
    title: "Anime",
    prompt: "Convert to anime art style, manga character, colorful, Japanese animation style",
    category: "Animation"
  }
]

export const imageFormats = {
  supported: [
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'
  ],
  maxSize: '5MB',
  recommended: 'JPG ou PNG pour de meilleurs résultats'
}