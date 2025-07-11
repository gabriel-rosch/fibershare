import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Função principal para executar o seed
async function seedDatabase() {
  console.log("Iniciando seed do banco de dados...")

  // Configurar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar se já existem operadores
    const { count: operatorCount, error: countError } = await supabase
      .from("operators")
      .select("*", { count: "exact", head: true })

    if (countError) {
      throw new Error(`Erro ao verificar operadores: ${countError.message}`)
    }

    if (operatorCount === 0) {
      console.log("Nenhum operador encontrado. Iniciando seed de operadores...")
      await seedOperators(supabase)
    } else {
      console.log(`${operatorCount} operadores já existem. Pulando seed de operadores.`)
    }

    // Verificar se já existem CTOs
    const { count: ctoCount, error: ctoCountError } = await supabase
      .from("ctos")
      .select("*", { count: "exact", head: true })

    if (ctoCountError) {
      throw new Error(`Erro ao verificar CTOs: ${ctoCountError.message}`)
    }

    if (ctoCount === 0) {
      console.log("Nenhuma CTO encontrada. Iniciando seed de CTOs...")
      await seedCTOs(supabase)
    } else {
      console.log(`${ctoCount} CTOs já existem. Pulando seed de CTOs.`)
    }

    // Verificar se já existem ordens de serviço
    const { count: orderCount, error: orderCountError } = await supabase
      .from("service_orders")
      .select("*", { count: "exact", head: true })

    if (orderCountError) {
      throw new Error(`Erro ao verificar ordens de serviço: ${orderCountError.message}`)
    }

    if (orderCount === 0) {
      console.log("Nenhuma ordem de serviço encontrada. Iniciando seed de ordens...")
      await seedServiceOrders(supabase)
    } else {
      console.log(`${orderCount} ordens de serviço já existem. Pulando seed de ordens.`)
    }

    // Verificar se já existem ordens de portas
    const { count: portOrderCount, error: portOrderCountError } = await supabase
      .from("port_orders")
      .select("*", { count: "exact", head: true })

    if (portOrderCountError) {
      throw new Error(`Erro ao verificar ordens de portas: ${portOrderCountError.message}`)
    }

    if (portOrderCount === 0) {
      console.log("Nenhuma ordem de porta encontrada. Iniciando seed de ordens de portas...")
      await seedPortOrders(supabase)
    } else {
      console.log(`${portOrderCount} ordens de portas já existem. Pulando seed de ordens de portas.`)
    }

    // Verificar se já existem conversas de chat
    const { count: chatCount, error: chatCountError } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })

    if (chatCountError) {
      throw new Error(`Erro ao verificar conversas de chat: ${chatCountError.message}`)
    }

    if (chatCount === 0) {
      console.log("Nenhuma conversa de chat encontrada. Iniciando seed de chat...")
      await seedChat(supabase)
    } else {
      console.log(`${chatCount} conversas de chat já existem. Pulando seed de chat.`)
    }

    console.log("Seed do banco de dados concluído com sucesso!")
  } catch (error) {
    console.error("Erro durante o seed do banco de dados:", error)
  }
}

// Dados para seed
const FIBERSHARE_ID = "00000000-0000-0000-0000-000000000000"
const REGIONS = ["Florianópolis", "São José", "Palhoça", "Biguaçu", "Santo Amaro da Imperatriz"]
const OPERATOR_ROLES = ["admin", "operator", "support", "manager"]
const OPERATOR_STATUSES = ["active", "inactive"]
const CTO_STATUSES = ["active", "maintenance", "planned"]
const SERVICE_ORDER_TYPES = ["maintenance", "support", "installation", "removal", "other"]
const SERVICE_ORDER_STATUSES = ["pending", "in_progress", "completed", "cancelled", "rejected"]
const PORT_ORDER_STATUSES = [
  "pending_approval",
  "rejected",
  "contract_generated",
  "contract_signed",
  "installation_scheduled",
  "installation_in_progress",
  "completed",
  "cancelled",
]

// Função para seed de operadores
async function seedOperators(supabase: any) {
  try {
    // Inserir operadora atual (FiberShare)
    const { data: fiberShare, error: fiberShareError } = await supabase
      .from("operators")
      .insert([
        {
          id: FIBERSHARE_ID,
          name: "FiberShare",
          email: "admin@fibershare.com", // Email que corresponde ao usuário criado pelo script create-dev-user.ts
          role: "admin",
          status: "active",
          region: "Florianópolis",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (fiberShareError) {
      throw new Error(`Erro ao inserir operadora atual: ${fiberShareError.message}`)
    }

    console.log("Operadora atual inserida com sucesso:", fiberShare)

    // Inserir outras operadoras
    const operatorsToInsert = []
    const operatorNames = [
      "NetConnect",
      "FiberTech",
      "SpeedLink",
      "DataStream",
      "WaveNet",
      "OpticFiber",
      "ConnectWave",
      "NetPulse",
      "LinkSphere",
      "TechFiber",
    ]

    for (let i = 0; i < operatorNames.length; i++) {
      operatorsToInsert.push({
        id: uuidv4(),
        name: operatorNames[i],
        email: `contact@${operatorNames[i].toLowerCase().replace(/\s+/g, "")}.com`,
        role: OPERATOR_ROLES[Math.floor(Math.random() * OPERATOR_ROLES.length)],
        status: OPERATOR_STATUSES[Math.floor(Math.random() * OPERATOR_STATUSES.length)],
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(), // Até 90 dias atrás
        updated_at: new Date().toISOString(),
      })
    }

    const { data: operators, error: operatorsError } = await supabase
      .from("operators")
      .insert(operatorsToInsert)
      .select()

    if (operatorsError) {
      throw new Error(`Erro ao inserir operadoras: ${operatorsError.message}`)
    }

    console.log(`${operators.length} operadoras inseridas com sucesso`)
  } catch (error) {
    console.error("Erro durante o seed de operadores:", error)
    throw error
  }
}

// Função para seed de CTOs
async function seedCTOs(supabase: any) {
  try {
    // Obter todos os operadores para distribuir as CTOs
    const { data: operators, error: operatorsError } = await supabase.from("operators").select("id, name")

    if (operatorsError) {
      throw new Error(`Erro ao buscar operadores: ${operatorsError.message}`)
    }

    if (!operators || operators.length === 0) {
      throw new Error("Nenhum operador encontrado para associar às CTOs")
    }

    // Inserir CTOs
    const ctosToInsert = []
    const ctoCount = 20 // Número de CTOs a serem criadas

    // Coordenadas base para Florianópolis (centro)
    const baseLatitude = -27.5969
    const baseLongitude = -48.5495

    for (let i = 0; i < ctoCount; i++) {
      // Gerar coordenadas aleatórias próximas ao centro de Florianópolis
      const latitude = baseLatitude + (Math.random() - 0.5) * 0.1
      const longitude = baseLongitude + (Math.random() - 0.5) * 0.1

      // Número total de portas (entre 8 e 32)
      const totalPorts = Math.floor(Math.random() * 25) + 8
      // Número de portas ocupadas (entre 0 e totalPorts)
      const occupiedPorts = Math.floor(Math.random() * (totalPorts + 1))

      // Selecionar um operador aleatório como proprietário
      const owner = operators[Math.floor(Math.random() * operators.length)]

      ctosToInsert.push({
        id: uuidv4(),
        name: `CTO-${String(i + 1).padStart(3, "0")}`,
        description: `CTO localizada na região ${REGIONS[Math.floor(Math.random() * REGIONS.length)]}`,
        total_ports: totalPorts,
        occupied_ports: occupiedPorts,
        coordinates: { lat: latitude, lng: longitude },
        owner_id: owner.id,
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
        status: CTO_STATUSES[Math.floor(Math.random() * CTO_STATUSES.length)],
        created_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(), // Até 90 dias atrás
        updated_at: new Date().toISOString(),
      })
    }

    const { data: ctos, error: ctosError } = await supabase.from("ctos").insert(ctosToInsert).select()

    if (ctosError) {
      throw new Error(`Erro ao inserir CTOs: ${ctosError.message}`)
    }

    console.log(`${ctos.length} CTOs inseridas com sucesso`)

    // Criar portas para cada CTO
    for (const cto of ctos) {
      const portsToInsert = []

      for (let i = 0; i < cto.total_ports; i++) {
        // Determinar se a porta está ocupada
        const isOccupied = i < cto.occupied_ports

        // Se estiver ocupada, selecionar um operador aleatório como inquilino
        const tenantId = isOccupied ? operators[Math.floor(Math.random() * operators.length)].id : null

        portsToInsert.push({
          cto_id: cto.id,
          port_number: i + 1,
          status: isOccupied ? "occupied" : "available",
          current_tenant_id: tenantId,
          price: 45 + Math.floor(Math.random() * 10), // Preço entre 45 e 54
          created_at: cto.created_at,
          updated_at: cto.updated_at,
        })
      }

      const { data: ports, error: portsError } = await supabase.from("cto_ports").insert(portsToInsert).select()

      if (portsError) {
        throw new Error(`Erro ao inserir portas para CTO ${cto.id}: ${portsError.message}`)
      }

      console.log(`${ports.length} portas inseridas para CTO ${cto.name}`)
    }
  } catch (error) {
    console.error("Erro durante o seed de CTOs:", error)
    throw error
  }
}

// Função para seed de ordens de serviço
async function seedServiceOrders(supabase: any) {
  try {
    // Obter todos os operadores para distribuir as ordens
    const { data: operators, error: operatorsError } = await supabase.from("operators").select("id, name")

    if (operatorsError) {
      throw new Error(`Erro ao buscar operadores: ${operatorsError.message}`)
    }

    if (!operators || operators.length === 0) {
      throw new Error("Nenhum operador encontrado para associar às ordens")
    }

    // Inserir ordens de serviço
    const ordersToInsert = []
    const orderCount = 30 // Número de ordens a serem criadas

    const orderTitles = [
      "Manutenção preventiva",
      "Reparo de fibra rompida",
      "Instalação de nova CTO",
      "Remoção de equipamento",
      "Atualização de firmware",
      "Substituição de equipamento",
      "Verificação de sinal",
      "Ampliação de rede",
      "Configuração de equipamento",
      "Inspeção de infraestrutura",
    ]

    for (let i = 0; i < orderCount; i++) {
      // Selecionar operadores aleatórios como solicitante e alvo
      const requesterIndex = Math.floor(Math.random() * operators.length)
      let targetIndex
      do {
        targetIndex = Math.floor(Math.random() * operators.length)
      } while (targetIndex === requesterIndex) // Garantir que o alvo seja diferente do solicitante

      const requester = operators[requesterIndex]
      const target = operators[targetIndex]

      // Determinar o tipo e status da ordem
      const type = SERVICE_ORDER_TYPES[Math.floor(Math.random() * SERVICE_ORDER_TYPES.length)]
      const status = SERVICE_ORDER_STATUSES[Math.floor(Math.random() * SERVICE_ORDER_STATUSES.length)]

      // Gerar datas
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Até 30 dias atrás
      const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)) // Até 5 dias após a criação
      let completedAt = null
      if (status === "completed") {
        completedAt = new Date(updatedAt.getTime() + Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000)) // Até 2 dias após a atualização
      }

      ordersToInsert.push({
        id: uuidv4(),
        type,
        status,
        title: orderTitles[Math.floor(Math.random() * orderTitles.length)],
        description: `Ordem de serviço para ${type} solicitada por ${requester.name} para ${target.name}`,
        requester_id: requester.id,
        target_id: target.id,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        completed_at: completedAt ? completedAt.toISOString() : null,
      })
    }

    const { data: orders, error: ordersError } = await supabase.from("service_orders").insert(ordersToInsert).select()

    if (ordersError) {
      throw new Error(`Erro ao inserir ordens de serviço: ${ordersError.message}`)
    }

    console.log(`${orders.length} ordens de serviço inseridas com sucesso`)

    // Inserir notas para cada ordem
    for (const order of orders) {
      const notesToInsert = []
      const noteCount = Math.floor(Math.random() * 5) + 1 // Entre 1 e 5 notas por ordem

      // Nota do sistema para a criação da ordem
      notesToInsert.push({
        order_id: order.id,
        author_id: "system",
        content: `Ordem de serviço criada e aguardando processamento.`,
        is_system_note: true,
        created_at: order.created_at,
      })

      // Notas adicionais
      const noteContents = [
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
      ]

      for (let i = 0; i < noteCount; i++) {
        // Alternar entre notas do sistema e do solicitante
        const isSystemNote = i % 2 === 0
        const authorId = isSystemNote ? "system" : order.requester_id

        // Gerar data da nota (após a criação da ordem)
        const noteDate = new Date(
          new Date(order.created_at).getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000),
        ) // Até 5 dias após a criação da ordem

        notesToInsert.push({
          order_id: order.id,
          author_id: authorId,
          content: noteContents[Math.floor(Math.random() * noteContents.length)],
          is_system_note: isSystemNote,
          created_at: noteDate.toISOString(),
        })
      }

      // Adicionar nota de conclusão se a ordem estiver concluída
      if (order.status === "completed" && order.completed_at) {
        notesToInsert.push({
          order_id: order.id,
          author_id: "system",
          content: `Ordem de serviço concluída com sucesso.`,
          is_system_note: true,
          created_at: order.completed_at,
        })
      }

      const { data: notes, error: notesError } = await supabase
        .from("service_order_notes")
        .insert(notesToInsert)
        .select()

      if (notesError) {
        throw new Error(`Erro ao inserir notas para ordem ${order.id}: ${notesError.message}`)
      }

      console.log(`${notes.length} notas inseridas para ordem ${order.id}`)
    }
  } catch (error) {
    console.error("Erro durante o seed de ordens de serviço:", error)
    throw error
  }
}

// Função para seed de ordens de portas
async function seedPortOrders(supabase: any) {
  try {
    // Obter todos os operadores
    const { data: operators, error: operatorsError } = await supabase.from("operators").select("id, name")

    if (operatorsError) {
      throw new Error(`Erro ao buscar operadores: ${operatorsError.message}`)
    }

    // Obter todas as CTOs
    const { data: ctos, error: ctosError } = await supabase.from("ctos").select("id, name, owner_id")

    if (ctosError) {
      throw new Error(`Erro ao buscar CTOs: ${ctosError.message}`)
    }

    // Inserir ordens de portas
    const portOrdersToInsert = []
    const portOrderCount = 25 // Número de ordens a serem criadas

    for (let i = 0; i < portOrderCount; i++) {
      // Selecionar uma CTO aleatória
      const cto = ctos[Math.floor(Math.random() * ctos.length)]

      // Selecionar um operador aleatório como solicitante (diferente do proprietário da CTO)
      let requester
      do {
        requester = operators[Math.floor(Math.random() * operators.length)]
      } while (requester.id === cto.owner_id)

      // Determinar o status da ordem
      const status = PORT_ORDER_STATUSES[Math.floor(Math.random() * PORT_ORDER_STATUSES.length)]

      // Determinar se os contratos foram assinados com base no status
      const contractSignedByRequester =
        status === "contract_signed" ||
        status === "installation_scheduled" ||
        status === "installation_in_progress" ||
        status === "completed"
      const contractSignedByOwner = contractSignedByRequester

      // Gerar datas
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Até 30 dias atrás
      const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)) // Até 5 dias após a criação

      // Gerar data agendada e concluída se aplicável
      let scheduledDate = null
      let completedDate = null

      if (status === "installation_scheduled" || status === "installation_in_progress" || status === "completed") {
        scheduledDate = new Date(updatedAt.getTime() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Até 7 dias após a atualização
      }

      if (status === "completed") {
        completedDate = new Date(
          scheduledDate
            ? new Date(scheduledDate).getTime() + Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)
            : updatedAt.getTime() + Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000),
        ) // Até 3 dias após o agendamento ou 10 dias após a atualização
      }

      portOrdersToInsert.push({
        id: uuidv4(),
        cto_id: cto.id,
        port_number: Math.floor(Math.random() * 8) + 1, // Porta entre 1 e 8
        requester_id: requester.id,
        owner_id: cto.owner_id,
        status,
        price: 45 + Math.floor(Math.random() * 10), // Preço entre 45 e 54
        installation_fee: 100 + Math.floor(Math.random() * 50), // Taxa entre 100 e 149
        contract_signed_by_requester: contractSignedByRequester,
        contract_signed_by_owner: contractSignedByOwner,
        scheduled_date: scheduledDate ? scheduledDate.toISOString() : null,
        completed_date: completedDate ? completedDate.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: updatedAt.toISOString(),
      })
    }

    const { data: portOrders, error: portOrdersError } = await supabase
      .from("port_orders")
      .insert(portOrdersToInsert)
      .select()

    if (portOrdersError) {
      throw new Error(`Erro ao inserir ordens de portas: ${portOrdersError.message}`)
    }

    console.log(`${portOrders.length} ordens de portas inseridas com sucesso`)

    // Inserir notas para cada ordem de porta
    for (const order of portOrders) {
      const notesToInsert = []
      const noteCount = Math.floor(Math.random() * 4) + 1 // Entre 1 e 4 notas por ordem

      // Nota do sistema para a criação da ordem
      notesToInsert.push({
        order_id: order.id,
        author_id: "system",
        content: `Ordem de aluguel de porta criada e aguardando aprovação do proprietário.`,
        is_system_note: true,
        created_at: order.created_at,
      })

      // Notas adicionais
      const noteContents = [
        "Solicitação analisada e aprovada.",
        "Contrato gerado e enviado para assinatura.",
        "Documentação recebida e verificada.",
        "Agendamento de instalação confirmado.",
        "Técnico designado para instalação.",
        "Instalação concluída com sucesso.",
        "Teste de conectividade realizado.",
        "Ajustes necessários na configuração.",
        "Cliente informado sobre os procedimentos.",
        "Fatura gerada para o serviço.",
      ]

      // Adicionar notas com base no status
      if (order.status !== "pending_approval") {
        notesToInsert.push({
          order_id: order.id,
          author_id: order.owner_id,
          content:
            order.status === "rejected"
              ? "Solicitação analisada e rejeitada devido à indisponibilidade de recursos."
              : "Solicitação analisada e aprovada. Prosseguindo com os próximos passos.",
          is_system_note: false,
          created_at: new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 dia após a criação
        })
      }

      for (let i = 0; i < noteCount; i++) {
        // Alternar entre notas do proprietário e do solicitante
        const authorId = i % 2 === 0 ? order.owner_id : order.requester_id

        // Gerar data da nota (após a criação da ordem)
        const noteDate = new Date(
          new Date(order.created_at).getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000),
        ) // Até 5 dias após a criação da ordem

        notesToInsert.push({
          order_id: order.id,
          author_id: authorId,
          content: noteContents[Math.floor(Math.random() * noteContents.length)],
          is_system_note: false,
          created_at: noteDate.toISOString(),
        })
      }

      // Adicionar nota de conclusão se a ordem estiver concluída
      if (order.status === "completed" && order.completed_date) {
        notesToInsert.push({
          order_id: order.id,
          author_id: "system",
          content: `Instalação concluída e porta ativada com sucesso.`,
          is_system_note: true,
          created_at: order.completed_date,
        })
      }

      const { data: notes, error: notesError } = await supabase.from("port_order_notes").insert(notesToInsert).select()

      if (notesError) {
        throw new Error(`Erro ao inserir notas para ordem de porta ${order.id}: ${notesError.message}`)
      }

      console.log(`${notes.length} notas inseridas para ordem de porta ${order.id}`)
    }
  } catch (error) {
    console.error("Erro durante o seed de ordens de portas:", error)
    throw error
  }
}

// Função para seed de chat
async function seedChat(supabase: any) {
  try {
    // Obter todos os operadores
    const { data: operators, error: operatorsError } = await supabase.from("operators").select("id, name")

    if (operatorsError) {
      throw new Error(`Erro ao buscar operadores: ${operatorsError.message}`)
    }

    // Criar conversas
    const conversationCount = 10 // Número de conversas a serem criadas
    for (let i = 0; i < conversationCount; i++) {
      // Criar a conversa
      const conversationId = uuidv4()
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Até 30 dias atrás
      const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)) // Até 5 dias após a criação

      const { data: newConversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .insert([
          {
            id: conversationId,
            created_at: createdAt.toISOString(),
            updated_at: updatedAt.toISOString(),
          },
        ])
        .select()

      if (conversationError) {
        throw new Error(`Erro ao inserir conversa ${conversationId}: ${conversationError.message}`)
      }

      console.log(`Conversa ${conversationId} inserida com sucesso`)

      // Selecionar participantes aleatórios (entre 2 e 4 participantes)
      const participantCount = Math.floor(Math.random() * 3) + 2 // Entre 2 e 4 participantes
      const participantIndices = new Set<number>()

      // Garantir que a FiberShare seja um participante
      const fiberShareIndex = operators.findIndex((op: any) => op.id === FIBERSHARE_ID)
      if (fiberShareIndex !== -1) {
        participantIndices.add(fiberShareIndex)
      }

      // Adicionar outros participantes aleatórios
      while (participantIndices.size < participantCount) {
        const randomIndex = Math.floor(Math.random() * operators.length)
        participantIndices.add(randomIndex)
      }

      const participants = Array.from(participantIndices).map((index) => operators[index])

      // Adicionar participantes
      const participantsToInsert = participants.map((participant) => ({
        conversation_id: conversationId,
        operator_id: participant.id,
        created_at: createdAt.toISOString(),
      }))

      const { data: participantsData, error: participantsError } = await supabase
        .from("chat_participants")
        .insert(participantsToInsert)
        .select()

      if (participantsError) {
        throw new Error(`Erro ao inserir participantes para conversa ${conversationId}: ${participantsError.message}`)
      }

      console.log(`${participantsData.length} participantes inseridos para conversa ${conversationId}`)

      // Adicionar mensagens
      const messageCount = Math.floor(Math.random() * 10) + 5 // Entre 5 e 14 mensagens
      const messagesToInsert = []

      const messageContents = [
        "Olá, tudo bem?",
        "Precisamos agendar uma manutenção na CTO.",
        "Quando podemos realizar a instalação?",
        "A ordem de serviço foi concluída com sucesso.",
        "Estamos com um problema na porta 3 da CTO-005.",
        "Poderia verificar a disponibilidade para a próxima semana?",
        "O cliente está aguardando retorno sobre o agendamento.",
        "Já foi realizada a verificação solicitada?",
        "Precisamos de mais informações sobre o problema relatado.",
        "A equipe técnica está a caminho do local.",
        "O contrato foi enviado para assinatura.",
        "Confirmo o recebimento da documentação.",
        "Vamos precisar reagendar a visita técnica.",
        "O pagamento foi confirmado.",
        "Qual o status atual da instalação?",
      ]

      for (let j = 0; j < messageCount; j++) {
        // Selecionar um remetente aleatório entre os participantes
        const sender = participants[Math.floor(Math.random() * participants.length)]

        // Gerar data da mensagem (entre a criação e a atualização da conversa)
        const messageDate = new Date(
          createdAt.getTime() + Math.floor(Math.random() * (updatedAt.getTime() - createdAt.getTime())),
        )

        // Determinar se a mensagem foi lida (90% de chance de estar lida)
        const isRead = Math.random() < 0.9

        messagesToInsert.push({
          conversation_id: conversationId,
          sender_id: sender.id,
          content: messageContents[Math.floor(Math.random() * messageContents.length)],
          read: isRead,
          created_at: messageDate.toISOString(),
        })
      }

      // Ordenar mensagens por data
      messagesToInsert.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      const { data: messages, error: messagesError } = await supabase
        .from("chat_messages")
        .insert(messagesToInsert)
        .select()

      if (messagesError) {
        throw new Error(`Erro ao inserir mensagens para conversa ${conversationId}: ${messagesError.message}`)
      }

      console.log(`${messages.length} mensagens inseridas para conversa ${conversationId}`)
    }
  } catch (error) {
    console.error("Erro durante o seed de chat:", error)
    throw error
  }
}

// Executar o script
seedDatabase()
  .then(() => {
    console.log("Script de seed concluído")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no script de seed:", error)
    process.exit(1)
  })
