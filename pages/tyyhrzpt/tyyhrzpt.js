// 公共引用部分，兼容IE8
require('/apps/common/common');
let {
    routerserver
} = require('/services/routerService');

let {
    breadcrumb
} = require('/services/storeService');
import {copyRight, telephone} from '/services/configService';
import * as menuService from '/services/menuService';
let storage = require('../../services/storageService').ret;
let userName = storage.getItem('userName');
let orgName = storage.getItem('orgName');
let roleNames = storage.getItem('roleNames');
if ( userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
    storage.clearAll();
    global.location.href = '/main-login.html';
}
const root = avalon.define({
    // ==============
    $id: 'root',
    currentPage: '',
    breadcrumb: [],
    // ==============
    toggle: false,
    role: '',
    user: {},
    showDialog: false,
    show: false,
    year: (new Date()).getFullYear(),
    copyRight: copyRight,
    telephone: telephone,
    userName: userName,
    orgName: orgName,
    roleNames: roleNames,
    titleName: '配置管理系统',
    roleShow: false
});

// 动态设置title名字
menuService.sysMenu.then(menu => {
    let sysList = menu.sysList;
    avalon.each(sysList, (key, val) => {
        if(/^\/tyyhrzpt.html/.test(val.indexUrl)) {
            document.title = val.title;
            root.titleName = val.title;
        }
    });
});

if(root.roleNames.length == 0) {
    roleNames.push(' - ');
}
if(root.roleNames.length > 1) {
    root.roleShow = true;
}

breadcrumb.list$.subscribe(v => {
    root.breadcrumb = v;
});

routerserver("root");

avalon.history.start({
    fireAnchor: false
});

if (!/#!/.test(global.location.hash)) {
    avalon.router.navigate('/', 2);
}

require('/apps/common/common-index');

avalon.scan(document.body);