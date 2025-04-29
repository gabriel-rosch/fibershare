-- Atualizar a tabela de profiles para incluir o vínculo com operadoras
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- Atualizar a tabela de CTOs para incluir o vínculo com operadoras
ALTER TABLE IF EXISTS ctos 
ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- Atualizar a tabela de portas de CTO para incluir o vínculo com operadoras
ALTER TABLE IF EXISTS cto_ports 
ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES operators(id);

-- Criar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_profiles_operator_id ON profiles(operator_id);
CREATE INDEX IF NOT EXISTS idx_ctos_operator_id ON ctos(operator_id);
CREATE INDEX IF NOT EXISTS idx_cto_ports_operator_id ON cto_ports(operator_id);

-- Adicionar restrições de integridade referencial
ALTER TABLE IF EXISTS cto_ports
ADD CONSTRAINT IF NOT EXISTS fk_cto_ports_operators
FOREIGN KEY (operator_id) REFERENCES operators(id);

-- Atualizar as ordens de serviço para incluir o vínculo com operadoras
ALTER TABLE IF EXISTS service_orders
ADD COLUMN IF NOT EXISTS requester_operator_id UUID REFERENCES operators(id),
ADD COLUMN IF NOT EXISTS target_operator_id UUID REFERENCES operators(id);

-- Criar índices para melhorar a performance das consultas de ordens de serviço
CREATE INDEX IF NOT EXISTS idx_service_orders_requester_operator_id ON service_orders(requester_operator_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_target_operator_id ON service_orders(target_operator_id);
