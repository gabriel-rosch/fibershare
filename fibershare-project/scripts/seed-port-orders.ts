import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Função principal para executar o seed
async function seedPortOrders() {
  console.log("Iniciando seed de ordens de porta...")

  // Configurar cliente Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variáveis de ambiente do Supabase não configuradas")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Verificar se já existem ordens de porta
    const { count, error: countError } = await supabase.from("port_orders").select("*", { count: "exact", head: true })

    if (countError) {
      throw new Error(`Erro ao verificar ordens de porta: ${countError.message}`)
    }

    if (count && count > 0) {
      console.log(`${count} ordens de porta já existem. Pulando seed.`)
      return
    }

    // Obter operadores para usar como solicitantes e proprietários
    const { data: operators, error: operatorsError } = await supabase.from("operators").select("id, name")

    if (operatorsError || !operators || operators.length === 0) {
      throw new Error("Não foi possível obter operadores para o seed")
    }

    // Obter CTOs para associar às ordens
    const { data: ctos, error: ctosError } = await supabase.from("ctos").select("id, name, owner_id")

    if (ctosError || !ctos || ctos.length === 0) {
      throw new Error("Não foi possível obter CTOs para o seed")
    }

    // Criar ordens de porta
    const portOrdersToInsert = []
    const portOrderStatuses = [
      "pending_approval",
      "rejected",
      "contract_generated",
      "contract_signed",
      "installation_scheduled",
      "installation_in_progress",
      "completed",
      "cancelled",
    ]

    // Criar 20 ordens de porta
    for (let i = 0; i < 20; i++) {
      // Selecionar uma CTO aleatória
      const cto = ctos[Math.floor(Math.random() * ctos.length)]

      // Selecionar um operador aleatório como solicitante (diferente do proprietário da CTO)
      let requester
      do {
        requester = operators[Math.floor(Math.random() * operators.length)]
      } while (requester.id === cto.owner_id)

      // Determinar o status da ordem
      const status = portOrderStatuses[Math.floor(Math.random() * portOrderStatuses.length)]

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

    // Inserir ordens de porta
    const { data: portOrders, error: portOrdersError } = await supabase
      .from("port_orders")
      .insert(portOrdersToInsert)
      .select()

    if (portOrdersError) {
      throw new Error(`Erro ao inserir ordens de porta: ${portOrdersError.message}`)
    }

    console.log(`${portOrders.length} ordens de porta inseridas com sucesso`)

    // Adicionar notas às ordens
    const notesToInsert = []

    for (const order of portOrders) {
      // Adicionar nota do sistema para a criação da ordem
      notesToInsert.push({
        order_id: order.id,
        author_id: "system",
        content: "Ordem de aluguel de porta criada e aguardando aprovação do proprietário.",
        is_system_note: true,
        created_at: order.created_at,
      })

      // Adicionar 1-3 notas adicionais
      const noteCount = Math.floor(Math.random() * 3) + 1
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
    }

    // Inserir notas
    if (notesToInsert.length > 0) {
      const { data: notes, error: notesError } = await supabase.from("port_order_notes").insert(notesToInsert).select()

      if (notesError) {
        throw new Error(`Erro ao inserir notas: ${notesError.message}`)
      }

      console.log(`${notes.length} notas inseridas com sucesso`)
    }

    console.log("Seed de ordens de porta concluído com sucesso!")
  } catch (error) {
    console.error("Erro durante o seed de ordens de porta:", error)
    throw error
  }
}

// Executar o script
seedPortOrders()
  .then(() => {
    console.log("Script de seed concluído")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Erro no script de seed:", error)
    process.exit(1)
  })
