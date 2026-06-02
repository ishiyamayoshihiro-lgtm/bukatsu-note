export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
      <div className="card h-32 animate-pulse bg-gray-100" />
      <div className="card h-48 animate-pulse bg-gray-100" />
    </div>
  )
}
