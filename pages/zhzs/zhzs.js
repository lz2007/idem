/*
 * @Author: linzhanhong 
 * @Date: 2018-06-27 09:31:03 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2018-07-13 19:07:45
 */

// 公共引用部分，兼容IE8用
require('/apps/common/common');

import { notification } from 'ane';
import moment from 'moment';
let echarts = require("echarts/dist/echarts.min");
import "/apps/zhzs/chartbox/chartbox";
import ajax from '/services/ajaxService.js';

let storage = require('/services/storageService.js').ret;

require('/vendor/jquery/jquery.nicescroll.min.js');
require('/apps/zhzs/contentright/contentright');

document.title = '综合展示';

let orgId = storage.getItem("orgId");
let orgPath = storage.getItem("orgPath");
let tableLeftTopObject = {},
    tableCenterBottomObject = {},
    echart_1 = {},
    echart_2 = {};

let zhzs_vm = avalon.define({
    $id: 'zhzs',
    contentHeight: 800,
    currentTime: '',
    tabName: [
        {name: "警情" ,val: 0},
        {name: "交通违法" ,val: 1},
        {name: "事故处理" ,val: 2}
    ],
    sszhTabName: [
        {name: "执法记录仪" ,val: 0},
        {name: "SOS告警" ,val: 1}
    ],
    currentIndex: 0,
    leftTopTabClick(index) {
        $('.zhzs-left-top-tabCont .table-index-tbody > li > div').removeClass('active-hover');
        this.currentIndex = index;
        let url = '';
        switch(index) {
            case 0:
                url = '/gmvcs/stat/comprehensive/get/policesituation'; // 警情信息
                break;
            case 1:
                url = '/gmvcs/stat/comprehensive/get/traffic/violation'; // 交通违法信息
                break;
            case 2:
                url = '/gmvcs/stat/comprehensive/get/accident'; // 事故处理信息
                break;
        }
        this.getLeftTopData(url);
    },
    currentTabIndex: 0,
    centerBottomTabClick(index, event) {
        $('.zhzs-center-bottom-tabCont .table-index-tbody > li > div').removeClass('active-hover'); // 
        this.currentTabIndex = index;
        $(event.currentTarget).addClass('active-tab').siblings().removeClass('active-tab');
        if(index === '1') {
            this.getCenterBottomData('/gmvcs/stat/comprehensive/get/alarm');
        } else {
            this.getDeviceTotalInfo();
        }
    },
    // 显示当前时间
    getCurrentTime() {
        let _this = this;
        setInterval(() => {
            this.currentTime = moment().format('YYYY年MM月DD日 HH:mm:ss');
        }, 1000);
    },
    // 回到首页
    toHome(event) {
        window.location.href = '/';
    },
    // 初始化表格jq插件
    initLeftTopTableObject() {
        tableLeftTopObject = $.tableIndex({
            id: 'zhzs_left_top_table',
            tableBody: tableBodyLeftTop
        });
    },
    initCenterBottomTableObject() {
        tableCenterBottomObject = $.tableIndex({
            id: 'zhzs_center_bottom_table',
            tableBody: tableBodyCenterBottom
        });
    },
    option_1: {
        title: {
            show: true,
            text: '执法记录仪——0台',
            textStyle: {
                color: '#fff',
                align: 'center',
                fontSize: 14,
                fontWeight: 'normal'
            },
            bottom: 0,
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}"
        },
        color: ['#d200df','#f3be30','#e06f00','#00ace5'],
        legend: {
            orient: 'vertical',
            x: "55%",
            y: "center",
            textStyle: {
                color: '#fff'
            },
            data:[{
                name:'维修'
            },{
                name:'注销'
            },{
                name:'停用'
            },{
                name:'正常'
            }]
        },
        series: [
            {
                name:'执法记录仪',
                type:'pie',
                radius: ['50%', '70%'],
                center: ["30%", "50%"],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                data:[
                    {value:30, name:'维修'},
                    {value:20, name:'注销'},
                    {value:20, name:'停用'},
                    {value:468, name:'正常'}
                ]
            }
        ]
    },
    option_2: {
        title: {
            show: true,
            text: '采集工作站——5台',
            textStyle: {
                color: '#fff',
                align: 'center',
                fontSize: 14,
                fontWeight: 'normal'
            },
            bottom: 0,
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}"
        },
        color: ['#e06f00','#00ace5'],
        legend: {
            orient: 'vertical',
            x: "55%",
            y: "center",
            textStyle: {
                color: '#fff'
            },
            data:[{
                name:'离线'
            },{
                name:'在线'
            }]
        },
        series: [
            {
                name:'采集工作站',
                type:'pie',
                radius: ['50%', '70%'],
                center: ["30%", "50%"],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    },
                    emphasis: {
                        show: true
                    }
                },
                data:[
                    {value:1, name:'离线'},
                    {value:4, name:'在线'}
                ]
            }
        ]
    },
    graphicOption(imgUrl, id) {
        let calcWidth = $('#' + id).width()*0.11627906976744186;
        let setting = {
            type: 'image',
            left: calcWidth*2+5,
            top: 'center',
            $action: 'replace',
            style: {
                image: `${imgUrl}?__sprite`,
                width: calcWidth,
                height: calcWidth
            }
        };
        return setting;
    },
    tabToggle: true, // 设备情况统计左右切换状态
    // 设备情况统计-左按钮
    leftClick() {
        if(!this.tabToggle) {
            this.tabToggle = true;
            this.zfjlyDataHandle(this.zfjlyList);
        }
    },
    // 设备情况统计-右按钮
    rightClick() {
        if(this.tabToggle) {
            this.tabToggle = false;
            this.getStorageServerData();
        }
    },
    zfjlyList: [], // 执法记录仪暂存数据
    ccfwqList: {}, // 存储服务器暂存数据
    // 执法记录仪echart数据渲染
    zfjlyDataHandle(data) {
        let status = data,
            totalDsjNumber = 0,
            legend = [],
            echart_1_data = [];
        avalon.each(status, function(key, val) {
            let item = {};
            let str = val.statusName + '：' + (val.percent * 100).toFixed(0) + '%（' + val.dsjNumber + '台）';
            legend.push(str);
            item.name = str;
            item.value = val.dsjNumber;
            echart_1_data.push(item);
            totalDsjNumber += val.dsjNumber;
        });

        let echart_1_option = {
            title: {
                text: '执法记录仪——' + totalDsjNumber + '台'
            },
            graphic: [{
                type: 'text',
                z: 100,
                top: '22%',
                right: '23%',
                style: {
                    text: '',
                    font: '14px "STHeiti", sans-serif',
                    fill: '#fff'
                }
            }],
            legend: {
                data: legend
            },
            color: ['#d200df','#f3be30','#e06f00','#00ace5'].reverse(),
            series: [
                {
                    name: '执法记录仪',
                    data: echart_1_data
                }
            ]
        };
        echart_1_option.graphic.push(this.graphicOption('/static/image/zhzs/device-icon.png', 'zfjly'));
        echart_1.setOption(echart_1_option);
    },
    // 存储服务器echart数据渲染
    ccfwqDataHandle(ret) {
        let data = ret,
            total = data.total,
            legend = [];
        let usedPercent = (data.usedPercent * 100).toFixed(0);
        let unUsedPercent = (data.unUsedPercent * 100 ).toFixed(0);
        let usedStr = '已用：' + usedPercent + '%（' + (data.totalCapacity - data.remainCapacity).toFixed(2) + 'T）';
        let unUsedStr = '可用：' + unUsedPercent + '%（' + data.remainCapacity.toFixed(2) + 'T）';
        legend = [usedStr, unUsedStr];

        let echart_1_option = {
            title: {
                text: '存储服务器——' + total + '台'
            },
            graphic: [{
                type: 'text',
                z: 100,
                top: '22%',
                right: '23%',
                style: {
                    text: '总容量：' + data.totalCapacity.toFixed(2) + 'T',
                    font: '14px "STHeiti", sans-serif',
                    fill: '#fff'
                }
            }],
            legend: {
                data: legend,
                tooltip: {
                    show: true,

                }
            },
            color: ['#d200df', '#00ace5'],
            series: [
                {
                    name: '存储服务器',
                    data: [
                        {value: (data.totalCapacity - data.remainCapacity).toFixed(2), name: usedStr},
                        {value: data.remainCapacity.toFixed(2), name: unUsedStr}
                    ]
                }
            ]
        };
        echart_1_option.graphic.push(this.graphicOption('/static/image/zhzs/storage-server.png', 'zfjly'));
        echart_1.setOption(echart_1_option);
    },
    // 初始化echart
    inintEchart(id_1, id_2, option_1, option_2) {
        echart_1 = echarts.init(document.getElementById(id_1));
        echart_1.setOption(option_1);
        echart_2 = echarts.init(document.getElementById(id_2));
        echart_2.setOption(option_2);
    },
    // 获取警情、交通违法、事故处理信息
    getLeftTopData(url) {
        let _this = this;
        getData(url, 0, 20, function(list) {
            let storageStr = '';
            switch(_this.currentIndex) {
                case 0: 
                    storageStr = 'zhzs-left-top-jq-data';
                    break;
                case 1: 
                    storageStr = 'zhzs-left-top-jtwf-data';
                    break;
                case 2: 
                    storageStr = 'zhzs-left-top-sgcl-data';
                    break;
            }
            let dataList = list.currentElements;
            if(storage.getItem(storageStr)) {
                let storageData = storage.getItem(storageStr);
                avalon.each(dataList, function(key, val) {
                    for(let i = 0; i < storageData.length; i++) {
                        val.active = true;
                        if(0 == _this.currentIndex) {
                            if (val.jqbh == storageData[i].jqbh) {
                                val.active = false;
                                return;
                            }
                        } else {
                            if (val.rid == storageData[i].rid) {
                                val.active = false;
                                return;
                            }
                        }
                    }
                });
            }

            // 格式化时间
            avalon.each(dataList, function(key, val) {
                if(0 == _this.currentIndex)
                    val.bjsj = val.bjsj && avalon.filters.date(val.bjsj,'HH:mm:ss');
                else if(1 == _this.currentIndex)
                    val.wfsj = val.wfsj && avalon.filters.date(val.wfsj,'HH:mm:ss');
                else
                    val.clsj = val.clsj && avalon.filters.date(val.clsj,'HH:mm:ss');
            });

            tableLeftTopObject.tableDataFnc(dataList);
            // 5秒后取消新增信息的高亮
            setTimeout(function() {
                $('.zhzs-left-top-tabCont .table-index-tbody > li > div').removeClass('active-hover');
            }, 5000);
            storage.setItem(storageStr,dataList);
        });
    },
    // 获取SOS告警信息
    getCenterBottomData(url) {
        getData(url, 0, 20, function(list) {
            let dataList = list.currentElements;
            if(storage.getItem('zhzs-center-bottom-sos-data')) {
                let storageData = storage.getItem('zhzs-center-bottom-data');
                avalon.each(dataList, function(key, val) {
                    for(let i = 0; i < storageData.length; i++) {
                        val.active = true;
                        if (val.id == storageData[i].id) {
                            val.active = false;
                            return;
                        }
                    };
                });
            }

             // 格式化时间
             avalon.each(dataList, function(key, val) {
                    val.time = val.time && avalon.filters.date(val.time,'HH:mm:ss');
            });

            tableCenterBottomObject.tableDataFnc(dataList);
            // 5秒后取消新增信息的高亮
            setTimeout(function() {
                $('.zhzs-center-bottom-tabCont .table-index-tbody > li > div').removeClass('active-hover');
            }, 5000);
            storage.setItem('zhzs-center-bottom-sos-data',dataList);
        });
    },
    liveData: {
        jq: 0, // 警情个数
        jtwf: 0, // 交通违法个数
        sgcl: 0, // 事故处理个数
        jrxzspsc: '00:00:00', // 今日新增视频时长
        onlineNumber: 0, // 执法记录仪在线数
        alarmNumber: 0 // 告警数
    },
    // 获取实时数据
    getLiveData() {
        let params = {};
        params.orgId = orgId;
        params.orgPath = orgPath;
        params.beginTime = moment().startOf('day').unix() * 1000,
        params.endTime = moment().unix() * 1000;

        ajax({
            url: '/gmvcs/stat/comprehensive/get/live/data',
            method: 'POST',
            data: params
        }).then(ret => {
            if(ret.code == 0) {
                let data  = ret.data;
                this.liveData.jq = data.jq;
                this.liveData.jtwf = data.jtwf;
                this.liveData.sgcl = data.sgcl;
                
                let timeLong = data.jrxzspsc; // 单位为秒，要转格式
                this.liveData.jrxzspsc = secondToDate(timeLong);
            }
        });
    },
    // 设备使用状态及上下线设备信息统计
    getDeviceTotalInfo() {
        ajax({
            url: '/gmvcs/uom/device/statistics/assets/dsj/statistics',
            method: 'GET',
            data: {}
        }).then(ret => {
            if(ret.code == 0) {
                let data = ret.data;
                
                let dataList = data.onlineDsjInfoList;
                if(storage.getItem('zhzs-center-bottom-zfjly-data')) {
                    let storageData = storage.getItem('zhzs-center-bottom-data');
                    avalon.each(dataList, function(key, val) {
                        for(let i = 0; i < storageData.length; i++) {
                            val.active = true;
                            if (val.rid == storageData[i].rid) {
                                val.active = false;
                                return;
                            }
                        };
                    });
                }

                // 格式化时间
                avalon.each(dataList, function(key, val) {
                    val.time = val.insertTime && avalon.filters.date(val.insertTime,'HH:mm:ss');
                });

                tableCenterBottomObject.tableDataFnc(dataList); // 执法记录仪表格填充
                // 5秒后取消新增信息的高亮
                setTimeout(function() {
                    $('.zhzs-center-bottom-tabCont .table-index-tbody > li > div').removeClass('active-hover');
                }, 5000);
                storage.setItem('zhzs-center-bottom-zfjly-data',dataList);

                this.liveData.onlineNumber = data.online.dsjNumber;

                // 执法记录仪echart数据更新
                this.zfjlyList = data.status;
                if(this.tabToggle)
                    this.zfjlyDataHandle(this.zfjlyList);
            }
        });
    },
    // 统计采集工作站的数量
    getWorkstationAmount() {
        ajax({
            url: '/gmvcs/uom/device/statistics/assets/workstation',
            method: 'GET',
            data: {}
        }).then(ret => {
            if(ret.code == 0) {
                let data = ret.data,
                    total = data.total,
                    legend = [];
                let offlineRate = (data.offlineTotal / data.total * 100 ).toFixed(0);
                let onlineRate = (data.onlineTotal / data.total * 100 ).toFixed(0);
                let onlineStr = '在线：' + onlineRate + '%（' + data.onlineTotal + '台）';
                let offlineStr = '离线：' + offlineRate + '%（' + data.offlineTotal + '台）';
                legend = [offlineStr, onlineStr];

                let echart_2_option = {
                    graphic: [],
                    title: {
                        text: '采集工作站——' + total + '台'
                    },
                    legend: {
                        data: legend
                    },
                    series: [
                        {
                            data: [
                                {value: data.offlineTotal, name: offlineStr},
                                {value: data.onlineTotal, name: onlineStr}
                            ]
                        }
                    ]
                };
                echart_2_option.graphic.push(this.graphicOption('/static/image/zhzs/workstation-icon.png', 'cjgzz'));
                echart_2.setOption(echart_2_option);
            }
        });
    },
    // 获取存储服务器数据
    getStorageServerData() {
        ajax({
            url: '/gmvcs/uom/storage/all/statistics',
            method: 'GET',
            data: {}
        }).then(ret => {
            if(ret.code == 0) {
                this.ccfwqList = ret.data;
                this.ccfwqDataHandle(this.ccfwqList);
            }
        });
    },
    // 获取告警总数
    getAlarmAmount() {
        let params = {};
        params.orgId = orgId;
        params.orgPath = orgPath;
        params.beginTime = moment().startOf('day').unix() * 1000,
        params.endTime = moment().unix() * 1000;
        
        ajax({
            url: '/gmvcs/stat/comprehensive/get/alarm/count',
            method: 'POST',
            data: params
        }).then(ret => {
            if(ret.code == 0) {
                let data = ret.data;
                this.liveData.alarmNumber = data;
            }
        });
    },
    // 轮询请求
    pollingData() {
        let _this = this;
        setInterval(function() {
            _this.getLiveData(); // 更新实时数据
            _this.getAlarmAmount(); // 更新SOS告警数量
            _this.getWorkstationAmount(); // 更新采集工作站数据
            _this.leftTopTabClick(_this.currentIndex); // 更新警情等表格信息
            _this.getDeviceTotalInfo(); // 更新执法记录仪信息
            if(_this.currentTabIndex === '1') {
                _this.getCenterBottomData('/gmvcs/stat/comprehensive/get/alarm');
            }
            if(!_this.tabToggle) {
                _this.getStorageServerData(); // 更新存储服务器数据
            }
        }, 1000 * 10);  // 设置10秒轮询
    }
});

zhzs_vm.$watch('onReady', function() {
    let _this = this;

    this.getCurrentTime();

    // 初始化表格对象
    this.initLeftTopTableObject();
    this.initCenterBottomTableObject();

    // 初始化表格数据
    this.getLeftTopData('/gmvcs/stat/comprehensive/get/policesituation');

    // 初始化实时数据
    this.getLiveData();

    // 初始化SOS告警数量
    this.getAlarmAmount();

    // 初始化设备使用状态及上下线设备信息统计、工作站数量
    this.getDeviceTotalInfo();
    this.getWorkstationAmount();

    // 初始化左侧echarts
    this.inintEchart('zfjly', 'cjgzz', this.option_1, this.option_2);

    // 轮询数据
    this.pollingData();

    let mheight = document.body.style.minHeight = window.document.documentElement.clientHeight;
    this.contentHeight = mheight - 112;

    $(window).resize(function() {
        document.body.style.height = document.body.style.minHeight = window.document.documentElement.clientHeight + 'px';
        let mheight = document.body.style.minHeight = window.document.documentElement.clientHeight;
        _this.contentHeight = mheight - 112;
        echart_1.resize();
        echart_2.resize();
    });
});

avalon.ready(function() {
    // IE浏览器不调用niceScroll
    if(!isIE_fuc()) {
        $('.zhzs-table .table-index-tbody').niceScroll({
            cursorcolor: "#00a1d6",
            cursorwidth: "6px",
            cursorborder: "1px solid #00a1d6",
            background: "#334a5a",
            autohidemode: false
        });
    }
});

function getData(url, page, pageSize, callback) {
    let params = {},
        data = {};
    params.url = url;
    params.method = "POST";
    
    data.orgId = orgId;
    data.orgPath = orgPath;
    data.page = page;
    data.pageSize = pageSize;
    data.beginTime = moment().startOf('day').unix() * 1000,
    data.endTime = moment().unix() * 1000;
    params.data = data;

    ajax({
        url: params.url,
        method: params.method,
        data: params.data
    }).then(ret => {
        if(ret.code == 0) {
            let list = ret.data;
            if(callback && typeof(callback) === "function")
                callback(list);
        }
    });
}

let tableBodyLeftTop = avalon.define({ //表格定义组件
    $id: 'zhzs-left-top-table',
    data: [],
    checked: [],
    loading: false,
    selection: [],
    paddingRight: 0, //有滚动条时内边距
    isAllChecked: false,
    isColDrag: false, //true代表表格列宽可以拖动
    dragStorageName: 'zhzs-left-top-table-sto', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
});

let tableBodyCenterBottom = avalon.define({ //表格定义组件
    $id: 'zhzs-center-bottom-table',
    data: [],
    checked: [],
    loading: false,
    selection: [],
    paddingRight: 0,
    isAllChecked: false,
    isColDrag: false,
    dragStorageName: 'zhzs-center-bottom-table-sto',
});

// 秒转时分秒
function secondToDate(result) {
    var h = Math.floor(result / 3600) < 10 ? '0'+Math.floor(result / 3600) : Math.floor(result / 3600);
    var m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
    var s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));
    return result = h + ":" + m + ":" + s;
}

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

avalon.scan(document.body);