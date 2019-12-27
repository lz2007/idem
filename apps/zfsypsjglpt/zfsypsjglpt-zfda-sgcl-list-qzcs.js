import avalon from 'avalon2'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'
import * as menuServer from '../../services/menuService';
let timestampToTime = function (timestamp) {
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate()<10?('0'+date.getDate()):date.getDate()) + ' ';
    let h = (date.getHours()<10?('0'+date.getHours()):date.getHours()) + ':';
    let m = (date.getMinutes()<10?('0'+date.getMinutes()):date.getMinutes()) + ':';
    let s = (date.getSeconds()<10?('0'+date.getSeconds()):date.getSeconds());
    return Y + M + D + h + m + s;
}
let tableObject = {}
let tableBodyAJGL = avalon.define({ //表格定义组件
    $id: 'zfdn-qzcs_table',
    data: [],
    key: 'zfdn-qzcs_table',
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfda-jtwf-qzcs-tableDrag-style', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
    handle: function (type, record) { //操作函数
        store.dispatch({
            type: "saveType",
            saveType: 'qzcs'
        })

        store.dispatch({
            type: "saveList",
            list: record
        })

        store.dispatch({
            type: "opencheck"
        })
    }
})

avalon.component('ms-sgcl-list-qzcs', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-list-qzcs.html'),
    defaults: {
        isLoading: false,
        datas: [],
        pageSize: 20,
        current: 1,
        authority: {
            CHECK: false,
        },
        onInit() {
            this.initTableObject()
            this.$watch('isLoading', (isLoading) => {
                this.isLoadingfn(isLoading)
            })

            this.$watch('datas', (newData) => {
                if (avalon.isObject(newData)) {
                    this.refreshData(newData)
                }
            })

            // 查看、查询按钮权限控制
            let _this = this;
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JTWF_QZCS/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_CHECK":
                             _this.authority.CHECK = true;
                            break;
                    }
                });
            });
        },
        // 初始化表格jq插件
        initTableObject() {
            tableObject = $.tableIndex({
                id: 'zfda-qzcs-table',
                tableBody: tableBodyAJGL
            })
        },
        // loading 是否显示
        isLoadingfn(isLoading) {
            if (isLoading) {
                tableObject.loading(true)
            } else {
                tableObject.loading(false)
            }
        },
        // 更新表格数据
        refreshData(newData) {

            avalon.each(newData.currentElements, (i, el) => {
                el.wfsj = timestampToTime(el.wfsj)
            })

            if (newData.currentElements) {
                tableObject.tableDataFnc(newData.currentElements)
            } else {
                tableObject.tableDataFnc([])
            }
            
        }
    }
})