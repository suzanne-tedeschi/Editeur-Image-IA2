# Authentification - Documentation

## 📋 Ce qui a été mis en place

### 1. **AuthContext** (`contexts/AuthContext.tsx`)
Context React qui gère l'état d'authentification globale :
- Écoute `auth.onAuthStateChange()` de Supabase
- Fournit `user`, `session`, `loading`, `signUp()`, `signIn()`, `signOut()`
- Hook personnalisé `useAuth()` pour accéder facilement au contexte

### 2. **Composant AuthForm** (`components/AuthForm.tsx`)
Formulaire d'authentification avec :
- Onglets connexion/inscription
- Validation des champs (email, mot de passe min 6 caractères)
- Messages d'erreur et de succès
- Redirection vers `/dashboard` après connexion

### 3. **Header** (`components/Header.tsx`)
En-tête affiché sur toutes les pages :
- Si connecté : affiche l'email + bouton "Déconnexion" + lien "Dashboard"
- Si non connecté : boutons "Connexion" et "Inscription"

### 4. **Pages créées**

#### `/login` (`app/login/page.tsx`)
Page de connexion avec formulaire

#### `/signup` (`app/signup/page.tsx`)
Page d'inscription avec formulaire

#### `/dashboard` (`app/dashboard/page.tsx`)
Page protégée avec :
- Formulaire d'upload d'image + prompt
- Galerie "Mes projets" qui affiche uniquement les projets de l'utilisateur (`WHERE user_id = auth.uid()`)
- Bouton supprimer pour chaque projet
- Redirection automatique vers `/login` si non authentifié (via middleware)

#### `/` (`app/page.tsx`)
Landing page avec :
- Section hero avec CTA vers `/signup`
- Features (3 cartes)
- Comment ça marche (3 étapes)
- CTA final vers inscription

### 5. **Middleware** (`middleware.ts`)
Protège les routes :
- `/dashboard/*` → redirige vers `/login` si non authentifié
- `/api/generate/*` → redirige vers `/login` si non authentifié
- `/api/delete/*` → redirige vers `/login` si non authentifié
- `/login` et `/signup` → redirige vers `/dashboard` si déjà authentifié

### 6. **API Routes**

#### `/api/generate` (`app/api/generate/route.ts`)
- ✅ Vérifie l'authentification via cookies
- ✅ Ajoute `user_id` lors de l'INSERT dans `projects`
- Upload image → Replicate → Sauvegarde dans Supabase

#### `/api/delete` (`app/api/delete/route.ts`)
- ✅ Vérifie l'authentification
- ✅ Vérifie que le projet appartient à l'utilisateur (`project.user_id === user.id`)
- Supprime les images des buckets (`input-images` et `output-images`)
- Supprime l'entrée de la table `projects`

### 7. **Layout** (`app/layout.tsx`)
Wrappé avec :
- `<AuthProvider>` pour fournir le contexte d'auth à toute l'app
- `<Header />` affiché sur toutes les pages

## 🗄️ Base de données Supabase

Assurez-vous que votre table `projects` a cette structure :

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_image_url TEXT,
  output_image_url TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir uniquement leurs projets
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent insérer leurs propres projets
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent supprimer leurs propres projets
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

## 📦 Packages installés

```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared
```

## 🚀 Déploiement Vercel

N'oubliez pas d'ajouter ces variables d'environnement sur Vercel :

```
NEXT_PUBLIC_SUPABASE_URL=https://lytalbwasjtohwzpenxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REPLICATE_API_TOKEN=r8_...
REPLICATE_MODEL=google/nano-banana
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images
```

## ✅ Tests à effectuer

1. **Inscription** : Aller sur `/signup`, créer un compte
2. **Email de confirmation** : Vérifier votre email (si activé dans Supabase)
3. **Connexion** : Aller sur `/login`, se connecter
4. **Dashboard** : Vérifier que vous êtes redirigé vers `/dashboard`
5. **Upload** : Uploader une image et générer
6. **Galerie** : Vérifier que le projet apparaît dans "Mes projets"
7. **Suppression** : Supprimer un projet
8. **Déconnexion** : Cliquer sur "Déconnexion" dans le header
9. **Protection** : Essayer d'accéder à `/dashboard` sans être connecté

## 🎨 Améliorations possibles

- Ajouter la réinitialisation de mot de passe
- Ajouter la modification de profil
- Ajouter des filtres dans la galerie (date, statut)
- Ajouter la pagination pour les projets
- Ajouter des loaders pendant le chargement des projets
- Ajouter des animations (framer-motion)
- Ajouter le téléchargement des images depuis le dashboard
