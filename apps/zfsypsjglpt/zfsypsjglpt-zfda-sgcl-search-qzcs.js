import avalon from 'avalon2'
import {
    createForm
} from 'ane'
import Sbzygl from '../common/common-sbzygl'
import moment from 'moment'
import './zfsypsjglpt-zfda-sgcl-search.css'
import * as menuServer from '../../services/menuService';

let vm = null,
    sbzygl = null

avalon.component('ms-sgcl-search-qzcs', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-search-qzcs.html'),
    defaults: {
        authority: {
            SEARCH: false,
        },
        onInit(event) {
            vm = event.vmodel
            sbzygl = new Sbzygl(vm)
            window.sessionStorage.setItem('zfdaqzcstree', '')
            this.time_Change(1);

            // 查看、查询按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JTWF_QZCS/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                if (func_list.length == 0) {
                    $('.jtwf-container .ajgl-tabCont').css('top', '90px');
                    return;
                }

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JTWF_QZCS_SEARCH":
                            vm.authority.SEARCH = true;
                            break;
                    }
                });
                if (!vm.authority.SEARCH) $('.jtwf-container .ajgl-tabCont').css('top', '90px');

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
                let zfdaqzcstree = window.sessionStorage.getItem('zfdaqzcstree')
                sbzygl.fetchOrgData(this.orgData, (orgData) => {
                    this.orgData = orgData
                    if (orgData.length > 0) {
                        if (zfdaqzcstree) {
                            zfdaqzcstree = JSON.parse(zfdaqzcstree)
                            this.dataJson.orgId = zfdaqzcstree.orgId
                            this.dataJson.orgName = zfdaqzcstree.orgName
                            this.dataJson.orgPath = zfdaqzcstree.orgPath
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
            window.sessionStorage.setItem('zfdaqzcstree', JSON.stringify(dataJson))
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey)
        },
        wfStartTime: '',
        wfEndTime: '',
        isDuration: false,
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
                    vm.dsr = record.dsr ? record.dsr : ''
                    vm.jszh = record.jszh ? record.jszh : ''
                    vm.hphm = record.hphm ? record.hphm : ''
                    vm.wfdz = record.wfdz ? record.wfdz : ''
                    vm.pzbh = record.pzbh ? record.pzbh : ''

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
            this.searchfn(data, 'qzcs', page)
        },
        searchfn: avalon.noop,

        userCode: '',
        dsr: '',
        jszh: '',
        hphm: '',
        wfdz: '',
        pzbh: '',
        input_focus(e) {
            avalon(e.target.nextSibling).css('display', 'inline-block')
        },
        input_blur(e) {
            avalon(e.target.nextSibling).css('display', 'none')
        }
    }
})