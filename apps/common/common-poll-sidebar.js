/**
 * 实时指挥系统中部分公用的侧边栏
 * @prop {String} owner 标识字符串
 * @prop {Array} recentData 最近项的数据
 * @event {Function} onDeviceClick 最近项数据--直接设备的点击回调
 * @event {Function} onPersonDeviceClick 最近项数据--人员下设备的点击回调
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
    notification
} from "ane";
import ajax from '../../services/ajaxService';
require('/apps/common/common-poll-sidebar.css');
const storage = require('../../services/storageService.js').ret;
const orgModel = require("./common-sszh-treemodel.js");
let vm = null;

avalon.component('ms-poll-sidebar', {
    template: __inline('./common-poll-sidebar.html'),
    defaults: {
        sidebarMode: 0,
        searchNodeList:[],
        keyword: '',
        placholder:'请输入警员姓名/警号/设备名称',
        inputStatus: 0,//0---初始化 1---未输入关键字  2---已输入关键字
        owner: 'poll-tree',
        recentData:[],
        recentList: '',//插槽
        dataStr: '',
        dataJson: {},
        $saveJson: {
            "sidebarMode": 0,
            "keyword": '',
            "expandNodes":[]
        },
        expandNodes:[],//展开的部门节点
        $computed:{
            isDevice: function(){
                return this.sidebarMode === 0;
            }
        },
        fetchRecent(){
            ajax({
                url :'/gmvcs/instruct/mapcommand/recently/log',
                method : 'get'
            }).then( result =>{
                if(result.code !=0){
                    notification.error({
                        title: '通知',
                        message : '获取人员日志信息失败'
                    })
                    return;
                }
                avalon.each(result.data, (key, item) => {
                    if(item.commandType =='DEVICE'){
                        item.name = item.deviceName + '(' + item.deviceId + ')';
                    }else if(item.commandType =='USER'){
                        // item.gbCodeList = ["testcc","test001"]
                        item.name = item.userName + '(' + item.userCode + ')';
                    }
                })
                this.recentData = result.data;
            })
        },
        onDeviceClick:avalon.noop,
        onPersonDeviceClick:avalon.noop,
        onCheck: avalon.noop,
        extraProcessWhenExpand: avalon.noop,
        extraProcessWhenPersonChange: avalon.noop,
        onInit(event) {
            vm = event.vmodel;
            this.$watch('dataJson', (v) => {
                if(v){
                    this.sidebarMode = v.sidebarMode;
                    this.keyword = v.keyword === "" ? this.placholder : v.keyword;
                    this.inputStatus = v.keyword === "" ? 0 : v.inputStatus;
                    this.expandNodes = v.expandNodes.length > 0 ? v.expandNodes : [];
                    this.$saveJson.expandNodes = this.expandNodes;
                    if(v.searchNodeList){
                        this.searchNodeList = v.searchNodeList;
                    }
                }else{
                    this.keyword = this.placholder;
                }
            });
        },
        onReady: function (event) {
            let storageStr = storage.getItem(this.owner);
            this.dataJson = storageStr ? storageStr : null;
            orgTree.init(()=>{
                if(this.inputStatus === 2 && this.keyword !== this.placholder){
                    this.handleSearch();
                }
                for(let i = 0; i < this.expandNodes.length; i++){
                    let node = orgTree.getNodeByParam("orgId",this.expandNodes[i]);
                    orgTree.expandNodes(node);
                }
            });
            this.fetchRecent();
            setHeight();
            $(window).on('resize', setHeight);
            orgModel.orgModel.startUpdateOrgTimer();
            orgModel.orgModel.startUpdatePerTimer();
            orgModel.orgModel.setOwner(this.owner);
        },
        onDispose(){
            orgModel.orgModel.stopUpdateOrgTimer();//清除掉部门更新定时器
            orgModel.orgModel.stopUpdatePerTimer();//清除掉人员更新定时器
            $(window).off('resize', setHeight);
            //this.dataStr = this.$saveJson;
            var a = vm.$model.$saveJson;
            storage.setItem(this.owner,a,0.5);
        },
        handleModeChange(event){
            this.sidebarMode = $(event.target).index();
            if(this.inputStatus === 1){
                this.inputStatus = 0;
                this.keyword = this.placholder;
                this.$saveJson.keyword = this.keyword;
            }
            this.$saveJson.sidebarMode = this.sidebarMode;
            this.$saveJson.searchNodeList = this.searchNodeList;
            if(this.sidebarMode !== 2){
                this.searchNodeList.clear();
                if(this.inputStatus === 2 && this.keyword !== this.placholder){
                    this.handleSearch();
                }
                //orgTree.updateNodes(false);//切换时同时去掉高亮节点
                orgModel.orgModel.triggerHandler();
            }else{
                this.fetchRecent();
            }
        },
        handleSearchInputFocus(event){
            $(event.target).siblings('.fa-close').show();
            if(this.inputStatus === 0 || this.inputStatus === 1){
                this.inputStatus = 2;
                this.keyword = '';
            }
        },
        handleSearchInputBlur(event){
            $(event.target).siblings('.fa-close').hide();
            if($.trim(this.keyword) === ''){
                this.inputStatus = 0;
                this.keyword = this.placholder;
            }else{
                this.inputStatus = 2;
            }
        },
        handleKeyClear(event){
            this.keyword = '';
            $(event.target).siblings('input').val('').focus();
        },
        handleSearch(){
            let reg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
            this.$saveJson.keyword = this.keyword;
            this.$saveJson.inputStatus = this.inputStatus;
            if(this.inputStatus !== 2){
                this.inputStatus = 1;
                return false;
            }
            if(!reg.test(this.keyword)){
                notification.warning({
                    title: '通知',
                    message : '不支持搜索特殊字符，请重新输入'
                });
                $('.sszh-side-bar .input-group input').focus();
                this.$saveJson.keyword = "";
                this.$saveJson.inputStatus = 0;
                return false;
            }
            if(this.sidebarMode !== 2){
                orgTree.searchNode();
            }
        },
        handleQuickSearch(event) {
            if (event.keyCode == 13) {
                $('.sszh-side-bar .input-group input').blur();
                this.handleSearch();
            }
        },
        handleDeviceClick(el,event){
            if(el.commandType !== 'USER' && el.online){
                this.onDeviceClick(event,el);
            }
        },
        handlePersonDeviceClick(item,event){
            this.onPersonDeviceClick(event,item);
        }
    },
    soleSlot: 'recentList'
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
                "Y": "p",
                "N": "p"
            }
        },
        view: {
            fontCss: getFontCss,
            //addHoverDom: addHoverDom,
            //removeHoverDom: removeHoverDom,
            nameIsHTML: true
        },
        callback: {
            beforeClick: beforeClick,
            //beforeExpand:beforeExpand,
            onExpand: zTreeOnExpand,
            onCollapse: zTreeOnCollapse,
            onCheck: onChecked
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
     * 返回字体样式  高光or普通
     * */
    function getFontCss(treeId, treeNode) {
        return (!!treeNode.highlight) ? {
            color: "#0078d7",
            "font-weight": "bold"
        } : {
            color: "#536b82",
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
     * 为节点添加刷新功能(悬浮显示刷新按钮)，暂不加该功能
     */
    function addHoverDom(treeId, treeNode) {
        if (!treeNode.isParent) {
            if (treeNode.online ==1) {
                return;
            }
            let sObj = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#statusBtn_" + treeNode.tId).length > 0) {
                return;
            }
            let addStr = "<span class='button add' id='statusBtn_" + treeNode.tId + "' title='" + getI18NStr('msg.state') + "' onfocus='this.blur();'><i class='fa fa-comment'></i></span>";
            sObj.after(addStr);
            let btn = $("#statusBtn_" + treeNode.tId);
            if (btn) {
                btn.bind("click", function () {
                    let pData = {
                        'deviceIds': [treeNode.deviceId],
                        'deviceType': 100
                    };

                    $.ajax({
                        url: basePath + "/map/command/devicegps.action",
                        method: "post",
                        contentType: "application/json",
                        dataType: 'json',
                        data: JSON.stringify(pData),
                        async: false,
                        cache: false,
                        error: function (evt) {
                            if (evt.status === 404 || evt.statusText === 'Not Found') {
                                alert('登陆超时, 请重新登陆');
                                window.top.document.location.reload();
                                return;
                            }
                            alert(getI18NStr('alert.getDevInfoFail'));
                            return;
                        },
                        success: function (ret) {
                            if (ret.headers.ret != 0) {
                                alert(getI18NStr('alert.getDevInfoFailOffline'));
                                return;
                            }
                            showStatusWnd(treeNode.deviceId, 100, treeNode.userName, treeNode.userCode, treeNode.accountId, ret.body[0].detail.dsjStatus.battery, ret.body[0].detail.dsj.version);
                            if (treeNode.checked == true) {
                                gisUpdateStatusWnd = treeNode.deviceId; //更新地图右上角的信息窗口
                                return;
                            }
                            gisUpdateStatusWnd = null;
                        }
                    });
                    return;
                });
            }
            return;
        }

        let sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) {
            return;
        }
        let addStr = "<span class='button add' id='addBtn_" + treeNode.tId + "' title='" + getI18NStr('msg.update') + "' onfocus='this.blur();'><i class='fa fa-refresh'></i></span>";
        sObj.after(addStr);
        let btn = $("#addBtn_" + treeNode.tId);
        if (btn) {
            btn.bind("click", function () {
                btn.find("i").addClass("fa-spin fa-fw");
                // 清除节点下的警员, 不移除部门
                let nodes = treeObj.getNodesByParam("isParent", true, treeNode);
                let nodesp = treeObj.getNodesByParam("isParent", false, treeNode);
                if (nodesp.length != 0 || nodes.length != 0) {
                    treeObj.removeChildNodes(treeNode);
                }
                let level = treeNode.level;
                let temNodes = [];
                if (nodes.length != 0) {
                    $.each(nodes, function (n, value) {
                        if (level == value.level - 1) {
                            temNodes.push(value);
                        }
                    });

                    treeObj.addNodes(treeNode, temNodes);
                }
                orgModel.orgModel.getOrgPerson(treeNode.orgId, function (data) {
                    $.each(data, function (i, value) {
                        value.isParent = false;
                        value.nocheck = false;
                        //value.checked = isShowMap(value.userCode);
                        // value.checked = isShowMap(value.deviceId);
                        if (value.online==1) {
                            value.chkDisabled = true;
                            value.icon = basePath + "/content/common/images/dis_node_police.png";
                        }
                    }, true);
                    treeObj.addNodes(treeNode, data);
                    treeNode.loaded = true;
                    btn.find("i").removeClass("fa-spin fa-fw");
                    let node = treeObj.getNodesByFilter(function (node) {
                        if (lastValue == "") {
                            node = null;
                            return node;
                        }
                        return node.deviceId == userName || node.userName == userName || node.userCode == userName;
                    }, true, treeNode);
                    if (node) {
                        if (!~nodeList.indexOf(node)) {
                            nodeList.push(node);
                        }
                        node.highlight = true;
                        treeObj.updateNode(node);
                    }
                });
                return false;
            });
        }
    };
    /**
     * 隐藏刷新，暂不加该功能
     */
    function removeHoverDom(treeId, treeNode) {
        if (!treeNode.isParent) {
            $("#statusBtn_" + treeNode.tId).unbind().remove();
        } else {
            $("#addBtn_" + treeNode.tId).unbind().remove();
        }
    };
    /**
     * 勾选父节点，只勾选一级(暂未用到)
     */
    let judge = null;
    function checkNode(treeNode) {
        judge = true;
        let node = treeObj.getNodesByParam('id', treeNode.id);
        if (node.length <= 0) {
            return;
        }
        $('#mapDiv')[0].contentWindow.restoreMap();
        for (let i = 0; i < node[0].children.length; i++) {
            if (node[0].children[i].isParent) {
                continue;
            }
            treeObj.checkNode(node[0].children[i], '', false, true);
        }
        judge = false;
    }
    /**
     * checkbox onCheck事件
     * @param {Object} event
     * @param {String} treeId
     * @param {Object} treeNode
     */
    //勾选时
    function onChecked(event, treeId, treeNode) {
        if(treeNode.checked){
            if(!treeNode.isParent){
                let obj = {};
                let content = {};
                if(vm.sidebarMode == 0){
                    obj.type = 'DEVICE';
                    obj.uid =  treeNode.userRid;
                    content.deviceId = treeNode.gbcode;
                    content.deviceName = treeNode.name;
                    let a = JSON.stringify(content);
                    obj.content = a;
                }else if(vm.sidebarMode == 1){
                    obj.type = 'USER';
                    content.uid = treeNode.userRid;
                    content.userCode = treeNode.usercode;
                    content.userName = treeNode.username;
                    let a = JSON.stringify(content);
                    obj.content = a;
                }
                ajax({
                    url:'/gmvcs/instruct/mapcommand/recently/log/add',
                    method:'post',
                    data:obj
                }).then(result =>{
                    if(result.code!=0){
                        notification.error({
                            title: '通知',
                            message: "新建该用户操作日志失败"
                        });
                    }
                })
            }
        }
       vm.onCheck(event, treeId, treeNode);
    }
    /**
     * 禁用部门树节点的单击
     */
    function beforeClick(treeId, treeNode, clickFlag) {
        return false;
    }
    
    // 当节点展开时
    function zTreeOnExpand(event, treeId, treeNode) {
        if(!needUpdateIds[vm.owner]){
            needUpdateIds[vm.owner] = [];
        }
        var pos = needUpdateIds[vm.owner].indexOf(treeNode.orgId);
        if (pos == -1) {
            needUpdateIds[vm.owner].push(treeNode.orgId);
            addHandler(events.PERSON_UPDATED, onPersonInfoChange, vm.owner, needUpdateIds[vm.owner]);
        }
        if(vm.expandNodes.indexOf(treeNode.orgId) == -1){
            vm.expandNodes.push(treeNode.orgId);
            vm.$saveJson.expandNodes = vm.expandNodes;
        }
        if (treeNode.loaded) {
            //表示该节点的已经请求过数据加载了
            let nodeList = treeObj.getNodesByFilter(function(node) {
                if(vm.keyword == ""|| vm.keyword == vm.placholder){
                    node = null;
                    return node;
                }
                return new RegExp(vm.keyword).test(node.usercode)|| new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.name);
            }, false, treeNode);
            if (nodeList) {
                for(var j=0;j<nodeList.length;j++ ){
                    var node = nodeList[j];
                    if (node) {
                        if (!~ vm.searchNodeList.indexOf(node)) {
                            vm.searchNodeList.push(node);
                        }

                        node.highlight = true;
                        treeObj.updateNode(node);
                    }
                }
            }
            return;
        }
        orgModel.orgModel.getOrgPerson(treeNode.orgId, function (data) {
            treeNode.loaded = true;
            avalon.each(data, function (i, value) {
                value.isParent = false;
                // value.nocheck = value.gbcode == "";
                value.nocheck = false;
                // value.displayName = value.username + "执法仪";
                if (vm.isDevice) {
                    value.displayName = value.username + "("+ value.name+")";
                } else{
                    value.displayName = value.username + "(" + value.usercode + ')';
                }
                if (value.online === 0) {//0在线1不在线
                    value.chkDisabled = false;
                    if (vm.isDevice) {
                        value.icon = '/static/image/sszhxt/device.png';
                    } else{
                        value.icon = '/static/image/sszhxt/person.png';
                    }
                }else{
                    value.chkDisabled = true;
                    if (vm.isDevice) {
                        value.icon = '/static/image/sszhxt/device_offline.png';
                    } else{
                        value.icon = '/static/image/sszhxt/person_offline.png';
                    }
                }
                //对value的一些额外的操作，比如value.checked = isShowMap(value.deviceId);
                vm.extraProcessWhenExpand(i, value);
            });
            treeObj.addNodes(treeNode, data);
            let nodeList = treeObj.getNodesByFilter(function(node) {
                if(vm.keyword == "" || vm.keyword == vm.placholder){
                    node = null;
                    return node;
                }
                return new RegExp(vm.keyword).test(node.usercode)|| new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.name);
                }, false, treeNode);
            if (nodeList) {
                for(var j=0;j<nodeList.length;j++ ){
                    var node = nodeList[j];
                    if (node) {
                        if (!~ vm.searchNodeList.indexOf(node)) {
                            vm.searchNodeList.push(node);
                        }

                        node.highlight = true;
                        treeObj.updateNode(node);
                    }
                }
            }
        });
    }
    
    // 节点折叠事件
    function zTreeOnCollapse(event, treeId, treeNode) {
        let nodePos = vm.expandNodes.indexOf(treeNode.orgId);
        if(nodePos > 0){
            vm.expandNodes.splice(nodePos,1);
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
                $.fn.zTree.init($("#poll-tree"), setting, ret);
                treeObj = $.fn.zTree.getZTreeObj("poll-tree");
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
        treeObj = $.fn.zTree.getZTreeObj("poll-tree");
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
                            if (event.data.data.parentId != -1) {
                                //这个地方上是有bug的，需要后台配合放回他的父部门orgid,以此查找部门树，插入节点，现在后台没时间。。。
                                nodes = treeObj.getNodeByParam("orgId", event.data.data.parentId, null);
                            }
                            treeObj.addNodes(nodes, event.data.data);
                            break;
                    }
                }
                break;
        }
    }
    
    // 人员信息变更时响应函数
    function onPersonInfoChange(event) {
        let nodes;
        if (!~needUpdateIds[vm.owner].indexOf(event.data.orgId)) {
            return;
        }
        switch (event.type) {
            case events.PERSON_UPDATED:
                {
                    switch (event.data.type) {
                        case 'change':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            nodes = treeObj.getNodesByParam("rid", event.data.data.rid, null);
                            nodes[0].online = event.data.data.online;
                            // nodes[0].highlight = false;
                            if (nodes[0].online === 0) {//0--在线 1--离线
                                nodes[0].chkDisabled = false;
                                if (vm.isDevice) {
                                    nodes[0].icon = '/static/image/sszhxt/device.png';
                                } else{
                                    nodes[0].icon = '/static/image/sszhxt/person.png';
                                }
                            } else {
                                //当人员信息变化时，对变化节点进行一些额外操作，比如removerUpdatemarkerArr(nodes[0].deviceId);
                                vm.extraProcessWhenPersonChange(nodes[0]);
                                nodes[0].checked = false;
                                nodes[0].chkDisabled = true;
                                if (vm.isDevice) {
                                    nodes[0].icon = '/static/image/sszhxt/device_offline.png';
                                } else{
                                    nodes[0].icon = '/static/image/sszhxt/person_offline.png';
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            if (vm.isDevice) {
                                nodes[0].displayName = event.data.data.username + "(" + event.data.data.name +")";
                            } else{
                                nodes[0].displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            }
                            treeObj.updateNode(nodes[0]);
                            break;
                        case 'delete':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            nodes = treeObj.getNodesByParam("rid", event.data.data.rid, null);
                            treeObj.removeNode(nodes[0]);
                            break;
                        case 'add':
                            treeObj = $.fn.zTree.getZTreeObj("poll-tree");
                            nodes = treeObj.getNodesByParam("orgId", event.data.orgId, null);
                            event.data.data.isParent = false;
                            event.data.data.nocheck = false;
                            if (event.data.data.online === 0) {
                                event.data.data.chkDisabled = false;
                                if (vm.isDevice) {
                                    event.data.data.icon = '/static/image/sszhxt/device.png';
                                } else{
                                    event.data.data.icon = '/static/image/sszhxt/person.png';
                                }
                            }else{
                                event.data.data.chkDisabled = true;
                                if (vm.isDevice) {
                                    event.data.data.icon = '/static/image/sszhxt/device_offline.png';
                                } else{
                                    event.data.data.icon = '/static/image/sszhxt/person_offline.png';
                                }
                            }
                            //控制是显示人名设备还是人名警号
                            if (vm.isDevice) {
                                event.data.data.displayName = event.data.data.username + "("+ event.data.data.name +")";
                            } else {
                                event.data.data.displayName = event.data.data.username + "(" + event.data.data.usercode + ')';
                            }
                            treeObj.addNodes(nodes[0], event.data.data);
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
        if(vm.searchNodeList&&vm.searchNodeList.length >0){
            updateNodes(false);//去掉之前的高亮的节点
        }
        let obj = {};
        obj.dsjInfo = vm.keyword;
        let data ={};
        data = vm.keyword;
        ajax({
            url:'/gmvcs/uom/device/dsj/dsjInfo',
            method:'post',
            data:data
        }).then(result =>{
            if(result.code!=0){
                notification.warn({
                    title: '通知',
                    message: "找不到警员和设备"
                });
                return;
            }else if(result.data.length <=0){
                notification.warn({
                    title: '通知',
                    message: "找不到警员和设备"
                });
                return;
            } else {
                var parentobj =[];
                var parentobjfirst  = result.data.map(function (value) {
                    return value.orgId;
                });
                for(var i=0;i<parentobjfirst.length;i++){
                    if(parentobj.indexOf(parentobjfirst[i])){
                        parentobj.push(parentobjfirst[i]);//去重
                    }
                }
                var parents=[];
                avalon.each(parentobj, function (index ,el) {
                    var parent = treeObj.getNodesByParam('orgId',el, null)[0];
                    while (parent) {
                        parents.push(parent);
                        parent = parent.getParentNode();
                    }
                    for(var i=parents.length-1; i>=0; i--){
                        if(parents[i].open){
                            // if (i == 0) {
                            let nodeList = treeObj.getNodesByFilter(function(node) {
                                if(vm.keyword == ""||vm.keyword=="请输入关键字后再搜索"){
                                    node = null;
                                    return node;
                                }
                                return new RegExp(vm.keyword).test(node.usercode)|| new RegExp(vm.keyword).test(node.username) || new RegExp(vm.keyword).test(node.name);
                            }, false, parents[i]);
                            for(var j=0;j<nodeList.length;j++ ){
                                var node = nodeList[j];
                                if (node) {
                                    if (!~ vm.searchNodeList.indexOf(node)) {
                                        vm.searchNodeList.push(node);
                                    }

                                    node.highlight = true;
                                    treeObj.updateNode(node);
                                }
                            }

                           // }
                        }else{
                            treeObj.expandNode(parents[i], true,false, true, true);
                        }
                    }
                    parents = [];
                })

            }
        })
    }
    // 保存当前搜索的警员信息与节点
    //var lastValue = "", nodeList = [];
    //搜索部门树
    // function searchNode() {
    //     updateNodes(false); //去掉之前的高亮的节点
    //     vm.searchNodeList = treeObj.getNodesByParamFuzzy('displayName', vm.keyword); //保存查找到的节点集合
    //     if (vm.searchNodeList.length == 0) {
    //         notification.warn({
    //             title: '通知',
    //             message: "找不到该警员"
    //         });
    //         return;
    //     }
    //     avalon.each(vm.searchNodeList, function (index, el) {
    //         let node = el;
    //         if (!node.isParent) {
    //             let parentNode = node.getParentNode();
    //             treeObj.expandNode(parentNode, true);
    //         } else {
    //             treeObj.expandNode(node, true);
    //         }
    //     })
    //     updateNodes(true);
    // }
    /**
     * 更新所有符合搜索条件的节点字体样式
     * */
    function updateNodes(highlight) {
        for (var i = 0, l = vm.searchNodeList.length; i < l; i++) {
            vm.searchNodeList[i].highlight = highlight;
            treeObj.updateNode(vm.searchNodeList[i]);
        }
    }
    function expandNodes(treeNode){
        treeObj.expandNode(treeNode, true, false, false,true);
    }
    function getNodeByParam(key, value){
        return treeObj.getNodeByParam(key, value, null);
    }
    return {
        init: init,
        searchNode: searchNode,
        onChecked: onChecked,
        updateNodes: updateNodes,
        expandNodes: expandNodes,
        getNodeByParam: getNodeByParam
    };
}());

function setHeight(){
    $('.ztree-container').height($('.side-bar-main').outerHeight() - 40);
}