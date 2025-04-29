export function DashboardStats({ stats, isLoading }: { stats: any[], isLoading: boolean }) {
  if (isLoading) {
    return <div className="animate-pulse h-24 rounded-lg bg-muted" />
  }

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{stat.title}</h3>
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.description}</p>
        </div>
      ))}
    </>
  )
} 