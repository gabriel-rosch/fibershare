export function DashboardHeader({
  heading,
  text,
}: {
  heading: string
  text?: string
}) {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  )
} 