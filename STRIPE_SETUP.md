# Configuration Stripe - Instructions

## ✅ Ce qui a été configuré

### 1. Installation des packages
```bash
npm install stripe @stripe/stripe-js
```

### 2. Variables d'environnement (.env.local)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET` (à remplir après configuration du webhook)
- ✅ `NEXT_PUBLIC_STRIPE_PRICE_BASIC`
- ✅ `NEXT_PUBLIC_STRIPE_PRICE_PRO`
- ✅ `NEXT_PUBLIC_BASE_URL`

### 3. Fichiers créés

#### lib/stripe.ts
Configuration Stripe avec les plans et quotas

#### app/api/stripe/checkout/route.ts
Création des sessions de paiement Stripe Checkout

#### app/api/stripe/webhook/route.ts
Gestion des webhooks Stripe (création, mise à jour, annulation d'abonnements)

#### app/api/stripe/portal/route.ts
Accès au portail client Stripe pour gérer l'abonnement

#### components/SubscriptionPlans.tsx
Composant React pour afficher les plans d'abonnement

#### app/pricing/page.tsx
Page de tarification

### 4. Modifications des fichiers existants

#### app/api/generate/route.ts
- ✅ Vérification du quota avant génération
- ✅ Incrémentation du quota après génération
- ✅ Messages d'erreur spécifiques pour quota

#### app/dashboard/page.tsx
- ✅ Affichage de l'abonnement et du quota
- ✅ Barre de progression du quota
- ✅ Bouton "Gérer mon abonnement"
- ✅ Redirection vers /pricing si pas d'abonnement

#### components/Header.tsx
- ✅ Lien vers la page de tarification
- ✅ Nouveau design rose/pink

## 📋 Configuration Stripe Dashboard (à faire)

### 1. Activer le portail client
1. Aller sur https://dashboard.stripe.com/test/settings/billing/portal
2. Activer le portail client
3. Configurer les options :
   - ✅ Permettre l'annulation d'abonnement
   - ✅ Permettre le changement de plan
   - ✅ Permettre la mise à jour des informations de paiement

### 2. Configurer le webhook
1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur "Add endpoint"
3. URL du endpoint : `https://votre-domaine.com/api/stripe/webhook`
   - Pour le développement local, utiliser Stripe CLI ou ngrok
4. Événements à écouter :
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Copier le "Signing secret" et le mettre dans `STRIPE_WEBHOOK_SECRET`

### 3. Test avec Stripe CLI (développement local)
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🧪 Test du système

### Cartes de test Stripe
- ✅ Succès : `4242 4242 4242 4242`
- ❌ Échec : `4000 0000 0000 0002`
- 🔄 3D Secure : `4000 0027 6000 3184`

Date d'expiration : N'importe quelle date future  
CVC : N'importe quel code à 3 chiffres  
Code postal : N'importe quel code

### Flow de test
1. Se connecter
2. Aller sur `/pricing`
3. Choisir un plan (Basic ou Pro)
4. Remplir avec une carte de test
5. Vérifier la redirection vers le dashboard
6. Vérifier que le quota est affiché
7. Générer une image
8. Vérifier que le quota est décompté
9. Cliquer sur "Gérer mon abonnement"
10. Vérifier l'accès au portail Stripe

## 📊 Structure de la base de données

La table `subscriptions` a déjà été créée avec le SQL suivant :
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  quota_total INTEGER DEFAULT 0,
  quota_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Déploiement

### Avant de déployer sur Vercel/production :
1. ✅ Configurer les variables d'environnement dans Vercel
2. ✅ Mettre à jour `NEXT_PUBLIC_BASE_URL` avec l'URL de production
3. ✅ Créer le webhook dans Stripe Dashboard avec l'URL de production
4. ✅ Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le secret de production
5. ✅ Basculer en mode production dans Stripe (quand prêt)

### Variables d'environnement Vercel
Copier toutes les variables de `.env.local` dans les variables d'environnement Vercel :
- Settings → Environment Variables

## 🎨 Plans d'abonnement

### Plan Basic (€9/mois)
- 50 générations d'images par mois
- Accès aux modèles IA de base
- Historique sauvegardé
- Support par email

### Plan Pro (€19/mois)
- 200 générations d'images par mois
- Accès à tous les modèles IA
- Historique illimité
- Support prioritaire
- Téléchargements en haute qualité

## 🔧 Résolution de problèmes

### Le webhook ne fonctionne pas
- Vérifier que `STRIPE_WEBHOOK_SECRET` est correctement défini
- Vérifier que les événements sont bien configurés dans Stripe Dashboard
- Vérifier les logs dans Stripe Dashboard → Developers → Webhooks

### Le quota ne se met pas à jour
- Vérifier que le webhook `customer.subscription.updated` fonctionne
- Vérifier les logs de l'API dans Vercel ou en local

### L'utilisateur ne peut pas générer d'images
- Vérifier que l'abonnement est actif dans la table `subscriptions`
- Vérifier que `status = 'active'`
- Vérifier que `quota_used < quota_total`

## 📝 Notes importantes

1. **Mode test** : Actuellement configuré en mode test (clés commençant par `pk_test_` et `sk_test_`)
2. **Webhook secret** : À remplir après configuration du webhook
3. **Service role key** : Nécessaire pour le webhook (opérations admin)
4. **Renouvellement automatique** : Le quota se réinitialise automatiquement à chaque nouveau cycle de facturation

## 🎉 Prochaines étapes recommandées

1. [ ] Tester le flow complet de paiement
2. [ ] Configurer le webhook pour la production
3. [ ] Ajouter des emails de confirmation (Stripe peut le gérer)
4. [ ] Ajouter des analytics pour suivre les conversions
5. [ ] Créer une page FAQ pour les questions sur les abonnements
6. [ ] Ajouter un système de coupons promotionnels
7. [ ] Implémenter un programme de parrainage
