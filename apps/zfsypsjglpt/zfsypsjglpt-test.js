import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import {
    Gm
} from '../common/common-tools.js';
import moment from 'moment';
import ajax from "/services/ajaxService";
export const name = "zfsypsjglpt-test";
import * as menuServer from '../../services/menuService';
import '../common/common-ms-table/common-ms-table'
require("/apps/zfsypsjglpt/zfsypsjglpt-test.css");

function Tools() {
    this.handleTreeLeaf = function (curData) {
        curData.icon = '/static/image/zfsypsjglpt/users.png';
        curData.key = curData.orgId;
        curData.isParent = true;
        curData.name = curData.orgName;
        curData.title = curData.orgName;
        curData.children = curData.childs || [];
        curData.parent = curData.parent || '';
    };
};

function Format() {};

function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();
Gm_reg.illegal_wfdd = /[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img;
let storage = require('/services/storageService.js').ret;
let tester = null;
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-test.html"),
    defaults: {
        list: avalon.range(20).map(n => ({
            id: n,
            name: '老狼' + n,
            address: '深山',
            province: '老林'
        })),
        actions(type, text, record, index) {
            if (type == 'delete') {
                this.list.removeAll(el => el.id == record.id);
                message.success({
                    content: '删除成功'
                });
            }
        },
        //所有空间的样式
        css: {
            width: '15%',
            height: 30,
        },
        xmjh: {
            name: '姓名/警号',
            value: '',
        },
        dsr: {
            name: '当事人',
            value: '',
        },
        jszh: {
            name: '驾驶证号',
            value: '',
        },
        jdsbh: {
            name: '决定书编号',
            value: '',
        },
        wfdd: {
            name: '违法地点',
            value: '',
        },
        kpzt: {
            name: '考评状态',
            value: '-',
            option: [{
                value: "-",
                label: "不限"
            }, {
                value: "LEVAM_JYLB_FJ",
                label: "辅警"
            }, {
                value: "LEVAM_JYLB_JY",
                label: "警员"
            }]
        },
        kpjg: {
            name: '考评结果',
            value: '-',
            option: [{
                value: "-",
                label: "不限"
            }, {
                value: "LEVAM_JYLB_FJ",
                label: "辅警"
            }, {
                value: "LEVAM_JYLB_JY",
                label: "警员"
            }]
        },
        glmt: {
            name: '关联媒体',
            value: '-',
            option: [{
                value: "-",
                label: "不限"
            }, {
                value: "LEVAM_JYLB_FJ",
                label: "辅警"
            }, {
                value: "LEVAM_JYLB_JY",
                label: "警员"
            }]
        },
        khzt: {
            name: '考核状态',
            value: '-',
            option: [{
                value: "-",
                label: "不限"
            }, {
                value: "LEVAM_JYLB_FJ",
                label: "辅警"
            }, {
                value: "LEVAM_JYLB_JY",
                label: "警员"
            }]
        },
        khjg: {
            name: '考核结果',
            value: '-',
            option: [{
                value: "-",
                label: "不限"
            }, {
                value: "LEVAM_JYLB_FJ",
                label: "辅警"
            }, {
                value: "LEVAM_JYLB_JY",
                label: "警员"
            }]
        },
        zqbm: {
            name: '执勤部门',
            data: [],
            value: '',
            onChange: function (e) {
                // this.value = e.orgId;
            },
            selectedKey: '',
            selectedTitle: '',
        },
        date: {
            name: '开始时间',
            timeChange(e) {
                this.value = e;
            },
            placeHolder: '请选择开始时间',
            value: '',
            time: '',
            showTime: false,
            endDate: '',
        },
        rebackParams() {
            let params = Gm_tool.getStorage('test');

            if (!params) {
                return;
            }
            console.log(params);
            //普通字段的
            Object.keys(params).forEach((val, key) => {

                if (val == 'selectedKey' || val == 'selectedTitle') {
                    return;
                }
                this[val].value = params[val];
            });
            this.date.time = Gm_format.formatDate(params.date, true);
            ({
                selectedKey: this.zqbm.selectedKey,
                selectedTitle: this.zqbm.selectedTitle,
            } = params);
        },
        getParams() {

            //表单所有字段的名字
            let arr = ['zqbm', 'xmjh', 'date', 'kpzt', 'kpjg', 'dsr', 'jszh', 'jdsbh', 'glmt', 'wfdd', 'khzt', 'khjg'];
            let params = {};
            arr.forEach(prop => {
                params[prop] = this[prop].value;
            });
            ({
                selectedKey: params.selectedKey,
                selectedTitle: params.selectedTitle,
            } = this.zqbm);
            return params;
        },
        search: function (e) {
            let valid = true;
            Object.keys(this.getParams()).forEach((value, key) => {

                if (this[value] && !this[value].valid) {
                    this[value].vm.alertShow = true;
                    valid = false;
                }
            });
            if (valid) {
                Gm_tool.setStorage('test', this.getParams(), 0.5, () => {
                    console.log(this.getParams());
                });
            }
        },
        onInit() {
            tester = this;
            ajax({
                url: '/gmvcs/uap/org/find/fakeroot/mgr',
                method: 'get',
                data: {},
                cache: false
            }).then(ret => {

                if (!(ret.code == 0)) {
                    Gm_tool.sayError('获取部门数据失败');
                    return;
                };
                this.zqbm.data = Gm_tool.addIcon(ret.data, (curData) => {
                    Gm_tool.handleTreeLeaf(curData);
                });
                this.zqbm.value = ret.data[0].orgId;
                this.zqbm.selectedKey = ret.data[0].orgId;
                this.zqbm.selectedTitle = ret.data[0].orgName;
                this.zqbm.checkType = ret.data[0].checkType;

                this.rebackParams();

                //执行用户自定义操作          
                ajax({
                    url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + this.zqbm.selectedKey + '&checkType=' + this.zqbm.checkType,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {

                    if (ret.code == 0) {

                        if (ret.data) {
                            var $tree_target = $.fn.zTree.getZTreeObj($('.ztree').attr('id'));
                            var node = $tree_target.getNodesByParam('key', this.zqbm.selectedKey, null)[0];
                            $tree_target.addNodes(node, Gm_tool.addIcon(ret.data, (curData) => {
                                Gm_tool.handleTreeLeaf(curData);
                            }));
                            $tree_target = null;
                            node = null;
                        } else {
                            this.sayError('请求下级部门数据失败');
                        }
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                });
            });
        },
        onReady() {

        },
        onDispose() {

        }
    }
});