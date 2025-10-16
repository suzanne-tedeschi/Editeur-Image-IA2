# ✅ PROBLÈME RÉSOLU - Adaptation au schéma Supabase

## 🎯 Problèmes identifiés

### 1. Erreur de timestamp
```
❌ Timestamps invalides dans subscription: sub_1SIsrUPnAPGTMvIzllnCk0G6
```

### 2. Différence de schéma entre code et base de données

**Le webhook essayait d'utiliser :**
- ❌ `plan_type` (colonne n'existe pas)
- ❌ `quota_total` (colonne n'existe pas)

**Votre table Supabase utilise :**
- ✅ `stripe_price_id` (pour identifier le plan)
- ✅ `quota_limit` (au lieu de quota_total)

## 🔧 Corrections appliquées

### 1. Webhook (`app/api/webhooks/stripe/route.ts`)

✅ Remplacé `plan_type` par `stripe_price_id`  
✅ Remplacé `quota_total` par `quota_limit`  
✅ Validation des timestamps avant conversion  
✅ Adapté pour tous les événements :
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`

### 2. Dashboard (`app/dashboard/page.tsx`)

✅ Interface `Subscription` mise à jour  
✅ Fonction helper `getPlanType()` ajoutée pour convertir `stripe_price_id` en `'basic' | 'pro'`  
✅ Toutes les références à `quota_total` changées en `quota_limit`  
✅ Toutes les références à `plan_type` utilisent maintenant `getPlanType(subscription.stripe_price_id)`

### 3. Schéma de votre table Supabase

```sql
subscriptions
├── id (uuid)
├── user_id (uuid) → auth.users
├── stripe_customer_id (text, unique)
├── stripe_subscription_id (text, unique)
├── stripe_price_id (text) ✅ Identifie le plan
├── status (text)
├── current_period_start (timestamp)
├── current_period_end (timestamp)
├── quota_limit (integer) ✅ Quota total
├── quota_used (integer)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## 🚀 Action immédiate : Créer votre abonnement

**Étape 1 : Ouvrir Supabase SQL Editor**

Allez sur : https://supabase.com/dashboard/project/lytalbwasjtohwzpenxz/sql

**Étape 2 : Exécuter ce script**

```sql
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Trouver votre user_id
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'suzanne.tedeschi@gmail.com';
  
  -- Créer l'abonnement
  INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,
    status,
    quota_limit,
    quota_used,
    current_period_start,
    current_period_end
  ) VALUES (
    v_user_id,
    'cus_TFNXIz5uxIz2G7',
    'sub_1SIsrUPnAPGTMvIzllnCk0G6',
    'price_1SIqSaPnAPGTMvIzILcYfohD',
    'active',
    50,
    0,
    NOW(),
    NOW() + INTERVAL '1 month'
  )
  ON CONFLICT (stripe_subscription_id) 
  DO UPDATE SET
    status = 'active',
    stripe_price_id = 'price_1SIqSaPnAPGTMvIzILcYfohD',
    quota_limit = 50,
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month';
  
  RAISE NOTICE 'Abonnement créé!';
END $$;
```

**Étape 3 : Vérifier**

```sql
SELECT 
  u.email,
  s.status,
  s.quota_limit,
  s.quota_used,
  s.stripe_subscription_id,
  CASE 
    WHEN s.stripe_price_id = 'price_1SIqSaPnAPGTMvIzILcYfohD' THEN 'Basic'
    WHEN s.stripe_price_id = 'price_1SIqU3PnAPGTMvIz7Uz3cMQ3' THEN 'Pro'
  END as plan
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'suzanne.tedeschi@gmail.com';
```

**Résultat attendu :**
```
email                     | status | quota_limit | quota_used | plan
-------------------------|--------|-------------|------------|-------
suzanne.tedeschi@gmail.com | active | 50          | 0          | Basic
```

## ✅ Après avoir exécuté le script

1. **Allez sur votre dashboard** : https://votre-app.vercel.app/dashboard
2. **Rafraîchissez la page** (Cmd+R ou F5)
3. **Vous devriez voir :**
   ```
   Plan BASIC
   Quota mensuel: 50 / 50 générations restantes
   ```

## 🔄 Déploiement

Les corrections ont été déployées sur Vercel via GitHub.

**Status :** ✅ Déployé automatiquement  
**Commit :** `fix: adapter webhook et dashboard au schéma subscriptions`

## 📊 Prochains abonnements

Les prochains abonnements créés via Stripe fonctionneront automatiquement car :

1. ✅ Le webhook utilise maintenant `stripe_price_id` et `quota_limit`
2. ✅ Les timestamps sont validés avant insertion
3. ✅ Le dashboard affiche correctement les données

## 🔍 Debugging futur

Si un problème survient, vérifiez dans cet ordre :

1. **Logs Vercel** : https://vercel.com/dashboard → Functions → Logs
2. **Logs Stripe** : https://dashboard.stripe.com/test/webhooks → Événements
3. **Base Supabase** : SQL Editor pour vérifier les données
4. **Console navigateur** : Erreurs côté client

## 📝 Fichiers créés/modifiés

- ✅ `app/api/webhooks/stripe/route.ts` - Adapté au schéma
- ✅ `app/dashboard/page.tsx` - Adapté au schéma
- ✅ `fix_current_subscription.sql` - Script de correction
- ✅ `DIAGNOSTIC_ABONNEMENT.md` - Guide de diagnostic
- ✅ `supabase_subscriptions_setup.sql` - Setup complet (référence)
- ✅ `SOLUTION_FINALE.md` - Ce fichier

---

## 🎉 Conclusion

Votre application est maintenant compatible avec votre schéma Supabase !

**Exécutez le script SQL ci-dessus pour créer votre abonnement et tout sera fonctionnel.**
