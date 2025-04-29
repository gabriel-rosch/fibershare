export function DashboardSummary({ summary, isLoading }: { summary: any, isLoading: boolean }) {
  if (isLoading) {
    return <div className="animate-pulse h-32 rounded-lg bg-muted" />
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-4">Resumo</h3>
      <div className="space-y-2">
        {summary && Object.entries(summary).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-sm text-muted-foreground">{key}</span>
            <span className="text-sm font-medium">{value as string}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 