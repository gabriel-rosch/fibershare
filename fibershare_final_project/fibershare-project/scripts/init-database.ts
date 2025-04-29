import { createClient } from "@supabase/supabase-js"

async function initDatabase() {
  console.log("Iniciando criação das tabelas no banco de dados...")

  // Configurar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Criar tabela de operadores
    console.log("Criando tabela operators...")
    const { error: operatorsError } = await supabase.rpc("create_operators_table_if_not_exists")
    if (operatorsError) {
      console.error("Erro ao criar tabela operators:", operatorsError)
    }

    // Criar tabela de CTOs
    console.log("Criando tabela ctos...")
    const { error: ctosError } = await supabase.rpc("create_ctos_table_if_not_exists")
    if (ctosError) {
      console.error("Erro ao criar tabela ctos:", ctosError)
    }

    // Criar tabela de portas de CTO
    console.log("Criando tabela cto_ports...")
    const { error: portsError } = await supabase.rpc("create_cto_ports_table_if_not_exists")
    if (portsError) {
      console.error("Erro ao criar tabela cto_ports:", portsError)
    }

    // Criar tabela de ordens de serviço
    console.log("Criando tabela service_orders...")
    const { error: ordersError } = await supabase.rpc("create_service_orders_table_if_not_exists")
    if (ordersError) {
      console.error("Erro ao criar tabela service_orders:", ordersError)
    }

    // Criar tabela de notas de ordens de serviço
    console.log("Criando tabela service_order_notes...")
    const { error: notesError } = await supabase.rpc("create_service_order_notes_table_if_not_exists")
    if (notesError) {
      console.error("Erro ao criar tabela service_order_notes:", notesError)
    }

    // Criar tabela de ordens de portas
    console.log("Criando tabela port_orders...")
    const { error: portOrdersError } = await supabase.rpc("create_port_orders_table_if_not_exists")
    if (portOrdersError) {
      console.error("Erro ao criar tabela port_orders:", portOrdersError)
    }

    // Criar tabela de notas de ordens de portas
    console.log("Criando tabela port_order_notes...")
    const { error: portNotesError } = await supabase.rpc("create_port_order_notes_table_if_not_exists")
    if (portNotesError) {
      console.error("Erro ao criar tabela port_order_notes:", portNotesError)
    }

    // Criar tabela de conversas de chat
    console.log("Criando tabela chat_conversations...")
    const { error: chatError } = await supabase.rpc("create_chat_conversations_table_if_not_exists")
    if (chatError) {
      console.error("Erro ao criar tabela chat_conversations:", chatError)
    }

    // Criar tabela de participantes de chat
    console.log("Criando tabela chat_participants...")
    const { error: participantsError } = await supabase.rpc("create_chat_participants_table_if_not_exists")
    if (participantsError) {
      console.error("Erro ao criar tabela chat_participants:", participantsError)
    }

    // Criar tabela de mensagens de chat
    console.log("Criando tabela chat_messages...")
    const { error: messagesError } = await supabase.rpc("create_chat_messages_table_if_not_exists")
    if (messagesError) {
      console.error("Erro ao criar tabela chat_messages:", messagesError)
    }

    // Criar funções SQL para inicialização das tabelas
    console.log("Criando funções SQL para inicialização das tabelas...")
    await createSQLFunctions(supabase)

    console.log("Criação das tabelas concluída com sucesso!")
  } catch (error) {
    console.error("Erro durante a criação das tabelas:", error)
  }
}

async function createSQLFunctions(supabase: any) {
  // Função para criar a tabela de operadores
  const createOperatorsTableSQL = `
  CREATE OR REPLACE FUNCTION create_operators_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'operators') THEN
      CREATE TABLE operators (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        region VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de CTOs
  const createCTOsTableSQL = `
  CREATE OR REPLACE FUNCTION create_ctos_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'ctos') THEN
      CREATE TABLE ctos (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        total_ports INTEGER NOT NULL,
        occupied_ports INTEGER NOT NULL DEFAULT 0,
        coordinates JSONB NOT NULL,
        owner_id UUID NOT NULL REFERENCES operators(id),
        region VARCHAR(100),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de portas de CTO
  const createCTOPortsTableSQL = `
  CREATE OR REPLACE FUNCTION create_cto_ports_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'cto_ports') THEN
      CREATE TABLE cto_ports (
        id SERIAL PRIMARY KEY,
        cto_id UUID NOT NULL REFERENCES ctos(id),
        port_number INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        current_tenant_id UUID REFERENCES operators(id),
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(cto_id, port_number)
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de ordens de serviço
  const createServiceOrdersTableSQL = `
  CREATE OR REPLACE FUNCTION create_service_orders_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'service_orders') THEN
      CREATE TABLE service_orders (
        id UUID PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        requester_id UUID NOT NULL REFERENCES operators(id),
        target_id UUID NOT NULL REFERENCES operators(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de notas de ordens de serviço
  const createServiceOrderNotesTableSQL = `
  CREATE OR REPLACE FUNCTION create_service_order_notes_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'service_order_notes') THEN
      CREATE TABLE service_order_notes (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES service_orders(id),
        author_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_system_note BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de ordens de portas
  const createPortOrdersTableSQL = `
  CREATE OR REPLACE FUNCTION create_port_orders_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'port_orders') THEN
      CREATE TABLE port_orders (
        id UUID PRIMARY KEY,
        cto_id UUID NOT NULL REFERENCES ctos(id),
        port_number INTEGER NOT NULL,
        requester_id UUID NOT NULL REFERENCES operators(id),
        owner_id UUID NOT NULL REFERENCES operators(id),
        status VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        installation_fee DECIMAL(10, 2) NOT NULL,
        contract_signed_by_requester BOOLEAN DEFAULT FALSE,
        contract_signed_by_owner BOOLEAN DEFAULT FALSE,
        scheduled_date TIMESTAMP WITH TIME ZONE,
        completed_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de notas de ordens de portas
  const createPortOrderNotesTableSQL = `
  CREATE OR REPLACE FUNCTION create_port_order_notes_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'port_order_notes') THEN
      CREATE TABLE port_order_notes (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES port_orders(id),
        author_id VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_system_note BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de conversas de chat
  const createChatConversationsTableSQL = `
  CREATE OR REPLACE FUNCTION create_chat_conversations_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'chat_conversations') THEN
      CREATE TABLE chat_conversations (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de participantes de chat
  const createChatParticipantsTableSQL = `
  CREATE OR REPLACE FUNCTION create_chat_participants_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'chat_participants') THEN
      CREATE TABLE chat_participants (
        id SERIAL PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
        operator_id UUID NOT NULL REFERENCES operators(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(conversation_id, operator_id)
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Função para criar a tabela de mensagens de chat
  const createChatMessagesTableSQL = `
  CREATE OR REPLACE FUNCTION create_chat_messages_table_if_not_exists()
  RETURNS void AS $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'chat_messages') THEN
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
        sender_id UUID NOT NULL REFERENCES operators(id),
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END IF;
  END;
  $$ LANGUAGE plpgsql;
  `

  // Executar as funções SQL
  const sqlFunctions = [
    createOperatorsTableSQL,
    createCTOsTableSQL,
    createCTOPortsTableSQL,
    createServiceOrdersTableSQL,
    createServiceOrderNotesTableSQL,
    createPortOrdersTableSQL,
    createPortOrderNotesTableSQL,
    createChatConversationsTableSQL,
    createChatParticipantsTableSQL,
    createChatMessagesTableSQL,
  ]

  for (const sql of sqlFunctions) {
    const { error } = await supabase.rpc("exec_sql", { sql })
    if (error) {
      console.error("Erro ao executar SQL:", error)
    }
  }
}

// Executar o script
initDatabase()
  .then(() => {
    console.log("Script de inicialização concluído")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no script de inicialização:", error)
    process.exit(1)
  })
