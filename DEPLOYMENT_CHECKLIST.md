# ✅ CHECKLIST DE DÉPLOIEMENT

## 📋 Avant de déployer

### 1. Configuration Supabase ✓

- [ ] Créer un projet Supabase
- [ ] Exécuter le script `supabase_setup.sql` dans SQL Editor
- [ ] Créer le bucket `input-images` (public)
- [ ] Créer le bucket `output-images` (public)
- [ ] Noter l'URL du projet Supabase
- [ ] Noter la clé ANON KEY
- [ ] Noter la clé SERVICE ROLE KEY
- [ ] Activer l'authentification Email dans Authentication > Providers
- [ ] Configurer le template d'email (optionnel)

### 2. Configuration Replicate ✓

- [ ] Créer un compte Replicate
- [ ] Générer un API token
- [ ] Noter le token (commence par `r8_`)
- [ ] Vérifier que le modèle `google/nano-banana` est accessible

### 3. Variables d'environnement locales ✓

Créer `.env.local` avec :
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `REPLICATE_API_TOKEN`
- [ ] `REPLICATE_MODEL=google/nano-banana`
- [ ] `SUPABASE_INPUT_BUCKET=input-images`
- [ ] `SUPABASE_OUTPUT_BUCKET=output-images`

### 4. Test local ✓

```bash
npm install
npm run dev
```

- [ ] L'application démarre sans erreur
- [ ] La page d'accueil `/` s'affiche
- [ ] Je peux créer un compte sur `/signup`
- [ ] Je reçois l'email de confirmation (si activé)
- [ ] Je peux me connecter sur `/login`
- [ ] Je suis redirigé vers `/dashboard`
- [ ] Je peux uploader une image
- [ ] La génération fonctionne
- [ ] Le projet apparaît dans "Mes projets"
- [ ] Je peux supprimer un projet
- [ ] Je peux me déconnecter

### 5. Build de production ✓

```bash
npm run build
```

- [ ] Le build passe sans erreur
- [ ] Toutes les pages sont générées correctement

## 🚀 Déploiement Vercel

### 1. Connexion GitHub ✓

- [ ] Le code est pushé sur GitHub
- [ ] Le repo est public ou accessible à Vercel

### 2. Configuration Vercel ✓

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Framework détecté : Next.js

### 3. Variables d'environnement Vercel ✓

Dans Settings > Environment Variables, ajouter :

**Supabase**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → valeur
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → valeur
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → valeur

**Replicate**
- [ ] `REPLICATE_API_TOKEN` → valeur
- [ ] `REPLICATE_MODEL` → `google/nano-banana`

**Buckets**
- [ ] `SUPABASE_INPUT_BUCKET` → `input-images`
- [ ] `SUPABASE_OUTPUT_BUCKET` → `output-images`

### 4. Premier déploiement ✓

- [ ] Cliquer sur "Deploy"
- [ ] Attendre la fin du build
- [ ] Vérifier qu'il n'y a pas d'erreurs

## 🔧 Post-déploiement

### 1. Configuration Supabase ✓

Dans Authentication > URL Configuration :

**Site URL**
- [ ] Ajouter : `https://votre-app.vercel.app`

**Redirect URLs**
- [ ] Ajouter : `https://votre-app.vercel.app/dashboard`
- [ ] Garder : `http://localhost:3000/dashboard` (pour dev)

### 2. Tests en production ✓

- [ ] Visiter `https://votre-app.vercel.app`
- [ ] Tester l'inscription
- [ ] Tester la connexion
- [ ] Tester l'upload et la génération
- [ ] Tester la suppression
- [ ] Tester la déconnexion
- [ ] Vérifier que les routes sont protégées

### 3. Monitoring ✓

- [ ] Vérifier les logs Vercel (Runtime Logs)
- [ ] Vérifier les logs Supabase (si erreurs)
- [ ] Configurer les alertes Vercel (optionnel)

## 🔒 Sécurité

### Actions importantes ✓

- [ ] ⚠️ **RÉGÉNÉRER** le token Replicate exposé
- [ ] ⚠️ **VÉRIFIER** que `.env.local` est bien dans `.gitignore`
- [ ] ⚠️ **ACTIVER** RLS sur toutes les tables Supabase
- [ ] ⚠️ **CONFIGURER** les policies de storage si besoin
- [ ] ⚠️ **LIMITER** les tailles d'upload (actuellement 10MB)

### Recommandations ✓

- [ ] Activer la confirmation par email dans Supabase
- [ ] Configurer un domaine personnalisé
- [ ] Ajouter Google Analytics ou Plausible (optionnel)
- [ ] Configurer Sentry pour les erreurs (optionnel)
- [ ] Mettre en place un système de rate limiting

## 📊 Performance

### Optimisations ✓

- [ ] Images optimisées avec Next.js Image
- [ ] Compression activée (Vercel le fait auto)
- [ ] CDN activé (Vercel le fait auto)
- [ ] Headers de cache configurés

### Métriques à surveiller

- [ ] Core Web Vitals dans Vercel Analytics
- [ ] Temps de réponse API
- [ ] Taille des bundles JS
- [ ] Erreurs 4xx/5xx

## 🎯 Fonctionnalités futures

### Priorité haute

- [ ] Réinitialisation de mot de passe
- [ ] Modification du profil utilisateur
- [ ] Pagination de la galerie

### Priorité moyenne

- [ ] OAuth (Google, GitHub)
- [ ] Téléchargement d'images depuis le dashboard
- [ ] Partage de projets

### Priorité basse

- [ ] Mode sombre
- [ ] Notifications temps réel
- [ ] Analytics utilisateur
- [ ] Export PDF/ZIP des projets

## 📞 Support

En cas de problème :

1. Vérifier cette checklist
2. Consulter `VERCEL_DEPLOYMENT.md`
3. Consulter `AUTHENTICATION_README.md`
4. Vérifier les logs Vercel
5. Vérifier les logs Supabase

## ✅ Validation finale

- [ ] ✨ L'application est déployée
- [ ] 🔐 L'authentification fonctionne
- [ ] 🎨 La génération d'images fonctionne
- [ ] 💾 Les projets sont sauvegardés
- [ ] 🗑️ La suppression fonctionne
- [ ] 🔒 Les routes sont protégées
- [ ] 📊 Les logs sont accessibles
- [ ] 🚀 Les performances sont bonnes

---

**Status :** □ En cours  ✓ Terminé

**Date de déploiement :** _______________

**URL de production :** _______________
