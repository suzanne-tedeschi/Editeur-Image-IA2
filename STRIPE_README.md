# 🎨 AI Image Editor - Système d'Abonnement Stripe

## ✅ Intégration Stripe Complète

Le système d'abonnement Stripe a été entièrement intégré à votre application ! Voici ce qui a été implémenté :

### 🚀 Fonctionnalités

#### 1. **Deux Plans d'Abonnement**
- **Basic** (€9/mois) : 50 générations d'images
- **Pro** (€19/mois) : 200 générations d'images

#### 2. **Gestion Complète des Abonnements**
- ✅ Paiement sécurisé via Stripe Checkout
- ✅ Gestion du quota de génération
- ✅ Renouvellement automatique chaque mois
- ✅ Portail client pour gérer l'abonnement
- ✅ Webhooks pour synchroniser les données

#### 3. **Interface Utilisateur**
- ✅ Page de tarification (`/pricing`)
- ✅ Affichage du quota dans le dashboard
- ✅ Barre de progression du quota
- ✅ Redirection automatique si pas d'abonnement
- ✅ Bouton pour gérer l'abonnement

### 📁 Fichiers Créés

```
lib/
  └── stripe.ts                          # Configuration Stripe et plans

app/api/stripe/
  ├── checkout/route.ts                  # Création session de paiement
  ├── webhook/route.ts                   # Gestion événements Stripe
  └── portal/route.ts                    # Portail client

components/
  └── SubscriptionPlans.tsx              # UI plans d'abonnement

app/pricing/
  └── page.tsx                           # Page de tarification

STRIPE_SETUP.md                          # Documentation complète
```

### 📝 Prochaines Étapes

#### 1. Configuration du Webhook Stripe

Pour que le système fonctionne complètement, vous devez configurer le webhook :

**Option A : Développement Local (avec Stripe CLI)**
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks (dans un terminal séparé)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le webhook secret affiché et le mettre dans .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Option B : Production (Stripe Dashboard)**
1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur "Add endpoint"
3. URL : `https://votre-domaine.vercel.app/api/stripe/webhook`
4. Sélectionner ces événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copier le "Signing secret" dans `.env.local`

#### 2. Activer le Portail Client Stripe

1. Aller sur https://dashboard.stripe.com/test/settings/billing/portal
2. Activer le portail
3. Configurer les options (annulation, changement de plan, etc.)

#### 3. Variables d'Environnement

Vérifier que toutes les variables sont bien configurées dans `.env.local` :

```bash
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  ← À REMPLIR après config webhook
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  ← IMPORTANT pour les webhooks

# Replicate (déjà configuré)
REPLICATE_API_TOKEN=...
```

### 🧪 Tester le Système

#### 1. Lancer le serveur
```bash
npm run dev
```

#### 2. Test complet
1. Créer un compte ou se connecter
2. Aller sur `/pricing`
3. Choisir un plan (Basic ou Pro)
4. Utiliser une carte de test Stripe :
   - Numéro : `4242 4242 4242 4242`
   - Date : N'importe quelle date future
   - CVC : N'importe quel code à 3 chiffres
5. Compléter le paiement
6. Vérifier la redirection vers le dashboard
7. Vérifier que le quota est affiché (0/50 ou 0/200)
8. Générer une image
9. Vérifier que le quota a été décompté (1/50 ou 1/200)
10. Cliquer sur "Gérer mon abonnement" pour tester le portail

### 💡 Comment ça Marche

#### Flow d'Abonnement

```
1. Utilisateur clique sur "Choisir Basic/Pro"
   ↓
2. API /api/stripe/checkout crée une session Stripe
   ↓
3. Redirection vers Stripe Checkout
   ↓
4. Utilisateur paie avec carte bancaire
   ↓
5. Stripe envoie webhook "checkout.session.completed"
   ↓
6. API /api/stripe/webhook crée l'abonnement dans Supabase
   ↓
7. Redirection vers /dashboard avec success=true
```

#### Flow de Génération

```
1. Utilisateur upload image + prompt
   ↓
2. API /api/generate vérifie l'abonnement
   ↓
3. Si quota OK : génère l'image
   ↓
4. Incrémente quota_used dans la BDD
   ↓
5. Dashboard met à jour l'affichage du quota
```

#### Renouvellement Mensuel

```
1. Stripe facture automatiquement chaque mois
   ↓
2. Webhook "customer.subscription.updated" reçu
   ↓
3. API réinitialise quota_used à 0
   ↓
4. Utilisateur peut à nouveau générer des images
```

### 🔧 Résolution de Problèmes

#### Le quota ne se met pas à jour
→ Vérifier que le webhook est bien configuré et que `STRIPE_WEBHOOK_SECRET` est correct

#### L'utilisateur ne peut pas générer d'images
→ Vérifier dans la table `subscriptions` que :
- `status = 'active'`
- `quota_used < quota_total`
- `user_id` correspond à l'utilisateur

#### Le paiement échoue en test
→ Utiliser uniquement les cartes de test Stripe
→ Vérifier que les `price_id` sont corrects

### 📊 Base de Données

La table `subscriptions` contient :

| Champ | Description |
|-------|-------------|
| `user_id` | ID de l'utilisateur (auth.users) |
| `stripe_customer_id` | ID client Stripe |
| `stripe_subscription_id` | ID abonnement Stripe |
| `plan_type` | 'basic' ou 'pro' |
| `status` | 'active', 'canceled', etc. |
| `quota_total` | Quota mensuel (50 ou 200) |
| `quota_used` | Nombre utilisé ce mois |
| `current_period_end` | Date de renouvellement |

### 🚀 Déploiement sur Vercel

1. **Ajouter les variables d'environnement dans Vercel**
   - Settings → Environment Variables
   - Copier toutes les variables de `.env.local`
   - Mettre à jour `NEXT_PUBLIC_BASE_URL` avec l'URL Vercel

2. **Configurer le webhook de production**
   - Créer un nouveau webhook dans Stripe Dashboard
   - URL : `https://votre-app.vercel.app/api/stripe/webhook`
   - Copier le nouveau webhook secret
   - Le mettre dans les variables Vercel

3. **Déployer**
   ```bash
   git push
   ```

### 🎉 C'est Prêt !

Le système d'abonnement est maintenant complètement intégré ! Vous pouvez :
- ✅ Accepter des paiements
- ✅ Gérer les quotas automatiquement
- ✅ Laisser les utilisateurs gérer leur abonnement
- ✅ Avoir un renouvellement automatique

Pour plus de détails, consultez `STRIPE_SETUP.md`.

---

**Besoin d'aide ?** Consultez la [documentation Stripe](https://stripe.com/docs) ou le fichier `STRIPE_SETUP.md`.
