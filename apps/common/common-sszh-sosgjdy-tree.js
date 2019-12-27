/**
 * 实时指挥系统中部分公用的侧边栏
 * @prop {String} owner 标识字符串
 * @prop {Array} recentData 最近项的数据
 * @event {Function} onCheck 当勾选节点时触发
 * @event {Function} extraProcessWhenExpand  当展开节点时进行一些额外操作
 * @event {Function} extraProcessWhenPersonChange  当人员信息变化时进行一些额外操作
 * @example
 * ```
 * demo
 * <ms-poll-sidebar :widget="{owner:'videoMonitor',recentData:@recentData,fetchRecent:@fetchRecent,onCheck:@handleTreeCheck,extraProcessWhenExpand:@extraProcessWhenExpand,extraProcessWhenPersonChange:@extraProcessWhenPersonChange}">
        //下面的li为slot
        <li :for="($index, el) in @recentData" :class="[el.type === 'device' ? 'device' : 'person']">{{el.name}}&nbsp;{{el.time}}</li>
    </ms-poll-sidebar>
 * 可参见 sszhxt-spjk 模块
 * 
 * ```
 */

import {
    notification,
    createForm
} from "ane";
import ajax from '../../services/ajaxService';
require('/apps/common/common-sszh-sosgjdy-tree.css');
const storage = require('../../services/storageService.js').ret;
const orgModel = require("./common-sszh-treemodel.js");
let vm = null;

let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

avalon.component('ms-sszh-sosgjdy-tree', {
    template: __inline('./common-sszh-sosgjdy-tree.html'),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        sidebar_txt: language_txt.sszhxt.sszhxt_sszh,
        sidebarMode: 0,
        searchNodeList: [],
        keyword: '',
        placholder: languageSelect == "en" ? 'UserName/DeviceName/Dept' : '请输入警员姓名/警号/部门名称',
        inputStatus: 0, //0---初始化 1---未输入关键字  2---已输入关键字
        owner: 'sos-poll-tree',
        isJustOnline: false,
        isJustChoose: false,
        isJustParent: false, // 只显示父级
        destoryTree: false,
        dataStr: '',
        dataJson: {},
        $saveJson: {
            "keyword": '',
            "expandNodes": []
        },
        devType: 'all', //设备类型
        expandNodes: [], //展开的部门节点
        onCheck: avalon.noop,
        extraProcessWhenExpand: avalon.noop,
        extraProcessWhenPersonChange: avalon.noop,
        extraHandleWhenCheckOrg: avalon.noop,
        returnTreeObj: avalon.noop, //放回部门树对象
        onlineDeviceNum: 0 , //在线设备数
        deviceNum: 0, //总设备数,
        spjkBool: false, //是否为视频监控页面
        $Form: createForm(),
        onInit(event) {
            vm = event.vmodel;
            this.$watch('destoryTree', (v) => {
                if (v) {
                    this.disposeFunction();
                    orgTree.destoryTree();
                };
                if(!v) {
                    this.readyFunction();
                }
            });
            this.$watch('dataJson', (v) => {
                if (v) {
                    this.keyword = v.keyword === "" ? this.placholder : v.keyword;
                    this.inputStatus = v.keyword === "" ? 0 : v.inputStatus;
                    this.expandNodes = v.expandNodes.length > 0 ? v.expandNodes : [];
                    this.$saveJson.expandNodes = this.expandNodes;
                    if (v.searchNodeList) {
                        this.searchNodeList = v.searchNodeList;
                    }
                } else {
                    this.keyword = this.placholder;
                }
            });
            this.$watch('keyword', (v) => {
                if(v === '' || v == this.placholder) {
                    if (vm.searchNodeList && vm.searchNodeList.length > 0) {
                        orgTree.updateNodes(false); //去掉之前的高亮的节点
                    }
                }
            });
        },
        onReady: function (event) {
            this.readyFunction();
        },
        readyFunction () {
            let storageStr = storage.getItem(this.owner);
            this.dataJson = storageStr ? storageStr : null;
            orgTree.init(() => {
                if (this.inputStatus === 2 && this.keyword !== this.placholder) {
                    this.handleSearch();
                }
                for (let i = 0; i < this.expandNodes.length; i++) {
                    let node = orgTree.getNodeByParam("orgId", this.expandNodes[i]);
                    orgTree.expandNodes(node);
                }
            });
            setHeight();
            $(window).on('resize', setHeight);
            orgModel.orgModel.startUpdateOrgTimer();
            orgModel.orgModel.startUpdatePerTimer();
            orgModel.orgModel.setOwner(this.owner);
        },
        disposeFunction () {
            orgModel.orgModel.stopUpdateOrgTimer(); //清除掉部门更新定时器
            orgModel.orgModel.stopUpdatePerTimer(); //清除掉人员更新定时器
            orgModel.orgModel.clearSavedData(); //清空保存的数据
            $(window).off('resize', setHeight);
            //this.dataStr = this.$saveJson;
            var a = vm.$model.$saveJson;
            storage.setItem(this.owner, a, 0.5);
        },
        handledevTypeChange(event) {
            orgTree.hideNodesByDevtype(event.target.value);
        },
        handleSearchInputFocus(event) {
            $(event.target).siblings('.input-close').show();
            if (this.inputStatus === 0 || this.inputStatus === 1) {
                this.inputStatus = 2;
                this.keyword = '';
            }
        },
        handleSearchInputBlur(event) {
            $(event.target).siblings('.input-close').hide();
            if ($.trim(this.keyword) === '') {
                this.inputStatus = 0;
                this.keyword = this.placholder;
            } else {
                this.inputStatus = 2;
            }
        },
        handleKeyClear(event) {
            this.keyword = '';
            $(event.target).siblings('input').val('').focus();
        },
        handleSearch() {
            let reg = /^[a-zA-Z0-9_\s\u4e00-\u9fa5]+$/;
            this.$saveJson.keyword = this.keyword;
            this.$saveJson.inputStatus = this.inputStatus;
            if (this.inputStatus !== 2) {
                this.inputStatus = 1;
                return false;
            }
            if (!reg.test(this.keyword)) {
                notification.warning({
                    title: languageSelect == "en" ? 'notification' : '通知',
                    message: languageSelect == "en" ? 'special characters not supported，reenter please' : '不支持搜索特殊字符，请重新输入'
                });
                $('.common-sszh-side-bar-sosgjdy .input-group input').focus();
                this.$saveJson.keyword = "";
                this.$saveJson.inputStatus = 0;
                return false;
            }
            orgTree.searchNode();
        },
        handleQuickSearch(event) {
            if (event.keyCode == 13) {
                $('.common-sszh-side-bar-sosgjdy .input-group input').blur();
                this.handleSearch();
            }
        },
    },
});



//================================================观察者模式更新部门树================================================
/**
 * 部门树
 * 功能包括：首先加载部门，根据用户展开部门节点获取人员，自动更新统计人员在线人数，总人数，人员变更
 * 模块代码来自旧平台实时指挥模块GMOrgtree.js和treeModel.js两个文件，部分有更改
 *
 *
 */

const orgTree = (function () {
    // 部门树的配置信息
    let setting = {
        data: {
            key: {
                children: "childs",
                name: "displayName"
            }
        },
        check: {
            enable: true,
            chkboxType: {
                "Y": "ps",
                "N": "ps"
            }
        },
        view: {
            fontCss: getFontCss,
            //addHoverDom: addHoverDom,
            //removeHoverDom: removeHoverDom,
            nameIsHTML: true,
            dblClickExpand: false
        },
        callback: {
            beforeClick: beforeClick,
            beforeDblClick: beforeDblClick,
            beforeCheck: beforeCheck,
            //beforeExpand:beforeExpand,
            onExpand: zTreeOnExpand,
            onCollapse: zTreeOnCollapse,
            onCheck: onChecked,
            onDblClick: onDblClick
        }
    };
    // 事件类型
    let events = {
        'ORG_FIRSTLOAD': 'org_firstload',
        'ORG_CHANGE': 'org_change',
        'ORG_COUNTCHANGE': 'org_countchange',
        'PERSON_CHANGE': 'person_change',
        'ORG_UPDATED': 'org_updated',
        'PERSON_UPDATED': 'person_updated'
    };
    // 使用频率高，用于保存poll-tree对象
    let treeObj = null;
    // 需要更新的部门
    let needUpdateIds = {};
    /**
     * 返回字体样式  高光、置灰、选中、普通
     * */
    function getFontCss(treeId, treeNode) {
        return (!!treeNode.highlight) ? { // 高光
            color: "#0078d7",
            "font-weight": "bold"
        } : treeNode.chkDisabled ? { // 置灰
            color: "#999999",
            "font-weight": "normal"
        } : treeNode.checked ? { // 选中
            color: "#1055b3",
            "font-weight": "normal"
        } : { // 默认颜色
            color: "#414f5c",
            "font-weight": "normal"
        };
    }

    /**
     * 展开前操作
     */
    function beforeExpand() {
        if (!treeObj) {
            return false;
        }

    }
    /**
     * 勾选父节点，勾选所有
     */
    var judge = null;

    function checkNode(treeNode) {
        if (!treeNode.isParent) {
            return;
        }
        judge = true;
        //点击部门或者点击多通道设备时选择他们下面的一级子节点
        let node = !treeNode.mytype ? treeObj.getNodesByParam('orgId', treeNode.orgId) : treeObj.getNodesByParam('gbcode', treeNode.gbcode);
        let checked = !treeNode.checked;
        if (node.length <= 0 || !node[0].childs) {
            return;
        }
        for (let i = 0; i < node[0].childs.length; i++) {
            if (node[0].childs[i].isParent) {
                // continue;
                checkNode(node[0].childs[i]);
            }
            treeObj.checkNode(node[0].childs[i], checked, false, true);
        }
        judge = false;
    }
    /**
     * 双击时
     * @param {*} event 
     * @param {*} treeId 
     * @param {*} treeNode 
     */
    function onDblClick(event, treeId, treeNode) {
        if (vm.owner == 'mapConduct') {
            if (!treeNode.isParent) {
                treeObj.checkNode(treeNode, true, true, true);
            }
            return;
        }
        treeObj.checkNode(treeNode, '', true, true);
    }
    /**
     * checkbox onCheck事件
     * @param {Object} event
     * @param {String} treeId
     * @param {Object} treeNode
     */
    //勾选时,judege用于判断地图是否设置中心点
    function onChecked(event, treeId, treeNode) {
        treeObj.updateNode(treeNode); // 更新节点以更新字体颜色等
        if (treeNode.isParent && !vm.isJustParent) {
            return;
        }
        vm.onCheck(event, treeId, treeNode, !judge);
    }
    /**
     * 禁用部门树节点的单击
     */
    function beforeClick(treeId, treeNode, clickFlag) {
        return false;
    }

    /**
     * 禁用部门树节点的单击
     */ 
    function beforeDblClick(treeId, treeNode) {
        if (!treeNode) {
            return;
        }
        if (!treeNode.checked) {
                return true;
        } else {
                return false;
        }

    }

    function beforeCheck(treeId, treeNode) {
        if (treeNode.isParent && !treeNode.checked) {
            //比如勾选部门树，缩放地图层级
            vm.extraHandleWhenCheckOrg();
        }
        if (treeNode.isParent && !treeNode.open) {
            treeObj.expandNode(treeNode, true, false, true, true);
            checkNode(treeNode);
        } else {
            checkNode(treeNode);
        }
    }

    // 当节点展开时
    function zTreeOnExpand(event, treeId, treeNode) {
        if(vm.isJustParent) return; // 只显示父级
        if (treeNode.type) return; //视频监控，点击多通道展开时不加东西
        if (!needUpdateIds[vm.owner]) {
            needUpdateIds[vm.owner] = [];
        }
        var pos = needUpdateIds[vm.owner].indexOf(treeNode.orgId);
        if (pos == -1) {
            needUpdateIds[vm.owner].push(treeNode.orgId);
            addHandler(events.PERSON_UPDATED, onPersonInfoChange, vm.owner, needUpdateIds[vm.owner]);
        }
        if (vm.expandNodes.indexOf(treeNode.orgId) == -1) {
            vm.expandNodes.push(treeNode.orgId);
            vm.$saveJson.expandNodes = vm.expandNodes;
        }
        if (treeNode.loaded) {
            //表示该节点的已经请求过数据加载了
            let nodeList = treeObj.getNodesByFilter(function (node) {
                if (vm.keyword == "" || vm.keyword == vm.placholder) {
                    node = null;
                    return node;
                }
                return new RegExp(vm.keyword).test(node.gbcode) || new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword, 'i').test(node.username) || new RegExp(vm.keyword, 'i').test(node.name) || new RegExp(vm.keyword, 'i').test(node.orgName) || new RegExp(vm.keyword, 'i').test(node.displayName);
            }, false, treeNode);
            if (nodeList) {
                for (var j = 0; j < nodeList.length; j++) {
                    var node = nodeList[j];
                    if (node) {
                        if (!~vm.searchNodeList.indexOf(node)) {
                            vm.searchNodeList.push(node);
                        }
                        treeObj.updateNode(node);
                    }
                }
            }
            return;
        }

        //多通道设备先获取
        let symbols = false;
        orgModel.orgModel.getOrgmutilDev(treeNode.orgId, function (data) {
            treeNode.loaded = true;
            symbols = true;
            avalon.each(data, function (i, value) {
                value.isParent = false;
                // value.nocheck = value.gbcode == "";
                value.nocheck = false;
                // value.displayName = value.username + "(" + value.usercode + ')';
                if (value.name != "") {
                    value.displayName = value.name;
                } else {
                    value.displayName = value.type;
                }
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                if (value.online === 1) { //1在线0不在线
                    if (value.mytype == 1) {
                        value.icon = '/static/image/sszhxt/fastDevonline.png';
                    } else if (value.mytype == 2) {
                        value.icon = '/static/image/sszhxt/caronline.png';
                    } else {
                        value.icon = '/static/image/sszhxt/Droneonline.png';
                    }
                    if (vm.owner != 'mapConduct') {
                        //是视频监控的，处理数据
                        value.isParent = true;
                        avalon.each(value.channelSet, function (index, item) {
                            item.icon = '/static/image/sszhxt/channel.png'; //上线图标
                            item.displayName = item.name;
                        })
                        value.childs = value.channelSet;
                    }
                } else {
                    if (value.mytype == 1) { //
                        value.icon = '/static/image/sszhxt/fastDevoutline.png';
                    } else if (value.mytype == 2) {
                        value.icon = '/static/image/sszhxt/caroutline.png';
                    } else {
                        value.icon = '/static/image/sszhxt/Droneoutline.png';
                    }
                    if (vm.owner != 'mapConduct') {
                        //是视频监控的，处理数据
                        value.isParent = true;
                        avalon.each(value.channelSet, function (index, item) {
                            item.icon = '/static/image/sszhxt/channeloutline.png'; //xia线图标
                            item.displayName = item.name;
                        })
                        value.childs = value.channelSet;
                    }
                }
                //对value的一些额外的操作，比如value.checked = isShowMap(value.deviceId);
                vm.extraProcessWhenExpand(i, value);
            });
            //加多通道设备
            treeObj.addNodes(treeNode, 0, data);
            //执法仪获取
            orgModel.orgModel.getOrgPerson(treeNode.orgId, function (data) {
                treeNode.loaded = true;
                avalon.each(data, function (i, value) {
                    value.isParent = false;
                    // value.nocheck = value.gbcode == "";
                    value.nocheck = false;
                    // value.displayName = value.username + "(" + value.usercode + ')';
                    if (value.username != "") {
                        value.displayName = value.username + "(" + value.usercode + ')';
                    } else {
                        value.name = value.name ? value.name : '-';
                        value.displayName = value.name;
                    }
                    if (value.online === 1) { //1在线0不在线
                        if (value.isLocking) { //0--未锁定，1--锁定
                            value.icon = '/static/image/sszhxt/locked.png';
                        } else if (value.source) {
                            value.icon = '/static/image/sszhxt/platform_online.png';
                        } else {
                            // value.icon = '/static/image/sszhxt/device_online.png';
                            value.icon = '/static/image/sszhxt/device_offline.png'
                        }
                    } else {
                        if (value.isLocking) { //0--未锁定，1--锁定
                            value.icon = '/static/image/sszhxt/locked.png';
                        } else if (value.source) {
                            value.icon = '/static/image/sszhxt/platform_offline.png';
                        } else {
                            value.icon = '/static/image/sszhxt/device_offline.png';
                        }
                    }
                    //对value的一些额外的操作，比如value.checked = isShowMap(value.deviceId);
                    vm.extraProcessWhenExpand(i, value);
                });

                //加执法仪
                treeObj.addNodes(treeNode, 0, data);


                //展开的时候检查父级是否勾选，若勾选则直接子元素均勾选
                let childNodes = treeObj.getNodesByFilter((node) => {
                    return (!node.isParent && node.online === 1)
                }, false, treeNode);
                if (treeNode.checked && childNodes) {
                    for (var i = 0; i < childNodes.length; i++) {
                        treeObj.checkNode(childNodes[i], true, false, true);
                    }
                }
                if (!childNodes || !childNodes.length) {
                    //如果直接子元素全都不在线，父级勾选框禁用
                    // treeNode.checked = false;
                    treeObj.checkNode(treeNode, false, true, false);
                    treeObj.updateNode(treeNode);
                }
                let nodeList = treeObj.getNodesByFilter(function (node) {
                    if (vm.keyword == "" || vm.keyword == vm.placholder) {
                        node = null;
                        return node;
                    }
                    return new RegExp(vm.keyword).test(node.gbcode) || new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword, 'i').test(node.username) || new RegExp(vm.keyword, 'i').test(node.name) || new RegExp(vm.keyword, 'i').test(node.orgName) || new RegExp(vm.keyword, 'i').test(node.displayName);
                }, false, treeNode);
                if (nodeList) {
                    for (var j = 0; j < nodeList.length; j++) {
                        var node = nodeList[j];
                        if (node) {
                            if (!~vm.searchNodeList.indexOf(node)) {
                                vm.searchNodeList.push(node);
                            }
                            treeObj.updateNode(node);
                        }
                    }
                }
            }, function () {
                // treeNode.checked = false;
                if (!symbols) {
                    treeObj.checkNode(treeNode, false, true, false);
                    treeObj.updateNode(treeNode)
                }
            });
        });


    }

    // 节点折叠事件
    function zTreeOnCollapse(event, treeId, treeNode) {
        let nodePos = vm.expandNodes.indexOf(treeNode.orgId);
        if (nodePos > 0) {
            vm.expandNodes.splice(nodePos, 1);
            vm.$saveJson.expandNodes = vm.expandNodes;
        }
        // var pos = needUpdateIds.indexOf(treeNode.orgId);
        // if (pos == -1) {
        //     return;
        // }
        //
        // needUpdateIds.splice(pos, 1);
        //addHandler(events.PERSON_UPDATED, onPersonInfoChange, 'mapConduct', needUpdateIds);
    }

    function addHandler(type, handler, owner, orgIds) {
        orgModel.orgModel.addHandler(type, handler, owner, orgIds);
    }

    /**
     * 初始化树
     */
    function init(callback) {
        window.HTMLElement = window.HTMLElement || Element;
        orgModel.orgModel.getAllorgInfo(function (ret) {
            if (ret) {
                $.fn.zTree.init($("#sos-poll-tree"), setting, ret);
                treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
                vm.returnTreeObj(treeObj);
                var nodes = treeObj.getNodes();
                for (var i = 0; i < nodes.length; i++) { //设置节点展开一级
                    treeObj.expandNode(nodes[i], true, false, true, true);
                    break;
                }
                avalon.isFunction(callback) && callback();
                addHandler(events.ORG_UPDATED, onUpdateOrgDetailInfo);
                addHandler(events.ORG_FIRSTLOAD, onUpdateOrgDetailInfo);
                // var nodes = treeObj.getNodesByParam("parentId", -1, null);
                // for (var i=nodes.length-1; i>=0; i--){
                //     treeObj.expandNode(nodes[i], true, false, true, true);
                // }
            }
        });
    }

    //第一次加载部门树
    function updateFirstOrgInfo(data) {
        for (let i = 0, len = data.length; i < len; i++) {
            nodes = treeObj.getNodeByParam("orgId", data[i].orgId, null);
            //nodes.displayName = data[i].orgName + " " +  data[i].orgCount + "/" + data[i].totalCount;
            nodes.displayName = data[i].orgName; //暂无统计人数
            let parent = nodes.getParentNode();
            if (!parent || parent.open == true) {
                treeObj.updateNode(nodes);
            }
            if (data[i].children) {
                setTimeout((function (data) {
                    return function () {
                        updateFirstOrgInfo(data)
                    }
                }(data[i].childs)), 100);
            }
        }
    }

    // 部门信息变化时响应函数
    function onUpdateOrgDetailInfo(event) {
        let nodes;
        treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
        switch (event.type) {
            case events.ORG_FIRSTLOAD:
                updateFirstOrgInfo(event.data.data)
                break;
            case events.ORG_UPDATED:
                {
                    switch (event.data.type) {
                        case 'change':
                            setTimeout((function (data) {
                                return function () {
                                    nodes = treeObj.getNodeByParam("orgId", data.orgId, null);
                                    //nodes.displayName = data.orgName + " " +  data.orgCount + "/" + data.totalCount;
                                    nodes.displayName = data.orgName; //暂无统计部门树统计人数
                                    let parent = nodes.getParentNode();

                                    try {
                                        if (!parent) {
                                            treeObj.expandNode(nodes, true, false, true, true);
                                        }
                                    } catch (e) {

                                    }

                                    if (!parent || parent.open == true) {
                                        treeObj.updateNode(nodes);
                                    }

                                }
                            }(event.data.data)), 10);
                            break;
                        case 'delete':
                            nodes = treeObj.getNodeByParam("orgId", event.data.data.orgId, null);
                            treeObj.removeNode(nodes);
                            break;
                        case 'add':
                            nodes = null;
                            //if (event.data.data.parentId != -1) {
                            //这个地方上是有bug的，需要后台配合放回他的父部门orgid,以此查找部门树，插入节点，现在后台没时间。。。
                            //现在改成从path字段拿到父部门节点
                            let arr = event.data.data.path.split('/');
                            let orgCode = arr[arr.length - 3];
                            // nodes = treeObj.getNodeByParam("orgCode", orgCode, null);
                            nodes = treeObj.getNodesByFilter(function (node) {
                                return (node.orgCode == orgCode || node.orgId == orgCode);
                            });
                            event.data.data.isParent = true;
                            event.data.data.displayName = event.data.data.orgName;
                            event.data.data.icon = "/static/image/sszhxt/org.png";
                            //}
                            if (nodes.length == 0) {
                                treeObj.addNodes(null, -1, event.data.data);
                            } else {
                                treeObj.addNodes(nodes[0], -1, event.data.data);
                            }
                            break;
                    }
                }
                break;
        }
    }
    // 人员信息变更时响应函数
    function onPersonInfoChange(event) {
        let nodes;
        let activeNode;
        let parentNode;
        if (!~needUpdateIds[vm.owner].indexOf(event.data.orgId)) {
            return;
        }
        switch (event.type) {
            case events.PERSON_UPDATED:
                {
                    switch (event.data.type) {
                        case 'change':
                            treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
                            nodes = treeObj.getNodesByParam("gbcode", event.data.data.gbcode, null);
                            nodes[0].online = event.data.data.online;
                            parentNode = nodes[0].getParentNode();
                            // nodes[0].highlight = false;
                            if (nodes[0].online === 1) { //1--在线 0--离线
                                //当父级全选当前直属子级的在线设备时，新设备上线自动勾选；
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (node.level === nodes[0].level && node.online === 1)
                                }, false, parentNode);
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, parentNode);
                                if (parentNode.checked && childNodes && childCheckedNodes && (childNodes.length - 1 === childCheckedNodes.length)) {
                                    treeObj.checkNode(nodes[0], true, true, true);
                                    // nodes[0].checked = true;
                                }

                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        nodes[0].icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        nodes[0].icon = '/static/image/sszhxt/platform_online.png';
                                    } else {
                                        // nodes[0].icon = '/static/image/sszhxt/device_online.png';
                                        nodes[0].icon = '/static/image/sszhxt/device_offline.png'
                                    }
                                } else {
                                    //多通道
                                    if (event.data.data.mytype == 1) {
                                        nodes[0].icon = '/static/image/sszhxt/fastDevonline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        nodes[0].icon = '/static/image/sszhxt/caronline.png';
                                    } else {
                                        nodes[0].icon = '/static/image/sszhxt/Droneonline.png';
                                    }

                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            let node = treeObj.getNodeByParam("gbcode", item.gbcode, nodes[0]);
                                            node.icon = '/static/image/sszhxt/channel.png'; //下线图标
                                            node.displayName = item.name;
                                            treeObj.updateNode(node);
                                            //显示在线节点，防止被隐藏的节点上线后不显示
                                            treeObj.showNode(node);
                                        })
                                    }
                                }
                                //显示在线节点，防止被隐藏的节点上线后不显示
                                treeObj.showNode(nodes[0]);
                            } else {
                                //当人员信息变化时，对变化节点进行一些额外操作，比如removerUpdatemarkerArr(nodes[0].deviceId);
                                vm.extraProcessWhenPersonChange(nodes[0]);
                                // nodes[0].checked = false;
                                treeObj.checkNode(nodes[0], false, true, false);
                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        nodes[0].icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        nodes[0].icon = '/static/image/sszhxt/platform_offline.png';
                                    } else {
                                        nodes[0].icon = '/static/image/sszhxt/device_offline.png';
                                    }
                                } else {
                                    if (event.data.data.mytype == 1) { //
                                        nodes[0].icon = '/static/image/sszhxt/fastDevoutline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        nodes[0].icon = '/static/image/sszhxt/caroutline.png';
                                    } else {
                                        nodes[0].icon = '/static/image/sszhxt/Droneoutline.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            let node = treeObj.getNodeByParam("gbcode", item.gbcode, nodes[0]);
                                            node.icon = '/static/image/sszhxt/channeloutline.png'; //下线图标
                                            node.displayName = item.name;
                                            treeObj.checkNode(node, false, true, false);
                                            treeObj.updateNode(node);
                                        })
                                    }
                                }

                                //判断是否只看在线
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (!node.isParent && node.online === 1)
                                }, false, parentNode);
                                if (!childNodes || !childNodes.length) {
                                    //如果直接子元素全都不在线，父级勾选框禁用
                                    // parentNode.checked = false;
                                    treeObj.checkNode(parentNode, false, true, false);
                                    treeObj.updateNode(parentNode)
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            //nodes[0].displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            //执法仪
                            if (!event.data.data.mytype) {
                                if (event.data.data.username != "") {
                                    nodes[0].displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                                } else {
                                    nodes[0].name = nodes[0].name ? nodes[0].name : '-';
                                    nodes[0].displayName = nodes[0].name;
                                }
                            } else {
                                nodes[0].displayName = event.data.data.name;
                            }

                            treeObj.updateNode(nodes[0]);
                            //更改父节点的勾选状态(当子元素都没勾选的时候取消勾选)
                            while (parentNode) {
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, parentNode);
                                if (!childCheckedNodes.length) {
                                    // parentNode.checked = false;
                                    treeObj.checkNode(parentNode, false, true, false);
                                    treeObj.updateNode(parentNode);
                                }
                                parentNode = parentNode.getParentNode();
                            }
                            break;
                        case 'delete':
                            treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
                            //仅在找到要删除的节点时才执行删除操作（防止出现已经删除了再来删的情况）
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, null);
                            if (!activeNode) {
                                return;
                            }
                            // nodes = treeObj.getNodesByParam("gbcode", event.data.data.gbcode, null);
                            parentNode = activeNode.getParentNode();
                            treeObj.removeNode(activeNode);
                            let childNodes = treeObj.getNodesByFilter((node) => {
                                return (!node.isParent && node.online === 1)
                            }, false, parentNode);
                            if (!childNodes || !childNodes.length) {
                                //如果直接子元素全都不在线，父级勾选框禁用
                                // parentNode.checked = false;
                                treeObj.checkNode(parentNode, false, true, false);
                                treeObj.updateNode(parentNode)
                            }
                            break;
                        case 'add':
                            treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
                            //找到要增加节点的父节点
                            nodes = treeObj.getNodesByParam("orgId", event.data.orgId, null);
                            //仅在找不到要增加的节点时才执行增加操作（防止出现已经增加了再来增加的情况）
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, nodes[0]);
                            if (activeNode) {
                                return;
                            }
                            nodes[0].loaded = true;
                            event.data.data.isParent = false;
                            event.data.data.nocheck = false;
                            if (event.data.data.online === 1) {
                                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机

                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        event.data.data.icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        event.data.data.icon = '/static/image/sszhxt/platform_online.png';
                                    } else {
                                        // event.data.data.icon = '/static/image/sszhxt/device_online.png';
                                        event.data.data.icon = '/static/image/sszhxt/device_offline.png'
                                    }
                                } else {
                                    //多通道
                                    if (event.data.data.mytype == 1) {
                                        event.data.data.icon = '/static/image/sszhxt/fastDevonline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        event.data.data.icon = '/static/image/sszhxt/caronline.png';
                                    } else {
                                        event.data.data.icon = '/static/image/sszhxt/Droneonline.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        event.data.data.isParent = true;
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            item.icon = '/static/image/sszhxt/channel.png'; //上线图标
                                            item.displayName = item.name;
                                        })
                                        event.data.data.childs = event.data.data.channelSet;
                                    }
                                }

                            } else {
                                if (event.data.data.mytype == 0) {
                                    if (event.data.data.isLocking) { //0--未锁定，1--锁定
                                        event.data.data.icon = '/static/image/sszhxt/locked.png';
                                    } else if (event.data.data.source) {
                                        event.data.data.icon = '/static/image/sszhxt/platform_offline.png';
                                    } else {
                                        event.data.data.icon = '/static/image/sszhxt/device_offline.png';
                                    }
                                } else {
                                    if (event.data.data.mytype == 1) { //
                                        event.data.data.icon = '/static/image/sszhxt/fastDevoutline.png';
                                    } else if (event.data.data.mytype == 2) {
                                        event.data.data.icon = '/static/image/sszhxt/caroutline.png';
                                    } else {
                                        event.data.data.icon = '/static/image/sszhxt/Droneoutline.png';
                                    }
                                    //多通道的时候，视频监控处理通道,他的children也要处理
                                    if (vm.owner != 'mapConduct') {
                                        event.data.data.isParent = true;
                                        avalon.each(event.data.data.channelSet, function (index, item) {
                                            item.icon = '/static/image/sszhxt/channeloutline.png'; //下线图标
                                            item.displayName = item.name;
                                        })
                                        event.data.data.childs = event.data.data.channelSet;
                                    }
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            //event.data.data.displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            //执法仪
                            if (!event.data.data.mytype) {
                                if (event.data.data.username != "") {
                                    event.data.data.displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                                } else {
                                    event.data.data.name = event.data.data.name ? event.data.data.name : '-';
                                    event.data.data.displayName = event.data.data.name;
                                }
                            } else {
                                event.data.data.displayName = event.data.data.name;
                            }
                            treeObj.addNodes(nodes[0], 0, event.data.data);
                            //判断显示的设备类型是什么
                            hideNodesByDevtype(vm.devType);
                            activeNode = treeObj.getNodeByParam("gbcode", event.data.data.gbcode, nodes[0]);
                            if (event.data.data.online === 1) {
                                treeObj.updateNode(nodes[0])
                                //当父级全选当前直属子级的在线设备时，新增加的在线设备自动勾选
                                let childNodes = treeObj.getNodesByFilter((node) => {
                                    return (node.level === activeNode.level && node.online === 1)
                                }, false, nodes[0]);
                                let childCheckedNodes = treeObj.getNodesByParam("checked", true, nodes[0]);
                                if (nodes[0].checked && childNodes && childCheckedNodes && (childNodes.length - 1 === childCheckedNodes.length)) {
                                    treeObj.checkNode(activeNode, true, true, true);
                                    // activeNode.checked = true;
                                }
                            }
                            break;
                    }
                }
                break;
        }
    }
    /**
     *搜索节点，input可输入警员姓名/警号，查询对应节点
     **/
    function searchNode() {
        if (vm.searchNodeList && vm.searchNodeList.length > 0) {
            updateNodes(false); //去掉之前的高亮的节点
        }

        let obj = vm.keyword;
        ajax({
            url: '/gmvcs/uom/device/dsj/dsjInfo',
            method: 'post',
            contentType: 'String',
            data: obj
        }).then(result => {
            if (result.code != 0) {
                notification.warn({
                    title: languageSelect == "en" ? 'Tips' : '通知',
                    message: languageSelect == "en" ? 'The user or department does not exist' : '找不到相关警员或部门'
                });
                return;
            } else if (result.data.length <= 0) {
                notification.warn({
                    title: languageSelect == "en" ? 'Tips' : '通知',
                    message: languageSelect == "en" ? 'The user or department does not exist' : '找不到相关警员或部门'
                });
                return;
            } else {
                var parentobj = [];
                var parentobjfirst = result.data.map(function (value) {
                    return value.orgId;
                });
                for (var i = 0; i < parentobjfirst.length; i++) {
                    if (parentobj.indexOf(parentobjfirst[i])) {
                        parentobj.push(parentobjfirst[i]); //去重
                    }
                }
                var parents = [];
                avalon.each(parentobj, function (index, el) {
                    var parent = treeObj.getNodesByParam('orgId', el, null)[0];
                    while (parent) {
                        parents.push(parent);
                        parent = parent.getParentNode();
                    }
                    for (var i = parents.length - 1; i >= 0; i--) {
                        if (parents[i].open) {
                            // if (i == 0) {
                            let nodeList = treeObj.getNodesByFilter(function (node) {
                                if (vm.keyword == "" || vm.keyword == "UserName/DeviceName/Dept") {
                                    node = null;
                                    return node;
                                }
                                return new RegExp(vm.keyword).test(node.gbcode) || new RegExp(vm.keyword).test(node.usercode) || new RegExp(vm.keyword, 'i').test(node.username) || new RegExp(vm.keyword, 'i').test(node.name) || new RegExp(vm.keyword, 'i').test(node.orgName) || new RegExp(vm.keyword, 'i').test(node.displayName);
                            }, false, parents[i]);
                            for (var j = 0; j < nodeList.length; j++) {
                                var node = nodeList[j];
                                if (node) {
                                    if (!~vm.searchNodeList.indexOf(node)) {
                                        vm.searchNodeList.push(node);
                                    }

                                    node.highlight = true;
                                    treeObj.updateNode(node);
                                }
                            }

                            // }
                        } else {
                            treeObj.expandNode(parents[i], true, false, true, true);
                        }
                    }
                    parents = [];
                })

            }
        })
    }
    function updateNodes(highlight) {
        for (var i = 0, l = vm.searchNodeList.length; i < l; i++) {
            vm.searchNodeList[i].highlight = highlight;
            treeObj.updateNode(vm.searchNodeList[i]);
        }
    }

    function expandNodes(treeNode) {
        treeObj.expandNode(treeNode, true, false, false, true);
    }

    function getNodeByParam(key, value) {
        return treeObj.getNodeByParam(key, value, null);
    }

    function hideNodesByDevtype(devType) {
        var treeNodes = null;
        treeNodes = treeObj.getNodesByParam("isHidden", true);
        treeObj.showNodes(treeNodes);
        if (devType == 'all') {
            return;
        } else {
            treeNodes = treeObj.getNodesByFilter((node) => {
                return (node.mytype != undefined && node.mytype != devType);
            }, false, null);
            treeObj.hideNodes(treeNodes);
        }
    }

    function destoryTree () {
        treeObj = $.fn.zTree.getZTreeObj("sos-poll-tree");
        treeObj.destroy();
    }

    return {
        init: init,
        searchNode: searchNode,
        onChecked: onChecked,
        updateNodes: updateNodes,
        expandNodes: expandNodes,
        hideNodesByDevtype: hideNodesByDevtype,
        getNodeByParam: getNodeByParam,
        destoryTree: destoryTree
    };
}());

function setHeight() {
    let reduceHeight;
    reduceHeight = vm.spjkBool ? (vm.isJustParent ? 110 : (110 + 32)) : 110;
    $('.ztree-container').height($('.side-bar-main').outerHeight() - reduceHeight);
}