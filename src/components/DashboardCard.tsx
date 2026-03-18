import type { ReactNode } from "react";

interface Props {
    title: string;
    value: ReactNode;
    color: "green" | "red" | "neutral";
    children: ReactNode;
}

export const DashboardCard = ({ title, value, color, children }: Props) => {
    const toneMap = {
        green: {
            title: "text-emerald-700",
            value: "text-emerald-900",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-700",
        },
        red: {
            title: "text-rose-700",
            value: "text-rose-900",
            iconBg: "bg-rose-100",
            iconColor: "text-rose-700",
        },
        neutral: {
            title: "text-slate-700",
            value: "text-slate-900",
            iconBg: "bg-slate-100",
            iconColor: "text-slate-700",
        },
    } as const;

    const tone = toneMap[color];

    return (
        <div className="soft-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${tone.title}`}>{title}</p>
                    <h3 className={`mt-1 text-2xl font-bold tracking-tight ${tone.value}`}>{value}</h3>
                </div>
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tone.iconBg} ${tone.iconColor}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}