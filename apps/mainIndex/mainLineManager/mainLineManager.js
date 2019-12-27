import avalon from 'avalon2'
import './mainLineManager.less'
import ajax from '/services/ajaxService.js';
import {
    notification
} from "ane";
import 'ane';
import {
    titleName,
    gxxOcxVersion,
    defaultBrowser,
    languageSelect
} from '/services/configService';
let storage = require('/services/storageService.js').ret;
require('/vendor/jquery/jquery.dragsort-0.5.2.min.js');
let moment = require('moment');
let echarts = require("echarts/dist/echarts.min");
let roleNames = storage.getItem('roleNames');
let uid = storage.getItem('uid');
let orgId = storage.getItem('orgId');
let orgPath = storage.getItem('orgPath');
let language_txt = require('../vendor/language').language;
let globalOcxPlayer = {};
let weekRange = language_txt.index.weekRange;
let monthRange = language_txt.index.monthRange;
let yearRange = language_txt.index.yearRange;
let yesterdayRange = language_txt.index.yesterdayRange;
export const name = 'ms-main-line-m'

avalon.component(name, {
    template: __inline("./mainLineManager.html"),
    defaults: {
        onReady() {
            mainIndex.onReady();
            $(".common-layout").css({
                "min-width": "1380px",
                "min-height": "750px"
            });
            $(".ane-layout-fixed-footer").css({
                "display": 'none'
            });

            // OCX 站点信任弹窗
            // if (mainIndex.is_IE)
            //     globalOcxPlayer = document.getElementById('gxxPlayOcx');
            // else
            //     globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic');
            // let data = {};
            // data.action = 'InitDeviceSdk'; //初始化
            // try {
            //     globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            // } catch (e) {
            //     return;
            // }

            // data = {};
            // data.action = 'IsTrustSite';
            // data['arguments'] = {};
            // data['arguments']['strIP'] = document.domain;

            // let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            // let ret_json = eval("(" + ret + ")");
            // if (ret_json.code == 1) {
            //     // confirmVm.show = true;
            //     confirmVm.editOk(); // IP自动加入信任站点
            // }

        }
    }
})

document.title = titleName;

let chromeDownloadUrl = '/static/GSBbrowser_chrome-3.3.1.7301.exe', // 谷歌浏览器下载地址
    firefoxDownloadUrl = '/static/GSBrowser_firefox-3.3.1.7301.exe', // 火狐浏览器下载地址
    defaultDownloadUrl = '',
    eggDownloadUrl = '';

switch (defaultBrowser) {
    case 0:
        defaultDownloadUrl = firefoxDownloadUrl;
        eggDownloadUrl = chromeDownloadUrl;
        break;
    case 1:
        defaultDownloadUrl = chromeDownloadUrl;
        eggDownloadUrl = firefoxDownloadUrl;
        break;
}
/****
 * 3.6 版本开始
 * 
 */
//初始化配置图表信息
let businessRelX = ['简易程序', '非现场处罚', '强制措施', '事故处理'];
let itemStyle = {
    normal: {
        label: {
            show: true,
            position: 'inside',
            formatter: function (params) {
                let arrValue = params['data'];
                let obj = relevantMap.get(arrValue[0]);
                return (obj.name + '\n\n' + obj.percent + '%');
            },
            fontSize: 16,
            fontWeight: 'bold',
            color: '#131a3f',
        },
        color: function (params) {
            let arrValue = params['data'];
            let obj = relevantMap.get(arrValue[0]);
            return obj.color;
        },
        opacity: 0.8,
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowColor: 'rgba(128, 128, 128, 0.7)'
    }
}
let relevantMap = new Map();

let mainIndex = avalon.define({
    $id: 'main-index',
    cloudClass: languageSelect == 'en' ? '' : 'img_downloadCenter_zhcn',
    is_IE: isIE_fuc(),
    titleName: titleName,
    roleNames: roleNames,
    eggDownloadUrl: eggDownloadUrl, // 彩蛋下载地址
    roleShow: false,
    /* 
     * 3.6版本的首页代码
     * 从这里开始
     */
    // 文字绑定
    loginTime: language_txt.index.loginTime,
    lastTime: language_txt.index.lastTime,
    currentIP: language_txt.index.currentIP,
    lastIP: language_txt.index.lastIP,
    loginFailed: language_txt.index.loginFailed,
    accountDay: language_txt.index.accountDay,
    passwordDay: language_txt.index.passwordDay,
    days: language_txt.index.days,
    times: language_txt.index.times,
    yesterday: language_txt.index.yesterday,
    thisWeek: language_txt.index.thisWeek,
    thisMonth: language_txt.index.thisMonth,
    thisYear: language_txt.index.thisYear,
    spscText: language_txt.index.spscText,
    ypscText: language_txt.index.ypscText,
    tpscText: language_txt.index.tpscText,
    usageTimeTitle: language_txt.index.usageTimeTitle,
    videoLabelingRateTitle: language_txt.index.videoLabelingRateTitle,
    annotationRate: language_txt.index.annotationRate,
    annotation: language_txt.index.annotation,
    unrelated: language_txt.index.unrelated,
    rankingTitle: language_txt.index.rankingTitle,
    downloadCenter: language_txt.index.downloadCenter,
    labeling: language_txt.index.labeling,
    unlabelled: language_txt.index.unlabelled,
    //页面显示数据
    zr_spzsc: 0, //视频总时长 
    zr_tpzs: 0, //图片总数 
    zr_ypzsc: 0, //音频总时长
    bz_spzsc: 0,
    bz_tpzs: 0,
    bz_ypzsc: 0,
    by_spzsc: 0,
    by_tpzs: 0,
    by_ypzsc: 0,
    nowlogintime: 0,
    lastlogintime: 0,
    nowLonginIp: '',
    lastLonginIp: '',
    loginFailNum: 0,
    accountExpireNum: 0,
    passwordExpireNum: 0,
    sumAvideoKeyCount: 0, //被重点标记的视频数
    sumAvideoLabelCount: 0, // 被标注的视频数
    sumAvideoNoneCount: 0, //无标记视频文件数
    unsumAvideoKeyCount: 0, //未被重点标记的视频数
    keyRate: 0, //重点文件标记率
    labelRate: 0, //文件标记率
    topTen: [], //前十对象
    topThree: [], //前三得分
    afterThree: ['', '', ''], //后三名得分
    dates: [language_txt.index.weekRange, language_txt.index.monthRange, language_txt.index.yearRange],
    dateClass: 'active',
    weekClass: '',
    monthClass: '',
    orderCenterClass: ['pop', 'dialog', 'hide'],
    //使用率折线图配置
    optionUsage: {
        // 自定义formatter函数
        tooltip: {
            formatter: yesFormatter
        },
        xAxis: {
            name: '',
            nameLocation: 'end',
            nameGap: 0,
            type: 'category',
            boundaryGap: true, //如果要刻度线与数据点对齐的话，那就为false，但是数据点会从0开始
            data: [],
            axisLine: {
                lineStyle: {
                    color: '#414f5c', //x轴的颜色
                }
            },
            axisTick: { //坐标轴刻度线
                show: false
            },
            axisLabel: { //坐标轴刻度标签
                show: true,
                color: '#414f5c',
                fontSize: 16,
                interval: 0, //横轴信息全部显示
                rotate: 0, //-30度角倾斜显示
            },
        },
        yAxis: {
            name: language_txt.index.hour,
            nameLocation: 'end',
            nameGap: 15,
            type: 'value',
            boundaryGap: ['0%', '0%'],
            axisLine: {
                lineStyle: {
                    color: '#414f5c', //y轴的颜色
                },
                symbol: ['none', 'arrow'],
                symbolSize: [50, 50], //箭头的样式：宽度，高度
                symbolOffset: [0, 10], //箭头偏移的位置：起始箭头、末端箭头
            },
            axisTick: { //分割线
                show: false
            },
            axisLabel: { //坐标轴刻度标签
                show: true,
                color: '#414f5c',
                fontSize: 16
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: ['#414f5c'],
                    type: 'solid'
                }
            }
        },
        grid: { //  图表距边框的距离,可选值：'百分比'¦ {number}（单位px）
            x: 83,
            y: 75,
            x2: 40,
            y2: 62,

        },
        series: [{
            name: language_txt.index.usageTimeTitle,
            data: [],
            type: 'line',
            symbol: 'circle', //折线点设置为实心点
            symbolSize: 6, //折线点的大小
            areaStyle: {
                normal: {
                    color: '#7dcefa',
                    opacity: 0.8
                }
            }, //折线下方填充
            itemStyle: { //折线转折点样式
                normal: {
                    color: '#ffffff',
                    borderColor: '#7dcefa',
                    borderWidth: 1,
                    lineStyle: {
                        color: '#7dcefa'
                    },
                    label: {
                        show: false,
                        color: '#414f5c',
                        fontSize: 18
                    },
                }
            },
        }],
    },
    //视频标记率 环形图配置
    optionVideoRate: {
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} "
        },
        color: ['#FFB400', '#15CBFF'],
        calculable: false,
        series: [{
            name: language_txt.index.annotationRate,
            type: 'pie',
            radius: [80, 100],
            // center: [0, 0],
            // roseType: 'radius',
            // width: '40%', // for funnel
            // max: 40, // for funnel
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                },
            },
            data: [
                {
                    value: 0,
                    name: language_txt.index.unrelated
                },
                {
                    value: 0,
                    name: language_txt.index.annotation
                }
            ]
        }]
    },
    //标记率 环形图配置
    optionAnnotationRate: {
        tooltip: {
            show: true,
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} "
        },
        color: ['#FFB400', '#3acc89'],
        calculable: false,
        series: [{
            name: language_txt.index.videoLabelingRateTitle,
            type: 'pie',
            radius: [80, 100],
            // center: [0, 0],
            // roseType: 'radius',
            // width: '40%', // for funnel
            // max: 40, // for funnel
            itemStyle: {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                },
            },
            data: [
                {
                    value: 0,
                    name: language_txt.index.unlabelled
                },
                {
                    value: 0,
                    name: language_txt.index.labeling,
                }
            ]
        }]
    },
    optionRanking: { //排名图标配置

        grid: {
            x: 50,
            y: 60,
            x2: 75,
            y2: 30
        },
        xAxis: {
            show: false,
            type: 'value',
            max: 80
        },
        yAxis: {
            show: false,
            inverse: true,
            type: 'category',
            data: ['no1', 'no1', 'no1', 'no1', 'no1', 'no1', 'no1', 'no1', 'no1', 'no1']
        },
        barWidth: 18,
        series: [{
                name: '前三时长',
                type: 'bar',
                stack: '总量',
                // barCategoryGap: '30%',
                // barGap: '40',
                itemStyle: {
                    normal: {
                        color: '#6b98f8',
                        barBorderRadius: 30
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        textStyle: {
                            color: '#000'
                        },
                        formatter: '{c}' + 'hours',
                    }
                },
                data: []
            },
            {
                name: '后三时长',
                type: 'bar',
                stack: '总量',
                itemStyle: {
                    normal: {
                        barBorderRadius: 20,
                        color: '#7dcefa'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        textStyle: {
                            color: '#000'
                        },
                        formatter: '{c}' + 'hours',
                    }
                },
                data: []
            }
        ]
    },
    onReady() {
        //用户登录信息
        let nowlogintime = storage.getItem('nowlogintime');
        this.nowlogintime = new Date(nowlogintime).Format("yyyy-MM-dd hh:mm:ss");
        let lastlogintime = storage.getItem('lastlogintime');
        if (lastlogintime == null) {
            this.lastlogintime = '-';
        } else {
            this.lastlogintime = new Date(lastlogintime).Format("yyyy-MM-dd hh:mm:ss");
        }
        this.nowLonginIp = storage.getItem('nowLonginIp');
        this.lastLonginIp = storage.getItem('lastLonginIp') || '-';
        this.loginFailNum = storage.getItem('loginFailNum');
        this.accountExpireNum = storage.getItem('accountExpireNum');
        this.passwordExpireNum = storage.getItem('passwordExpireNum');
        initPage();
    },
    ulClick(event) {
        const self = this;
        let target = $(event.target);
        self.clearLiActive();
        let time = target.context.innerHTML;
        switch (time) {
            case weekRange:
                self.dateClass = 'active';
                break;
            case monthRange:
                self.weekClass = 'active';
                break;
            case yearRange:
                self.monthClass = 'active';
                break;
            default:
                break;
        }
        let object = getUpdatedPostObjAndID(time);
        updateAll(object['postObj'], object['id']);
    },
    clearLiActive() {
        this.dateClass = '';
        this.weekClass = '';
        this.monthClass = '';
    },
    updateUsageRate(postObj, id) {
        const self = this;
        postObj.returnType = id;
        ajax({
            url: '/gmvcs/stat/comprehensive/index/usage/rate',
            //url: url,
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: language_txt.index.notification
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                return;
            }
            let usageRate = data.usageRate,
                usageRateSeries = [],
                usageRateX = [];
            for (let item in usageRate) {
                usageRateSeries.push(secChangeToHour(usageRate[item]));
            }
            switch (id) {
                case 0:
                    usageRateX = ['0', '4', '8', '12', '16', '20'];
                    self.optionUsage.xAxis.name = "";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.xAxis.axisLabel.rotate = 0;
                    self.optionUsage.tooltip.formatter = yesFormatter;
                    break;
                case 1:
                    usageRateX = getUsageRateXWeek(usageRateSeries);
                    self.optionUsage.xAxis.name = "";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.xAxis.axisLabel.rotate = -30;
                    self.optionUsage.tooltip.formatter = weekFormatter;
                    break;
                case 2:
                    usageRateX = getUsageRateXMon(usageRateSeries);
                    self.optionUsage.xAxis.name = "";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.xAxis.axisLabel.rotate = -30;
                    self.optionUsage.tooltip.formatter = monthFormatter;
                    break;
                case 3:
                    usageRateX = getUsageRateXYear(usageRateSeries);
                    self.optionUsage.xAxis.name = "";
                    self.optionUsage.xAxis.axisLabel.show = true;
                    self.optionUsage.xAxis.axisLabel.rotate = -30;
                    self.optionUsage.tooltip.formatter = yearFormatter;
                    break;
                default:
                    break;
            }
            self.drawUsageRate(usageRateX, usageRateSeries);
        });
    },
    updateVideoRate(postObj) {
        const self = this;
        delete postObj.returnType;
        //本周数据请求
        ajax({
            url: '/gmvcs/stat/comprehensive/index/label/rate',
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: language_txt.index.notification
                });
                return;
            }
            let data = result.data;
            if (data == null) {
                return;
            }
            self.keyRate = num2Percent(data.keyRate);
            self.sumAvideoKeyCount = data.sumAvideoKeyCount;
            self.unsumAvideoKeyCount = data.sumAvideoCount - data.sumAvideoKeyCount;
            self.drawVideoRateChart();
            self.sumAvideoLabelCount = data.sumAvideoLabelCount;
            // self.sumAvideoNoneCount = data.sumAvideoNoneCount;
            self.sumAvideoNoneCount = data.sumAvideoCount - data.sumAvideoLabelCount;  //未标注数=总数-已标注数
            self.labelRate = num2Percent(data.labelRate);
            self.drawAnnotationChart();
        });
    },
    
    updateRanking(postObj, id) { //更新排名情况
        const self = this;
        delete postObj.returnType;
        //本周数据请求
        ajax({
            url: '/gmvcs/stat/comprehensive/index/person/sort',
            method: 'post',
            data: postObj
        }).then(result => {
            if (0 !== result.code) {
                notification.warn({
                    message: result.msg,
                    title: language_txt.index.notification
                });
                return;
            }
            let data = result.data;
            mainIndex.topTen = [];
            mainIndex.topThree = [];
            mainIndex.afterThree = [];
            if (data === undefined || data.length == 0) {
                self.drawRankingChart(id);
                return;
            }
            // mainIndex.topTen = [];
            // mainIndex.topThree = [];
            // mainIndex.afterThree = [];
            //  let data = [{
            //     "userName": "Jackson",
            //     "duration": "5000",
            // },{
            //      "userName": "Jackson",
            //      "duration": "700",
            //  },{
            //      "userName": "Jackson",
            //      "duration": "300",
            //  },{
            //      "userName": "Jackson",
            //      "duration": "2000",
            //  },{
            //      "userName": "Jackson",
            //      "duration": "1000",
            //  }];
            for (var i = 0; i < data.length; i++) {
                let obj = {
                    userName: data[i].userName,
                    duration: data[i].duration,
                    index: i + 1
                }
                mainIndex.topTen.push(obj);
                if (i < 3) {
                    mainIndex.topThree[i] = (data[i].duration / 3600).toFixed(1);
                } else {
                    mainIndex.afterThree[i] = (data[i].duration / 3600).toFixed(1);
                }
            }
            self.drawRankingChart(id);
        });
    },
    drawUsageRate(usageRateX, usageRateSeries) { //使用时长
        let chartUsage = echarts.init(document.getElementById('usage_rate'));
        this.optionUsage.xAxis.data = [];
        this.optionUsage.series[0].data = [];
        this.optionUsage.xAxis.data = usageRateX;
        this.optionUsage.series[0].data = usageRateSeries;
        chartUsage.clear();
        chartUsage.setOption(this.optionUsage, true);
    },
    // 画视频标记率函数
    drawVideoRateChart() {
        let myChart = echarts.init(document.getElementById('videoRate'));
        this.optionVideoRate.series[0].data[0].value = this.unsumAvideoKeyCount;
        this.optionVideoRate.series[0].data[1].value = this.sumAvideoKeyCount;
        myChart.clear();
        myChart.setOption(this.optionVideoRate, true);
    },
    //标注率画函数
    drawAnnotationChart() {
        let myChart = echarts.init(document.getElementById('annotationRate'));
        this.optionAnnotationRate.series[0].data[0].value = this.sumAvideoNoneCount;
        this.optionAnnotationRate.series[0].data[1].value = this.sumAvideoLabelCount;
        myChart.clear();
        myChart.setOption(this.optionAnnotationRate, true);
    },
    //画排名情况图
    drawRankingChart(id) {
        let myChart = echarts.init(document.getElementById('ranking'));
        this.optionRanking.series[0].data = this.topThree;
        this.optionRanking.series[1].data = this.afterThree;
        //根据年月周判断 柱状图最大长度
        this.optionRanking.xAxis.max = 'dataMax';
        myChart.clear();
        myChart.setOption(this.optionRanking, true);
    },
    // openOrderCenter() {
    //     this.essentialPlug = "22222";
    //     downLoadVm.show = true;
    // },
    /** end */

    //ie下新窗口自动全屏
    handleNewWindow(url) {
        var tmp = window.open(url, "_blank");
        tmp.moveTo(0, 0);
        tmp.resizeTo(screen.width, screen.height);
        tmp.focus();
        tmp.location = url;
    },
    bindModify() {
        // edit_pwd_vm.show = true;
        avalon.components['ms-header-operation'].defaults.changePwd.show = true;
    },
    bindLogout() {
        // logoutVM.show_logout = true;
        avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
    },
    // "?" 点击弹出弹窗
    // questionClick() {
    //     questionVm.show = true;
    // }
}); //avalon定义结束

if (mainIndex.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (mainIndex.roleNames.length > 1) {
    mainIndex.roleShow = true;
}

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

// "?" 弹窗
// let questionVm = avalon.define({
//     $id: 'question-ctl',
//     show: false,
//     // 取消
//     editCancel() {
//         this.show = false;
//     },
//     // 确定
//     editOk() {
//         this.show = false;
//     }
// });

// "?" innerVM
// let questionInnerVM = avalon.define({
//     $id: 'question-ctl-inner',
//     title: language_txt.index.helpWindowTitle,
//     helpTip1: language_txt.index.helpTip1,
//     helpTip2: language_txt.index.helpTip2,
//     helpTip3: language_txt.index.helpTip3,
//     helpTip4: language_txt.index.helpTip4,
// });

// // 信任站点弹窗
// let confirmVm = avalon.define({
//     $id: 'confirm-ctl',
//     show: false,
//     // 取消
//     editCancel() {
//         this.show = false;
//     },
//     // 确定
//     editOk() {
//         var data = {};
//         data.action = 'SetTrustSite';
//         data['arguments'] = {};
//         data['arguments']['strIP'] = document.domain;
//         let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
//         let ret_json = eval("(" + ret + ")");
//
//         if (ret_json.code != 0) {
//             this.show = true;
//         }
//     }
// });


// 下载中心弹窗
// let downLoadVm = avalon.define({
//     $id: 'confirm-downLoad',
//     show: false,
//     // 取消
//     editCancel() {
//         this.show = false;
//     }
// });

// let downLoadInnerVm = avalon.define({
//     $id: 'confirm-ctl-inner',
//     title: mainIndex.downloadCenter,
//     version: "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe",
//     certificatePlugHref: '//' + document.location.host + '/cert_download/rootca_levam.crt',
//     essentialPlug: language_txt.index.essentialPlug,
//     flashPlug: language_txt.index.flashPlug,
//     certificatePlug: language_txt.index.certificatePlug,
//     gosuncnPlayer: language_txt.index.gosuncnPlayer,
//     availableBrowsers: language_txt.index.availableBrowsers,
//     gosuncnBrowser: language_txt.index.gosuncnBrowser,
//     IE64: language_txt.index.IE64,
//     IE32: language_txt.index.IE32,
//     help: language_txt.index.help,
//     defaultDownloadUrl: defaultDownloadUrl, // 默认高新兴国迈安全浏览器下载地址
//     iconDownLoad(event) {
//         let target = event.target;
//         if (target == undefined)
//             return;
//         if (target.tagName.toLowerCase() == 'i') {
//             window.open(target.previousSibling.href, '_self');
//         }
//     },
//     openDownLoadHelp() {
//         downLoadVm.show = false;
//         questionVm.show = true;
//     },
// });
/* 
 * 3.6版本的首页代码
 * 从这里开始
 */

//初始化页面
function initPage() {
    //首页情况
    let objYes = getUpdatedPostObjAndID(weekRange),
        objWeek = getUpdatedPostObjAndID(monthRange),
        objMon = getUpdatedPostObjAndID(yearRange);

    //昨日
    getCaseData(objYes['postObj'], objYes['id']);
    //本周
    getCaseData(objWeek['postObj'], objWeek['id']);
    //本月
    getCaseData(objMon['postObj'], objMon['id']);

    //初始化图表信息为昨日的情况
    updateAll(objYes['postObj'], objYes['id']);
}
/**************************  ajax请求拿昨日、本周、本月的数据  ************************************/
function getCaseData(checkObj, id) {
    ajax({
        url: '/gmvcs/stat/comprehensive/index/part1',
        //url: '../../mock/index-part1.json',
        method: 'post',
        data: checkObj
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: result.msg,
                title: language_txt.index.notification
            });
            return;
        }
        let data = result.data;
        if (data == null) {
            return;
        }
        let spzsc = secChangeToHour(data.spzsc), //视频总时长
            tpzs = data.tpzs, //图片总数
            ypzsc = secChangeToHour(data.ypzsc); //音频总时长
        switch (id) {
            case 1:
                mainIndex.zr_spzsc = spzsc;
                mainIndex.zr_tpzs = tpzs;
                mainIndex.zr_ypzsc = ypzsc;
                break;
            case 2:
                mainIndex.bz_spzsc = spzsc;
                mainIndex.bz_tpzs = tpzs;
                mainIndex.bz_ypzsc = ypzsc;
                break;
            case 3:
                mainIndex.by_spzsc = spzsc;
                mainIndex.by_tpzs = tpzs;
                mainIndex.by_ypzsc = ypzsc;
                break;
            default:
                break;
        }
    });
}
//使用时长图表提示效果
//本年
function yearFormatter(a) {
    let yearTable = language_txt.index.yearTable;
    return (a['seriesName'] + '</br>' + yearTable[a['dataIndex']] + '：' + a['value'] + ' ' + language_txt.index.hours);
}
//本月
function monthFormatter(a) {
    let monthTable = language_txt.index.monthTable;
    return (a['seriesName'] + '</br>' + monthTable[a['dataIndex']] + '：' + a['value'] + ' ' + language_txt.index.hours);
}
//本周
function weekFormatter(a) {
    let weekTable = [language_txt.index.Mon, language_txt.index.Tues, language_txt.index.Wed, language_txt.index.Thur, language_txt.index.Fri, language_txt.index.Sat, language_txt.index.Sun];;
    return (a['seriesName'] + '</br>' + weekTable[a['dataIndex']] + '：' + a['value'] + ' ' + language_txt.index.hours);
}
//昨日
function yesFormatter(a) {
    return (a['seriesName'] + '</br>' + a['name'] + '：' + a['value'] + ' ' + language_txt.index.hours);
}
//时长秒转换成小时（保留两位小数的四舍五入法）
function secChangeToHour(seconds) {
    return (Math.round((seconds / 3600) * 100) / 100).toFixed(2);
}
//有关率的保留四位小数点之后转成百分数
function decChangeToPercent(decimal) {
    return (Math.round(decimal * 10000) / 100).toFixed(2);
}
//把0转成0.00显示
function formatZero() {
    return 0.00.toFixed(2);
}
//使用时长图表横坐标
//本年情况
function getUsageRateXYear(usageRateSeries) {
    let usageRateX = [];
    // let len = usageRateSeries.length;
    // for (let i = 0; i < len; i++) {
    //     usageRateX.push('');
    // }
    usageRateX = language_txt.index.yearTable2;
    return usageRateX;
}

function getUsageRateXWeek(usageRateSeries) {
    let usageRateX = [];
    let table = [language_txt.index.Mon, language_txt.index.Tues, language_txt.index.Wed, language_txt.index.Thur, language_txt.index.Fri, language_txt.index.Sat, language_txt.index.Sun];
    let len = usageRateSeries.length;
    for (let i = 0; i < len; i++) {
        usageRateX.push(table[i]);
    }
    return table;
}

function getUsageRateXMon(usageRateSeries) {
    let usageRateX = [];
    let len = usageRateSeries.length;
    let mouthday = language_txt.index.monthTable;
    for (let i = 0; i < len; i++) {
        if (i % 4 > 0) {
            usageRateX.push('');

        } else {
            usageRateX.push(mouthday[i]);
        }
    }
    return usageRateX;
}

function getUpdatedPostObjAndID(time) {
    let postObj = {
        beginTime: "2018-09-27T00:00:00.000Z",
        endTime: "2018-10-17T00:00:00.000Z",
        orgId: orgId,
        orgPath: orgPath,
        uid: uid
    }
    let yesterStart = moment().subtract(1, 'days').set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //昨日开始时间
    let yesterEnd = moment().subtract(1, 'days').set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 0
    }).valueOf(); //昨日结束时间
    let curWeek = moment().isoWeekday(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本周的星期一
    let curMonth = moment().dates(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本月的1号
    let curYear = moment().dayOfYear(1).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }).valueOf(); //本年的1号
    let curTime = moment().set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 0
    }).valueOf(); //当前时间
    let id = 0;
    switch (time) {
        case weekRange:
            id = 1;
            postObj.beginTime = curWeek;
            postObj.endTime = curTime;
            break;
        case monthRange:
            id = 2;
            postObj.beginTime = curMonth;
            postObj.endTime = curTime;
            break;
        case yearRange:
            id = 3;
            postObj.beginTime = curYear;
            postObj.endTime = curTime;
            break;
        default:
            break;
    }
    let returnObj = {
        postObj: postObj,
        id: id
    }
    return returnObj;
}

function updateAll(postObj, id) { //更新图表
    mainIndex.updateUsageRate(postObj, id); //更新使用使用时长
    mainIndex.updateVideoRate(postObj); //更新显著视频标记率
    // mainIndex.updateAnnotationRate(postObj); //更新显著视频标记率
    mainIndex.updateRanking(postObj, id); //更新排名情况
}
//超出字数显示省略号
avalon.filters.wordlimit = function (numStr, wordlength) {
    numStr = numStr.toString();
    if (numStr.length > wordlength) {
        numStr = numStr.substr(0, 6) + '...';
    }
    return numStr;
}

//小数转化百分率
function num2Percent(data) {
    data = data * 100;
    data = data.toFixed(0);
    return data;

}
/* end */