# 🔧 Résolution du problème Webhook 404

## 📊 Diagnostic

### Erreur actuelle
```
Code d'état HTTP: 404
Message: "The deployment could not be found on Vercel."
```

### Webhook concerné
- Type : `invoice.payment_succeeded`
- Customer : suzanne.tedeschi@gmail.com
- Montant : 9,00 EUR (Plan Basic)

## ✅ Checklist de résolution

### 1. Variables d'environnement Vercel
- [x] `STRIPE_WEBHOOK_SECRET` configuré : `whsec_nJHndO3w79bfrSSHxgnNaiOs0AWEUO7M`
- [ ] `STRIPE_SECRET_KEY` configuré
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configuré
- [ ] Toutes les variables Supabase configurées

### 2. URL du webhook dans Stripe Dashboard

**Étapes à vérifier :**

1. Allez sur : https://dashboard.stripe.com/test/webhooks
2. Vérifiez que l'URL du webhook est : `https://VOTRE-APP.vercel.app/api/webhooks/stripe`
3. **PAS** `http://localhost:3000/api/webhooks/stripe`

### 3. Route webhook existe et est déployée

Le fichier existe : ✅ `app/api/webhooks/stripe/route.ts`

**Vérification que le déploiement a réussi :**

```bash
# Testez manuellement l'endpoint
curl -X POST https://VOTRE-APP.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{}'
```

Résultat attendu : `400` (signature manquante) et **PAS 404**

### 4. Le fichier route.ts est bien configuré

Points à vérifier dans le code :
- [x] Export de la fonction `POST`
- [x] Gestion de `stripe-signature`
- [x] Variable `STRIPE_WEBHOOK_SECRET` utilisée
- [x] Tous les événements Stripe gérés

## 🚀 Actions à effectuer MAINTENANT

### Action 1 : Vérifier l'URL du webhook Stripe

1. Ouvrez : https://dashboard.stripe.com/test/webhooks
2. Trouvez votre endpoint webhook
3. **Vérifiez l'URL** - doit être votre URL Vercel
4. Si ce n'est pas le cas, **créez un nouveau endpoint** avec la bonne URL

### Action 2 : Créer un nouveau webhook endpoint pour Vercel

**URL à utiliser :** (remplacez par VOTRE URL Vercel)
```
https://editeur-image-ia2.vercel.app/api/webhooks/stripe
```

**Événements à sélectionner :**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`

**Après création :**
- Copiez le nouveau webhook secret (commence par `whsec_...`)
- Mettez-le à jour dans Vercel : Dashboard > Settings > Environment Variables
- Remplacez la valeur de `STRIPE_WEBHOOK_SECRET`
- **Redéployez** votre application sur Vercel

### Action 3 : Vérifier le déploiement

```bash
# Vérifiez que l'endpoint répond
curl -I https://VOTRE-APP.vercel.app/api/webhooks/stripe

# Devrait retourner : 405 Method Not Allowed (GET non autorisé)
# ou 400 (pas de signature)
# MAIS PAS 404 !
```

## 📝 Configuration pour développement local

Pour tester les webhooks en local, utilisez Stripe CLI :

```bash
# Installer Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Forwarder les webhooks vers localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Dans un autre terminal, démarrer Next.js
npm run dev
```

Cela vous donnera un webhook secret temporaire comme :
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copiez-le dans votre `.env.local` :
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔍 Commandes de diagnostic

### Vérifier les variables d'environnement Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lister les variables d'environnement
vercel env ls
```

### Voir les logs Vercel

```bash
# Voir les logs en temps réel
vercel logs

# Ou dans le dashboard Vercel : votre-projet > Deployments > [dernier déploiement] > Logs
```

## ✨ Solution rapide

**Si vous voulez résoudre ça immédiatement :**

1. **Trouvez votre URL Vercel** (ex: `https://editeur-image-ia2.vercel.app`)
2. **Allez sur Stripe Dashboard** → Webhooks
3. **Supprimez l'ancien webhook** (avec la mauvaise URL)
4. **Créez un nouveau webhook** avec la bonne URL Vercel
5. **Copiez le nouveau secret** → Mettez-le dans Vercel
6. **Redéployez** sur Vercel
7. **Testez** en créant un nouvel abonnement

---

## 📞 Si le problème persiste

Vérifiez dans les logs Vercel :
- Cherchez "webhook" dans les logs
- Vérifiez s'il y a des erreurs de déploiement
- Assurez-vous que le build Next.js a réussi
