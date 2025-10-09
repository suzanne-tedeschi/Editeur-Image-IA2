# Configuration Supabase

## 1. Création des Buckets Storage

Dans votre dashboard Supabase, allez dans **Storage** et créez les buckets suivants :

### Bucket 1: input-images
- **Nom**: `input-images`
- **Public**: Oui
- **Allowed MIME types**: `image/*`
- **Max file size**: 5MB

### Bucket 2: output-images
- **Nom**: `output-images`
- **Public**: Oui
- **Allowed MIME types**: `image/*`
- **Max file size**: 10MB

## 2. Création de la Table

Dans **SQL Editor**, exécutez cette requête :

```sql
-- Créer la table projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  input_image_url TEXT,
  output_image_url TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'pending'
);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_status ON projects(status);

-- Politique de sécurité (optionnel - permet la lecture publique)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON projects FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON projects FOR INSERT 
WITH CHECK (true);
```

## 3. Configuration des Politiques de Sécurité pour Storage

Pour les buckets, allez dans **Storage > Policies** et créez les politiques suivantes :

### Pour input-images:
```sql
-- Politique d'upload
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'input-images');

-- Politique de lecture
CREATE POLICY "Allow public downloads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'input-images');
```

### Pour output-images:
```sql
-- Politique d'upload
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'output-images');

-- Politique de lecture
CREATE POLICY "Allow public downloads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'output-images');
```

## 4. Récupérer les Clés API

Dans **Settings > API**, récupérez :
- **Project URL** (commence par https://...)
- **anon public** (pour NEXT_PUBLIC_SUPABASE_ANON_KEY)
- **service_role** (pour SUPABASE_SERVICE_ROLE_KEY - gardez-la secrète !)

## 5. Test de Configuration

Une fois configuré, vous pouvez tester que tout fonctionne en uploadant une image test dans l'interface.