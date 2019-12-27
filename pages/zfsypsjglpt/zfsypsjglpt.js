// 公共引用部分，兼容IE8
import '/apps/common/common';
import './zfsypsjglpt.css';
import '/apps/common/common-index';
import 'ane';
import {
    applyRouteConfig
} from '/services/pagesRouterServer';
import * as menuService from '../../services/menuService';
import {
    store
} from '/apps/common/common-store.js';
import {
    copyRight,
    telephone,
    playerConfig,
    mapType,
    languageSelect
} from '/services/configService';
let language_txt = require('../../vendor/language').language;

import {
    list as listMenu
} from './menuConfig';
import {
    routeConfig
} from './routeConfig';

require('/apps/common/common-gjdw-map');
require('/apps/common/common-layout');

let delete_ocx = require('../../apps/common/common').delete_ocx;
let storage = require('../../services/storageService').ret;
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');
if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
    storage.clearAll();
    global.location.href = '/main-login.html';
}

var root = avalon.define({
    $id: 'zfsypsjglpt_vm',
    currentPage: '',
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: 'DEMS',
    roleShow: false,
    year: (new Date()).getFullYear(),
    demsMenu: get_menu(),
    extra_class: languageSelect == "en" ? true : false,
    zfsypsjglpt_language: language_txt.mainIndex,
    flag_jtwfkp: false,
    show_player: playerConfig,
    selectedKeys: [""],
    menuCallback(selectedKey, openKey) {
        root.selectedKeys = selectedKey;
    },
    completed: false
});
if (root.roleNames.length == 0) {
    roleNames.push(' - ');
}
if (root.roleNames.length > 1) {
    root.roleShow = true;
}

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;

    if (sysList.length == 0) {
        if (languageSelect == "en") {
            document.title = "DEMS";
            root.titleName = "DEMS";
        } else {
            document.title = "执法视音频数据管理系统";
            root.titleName = "执法视音频数据管理系统";
        }
    }

    avalon.each(sysList, (key, val) => {
        if (/^\/zfsypsjglpt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

let output_list = []; //已授权的菜单map数组
let authorized3LevelList = []; // 已授权的第三级菜单
function get_menu() {
    let list = listMenu;

    menuService.menu.then(menu => {
        let remote_list = menu.AUDIO_MENU_SYPSJGL; //音视频数据管理平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组

        avalon.each(remote_list, function (index, el) {
            if (/^AUDIO_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });
        let filterMenu = (list, output) => {
            avalon.each(list, function (index, el) {
                avalon.each(get_list, function (idx, ele) {                  
                    if (ele == el.lic) {
                        let child_list = [];
                        if (!el.hasOwnProperty("childrenArray") || 0 == el.childrenArray.length) {

                        } else {
                            avalon.each(el.childrenArray, function (k, v) {
                                avalon.each(get_list, function (kk, vv) {
                                    if (vv == v.lic) {
                                        // avalon.Array.ensure(child_list, v);
                                        if (menu.AUDIO_MENU_SYPSJGL_ARR[v.lic])
                                            // v.title = menu.AUDIO_MENU_SYPSJGL_ARR[v.lic];
                                            if (v.lic == "AUDIO_MENU_TJFX_SLQKTJ_JJ") {
                                                v.title = language_txt.mainIndex.mediaStatistics;
                                            } else if (v.lic == "AUDIO_MENU_TJFX_ZCTJ_JJ") {
                                                v.title = language_txt.mainIndex.deviceStatistics;
                                            }
                                        child_list.push(v);
                                        return;
                                    }
                                });
                                el.childrenArray = child_list;
                            });
                        }

                        if (menu.AUDIO_MENU_SYPSJGL_ARR[el.lic])
                            el.title = menu.AUDIO_MENU_SYPSJGL_ARR[el.lic];
                        avalon.Array.ensure(output, el);
                        return;
                    }
                });
            });
        };
        filterMenu(list, output_list);
        for(let listIndex = 0; listIndex < list.length; listIndex++) {
            if(list[listIndex].lic== "AUDIO_MENU_SYPGL_ZFYSYP_JJ") {
                list[listIndex].title = language_txt.mainIndex.title1;
            } else if(list[listIndex].lic== "AUDIO_MENU_TJFX") {
                list[listIndex].title = language_txt.mainIndex.title2;
            }
        }
        store.dispatch({
            type: "saveMenu",
            menu: authorized3LevelList
        });

        root.demsMenu = output_list;
        root.completed = true;
    });
}
//===============================================================================================================

$(document).ready(function () {
    if (mapType == 0) {
        $('#mapIframe').attr('src', '../sszhEsriMap.html');
    } else if (mapType === 1) {
        $('#mapIframe').attr('src', '../baiduMap.html');
    } else {
        $('#mapIframe').attr('src', '../mapLite.html');
    }
});

applyRouteConfig(routeConfig, {
    name: 'zfsypsjglpt_vm'
});

avalon.history.start({
    root: "/",
    fireAnchor: false
});

if (!/#!/.test(global.location.hash)) {
    avalon.router.navigate('/', 2);
}

avalon.bind(window, "hashchange", (e) => {
    $("#iframe_zfsyps").css({
        width: "0px",
        height: "0px",
        left: "0px",
        top: "0px"
    });
    $("#iframe_download").css({
        width: "0px",
        height: "0px",
        left: "0px",
        top: "0px"
    });
});

avalon.scan(document.body);