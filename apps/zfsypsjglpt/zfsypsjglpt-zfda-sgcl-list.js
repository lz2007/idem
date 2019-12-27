import avalon from 'avalon2'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'

let tableObject = {}
let timestampToTime = function (timestamp) {
    let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return Y + M + D + h + m + s;
}
let listDatas = []

let tableBodySGCL = avalon.define({ //表格定义组件
    $id: 'zfdn-sgcl-table2',
    data: [],
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'zfda-sgcl-tableDrag-style-list', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
    handle: function (type, record) { //操作函数
        store.dispatch({
            type: "saveType",
            saveType: 'sgcl'
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


avalon.component('ms-sgcl-list', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-list.html'),
    defaults: {
        isLoading: false,
        datas: [],
        pageSize: 20,
        current: 1,
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
        },

        // 初始化表格jq插件
        initTableObject() {
            tableObject = $.tableIndex({
                id: 'zfdn-sgcl-table',
                tableBody: tableBodySGCL
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
                el.sgfssj = timestampToTime(el.sgfssj)
                el.clsj = timestampToTime(el.clsj)
            })

            if (newData.currentElements) {
                tableObject.tableDataFnc(newData.currentElements)
            } else {
                tableObject.tableDataFnc([])
            }
            
        }
    }
})