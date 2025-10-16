-- ============================================
-- SOLUTION RAPIDE : Créer/Corriger l'abonnement actuel
-- ============================================

-- Pour customer: cus_TFNXIz5uxIz2G7
-- Subscription: sub_1SIsrUPnAPGTMvIzllnCk0G6

-- 1. Vérifier l'état actuel
SELECT 
  u.email,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.stripe_price_id,
  s.status,
  s.quota_limit,
  s.quota_used,
  s.current_period_start,
  s.current_period_end
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'suzanne.tedeschi@gmail.com'
   OR s.stripe_customer_id = 'cus_TFNXIz5uxIz2G7'
   OR s.stripe_subscription_id = 'sub_1SIsrUPnAPGTMvIzllnCk0G6';

-- 2. Créer ou mettre à jour l'abonnement
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Trouver votre user_id
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'suzanne.tedeschi@gmail.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User non trouvé avec email: suzanne.tedeschi@gmail.com';
  END IF;
  
  -- Insérer ou mettre à jour l'abonnement
  INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_price_id,  -- Utiliser stripe_price_id au lieu de plan_type
    status,
    quota_limit,  -- Utiliser quota_limit au lieu de quota_total
    quota_used,
    current_period_start,
    current_period_end
  ) VALUES (
    v_user_id,
    'cus_TFNXIz5uxIz2G7',
    'sub_1SIsrUPnAPGTMvIzllnCk0G6',
    'price_1SIqSaPnAPGTMvIzILcYfohD',  -- Plan Basic
    'active',
    50,  -- Quota Basic
    0,
    NOW(),
    NOW() + INTERVAL '1 month'
  )
  ON CONFLICT (stripe_subscription_id) 
  DO UPDATE SET
    status = 'active',
    stripe_price_id = 'price_1SIqSaPnAPGTMvIzILcYfohD',
    quota_limit = 50,
    quota_used = 0,
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month';
  
  RAISE NOTICE 'Abonnement créé/mis à jour pour user_id: %', v_user_id;
END $$;

-- 3. Vérifier que tout est OK
SELECT 
  u.email,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.stripe_price_id,
  s.status,
  s.quota_limit,
  s.quota_used,
  s.current_period_end,
  CASE 
    WHEN s.stripe_price_id = 'price_1SIqSaPnAPGTMvIzILcYfohD' THEN 'Basic'
    WHEN s.stripe_price_id = 'price_1SIqU3PnAPGTMvIz7Uz3cMQ3' THEN 'Pro'
    ELSE 'Inconnu'
  END as plan_name
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'suzanne.tedeschi@gmail.com';
