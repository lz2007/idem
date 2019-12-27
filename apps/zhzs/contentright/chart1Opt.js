import {
    axisLabel,splitLine
} from './axisLabel'
export const option = {
    tooltip: {
        trigger: 'item'
    },
    grid: {
        x: '96%',
        x2: '90%',
        borderWidth: 0,
        y: '80%',
        y2: '70%'
    },
    xAxis: [{
        type: "category",
        nameTextStyle: {
            color: "#FFFFFF"
        },
        data: ["一分局", "二分局", "三分局", "四分局", "五分局", "六分局"],
        axisLabel,
        axisTick: {
            alignWithLabel: true
        },
        axisLine: {
            lineStyle: {
                color: '#FFFFFF'
            }
        }
    }],
    yAxis: [{
        type: "value",
        name: '100分',
        nameTextStyle: {
            color: "#FFFFFF"
        },
        axisLine: {
            lineStyle: {
                color: '#FFFFFF'
            }
        },
        splitLine
    }],
    series: [{
        name: '综合得分',
        type: 'bar',
        barWidth: "20px",
        itemStyle: {
            normal: {
                color: function (params) {
                    // build a color map as your need.
                    var colorList = [
                        '#0078e7', '#2ad9ff', '#00ffa2', '#98ee32', '#ffaf32',
                        '#ee4646', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                        '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                    ];
                    return colorList[params.dataIndex]
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'
                }
            }
        },
        data: [12, 21, 10, 4, 12, 5],

    }]
};