// 公共引用部分，兼容IE8用 
require('/apps/common/common')
let {
    applyRouteConfig
} = require('/services/pagesRouterServer');

let {
    mainIndex,
    languageSelect
} = require('/services/configService')

if (languageSelect == "en") {
    document.title = "MVMS";
} else {
    document.title = "执法音视频一体化管理平台";
}

avalon.define({
    $id: 'mainLoginVm',
    currentPage: ''
})

//router server

/**
 * 登录自定义版本
 * @param mainIndex  main-line-login 主线登录版本  shandong-line-login 山东登录版本
 * 
 */
let routeConfig = null

switch (mainIndex) {
    case 'main_index':
        routeConfig = [{
            path: '/',
            component(resolve) {
                require.async('/apps/mainlogin/main-line-login/main-line-login', resolve);
            }
        }]
        break
    case 'main_sdjj':
        routeConfig = [{
            path: '/',
            component(resolve) {
                require.async('/apps/mainlogin/shandong-line-login/shandong-line-login', resolve);
            }
        }]
        break
}

applyRouteConfig(routeConfig, {
    name: 'mainLoginVm'
});

let isHistory = function () {
    if (avalon.msie <= 8) {
        return false
    } else {
        return true
    }
}();

avalon.history.start({
    fireAnchor: false,
    root: "/main-login.html", //根路径
    html5: isHistory, //是否使用HTML5 history 
    hashPrefix: "#"
})

if (!/#!/.test(global.location.hash) && !isHistory) {
    avalon.router.navigate('/', 2);
}

avalon.scan(document.body)