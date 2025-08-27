interface Props {
    quantity?: number
}

export const SkeletonCard = ({ quantity }: Props) => (
    <>
        {
            Array(quantity ?? 1).fill(null).map((_, i) => (

                <div key={i} className="animate-pulse bg-gray-100 rounded-lg shadow-md p-6">
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
            ))
        }
    </>
);