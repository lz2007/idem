// 公共引用部分，兼容IE8
import '/apps/common/common';
import './noPage.css';
import '/apps/common/common-index';
import 'ane';
import {
    applyRouteConfig
} from '/services/pagesRouterServer';

require('/apps/common/common-layout');

let storage = require('../../services/storageService').ret;
let userName = storage.getItem('userName');
let roleNames = storage.getItem('roleNames');
if (userName != null && userName != '' && roleNames != null) {} else { //无登录信息时退出并跳转登录页
    storage.clearAll();
    global.location.href = '/main-login.html';
}

var root = avalon.define({
    $id: 'noPage_vm',
    currentPage: '',
});

applyRouteConfig([], {
    name: 'noPage_vm'
});

avalon.history.start({
    root: "/",
    fireAnchor: false
});

avalon.scan(document.body);