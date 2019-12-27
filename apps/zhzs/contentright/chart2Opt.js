import {
    axisLabel
} from './axisLabel'

export const option = {
    graphic: {
        type: 'image',
        left: 130,
        top: 'center',
        style: {
            image: '/static/image/zhzs/slqik.png?__sprite',
            x: 100,
            y: 100,
            width: 130,
            height: 130,
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
        width: '50%',
        height: '100%',
        itemGap: 4,
        itemWidth:20,
        x: "46%",
        y: "center",
        textStyle: {
            color: "#FFFFFF"
        },
        orient: "vertical",
        data: ["980 小时 | 一分局", "980 小时 | 二分局", "980 小时 | 三分局", "980 小时 | 四分局", "980 小时 | 五分局", "980 小时 | 六分局"]
    },
    // calculable: true,
    series: [{
        name: "摄录情况",
        type: "pie",
        radius: ["40%", "80%"],
        center: ["25%", "50%"],
        roseType: "radius",
        width: '40%', // for funnel
        max: 40, // for funnel
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
                    show: false
                },
                labelLine: {
                    show: false
                }
            },
            emphasis: {
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                }
            }
        },
        label: {
            normal: {
                show: false
            },
            emphasis: {
                show: false
            }
        },
        lableLine: {
            normal: {
                show: false
            },
            emphasis: {
                show: false
            }
        },
        data: [{
                value: 980,
                name: "980 小时 | 一分局"
            },
            {
                value: 1205,
                name: "980 小时 | 二分局"
            },
            {
                value: 1500,
                name: "980 小时 | 三分局"
            },
            {
                value: 2500,
                name: "980 小时 | 四分局"
            },
            {
                value: 2800,
                name: "980 小时 | 五分局"
            },
            {
                value: 3500,
                name: "980 小时 | 六分局"
            }
        ]
    }]
};