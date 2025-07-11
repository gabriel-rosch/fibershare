import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Configuração do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ID fixo para o operador FiberShare
const FIBERSHARE_ID = "00000000-0000-0000-0000-000000000000"

// Função principal
async function resetAndSeedDatabase() {
  console.log("🚀 Iniciando processo de reset e seed do banco de dados...")

  try {
    // 1. Limpar todas as tabelas
    await resetTables()

    // 2. Inserir operadores
    const operatorIds = await seedOperators()
    console.log(`✅ Inseridos ${operatorIds.length} operadores`)

    // 3. Inserir CTOs
    const ctoIds = await seedCTOs(operatorIds)
    console.log(`✅ Inseridas ${ctoIds.length} CTOs`)

    // 4. Inserir portas de CTO
    const portIds = await seedCTOPorts(ctoIds, operatorIds)
    console.log(`✅ Inseridas ${portIds.length} portas de CTO`)

    // 5. Inserir ordens de serviço
    const serviceOrderIds = await seedServiceOrders(operatorIds)
    console.log(`✅ Inseridas ${serviceOrderIds.length} ordens de serviço`)

    // 6. Inserir notas de ordens de serviço
    const serviceOrderNoteIds = await seedServiceOrderNotes(serviceOrderIds, operatorIds)
    console.log(`✅ Inseridas ${serviceOrderNoteIds.length} notas de ordens de serviço`)

    // 7. Inserir ordens de porta
    const portOrderIds = await seedPortOrders(ctoIds, operatorIds)
    console.log(`✅ Inseridas ${portOrderIds.length} ordens de porta`)

    // 8. Inserir notas de ordens de porta
    const portOrderNoteIds = await seedPortOrderNotes(portOrderIds, operatorIds)
    console.log(`✅ Inseridas ${portOrderNoteIds.length} notas de ordens de porta`)

    // 9. Inserir conversas de chat
    const chatIds = await seedChatConversations()
    console.log(`✅ Inseridas ${chatIds.length} conversas de chat`)

    // 10. Inserir participantes de chat
    const participantIds = await seedChatParticipants(chatIds, operatorIds)
    console.log(`✅ Inseridos ${participantIds.length} participantes de chat`)

    // 11. Inserir mensagens de chat
    const messageIds = await seedChatMessages(chatIds, operatorIds)
    console.log(`✅ Inseridas ${messageIds.length} mensagens de chat`)

    // 12. Verificar status final
    await checkDatabaseStatus()

    console.log("\n🎉 Processo de reset e seed concluído com sucesso!")
  } catch (error) {
    console.error("❌ Erro durante o processo de reset e seed:", error)
  }
}

// Função para limpar todas as tabelas
async function resetTables() {
  console.log("\n🧹 Limpando todas as tabelas...")

  const tables = [
    "chat_messages",
    "chat_participants",
    "chat_conversations",
    "port_order_notes",
    "port_orders",
    "service_order_notes",
    "service_orders",
    "cto_ports",
    "ctos",
    "operators",
  ]

  for (const table of tables) {
    console.log(`  🗑️ Limpando tabela ${table}...`)
    const { error } = await supabase.from(table).delete().neq("id", "impossível-id-para-garantir-deleção-completa")

    if (error) {
      console.warn(`  ⚠️ Erro ao limpar tabela ${table}: ${error.message}`)
    }
  }

  console.log("✅ Todas as tabelas foram limpas")
}

// Função para inserir operadores
async function seedOperators() {
  console.log("\n🏢 Inserindo operadores...")

  const operators = [
    {
      id: FIBERSHARE_ID,
      name: "FiberShare",
      email: "admin@fibershare.com",
      role: "admin",
      status: "active",
      region: "Florianópolis",
    },
    {
      id: uuidv4(),
      name: "NetConnect",
      email: "contact@netconnect.com",
      role: "operator",
      status: "active",
      region: "São Paulo",
    },
    {
      id: uuidv4(),
      name: "FiberTech",
      email: "contact@fibertech.com",
      role: "operator",
      status: "active",
      region: "Rio de Janeiro",
    },
    {
      id: uuidv4(),
      name: "TelecomBR",
      email: "contact@telecombr.com",
      role: "partner",
      status: "active",
      region: "São Paulo",
    },
    {
      id: uuidv4(),
      name: "FiberNet",
      email: "contact@fibernet.com",
      role: "partner",
      status: "active",
      region: "Rio de Janeiro",
    },
    {
      id: uuidv4(),
      name: "OpticalConnect",
      email: "contact@opticalconnect.com",
      role: "partner",
      status: "active",
      region: "Belo Horizonte",
    },
    {
      id: uuidv4(),
      name: "SpeedFiber",
      email: "contact@speedfiber.com",
      role: "partner",
      status: "active",
      region: "Brasília",
    },
    {
      id: uuidv4(),
      name: "NetWave",
      email: "contact@netwave.com",
      role: "partner",
      status: "active",
      region: "Salvador",
    },
    {
      id: uuidv4(),
      name: "LightStream",
      email: "contact@lightstream.com",
      role: "partner",
      status: "active",
      region: "Recife",
    },
    {
      id: uuidv4(),
      name: "DataLink",
      email: "contact@datalink.com",
      role: "partner",
      status: "active",
      region: "Porto Alegre",
    },
    {
      id: uuidv4(),
      name: "TechFiber",
      email: "contact@techfiber.com",
      role: "partner",
      status: "active",
      region: "Fortaleza",
    },
  ]

  const timestamp = new Date().toISOString()
  const operatorsWithTimestamps = operators.map((op) => ({
    ...op,
    created_at: timestamp,
    updated_at: timestamp,
  }))

  const { error } = await supabase.from("operators").insert(operatorsWithTimestamps)

  if (error) {
    console.error("❌ Erro ao inserir operadores:", error)
    throw error
  }

  return operators.map((op) => op.id)
}

// Função para inserir CTOs
async function seedCTOs(operatorIds: string[]) {
  console.log("\n📦 Inserindo CTOs...")

  const ctos = [
    {
      id: uuidv4(),
      name: "CTO-001",
      description: "CTO localizada no centro de Florianópolis",
      total_ports: 24,
      occupied_ports: 10,
      coordinates: { lat: -27.5969, lng: -48.5495 },
      owner_id: FIBERSHARE_ID,
      region: "Florianópolis",
      status: "active",
    },
    {
      id: uuidv4(),
      name: "CTO-002",
      description: "CTO localizada na zona norte de São Paulo",
      total_ports: 16,
      occupied_ports: 8,
      coordinates: { lat: -23.5505, lng: -46.6333 },
      owner_id: FIBERSHARE_ID,
      region: "São Paulo",
      status: "active",
    },
    {
      id: uuidv4(),
      name: "CTO-003",
      description: "CTO localizada no centro do Rio de Janeiro",
      total_ports: 32,
      occupied_ports: 20,
      coordinates: { lat: -22.9068, lng: -43.1729 },
      owner_id: FIBERSHARE_ID,
      region: "Rio de Janeiro",
      status: "active",
    },
    {
      id: uuidv4(),
      name: "CTO-004",
      description: "CTO localizada em Belo Horizonte",
      total_ports: 16,
      occupied_ports: 4,
      coordinates: { lat: -19.9167, lng: -43.9345 },
      owner_id: FIBERSHARE_ID,
      region: "Belo Horizonte",
      status: "maintenance",
    },
  ]

  const timestamp = new Date().toISOString()
  const ctosWithTimestamps = ctos.map((cto) => ({
    ...cto,
    created_at: timestamp,
    updated_at: timestamp,
  }))

  const { error } = await supabase.from("ctos").insert(ctosWithTimestamps)

  if (error) {
    console.error("❌ Erro ao inserir CTOs:", error)
    throw error
  }

  return ctos.map((cto) => cto.id)
}

// Função para inserir portas de CTO
async function seedCTOPorts(ctoIds: string[], operatorIds: string[]) {
  console.log("\n🔌 Inserindo portas de CTO...")

  const ports: any[] = []

  // Obter detalhes das CTOs
  const { data: ctos, error: ctosError } = await supabase.from("ctos").select("id, name, total_ports, occupied_ports")

  if (ctosError) {
    console.error("❌ Erro ao obter CTOs:", ctosError)
    throw ctosError
  }

  // Criar portas para cada CTO
  for (const cto of ctos) {
    const occupiedPorts = cto.occupied_ports
    const totalPorts = cto.total_ports

    for (let portNum = 1; portNum <= totalPorts; portNum++) {
      const isOccupied = portNum <= occupiedPorts
      const partnerId = isOccupied
        ? operatorIds.filter((id) => id !== FIBERSHARE_ID)[Math.floor(Math.random() * (operatorIds.length - 1))]
        : null

      ports.push({
        id: uuidv4(),
        cto_id: cto.id,
        port_number: portNum,
        status: isOccupied ? "occupied" : "available",
        current_tenant_id: partnerId,
        price: 90 + Math.floor(Math.random() * 30),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  // Inserir portas em lotes de 50 para evitar problemas com limites de tamanho
  const batchSize = 50
  for (let i = 0; i < ports.length; i += batchSize) {
    const batch = ports.slice(i, i + batchSize)
    const { error } = await supabase.from("cto_ports").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de portas ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return ports.map((port) => port.id)
}

// Função para inserir ordens de serviço
async function seedServiceOrders(operatorIds: string[]) {
  console.log("\n📋 Inserindo ordens de serviço...")

  const orderTypes = ["maintenance", "installation", "support", "removal", "other"]
  const orderStatuses = ["pending", "in_progress", "completed", "rejected", "cancelled"]

  const orders: any[] = []

  // Criar 30 ordens de serviço com dados variados
  for (let i = 0; i < 30; i++) {
    const type = orderTypes[Math.floor(Math.random() * orderTypes.length)]
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]

    // Escolher solicitante e alvo aleatoriamente
    const requesterId = i % 3 === 0 ? FIBERSHARE_ID : operatorIds[Math.floor(Math.random() * operatorIds.length)]
    let targetId
    do {
      targetId = operatorIds[Math.floor(Math.random() * operatorIds.length)]
    } while (targetId === requesterId)

    // Criar datas aleatórias no passado
    const createdDaysAgo = Math.floor(Math.random() * 60) + 1
    const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    const updatedAt = new Date(
      Date.now() - Math.floor(Math.random() * createdDaysAgo) * 24 * 60 * 60 * 1000,
    ).toISOString()

    // Definir data de conclusão apenas para ordens completadas
    const completedAt =
      status === "completed"
        ? new Date(Date.now() - Math.floor(Math.random() * (createdDaysAgo - 1)) * 24 * 60 * 60 * 1000).toISOString()
        : null

    orders.push({
      id: uuidv4(),
      type,
      status,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${i + 1}`,
      description: `Ordem de ${type} criada para o operador ${targetId}`,
      requester_id: requesterId,
      target_id: targetId,
      created_at: createdAt,
      updated_at: updatedAt,
      completed_at: completedAt,
    })
  }

  // Inserir ordens em lotes
  const batchSize = 10
  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize)
    const { error } = await supabase.from("service_orders").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de ordens de serviço ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return orders.map((order) => order.id)
}

// Função para inserir notas de ordens de serviço
async function seedServiceOrderNotes(orderIds: string[], operatorIds: string[]) {
  console.log("\n📝 Inserindo notas de ordens de serviço...")

  const notes: any[] = []

  // Obter detalhes das ordens
  const { data: orders, error: ordersError } = await supabase
    .from("service_orders")
    .select("id, status, requester_id, target_id, created_at")

  if (ordersError) {
    console.error("❌ Erro ao obter ordens de serviço:", ordersError)
    throw ordersError
  }

  // Criar notas do sistema para cada ordem
  for (const order of orders) {
    // Nota do sistema para cada ordem
    notes.push({
      id: uuidv4(),
      order_id: order.id,
      author_id: FIBERSHARE_ID,
      content: `Ordem de serviço criada com status: ${order.status}`,
      is_system_note: true,
      created_at: order.created_at,
    })

    // Adicionar 2-5 notas adicionais para cada ordem
    const noteCount = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < noteCount; i++) {
      const authorId = Math.random() > 0.5 ? order.requester_id : order.target_id
      const createdDaysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()

      notes.push({
        id: uuidv4(),
        order_id: order.id,
        author_id: authorId,
        content: getRandomServiceNote(),
        is_system_note: false,
        created_at: createdAt,
      })
    }
  }

  // Inserir notas em lotes
  const batchSize = 50
  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize)
    const { error } = await supabase.from("service_order_notes").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de notas de ordens de serviço ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return notes.map((note) => note.id)
}

// Função para inserir ordens de porta
async function seedPortOrders(ctoIds: string[], operatorIds: string[]) {
  console.log("\n🔄 Inserindo ordens de porta...")

  const portOrders: any[] = []
  const orderStatuses = [
    "pending_approval",
    "rejected",
    "contract_generated",
    "contract_signed",
    "installation_scheduled",
    "installation_in_progress",
    "completed",
    "cancelled",
  ]

  // Obter CTOs e portas disponíveis
  const { data: ctos, error: ctosError } = await supabase.from("ctos").select("id, owner_id")
  if (ctosError) {
    console.error("❌ Erro ao obter CTOs:", ctosError)
    throw ctosError
  }

  // Criar 50 ordens de porta com dados variados
  for (let i = 0; i < 50; i++) {
    const cto = ctos[Math.floor(Math.random() * ctos.length)]
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)]

    // Escolher solicitante diferente do proprietário
    let requesterId
    do {
      requesterId = operatorIds[Math.floor(Math.random() * operatorIds.length)]
    } while (requesterId === cto.owner_id)

    // Criar datas aleatórias
    const createdDaysAgo = Math.floor(Math.random() * 60) + 1
    const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    const updatedAt = new Date(
      Date.now() - Math.floor(Math.random() * createdDaysAgo) * 24 * 60 * 60 * 1000,
    ).toISOString()

    // Definir datas condicionais com base no status
    const contractSigned = [
      "contract_signed",
      "installation_scheduled",
      "installation_in_progress",
      "completed",
    ].includes(status)
    const scheduledDate = ["installation_scheduled", "installation_in_progress", "completed"].includes(status)
      ? new Date(Date.now() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
      : null
    const completedDate =
      status === "completed"
        ? new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        : null

    portOrders.push({
      id: uuidv4(),
      cto_id: cto.id,
      port_number: Math.floor(Math.random() * 24) + 1, // Número de porta aleatório entre 1 e 24
      requester_id: requesterId,
      owner_id: cto.owner_id,
      status,
      price: 90 + Math.floor(Math.random() * 50),
      installation_fee: 120 + Math.floor(Math.random() * 80),
      contract_signed_by_requester: contractSigned,
      contract_signed_by_owner: contractSigned,
      scheduled_date: scheduledDate,
      completed_date: completedDate,
      created_at: createdAt,
      updated_at: updatedAt,
    })
  }

  // Inserir ordens em lotes
  const batchSize = 10
  for (let i = 0; i < portOrders.length; i += batchSize) {
    const batch = portOrders.slice(i, i + batchSize)
    const { error } = await supabase.from("port_orders").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de ordens de porta ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return portOrders.map((order) => order.id)
}

// Função para inserir notas de ordens de porta
async function seedPortOrderNotes(orderIds: string[], operatorIds: string[]) {
  console.log("\n📝 Inserindo notas de ordens de porta...")

  const notes: any[] = []

  // Obter detalhes das ordens
  const { data: orders, error: ordersError } = await supabase
    .from("port_orders")
    .select("id, status, requester_id, owner_id, created_at")

  if (ordersError) {
    console.error("❌ Erro ao obter ordens de porta:", ordersError)
    throw ordersError
  }

  // Criar notas do sistema para cada ordem
  for (const order of orders) {
    // Nota do sistema para cada ordem
    notes.push({
      id: uuidv4(),
      order_id: order.id,
      author_id: FIBERSHARE_ID,
      content: getSystemNoteForPortOrder(order.status),
      is_system_note: true,
      created_at: order.created_at,
    })

    // Adicionar 2-5 notas adicionais para cada ordem
    const noteCount = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < noteCount; i++) {
      const authorId = Math.random() > 0.5 ? order.requester_id : order.owner_id
      const createdDaysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()

      notes.push({
        id: uuidv4(),
        order_id: order.id,
        author_id: authorId,
        content: getRandomPortOrderNote(),
        is_system_note: false,
        created_at: createdAt,
      })
    }
  }

  // Inserir notas em lotes
  const batchSize = 50
  for (let i = 0; i < notes.length; i += batchSize) {
    const batch = notes.slice(i, i + batchSize)
    const { error } = await supabase.from("port_order_notes").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de notas de ordens de porta ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return notes.map((note) => note.id)
}

// Função para inserir conversas de chat
async function seedChatConversations() {
  console.log("\n💬 Inserindo conversas de chat...")

  const conversations = []

  // Criar 5 conversas
  for (let i = 0; i < 5; i++) {
    const createdDaysAgo = Math.floor(Math.random() * 30) + 1
    const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    const updatedAt = new Date(
      Date.now() - Math.floor(Math.random() * createdDaysAgo) * 24 * 60 * 60 * 1000,
    ).toISOString()

    conversations.push({
      id: uuidv4(),
      created_at: createdAt,
      updated_at: updatedAt,
    })
  }

  const { error } = await supabase.from("chat_conversations").insert(conversations)

  if (error) {
    console.error("❌ Erro ao inserir conversas de chat:", error)
    throw error
  }

  return conversations.map((conv) => conv.id)
}

// Função para inserir participantes de chat
async function seedChatParticipants(conversationIds: string[], operatorIds: string[]) {
  console.log("\n👥 Inserindo participantes de chat...")

  const participants = []

  // Para cada conversa, adicionar 2-4 participantes
  for (const convId of conversationIds) {
    // Sempre incluir FiberShare como participante
    participants.push({
      id: uuidv4(),
      conversation_id: convId,
      operator_id: FIBERSHARE_ID,
      created_at: new Date().toISOString(),
    })

    // Adicionar 1-3 outros participantes aleatórios
    const otherOperators = operatorIds.filter((id) => id !== FIBERSHARE_ID)
    const participantCount = Math.floor(Math.random() * 3) + 1

    const selectedOperators: string[] = []
    for (let i = 0; i < participantCount; i++) {
      let operatorId
      do {
        operatorId = otherOperators[Math.floor(Math.random() * otherOperators.length)]
      } while (selectedOperators.includes(operatorId))

      selectedOperators.push(operatorId)

      participants.push({
        id: uuidv4(),
        conversation_id: convId,
        operator_id: operatorId,
        created_at: new Date().toISOString(),
      })
    }
  }

  const { error } = await supabase.from("chat_participants").insert(participants)

  if (error) {
    console.error("❌ Erro ao inserir participantes de chat:", error)
    throw error
  }

  return participants.map((p) => p.id)
}

// Função para inserir mensagens de chat
async function seedChatMessages(conversationIds: string[], operatorIds: string[]) {
  console.log("\n✉️ Inserindo mensagens de chat...")

  const messages = []

  // Obter participantes para cada conversa
  const { data: participants, error: participantsError } = await supabase
    .from("chat_participants")
    .select("conversation_id, operator_id")

  if (participantsError) {
    console.error("❌ Erro ao obter participantes de chat:", participantsError)
    throw participantsError
  }

  // Agrupar participantes por conversa
  const participantsByConversation: Record<string, string[]> = {}
  for (const p of participants) {
    if (!participantsByConversation[p.conversation_id]) {
      participantsByConversation[p.conversation_id] = []
    }
    participantsByConversation[p.conversation_id].push(p.operator_id)
  }

  // Para cada conversa, adicionar 5-15 mensagens
  for (const convId of conversationIds) {
    const convParticipants = participantsByConversation[convId] || []
    if (convParticipants.length === 0) continue

    const messageCount = Math.floor(Math.random() * 11) + 5

    for (let i = 0; i < messageCount; i++) {
      const senderId = convParticipants[Math.floor(Math.random() * convParticipants.length)]
      const createdDaysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()

      messages.push({
        id: uuidv4(),
        conversation_id: convId,
        sender_id: senderId,
        content: getRandomChatMessage(),
        read: Math.random() > 0.3, // 70% de chance de estar lida
        created_at: createdAt,
      })
    }
  }

  // Ordenar mensagens por data de criação
  messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Inserir mensagens em lotes
  const batchSize = 50
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const { error } = await supabase.from("chat_messages").insert(batch)

    if (error) {
      console.error(`❌ Erro ao inserir lote de mensagens de chat ${i / batchSize + 1}:`, error)
      throw error
    }
  }

  return messages.map((m) => m.id)
}

// Função para verificar o status do banco de dados
async function checkDatabaseStatus() {
  console.log("\n📊 Verificando status do banco de dados...")

  const tables = [
    "operators",
    "ctos",
    "cto_ports",
    "service_orders",
    "service_order_notes",
    "port_orders",
    "port_order_notes",
    "chat_conversations",
    "chat_participants",
    "chat_messages",
  ]

  console.log("📋 Contagem de registros por tabela:")

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("id", { count: "exact", head: true })

    if (error) {
      console.error(`  ❌ Erro ao verificar tabela ${table}: ${error.message}`)
    } else {
      console.log(`  - ${table}: ${data?.length || 0} registros`)
    }
  }
}

// Funções auxiliares para gerar conteúdo aleatório
function getRandomServiceNote() {
  const notes = [
    "Verificação inicial realizada.",
    "Equipamento apresenta falha no módulo de comunicação.",
    "Substituição de componente necessária.",
    "Agendamento realizado para o próximo dia útil.",
    "Cliente informado sobre o procedimento.",
    "Técnico designado para atendimento.",
    "Peças solicitadas ao almoxarifado.",
    "Problema resolvido após reinicialização do sistema.",
    "Necessário retorno para verificação adicional.",
    "Documentação atualizada com as alterações realizadas.",
    "Teste de conectividade realizado com sucesso.",
    "Configuração atualizada conforme solicitado.",
    "Backup dos dados realizado antes da intervenção.",
    "Treinamento básico fornecido ao usuário.",
    "Relatório técnico enviado por e-mail.",
  ]

  return notes[Math.floor(Math.random() * notes.length)]
}

function getSystemNoteForPortOrder(status: string) {
  const statusNotes: Record<string, string> = {
    pending_approval: "Ordem de aluguel de porta criada e aguardando aprovação do proprietário.",
    rejected: "Solicitação rejeitada pelo proprietário.",
    contract_generated: "Contrato gerado e enviado para assinatura.",
    contract_signed: "Contrato assinado por ambas as partes.",
    installation_scheduled: "Instalação agendada.",
    installation_in_progress: "Instalação em andamento.",
    completed: "Instalação concluída com sucesso.",
    cancelled: "Ordem cancelada.",
  }

  return statusNotes[status] || "Ordem criada."
}

function getRandomPortOrderNote() {
  const notes = [
    "Solicitação enviada para análise.",
    "Aguardando resposta do proprietário.",
    "Contrato recebido, analisando termos.",
    "Documentação enviada conforme solicitado.",
    "Agendamento confirmado para a data proposta.",
    "Técnico designado para a instalação.",
    "Instalação realizada com sucesso.",
    "Teste de conectividade realizado.",
    "Ajustes necessários na configuração.",
    "Fatura gerada para o serviço.",
    "Solicitação de alteração de data enviada.",
    "Confirmação de pagamento recebida.",
    "Relatório de instalação anexado.",
    "Visita técnica adicional agendada.",
    "Termo de aceite assinado pelo cliente.",
  ]

  return notes[Math.floor(Math.random() * notes.length)]
}

function getRandomChatMessage() {
  const messages = [
    "Olá, tudo bem?",
    "Precisamos agendar uma manutenção na CTO.",
    "Quando podemos realizar a instalação?",
    "A ordem de serviço foi concluída com sucesso.",
    "Estamos com um problema na porta 3 da CTO-001.",
    "Poderia verificar a disponibilidade para a próxima semana?",
    "O cliente está aguardando retorno sobre o agendamento.",
    "Já foi realizada a verificação solicitada?",
    "Precisamos de mais informações sobre o problema relatado.",
    "A equipe técnica está a caminho do local.",
    "Qual o status atual da instalação?",
    "Podemos agendar uma reunião para discutir o projeto?",
    "Os documentos foram enviados por e-mail.",
    "Confirma o recebimento do relatório?",
    "Precisamos de acesso ao local para realizar a manutenção.",
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

// Executar o script
resetAndSeedDatabase()
  .then(() => {
    console.log("✅ Script concluído com sucesso!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Erro durante a execução do script:", error)
    process.exit(1)
  })
