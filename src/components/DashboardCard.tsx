import type { ReactNode } from "react";

interface Props {
    title: string;
    value: ReactNode;
    color: string;
    children: ReactNode;
}

export const DashboardCard = ({ title, value, color, children }: Props) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm text-${color}-500`}>{title}</p>
                    <h3 className={`text-2xl font-bold text-${color}-600`}>{value}</h3>
                </div>
                <div className={`bg-${color}-100 p-3 rounded-full`}>
                    {children}
                </div>
            </div>
        </div>
    )
}