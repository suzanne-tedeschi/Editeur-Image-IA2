# 🎨 AI Image Editor - Éditeur d'Images IA

Application Next.js 13 pour transformer vos images avec l'intelligence artificielle, propulsée par Replicate et Supabase.

![Next.js](https://img.shields.io/badge/Next.js-13-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Storage-green)
![Replicate](https://img.shields.io/badge/Replicate-AI-purple)

## ✨ Fonctionnalités

- 🔐 **Authentification complète** (email/mot de passe via Supabase Auth)
- 🎨 **Génération d'images IA** (via Replicate - modèle nano-banana)
- 📸 **Upload d'images** avec preview
- 💾 **Sauvegarde automatique** dans Supabase Storage
- 🗂️ **Galerie personnelle** de vos projets
- 🗑️ **Suppression de projets** avec nettoyage des images
- 🔒 **Row Level Security** (RLS) pour la protection des données
- 🚀 **Optimisé pour Vercel**

## 🏗️ Stack Technique

- **Framework**: Next.js 13 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Storage**: Supabase Storage (buckets publics)
- **IA**: Replicate API (nano-banana model)
- **Déploiement**: Vercel

## 📋 Prérequis

- Node.js 18+ 
- Compte Supabase (gratuit)
- Compte Replicate avec API token
- npm ou pnpm

## 🚀 Installation

### 1. Cloner le repo

```bash
git clone https://github.com/suzanne-tedeschi/Editeur-Image-IA2.git
cd Editeur-Image-IA2
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### A. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et les API keys

#### B. Exécuter le script SQL
1. Ouvrez SQL Editor dans votre dashboard Supabase
2. Copiez et exécutez le contenu de `supabase_setup.sql`
3. Cela créera la table `projects` avec les policies RLS

#### C. Créer les buckets Storage
1. Allez dans Storage
2. Créez deux buckets publics :
   - `input-images`
   - `output-images`

### 4. Configuration Replicate

1. Créez un compte sur [replicate.com](https://replicate.com)
2. Générez un API token dans votre profil
3. Notez le token (commence par `r8_`)

### 5. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Replicate
REPLICATE_API_TOKEN=r8_votre_token
REPLICATE_MODEL=google/nano-banana

# Buckets
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images
```

### 6. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[AUTHENTICATION_README.md](./AUTHENTICATION_README.md)** - Système d'authentification complet
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Guide de déploiement Vercel
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Récapitulatif de l'implémentation
- **[supabase_setup.sql](./supabase_setup.sql)** - Script SQL pour la base de données

## 🗂️ Structure du projet

```
├── app/
│   ├── api/
│   │   ├── generate/       # API génération d'images
│   │   └── delete/         # API suppression projets
│   ├── dashboard/          # Page dashboard (protégée)
│   ├── login/              # Page connexion
│   ├── signup/             # Page inscription
│   ├── layout.tsx          # Layout principal avec AuthProvider
│   └── page.tsx            # Landing page
├── components/
│   ├── AuthForm.tsx        # Formulaire auth (login/signup)
│   └── Header.tsx          # En-tête avec user menu
├── contexts/
│   └── AuthContext.tsx     # Context d'authentification
├── lib/
│   ├── supabaseClient.ts   # Client Supabase (browser)
│   └── supabaseServer.ts   # Client Supabase (server)
├── middleware.ts           # Protection des routes
└── .env.local              # Variables d'environnement (à créer)
```

## 🔒 Sécurité

- ✅ Row Level Security (RLS) activée
- ✅ Vérification d'authentification dans les API routes
- ✅ Vérification de ownership avant suppression
- ✅ Protection des routes via middleware
- ✅ Variables sensibles dans .env (gitignored)

## 🧪 Tests

Pour tester le flow complet :

1. Créez un compte sur `/signup`
2. Confirmez votre email (si configuré dans Supabase)
3. Connectez-vous sur `/login`
4. Uploadez une image sur `/dashboard`
5. Entrez un prompt et générez
6. Visualisez le résultat dans "Mes projets"
7. Supprimez un projet
8. Déconnectez-vous

## 📦 Build

```bash
# Build de production
npm run build

# Lancer en production locale
npm start
```

## 🚀 Déploiement Vercel

Voir [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) pour les instructions détaillées.

**Résumé rapide :**

1. Push sur GitHub
2. Connectez le repo à Vercel
3. Ajoutez les variables d'environnement
4. Déployez !

## 🐛 Problèmes courants

### "Non authentifié"
- Vérifiez que les cookies fonctionnent
- Vérifiez les Redirect URLs dans Supabase

### "Bucket not found"
- Créez les buckets dans Supabase Storage
- Vérifiez qu'ils sont publics

### "RLS policy violation"
- Exécutez le script `supabase_setup.sql`
- Vérifiez que RLS est activé

### Erreur 500 lors de la génération
- Vérifiez le token Replicate
- Consultez les logs Vercel/console

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT

## 👤 Auteur

**Suzanne Tedeschi**

- GitHub: [@suzanne-tedeschi](https://github.com/suzanne-tedeschi)
- Projet: [Editeur-Image-IA2](https://github.com/suzanne-tedeschi/Editeur-Image-IA2)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Replicate](https://replicate.com/)
- [Vercel](https://vercel.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

⭐ N'hésitez pas à mettre une étoile si ce projet vous a aidé !
