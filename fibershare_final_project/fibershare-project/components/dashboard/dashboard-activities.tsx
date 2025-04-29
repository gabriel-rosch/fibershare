export function DashboardActivities({ activities, isLoading }: { activities: any[], isLoading: boolean }) {
  if (isLoading) {
    return <div className="animate-pulse h-48 rounded-lg bg-muted" />
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-4">Atividades Recentes</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 