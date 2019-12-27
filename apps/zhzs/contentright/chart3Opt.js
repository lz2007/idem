import {
    axisLabel,
    splitLine
} from './axisLabel'
export const option = {
    tooltip: {
        trigger: 'item'
    },
    legend: {
        textStyle: {
            color: "#FFFFFF"
        },
        data: ['交通违法', '事故处理', '警情', '案件']
    },
    grid: {
        x: '96%',
        x2: '90%',
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
        name: '100%',
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
            name: '交通违法',
            type: 'bar',
            data: [320, 332, 301, 334, 390, 330],
            itemStyle: {
                normal: {
                    color: function (params) {
                        // build a color map as your need.
                        var colorList = [
                            '#06487a'
                        ];
                        return colorList[params.dataIndex]
                    }
                }
            }
        },
        {
            name: '事故处理',
            type: 'bar',
            data: [320, 332, 301, 334, 390, 330],
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
            name: '警情',
            type: 'bar',
            data: [120, 132, 101, 134, 290, 230],
            itemStyle: {
                normal: {
                    color: function (params) {
                        // build a color map as your need.
                        var colorList = [
                            '#8ab3d2'
                        ];
                        return colorList[params.dataIndex]
                    }
                }
            }
        },
        {
            name: '案件',
            type: 'bar',
            data: [62, 82, 91, 84, 109, 110, 12],
            itemStyle: {
                normal: {
                    color: function (params) {
                        // build a color map as your need.
                        var colorList = [
                            '#f9fcff'
                        ];
                        return colorList[params.dataIndex]
                    }
                }
            }
        },
    ]
};