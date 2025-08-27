function ChartSkeleton() {
  return (
    <div className="w-full h-64 bg-white shadow rounded-lg p-4 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" /> {/* Título */}
      <div className="flex items-end justify-between h-full">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="w-6 bg-gray-300 rounded"
            style={{ height: `${20 + Math.random() * 100}px` }}
          />
        ))}
      </div>
    </div>
  )
}

export default ChartSkeleton