/*
 * @Author: gosuncn.liangzhu 
 * @Date: 2018-05-02 13:51:40 
 * @Last Modified by: linzhanhong
 * @Last Modified time: 2018-06-23 19:26:59
 */

import avalon from 'avalon2'
import {
    createForm
} from 'ane'
import Sbzygl from '../common/common-sbzygl'
import moment from 'moment'
import './zfsypsjglpt-zfda-sgcl-search.css'
import * as menuServer from '/services/menuService';

let vm = null,
    sbzygl = null
avalon.component('ms-sgcl-search-fcfxc', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-search-fcfxc.html'),
    defaults: {
        authority: {
            "SEARCH": false
        },
        onInit(event) {
            vm = event.vmodel
            sbzygl = new Sbzygl(vm)
            window.sessionStorage.setItem('zfdafcfxctree', '')
            this.time_Change(1)

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JTWF/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    // 防止查询等按钮都无权限时页面留白
                    $(".jtwf-container .ajgl-tabCont").css("top", "90px");
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JTWF_FXCCL_SEARCH":
                            _this.authority.SEARCH = true;
                            break;
                    }
                });
                // 防止查询等按钮无权限时页面留白
                if (!_this.authority.SEARCH)
                    $(".jtwf-container .ajgl-tabCont").css("top", "90px");
            });
        },
        includeChild: false,
        clickincludeChild() {
            this.includeChild = !this.includeChild
        },
        orgData: [],
        orgId: '',
        orgCode: '',
        orgPath: '',
        orgName: '',
        dataJson: {
            orgId: '',
            orgName: '',
            orgPath: ''
        },
        //获取部门树
        fetchOrgData(callback) {
            return new Promise((resolve, reject) => {
                let zfdafcfxctree = window.sessionStorage.getItem('zfdafcfxctree')
                sbzygl.fetchOrgData(this.orgData, (orgData) => {
                    this.orgData = orgData
                    if (orgData.length > 0) {
                        if (zfdafcfxctree) {
                            zfdafcfxctree = JSON.parse(zfdafcfxctree)
                            this.dataJson.orgId = zfdafcfxctree.orgId
                            this.dataJson.orgName = zfdafcfxctree.orgName
                            this.dataJson.orgPath = zfdafcfxctree.orgPath
                        } else {
                            this.orgId = orgData[0].key
                            this.orgCode = orgData[0].code
                            this.orgPath = orgData[0].path
                            this.orgName = orgData[0].title
                        }
                    }
                    avalon.isFunction(callback) && callback()
                    resolve(true)
                })
            })
        },
        getSelected(key, title) {
            this.orgId = key
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code
            this.orgPath = e.node.path
            this.orgName = e.node.title
            let dataJson = {
                orgId: e.node.code,
                orgName: e.node.title,
                orgPath: e.node.path
            }
            window.sessionStorage.setItem('zfdafcfxctree', JSON.stringify(dataJson))
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey)
        },
        wfStartTime: '',
        wfEndTime: '',
        isDuration: '',
        timeMode: [1],
        glmt: '99',
        time_Change(e) {
            this.timeMode[0] = e.target ? e.target.value : e
            switch (this.timeMode[0]) {
                case 2:
                    this.wfStartTime = moment().startOf('month').format('YYYY-MM-DD')
                    this.wfEndTime = moment().endOf('month').format('YYYY-MM-DD')
                    this.isDuration = false
                    break
                case 3:
                    this.wfStartTime = moment().subtract(3, 'months').format('YYYY-MM-DD')
                    this.wfEndTime = moment().format('YYYY-MM-DD')
                    this.isDuration = true
                    break
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.wfStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD')
                    this.wfEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD')
                    this.isDuration = false
            }
        },
        json: {},
        //查询表单
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function (fields, record) {
                if (vm) {
                    if (record.glmt && avalon.type(record.glmt) == 'array') {
                        record.glmt = record.glmt.join('')
                    }
                    vm.userCode = record.userCode ? record.userCode : ''
                    vm.wfdz = record.wfdz ? record.wfdz : ''
                    vm.hphm = record.hphm ? record.hphm : ''
                    vm.wfbh = record.wfbh ? record.wfbh : ''
                    vm.jdsbh = record.jdsbh ? record.jdsbh : ''
                    vm.json = record
                }
            }
        }),
        fromsearch(page) {
            if (avalon.isObject(page)) {
                page = 0
            }
            let data = {}
            data.orgPath = this.orgPath
            data.includeChild = this.includeChild
            avalon.mix(data, this.json)
            this.searchfn(data, 'fcfxc', page)
        },
        searchfn: avalon.noop,
        input_focus(e) {
            avalon(e.target.nextSibling).css('display', 'inline-block')
        },
        input_blur(e) {
            avalon(e.target.nextSibling).css('display', 'none')
        },
        userCode: '',
        wfdz: '',
        hphm: '',
        wfbh: '',
        jdsbh: ''
    }
})