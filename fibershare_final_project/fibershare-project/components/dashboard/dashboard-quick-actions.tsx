export function DashboardQuickActions({ actions, isLoading }: { actions: any[], isLoading: boolean }) {
  if (isLoading) {
    return <div className="animate-pulse h-32 rounded-lg bg-muted" />
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-4">Ações Rápidas</h3>
      <div className="grid gap-2">
        {actions.map((action, index) => (
          <button key={index} className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent">
            {action.title}
          </button>
        ))}
      </div>
    </div>
  )
} 