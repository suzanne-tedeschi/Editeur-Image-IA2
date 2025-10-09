# ✨ Éditeur d'Images IA

Un éditeur d'images moderne alimenté par l'intelligence artificielle utilisant Next.js, Supabase et le modèle PhotoMaker de Replicate.

![Éditeur d'Images IA](https://img.shields.io/badge/Next.js-13-black) ![Supabase](https://img.shields.io/badge/Supabase-Storage-green) ![Replicate](https://img.shields.io/badge/Replicate-PhotoMaker-blue)

## 🚀 Fonctionnalités

- **Interface moderne** avec Tailwind CSS
- **Upload d'images** avec aperçu en temps réel
- **Transformation IA** utilisant le modèle PhotoMaker de TencentARC
- **Stockage cloud** avec Supabase Storage
- **Base de données** pour l'historique des projets
- **Design responsive** et optimisé UX

## 🛠️ Technologies

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: API Routes Next.js
- **IA**: Replicate (TencentARC PhotoMaker)
- **Storage**: Supabase Storage
- **Database**: Supabase PostgreSQL

## ⚙️ Configuration

### 1. Supabase Setup

#### Buckets Storage
Créez les buckets suivants dans Supabase Storage :
- `input-images` (pour les images uploadées)
- `output-images` (pour les images générées)

#### Table Database
Créez la table `projects` avec la structure suivante :

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  input_image_url TEXT,
  output_image_url TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'pending'
);
```

### 2. Variables d'Environnement

Créez un fichier `.env.local` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lytalbwasjtohwzpenxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Supabase Buckets
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images

# Replicate Configuration
REPLICATE_API_TOKEN=votre_replicate_token
REPLICATE_MODEL=tencentarc/photomaker:ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4
```

## 📦 Installation

```bash
# Cloner le projet
cd "Editeur Image IA"

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Puis éditez .env.local avec vos clés

# Lancer en mode développement
npm run dev
```

## 🎯 Utilisation

1. **Ouvrez** http://localhost:3000
2. **Uploadez** une image (formats supportés: JPG, PNG, WEBP)
3. **Décrivez** la transformation souhaitée dans le prompt
4. **Cliquez** sur "Générer" et attendez le résultat
5. **Téléchargez** l'image transformée

### Exemples de Prompts

```
Transform this person into a superhero with a cape and mask, cinematic lighting
Convert to watercolor painting style with soft pastel colors
Make this portrait look like a renaissance painting
Transform into a cyberpunk character with neon lights
```

## 📁 Structure du Projet

```
├── app/
│   ├── api/generate/
│   │   └── route.ts          # API pour la génération d'images
│   ├── globals.css           # Styles Tailwind
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── lib/
│   ├── supabaseClient.ts    # Client Supabase (frontend)
│   └── supabaseServer.ts    # Client Supabase (backend)
├── .env.local               # Variables d'environnement
├── package.json
├── tailwind.config.js       # Configuration Tailwind
└── README.md
```

## 🔧 API Endpoints

### POST `/api/generate`

Génère une image transformée à partir d'une image d'entrée et d'un prompt.

**Body (FormData):**
- `image`: Fichier image (File)
- `prompt`: Description de la transformation (string)

**Response:**
```json
{
  "success": true,
  "output_image_url": "https://...",
  "input_image_url": "https://..."
}
```

## 🐛 Dépannage

### Erreurs communes

**"Insufficient credits"**: Vérifiez votre solde Replicate et ajoutez des crédits si nécessaire.

**"Supabase env variables are required"**: Vérifiez que toutes les variables d'environnement Supabase sont définies.

**"Failed to upload to bucket"**: Vérifiez que les buckets existent et sont configurés correctement.

## 📝 Notes Importantes

- **Sécurité**: La `SUPABASE_SERVICE_ROLE_KEY` doit rester secrète (côté serveur uniquement)
- **Performance**: La génération peut prendre 30 secondes à 2 minutes selon la complexité
- **Limites**: Respectez les limites de taille d'image de Replicate (généralement < 5MB)

## 🚀 Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans le dashboard Vercel
```

### Variables d'environnement de production

N'oubliez pas de configurer toutes les variables d'environnement dans votre plateforme de déploiement.

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

---

Développé avec ❤️ en utilisant Next.js, Supabase et Replicate
