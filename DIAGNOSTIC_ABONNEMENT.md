# 🔍 Guide de Diagnostic - Problème d'affichage de l'abonnement

## Problème
✅ Paiement validé sur Stripe  
❌ Dashboard affiche "Aucun abonnement actif"  
❌ Erreur de timestamp dans les logs

## 🔎 Étapes de diagnostic

### 1. Vérifier si l'abonnement existe dans Supabase

**Dans Supabase Dashboard :**
1. Allez sur : https://supabase.com/dashboard/project/lytalbwasjtohwzpenxz
2. Cliquez sur **SQL Editor**
3. Exécutez cette requête :

```sql
-- Voir tous les abonnements
SELECT 
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan_type,
  status,
  quota_total,
  quota_used,
  current_period_start,
  current_period_end,
  created_at
FROM subscriptions
ORDER BY created_at DESC;
```

**Résultat attendu :** Vous devriez voir votre abonnement avec `status = 'active'`

**Si la requête échoue avec "relation does not exist" :**
→ La table n'existe pas, exécutez `supabase_subscriptions_setup.sql`

### 2. Vérifier l'abonnement pour votre utilisateur spécifique

```sql
-- Trouver votre user_id
SELECT id, email FROM auth.users WHERE email = 'suzanne.tedeschi@gmail.com';

-- Vérifier votre abonnement (remplacez USER_ID par le résultat ci-dessus)
SELECT * FROM subscriptions WHERE user_id = 'USER_ID';
```

### 3. Problèmes possibles et solutions

#### Problème A : Table n'existe pas
**Solution :** Exécuter `supabase_subscriptions_setup.sql` dans SQL Editor

#### Problème B : Abonnement existe mais status != 'active'
**Solution :**
```sql
-- Vérifier le status
SELECT status FROM subscriptions WHERE stripe_customer_id = 'cus_TFNXIz5uxIz2G7';

-- Si le status est différent de 'active', le corriger :
UPDATE subscriptions 
SET status = 'active' 
WHERE stripe_customer_id = 'cus_TFNXIz5uxIz2G7';
```

#### Problème C : Abonnement n'existe pas du tout
**Cause :** Le webhook a échoué à cause de l'erreur de timestamp

**Solution :** Créer manuellement l'abonnement :

```sql
-- 1. Récupérer votre user_id
SELECT id FROM auth.users WHERE email = 'suzanne.tedeschi@gmail.com';

-- 2. Créer l'abonnement manuellement (remplacez USER_ID)
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan_type,
  status,
  quota_total,
  quota_used,
  current_period_start,
  current_period_end
) VALUES (
  'USER_ID',  -- Remplacez par votre user_id
  'cus_TFNXIz5uxIz2G7',  -- De l'événement Stripe
  'sub_1SIsmPPnAPGTMvIzkLozfnKJ',  -- De l'événement Stripe
  'basic',
  'active',
  50,
  0,
  NOW(),  -- Date de début
  NOW() + INTERVAL '1 month'  -- Date de fin (1 mois)
);
```

#### Problème D : Timestamps NULL ou invalides
**Solution :**
```sql
-- Vérifier les timestamps
SELECT 
  stripe_subscription_id,
  current_period_start,
  current_period_end
FROM subscriptions;

-- Corriger si NULL
UPDATE subscriptions 
SET 
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month'
WHERE current_period_start IS NULL 
   OR current_period_end IS NULL;
```

### 4. Vérifier les données Stripe vs Supabase

**Dans Stripe Dashboard :**
1. Allez sur : https://dashboard.stripe.com/test/subscriptions
2. Trouvez l'abonnement `sub_1SIsmPPnAPGTMvIzkLozfnKJ`
3. Notez :
   - Status (devrait être "active")
   - Current period start (timestamp Unix)
   - Current period end (timestamp Unix)
   - Price ID (devrait être `price_1SIqSaPnAPGTMvIzILcYfohD` pour Basic)

**Comparez avec Supabase** pour voir si les données correspondent

---

## 🔧 Solution rapide (si l'abonnement n'existe pas)

**Exécutez cette requête SQL dans Supabase :**

```sql
-- Récupérer votre user_id
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
    plan_type,
    status,
    quota_total,
    quota_used,
    current_period_start,
    current_period_end
  ) VALUES (
    v_user_id,
    'cus_TFNXIz5uxIz2G7',
    'sub_1SIsmPPnAPGTMvIzkLozfnKJ',
    'basic',
    'active',
    50,
    0,
    NOW(),
    NOW() + INTERVAL '1 month'
  )
  ON CONFLICT (stripe_subscription_id) 
  DO UPDATE SET
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month';
  
  RAISE NOTICE 'Abonnement créé/mis à jour pour user_id: %', v_user_id;
END $$;
```

Après avoir exécuté cette requête, **rafraîchissez votre dashboard** !

---

## 📊 Vérification finale

Après avoir appliqué la solution, vérifiez :

```sql
-- Vérifier que tout est OK
SELECT 
  u.email,
  s.plan_type,
  s.status,
  s.quota_total,
  s.quota_used,
  s.stripe_subscription_id,
  s.current_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'suzanne.tedeschi@gmail.com';
```

**Résultat attendu :**
```
email                     | plan_type | status | quota_total | quota_used | stripe_subscription_id | current_period_end
-------------------------|-----------|--------|-------------|------------|------------------------|-------------------
suzanne.tedeschi@gmail.com | basic     | active | 50          | 0          | sub_1SIsmP...         | 2025-11-16...
```

---

## 🚀 Après la correction

1. **Rafraîchissez le dashboard** : `Cmd + R` ou `Ctrl + R`
2. Vous devriez voir : **"Plan BASIC - 0/50 générations restantes"**
3. Le bouton "Gérer mon abonnement" devrait fonctionner

---

## 🔄 Pour éviter ce problème à l'avenir

Les corrections apportées au webhook (validation des timestamps) devraient empêcher cette erreur pour les futurs abonnements.

Si vous créez un nouvel abonnement de test, il devrait fonctionner correctement maintenant.
