import avalon from 'avalon2';
import {
    createForm
} from 'ane';
import Sbzygl from '../common/common-sbzygl';
import moment from 'moment';
import './zfsypsjglpt-zfda-sgcl-search.css';

let vm = null,
    sbzygl = null;

avalon.component('ms-sgcl-search', {
    template: __inline('./zfsypsjglpt-zfda-sgcl-search.html'),
    defaults: {
        onInit(event) {
            vm = event.vmodel
            sbzygl = new Sbzygl(vm)
            window.sessionStorage.setItem('zfdasgcltree', '')
            this.time_Change(1)
            this.time_Change2(1)
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
                let zfdasgcltree = window.sessionStorage.getItem('zfdasgcltree')
                sbzygl.fetchOrgData(this.orgData, (orgData) => {
                    this.orgData = orgData
                    if (orgData.length > 0) {
                        if (zfdasgcltree) {
                            zfdasgcltree = JSON.parse(zfdasgcltree)
                            this.dataJson.orgId = zfdasgcltree.orgId
                            this.dataJson.orgName = zfdasgcltree.orgName
                            this.dataJson.orgPath = zfdasgcltree.orgPath
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
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgCode = e.node.code;
            this.orgPath = e.node.path;
            this.orgName = e.node.title;
            let dataJson = {
                orgId: e.node.code,
                orgName: e.node.title,
                orgPath: e.node.path
            }
            window.sessionStorage.setItem('zfdasgcltree', JSON.stringify(dataJson))
        },
        extraExpandHandle(treeId, treeNode, selectedKey) {
            sbzygl.fetchOrgWhenExpand(treeId, treeNode, selectedKey);
        },

        sgStartTime: '',
        sgEndTime: '',
        clStartTime: '',
        clEndTime: '',
        isDuration: '',
        isDuration2: '',
        timeMode: [1],
        timeMode2: [1],
        glmt: '99',
        time_Change(e) {
            this.timeMode[0] = e.target ? e.target.value : e;
            switch (this.timeMode[0]) {
                case 2:
                    this.sgStartTime = moment().startOf('month').format('YYYY-MM-DD');
                    this.sgEndTime = moment().endOf('month').format('YYYY-MM-DD');
                    this.isDuration = false;
                    break;
                case 3:
                    this.sgStartTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.sgEndTime = moment().format('YYYY-MM-DD');
                    this.isDuration = true;
                    break;
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.sgStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.sgEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.isDuration = false;
            }
        },
        time_Change2(e) {
            this.timeMode2[0] = e.target ? e.target.value : e;
            switch (this.timeMode2[0]) {
                case 2:
                    this.clStartTime = moment().startOf('month').format('YYYY-MM-DD');
                    this.clEndTime = moment().endOf('month').format('YYYY-MM-DD');
                    this.isDuration2 = false;
                    break;
                case 3:
                    this.clStartTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.clEndTime = moment().format('YYYY-MM-DD');
                    this.isDuration2 = true;
                    break;
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.clStartTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.clEndTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.isDuration2 = false;
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
                    vm.sgdd = record.sgdd ? record.sgdd : ''
                    vm.sgbh = record.sgbh ? record.sgbh : ''
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
            this.searchfn(data, 'sgcl', page)
        },

        searchfn: avalon.noop,

        // 警员
        userCode: '4654',
        // 事故地点
        sgdd: '',
        // 事故编号
        sgbh: '',
        input_focus(e) {
            avalon(e.target.nextSibling).css('display', 'inline-block')
        },
        input_blur(e) {
            avalon(e.target.nextSibling).css('display', 'none')
        }
    }
});