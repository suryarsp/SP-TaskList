import { IDoughnutChartData } from "../../interfaces/index";

export const ChartDataConstant:
    {
        inProgressValue:string;
        chartData: IDoughnutChartData,

    } = {
        inProgressValue:"In Progress",
        chartData: {
            datasets: [{
                data: [10, 20, 30, 40, 10],
                backgroundColor: [
                    '#CCC',
                    '#36A2EB',
                    '#FFCE56',
                    '#ffb3ec',
                    '#e6b3cc',
                    '#ffcce6',
                    '#ff9999',
                    '#ffcc99',
                    '#e6ff99',
                    '#99ffe6',
                    '#99b3ff',
                    '#cc99ff',
                    '#ffe6cc',
                    '#ccf5ff',
                    '#ecc6d9'
                ],
                hoverBackgroundColor: [
                    '#CCC',
                    '#36A2EB',
                    '#FFCE56',
                    '#ffb3ec',
                    '#e6b3cc',
                    '#ffcce6',
                    '#ff9999',
                    '#ffcc99',
                    '#e6ff99',
                    '#99ffe6',
                    '#99b3ff',
                    '#cc99ff',
                    '#ffe6cc',
                    '#ccf5ff',
                    '#ecc6d9'
                ]
            }],
            labels: [
                'Lender Coursel',
                'Borrower Coursel',
                'Lender',
                'Third Party',
                'Responsible Party'
            ],
        }
    };