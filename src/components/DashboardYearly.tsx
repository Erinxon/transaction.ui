import { Column } from "@ant-design/plots";
import type { ByYearResponse } from "../core/dashboard/types/dashboard.types";


interface Props {
    data: ByYearResponse[]
}

export const DashboardYearly = ({ data }: Props) => {
    const config = {
        style: {
            fill: (datum: ByYearResponse) => { 
                const { transactionType } = datum; 
                if (transactionType === 1) 
                    return '#00a63e'; 
                if (transactionType === 2) 
                    return 'red';
                 return ''; 
            }
        },
        data: {
            value: data
        },
        xField: 'monthName',
        yField: 'amount',
        colorField: 'transactionTypeName',
        group: {
            padding: 0,
        },
    };
    return <Column {...config} />;
};
