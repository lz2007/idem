// 公共引用部分，兼容IE8用 
require('/apps/common/common');
require('/apps/common/common-layout');

import * as menuServer from './services/menuService';
let {
    applyRouteConfig
} = require('/services/pagesRouterServer');
let {
    languageSelect
} = require('/services/configService');
let storage = require('/services/storageService.js').ret;
let ajax = require('/services/ajaxService.js');

let userName = storage.getItem('userName');
let roleNames = storage.getItem('roleNames');
let uid = storage.getItem('uid');
let policeState = storage.getItem('policeState');
avalon.define({
    $id: 'indexVm',
    currentPage: ''
})

if (languageSelect == "en") {
    document.title = "MVMS";
} else {
    document.title = "执法音视频一体化管理平台";
}

//无登录信息时退出并跳转登录页
function isLogin() {
    if (!userName && !roleNames || !uid) {
        storage.clearAll();
        global.location.href = '/main-login.html';
    }
    ajax({
        url: '/gmvcs/uap/shortcut/batch/edit/order',
        method: 'post',
        data: []
    })
}

isLogin();

menuServer.menu.then(menu => {
    if (menu.INDEX_MENU.length == 0) {
        if (menu.APP_MENU && menu.APP_MENU.length > 0) {
            window.location.href = menu.APP_MENU[0].url;
        } else {
            window.location.href = "/noPage.html";
        }
    }
});

//router server
let routeConfig = null;

if (policeState) {
    routeConfig = [{
        path: '/',
        component(resolve) {
            require.async('/apps/mainIndex/mainLine/mainLine', resolve);
        }
    }];
} else {
    routeConfig = [{
        path: '/',
        component(resolve) {
            require.async('/apps/mainIndex/mainLineManager/mainLineManager', resolve);
        }
    }];
}

let isHistory = function () {
    if (avalon.msie <= 8) {
        return false;
    } else {
        return true;
    }
}();

applyRouteConfig(routeConfig, {
    name: 'indexVm'
});

avalon.history.start({
    fireAnchor: false,
    root: "/", //根路径
    html5: isHistory, //是否使用HTML5 history 
    hashPrefix: ""
});

if (!/#!/.test(global.location.hash) && !isHistory) {
    avalon.router.navigate('/', 2);
}

avalon.scan(document.body);