-- Adicionar coluna is_first_access à tabela profiles se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'is_first_access'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_first_access BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Atualizar os registros existentes para definir is_first_access como FALSE
UPDATE profiles
SET is_first_access = FALSE
WHERE is_first_access IS NULL;

-- Adicionar um índice para melhorar o desempenho das consultas
CREATE INDEX IF NOT EXISTS idx_profiles_operator_id ON profiles(operator_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_first_access ON profiles(is_first_access);
