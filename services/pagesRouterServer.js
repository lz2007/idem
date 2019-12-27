import avalon from 'avalon2';
import 'mmRouter';

function getPage(component) {
    const html = `<xmp is="${component}" :widget="{id:'${component.replace(/\-/g, '_')}',expire:${Date.now()}}"></xmp>`;
    return html;
}

function applyRouteConfig(config, parentRoute, accPath = '') {
    config.map(function (route) {
        let apps = {};
        if (route.component) {
            apps.currentPage = route.component;
        }
        if (route.apps) {
            apps = route.apps;
        }
        avalon.router.add(accPath + route.path, function () {
            Object.keys(apps).map(viewName => {
                let component = apps[viewName];
                if (typeof component === 'function') {
                    component(function (m) {
                        avalon.vmodels[parentRoute.name][viewName] = getPage(m.name);
                    });
                } else {
                    avalon.vmodels[parentRoute.name][viewName] = getPage(component.name);
                }
            });
        });
        // TODO 支持嵌套路由
        //route.children && applyRouteConfig(route.children, route, accPath + route.path);
    });
}

export {
    applyRouteConfig
}