# 🚀 Guide de Déploiement Vercel

## Étapes pour déployer votre application

### 1. Configuration Supabase

Avant de déployer, assurez-vous d'avoir configuré Supabase :

1. **Exécutez le script SQL** dans votre dashboard Supabase (SQL Editor) :
   ```bash
   # Copiez le contenu de supabase_setup.sql et exécutez-le
   ```

2. **Vérifiez les buckets Storage** :
   - `input-images` (public)
   - `output-images` (public)
   
   Créez-les si nécessaire dans Storage > New Bucket

3. **Configurez l'authentification Email** :
   - Authentication > Providers > Email
   - Activez "Enable Email provider"
   - Configurez le template d'email si nécessaire

### 2. Variables d'environnement Vercel

Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

#### Replicate
```
REPLICATE_API_TOKEN=r8_votre_token_ici
REPLICATE_MODEL=google/nano-banana
```

#### Buckets
```
SUPABASE_INPUT_BUCKET=input-images
SUPABASE_OUTPUT_BUCKET=output-images
```

### 3. Déploiement

#### Option A : Via GitHub (Recommandé)

1. Push votre code sur GitHub (déjà fait ✅)
2. Connectez votre repo à Vercel
3. Vercel détecte automatiquement Next.js
4. Ajoutez les variables d'environnement
5. Cliquez sur "Deploy"

#### Option B : Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ou directement en production
vercel --prod
```

### 4. Configuration Post-Déploiement

#### A. Mettre à jour les URL de redirection Supabase

Dans Supabase Dashboard > Authentication > URL Configuration :

**Site URL :**
```
https://votre-app.vercel.app
```

**Redirect URLs :**
```
https://votre-app.vercel.app/dashboard
http://localhost:3000/dashboard
```

#### B. Configurer les domaines Vercel (optionnel)

Si vous avez un domaine personnalisé :
- Vercel > Settings > Domains
- Ajoutez votre domaine
- Configurez les DNS selon les instructions

### 5. Vérification du déploiement

Après le déploiement, testez :

1. ✅ Page d'accueil `/` se charge
2. ✅ Inscription d'un nouveau compte `/signup`
3. ✅ Réception de l'email de confirmation (si activé)
4. ✅ Connexion `/login`
5. ✅ Redirection vers `/dashboard`
6. ✅ Upload d'une image et génération
7. ✅ Visualisation dans "Mes projets"
8. ✅ Suppression d'un projet
9. ✅ Déconnexion et protection des routes

### 6. Monitoring et Logs

- **Logs Vercel** : Vercel Dashboard > Deployments > Votre déploiement > Runtime Logs
- **Logs Supabase** : Supabase Dashboard > Logs
- **Erreurs** : Intégrez Sentry si besoin (optionnel)

### 7. Problèmes courants

#### Erreur : "Non authentifié"
- Vérifiez que les cookies fonctionnent (pas de blocage CORS)
- Vérifiez les URLs de redirection dans Supabase

#### Erreur : "Bucket not found"
- Créez les buckets `input-images` et `output-images` dans Supabase Storage
- Vérifiez qu'ils sont publics

#### Erreur : "RLS policy violation"
- Exécutez le script `supabase_setup.sql`
- Vérifiez que RLS est activé
- Vérifiez les policies

#### Erreur 500 lors de la génération
- Vérifiez le token Replicate
- Vérifiez les logs Vercel pour plus de détails
- Vérifiez que le modèle existe sur Replicate

### 8. Sécurité

⚠️ **Important** :

1. **Ne committez JAMAIS** les fichiers `.env` ou `.env.local`
2. **Régénérez les tokens** exposés (Replicate, Supabase Service Role)
3. **Activez RLS** sur toutes les tables sensibles
4. **Limitez les tailles** d'upload (actuellement 10MB dans le code)
5. **Configurez les CORS** si nécessaire

### 9. Performance

Pour améliorer les performances :

1. **Activez la compression** (Vercel le fait automatiquement)
2. **Optimisez les images** avec Next.js Image
3. **Ajoutez du caching** :
   ```typescript
   // Dans next.config.mjs
   images: {
     domains: ['lytalbwasjtohwzpenxz.supabase.co'],
   },
   ```
4. **Utilisez ISR** pour les pages statiques si besoin

### 10. Mise à jour

Pour mettre à jour l'application :

```bash
# 1. Faire vos modifications
# 2. Tester localement
npm run dev

# 3. Build et vérifier
npm run build

# 4. Commit et push
git add .
git commit -m "feat: votre message"
git push origin main

# 5. Vercel redéploie automatiquement
```

---

## 📞 Support

- **Vercel** : https://vercel.com/docs
- **Supabase** : https://supabase.com/docs
- **Next.js** : https://nextjs.org/docs
- **Replicate** : https://replicate.com/docs

Bon déploiement ! 🚀
