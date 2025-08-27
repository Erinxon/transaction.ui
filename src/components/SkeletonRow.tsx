interface Props {
    quantity?: number;
}

export const SkeletonRow = ({ quantity }: Props) => (
    <>
        {Array(quantity ?? 0).fill(null).map((_,i) => (
            <tr className="animate-pulse" key={i}>
                {Array(quantity ?? 0).fill(null).map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </td>
                ))}
            </tr>
        ))}
    </>

);
