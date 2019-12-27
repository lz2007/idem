/**
 * 统一运维管理平台--任务管理--自动关联服务
 * caojiacong
 */
import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import moment from 'moment';
import Sbzygl from '../common/common-sbzygl';
import {
    createForm,
    message,
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
const storage = require('../../services/storageService.js').ret;
export const name = 'tyywglpt-rwgl-zdglfw';
require('../common/common-tyywglpt.css');
require('./tyywglpt-rwgl-zdglfw.css');
let vm = null,
    sbzygl = null;
const listHeaderName = name + "-list-header";
//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-rwgl-zdglfw.html'),
    defaults: {
        $id: 'zdglfw-vm',
        loading: true,
        isNull: false,
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        dataStr: '',
        dataJson: {},
        titleTimer: "", //popover用的的定时器，代码在common-sbzygl.js
        authority: { // 按钮权限标识
            "XGPY": false, //自动关联服务_修改视频时长偏移
        },
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^UOM_FUNCTION_XTRWGL_ZDGLFW_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "UOM_FUNCTION_XTRWGL_ZDGLFW_XGPY":
                            _this.authority.XGPY = true;
                            break;
                    }
                });
                sbzygl.autoSetListPanelTop();
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.current = v.page + 1;
                }
            })
        },
        onReady() {
            this.dataStr = storage.getItem(name);
            this.dataJson = this.dataStr ? JSON.parse(this.dataStr) : null;
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
            this.fetchList();
        },
        onDispos() {
            clearTimeout(this.titleTimer);
            $('div.popover').remove();
        },
        getCurrent(current) {
            this.current = current;
        },
        pageChange() {
            this.fetchList()
        },
        handleEditOffset(item, event) {
            item.editMode = true;
        },
        handleSaveOffset(index, item, event) {
            let preValue = $('.offset-pre-' + index + ' .ane-select-selected').text().replace(/(\u524d|\u5206|\u949f)/g, '');
            let behindValue = $('.offset-behind-' + index + ' .ane-select-selected').text().replace(/(\u540e|\u5206|\u949f)/g, '');
            let url = '/gmvcs/stat/auto/match/time/offset';
            let data = {
                "behindDeviant": Number(behindValue),
                "preDeviant": Number(preValue),
                "serviceName": item.serviceName
            }
            sbzygl.ajax(url, 'post', data).then(result => {
                if (result.code != 0) {
                    sbzygl.showTips('error', result.msg);
                    item.editMode = false;
                    return;
                }
                item.preDeviant = data.preDeviant;
                item.behindDeviant = data.behindDeviant;
                item.editMode = false;
            })
        },
        fetchList() {
            let url = '/gmvcs/stat/auto/match/status';
            let data = {
                "page": this.current - 1,
                "pageSize": this.pageSize
            };
            this.dataStr = JSON.stringify(data);
            storage.setItem(name, this.dataStr, 0.5);
            sbzygl.ajax(url, 'post', data).then(result => {
                this.loading = false;
                if (result.code !== 0) {
                    sbzygl.showTips('error', result.msg);
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                } else if (!result.data.totalElements) {
                    this.list = [];
                    this.total = 0;
                    this.isNull = true;
                    sbzygl.initDragList(listHeaderName);
                    return;
                }
                avalon.each(result.data.currentElements, (index, el) => {
                    el.editMode = false;
                    el.durationStr = handleDuration(el.lastTimeDuration);
                });
                this.list = result.data.currentElements;
                this.total = result.data.totalElements;
                this.isNull = false;
                sbzygl.initList();
                sbzygl.initDragList(listHeaderName);
            }).fail(() => {
                this.loading = false;
                this.list = [];
                this.total = 0;
                this.isNull = true;
                sbzygl.initDragList(listHeaderName);
            });
        }
    }
})

function handleDuration(duration) {
    if (duration <= 999) {
        return "0分0秒"
    }
    duration = duration / 1000;
    let hour = Math.floor(duration / 3600);
    let minute = Math.floor(duration / 60 % 60);
    let second = Math.round(duration % 60);
    let durationStr = (hour > 0 ? hour + '时' : '') + (minute > 0 ? minute + '分' : '') + second + '秒';
    return durationStr;
}