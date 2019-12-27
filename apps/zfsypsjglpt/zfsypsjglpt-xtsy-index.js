import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import ajax from "/services/ajaxService";
export const name = "zfsypsjglpt-xtsy-index";
let echarts = require('echarts/dist/echarts.min');
require("/apps/zfsypsjglpt/zfsypsjglpt-xtsy-index.css");
var storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;

let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-xtsy-index.html"),
    defaults: {
        zfsypsjglpt_language: language_txt.zfsypsjglpt.zfsypsjglpt_xtsy,

        loginUserInfo: {
            userName: '',
            roleNames: '',
            lastlogintime: '',
            lastLonginIp: '',
        },
        todaySituation: {
            videoTime: 15,
            caseMarkNumber: '02',
            caseRelatedNumber: '01',
        },
        monthSituation: {
            videoTime: 105,
            caseMarkNumber: '12',
            caseRelatedNumber: '10',
        },
        yearSituation: {
            videoTime: 502,
            caseMarkNumber: '102',
            caseRelatedNumber: '57',
        },
        onInit() {
            this.loginUserInfo.userName = storage.getItem("userName") || '';
            this.loginUserInfo.roleNames = storage.getItem("roleNames")[0] || '';
            this.loginUserInfo.lastlogintime = storage.getItem("lastlogintime") ? formatDate(storage.getItem("lastlogintime")) : '';
            this.loginUserInfo.lastLonginIp = storage.getItem("lastLonginIp") || '';
        },
        onReady() {
            // var drawer = new DrawMan();
            // drawer.drawRing([
            //     [{
            //         value: 45
            //     }, {
            //         value: 55
            //     }],
            //     [{
            //         value: 25
            //     }, {
            //         value: 75
            //     }],
            //     [{
            //         value: 15
            //     }, {
            //         value: 85
            //     }],
            //     [{
            //         value: 35
            //     }, {
            //         value: 65
            //     }],
            // ]);
            // drawer.drawLine([23, 42, 18, 45, 48, 49, 100]);
        },
        onDispose() {
            //this.loginUserInfo.remove();
        }
    }
});

//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
};

//画图
function DrawMan() {
    var radius = [50, 75];
    let drawconfig = [{
        id: 'bmjd-rate',
        color: '#3399ff',
    }, {
        id: 'bmgl-rate',
        color: '#00cc66',
    }, {
        id: 'bmbz-rate',
        color: '#00cccc',
    }, {
        id: 'bmcc-rate',
        color: '#096ec6',
    }];
    let labelTop = {
        normal: {
            label: {
                show: true,
                position: 'center',
                formatter: '{b}',
                textStyle: {
                    baseline: 'bottom'
                }
            },
            labelLine: {
                show: false
            }
        }
    };
    let labelFromatter = {
        normal: {
            label: {
                formatter: function (params) {
                    return 100 - params.value + '%';
                },
                textStyle: {
                    baseline: 'top'
                }
            }
        },
    };
    let labelBottom = {
        normal: {
            color: '#ccc',
            label: {
                show: true,
                position: 'center',
                color: '#536b82',
                fontSize: 22
            },
            labelLine: {
                show: false
            }
        },
        emphasis: {
            color: 'rgba(0,0,0,0)'
        }
    };
    return {
        drawRing(data) {
            data.forEach((value, index) => {
                value[0].itemStyle = labelBottom;
                value[0].itemStyle.normal.label.color = drawconfig[index].color;
                value[1].itemStyle = labelTop;
                let line = echarts.init(document.getElementById(drawconfig[index].id));
                line.setOption({
                    color: [drawconfig[index].color],
                    series: [{
                        type: 'pie',
                        center: ['50%', '50%'],
                        radius: radius,
                        x: '0%', // for funnel
                        itemStyle: labelFromatter,
                        data: value,
                    }]
                });
                $(window).resize(() => {
                    line.resize();
                });
            });
        },
        drawLine(data) {
            //折线图
            var line = echarts.init(document.getElementById('zfypjzxsc'));
            line.setOption({
                color: ["#3399ff"],
                title: {},
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: false,
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                    axisLabel: {
                        interval: 0
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#536b82',
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#536b82',
                        }
                    }
                },
                series: [{
                    name: '成绩',
                    type: 'line',
                    data: data,
                    markLine: {
                        data: [{
                            type: 'average',
                            name: '平均值'
                        }]
                    },
                }],
                grid: {
                    left: '100',
                    top: '15'
                }
            });
            $(window).resize(() => {
                line.resize();
            });
        }
    };
}