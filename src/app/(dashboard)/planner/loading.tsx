export default function PlannerLoadingPage() {
  return (
    <div className="dashboard-page-container pt-8 pb-12 space-y-3">
      <div className="h-10 w-52 animate-pulse rounded-3 bg-paper-2" />
      <div className="h-11 w-full max-w-xl animate-pulse rounded-3 bg-paper-2" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-4 border border-line bg-paper-2" />
      ))}
    </div>
  )
}
