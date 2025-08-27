export default function FormSkeleton() {
  return (
    <div className="p-4 animate-pulse space-y-6">
      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>

      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>

      <div>
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
        <div className="h-10 bg-gray-300 rounded" />
      </div>

      <div className="pt-2">
        <div className="h-10 w-28 bg-gray-300 rounded" />
      </div>
    </div>
  );
}