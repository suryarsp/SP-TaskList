import { IBarChartSeriesBar } from "../../interfaces/components/header/statusBarChart/BarChart/IBarChartSeriesBar";
import { string } from "prop-types";

export const barChartConstants: 
{
    
    optionsBar:{};
    seriesBar:IBarChartSeriesBar[];
} = {
    
    optionsBar: {
        tooltip: {
            enabled: true,
          },
          chart: {
            stacked: true,
            stackType: "100%",
            toolbar: {
              show: false
            }
          },
          plotOptions: {
            bar: {
              horizontal: true
            }
          },
          dataLabels: { 
            enabled: false,
            dropShadow: {
              enabled: false
            }
          },
          stroke: {
            width: 0
          },
          xaxis: {
            categories: [""],
            labels: {
              show: false
            },
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            }
          },
          fill: {
            opacity: 1,
            type: "gradient",
            gradient: {
              shade: "dark",
              type: "vertical",
              shadeIntensity: 0.35,
              gradientToColors: undefined,
              inverseColors: false,
              opacityFrom: 0.85,
              opacityTo: 0.85,
              stops: [90, 0, 100]
            }
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
            useSeriesColors: false,
            floating:false,
            onItemClick: {
                toggleDataSeries: false,
  
            },
            itemMargin: {
              horizontal: 10,
              vertical: 5
            },
            onItemHover: {
                highlightDataSeries: true
            },
        },
        grid: {
          show: false,
        }
    },
    seriesBar: [
        {
          name: "status 1",
          data: [50]
        },
        {
          name: "status 2",
          data: [30]
        },
        {
          name: "status 2",
          data: [40]
        },
        {
          name: "status 2",
          data: [50]
        }
    ]
};