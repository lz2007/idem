import avalon from 'avalon2';
import 'mmRouter';
import {
    menu as menuStore
} from './storeService';

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
                        menuStore.selectedKeys$.onNext([m.name]);
                        if (!avalon.vmodels[parentRoute.name]) {
                            global.location.href = parentRoute['sysName'] + '#!/' + parentRoute['name'].replace(/\_/g, '-');
                        } else {
                            avalon.vmodels[parentRoute.name][viewName] = getPage(m.name);
                        }
                    });
                } else {
                    avalon.vmodels[parentRoute.name][viewName] = getPage(component.name);
                }
            });
        });
        // TODO 支持嵌套路由
        route.children && applyRouteConfig(route.children, route, accPath + route.path);
    });
}

require('/apps/common/common-header');
require('/apps/common/common-sidebar');
require('/apps/common/common-currentbar');

var vUri = global.location.hash.replace(/#!\//);
const routeConfig = [{
        path: '/',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-yhgl', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-yhgl',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-yhgl', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-bmgl',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-bmgl', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-gnqx',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-gnqx', resolve);
        }
    },
    // {
    //     path: '/tyyhrzpt-xtpzgl-xtcd',
    //     component(resolve) {
    //         require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-xtcd', resolve);
    //     }
    // },
    // {
    //     path: '/tyyhrzpt-xtpzgl-xtgg',
    //     component(resolve) {
    //         require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-xtgg', resolve);
    //     }
    // },
    {
        path: '/tyyhrzpt-xtpzgl-sjzd',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-sjzd', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-czrz',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-czrz', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-sbk-rlk',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-sbk-rlk', resolve);
        }
    },
    {
        path: '/tyyhrzpt-xtpzgl-sbk-cpk',
        component(resolve) {
            require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-sbk-cpk', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-zfygl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sbzygl-zfygl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-cjgzzgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sbzygl-cjgzzgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbzygl-dlspcjsbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sbzygl-dlspcjsbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbxhgl-zfyxhgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sbxhgl-zfyxhgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sbxhgl-cjzxhgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sbxhgl-cjzxhgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-index',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ptjlgl-index', resolve);
        }
    }
    ,
    {
        path: '/tyywglpt-ptjlgl-slwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ptjlgl-slwgl', resolve);
        }
    }
    ,
    {
        path: '/tyywglpt-ptjlgl-bywgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ptjlgl-bywgl', resolve);
        }
    }
    ,
    {
        path: '/tyywglpt-ptjlgl-xlwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ptjlgl-xlwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-rwgl-sjscrw',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-rwgl-sjscrw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-zdglfw',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-rwgl-zdglfw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-lxxzrw',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-rwgl-lxxzrw', resolve);
        }
    }, {
        path: '/tyywglpt-rwgl-sslxrw',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-rwgl-sslxrw', resolve);
        }
    },
    {
        path: '/tyywglpt-ptjlgl-sjgbptgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ptjlgl-sjgbptgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-cjzscfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ccfwgl-cjzscfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-khdscfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ccfwgl-khdscfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-baqlxfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ccfwgl-baqlxfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-ccfwgl-4gzfylxfwgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-ccfwgl-4gzfylxfwgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjgl-sbsjrz',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sjgl-sbsjrz', resolve);
        }
    },
    // {
    //     path: '/tyywglpt-sjgl-sjbgl',
    //     component(resolve) {
    //         require.async('/apps/tyywglpt/tyywglpt-sjgl-sjbgl', resolve);
    //     }
    // },
    {
        path: '/tyywglpt-sjbgl-zfysjbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sjbgl-zfysjbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjbgl-cjzsjbgl',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sjbgl-cjzsjbgl', resolve);
        }
    },
    {
        path: '/tyywglpt-sjgl-sbsjrz',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sjgl-sbsjrz', resolve);
        }
    },
    {
        path: '/tyywglpt-bacspz-baq',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-bacspz-baq', resolve);
        }
    },
    {
        path: '/tyywglpt-bacspz-gns',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-bacspz-gns', resolve);
        }
    },
    {
        path: '/tyywglpt-sqgl-index',
        component(resolve) {
            require.async('/apps/tyywglpt/tyywglpt-sqgl-index', resolve);
        }
    },
    {
        path: '/sszhxt-spjk',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-spjk', resolve);
        }
    },
    {
        path: '/sszhxt-lxhf',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-lxhf', resolve);
        }
    }, {
        path: '/sszhxt-dzwl',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-dzwl', resolve);
        }
    }, {
        path: '/mapTest',
        component(resolve) {
            require.async('/apps/sszhxt/mapTest', resolve);
        }
    }, {
        path: '/sszhxt-sszh',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-sszh', resolve);
        }
    }, {
        path: '/sszhxt-sszh-spbf',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-sszh-spbf', resolve);
        }
    }, {
        path: '/sszhxt-gjgl',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjgl', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjcx',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjgl-gjcx', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjdy',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjgl-gjdy', resolve);
        }
    }, {
        path: '/sszhxt-gjgl-gjsz',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjgl-gjsz', resolve);
        }
    }, {
        path: '/sszhxt-znsb-rlbk',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-znsb-rlbk', resolve);
        }
    }, {
        path: '/sszhxt-znsb-rlbk-detail',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-znsb-rlbk-detail', resolve);
        }
    }, {
        path: '/sszhxt-znsb-cpbk',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-znsb-cpbk', resolve);
        }
    }, {
        path: '/sszhxt-znsb-cpbk-detail',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-znsb-cpbk-detail', resolve);
        }
    }, {
        path: '/sszhxt-gjglcontrol',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjglcontrol', resolve);
        }
    }, {
        path: '/sszhxt-gjcx',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-gjcx', resolve);
        }
    }, {
        path: '/sszhxt-jqdj',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-jqdj', resolve);
        }
    }, {
        name: 'sszhxt_xxcj',
        path: '/sszhxt-xxcj',
        sysName: 'sszhxt.html',
        component(resolve) {
            require.async('/apps/sszhxt/sszhxt-xxcj', resolve);
        },
        children: [{
                path: '/sszhxt-xxcj-sfzcj',
                component(resolve) {
                    require.async('/apps/sszhxt/sszhxt-xxcj-sfzcj', resolve);
                }
            },
            {
                path: '/sszhxt-xxcj-rlcj',
                component(resolve) {
                    require.async('/apps/sszhxt/sszhxt-xxcj-rlcj', resolve);
                }
            },
            {
                path: '/sszhxt-xxcj-cpcj',
                component(resolve) {
                    require.async('/apps/sszhxt/sszhxt-xxcj-cpcj', resolve);
                }
            },
        ]
    }
];

export function routerserver(name) {
    applyRouteConfig(routeConfig, {
        name
    });
}