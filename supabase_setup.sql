-- ============================================
-- SETUP SUPABASE POUR L'AUTHENTIFICATION
-- ============================================

-- 1. Vérifier que l'extension uuid est activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Créer la table projects (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_image_url TEXT,
  output_image_url TEXT,
  prompt TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Si la table existe déjà sans user_id, ajouter la colonne
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Optionnel: Mettre à jour les anciennes entrées avec un user_id par défaut
    -- UPDATE projects SET user_id = 'UUID_DU_PREMIER_USER' WHERE user_id IS NULL;
  END IF;
END $$;

-- 4. Activer Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;

-- 6. Créer les nouvelles policies

-- Policy SELECT: Les utilisateurs peuvent voir uniquement leurs projets
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: Les utilisateurs peuvent insérer leurs propres projets
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: Les utilisateurs peuvent modifier leurs propres projets
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: Les utilisateurs peuvent supprimer leurs propres projets
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 8. Vérifier que les buckets storage existent
-- (À faire manuellement dans l'interface Supabase Storage)
-- - input-images (public)
-- - output-images (public)

-- 9. Policies pour les buckets storage
-- À ajouter dans Supabase Dashboard > Storage > Policies:

-- Pour input-images:
-- INSERT policy: authenticated users can upload
-- SELECT policy: anyone can view
-- DELETE policy: users can delete their own files

-- Pour output-images:
-- INSERT policy: authenticated users can upload
-- SELECT policy: anyone can view
-- DELETE policy: users can delete their own files

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Vérifier la structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Vérifier les policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'projects';

-- Vérifier RLS
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'projects';
