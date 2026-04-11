import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={`bg-neutral-900 border-neutral-700 ${className ?? ""}`}>
      <CardContent className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 bg-neutral-800 rounded" />
          <div className="h-7 w-16 bg-neutral-800 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonTable() {
  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <div className="animate-pulse h-4 w-32 bg-neutral-800 rounded" />
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral-800 rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SkeletonTable />
      </div>
    </div>
  )
}
