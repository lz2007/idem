import avalon from 'avalon2';
import ajax from './ajaxService';
import 'es6-promise/dist/es6-promise.auto';
import {
    notification
} from 'ane';
import {
    languageSelect
} from '/services/configService';
let storage = require('./storageService').ret;

let uid = storage.getItem('uid');

const menu = [{
        key: 'tyyhrzpt-xtpzgl-yhgl',
        title: '用户管理',
        uri: '/tyyhrzpt-xtpzgl-yhgl',
        lic: "CAS_MENU_YHGL"
        // icon: 'glyphicon userManager-icon'
    },
    {
        key: 'tyyhrzpt-xtpzgl-bmgl',
        title: '部门管理',
        uri: '/tyyhrzpt-xtpzgl-bmgl',
        lic: "CAS_MENU_BMGL"
        // icon: 'glyphicon orgManager-icon'
    },
    {
        key: 'tyyhrzpt-xtpzgl-gnqx',
        title: '角色管理',
        uri: '/tyyhrzpt-xtpzgl-gnqx',
        lic: "CAS_MENU_GNQX"
        // icon: 'glyphicon funcRoleManager-icon'
    },
    // {
    //     key: 'tyyhrzpt-xtpzgl-xtcd',
    //     title:'系统菜单',
    //     uri: '/tyyhrzpt-xtpzgl-xtcd',
    //     // icon: 'glyphicon sysMenuManager-icon'
    // },
    // {
    //     key: 'tyyhrzpt-xtpzgl-xtgg',
    //     title:'系统公告',
    //     uri: '/tyyhrzpt-xtpzgl-xtgg',
    //     // icon: 'glyphicon sysNoticeManager-icon'
    // },
    {
        key: 'tyyhrzpt-xtpzgl-sjzd',
        title: '数据字典',
        uri: '/tyyhrzpt-xtpzgl-sjzd',
        lic: "CAS_MENU_SJZD"
        // icon: 'glyphicon dictManager-icon'
    },
    {
        key: 'tyyhrzpt-xtpzgl-czrz',
        title: '操作日志',
        uri: '/tyyhrzpt-xtpzgl-czrz',
        lic: "CAS_MENU_CZRZ"
        // icon: 'glyphicon Worklog-icon'
    },
    {
        key: 'tyyhrzpt-xtpzgl-sbk',
        title: '识别库',
        lic: "CAS_MENU_SBK",
        children: [{
                key: 'tyyhrzpt-xtpzgl-sbk-rylxk',
                title: '人员类型库',
                uri: '/tyyhrzpt-xtpzgl-sbk-rylxk',
                lic: "CAS_MENU_SBK_RLKSZ",
            },
            {
                key: 'tyyhrzpt-xtpzgl-sbk-rlk',
                title: '人脸库',
                uri: '/tyyhrzpt-xtpzgl-sbk-rlk',
                lic: "CAS_MENU_SBK_RLK",
            },
            {
                key: 'tyyhrzpt-xtpzgl-sbk-cpk',
                title: '车牌库',
                uri: '/tyyhrzpt-xtpzgl-sbk-cpk',
                lic: "CAS_MENU_SBK_CPK",
            }
        ]
        // icon: 'glyphicon Worklog-icon'
    }
    /*,
        {
            key:'aqsj-index',
            title:'安全审计',
            uri: '/aqsj-index'
        },
        {
            key:'sbgl-index',
            title:'设备管理',
            uri: '/sbgl-index'
        },
        {
            key:'ywgl-index',
            title:'运维管理',
            uri: '/ywgl-index'
        },
        {
            key:'xtgl-index',
            title:'系统管理',
            uri: '/xtgl-index'
        }*/
];


/*
 *二级菜单
 *parentKey：对应一级菜单的key
 *child：二级菜单数组
 */
const menubar = [{
        parentKey: 'aqsj-index',
        child: [{
                key: 'glxtrz',
                title: '管理系统日志',
                uri: '/aqsj-glxtrz'
            },
            {
                key: 'sjcjjccsbrz',
                title: '数据采集及存储设备日志',
                uri: '/aqsj-sjcjjccsbrz'
            },
            {
                key: 'zfjlyrz',
                title: '执法记录仪日志',
                uri: '/aqsj-zfjlyrz'
            }
        ]
    },
    {
        parentKey: 'ywgl-index',
        child: [{
                key: 'sjcjjccsbgl',
                title: '数据采集及存储设备管理',
                uri: '/ywgl-sjcjjccsbgl'
            },
            {
                key: 'yccfwqgl',
                title: '云存储服务器管理',
                uri: '/ywgl-yccfwqgl'
            },
            {
                key: 'yyfwqgl',
                title: '应用服务器管理',
                uri: '/ywgl-yyfwqgl'
            },
            {
                key: 'sjkfwqgl',
                title: '数据库服务器管理',
                uri: '/ywgl-sjkfwqgl'
            },
            {
                key: 'sqgl',
                title: '授权管理',
                uri: '/ywgl-sqgl'
            }
        ]
    },
    {
        parentKey: 'xtgl-index',
        child: [{
                key: 'dwgl',
                title: '单位管理',
                uri: '/xtgl-dwgl'
            },
            {
                key: 'yhgl',
                title: '用户管理',
                uri: '/xtgl-yhgl'
            },
            {
                key: 'qxsz',
                title: '权限设置',
                uri: '/xtgl-qxsz'
            }
        ]
    }
];

let application_menu = [{
        title: languageSelect == 'en' ? 'Home' : '首页', // 菜单名称 ====> 后台获取 
        url: '/', // 路由
        // icon: 'nav-xtsy', // 菜单icon
        // iconActive: 'nav-xtsy-active', // icon active状态
        key: 'home', // 唯一key，可用于菜单选中
        lic: "/gmvcs/home", // 授权校验字段
        index: 0 // 序号
    }, {
        title: languageSelect == 'en' ? "MVMS": "移动视频",
        url: "/sszhxt.html",
        // icon: "icon-sszh",
        key: 'mvms',
        lic: "/gmvcs/instruct",
        index: 1
    },
    {
        title: languageSelect == 'en' ? "DEMS" : "电子证据",
        url: "/zfsypsjglpt.html",
        // icon: "icon-xtpzgl",
        key: 'dems',
        lic: "/gmvcs/audio",
        index: 2
    },
    {
        title: languageSelect == 'en' ?  "Management" : "运维管理",
        url: "/xtywgl.html",
        // icon: "icon-xtpzgl",
        key: 'xtywgl',
        lic: "/gmvcs/mangement",
        index: 3
    }
];

// 根据权限过滤菜单
const menuPromise = new Promise((rs, rj) => {
    if (!storage.getItem('license')) {
        ajax({
            // url: '/api/menu',
            url: '/gmvcs/uap/roles/getUserPrivilege?uid=' + uid,
            method: 'get',
            data: {}
        }).then((result) => {
            if (0 != result.code) {
                notification.error({
                    message: 'Server backend error, please contact administrator.',
                    title: 'Tips'
                });
                // setTimeout(() => {
                //     global.location.href = '/main-login.html';
                // }, 2000);
                // return;
            }

            let MENU = {}; //存储已授权菜单对象
            let APP_MENU = []; //授权平台菜单数组 -- 一级菜单
            let INDEX_MENU = []; // 首页权限
            let INDEX_MENU_ARR = []; // 首页权限
            let CAS_MENU_TYYHRZPT = []; //统一用户认证平台菜单数组     -- 二级菜单
            let CAS_FUNC_TYYHRZPT = []; //统一用户认证平台各模块按钮权限数组

            let UOM_MENU_TYYWGLPT_ARR = []; //统一运维管理平台菜单及功能数组 -- 原数据
            let UOM_MENU_TYYWGLPT = []; //统一运维管理平台菜单及功能数组
            let AUDIO_MENU_SYPSJGL_ARR = []; //视音频数据管理平台菜单及功能数组 -- 原数据
            let AUDIO_MENU_SYPSJGL = []; //视音频数据管理平台菜单及功能数组
            let SSZH_MENU_SSZHXT_ARR = []; //实时指挥系统平台菜单及功能权限数组 -- 原数据
            let SSZH_MENU_SSZHXT = []; //实时指挥系统平台菜单及功能权限数组 

            let menuList = [];
            let res = result.data;

            for (let i in res) {
                let item = {};
                item[i] = res[i];
                menuList.push(item);
            }

            // 加入首页权限模拟数据 （后台配置该权限后要删除）
            // menuList.push({
            //     "/gmvcs/home": {
            //         "INDEX_MENU_HOME": "首页",
            //         "INDEX_MENU_HOME_XGMM": "修改密码",
            //         "INDEX_MENU_HOME_EWM": "二维码",
            //         "INDEX_MENU_HOME_TCDL": "退出登录"
            //     }
            // });
             
            // console.log(menuList);
            //模拟执法仪研发日志模块权限

            // avalon.each(menuList, function (index, el) {
            //     // console.log(el);
            //     if(el["/gmvcs/mangement"]) {
            //         el["/gmvcs/mangement"].value["CAS_MENU_YFRZ"] = "R&D Log";
            //         el["/gmvcs/mangement"].value["CAS_FUNCTION_YFRZ_DOWNLOAD"] = "download";
            //         // console.log(el["/gmvcs/mangement"].value);
            //     }
                
            // });

            // menuList['/gmvcs/mangement'].value.UOM_MENU_ZFYYFRZ = "R&D Log";

            //模拟高级配置模块权限
            // avalon.each(menuList, function (index, el) {
                // if(el["/gmvcs/mangement"]) {
                    // el["/gmvcs/mangement"].value["ADVANCED_MENU_GJ"] = "Advanced";
                    // el["/gmvcs/mangement"].value["ADVANCED_MENU_CCMS"] = "Storage Mode";
                    // el["/gmvcs/mangement"].value["ADVANCED_MENU_ZFYMM"] = "BWC Pwd";
                    // el["/gmvcs/mangement"].value["ADVANCED_FUNCTION_CCMSBJ"] = "Edit";
                    // el["/gmvcs/mangement"].value["ADVANCED_FUNCTION_ZFYMMBJ"] = "Edit";
                    // el["/gmvcs/mangement"].value["ADVANCED_FUNCTION_ZFYMMCK"] = "Query";
                    // el["/gmvcs/mangement"].value["ADVANCED_MENU_SQGL"] = "License";
                    // console.log(el["/gmvcs/mangement"].value["ADVANCED_MENU_GJ"], el["/gmvcs/mangement"].value["ADVANCED_FUNCTION_ZFYMM"]);
                // }
            // });

            avalon.each(menuList, function (index, el) {
                for (let i in el) {
                    if (el.hasOwnProperty(i)) {
                        avalon.each(application_menu, function (idx, ele) {
                            if (ele.lic == i) {
                                switch (ele.lic) {
                                    // // 统一用户认证平台
                                    // case "/gmvcs/uap":
                                    //     getCasMenu(el[i], menu, CAS_MENU_TYYHRZPT, CAS_FUNC_TYYHRZPT);
                                    //     break;
                                    //     // 统一运维管理平台
                                    // case "/gmvcs/uom":
                                    //     for (let key in el[i]) {
                                    //         UOM_MENU_TYYWGLPT.push(key);
                                    //     }
                                    //     UOM_MENU_TYYWGLPT_ARR = el[i];
                                    //     // avalon.Array.merge(UOM_MENU_TYYWGLPT, el[i]);
                                    //     break;
                                    // 首页
                                    case "/gmvcs/home":
                                        for (let key in el[i].value) {
                                            INDEX_MENU.push(key);
                                        }
                                        INDEX_MENU_ARR = el[i].value;
                                        // 运维和用户认证合并权限
                                    case "/gmvcs/mangement":
                                        for (let key in el[i].value) {
                                            if(key == "ADVANCED_MENU_CCMS") {
                                                
                                            }else {
                                                UOM_MENU_TYYWGLPT.push(key);
                                            }
                                        }
                                        UOM_MENU_TYYWGLPT_ARR = el[i].value;
                                        break;
                                        // 视音频数据管理平台
                                    case "/gmvcs/audio":
                                        for (let key in el[i].value) {
                                            AUDIO_MENU_SYPSJGL.push(key);
                                        }
                                        AUDIO_MENU_SYPSJGL_ARR = el[i].value;
                                        // avalon.Array.merge(AUDIO_MENU_SYPSJGL, el[i].value);
                                        break;
                                    case "/gmvcs/instruct":
                                        for (let key in el[i].value) {
                                            SSZH_MENU_SSZHXT.push(key);
                                        }
                                        SSZH_MENU_SSZHXT_ARR = el[i].value;
                                        // avalon.Array.merge(SSZH_MENU_SSZHXT, el[i].value);
                                }
                                APP_MENU.push(ele);
                                return;
                            }
                        });
                    }
                }
            });

            MENU.APP_MENU = APP_MENU.sort(sortByIndex('index')); //APP_MENU 已授权的平台菜单
            // MENU.APP_MENU = APP_MENU; //APP_MENU 已授权的平台菜单
            MENU.INDEX_MENU = INDEX_MENU; // 首页权限key
            MENU.INDEX_MENU_ARR = INDEX_MENU_ARR; // 首页权限key:val
            MENU.CAS_MENU_TYYHRZPT = CAS_MENU_TYYHRZPT; //CAS_MENU_TYYHRZPT 统一用户认证平台菜单
            MENU.CAS_FUNC_TYYHRZPT = CAS_FUNC_TYYHRZPT; //CAS_FUNC_TYYHRZPT 统一用户认证平台各模块按钮权限数组

            MENU.UOM_MENU_TYYWGLPT_ARR = UOM_MENU_TYYWGLPT_ARR; //UOM_MENU_TYYWGLPT 统一运维管理平台菜单及功能权限数组 -- 原数据
            MENU.UOM_MENU_TYYWGLPT = UOM_MENU_TYYWGLPT; //UOM_MENU_TYYWGLPT 统一运维管理平台菜单及功能权限数组
            MENU.AUDIO_MENU_SYPSJGL_ARR = AUDIO_MENU_SYPSJGL_ARR; //AUDIO_MENU_SYPSJGL 视音频数据管理平台菜单及功能权限数组 -- 原数据
            MENU.AUDIO_MENU_SYPSJGL = AUDIO_MENU_SYPSJGL; //AUDIO_MENU_SYPSJGL 视音频数据管理平台菜单及功能权限数组
            MENU.SSZH_MENU_SSZHXT_ARR = SSZH_MENU_SSZHXT_ARR; //SSZH_MENU_SSZHXT 实时指挥系统平台菜单及功能权限数组 -- 原数据
            MENU.SSZH_MENU_SSZHXT = SSZH_MENU_SSZHXT; //SSZH_MENU_SSZHXT 实时指挥系统平台菜单及功能权限数组

            rs(MENU);
        });
    } else {
        let MENU = {}; //存储已授权菜单对象 UOM_MENU_TYYWGLPT
        MENU.UOM_MENU_TYYWGLPT = ['UOM_MENU_SQGL'];
        rs(MENU);
    }
});

/**
 *  排序
 *
 * @param {*} prop 根据prop属性进行排序
 * @returns
 */
function sortByIndex(prop) {
    return function (a, b) {
        var v1 = a[prop];
        var v2 = b[prop];
        if (!isNaN(Number(v1)) && !isNaN(Number(v2))) {
            v1 = Number(v1);
            v2 = Number(v2);
        }
        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else {
            return 0;
        }
    };
}


// 获取已授权的菜单，用于动态改变系统平台的title
const sysMenu = new Promise((rs, rj) => {
    if (storage.getItem('license') == 'none') {
        rs({})
        return
    }
    let menu = {};
    let uid = storage.getItem('uid');

    // 获取当前登录用户的快捷菜单
    ajax({
        url: '/gmvcs/uap/shortcut/getByUid?uid=' + uid,
        method: 'get',
        data: {}
    }).then(result => {
        if (0 !== result.code) {
            notification.warn({
                message: 'Server backend error, please contact administrator.',
                title: 'Tips'
            });
            return;
        }

        // let bsList = [];
        let sysList = [];
        avalon.each(result.data, function (k, v) {
            if ('APPLICATION' == v.model) {
                // bsList.push(v);
            } else {
                sysList.push(v);
            }
        });

        // menu.bsList = bsList; // 已授权应用菜单
        menu.sysList = sysList; // 已授权系统菜单
        rs(menu);
    });
});

/** remote_menu：请求获取的菜单数组， native_menu：本地创建的菜单（数组）， output_cas_menu：遍历处理后的二级菜单（数组），output_fun_menu：模块按钮的功能菜单（数组）,可不传 **/
function getCasMenu(cas_menu, native_menu, output_cas_menu, output_fun_menu) {
    let remote_menu = [];
    let list = [];
    for (let key in cas_menu) {
        remote_menu.push(key);
    }
    avalon.each(native_menu, function (k, v) {
        avalon.each(remote_menu, function (kk, vv) {
            if (v.lic == vv) {
                let child_list = [];
                if (!v.hasOwnProperty("children") || 0 == v.children.length) {

                } else {
                    avalon.each(v.children, function (i, item) {
                        avalon.each(remote_menu, function (j, el) {
                            if (el == item.lic) {
                                if (cas_menu[item.lic])
                                    item.title = cas_menu[item.lic];
                                child_list.push(item);
                                return;
                            }
                        });
                        v.children = child_list;
                    });
                }
                if (cas_menu[v.lic])
                    v.title = cas_menu[v.lic];
                avalon.Array.ensure(output_cas_menu, v);
                avalon.Array.ensure(list, vv);
                return;
            }
        });
    });
    if ("undefined" != typeof output_fun_menu) {
        avalon.each(list, function (key, val) {
            avalon.Array.remove(remote_menu, val);
        });
        avalon.Array.merge(output_fun_menu, remote_menu);
    }
}

function travelMenu(menulet, functions, allowedFunctions) {
    if (!menulet) {
        return;
    }
    for (let i = 0, item; item = menulet[i++];) {
        let hasPermission = false;
        for (let j = 0, func; func = functions[j++];) {
            if (func.code === item.name && (allowedFunctions[func.code])) {
                item.uri = func.uri || item.uri || 'javascript:;';
                item.icon = func.icon_url || item.icon;
                item.target = item.target || '_self';
                item.children = item.children || [];
                item.opened = false;
                hasPermission = true;
                break;
            }
            if (allowedFunctions['all']) {
                hasPermission = true;
            }
        }
        item.show = hasPermission === true;

        travelMenu(item.children, functions, allowedFunctions);
    }
}

function walkMenu(menu, key, process, level = 1) {
    let finded = false;
    for (let i = 0; i < menu.length; i++) {
        const item = menu[i];
        process(item);
        if (item.key === key) {
            finded = true;
            break;
        }
        if (item.children && walkMenu(item.children, key, process, level + 1)) {
            finded = true;
            break;
        }
        process('', true);
    };
    return finded;
}

function getKeyPath(key) {
    return menuPromise.then((menu) => {
        const keyPath = [];

        walkMenu(menu.toJSON ? menu.toJSON() : menu, key, function (item, shift) {
            if (shift) {
                keyPath.shift();
            } else {
                keyPath.unshift(item);
            }
        });

        return keyPath;
    });
}
export {
    getKeyPath,
    menuPromise as menu,
    menubar,
    sysMenu
};