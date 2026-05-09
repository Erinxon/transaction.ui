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
            title: "text-emerald-700 dark:text-emerald-400",
            value: "text-emerald-900 dark:text-emerald-300",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
            iconColor: "text-emerald-700 dark:text-emerald-400",
        },
        red: {
            title: "text-rose-700 dark:text-rose-400",
            value: "text-rose-900 dark:text-rose-300",
            iconBg: "bg-rose-100 dark:bg-rose-900/40",
            iconColor: "text-rose-700 dark:text-rose-400",
        },
        neutral: {
            title: "text-slate-700 dark:text-slate-400",
            value: "text-slate-900 dark:text-slate-300",
            iconBg: "bg-slate-100 dark:bg-slate-700/60",
            iconColor: "text-slate-700 dark:text-slate-400",
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