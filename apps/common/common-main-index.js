import ajax from '/services/ajaxService.js';
import {createForm, notification} from "ane";
import 'ane';
import * as menuService from '../../services/menuService';
import {shortcutList} from '../common/common-shortcutList';
import {defaultBrowser, gxxOcxVersion, titleName} from '/services/configService';

let storage = require('/services/storageService.js').ret;
require('../../vendor/jquery/jquery.dragsort-0.5.2.min.js');
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');
let uid = storage.getItem('uid');
let globalOcxPlayer = {};

if (userName != null && userName != '' && roleNames != null || uid != null && uid != '') {
} else { //无登录信息时退出并跳转登录页
    // notification.error({
    //     message: '登录无效，请重新登录！',
    //     title: 'Tips'
    // });
    storage.clearAll();
    global.location.href = '/main-login.html';
    // setTimeout(() => {
    //     global.location.href = '/main-login.html';
    // }, 3000);
}

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


let mainIndex = avalon.define({
    $id: 'main-index',
    showBsTog: false,
    showSysTog: false,
    is_IE: isIE_fuc(),
    userName: userName,
    titleName: titleName,
    orgName: orgName,
    roleNames: roleNames,
    version: "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe",
    defaultDownloadUrl: defaultDownloadUrl, // 默认高新兴国迈安全浏览器下载地址
    eggDownloadUrl: eggDownloadUrl, // 彩蛋下载地址
    roleShow: false,
    bsList: [],
    sysList: getMenu(),
    optionsList: [],
    sysOptionsList: [],
    //ie下新窗口自动全屏
    handleNewWindow(url) {
        var tmp = window.open(url, "_blank");
        tmp.moveTo(0, 0);
        tmp.resizeTo(screen.width, screen.height);
        tmp.focus();
        tmp.location = url;
    },
    showBs(e) {
        this.showBsTog = !this.showBsTog;
        if (this.showBsTog) {
            $(".dragglist").dragsort({
                dragSelector: "li", // 拖动选择器
                dragBetween: true, // 启用多组列表之间拖动
                dragEnd: dragEndFunc, // 拖动结束后的回调函数
                placeHolderTemplate: "<li class='placeHolder'><div></div></li>" // 拖动列表的HTML部分
            });
        } else {
            $(".dragglist").dragsort("destroy"); // 销毁拖动
        }
    },
    showSys() {
        this.showSysTog = !this.showSysTog;
        if (this.showSysTog) {
            $(".syslist").dragsort({
                dragSelector: "li", // 拖动选择器
                dragBetween: true, // 启用多组列表之间拖动
                dragEnd: dragEndFunc, // 拖动结束后的回调函数
                placeHolderTemplate: "<li class='placeHolder'><div></div></li>" // 拖动列表的HTML部分
            });
        } else {
            $(".syslist").dragsort("destroy"); // 销毁拖动
        }
    },
    bindModify() {
        // edit_pwd_vm.show = true;
        avalon.components['ms-header-operation'].defaults.changePwd.show = true;
    },
    bindLogout() {
        // logoutVM.show_logout = true;
        avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
    },
    selectedData: {}, // 下拉框选中数据集
    onSelected(e) { // 下拉框change事件
        // let target = e.target;
        // let selectedIndex = target.selectedIndex;

        // // avalon.log(e.target['_ms_context_']);
        // let randomNum = Math.floor(Math.random() * 8); // 随机选择背景色
        // let _this = this;
        // avalon.each(shortcutList, function(k, v){
        //     if( v.menuCode == target.value){
        //         _this.selectedData = {
        //             url: v.url,
        //             icon: v.icon,
        //             title: target[selectedIndex].text,
        //             rgb: _this.iconColor[randomNum],
        //             code: target[selectedIndex].className
        //         };
        //         return;
        //     }
        // });
        // avalon.log(this.selectedData);
    },
    addBs() { // 添加应用快捷菜单事件
        let $this = $("#selectBS option:selected")[0];
        // let randomNum = Math.floor(Math.random() * 8); // 随机选择背景色
        let iconColor = $("#colorpickerBS").spectrum("get").toHexString();
        let _this = this;
        this.selectedData = {};
        // 限制最大添加量为12个
        if (this.bsList.length >= 12) {
            notification.warn({
                message: '当前配置限定最大为12个',
                title: 'Tips'
            });
            return;
        }
        if (undefined === $this)
            return;
        avalon.each(shortcutList, function (k, v) {
            if (v.menuCode == $this.value) {
                _this.selectedData = {
                    url: v.url,
                    icon: v.icon,
                    title: $this.text,
                    rgb: iconColor,
                    code: $this.className,
                    menuCode: v.menuCode
                };
                return;
            }
        });

        if (!$.isEmptyObject(this.selectedData)) {
            let order = this.bsList.length + 1;
            let add_data = {
                "app": {
                    "code": this.selectedData.code
                },
                "icon": this.selectedData.icon,
                "indexUrl": this.selectedData.url,
                "order": order,
                "model": "APPLICATION",
                "rgb": this.selectedData.rgb,
                "title": this.selectedData.title,
                "user": {
                    "uid": uid
                },
                "menu": {
                    "menuCode": this.selectedData.menuCode
                }
            };
            addShortcut(add_data, 'bs');
        }
    },
    addSys() { // 添加系统快捷菜单事件
        let $this = $("#selectSYS option:selected")[0];
        // let randomNum = Math.floor(Math.random() * 8); // 随机选择背景色
        let iconColor = $("#colorpickerSYS").spectrum("get").toHexString();
        let _this = this;
        this.selectedData = {};
        if (undefined === $this)
            return;
        avalon.each(shortcutList, function (k, v) {
            if (v.menuCode == $this.value) {
                _this.selectedData = {
                    url: v.url,
                    icon: v.icon,
                    title: $this.text,
                    rgb: iconColor,
                    menuCode: v.menuCode
                };
                return;
            }
        });

        if (!$.isEmptyObject(this.selectedData)) {
            let order = this.sysList.length + 1;
            let add_data = {
                "app": {
                    "code": this.selectedData.menuCode
                },
                "icon": this.selectedData.icon,
                "indexUrl": this.selectedData.url,
                "order": order,
                "model": "MANAGEMENT",
                "rgb": this.selectedData.rgb,
                "title": this.selectedData.title,
                "user": {
                    "uid": uid
                }
            };
            addShortcut(add_data, 'sys');
        }
    },
    // "?" 点击弹出弹窗
    questionClick() {
        questionVm.show = true;
    }
});

if (mainIndex.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (mainIndex.roleNames.length > 1) {
    mainIndex.roleShow = true;
}

// 获取有权限的系统平台菜单
function getMenu() {
    menuService.menu.then((menu) => {
        // avalon.log(JSON.stringify(menu.CAS_MENU_TYYHRZPT));
        // mainIndex.sysList =  menu.APP_MENU;
    });
}

// 拖动结束后的回调函数
function dragEndFunc() {
    let $this = $(this);
    let parent = $this.parent().attr('id');
    if ('bsUl' == parent) {
        let $li = $('#bsUl li');
        saveOrder($li);
        return;
    }

    if ('sysUl' == parent) {
        let $li = $('#sysUl li');
        saveOrder($li);
        return;
    }

    let className = $this.parent().attr('class');
    let id = $this[0].id;
    deleteShortcut(id, className);
    $this.remove();
}

// 保存移动后的快捷菜单排序
function saveOrder(model) {
    let $li = model;
    let length = $li.length;
    let order_list = [];

    for (let i = 0; i < length; i++) {
        let item = {};
        item.id = $li[i].id;
        item.order = i;
        order_list.push(item);
    }

    ajax({
        url: '/gmvcs/uap/shortcut/batch/edit/order',
        method: 'post',
        data: order_list
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: result.msg,
                title: 'Tips'
            });
            return;
        }
    });
}

// 获取当前登录用户的快捷菜单
ajax({
    url: '/gmvcs/uap/shortcut/getByUid?uid=' + uid,
    method: 'get',
    data: {}
}).then(result => {
    if (0 !== result.code) {
        notification.warn({
            message: result.msg,
            title: 'Tips'
        });
        return;
    }

    let bs_list = [];
    let sys_lsit = [];
    avalon.each(result.data, function (k, v) {
        if ('APPLICATION' == v.model) {
            bs_list.push(v);
        } else {
            sys_lsit.push(v);
        }
    });

    mainIndex.bsList = bs_list;
    mainIndex.sysList = sys_lsit;
});

// 获取当前用户可添加的应用快捷菜单
function getBsOptionsList() {
    ajax({
        url: '/gmvcs/uap/roles/getUserMenuPrivilegeInfo?uid=' + uid,
        method: 'get',
        data: {}
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: result.msg,
                title: 'Tips'
            });
            return;
        }

        let totalList = [];
        let data = result.data;
        for (let k in data) {
            avalon.each(data[k], function (key, val) {
                val.code = k;
            });
            avalon.Array.merge(totalList, data[k]);
        }

        for (let i = 0; i < totalList.length; i++) {
            if ("AUDIO_MENU_ZHZS" == totalList[i].menuCode || "WORKSTATION_MENU_CJGZZ" == totalList[i].menuCode) {
                avalon.Array.remove(totalList, totalList[i]);
            }
        }
        mainIndex.optionsList = totalList;
    });
}

// 获取当前用户可添加的系统快捷菜单
function getSysOptionsList() {
    ajax({
        url: '/gmvcs/uap/roles/getUserAppPrivilegeInfo?uid=' + uid,
        method: 'get',
        data: {}
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: result.msg,
                title: 'Tips'
            });
            return;
        }

        mainIndex.sysOptionsList = result.data;
    });
}

getBsOptionsList();
getSysOptionsList();

// 添加快捷菜单
function addShortcut(data, flag) {
    ajax({
        url: '/gmvcs/uap/shortcut/create',
        method: 'post',
        data: data
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: '添加快捷菜单失败！',
                title: 'Tips'
            });
            return;
        }
        if ('bs' == flag) {
            // 更新添加后的应用菜单数组
            mainIndex.bsList.push(result.data);
            let shiftIndex;
            avalon.each(mainIndex.optionsList, function (key, val) {
                if (val.menuName == data.title) {
                    shiftIndex = key;
                    return;
                }
            });
            // 更新添加后的下拉框数组
            avalon.Array.removeAt(mainIndex.optionsList, shiftIndex);
            $('#selectBS').find('option').eq(0).attr("selected", "selected");
        } else {
            // 更新添加后的系统菜单数组
            mainIndex.sysList.push(result.data);

            // 更新添加后的下拉框数组
            getSysOptionsList();
            $('#selectSYS').find('option').eq(0).attr("selected", "selected");
        }
    });
}

// 删除快捷菜单
function deleteShortcut(id, className) {
    ajax({
        url: '/gmvcs/uap/shortcut/delete/' + id,
        method: 'get',
        data: {}
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: '删除快捷菜单失败，请稍后再试！',
                title: 'Tips'
            });
            return;
        }

        if ('dragglist' == className) {
            let shiftIndex;
            avalon.each(mainIndex.bsList, function (key, val) {
                if (val.id == id) {
                    shiftIndex = key;
                    return;
                }
            });
            // 更新删除后的菜单数组
            avalon.Array.removeAt(mainIndex.bsList, shiftIndex);
            // 更新下拉框数组
            getBsOptionsList();
        } else {
            let shiftIndex;
            avalon.each(mainIndex.sysList, function (key, val) {
                if (val.id == id) {
                    shiftIndex = key;
                    return;
                }
            });
            // 更新删除后的菜单数组
            avalon.Array.removeAt(mainIndex.sysList, shiftIndex);
            // 更新下拉框数组
            getSysOptionsList();
        }
    });
}

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

// "?" 弹窗
let questionVm = avalon.define({
    $id: 'question-ctl',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
    },
    // 确定
    editOk() {
        this.show = false;
    }
});

// "?" innerVM
questionInnerVM = avalon.define({
    $id: 'question-ctl-inner',
    title: '下载中心 - 帮助说明'
});

// 信任站点弹窗
let confirmVm = avalon.define({
    $id: 'confirm-ctl',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
    },
    // 确定
    editOk() {
        var data = {};
        data.action = 'SetTrustSite';
        data['arguments'] = {};
        data['arguments']['strIP'] = document.domain;
        let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
        let ret_json = eval("(" + ret + ")");

        if (ret_json.code != 0) {
            this.show = true;
        }
    }
});

// 信任站点弹窗innerVM
confirmInnerVM = avalon.define({
    $id: 'confirm-ctl-inner',
    title: '提示',
    confirmMsg: '请使用管理员身份运行浏览器',
    // 取消
    editCancel() {
        confirmVm.show = false;
    }
});

$(document).ready(function () {
    // 颜色选择器初始化
    let options = {
        color: "#20b362", // 默认颜色
        preferredFormat: "hex",
        allowEmpty: false,
        chooseText: "选择",
        cancelText: "取消",
        showInitial: true,
        showInput: true, // 显示输入框
        replacerClassName: 'color-picker-wrap', // 样式名称
        showPalette: true, // 显示调色版
        palette: [
            ['#20b362', '#e09e1f', '#e76a1e', '#17a2c6'],
            ['#78ba00', '#2db7f5', '#691bb8', '#01bad2']
        ]
    };
    $("#colorpickerBS").spectrum(options);
    $("#colorpickerSYS").spectrum(options);

    if (8 === avalon.msie)
        $('.egg').hide();

    // OCX 站点信任弹窗
    if (mainIndex.is_IE)
        globalOcxPlayer = document.getElementById('gxxPlayOcx');
    else
        globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic');
    let data = {};
    data.action = 'InitDeviceSdk'; //初始化
    try {
        globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    } catch (e) {
        return;
    }

    data = {};
    data.action = 'IsTrustSite';
    data['arguments'] = {};
    data['arguments']['strIP'] = document.domain;

    let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
    let ret_json = eval("(" + ret + ")");
    if (ret_json.code == 1) {
        // confirmVm.show = true;
        confirmVm.editOk(); // IP自动加入信任站点
    }
});