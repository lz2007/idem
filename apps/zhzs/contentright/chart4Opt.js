import {
    axisLabel,
    splitLine
} from './axisLabel'
export const option = {
    tooltip: {
        trigger: 'item'
    },
    grid: {
        x: '90%',
        x2: '90%',
        y: '80%',
        y2: '70%',
        backgroundColor: '#ccc',
        borderColor: '#000'
    },
    legend: {
        textStyle: {
            color: "#FFFFFF"
        },
        data: ['考评数', '通过率', '核查率']
    },
    xAxis: [{
        type: 'category',
        data: ["一分局", "二分局", "三分局", "四分局", "五分局", "六分局"],
        axisLabel,
        axisLine: {
            lineStyle: {
                color: '#FFFFFF'
            }
        }
    }],
    yAxis: [{
            type: 'value',
            name: '100%',
            axisLabel: {
                formatter: '{value}'
            },
            axisLine: {
                lineStyle: {
                    color: '#FFFFFF'
                }
            }
        },
        {
            type: 'value',
            name: '1000条',
            axisLabel: {
                formatter: '{value}'
            },
            axisLine: {
                lineStyle: {
                    color: '#FFFFFF'
                }
            },
            splitLine
        }
    ],
    series: [

        {
            name: '考评数',
            type: 'bar',
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7],
            barWidth: "30%",
            itemStyle: {
                normal: {
                    color: function (params) {
                        // build a color map as your need.
                        var colorList = [
                            '#35b592'
                        ];
                        return colorList[params.dataIndex]
                    }
                }
            }
        },
        {
            name: '通过率',
            type: 'line',
            data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7],
            itemStyle: {
                color: '#ff00fc'
            },
            lineStyle: {
                color: '#ff00fc',
                width: 2,
            }
        },
        {
            name: '核查率',
            type: 'line',
            yAxisIndex: 1,
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2],
            itemStyle: {
                color: '#eba600'
            },
            lineStyle: {
                color: '#eba600',
                width: 2,
            }
        }
    ]
};