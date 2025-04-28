-- Adicionar a coluna operator_id à tabela profiles se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'operator_id'
    ) THEN
        -- Adicionar a coluna operator_id
        ALTER TABLE profiles ADD COLUMN operator_id UUID;
        
        -- Criar um índice para melhorar o desempenho
        CREATE INDEX idx_profiles_operator_id ON profiles(operator_id);
        
        -- Adicionar comentário à coluna
        COMMENT ON COLUMN profiles.operator_id IS 'ID do operador ao qual o usuário pertence';
    END IF;
END $$;

-- Verificar se existe pelo menos um operador na tabela operators
DO $$
DECLARE
    default_operator_id UUID;
BEGIN
    -- Verificar se existe pelo menos um operador
    SELECT id INTO default_operator_id FROM operators LIMIT 1;
    
    -- Se não existir nenhum operador, criar um operador padrão
    IF default_operator_id IS NULL THEN
        INSERT INTO operators (name, created_at, updated_at)
        VALUES ('Operador Padrão', NOW(), NOW())
        RETURNING id INTO default_operator_id;
    END IF;
    
    -- Atualizar todos os perfis que não têm operator_id definido
    UPDATE profiles
    SET operator_id = default_operator_id
    WHERE operator_id IS NULL;
END $$;

-- Verificar a estrutura atualizada da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
