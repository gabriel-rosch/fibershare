// Tipos para ordens de serviço
export type PortOrderStatus =
  | "pending_approval"
  | "rejected"
  | "contract_generated"
  | "contract_signed"
  | "installation_scheduled"
  | "installation_in_progress"
  | "completed"
  | "cancelled"

// Definindo o tipo para o status da ordem de serviço
export type ServiceOrderStatus = "pending" | "in_progress" | "completed" | "rejected" | "cancelled"

// Função para obter o nome do status da ordem de porta
export function getPortOrderStatusName(status: PortOrderStatus): string {
  const statusNames: Record<PortOrderStatus, string> = {
    pending_approval: "Aguardando Aprovação",
    rejected: "Rejeitada",
    contract_generated: "Contrato Gerado",
    contract_signed: "Contrato Assinado",
    installation_scheduled: "Instalação Agendada",
    installation_in_progress: "Instalação em Andamento",
    completed: "Concluída",
    cancelled: "Cancelada",
  }
  return statusNames[status] || status
}

// Função para obter a cor do status da ordem de porta
export function getPortOrderStatusColor(status: PortOrderStatus): string {
  const statusColors: Record<PortOrderStatus, string> = {
    pending_approval: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    contract_generated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    contract_signed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    installation_scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    installation_in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  }
  return statusColors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
} 