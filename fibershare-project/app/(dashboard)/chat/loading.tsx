import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ChatLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-3">
        {/* Lista de contatos skeleton */}
        <Card className="flex flex-col overflow-hidden">
          <div className="border-b p-3">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 p-3">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Área de chat skeleton */}
        <Card className="flex flex-col overflow-hidden md:col-span-2">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
            </div>
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  {i % 2 !== 0 && <Skeleton className="mr-2 h-8 w-8 rounded-full" />}
                  <Skeleton
                    className={`h-16 w-2/3 rounded-lg ${i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-3">
            <div className="flex space-x-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
