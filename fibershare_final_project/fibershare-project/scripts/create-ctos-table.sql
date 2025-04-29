-- Criar tabela de CTOs se não existir
CREATE TABLE IF NOT EXISTS ctos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_ports INTEGER NOT NULL DEFAULT 16,
  occupied_ports INTEGER NOT NULL DEFAULT 0,
  longitude FLOAT NOT NULL,
  latitude FLOAT NOT NULL,
  region VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar alguns dados de exemplo se a tabela estiver vazia
INSERT INTO ctos (name, description, total_ports, occupied_ports, longitude, latitude, region, status)
SELECT 
  'CTO-001', 
  'CTO com alta ocupação', 
  16, 
  15, 
  -48.618, 
  -27.598, 
  'Centro', 
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ctos LIMIT 1);

INSERT INTO ctos (name, description, total_ports, occupied_ports, longitude, latitude, region, status)
SELECT 
  'CTO-002', 
  'CTO com média ocupação', 
  16, 
  8, 
  -48.617, 
  -27.597, 
  'Norte', 
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ctos WHERE name = 'CTO-002');

INSERT INTO ctos (name, description, total_ports, occupied_ports, longitude, latitude, region, status)
SELECT 
  'CTO-003', 
  'CTO com baixa ocupação', 
  16, 
  2, 
  -48.619, 
  -27.597, 
  'Sul', 
  'maintenance'
WHERE NOT EXISTS (SELECT 1 FROM ctos WHERE name = 'CTO-003');

INSERT INTO ctos (name, description, total_ports, occupied_ports, longitude, latitude, region, status)
SELECT 
  'CTO-004', 
  'CTO totalmente ocupada', 
  8, 
  8, 
  -48.62, 
  -27.599, 
  'Leste', 
  'active'
WHERE NOT EXISTS (SELECT 1 FROM ctos WHERE name = 'CTO-004');

INSERT INTO ctos (name, description, total_ports, occupied_ports, longitude, latitude, region, status)
SELECT 
  'CTO-005', 
  'CTO sem ocupação', 
  32, 
  0, 
  -48.616, 
  -27.596, 
  'Oeste', 
  'inactive'
WHERE NOT EXISTS (SELECT 1 FROM ctos WHERE name = 'CTO-005');
