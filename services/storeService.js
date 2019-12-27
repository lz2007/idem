import ajax from './ajaxService';
import { getKeyPath } from './menuService';

export const demo = {
    key: 'region_id',
    initialData: function () {
        return {
            region_enable: 0,
            region_id: '',
            region_name: '',
            region_parent_id: '',
            region_type: '',
            suites: [{
                name: 'lzp'
            }]
        };
    },
    fetch: function (params) {
        return ajax({
            url: '/api/demo',
            type: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/demo/update',
            type: 'post',
            data: params
        });
    }
};
export const deviceManage = {
    key: 'device',
    initialData: function () {
        return {
            dep_code: "999999999999",
            police_id: "",
            device_id: "",
            token: ""
        };
    },
    initRegisterInfo: function (params) {
        return ajax({
            url: '/api/deviceRegister/users',
            type: 'get',
            data: params
        });
    },
    fetch: function (params) {
        return ajax({
            url: '/api/deviceManage',
            type: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/deviceManage/update',
            type: 'post',
            data: params
        });
    }
};
export  const  trackReplay = {
    key: 'trackReplay',
    getTrack: function (params) {
        return ajax({
            url: '/api/trackReplay',
            type: 'get',
            data: params
        });
    },
    getTree: function (params) {
        return ajax({
            url: '/api/trackReplay/gettree',
            type: 'get',
            data: params
        })
    }
};
export const file = {
    insert: function (params) {
        $.ajaxFileUpload({
            url: '/api/file/uploadFile',
            secureuri: false,
            fileElementId: params.fileElementId,
            dataType: 'json',
            success: params.success
        });
    }
};
export const bmgl = {
    key: 'bmgl',
    initialData: function () {
        return {
            
        };
    },
    initRegisterInfo: function (params) {
        return ajax({
            url: '/api/deviceRegister/users',
            type: 'get',
            data: params
        });
    },
    fetch: function (params) {
        return ajax({
            url: '/api/bmgl-table',
            method: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/save',
            method: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/edit',
            method: 'post',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/gmvcs/uap/org/delete',
            method: 'post',
            data: params
        });
    }
}
export const gnqx = {
    key: 'gnqx',

    initialData: function () {
        return {
            roleName: '',
            roleDesc: '',
            depArr: [],
        };
    },
    fetch: function (params) {
        return ajax({
            url: '/api/gnqx-table',
            method: 'get',
            data: params
        });
    },
    operateTable : function (params) {
        return ajax({
            url: '/api/gnqx-table',
            method: 'get',
            data: params
        });
    },
    create: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'post',
            data: params
        });
    },
    update: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'get',
            data: params
        });
    },
    remove: function (params) {
        return ajax({
            url: '/api/bmgl-update',
            method: 'get',
            data: params
        });
    }
}
export const github = {
    limit: 30,
    repository: function (params) {
        return ajax({
            url: "/search/repositories",
            type: 'get',
            data: params
        });
    },
    processRequest: function (params) {
        return {
            q: params.query,
            start: (params.page - 1) * this.limit,
            limit: this.limit
        };
    },
    processResponse: function (data) {
        data = data.data;
        data.rows = data.items;
        data.total = data.total_count;
        return data;
    }
};

export const menu = {
    selectedKeys$: Observable(),
    openKeys$: Observable()
};
menu.selectedKeys$.subscribe(v => {
    v[0] && getKeyPath(v[0]).then(result => {
        menu.openKeys$.onNext(result.map(item => item.key));
        breadcrumb.list$.onNext(result.reverse());
    });
});

export const breadcrumb = {
    list$: Observable()
};

function Observable() {
    return {
        onNextCbList: [],
        subscribe(onNext) {
            this.onNextCbList.push(onNext);
        },
        onNext(value) {
            this.onNextCbList.forEach(cb => {
                if (typeof cb === 'function') {
                    cb(value);
                }
            });
        }
    };
}