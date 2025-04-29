export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {children}
    </div>
  )
} 