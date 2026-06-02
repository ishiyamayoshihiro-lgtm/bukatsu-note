export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
      <div className="card h-16 animate-pulse bg-gray-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card h-20 animate-pulse bg-gray-100" />
      ))}
    </div>
  )
}
