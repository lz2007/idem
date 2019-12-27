// 公共引用部分，兼容IE8
import '/apps/common/common';
import './tyywglpt.css';
import '/apps/common/common-index';
import 'ane';
import * as menuService from '../../services/menuService';
import {
    copyRight,
    telephone
} from '/services/configService';
let {
    routerserver
} = require('/services/routerService');
let storage = require('../../services/storageService').ret;
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');

avalon.effect('collapse', {
    enter: function (el, done) {
        $(el).prev().removeClass('shrink').addClass('open');
        $(el).slideDown(200, done);
    },
    leave: function (el, done) {
        $(el).prev().removeClass('open').addClass('shrink');
        $(el).slideUp(200, done);
    }
});
//isWindowNav用来判断是通过浏览器的导航栏使hash变化的，还是通过点击侧边栏的a标签使hash变化的。
let isWindowNav = false;
var root = avalon.define({
    $id: 'tyywglpt_vm',
    currentPage: '',
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: '运维管理系统',
    firstRoleName: '',
    roleShow: false,
    year: (new Date()).getFullYear() + 1,
    lastKey: window.location.hash ? window.location.hash.slice(2).match(/-([a-z]+)-/)[1] : 'sbzygl',
    locationKey: window.location.hash ? window.location.hash.slice(2) : '/tyywglpt-sbzygl-zfygl',
    menu: get_menu(),
    selectedKeys: [],
    openKeys: [''],
    licenseStatus: true,
    clickMenu(item) {
        item.action = item.action == 'enter' ? 'leave' : 'enter';
    },
    menuliClick(itemli, url) {
        if (!url) {
            return;
        }
        this.locationKey = url;
        isWindowNav = false; //点击侧边栏不需要改变lastKey，一级菜单根据点击情况展开
        // avalon.router.navigate(url, 2);
    },
    handleMenuClick(item, key, keyPath) {
        avalon.router.navigate(item.url, 2);
    },
    handleOpenChange() {
        // alert(0)
    }
});

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    avalon.each(sysList, (key, val) => {
        if (/^\/tyywglpt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

if (roleNames) {
    root.firstRoleName = roleNames[0];
    if (root.roleNames.length == 0) {
        roleNames.push(' - ');
    }
    if (root.roleNames.length > 1) {
        root.roleShow = true;
    }
}


//监听root.lastKey
root.$watch('lastKey', (v) => {
    root.menu = get_menu();
});

//router server
routerserver('tyywglpt_vm');

function get_menu() {
    let lastKey = window.location.hash ? window.location.hash.slice(2).match(/-([a-z]+)-/)[1] : 'sbzygl';
    let list = [{
            key: 'sbzygl',
            title: '设备资源管理',
            icon: 'sbzrgltb',
            lic: 'UOM_MENU_SBZYGL', // lic 授权校验字段
            action: ((lastKey === 'sbzygl' || lastKey === 'sbxhgl') ? 'enter' : 'leave'),
            children: [{
                key: 'zfygl',
                title: '执法记录仪管理',
                lic: 'UOM_MENU_SBZYGL_ZFJLYGL',
                url: '/tyywglpt-sbzygl-zfygl',
                active: true
            }, {
                key: 'cjgzzgl',
                title: '采集工作站管理',
                lic: 'UOM_MENU_SBZYGL_CJGZZGL',
                url: '/tyywglpt-sbzygl-cjgzzgl',
                active: false
            }, {
                key: 'dlspcjsbgl',
                title: '多路视频采集设备管理',
                lic: 'UOM_MENU_SBZYGL_DLSPCJSBGL',
                url: '/tyywglpt-sbzygl-dlspcjsbgl',
                active: false
            }, {
                key: 'sbxhgl',
                title: '设备型号管理',
                lic: 'UOM_MENU_SBZYGL_SBXHGL',
                action: (lastKey === 'sbxhgl' ? 'enter' : 'leave'),
                children: [{
                    key: 'zfyxhgl',
                    title: '执法记录仪',
                    lic: 'UOM_MENU_SBZYGL_SBXHGL_ZFJLY',
                    url: '/tyywglpt-sbxhgl-zfyxhgl',
                    active: false
                }, {
                    key: 'cjzxhgl',
                    title: '采集工作站',
                    lic: 'UOM_MENU_SBZYGL_SBXHGL_CJGZZ',
                    url: '/tyywglpt-sbxhgl-cjzxhgl',
                    active: false
                }]
            }]
        },
        {
            key: 'ptjlgl',
            title: '平台级联管理',
            icon: 'ptjlgltb',
            lic: 'UOM_MENU_PTJLGL',
            action: (lastKey === 'ptjlgl' ? 'enter' : 'leave'),
            children: [{
                    key: 'ptjlgl',
                    title: '平台级联管理',
                    lic: 'UOM_MENU_PTJLGL',
                    url: '/tyywglpt-ptjlgl-index',
                    active: false
                }
            ]
        },
        {
            key: 'ccfwgl',
            title: '存储服务管理',
            icon: 'ccfwgltb',
            lic: 'UOM_MENU_CCFWGL',
            action: (lastKey === 'ccfwgl' ? 'enter' : 'leave'),
            children: [{
                key: 'cjzscfwgl',
                title: '文件上传服务',
                lic: 'UOM_MENU_CCFWGL_WJSCFW',
                url: '/tyywglpt-ccfwgl-cjzscfwgl',
                active: false
            }, {
                key: 'khdscfwgl',
                title: '客户端上传服务管理',
                lic: 'UOM_MENU_KHDSCFWGL',
                url: '/tyywglpt-ccfwgl-khdscfwgl',
                active: false
            }, {
                key: 'baqlxfwgl',
                title: '办案区录像服务管理',
                lic: 'UOM_MENU_BAQLXFWGL',
                url: '/tyywglpt-ccfwgl-baqlxfwgl',
                active: false
            }, {
                key: '4gzfylxfwgl',
                title: '执法记录仪录像服务',
                // lic: 'UOM_MENU_4GZFYLXFWGL',
                lic: 'UOM_MENU_CCFWGL_ZFYLXFW',
                url: '/tyywglpt-ccfwgl-4gzfylxfwgl',
                active: false
            }]
        }, {
            key: 'rwgl',
            title: '系统任务管理',
            icon: 'rwgltb',
            lic: 'UOM_MENU_XTRWGL',
            action: (lastKey === 'rwgl' ? 'enter' : 'leave'),
            children: [{
                key: 'sjscrw',
                title: '文件上传任务',
                lic: 'UOM_MENU_XTRWGL_WJSCRW',
                url: '/tyywglpt-rwgl-sjscrw',
                active: false
            }, {
                key: 'zdglfw',
                title: '自动关联服务',
                lic: 'UOM_MENU_XTRWGL_ZDGLFW',
                url: '/tyywglpt-rwgl-zdglfw',
                active: false
            }, {
                key: 'lxxzrw',
                title: '录像下载任务',
                lic: 'UOM_MENU_RWGL_LXXZRW',
                url: '/tyywglpt-rwgl-lxxzrw',
                active: false
            }, {
                key: 'sslxrw',
                title: '实时录像任务',
                lic: 'UOM_MENU_RWGL_SSLXRW',
                url: '/tyywglpt-rwgl-sslxrw',
                active: false
            }]
        },
        /*{
                key: 'bacspz',
                title: '办案场所配置',
                icon: 'sbzrgltb',
                lic: 'UOM_MENU_SBZYGL', // lic 授权校验字段
                action: (lastKey === 'bacspz' ?  'enter' : 'leave'),
                children: [{
                    key: 'baq',
                    title: '办案区',
                    lic: 'UOM_MENU_ZFYGL',
                    url: '/tyywglpt-bacspz-baq',
                    active: true
                }, {
                    key: 'gns',
                    title: '功能室',
                    lic: 'UOM_MENU_CJGZZGL',
                    url: '/tyywglpt-bacspz-gns',
                    active: false
                }]
            },*/
        {
            key: 'sjgl',
            title: '远程升级管理',
            lic: 'UOM_MENU_YCSJGL',
            icon: 'sjgltb',
            action: ((lastKey === 'sjgl' || lastKey === 'sjbgl') ? 'enter' : 'leave'),
            children: [{
                key: 'sbsjrz',
                title: '设备升级状态',
                lic: 'UOM_MENU_YCSJGL_SBSJZT',
                url: '/tyywglpt-sjgl-sbsjrz',
                active: false
            }, {
                key: 'sjbgl',
                title: '升级包管理',
                lic: 'UOM_MENU_YCSJGL_SJBGL',
                action: (lastKey === 'sjbgl' ? 'enter' : 'leave'),
                children: [{
                    key: 'zfysjbgl',
                    title: '执法记录仪',
                    lic: 'UOM_MENU_YCSJGL_SJBGL_ZFJLY',
                    url: '/tyywglpt-sjbgl-zfysjbgl',
                    active: false
                }, {
                    key: 'cjzsjbgl',
                    title: '采集工作站',
                    lic: 'UOM_MENU_YCSJGL_SJBGL_CJGZZ',
                    url: '/tyywglpt-sjbgl-cjzsjbgl',
                    active: false
                }]
            }]
        },
        {
            key: 'sqgl',
            title: '授权管理',
            lic: 'UOM_MENU_SQGL',
            icon: 'sqgltb',
            url: '/tyywglpt-sqgl-index'
        }
    ];
    menuService.menu.then(menu => {
        // avalon.log(JSON.stringify(menu.UOM_MENU_TYYWGLPT));
        let remote_list = menu.UOM_MENU_TYYWGLPT; //统一运维管理平台已授权的所有菜单及功能权限数组
        let get_list = []; //过滤出来的一级菜单数组
        let output_list = []; //已授权的菜单map数组

        avalon.each(remote_list, function (index, el) {
            if (/^UOM_MENU_/.test(el))
                avalon.Array.ensure(get_list, el);
        });
        avalon.each(list, function (index, el) {
            avalon.each(get_list, function (idx, ele) {
                if (ele == el.lic) { //一级菜单lic验证
                    let child_list = [];
                    if (!el.hasOwnProperty("children") || 0 == el.children.length) {} else {
                        avalon.each(el.children, function (k, v) { //二级菜单lic验证
                            avalon.each(get_list, function (kk, vv) {
                                let child_child_list = [];
                                if (vv == v.lic) {
                                    if (menu.UOM_MENU_TYYWGLPT_ARR[v.lic])
                                        v.title = menu.UOM_MENU_TYYWGLPT_ARR[v.lic];
                                    child_list.push(v);
                                    // avalon.Array.ensure(child_list, v);
                                    if (!v.hasOwnProperty("children") || 0 == v.children.length) {} else {
                                        avalon.each(v.children, function (i, j) { //三级菜单lic验证
                                            avalon.each(get_list, function (ii, jj) {
                                                if (jj == j.lic) {
                                                    if (menu.UOM_MENU_TYYWGLPT_ARR[j.lic])
                                                        j.title = menu.UOM_MENU_TYYWGLPT_ARR[j.lic];
                                                    child_child_list.push(j);
                                                    return;
                                                }
                                            })
                                        })
                                        child_list[child_list.length - 1].children = child_child_list;
                                    }
                                    return;
                                }
                            });
                            el.children = child_list;
                        });
                    }
                    if (menu.UOM_MENU_TYYWGLPT_ARR[el.lic])
                        el.title = menu.UOM_MENU_TYYWGLPT_ARR[el.lic];
                    avalon.Array.ensure(output_list, el);
                    return;
                }
            });
        });
        root.menu = output_list;
        var menudata = root.menu.filter((n) => {
            return n.key == root.lastKey || (n.children && n.children.filter(m => m.key == root.lastKey).length);
        });
        if (menudata.length) {
            if (!menudata[0].children || menudata[0].children.filter((n) => {
                    return n.url == root.locationKey || (n.children && n.children.filter(m => m.url == root.locationKey).length);
                }).length) {

            } else { // 默认选中第一项菜单
                let url = '',
                    key = '';
                if (root.menu[0].url) { //仅一级
                    url = root.menu[0].url;
                    key = root.menu[0].key;
                } else if (root.menu[0].children[0].url) { //二级
                    url = root.menu[0].children[0].url;
                    key = root.menu[0].key;
                } else if (root.menu[0].children[0].children[0].url) { //三级
                    url = root.menu[0].children[0].children[0].url;
                    key = root.menu[0].children[0].key;
                }
                avalon.history.setHash(url);
                root.locationKey = url;
                root.lastKey = key;
            }
        } else { // 默认选中第一项菜单
            let url = '',
                key = '';
            if (root.menu[0].url) {
                url = root.menu[0].url;
                key = root.menu[0].key;
            } else if (root.menu[0].children[0].url) {
                url = root.menu[0].children[0].url;
                key = root.menu[0].key;
            } else if (root.menu[0].children[0].children[0].url) {
                url = root.menu[0].children[0].children[0].url;
                key = root.menu[0].children[0].key;
            }
            avalon.history.setHash(url);
            root.locationKey = url;
            root.lastKey = key;
        }
    });
}

avalon.bind(window, 'hashchange', (e) => {
    if (isWindowNav) {
        //点击浏览器导航栏的前进后退，需要改变lastKey，只展开当前页面的一级菜单
        root.locationKey = window.location.hash ? window.location.hash.slice(2) : '/tyywglpt-sbzygl-zfygl';
        root.lastKey = window.location.hash ? window.location.hash.slice(2).match(/-([a-z]+)-/)[1] : 'sbzygl';
    }
    isWindowNav = true;
});

//处理ie8由于flash导致页面title变化的问题
let originalTitle = document.title;
avalon.bind(document, 'propertychange', function (event) {
    if (event.propertyName === 'title' && document.title && document.title.indexOf('#') !== -1) {
        setTimeout(function () {
            document.title = originalTitle;
        }, 0);
    }
})

// setTimeout(() => {
//     $(window).resize(function () { //监测浏览器发生大小变化
//         let $header = $('.tyywglpt-list-header');
//         let $content = $('.tyywglpt-list-content');
//         if ($content.get(0).offsetHeight < $content.get(0).scrollHeight - 1) {
//             $header.css({
//                 'padding-right': '17px'
//             });
//         } else {
//             $header.css({
//                 'padding-right': '0'
//             });
//         }
//     });
// }, 1000);

// history
avalon.history.start({
    root: "/",
    fireAnchor: false
});

if ('none' == storage.getItem('license')) {
    root.licenseStatus = false;
} else {
    root.licenseStatus = true;
    if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
        storage.clearAll();
        global.location.href = '/main-login.html';
    }
}
avalon.scan(document.body);