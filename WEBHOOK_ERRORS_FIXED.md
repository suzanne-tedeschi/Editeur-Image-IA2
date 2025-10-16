# 🔧 Corrections des Erreurs Webhook

## ❌ Problèmes identifiés (16 oct 2025, 15:07)

### Erreur 1 : 404 Not Found
**Cause :** `STRIPE_WEBHOOK_SECRET` vide dans `.env.local`  
**Solution :** ✅ Configuré dans Vercel

### Erreur 2 : user_id non trouvé
```
❌ user_id non trouvé pour customer: cus_TFNXIz5uxIz2G7
```

**Cause :** L'événement `customer.subscription.created` est envoyé **AVANT** `checkout.session.completed`, donc la subscription n'existe pas encore dans la base de données.

**Ordre des événements Stripe :**
1. 🔔 `customer.subscription.created` ← arrive EN PREMIER (pas de user_id encore)
2. 🔔 `checkout.session.completed` ← arrive APRÈS (contient le user_id dans metadata)

### Erreur 3 : Invalid time value
```
❌ Erreur webhook: RangeError: Invalid time value
    at Date.toISOString (<anonymous>)
```

**Cause :** Tentative de convertir un timestamp `undefined` ou invalide en date ISO.

---

## ✅ Solutions appliquées

### 1. Gestion gracieuse de `customer.subscription.created`

**Avant :**
```typescript
if (!existingSub?.user_id) {
  console.error('❌ user_id non trouvé pour customer:', subscription.customer)
  break
}
```

**Après :**
```typescript
if (!existingSub?.user_id) {
  console.log('ℹ️ user_id non encore disponible pour customer:', subscription.customer)
  console.log('ℹ️ checkout.session.completed va créer la subscription avec le user_id')
  break // Pas d'erreur, c'est normal
}
```

### 2. Validation des timestamps

Ajout de validation avant conversion pour tous les événements :

```typescript
// Vérifier que les timestamps sont valides
const currentPeriodStart = subscription.current_period_start
const currentPeriodEnd = subscription.current_period_end

if (!currentPeriodStart || !currentPeriodEnd) {
  console.error('❌ Timestamps invalides dans subscription:', subscription.id)
  break
}

// Conversion sécurisée
current_period_start: new Date(currentPeriodStart * 1000).toISOString()
current_period_end: new Date(currentPeriodEnd * 1000).toISOString()
```

### 3. Événements concernés

✅ `checkout.session.completed` - validation timestamps ajoutée  
✅ `customer.subscription.created` - gestion gracieuse + validation  
✅ `customer.subscription.updated` - validation timestamps ajoutée  
✅ `customer.subscription.deleted` - OK (pas de timestamps)  
✅ `invoice.payment_succeeded` - OK (pas de timestamps critiques)

---

## 🧪 Test du flux complet

### Scénario : Nouvel abonnement Basic

**Événements Stripe dans l'ordre :**

1. **customer.subscription.created**
   - ℹ️ user_id pas encore disponible → on skip (normal)
   
2. **checkout.session.completed**
   - ✅ user_id récupéré depuis session.metadata
   - ✅ Création de la subscription dans Supabase
   - Données : `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `plan_type: 'basic'`, `quota_total: 30`
   
3. **invoice.payment_succeeded**
   - ✅ Paiement confirmé
   - Si `billing_reason === 'subscription_cycle'` → reset quota (pour renouvellements)

### Résultat attendu

```sql
-- Table subscriptions après le checkout
SELECT * FROM subscriptions WHERE user_id = 'xxx';

| user_id | stripe_customer_id | stripe_subscription_id | plan_type | status | quota_total | quota_used |
|---------|-------------------|------------------------|-----------|--------|-------------|------------|
| xxx     | cus_TFNXIz...     | sub_1SIsm...          | basic     | active | 30          | 0          |
```

---

## 🚀 Déploiement

Pour appliquer ces corrections sur Vercel :

```bash
# Commit et push
git add app/api/webhooks/stripe/route.ts
git commit -m "fix: amélioration gestion webhooks Stripe + validation timestamps"
git push origin main
```

Vercel va automatiquement redéployer l'application.

---

## 📊 Monitoring des webhooks

### Dans Stripe Dashboard

1. Allez sur : https://dashboard.stripe.com/test/webhooks
2. Sélectionnez votre endpoint
3. Cliquez sur un événement pour voir les logs
4. ✅ Status 200 = succès
5. ❌ Status 400/500 = erreur

### Dans Vercel

1. Dashboard Vercel → votre projet
2. Deployments → [dernier déploiement]
3. Functions → Logs
4. Filtrez par "webhook" pour voir les logs

### Logs attendus

```
✅ Webhook reçu: customer.subscription.created
🆕 Nouvelle subscription: sub_xxx
ℹ️ user_id non encore disponible pour customer: cus_xxx
ℹ️ checkout.session.completed va créer la subscription avec le user_id

✅ Webhook reçu: checkout.session.completed
💳 Checkout complété pour: cus_xxx
✅ Subscription créée/mise à jour

✅ Webhook reçu: invoice.payment_succeeded
💰 Paiement réussi pour invoice: in_xxx
```

---

## 🔍 Debugging

Si vous voyez encore des erreurs, vérifiez :

### 1. Variables d'environnement Vercel
```bash
vercel env ls
```

Doit contenir :
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`

### 2. Table subscriptions Supabase

```sql
-- Vérifier la structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions';
```

### 3. RLS (Row Level Security)

Le webhook utilise `SUPABASE_SERVICE_ROLE_KEY` qui **bypass le RLS**, donc pas besoin de politiques RLS pour les webhooks.

---

## 📝 Notes importantes

1. **L'ordre des webhooks n'est pas garanti** - les événements peuvent arriver dans n'importe quel ordre
2. **Idempotence** - utilisez `upsert()` pour éviter les doublons
3. **Validation** - toujours valider les données avant conversion
4. **Logs explicites** - utilisez des emojis et des messages clairs pour le debugging
5. **Erreurs gracieuses** - loggez les warnings mais ne faites pas échouer le webhook

---

## ✅ Checklist finale

- [x] Webhook secret configuré dans Vercel
- [x] URL webhook correcte dans Stripe Dashboard
- [x] Validation des timestamps
- [x] Gestion gracieuse de l'ordre des événements
- [x] Logs améliorés
- [x] Code déployé sur Vercel
- [ ] Test d'un nouvel abonnement
- [ ] Vérification dans la base de données Supabase
