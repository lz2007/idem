import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import moment from 'moment';
import ajax from "/services/ajaxService";
export const name = "zfsypsjglpt-tjfx-4gzfyzxltj";
require("/apps/zfsypsjglpt/zfsypsjglpt-tjfx-4gzfyzxltj.css");
import * as menuServer from '../../services/menuService';

let click_zfyzxltj_search = true,
    click_zfyzxltj_export = true;
let storage = require('/services/storageService.js').ret;
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-tjfx-4gzfyzxltj.html"),
    defaults: {
        authority: {
            "SEARCH": false,
            "EXPORT": false
        },
        zfyzxltj_org_select: avalon.define({ //部门树绑定
            $id: "zfyzxltj-org-select",
            expandedKeys: [],
            dataTree: [],
            org_Id: '',
            //dep_path: '',
            selectfuc(event) {
                if (event.target.value) {
                    this.org_Id = event.target.value;
                    //console.log(this.org_Id);
                }
            },
            depName: []
        }),
        zfyzxltj_obj_select: avalon.define({ //统计对象
            $id: 'zfyzxltj-obj-select',
            selValue: ['-1'],
            objValue: '', //选中的值
            options: [{
                'label': '人员统计',
                'value': '-1'
            }, {
                'label': '部门统计',
                'value': '0'
            }],
            haldeChange(event) {
                this.objValue = event.target.value;
                // if(event.target.value == '-1'){
                //     vm_zfyzxltj_table.tableShowByPerson = true;
                //     vm_zfyzxltj_table.tableShowByOrg = false;
                // }else if(event.target.value == '0'){
                //     vm_zfyzxltj_table.tableShowByPerson = false;
                //     vm_zfyzxltj_table.tableShowByOrg = true;
                // }
            }
        }),
        zfyzxltj_searchFnc() { //查询函数
            notification.warn({
                message: '接口未提供',
                title: '通知'
            });
            return;
            if (click_zfyzxltj_search) {//防止重复操作
                click_zfyzxltj_search = false;
                setTimeout(function () {
                    click_zfyzxltj_search = true;
                }, 2000);
            }else{
                return;
            }

            let avalon_this = this;
            let startTime = getTimeByDateStr(vm_startTime_select.selValue),
                endTime = getTimeByDateStr(vm_endTime_select.selValue);
            let time_interval = endTime - startTime;
            if(vm_startTime_select.isStartTime || vm_endTime_select.isEndTime){
                return;
            }
            if(time_interval < 0){
                notification.warn({
                    message: '开始时间不能晚于结束时间，请重新设置！',
                    title: '通知'
                });
                return;
            }
            if (time_interval / 86400000 > 365) { //86400000 = 24 * 60 * 60 * 1000
                notification.warn({
                    message: '时间间隔不能超过一年，请重新设置！',
                    title: '通知'
                });
                return;
            }
            let params = {
                "page":0,
                "pageSize":vm_zfyzxltj_table.pageSize,
                "orgId": avalon_this.zfyzxltj_org_select.org_Id || avalon.components[name].defaults.zfyzxltj_org_select.depName[0], //所属部门path
                "target": avalon_this.zfyzxltj_obj_select.objValue || avalon_this.zfyzxltj_obj_select.selValue[0],//统计对象
                "startTime": startTime,
                "endTime": getTimeByDateStr(vm_endTime_select.selValue, true)
            };
            if(params.target == '-1'){//人员统计
                vm_zfyzxltj_table.tableShowByPerson = true;
                vm_zfyzxltj_table.tableShowByOrg = false;
            }else if(params.target == '0'){//部门统计
                vm_zfyzxltj_table.tableShowByPerson = false;
                vm_zfyzxltj_table.tableShowByOrg = true;
            }
            vm_zfyzxltj_table.current = 1;
            vm_zfyzxltj_table.paramsData = params;
            vm_zfyzxltj_table.fetch(params);
            //console.log(params);
        },
        zfyzxltj_exportFnc() { //导出数据
            if (click_zfyzxltj_export) {//防止重复操作
                click_zfyzxltj_export = false;
                setTimeout(function () {
                    click_zfyzxltj_export = true;
                }, 2000);
            }else{
                return;
            }

        },
        onInit() {
            let _this = this;
            vm_zfyzxltj_table.total      = 0;
            vm_zfyzxltj_table.current    = 0;
            vm_zfyzxltj_table.pageSize   = 20;
            vm_zfyzxltj_table.remoteList = [];
            vm_zfyzxltj_table.paramsData = {};
            let storageJson = storage.getItem('zfsypsjglpt-tjfx-4gzfyzxltj');
            if(storageJson){
                ajax({
                    url: '/gmvcs/uap/org/queryById/' + storageJson.orgId,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if((result.code == 0) && (!result.data)){
                        notification.info({
                            message: "所属部门已更新，请重新操作",
                            title: "通知"
                        });
                        _this.zfyzxltj_obj_select.selValue = ['-1'];//统计对象
                        vm_startTime_select.selValue = moment().subtract(7, 'days').format('YYYY-MM-DD');
                        vm_endTime_select.selValue = moment().format('YYYY-MM-DD');
                        orgInit();//部门初始化
                    }else{
                        _this.zfyzxltj_obj_select.selValue = [storageJson.target];//统计对象
                        vm_startTime_select.selValue = storageJson.startDate;
                        vm_endTime_select.selValue = storageJson.endDate;
                        org_initStorage(storageJson.orgId);//所属部门
                        vm_zfyzxltj_table.total      = storageJson.total;
                        vm_zfyzxltj_table.remoteList = storageJson.remoteList;//表格数据
                        vm_zfyzxltj_table.current    = storageJson.page + 1;
                        vm_zfyzxltj_table.pageSize   = storageJson.pageSize;
                        //console.log(storageJson.remoteList);
                        vm_zfyzxltj_table.paramsData = {
                            "page": storageJson.page,
                            "pageSize": storageJson.pageSize,
                            "orgId": storageJson.orgId,//所属部门
                            "target": storageJson.target, //统计对象
                            "startTime": storageJson.startTime, //开始时间
                            "endTime": storageJson.endTime //结束时间
                        };
                    }

                });
            }else{
                _this.zfyzxltj_obj_select.selValue = new Array('-1');//统计对象
                vm_startTime_select.selValue = moment().subtract(7, 'days').format('YYYY-MM-DD');
                vm_endTime_select.selValue = moment().format('YYYY-MM-DD');
                orgInit();//部门初始化
            }

            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_TJFX/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".zfyzxltj-tabCont").css("top", "0px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_TJFX_4GZFYZXLTJ_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                        case "AUDIO_FUNCTION_TJFX_4GZFYZXLTJ_EXPORT":
                            _this.authority.EXPORT = true;
                            break;
                    }
                });
     
                // 防止查询等按钮无权限时页面留白
                if (false == _this.authority.SEARCH && false == _this.authority.EXPORT)
                    $(".zfyzxltj-tabCont").css("top", "0px");
            });
        },
        onReady() {
            let v_height = $(window).height() - 96;
            let v_min_height = $(window).height() - 68;
            if (v_height > 740) {
                $(".tjfx-4gzfyzxltj").height(v_height);
                $("#sidebar .zfsypsjglpt-menu").css("min-height", v_min_height + "px");
            } else {
                $(".tjfx-4gzfyzxltj").height(740);
                $("#sidebar .zfsypsjglpt-menu").css("min-height", "765px");
            }
        },
        onDispose(){
            click_zfyzxltj_search = true;
            click_zfyzxltj_export = true;
        }
    }
});

let vm_startTime_select = avalon.define({
    $id: "zfyzxltj-startTime-select",
    isStartTime: false,
    selValue: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    handleChange(e) {
        let _this = this;
        _this.selValue = e.target.value;
        if (!_this.selValue) {
            _this.isStartTime = true;
        } else {
            _this.isStartTime = false;
        }
    }
});

let vm_endTime_select = avalon.define({
    $id: "zfyzxltj-endTime-select",
    isEndTime: false,
    selValue: moment().format('YYYY-MM-DD'),
    handleChange(e) {
        let _this = this;
        _this.isEndTime = e.target.value;
        if (!_this.isEndTime) {
            _this.isEndTime = true;
        } else {
            _this.isEndTime = false;
        }
    }
});

let vm_zfyzxltj_table = avalon.define({ //页面表格数据渲染
    $id: 'zfyzxltj-table',
    loading: false,
    remoteList: [],
    tableShowByPerson:true,
    tableShowByOrg:false,
    total: 0,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        this.fetch(params);
    },
    fetch(params) {
        this.loading = true;
        ajax({
            url: '/gmvcs/audio/statisticalAnalysis/video_statistics_by_person',
            method: 'post',
            //模拟请求
            data: {
                "page": params.page,
                "pageSize": params.pageSize,
                "orgId": params.orgId,//所属部门
                "target": params.target, //统计对象
                "startTime": params.startTime, //开始时间
                "endTime": params.endTime //结束时间
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: "查询失败！",
                    title: "温馨提示"
                });
                this.loading = false;
                return;
            }else{
                this.total = result.data.totalElements;
                let ret = result.data.currentElements;
                let len = ret.length; //记录当前页面的数据长度
                this.remoteList = [];
                this.remoteList = avalon.range(len).map(n => ({ //字段末尾带L：表示返回的是没经过处理的字段
                    userName: ret[n].userName || '-', //姓名
                    orgName: ret[n].orgName || '-', //所属部门
                    zfypfs:100,
                    onlineTime:7,//在线天数
                    onlineRate:'100%',//在线率
                    onlineTotalTime: formatSeconds(36061000/1000), //在线总时长
                    preOnlineTime: '90%', //平均每天在线时长
                }));
                //console.log(this.remoteList);
                this.loading = false;
            }
            // if(result.data.currentElements.length > 0){//存在数据

            // }
            // if(result.data.currentElements.length == 0){//不存在数据

            // }
            let  dataStorage = {//localstorage保存
                "page": params.page,
                "pageSize": params.pageSize,
                "orgId": params.orgId,//所属部门
                "target": params.target, //统计对象
                "startTime": params.startTime, //开始时间
                "endTime": params.endTime, //结束时间
                "remoteList":this.remoteList,//表格数据
                "total":this.total,//查询总数
                "startDate":vm_startTime_select.selValue,//保存初始状态开始日期
                "endDate":vm_endTime_select.selValue//保存初始状态结束日期
            };
            storage.setItem('zfsypsjglpt-tjfx-4gzfyzxltj',dataStorage,0.5);
        });
    }
});

function orgInit() {
    //部门列表
    ajax({
        url: '/gmvcs/uap/org/all',
        method: 'get',
        data: {}
    }).then(result => {
        if (result.data.length > 0) {
            let temp = [];
            yhglDepTree(result.data, temp);
            avalon.components[name].defaults.zfyzxltj_org_select.dataTree = temp;
            let tempId = [result.data[0].orgId];
            avalon.components[name].defaults.zfyzxltj_org_select.depName = tempId;
            avalon.components[name].defaults.zfyzxltj_org_select.expandedKeys = tempId;
            avalon['components'][name]['defaults'].zfyzxltj_searchFnc();
        }
    });
}

function org_initStorage(orgId){
    //部门列表
    ajax({
       url: '/gmvcs/uap/org/all',
       method: 'get',
       data: {}
   }).then(result => {
       if (result.data.length > 0) {
           let temp = [];
           yhglDepTree(result.data, temp);
           avalon.components[name].defaults.zfyzxltj_org_select.dataTree = temp;
           avalon.components[name].defaults.zfyzxltj_org_select.depName = [orgId];
           avalon.components[name].defaults.zfyzxltj_org_select.expandedKeys = [result.data[0].orgId];
       }
   });
}

function yhglDepTree(tree, dataTree) {
    let org_icon = '/static/image/zfsypsjglpt/users.png?__sprite';
    if (!tree) {
        return;
    }
    for (let i = 0, item; item = tree[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].key = item.orgId;
        dataTree[i].title = item.orgName;
        dataTree[i].path = item.path;
        dataTree[i].icon = org_icon;
        dataTree[i].children = new Array();

        yhglDepTree(item.childs, dataTree[i].children);
    }
}

/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    // var s = stringTime.split(" ");
    // var s1 = s[0].split("-");
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    // if (s2.length == 2) {
    //     s2.push("00");
    // }
    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}

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
}

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        if (minute >= 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = hour + ":" + minute + ":" + second;
    return result;
}
/*================== 时间控制函数 end =============================*/