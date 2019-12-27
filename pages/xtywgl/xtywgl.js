// 公共引用部分，兼容IE8
import '/apps/common/common';
import './xtywgl.less';
import '/apps/common/common-index';
import * as menuService from '../../services/menuService';
import {
    applyRouteConfig
} from '/services/pagesRouterServer';
import {
    copyRight,
    telephone,
    languageSelect
} from '/services/configService';
let language_txt = require('../../vendor/language').language;

let storage = require('../../services/storageService').ret;
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames') || [];
require('/apps/common/common-layout');

/**
 * 
 * 模块Management
 * 
 * 
 */
var root = avalon.define({
    $id: 'xtywgl_vm',
    currentPage: '',
    management_language: language_txt.xtywgl, //多语言
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: 'Mangement',
    roleShow: false,
    year: (new Date()).getFullYear(),

    demsMenu: get_menu(), //权限过滤后的菜单

    flag_jtwfkp: false,
    // show_player: playerConfig,

    //李春升common-layout组件所需方法和属性
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

window.addEventListener("hashchange", myFunction);
function myFunction() {
    if(window.location.hash == '#!/xtywgl-gjpz-index-ccms') {
        root.completed = false;
        get_menu('add_ccms','gjpz');
        avalon.scan(document.body);
    }else if(window.location.hash == '#!/xtywgl-gjpz-index-zfymm' || window.location.hash == '#!/xtywgl-gjpz-index-sqgl') {
        root.completed = false;
        get_menu('delete_ccms','gjpz');
        avalon.scan(document.body);
    } else {
        get_menu('delete_ccms');
        avalon.scan(document.body);
    }
}

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;

    if (!sysList || sysList.length == 0) {
        if (languageSelect == "en") {
            document.title = "Management";
            root.titleName = "Management";
        } else {
            document.title = "运维中心";
            root.titleName = "运维中心";
        }
    }

    avalon.each(sysList, (key, val) => {
        if (/^\/xtywgl.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

function get_menu(addOrDelete,isGjpz) {
    let list = [{
            key: 'xtywgl-xtpzgl-yhgl',
            title: language_txt.xtywgl.zzjggl.title,
            url: '/xtywgl-xtpzgl-yhgl',
            lic: "CAS_MENU_ORGANIZATION"
        },
        {
            key: 'xtywgl-xtpzgl-gnqx',
            title: language_txt.xtywgl.jsgl.title,
            url: '/xtywgl-xtpzgl-gnqx',
            lic: "CAS_MENU_GNQX"
        },
        {
            key: 'xtywgl-sbzygl-index',
            title: language_txt.xtywgl.zfjlygl.title,
            lic: 'UOM_MENU_SBZYGL_ZFJLYGL',
            // url: '/xtywgl-sbzygl-zfygl'
            showChildren: true,
            childrenArray: [{
                    key: 'xtywgl-sbzygl-index-zfygl',
                    title: language_txt.xtywgl.zfjlygl.title1,
                    lic: 'UOM_MENU_SBZYGL_ZFJLYGL_ZFJLYGL',
                    url: '/xtywgl-sbzygl-index-zfygl'
                },
                {
                    key: 'xtywgl-sbzygl-index-sjbgl',
                    title: language_txt.xtywgl.zfjlygl.title2,
                    lic: 'UOM_MENU_SBZYGL_ZFJLYGL_SJBGL',
                    url: '/xtywgl-sbzygl-index-sjbgl'
                },
                {
                    key: 'xtywgl-sbzygl-index-sbsjzt',
                    title: language_txt.xtywgl.zfjlygl.title3,
                    lic: "UOM_MENU_SBZYGL_ZFJLYGL_SJBJL",
                    url: '/xtywgl-sbzygl-index-sbsjzt'
                }
            ],
        },
        {
            key: 'xtywgl-bygl',
            title: '本域管理',
            url: '/xtywgl-bygl',
            lic: "UOM_MENU_BYGL"
        },
        {
            key: 'xtywgl-cjgzz-index',
            title: language_txt.xtywgl.cjgzzgl.title,
            lic: 'UOM_MENU_SBZYGL_CJGZZGL',
            // url: '/xtywgl-sbzygl-cjgzzgl',
            showChildren: true,
            childrenArray: [{
                    key: 'xtywgl-cjgzz-index-cjgzzgl',
                    title: language_txt.xtywgl.cjgzzgl.title1,
                    // lic: 'UOM_MENU_SBZYGL_CJGZZGL',
                    lic: 'UOM_MENU_SBZYGL_CJGZZGL_CJZSBGL',
                    url: '/xtywgl-cjgzz-index-cjgzzgl'
                },
                {
                    key: 'xtywgl-cjgzz-index-sjbgl',
                    title: language_txt.xtywgl.cjgzzgl.title2,
                    // lic: 'UOM_MENU_SBZYGL_CJGZZGL',
                    lic: 'UOM_MENU_SBZYGL_CJGZZGL_SJBGL',
                    url: '/xtywgl-cjgzz-index-sjbgl'
                },
                {
                    key: 'xtywgl-cjgzz-index-sbsjzt',
                    title: language_txt.xtywgl.cjgzzgl.title3,
                    // lic: "UOM_MENU_SBZYGL_CJGZZGL",
                    lic: "UOM_MENU_SBZYGL_CJGZZGL_SJZT",
                    url: '/xtywgl-cjgzz-index-sbsjzt'
                }
            ],
        },
        // {
        //     key: 'xtywgl-',
        //     title: language_txt.xtywgl.xtjk.title,
        //     lic: 'UOM_MENU_CCFWGL_WJSCFW',
        //     url: '/xtywgl-'        
        // },              
        // {
        //     key: 'xtywgl-ccfwgl-index',
        //     title: language_txt.xtywgl.ccgl.title,
        //     lic: 'UOM_MENU_CCFWGL',
        //     url: '/xtywgl-ccfwgl-index'
        // },
        {
            key: 'xtywgl-ccfwgl-index',
            title: language_txt.xtywgl.ccgl.title,
            lic: 'UOM_MENU_CCFWGL',
            showChildren: true,
            childrenArray:[
                {
                    key: 'xtywgl-ccfwgl-index',
                    title: language_txt.xtywgl.ccgl.videoStorage,
                    lic: 'UOM_MENU_CCFWGL_ZFYLXFW',
                    url: '/xtywgl-ccfwgl-index'
                },{
                    key: 'xtywgl-ccfwgl-index-cjzscfwgl',
                    title: language_txt.xtywgl.ccgl.fileUpload,
                    lic: 'UOM_MENU_CCFWGL_WJSCFW',
                    url: '/xtywgl-ccfwgl-index-cjzscfwgl'
                }
            ],
            // url: '/xtywgl-ccfwgl-index'
        },
        // {
        //     key: 'xtywgl-ccfwgl-index',
        //     title: language_txt.xtywgl.ccgl.title,
        //     lic: 'UOM_MENU_CCFWGL_WJSCFW',
        //     url: '/xtywgl-ccfwgl-index'            
        // },
        {
            key: 'xtywgl-xtpzgl-czrz',
            title: language_txt.xtywgl.czrz.title,
            url: '/xtywgl-xtpzgl-czrz',
            lic: "CAS_MENU_CZRZ"
        },
        {
            key: 'xtywgl-zfyyfrz',
            title: language_txt.xtywgl.zfyyfrz.title,
            url: '/xtywgl-zfyyfrz',
            lic: "CAS_MENU_YFRZ"
        },
        {
            key: 'xtywgl-sqgl-index',
            title: language_txt.xtywgl.sqgl.title,
            lic: 'UOM_MENU_SQGL',
            url: '/xtywgl-sqgl-index'
        },
        {
            key: 'xtywgl-gjpz-index',
            title: language_txt.xtywgl.gjpz.title,
            lic: 'ADVANCED_MENU_GJ',
            showChildren: true,
            childrenArray: [{
                    key: 'xtywgl-gjpz-index-ccms',
                    title: language_txt.xtywgl.gjpz.title1,
                    lic: 'ADVANCED_MENU_CCMS',
                    url: '/xtywgl-gjpz-index-ccms'
                },{
                    key: 'xtywgl-gjpz-index-zfymm',
                    title: language_txt.xtywgl.gjpz.title2,
                    lic: 'ADVANCED_MENU_ZFYMM',
                    url: '/xtywgl-gjpz-index-zfymm'
                },{
                    key: 'xtywgl-gjpz-index-sqgl',
                    title: language_txt.xtywgl.gjpz.title3,
                    lic: "ADVANCED_MENU_SQGL",
                    url: '/xtywgl-gjpz-index-sqgl'
                }
            ],
        }
        
    ];

    menuService.menu.then(menu => {
        // avalon.log(JSON.stringify(menu.UOM_MENU_TYYWGLPT));
        let remote_list = menu.UOM_MENU_TYYWGLPT; //统一运维管理平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组
        let output_list = []; //已授权的菜单map数组

        if(addOrDelete) {
            if(addOrDelete == 'add_ccms') {
                remote_list.push('ADVANCED_MENU_CCMS');
            }else if(addOrDelete == 'delete_ccms') {
                var ccms_index = remote_list.indexOf("ADVANCED_MENU_CCMS");
                if (ccms_index > -1) {
                    remote_list.splice(ccms_index, 1);
                }
            }
        } else {
            if(window.location.hash == '#!/xtywgl-gjpz-index-ccms') {
                remote_list.push('ADVANCED_MENU_CCMS');
            }
        }

        avalon.each(remote_list, function (index, el) {
            if (/^UOM_MENU_/.test(el) || /^CAS_MENU_/.test(el) || /^ADVANCED_MENU_/.test(el)) {
                avalon.Array.ensure(get_list, el);
            }
        });

        avalon.each(list, function (index, el) {
            avalon.each(get_list, function (idx, ele) {
                if (ele == el.lic) { //一级菜单lic验证
                    let child_list = [];
                    if (!el.hasOwnProperty("childrenArray") || 0 == el.childrenArray.length) {} else {
                        avalon.each(el.childrenArray, function (k, v) { //二级菜单lic验证
                            avalon.each(get_list, function (kk, vv) {
                                let child_child_list = [];
                                if (vv == v.lic) {
                                    if (menu.UOM_MENU_TYYWGLPT_ARR[v.lic])
                                        v.title = menu.UOM_MENU_TYYWGLPT_ARR[v.lic];
                                    child_list.push(v);
                                    // avalon.Array.ensure(child_list, v);
                                    if (!v.hasOwnProperty("childrenArray") || 0 == v.childrenArray.length) {} else {
                                        avalon.each(v.childrenArray, function (i, j) { //三级菜单lic验证
                                            avalon.each(get_list, function (ii, jj) {
                                                if (jj == j.lic) {
                                                    if (menu.UOM_MENU_TYYWGLPT_ARR[j.lic]) {
                                                        j.title = menu.UOM_MENU_TYYWGLPT_ARR[j.lic];
                                                    }
                                                    child_child_list.push(j);
                                                    return;
                                                }
                                            })
                                        })
                                        child_list[child_list.length - 1].childrenArray = child_child_list;
                                    }
                                    return;
                                }
                            });
                            el.childrenArray = child_list;
                        });
                    }
                    if (menu.UOM_MENU_TYYWGLPT_ARR && menu.UOM_MENU_TYYWGLPT_ARR[el.lic]) {
                        el.title = menu.UOM_MENU_TYYWGLPT_ARR[el.lic];
                    }
                    avalon.Array.ensure(output_list, el);
                    return;
                }
            });
        });

        // test
        //运维中心
        // remote_list.splice(20,1);
        // remote_list.splice(37,1);
        // console.log(output_list);
        // console.log(list);
        //设置菜单名称
        for (let listIndex = 0; listIndex < output_list.length; listIndex++) {
            if (output_list[listIndex].lic == "CAS_MENU_ORGANIZATION") {
                output_list[listIndex].title = language_txt.xtywgl.zzjggl.title;
            } else if (output_list[listIndex].lic == "CAS_MENU_GNQX") {
                output_list[listIndex].title = language_txt.xtywgl.jsgl.title;
            } else if (output_list[listIndex].lic == "UOM_MENU_SBZYGL_ZFJLYGL") {
                output_list[listIndex].title = language_txt.xtywgl.zfjlygl.title;
            } else if (output_list[listIndex].lic == "UOM_MENU_SBZYGL_CJGZZGL") {
                output_list[listIndex].title = language_txt.xtywgl.cjgzzgl.title;
            } else if (output_list[listIndex].lic == "CAS_MENU_CZRZ") {
                output_list[listIndex].title = language_txt.xtywgl.czrz.title;
            } else if (output_list[listIndex].lic == "UOM_MENU_SQGL") {
                output_list[listIndex].title = language_txt.xtywgl.sqgl.title2;
            } else if (output_list[listIndex].lic == "UOM_MENU_BYGL") {
                output_list[listIndex].title = language_txt.xtywgl.bygl.title;
            } else if (output_list[listIndex].lic == "UOM_MENU_CCFWGL") {
                output_list[listIndex].title = language_txt.xtywgl.ccgl.title;
            } else if (output_list[listIndex].lic == "CAS_MENU_YFRZ") {
                output_list[listIndex].title = language_txt.xtywgl.zfyyfrz.title;
            } else if (output_list[listIndex].lic == "ADVANCED_MENU_GJ") {
                output_list[listIndex].title = language_txt.xtywgl.gjpz.title;
            }
        }

        for (let childIndex = 0; childIndex < list.length; childIndex++) {
            if (list[childIndex].childrenArray) {
                for (let childIndex2 = 0; childIndex2 < list[childIndex].childrenArray.length; childIndex2++) {
                    if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_ZFJLYGL_ZFJLYGL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.zfjlygl.title1;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_ZFJLYGL_SJBGL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.zfjlygl.title2;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_ZFJLYGL_SJBJL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.zfjlygl.title3;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_CJGZZGL_CJZSBGL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.cjgzzgl.title1;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_CJGZZGL_SJBGL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.cjgzzgl.title2;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_SBZYGL_CJGZZGL_SJZT") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.cjgzzgl.title3;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_CCFWGL_ZFYLXFW") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.ccgl.videoStorage;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "UOM_MENU_CCFWGL_WJSCFW") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.ccgl.fileUpload;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "ADVANCED_MENU_CCMS") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.gjpz.title1;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "ADVANCED_MENU_ZFYMM") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.gjpz.title2;
                    } else if (list[childIndex].childrenArray[childIndex2].lic == "ADVANCED_MENU_SQGL") {
                        list[childIndex].childrenArray[childIndex2].title = language_txt.xtywgl.gjpz.title3;
                    }
                }
            }
        }

        // let UOM_MENU_CCFWGL_ZFYLXFW = remote_list.indexOf('UOM_MENU_CCFWGL_ZFYLXFW'); //音频存储
        // let UOM_MENU_CCFWGL_WJSCFW = remote_list.indexOf('UOM_MENU_CCFWGL_WJSCFW'); //文件上传
        // if (UOM_MENU_CCFWGL_ZFYLXFW > 0) {
        //     avalon.each(output_list, function (idx, ele) {
        //         if (ele.lic === 'UOM_MENU_CCFWGL') {
        //             output_list[idx] = {
        //                 key: 'xtywgl-ccfwgl-index',
        //                 title: language_txt.xtywgl.ccgl.title,
        //                 lic: 'UOM_MENU_CCFWGL_ZFYLXFW',
        //                 url: '/xtywgl-ccfwgl-index'
        //             }
        //         }
        //     });
        // } else if (UOM_MENU_CCFWGL_WJSCFW > 0) {
        //     avalon.each(output_list, function (idx, ele) {
        //         if (ele.lic === 'UOM_MENU_CCFWGL') {
        //             output_list[idx] = {
        //                 key: 'xtywgl-ccfwgl-index',
        //                 title: language_txt.xtywgl.ccgl.title,
        //                 lic: 'UOM_MENU_CCFWGL_WJSCFW',
        //                 url: '/xtywgl-ccfwgl-cjzscfwgl'
        //             }
        //         }
        //     });
        // }
        //权限菜单       
        root.demsMenu = output_list;

        root.completed = true;

        //修改高级配置三级菜单位置
        if(addOrDelete && isGjpz) {
            $('.common-layout .layout-container').css({
                "top": "144px",
                "left": "148px"
            });
        }
        
    });
}

//处理ie8由于flash导致页面title变化的问题
let originalTitle = document.title;
avalon.bind(document, 'propertychange', function (event) {
    if (event.propertyName === 'title' && document.title && document.title.indexOf('#') !== -1) {
        setTimeout(function () {
            document.title = originalTitle;
        }, 0);
    }
})

// if ('none' == storage.getItem('license')) {
//     root.licenseStatus = false;
// } else {
//     root.licenseStatus = true;
//     if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
//         storage.clearAll();
//         global.location.href = '/main-login.html';
//     }
// }
//===================================================================================================
//菜单配置文件

// 运维中心

// 路由配置文件
export const routeConfig = [
    //===================================3.7版本的运维中心 URL===start============================================================================
    {
        path: '/xtywgl-xtpzgl-yhgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-xtpzgl-yhgl', resolve);
        }
    },
    {
        path: '/xtywgl-xtpzgl-gnqx',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-xtpzgl-gnqx', resolve);
        }
    },
    {
        path: '/xtywgl-sbzygl-index-zfygl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sbzygl-index-zfygl', resolve);
        }
    },
    {
        path: '/xtywgl-bygl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-bygl', resolve);
        }
    },
    {
        path: '/xtywgl-sbzygl-index-sjbgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sbzygl-index-sjbgl', resolve);
        }
    },
    {
        path: '/xtywgl-sbzygl-index-sbsjzt',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sbzygl-index-sbsjzt', resolve);
        }
    },
    {
        path: '/xtywgl-cjgzz-index-cjgzzgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-cjgzz-index-cjgzzgl', resolve);
        }
    },
    {
        path: '/xtywgl-cjgzz-index-sjbgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-cjgzz-index-sjbgl', resolve);
        }
    },
    {
        path: '/xtywgl-cjgzz-index-sbsjzt',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-cjgzz-index-sbsjzt', resolve);
        }
    },
    {
        path: '/xtywgl-sbxhgl-cjzxhgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sbxhgl-cjzxhgl', resolve);
        }
    },
    {
        path: '/xtywgl-ccfwgl-index',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-ccfwgl-index', resolve);
        }
    },
    {
        path: '/xtywgl-ccfwgl-index-cjzscfwgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-ccfwgl-cjzscfwgl', resolve);
        }
    },
    {
        path: '/xtywgl-xtpzgl-czrz',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-xtpzgl-czrz', resolve);
        }
    },
    {
        path: '/xtywgl-zfyyfrz',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-zfyyfrz', resolve);
        }
    },
    {
        path: '/xtywgl-sqgl-index',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sqgl-index', resolve);
        }
    },
    {
        path: '/xtywgl-gjpz-index-ccms',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-gjpz-index-ccms', resolve);
        }
    },
    {
        path: '/xtywgl-gjpz-index-zfymm',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-gjpz-index-zfymm', resolve);
        }
    },
    {
        path: '/xtywgl-gjpz-index-sqgl',
        component(resolve) {
            require.async('/apps/xtywgl/xtywgl-sqgl-index', resolve);
        }
    }
    //===================================3.7版本的运维中心 URL===end============================================================================

];

applyRouteConfig(routeConfig, {
    name: 'xtywgl_vm'
});
// history
avalon.history.start({
    root: "/",
    fireAnchor: false
});
avalon.scan(document.body);