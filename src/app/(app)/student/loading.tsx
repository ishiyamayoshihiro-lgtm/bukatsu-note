export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse" />
      <div className="card h-24 animate-pulse bg-gray-100" />
      <div className="card h-64 animate-pulse bg-gray-100" />
      <div className="card h-40 animate-pulse bg-gray-100" />
    </div>
  )
}
