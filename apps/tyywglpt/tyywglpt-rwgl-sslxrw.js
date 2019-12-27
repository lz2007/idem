import avalon from 'avalon2';
import {
    createForm,
    message
} from "ane";
import {
    demo as demoStore
} from '../../services/storeService';
import ajax from '../../services/ajaxService';
require('../common/common-tyywglpt.css');
require('/apps/tyywglpt/tyywglpt-rwgl.css');

export const name = 'tyywglpt-rwgl-sslxrw';
let vm = null;
avalon.component(name, {
    template: __inline('./tyywglpt-rwgl-sslxrw.html'),
    defaults: {
        onInit(event) {
            // 部门组织树
            vm = event.vmodel;
            this.fetchOrgData();
            // ajax 获取表格数据
            this.ajaxTableList();

            $('.tyywglpt-list-panel').css({
                'top': 176
            });
        },
        orgData: [],
        orgCode: "",
        orgId: "",
        fetchOrgData() {
            // ajax 请求部门列表
            lxxzrwAjax.ajaxGetDep().then(result => {
                handleRemoteTreeData(result.data, this.orgData);
                this.orgCode = this.orgData[0].code;
            });
        },
        getSelected(key, title) {
            // this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            // this.orgCode = e.node.code;
        },

        // 加载表格数据 begin
        list: [],
        loading: false,
        current: 0,
        //每页显示页数
        pageSize: 10,
        // 数据总量
        total: 0,
        //当页码改变时触发，参数current
        onChangePage(current) {
            this.current = current;
            this.ajaxTableList();
        },
        // ajax获取表格数据
        ajaxTableList: function (page = 0, pageSize = 10) {
            this.loading = true;
            lxxzrwAjax.ajaxGetTableList(page, pageSize).then(ret => {
                // 总数据量
                this.total = ret.data.count;
                if (this.total === 0) {
                    message.success({
                        content: '暂无数据'
                    });
                }
                this.loading = false;
                // 数据
                this.list = ret.data.storageInfos;

                setTimeout(() => {
                    if ($('.tyywglpt-list-content').get(0).offsetHeight < $('.tyywglpt-list-content').get(0).scrollHeight - 1) {
                        $('.tyywglpt-list-header').css({
                            'padding-right': '17px'
                        });
                    } else {
                        $('.tyywglpt-list-header').css({
                            'padding-right': '0'
                        });
                    }
                }, 100);

            });
        },

        // 查找
        json: '',
        $searchForm: createForm({
            autoAsyncChange: false,
            onFieldsChange(fields, record) {
                //console.log(record)
                this.json = JSON.stringify(record);
            }
        }),
        pattern: /^\d+-\d+-\d+( \d+:\d+:\d+)?$/,
        search() {
            this.$searchForm.validateFields().then(isAllValid => {
                if (isAllValid) {
                    this.ajaxTableList();
                }
            });
        }
    }
});

// ajax 请求数据
const lxxzrwAjax = {
    // 获取部门列表
    ajaxGetDep: function () {
        return ajax({
            url: '/gmvcs/uap/org/all',
            type: 'get'
        });
    },
    // 获取表格数据
    ajaxGetTableList: function (page, pageSize) {
        return ajax({
            url: '/api/tyywglpt-rwgl-sjscrw-tableList',
            // url: `/gmvcs/uap/dic/findByDicTypeCode/0001?page=${page}&pageSize=${pageSize}&time=${Date.parse(new Date)}`,
            method: 'get'
        });
    }
}

/**
 * 处理远程部门树的数据
 * @param {array} remoteData  远程请求得到的数据
 * @param {array} handledData  处理后的数据
 */
function handleRemoteTreeData(remoteData, handledData) {
    if (!remoteData) {
        return;
    }
    avalon.each(remoteData, function (index, el) {
        let item = {
            key: el.orgId,
            title: el.orgName,
            code: el.orgCode,
            children: [],
            icon: '/static/image/tyywglpt/org.png',
        };
        handledData.push(item);
        handleRemoteTreeData(el.childs, handledData[index].children)
    })
}
// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}