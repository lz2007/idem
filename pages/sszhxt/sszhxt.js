// 公共引用部分，兼容IE8
import '/apps/common/common';
import '/apps/common/common-index';
import './sszhxt.css';
import 'ane';
import {
    notification
} from 'ane';
import * as menuService from '../../services/menuService';
import {
    copyRight,
    telephone,
    defalutCity,
    mapType
} from '/services/configService';
import ajax from '../../services/ajaxService';
import * as cityobj from '../../apps/common/common-sszhmap-cityaddress';
import {
    webSocketIp,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
import io from 'socket.io-client';
let {
    routerserver
} = require('/services/routerService');
require('/apps/common/common-layout');
require('../../apps/common/common-poll-sidebar');
// require('../../apps/common/common-sszh-sidebar');
require('../../apps/common/common-sszh-new-sidebar');
require("../../apps/common/common-sszh-mapcity.js");
// require("../../apps/common/common-sszh-sosgjdy-tree.js")

let storage = require('../../services/storageService').ret;

let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');
let frameWindow, sosZtree;
if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
    storage.clearAll();
    global.location.href = '/main-login.html';
}

var root = avalon.define({
    $id: 'sszhxt_vm',
    currentPage: '',
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: '',
    roleShow: false,
    copyRight: copyRight,
    telephone: telephone,
    locationKey: window.location.hash ? window.location.hash.slice(2) : '/sszhxt-sszh',
    menu: get_menu(),
    extra_class: languageSelect == "en" ? true : false,
    sszhxt_language: language_txt.sszhxt.main,
    userSearch: false,
    menuClick(index, item) {
        if (item.url) {
            this.locationKey = item.url;
        }
    },
    completed: false,
    selectedKeys: [""],
    menuCallback(selectedKey, openKey) {
        root.selectedKeys = selectedKey;
    },
    toggleChildrenItem(event) {
        $(event.target).find('.ant-menu-item-children') && $(event.target).find('.ant-menu-item-children').toggle();
    },
    $cityDetailobj: {
        cityobj: cityobj
    },

    // sos告警信息菜单切换
    sosMenuType: 'service',
    sosInfoShow: false, //告警信息是否展示
    serviceFaceData: [], // 业务告警人脸布控数据
    serviceCarData: [], // 业务告警车牌布控数据
    serviceSOSData: [], //业务告警SOS数据
    deviceSOSData: [], //设备告警数据
    statusSOSData: [], //状态告警数据
    sosMenuClick(val) { // sos告警信息菜单切换
        this.sosMenuType = val;
    },
    sosClick() {
        if (this.sosInfoShow) {
            this.sosInfoShow = false;
        } else {
            this.sosInfoShow = true;
        }
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); // 防止拖动时文字或图片选中
    },
    handelSOS(item) {
        // if (item.status == 1) return;
        root.sosInfoShow = false;
        item.status = 1;
        item.mytype = 0;
        if (window.location.hash.replace('#!/', '') == 'sszhxt-sszh') {
            avalon.vmodels['sszhxt_sszh'].handleTreeCheck('', '', item, true);
            return;
        }
        storage.setItem('sszhxt-SOS', item);
        var baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
        window.location.href = baseUrl + "/sszhxt-sszh";
    },
    handleSOSGjdy() {
        if (!this.userSearch) {
            showMessage('warn', this.sszhxt_language.notLicen);
            return;
        }
        sosGjdy.gjdyShow = true;
        sosGjdy.handleOpen();
    },
    clickSosTitle(e) {
        let target = e.target;
        $(target).next().toggle();
    },
    showMessage: showMessage
});

// 告警订阅弹窗
var sosGjdy = avalon.define({
    $id: 'sos-gjdy',
    gjdy_language: language_txt.sszhxt.sszhxt_gjgl,
    deviceSOS: [], //保存是否勾选
    firstChoose: true, //选择内容
    modalWidth: '500',
    modalHeight: '150',
    secondChoose: false,
    gjdyShow: false, // 告警订阅弹窗显示
    $chooseDevice: [],
    sqlid: '',
    rightDevArr: [], //右边已分配的执法仪
    leftallchecked: false,
    destoryTree: false,
    // 树id
    pollTreeId: '',
    extramove() {
        //弹窗移动回调
    },
    handleOpen() {
        // 防止ocx覆盖
        $('#video-ocx').css({
            'z-index': -9999,
            'position': 'relative'
        });
        //防止告警查询-详情页面OCX遮挡
        $('#video-ocxobject').css({
            'z-index': -9999,
            'position': 'relative'
        });
        //兼容ieocx覆盖
        if (!$('#ocx-sos-gjdy-iframe').length) {
            $('.com-modal-modal').append('<iframe id="ocx-sos-gjdy-iframe" src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe>')
        }
        //防止sos-info覆盖
        $('.sos-info').css({
            'z-index': 0
        })
        //  获取订阅
        fetchUserInitData().then((ret) => {
            if (ret.code != 0) {
                showMessage('error', sosGjdy.gjdy_language.getSubcribedInfoError);
                return;
            }
            sosGjdy.sqlid = ret.data.id;
            if (ret.data['businessRSS'] && ret.data['businessRSS'].length != 0) {
                avalon.each(ret.data['businessRSS'], (key, val) => {
                    val.subscribed && sosGjdy.deviceSOS.push(val.sosSource);
                });
            }
            if (ret.data['deviceRSS'] && ret.data['deviceRSS'].length != 0) {
                avalon.each(ret.data['deviceRSS'], (key, val) => {
                    val.subscribed && sosGjdy.deviceSOS.push(val.sosSource);
                });
            }
            if (ret.data['statusRSS'] && ret.data['statusRSS'].length != 0) {
                avalon.each(ret.data['statusRSS'], (key, val) => {
                    val.subscribed && sosGjdy.deviceSOS.push(val.sosSource);
                });
            }
            if (ret.data['devicesRSS'] && ret.data['devicesRSS'].length != 0) {
                settleDeviceData(ret.data['devicesRSS'], true);
            }
            if (ret.data['orgIdsRss'] && ret.data['orgIdsRss'].length > 0) settleDeviceData(ret.data['orgIdsRSS'], false);
        })
    },
    handleCheckboxChange(e) {
        var checked = e.target.checked,
            value = e.target.value;
    },
    handleNext() {
        // 弹窗位置修改
        $(".sos-gjdy-dialog .com-modal-modal").css({
            'top': 15 + '%'
        })
        sosGjdy.firstChoose = false;
        sosGjdy.secondChoose = true;
        sosGjdy.modalWidth = 630;
        sosGjdy.modalHeight = 600;
    },
    onPollTreeIdFn(treeId) {
        console.log(treeId);
        this.pollTreeId = treeId;
    },
    // 左侧树选择
    handleSosTreeCheck(event, treeId, treeNode) {
        if (treeNode.checked) {
            sosGjdy.$chooseDevice.push(treeNode);
        } else {
            let index = sosGjdy.$chooseDevice.indexOf(treeNode);
            if (index != -1) {
                sosGjdy.$chooseDevice.splice(index, 1);
            }
        }
        console.log(sosGjdy.$chooseDevice);
    },
    hanleToright() {
        let obj = {}
        avalon.each(sosGjdy.$chooseDevice, (key, item) => {
            let treeobj = {}
            copyObj = item;
            treeobj.username = copyObj.name || copyObj.username;
            treeobj.visible = true;
            treeobj.checked = false;
            treeobj.gbCode = copyObj.gbcode || copyObj.gbCode;
            treeobj.orgName = copyObj.getParentNode ? copyObj.getParentNode().name : copyObj.orgName;
            treeobj.orgPath = copyObj.getParentNode ? copyObj.getParentNode().path : copyObj.orgPath;
            treeobj.orgId = copyObj.getParentNode ? copyObj.getParentNode().gbcode : copyObj.orgId;
            if (obj[treeobj.orgId]) {
                obj[treeobj.orgId].push(treeobj);
            } else {
                obj[treeobj.orgId] = [treeobj];
            }
        });
        sosGjdy.rightDevArr.clear();
        avalon.each(obj, function (key, item) {
            let arrItem = {};
            arrItem.checked = false;
            arrItem.list = item;
            sosGjdy.rightDevArr.push(arrItem);
        });
        console.log(sosGjdy.rightDevArr);

    },
    hideOrshowLi(item, i) {
        avalon.each(item, (index, value) => {
            value.visible = !value.visible;
        })
    },
    handleSave() {
        let data = settlePostData();
        saveByAjax(data).then((ret) => {
            if (ret.code == 0) {
                showMessage('success', sosGjdy.gjdy_language.SaveSuccess);
                return;
            }
            showMessage('error', sosGjdy.gjdy_language.notificationTips);
        })
        sosGjdy.handleExit();
    },
    handleExit() {
        sosGjdy.gjdyShow = false;
        sosGjdy.firstChoose = true;
        sosGjdy.secondChoose = false;
        sosGjdy.modalWidth = 500;
        sosGjdy.modalHeight = 150;
        sosGjdy.$chooseDevice = [];
        // 重置ocx z-index
        $('#video-ocx').css({
            'z-index': 0,
            'position': 'relative'
        });
        // 重置告警查询-详情页面OCX z-index
        $('#video-ocxobject').css({
            'z-index': 0,
            'position': 'relative'
        });
        // 重置sosinfo z-index
        $('.sos-info').css({
            'z-index': 9999
        })
        for (let i = 0; i < sosGjdy.rightDevArr.length; i++) {
            sosGjdy.rightDevArr[i].list.splice(0, sosGjdy.rightDevArr[i].list.length);
        }
        sosGjdy.rightDevArr.splice(0, sosGjdy.rightDevArr.length);
        sosGjdy.deviceSOS.clear();
    },
    deleteDevice(item, i, j) {
        let index
        avalon.each(sosGjdy.$chooseDevice, (key, chooseItem) => {
            if (chooseItem.gbcode === item.gbCode) {
                chooseItem.checked = false;
                sosZtree = $.fn.zTree.getZTreeObj(sosGjdy.pollTreeId);
                sosZtree.updateNode(chooseItem);
                index = sosGjdy.$chooseDevice.indexOf(chooseItem)
            }
        });
        sosGjdy.$chooseDevice.splice(index, 1);
        sosGjdy.rightDevArr[i].list.splice(j, 1);
        if (sosGjdy.rightDevArr[i].list.lentgth == 0) {
            sosGjdy.rightDevArr.splice(i, 1);
        }
    }

})
/*
 *  处理后台放回的数据
 * */

function settleDeviceData(data, flag) {
    let $obj = {},
        arr = [];
    sosZtree = $.fn.zTree.getZTreeObj(sosGjdy.pollTreeId);
    
    if (sosZtree) {
        sosZtree.checkAllNodes(false);
    }
    if (flag) {
        for (var i = 0; i < data.length; i++) {
            console.log(data);
            
            // data[i].username = data[i].userName + ` ${sosGjdy.gjdy_language.bodyCamera}`;
            data[i].username = data[i].dn;
            // data[i].username = data[i].userName + '执法记录仪';
            delete data[i].userName;
            data[i].visible = false;
            data[i].checked = false;
            // let node = sosZtree.getNodesByParam('gbcode', data[i].gbCode, null);
            // node[0].checked = true;
            // sosZtree.updateNode(node[0]);
            sosGjdy.$chooseDevice.push(data[i]);
            if ($obj[data[i].orgId]) {
                $obj[data[i].orgId].push(data[i]);
            } else {
                $obj[data[i].orgId] = [data[i]];
            }
        }
        avalon.each($obj, function (key, item) {
            let arrItem = {};
            arrItem.checked = false;
            arrItem.list = item;
            sosGjdy.rightDevArr.push(arrItem);
        })
    } else {
        for (var i = 0; i < data.length; i++) {
            data[i].username = data[i].orgName;
            data[i].visible = false;
            data[i].checked = false;
            let arrItem = {};
            arrItem.checked = false;
            arrItem.list = [data[i]];
            sosGjdy.rightDevArr.push(arrItem);
        }
    }
    console.log(sosGjdy.rightDevArr);

}
/*
 * 处理提交给后台的数据
 * */
function settlePostData() {
    let data = {
        "id": sosGjdy.sqlid,
        "businessRSS": [{
            "sosType": "BUSINESS_SOS",
            "sosSource": "DEVICE_SOS",
            "subscribed": sosGjdy.deviceSOS.indexOf('DEVICE_SOS') != -1 ? true : false
        }, {
            "sosType": "BUSINESS_SOS",
            "sosSource": "FACE_MONITORING",
            "subscribed": sosGjdy.deviceSOS.indexOf('FACE_MONITORING') != -1 ? true : false
        }, {
            "sosType": "BUSINESS_SOS",
            "sosSource": "CAR_MONITORING",
            "subscribed": sosGjdy.deviceSOS.indexOf('CAR_MONITORING') != -1 ? true : false
        }],
        "statusRSS": [{
                "sosType": "STATUS_SOS",
                "sosSource": "DEVICE_ONLINE",
                "subscribed": sosGjdy.deviceSOS.indexOf('DEVICE_ONLINE') != -1 ? true : false
            },
            {
                "sosType": "STATUS_SOS",
                "sosSource": "DEVICE_OFFLINE",
                "subscribed": sosGjdy.deviceSOS.indexOf('DEVICE_OFFLINE') != -1 ? true : false
            }
        ],
        "deviceRSS": [{
                "sosType": "DEVICE_SOS",
                "sosSource": "DEVICE_ELECTRIC_CAPACITANCE",
                "subscribed": sosGjdy.deviceSOS.indexOf('DEVICE_ELECTRIC_CAPACITANCE') != -1 ? true : false
            },
            {
                "sosType": "DEVICE_SOS",
                "sosSource": "DEVICE_STORAGE_CAPACITANCE",
                "subscribed": sosGjdy.deviceSOS.indexOf('DEVICE_STORAGE_CAPACITANCE') != -1 ? true : false
            }
        ],
        "devicesRSS": [],
        "orgIdsRSS": []
    };
    var arr = sosGjdy.$model.rightDevArr;
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].list.length; j++) {
            if (arr[i].list[j].gbCode) {
                data.devicesRSS.push(arr[i].list[j].gbCode);
            } else {
                data.orgIdsRSS.push(arr[i].list[j].orgId);
            }

        }
    }
    return data;
}
/*
 * 获取登录用户的告警订阅
 * */
function fetchUserInitData() {
    return ajax({
        url: '/gmvcs/instruct/sos/myself/rss',
        method: 'get',
        cache: false
    })
}

/**
 * 保存登录用户的告警订阅
 *
 * @param {*} data
 * @returns
 */
function saveByAjax(data) {
    return ajax({
        url: '/gmvcs/instruct/sos/saveorupdate/myself/rss',
        method: 'post',
        cache: false,
        data: data
    });
}





// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    if (sysList.length == 0) {
        if (languageSelect == "en") {
            document.title = "MVMS";
            root.titleName = "MVMS";
        } else {
            document.title = "执法视音频实时应用系统";
            root.titleName = "执法视音频实时应用系统";
        }
    }
    avalon.each(sysList, (key, val) => {
        if (/^\/sszhxt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});
// 权限管理
menuService.menu.then(menu => {
    let list = menu.SSZH_MENU_SSZHXT;
    avalon.each(list, (index, el) => {
        if (el == 'INSTRUCT_MENU_GJGL_GJDY_BC') {
            root.userSearch = true;
        }
    })
})
if (root.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (root.roleNames.length > 1) {
    root.roleShow = true;
}
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: root.sszhxt_language.notification,
        message: content
    });
}

function get_menu() {
    let list = [{
            key: "sszhxt-sszh",
            title: "实时指挥",
            url: '/sszhxt-sszh',
            lic: 'INSTRUCT_MENU_SSZH',
            active: false
        },
        {
            key: "sszhxt-spjk",
            title: "视频监控",
            url: '/sszhxt-spjk',
            lic: 'INSTRUCT_MENU_SPJK',
            active: false
        },
        {
            key: "sszhxt-lxhf",
            title: "录像回放",
            url: '/sszhxt-lxhf',
            lic: 'INSTRUCT_MENU_LXHF',
            active: false
        },
        {
            key: "sszhxt-gjcx",
            title: "轨迹查询",
            url: '/sszhxt-gjcx',
            lic: 'INSTRUCT_MENU_GJCX',
            active: false
        },
        {
            key: 'sszhxt-gjgl-gjcx',
            title: '告警查询',
            lic: 'INSTRUCT_MENU_GJGL_GJCX',
            url: '/sszhxt-gjgl-gjcx',
            active: false
        },

        // {
        //     key: "sszhxt-gjgl",
        //     title: "告警管理",
        //     lic: 'INSTRUCT_MENU_GJGL',
        //     active: false,
        //     children: [{
        //         key: 'gjcx',
        //         title: '告警查询',
        //         lic: 'INSTRUCT_MENU_GJGL_GJCX',
        //         url: '/sszhxt-gjgl-gjcx',
        //         active: false
        //     }, {
        //         key: 'gjdy',
        //         title: '告警订阅',
        //         lic: 'INSTRUCT_MENU_GJGL_GJDY',
        //         url: '/sszhxt-gjgl-gjdy',
        //         active: false
        //     }, {
        //         key: 'gjsz',
        //         title: '告警设置',
        //         lic: 'INSTRUCT_MENU_GJGL_GJSZ',
        //         url: '/sszhxt-gjgl-gjsz',
        //         active: false
        //     }]
        // },
        {
            key: "sszhxt-znsb",
            title: "智能识别",
            lic: 'INSTRUCT_MENU_ZNSB',
            active: false,
            children: [{
                key: 'rlbk',
                title: '人脸布控',
                lic: 'INSTRUCT_MENU_ZNSB_RLBK',
                url: '/sszhxt-znsb-rlbk',
                active: false
            }, {
                key: 'cpbk',
                title: '车牌布控',
                lic: 'INSTRUCT_MENU_ZNSB_CPBK',
                url: '/sszhxt-znsb-cpbk',
                active: false
            }]
        },
        {
            key: "sszhxt-dzwl",
            title: "电子围栏",
            url: '/sszhxt-dzwl',
            lic: 'INSTRUCT_MENU_DZWL',
            active: false
        },
        {
            key: "sszhxt-jqdj",
            title: "集群对讲",
            url: '/sszhxt-jqdj',
            lic: 'INSTRUCT_MENU_JQDJ',
            active: false
        },
        {
            key: "sszhxt-xxcj",
            title: "信息采集",
            url: '/sszhxt-xxcj',
            lic: 'SSZH_MENU_XXCJ',
            active: false
        }
    ];

    menuService.menu.then(menu => {
        let remote_list = menu.SSZH_MENU_SSZHXT; //实时指挥系统平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组
        let output_list = []; //已授权的菜单map数组

        avalon.each(remote_list, function (index, el) {
            if (/^INSTRUCT_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });

        avalon.each(list, function (index, el) {
            avalon.each(get_list, function (idx, ele) {
                let child_list = [];
                if (!el.hasOwnProperty("children") || 0 == el.children.length) {

                } else {
                    avalon.each(el.children, function (k, v) {
                        avalon.each(get_list, function (kk, vv) {
                            if (vv == v.lic) {
                                // avalon.Array.ensure(child_list, v);
                                if (menu.SSZH_MENU_SSZHXT_ARR[v.lic])
                                    v.title = menu.SSZH_MENU_SSZHXT_ARR[v.lic];

                                child_list.push(v);
                                return;
                            }
                        });
                        el.children = child_list;
                    });
                }

                if (ele == el.lic) {
                    if (menu.SSZH_MENU_SSZHXT_ARR[el.lic]) {
                        el.title = menu.SSZH_MENU_SSZHXT_ARR[el.lic];
                        // if (languageSelect == "en") {
                        switch (el.lic) {
                            case "INSTRUCT_MENU_SSZH":
                                el.title = language_txt.sszhxt.main.title1;
                                break;
                            case "INSTRUCT_MENU_SPJK":
                                el.title = language_txt.sszhxt.main.title2;
                                break;
                            case "INSTRUCT_MENU_LXHF":
                                el.title = language_txt.sszhxt.main.title3;
                                break;
                            case "INSTRUCT_MENU_GJCX":
                                el.title = language_txt.sszhxt.main.title4;
                                break;
                            case "INSTRUCT_MENU_GJGL":
                                el.title = language_txt.sszhxt.main.title5;
                                break;
                            case "INSTRUCT_MENU_ZNSB":
                                el.title = language_txt.sszhxt.main.title6;
                                break;
                            case "INSTRUCT_MENU_GJGL_GJCX":
                                el.title = language_txt.sszhxt.main.title7;
                                break;
                        }
                        // }
                    }
                    avalon.Array.ensure(output_list, el);
                }
            });
        });
        root.menu = output_list;
        root.completed = true;
        // 默认选中第一项菜单（注：shortcutList.js里面的实时指挥系统写死了路由，故可知第一次点击的hash是/sszhxt-sszh）
        if (root.locationKey == '/sszhxt-sszh') {
            avalon.history.setHash(root.menu[0].url);
        }
    });
}
//router server
routerserver('sszhxt_vm');

avalon.bind(window, 'hashchange', (e) => {
    root.locationKey = window.location.hash ? window.location.hash.slice(2) : '/sszhxt-sszh';
});

// history
avalon.history.start({
    root: "/",
    fireAnchor: false
});

avalon.scan(document.body);

//后台获取当前用户设置的地图默认城市
ajax({
    url: '/gmvcs/uap/user/city/get',
    method: 'get',
    data: null,
    async: false
}).then(result => {
    if (result.code == 0) {
        let city;
        // if (result.data != null || result.data != undefined) {
        //     city = result.data.city;
        // } else {
        //     city = defalutCity.city;
        // }
        city = defalutCity.city;
        root.$cityDetailobj.defaultcity = city;
        root.$cityDetailobj.nowClickcity = city;
        root.$cityDetailobj.lon = cityobj[city].lon;
        root.$cityDetailobj.lat = cityobj[city].lat;
        // root.$cityDetailobj.lon = cityobj[city].lon;
        // root.$cityDetailobj.lat = cityobj[city].lat;
        // avalon.vmodels['sszhmap'].showcityName = city;
        // avalon.vmodels['citycontroller'].nowcity = city;
        // avalon.vmodels['citycontroller'].defaultcity = city;
        // if($('#mapIframe')[0].contentWindow.esriMap){
        //     $('#mapIframe')[0].contentWindow.esriMap.setMapCenter(root.$cityDetailobj.lon,root.$cityDetailobj.lat,13);
        // }
    }
});

avalon.ready(function () {
    // if (languageSelect == "zhcn") {
    if (mapType == 0) {
        $('#mapIframe').attr('src', '../sszhEsriMap.html');
    } else if (mapType === 1) {
        $('#mapIframe').attr('src', '../baiduMap.html');
    } else {
        $('#mapIframe').attr('src', '../mapLite.html');

    }
    root.$watch('locationKey', (v) => {
        // 在左栏导航改变时，对告警订阅的树进行销毁和重新初始化
        // 使其树的数据与common-sszh-treemodel.js 里树的数据改变时机一致，防止更新树
        sosGjdy.destoryTree = true;
        sosGjdy.destoryTree = false;
    })
    // } else {
    //     if (mapType == 0) {
    //         $('#mapIframe').attr('src', '../sszhEsriMap.html');
    //     } else if (mapType === 1) {
    //         $('#mapIframe').attr('src', '../baiduMapEn.html');
    //     } else {
    //         $('#mapIframe').attr('src', '../mapLiteEn.html');

    //     }
    // }
});

//系统第一次加载地图时加上蒙版(注意要在avalon.scan之后，否则需要定时器延时)
frameWindow = document.getElementById("mapIframe").contentWindow;
let isIE = isIE();
let txt = root.sszhxt_language.loadingMap;
if ($('.map-iframe-wrap').is(':visible') && $('.map-iframe-wrap').width() > 0) {
    let iframe = isIE ? '' : '<div id="back-iframe" style="display: none;position:absolute;width:100%;height:100%;top:0;left:0;"><iframe src="about:blank" marginheight="0" marginwidth="0" style="position:absolute; visibility:inherit;top: 30%; left: 50%; width: 276px;height:36px;margin-left:-138px;z-index:992;opacity:1;filter:alpha(opacity=0);background: #4d4d4d;" frameborder="0"></iframe></div>';
    let $backdrop = $(iframe + '<div class="backdrop-loading"><span class="fa fa-spinner fa-pulse"></span>' + txt + '<iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe></div><div class="backdrop"><iframe src="about:blank" frameBorder="0" marginHeight="0" marginWidth="0" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%;z-index:-1;opacity:0;filter:alpha(opacity=0);"></iframe></div>');
    $('body').append($backdrop);
    $('#back-iframe').show();
}
if (mapType == 0) {
    frameWindow.defineTimer = setInterval(() => {
        frameWindow = document.getElementById("mapIframe").contentWindow;
        if (frameWindow.loadMapCompelete) {
            clearInterval(frameWindow.defineTimer);
            $('#back-iframe,.backdrop-loading,.backdrop').remove();
        }
    }, 200);
}

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}



// $(function(){
//     $("sos-info-menu > li").click(function(){
//         $("sos-info-menu > li").removeClass("active");
//         $(this).addClass("active");
//         // var src=event.target;//get a
//         // var href=$(src).attr("target");//get t
//         // var dd="#"+href; //get id
//         console.log(this);

//     });
// });
//=====================================sos告警===========================
var error_total = 0;
let webprotocol = '';
if(window.location.protocol == "http:") {
    webprotocol = "ws://";
}else if(window.location.protocol == "https:") {
    webprotocol = "wss://";
}
const websocketIP = webprotocol + webSocketIp;
// const websocketIP = 'ws://' + webSocketIp;
const socket = io(websocketIP, {
    transports: ['polling']
});

socket.on('connect', (connect) => {
    //获取当前登录用户的部门path
    ajax({
        url: '/gmvcs/uap/cas/loginUser',
        method: 'get',
        data: null
    }).then(result => {
        if (result.code != 0) {
            return;
        }
        let uid = result.data.uid;
        socket.emit('uidEvent', {
            'uid': uid
        });
    });
});

socket.on('messageevent', (ret) => {
    ret.status = 0;
    console.log(ret)
    if (ret.sosType == "DEVICE_SOS") {
        if (ret.sosSource == "DEVICE_ELECTRIC_CAPACITANCE") {
            ret.sosType = root.sszhxt_language.power;
        } else {
            ret.sosType = root.sszhxt_language.storage;
        }

        if (root.deviceSOSData.length > 500) {
            root.deviceSOSData.clear();
        }
        root.deviceSOSData.unshift(ret);
    } else if (ret.sosType == "BUSINESS_SOS") {
        ret.gbcode = ret.deviceId;
        root.sosInfoShow = true;
        root.sosMenuType = 'service';
        if (ret.sosSource == "FACE_MONITORING") {
            ret.sosType = root.sszhxt_language.faceDetectionAlarm;
            root.serviceFaceData.unshift(ret);
        } else if (ret.sosSource == "CAR_MONITORING") {
            ret.sosType = root.sszhxt_language.carDetectionAlarm;
            root.serviceCarData.unshift(ret);
        } else {
            ret.sosType = root.sszhxt_language.SOSAlarm;
            root.serviceSOSData.unshift(ret);
        }
    } else {
        if (ret.sosSource == "DEVICE_ONLINE") {
            ret.sosType = root.sszhxt_language.online;
        } else {
            ret.sosType = root.sszhxt_language.offline;
        }
        if (root.statusSOSData.length > 500) {
            root.statusSOSData.clear();
        }
        root.statusSOSData.unshift(ret);
    }

});

socket.on('STATUS', (ret) => {
    // if(ret.closed == "true") {
    //     socket.close();
    // }
});

socket.on('error', (error) => {
    socket.close();
});
socket.on('reconnecting', (error) => {
    //console.log(error);
});
socket.on('connect_error', (error) => {
    error_total++;
    if (error_total > 9) {
        error_total = 0;
        socket.close();
        // console.log("=====重连次数超出限制，已断开socket连接=====");
    }
});

socket.on('connect_timeout', (timeout) => {
    // console.log("connect_timeout:", timeout);
});

avalon.bind(window, "hashchange", (e) => {
    $("#iframe_download").css({
        width: "0px",
        height: "0px",
        left: "0px",
        top: "0px"
    });
});