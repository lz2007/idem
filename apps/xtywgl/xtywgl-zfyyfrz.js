import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import $ from 'jquery';
import "ane";
import moment from 'moment';
import {
    createForm,
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
import {
    apiUrl,
    languageSelect
} from '../../services/configService';
let icon_dep = '../../static/image/tyywglpt/org.png';
let language_txt = require('../../vendor/language').language;
export const name = 'xtywgl-zfyyfrz';
const listHeaderName = name + "-list-header";
const storage = require('../../services/storageService.js').ret;
require('./xtywgl-zfyyfrz.less');
var zfyyfrzObj = null;
var recordData = new Object();
var zfyyfrzinitParams = new Object();
let local_storage = {
    "table_list": [],
    "page": ""
};
let vm = avalon.component(name, {
    template: __inline('./xtywgl-zfyyfrz.html'),
    defaults: {
        zfyyfrz_txt: language_txt.xtywgl.zfyyfrz,
        searchAjax: searchStationAjax,
        orgData: [],
        expandedKeys: [],
        searchInputValue: '',
        searchResults: [],
        orgId: '',
        selectedTitle: '',
        orgPath: '',
        treeObj: null,
        getResultItems: [],
        isInitSelect: true,
        record: null,
        parentsNodeOrgIds: [], //存储左边已经获取过下面子集的机构id集合
        isForced: false, // 是否勾选强制升级(0/false代表不强制;1/true强制)
        lblForcedBWCsUpgradeImg: "/static/image/sszhxt/check_unselected.png",
        selectName: language_txt.xtywgl.zfyyfrz.noDeviceSelected, //标题——采集站名称
        checkAll: false, //是否全选
        hasReturn: false, //是否可以返回
        checkedDate: [],  //勾选中的需下载文件
        list: [], //文件数据数组
        hrefList: [], //面包屑
        clickNum: 0, //用来判断点击的位置，模拟数据
        clickFolderNum: 0, //用来判断是否显示根目录路径，值为1则显示
        loading: false, 
        hasFileData: false,  //判断list数组数据中有无可下载的文件数据
        userIp: "", //IP地址
        httpORhttps: "https", //判断当前环境是http还是https
        isselectparent: false, //当前选中的是否为文件夹而不是采集站
        ajaxIsEnd: true, //ajax请求是否完成
        currentNode: {}, //上一次选中的采集站
        authority: { //功能权限控制
            "DOWNLOAD": false, //下载
        },
        returnBtn(href,hrefIndex) {
            if(hrefIndex == this.hrefList.length-1) {//当点击的href是当前展示的路径时,return
                return;
            }
            this.loading = true;
            let _this = this;
            this.checkAll = false;
            this.checkedDate = [];
            _this.list = [];
                let hrefIndexDel = hrefIndex + 1; //开始删除位置
                let delLen = _this.hrefList.length - hrefIndexDel;  //删除长度
                _this.hrefList.splice(hrefIndexDel,delLen)
            if(href == _this.selectName) {//如果返回的是根目录
                _this.clickFolderNum = 0;
                _this.hrefList = [];
            }
            let ngUrl = "http://" + _this.userIp + ":8118";
            for(let i = 1; i < _this.hrefList.length; i++) {
                ngUrl += "/" +  _this.hrefList[i];
            }
            ajax({
                url: '/gmvcs/docking/station/ds/get/log',
                method: 'post',
                data: {
                    "nginxUrl": ngUrl,
                }
            }).then(result => {
                let ajaxData = result;
                if(ajaxData.code == 0 && ajaxData.data.length !== 0) {
                    let tempData = ajaxData.data;
                    if(tempData[0].name == "../") {
                        tempData.shift();
                        _this.hasReturn = true;
                    }
                    for(let i = 0; i < tempData.length; i++) {
                        tempData[i]["checked"] = false;
                        tempData[i]["showCheck"] = true;  //showCheck用来判断当前数据是否为文件
                        if(tempData[i].name.indexOf("/") !== -1) {
                            tempData[i]["checked"] = false;
                            tempData[i]["showCheck"] = false; //showCheck用来判断当前数据是否为文件
                        }
                    }
                    _this.list = tempData;
                    _this.hasFileData = false;
                    if(_this.list.length == 0) { //当list数组无数据时
                        _this.hasFileData = false;
                    } else {  //当list数组有数据时
                        let listDataShowCheck = false;
                        for(let i = 0; i < _this.list.length; i++) {
                            if(_this.list[i].showCheck) {
                                listDataShowCheck = true;
                                break;
                            }
                        }
                        if(listDataShowCheck) { //当list数组存有文件时
                            _this.hasFileData = true;
                        }else { //当list数组存的是文件夹,没有存没有文件时
                            _this.hasFileData = false;
                        }
                    }
                }else if(ajaxData.code == 0 && ajaxData.data.length == 0) {
                }else {
                    notification.error({
                        message: result.msg,
                        title: language_txt.xtywgl.zfyyfrz.tips
                    });
                    _this.loading = false;
                }
                _this.loading = false;
            });
        },
        openFolder(folderName) {
            this.loading = true;
            let _this = this;
            this.checkAll = false;
            this.checkedDate = [];
            _this.list = [];
                _this.clickFolderNum += 1;
                if(_this.clickFolderNum == 1) { //点击第一个文件夹是添加第一层目录名
                    _this.hrefList.push(_this.selectName);
                }
                let hrefUrl = "";
                for(let i = 1; i < this.hrefList.length; i++) {
                    hrefUrl += "/" + this.hrefList[i];
                }
                ajax({
                    url: '/gmvcs/docking/station/ds/get/log',
                    method: 'post',
                    data: {
                        "nginxUrl": "http://" + _this.userIp + ":8118" + hrefUrl + "/" + folderName,
                    }
                }).then(result => {
                    let ajaxData = result;
                    if(ajaxData.code == 0 && ajaxData.data.length !== 0) {
                        let tempData = ajaxData.data;
                        if(tempData[0].name == "../") {
                            tempData.shift();
                            _this.hasReturn = true;
                        }
                        for(let i = 0; i < tempData.length; i++) {
                            tempData[i]["checked"] = false;
                            tempData[i]["showCheck"] = true;  //showCheck用来判断当前数据是否为文件
                            if(tempData[i].name.indexOf("/") !== -1) {
                                tempData[i]["checked"] = false;
                                tempData[i]["showCheck"] = false; //showCheck用来判断当前数据是否为文件
                            }
                        }
                        _this.list = tempData;
                        _this.hasFileData = false;
                        if(_this.list.length == 0) { //当list数组无数据时
                            _this.hasFileData = false;
                        } else {  //当list数组有数据时
                            let listDataShowCheck = false;
                            for(let i = 0; i < _this.list.length; i++) {
                                if(_this.list[i].showCheck) {
                                    listDataShowCheck = true;
                                    break;
                                }
                            }
                            if(listDataShowCheck) { //当list数组存有文件时
                                _this.hasFileData = true;
                            }else { //当list数组存的是文件夹,没有存没有文件时
                                _this.hasFileData = false;
                            }
                        }
                    }else if(ajaxData.code == 0 && ajaxData.data.length == 0) {
                    }else {
                        notification.error({
                            message: result.msg,
                            title: language_txt.xtywgl.zfyyfrz.tips
                        });
                        _this.loading = false;
                    }
                    _this.hrefList.push(folderName.replace("/",""));
                    _this.loading = false;
                });
        },
        handleCheckAll(e) {
            this.checkedDate = [];
            let listData = this.list;
            if(e.target.checked) {
                for(let i = 0; i < this.list.length; i++) {
                    this.list[i].checked = true;
                    this.checkedDate.push(this.list[i]);
                }
            }else {
                for(let i = 0; i < this.list.length; i++) {
                    this.list[i].checked = false;
                    if(this.list[i].name.indexOf("/") !== -1) { //文件夹一直保持选中状态
                        this.list[i].checked = false;
                    }
                }
            }
        },
        handleCheck(index, record, e) {
            this.checkedDate = [];
            let unCheckedNum = 0;
            let checkedNum = 0;
            for(let i = 0; i < this.list.length; i++) {
                if (this.list[i].checked) {
                    checkedNum += 1;
                    this.checkedDate.push(this.list[i]);
                } else {
                    unCheckedNum += 1;
                }
            }
            if(checkedNum == this.list.length) {
                this.checkAll = true;
            }else {
                this.checkAll = false;
            }
        },
        download() {
            if(this.checkedDate.length == 0) { //当checkData数组无数据时
                notification.warn({
                    message: language_txt.xtywgl.zfyyfrz.noCheckedDate,
                    title: language_txt.xtywgl.zfyyfrz.tips
                });
                return;
            } 
            let hrefStr = "";
            let detailHrefArr = [];
            let allDetailHrefArr = [];
            let currentPath = '';
            for(let i = 1; i < this.hrefList.length; i++) {
                hrefStr += this.hrefList[i] + "/";
            }
            currentPath = "http://" + this.userIp + ":8118" + "/" + hrefStr;
            allDetailHrefArr.push(currentPath);
            for(let i = 0; i < this.checkedDate.length; i++) {
                    let detailFrefStr = hrefStr;
                    detailFrefStr += this.checkedDate[i].href;
                    detailHrefArr.push(detailFrefStr);
            }
            let _this = this;
            for(let i = 0; i < detailHrefArr.length; i++) {
                    let download_url = "http://" + _this.userIp + ":8118" + "/" + detailHrefArr[i];
                    allDetailHrefArr.push(download_url);
            }
            ajax({
                url: '/gmvcs/docking/station/ds/compressedstr',
                method: 'post',
                data: {
                    "value": allDetailHrefArr.join(","),
                }
            }).then(result => {
                if(result.code == 0) {
                    let packageDownStr = result.data.value;
                    // let package_download_url = window.location.origin + '/apis/gmvcs/docking/station/ds/download/log?compressedstr=' + packageDownStr;
                    // let package_download_url = window.location.origin + '/gmvcs/docking/station/ds/download/log?compressedstr=' + packageDownStr;
                    let package_download_url = window.location.origin + apiUrl + '/gmvcs/docking/station/ds/download/log?compressedstr=' + packageDownStr;
                    window.open(package_download_url); //下载
                } else {
                    _this.sayError(_this.zfyyfrz_txt.downloadFail);
                }
            });
        },
        sayError: function (word) {
            notification.error({
                message: word,
                title: language_txt.xtywgl.zfyyfrz.tips
            });
        },
        onInit(event) {
            this.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_unselected.png";
            this.isForced = false;
            this.searchInputValue = "";
            this.getTree();
            this.isselectparent = true; //初始化时设置当前为未选中设备状态
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNCTION_YFRZ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                let _this = this;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNCTION_YFRZ_DOWNLOAD": //用户管理_导入
                            _this.authority.DOWNLOAD = true;
                            break;
                    }
                });
            });
            let hrefLocal = window.location.href;
            this.httpORhttps = hrefLocal.split(":")[0];
        },
        onReady() {
            this.treeObj = $.fn.zTree.getZTreeObj($('.AllocationDialog  .ztree').attr('id'));
        },
        handleExportCheck() {
            this.isForced = !this.isForced;
            if (this.isForced) {
                this.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_selected_bek_en.png";
            } else {
                this.lblForcedBWCsUpgradeImg = "/static/image/sszhxt/check_unselected.png";
            }
        },
        handleOk() {
            let _this = this;
            let gbCode = [],
                orgArr = [];
            if (this.getResultItems.length > 0) { //有勾选部门树，且不是初始化的勾选全树
                avalon.each(this.getResultItems, (index, item) => {
                    if (item.isParent) {
                        let obj = {
                            orgId: item.orgId,
                            orgPath: item.orgPath,
                        }
                        orgArr.push(obj);
                    } else {
                        gbCode.push(item.gbCode);
                    }
                });
            } else {
                if (this.isInitSelect) { //默认勾选全树的时候
                    avalon.each(this.orgData, (i, el) => {
                        let obj = {
                            orgId: el.orgId,
                            orgPath: el.orgPath,
                        }
                        orgArr.push(obj);
                    });
                }
            }
            if (orgArr.length == 0 && gbCode.length == 0) {
                notification.warn({
                    message: language_txt.xtywgl.zfywjscfw.selectWS,
                    title: language_txt.xtywgl.zfyyfrz.tips
                });
                return;
            }
            if (orgArr.length > 0) { //有勾选设备和部门的时候，需要查出gbCode才可以下发
                let state = false,
                    sendTimer = null;
                avalon.each(orgArr, (i, item) => {
                    ajax({
                        url: '/gmvcs/uom/device/workstation/list',
                        method: 'post',
                        data: {
                            "orgId": item.orgId,
                            "orgPath": item.orgPath,
                            "csId": null,
                            "moduleNum": null,
                            "includeChild": true,
                            "page": 0,
                            "pageSize": 999999
                        }
                    }).then(result => {
                        if (result.data.wss && result.data.wss.length > 0) {
                            avalon.each(result.data.wss, (k, v) => {
                                gbCode.push(v.gbCode);
                                if (i + 1 == orgArr.length) {
                                    state = true;
                                }
                            });
                        } else {
                            if (i + 1 == orgArr.length) {
                                state = true;
                            }
                        }
                    });
                });
                clearTimeout(sendTimer);
                sendTimer = setInterval(() => { //设置定时器，目的是为了等上面的接口返回了gbcode再进行下发
                    if (state) {
                        clearTimeout(sendTimer);
                        state = false;
                        if (gbCode.length == 0) {
                            notification.warn({
                                message: language_txt.xtywgl.zfywjscfw.noSW,
                                title: language_txt.xtywgl.zfyyfrz.tips
                            });
                            return;
                        }
                        stationAssignAjax(gbCode).then((ret) => {
                            if (ret.code == 0) {
                                notification.success({
                                    message: language_txt.xtywgl.zfywjscfw.successSend,
                                    title: language_txt.xtywgl.zfyyfrz.tips
                                });
                                _this.parentsNodeOrgIds = [];
                            } else {
                                _this.sayError(ret.msg);
                            }
                        });
                    }
                }, 200);
            } else { //只有设备的时候，可以直接下发
                stationAssignAjax(gbCode).then((ret) => {
                    if (ret.code == 0) {
                        notification.success({
                            message: language_txt.xtywgl.zfyyfrz.successSend,
                            title: language_txt.xtywgl.zfyyfrz.tips
                        });
                        this.parentsNodeOrgIds = [];
                    } else {
                        this.sayError(ret.msg);
                    }
                });
            }
        },
        handleCancle() {
            this.parentsNodeOrgIds = [];
        },
        handleBeforeExpand(treeId, treeNode) {
            if (!treeNode.children || treeNode.children.length == 0) {
                this.extraExpandHandle(treeId, treeNode);
            }
            let _this = this;
            let orgId = treeNode['key'];
            _this.getNodesByOrgId(orgId, treeNode, treeId);
        },
        getNodesByOrgId(orgId, treeNode, treeId) {
            let _this = this;
            if (_this.parentsNodeOrgIds.indexOf(orgId) == -1) {
                _this.parentsNodeOrgIds.push(orgId);
                getStationByOrgIdAjax(orgId).then((ret) => {
                    if (ret.code == 0) {
                        let data2;
                        data2 = ret.data.tBasicInfos;
                        data2 = data2.map((item) => { //获取执法仪的接口orgName会有空的情况,直接从树上拿名称才能在右边展示
                            return {
                                key: item['rid'],
                                title: item['name'],
                                storageId: item['storageId'],
                                gbCode: item['gbcode'],
                                orgId: item['orgId'],
                                orgName: item['orgName'] || treeNode['title'],
                                rid: item['rid'],
                                name: item['name'],
                                active: false
                            };
                        });
                        let addResultNodes = _this.treeObj.addNodes(treeNode, 0, data2);
                        _this.highlightNodes(_this.hasAddChildNodes, _this.searchResults);
                        //标记与搜索结果相同的节点高亮
                        let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                            if ($.trim(_this.searchInputValue) == "") {
                                node = null;
                                return node;
                            }
                            return new RegExp(_this.searchInputValue).test(node.name);
                        }, false, treeNode);
                        for (var j = 0; j < nodeList.length; j++) {
                            var node = nodeList[j];
                            if (node) {
                                node.highlight = true;
                                _this.treeObj.updateNode(node);
                            }
                        }
                    } else {
                        _this.sayError(language_txt.xtywgl.cjzscfwgl.errorInObtainingTheCollectionStationAccordingToTheInstitutionIdErrorCode + ret.code);
                    }
                });
            }
        },
        highlightNodes(hasAddChildNodes, searchNodes) {
            let _this = this;
            avalon.each(searchNodes, function (key, val) {
                avalon.each(hasAddChildNodes, function (index, value) {
                    if (val['rid'] == value['key']) {
                        value.highlight = true;
                        _this.treeObj.updateNode(value);
                        if (_this.hasPosFlag == false) {
                            _this.posFirstHighlightNode();
                            _this.hasPosFlag = true;
                        }
                    }
                });
            });
        },
        onSelect(e, targetObj) {
            let _this = this;
            if(this.ajaxIsEnd == false) { //如有请求未完成
                let targetaLen = $(".ywzx-zfyyfrz .ztree li a").length;
                for(let i = 0; i < targetaLen; i++) { //全部a标签都去除class
                    $($(".ywzx-zfyyfrz .ztree li a")[i]).removeClass("curSelectedNode");
                }
                $($(this.currentNode)[0].firstChild).parent().addClass("curSelectedNode"); //给请求中的a标签增加class
                return
            }else if (this.ajaxIsEnd == true) {
                if($(this.currentNode)[0].children) {
                    if($(targetObj.event.target).parent()[0].text == $(this.currentNode)[0].title) {
                    } else {
                        $($(this.currentNode)[0].firstChild).parent().removeClass("curSelectedNode");
                    }
                }
            }
            this.loading = false;
            this.list = [];
            this.hrefList = [];
            this.clickFolderNum = 0;
            this.hasReturn = false;
            this.checkAll = false;
            this.checkedDate = [];
            this.isselectparent = false;
            if(targetObj.node.isParent) {
                this.isselectparent = true;
                this.selectName = this.zfyyfrz_txt.noDeviceSelected;
                return;
            }
            this.currentNode = targetObj.event.target.parentElement; //存入当前选中的a标签节点
            this.clickNum = 1;
            _this.selectName = targetObj.node.title;
            let node = targetObj['node'];
            if (/org/g.test(node['icon'])) { //单击父节点获取采集站
                let $ztree = $('#ccfwglassign .ztree');
                let treeId = $ztree.attr('id');
                _this.getNodesByOrgId(node['key'], node, treeId);
                _this.extraExpandHandle(treeId, node);
            } else { //单击采集站分配,支持ctrl多选
            }
            _this.loading = true;
            ajax({ //获取IP
                url: '/gmvcs/uom/device/workstation/info/' + e[0],
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {
                if(ret.code == 0) {
                    _this.userIp = ret.data.ipAddr; //IP地址
                    //还未请求成功
                    _this.ajaxIsEnd = false;
                    let aLen = $(".ywzx-zfyyfrz .ztree li a").length;
                    for(let i = 0; i < aLen; i++) {
                        $($(".ywzx-zfyyfrz .ztree li a")[i]).css('cursor', 'not-allowed');
                    }
                    ajax({
                        url: '/gmvcs/docking/station/ds/get/log',
                        method: 'post',
                        data: {
                            "nginxUrl": "http://" +  _this.userIp + ":8118",
                        }
                    }).then(result => {
                        //请求成功
                        _this.ajaxIsEnd = true;
                        let aLen = $(".ywzx-zfyyfrz .ztree li a").length;
                        for(let i = 0; i < aLen; i++) {
                            $($(".ywzx-zfyyfrz .ztree li a")[i]).css('cursor', 'pointer');
                        }
                        let ajaxData = result;
                        if(ajaxData.code == 0 && ajaxData.data.length !== 0) {
                            let tempData = ajaxData.data;
                            if(tempData[0].name == "../") {
                                tempData.shift();
                                _this.hasReturn = true;
                            }
                            for(let i = 0; i < tempData.length; i++) {
                                tempData[i]["checked"] = false;
                                tempData[i]["showCheck"] = true;  //showCheck用来判断当前数据是否为文件
                                if(tempData[i].name.indexOf("/") !== -1) {
                                    tempData[i]["checked"] = false;
                                    tempData[i]["showCheck"] = false; //showCheck用来判断当前数据是否为文件
                                }
                            }
                            _this.list = tempData;
                            _this.hasFileData = false;
                            if(_this.list.length == 0) { //当list数组无数据时
                                _this.hasFileData = false;
                            } else {  //当list数组有数据时
                                let listDataShowCheck = false;
                                for(let i = 0; i < _this.list.length; i++) {
                                    if(_this.list[i].showCheck) {
                                        listDataShowCheck = true;
                                        break;
                                    }
                                }
                                if(listDataShowCheck) { //当list数组存有文件时
                                    _this.hasFileData = true;
                                }else { //当list数组存的是文件夹,没有存没有文件时
                                    _this.hasFileData = false;
                                }
                            }
                        }else if(ajaxData.code == 0 && ajaxData.data.length == 0) {

                        }else {
                            notification.error({
                                message: result.msg,
                                title: language_txt.xtywgl.zfyyfrz.tips
                            });
                            _this.loading = false;
                        }
                        _this.loading = false;
                    });
                }else {
                    notification.error({
                        message: ret.msg,
                        title: language_txt.xtywgl.zfyyfrz.tips
                    });
                    _this.loading = false;
                }
            });
        },
        handleSearchClick() {
            if ($.trim(this.searchInputValue) == "") {
                this.delightNodes(); //清除高亮
                return;
            } 
            let _this = this;
            _this.delightNodes();
            _this.hasPosFlag = false;
            _this.searchAjax(_this.searchInputValue).then((ret) => {
                if (ret.data.length <= 0) {
                    _this.sayError(this.zfyyfrz_txt.noResult);
                    return;
                }
                //切割orgpath
                avalon.each(ret.data, function (index, value) {
                    let temp = value.split('/');
                    temp.splice(0, 1);
                    avalon.each(temp, function (key, item) {
                        var nodes = _this.treeObj.getNodesByFilter(function (node) {
                            return (node.orgCode == item || node.orgId == item);
                        });
                        _this.treeObj.expandNode(nodes[0], true, false, true, true);
                    })
                })
                //标记与搜索结果相同的节点高亮
                let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                    if ($.trim(_this.searchInputValue) == "") {
                        node = null;
                        return node;
                    }
                    return !node.isParent && new RegExp(_this.searchInputValue).test(node.name);
                }, false);
                for (var j = 0; j < nodeList.length; j++) {
                    var node = nodeList[j];
                    if (node) {
                        node.highlight = true;
                        _this.treeObj.updateNode(node);
                    }
                }
            })
        },
        delightNodes() {
            let _this = this;
            let nodelist = _this.treeObj.getNodesByFilter(function (node) {
                return node.highlight == true;
            })
            avalon.each(nodelist, function (key, val) {
                val.highlight = false;
                _this.treeObj.updateNode(val);
            });
        },
        handleSearchEnter(e) {
            if (e.keyCode == 13 && ($.trim(this.searchInputValue) != "")) {
                this.handleSearchClick();
                return false; //阻止ie8弹框中的确定，取消按钮事件
            } else if (e.keyCode == 13 && ($.trim(this.searchInputValue) == "")) {
                this.delightNodes(); //清除高亮
                return false;
            }
        },
        getTree() {
            const self = this;
            //所属机构下拉请求
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    self.getResultItems = [];
                    let data = changeTreeData(ret.data);
                    self.orgData = data;
                    self.orgId = data[0].orgId;
                    self.orgPath = data[0].path;
                    self.isInitSelect = true;
                } else {
                    self.sayError('Fail!');
                }
            });
        },
        addIcon(arr) {
            const self = this;
            // 深拷贝原始数据
            let dataSource = JSON.parse(JSON.stringify(arr))
            let res = [];
            // 每一层的数据都 push 进 res
            res.push(...dataSource);
            // res 动态增加长度
            for (let i = 0; i < res.length; i++) {
                let curData = res[i];
                curData.icon = icon_dep;
                curData.key = curData.orgId;
                curData.title = curData.orgName;
                curData.isParent = true;
                curData.name = curData.orgName;
                curData.open = false;
                curData.children = curData.childs;
                // null数据置空
                curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
                curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
                curData.extend = curData.extend == null ? '' : curData.extend;
                // 如果有 children 则 push 进 res 中待搜索
                if (curData.childs) {
                    if (curData.childs.length > 1) {
                        curData.childs.sort(function (a, b) {
                            if (Number(a.orderNo) > Number(b.orderNo)) {
                                return 1;
                            } else if (Number(a.orderNo) < Number(b.orderNo)) {
                                return -1;
                            } else {
                                return a.orgName.localeCompare(b.orgName, 'zh');
                            }
                        });
                    }
                    res.push(...curData.childs.map(d => {
                        return d;
                    }))
                }
            }
            return dataSource;
        },
        extraExpandHandle(treeId, treeNode) {
            let _this = this;
            if (treeNode.hasExpand)
                return;
            //执行用户自定义操作       
            // 分级获取部门  
            ajax({
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.orgId + '&checkType=' + treeNode.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    if (ret.data) {
                        _this.treeObj.removeChildNodes(treeNode);
                        _this.treeObj.addNodes(treeNode, this.addIcon(ret.data));
                        treeNode.hasExpand = true;
                    } else {
                        _this.sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                    }
                } else {
                    _this.sayError(cjzscfwgl_language.demandForSubBranchDataFailed);
                }
            });
        },
    }
});
/* 根据所属机构获取分配的采集工作站列表 */
function getStationByOrgIdAjax(orgId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicInfos/' + orgId,
        method: 'get',
        cache: false
    })
}
/* 模糊搜索采集工作站 */
function searchStationAjax(searchKey) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/getOrgPathByWsName?name=' + encodeURIComponent(searchKey),
        method: 'get',
        cache: false,
        data: null
    });
}
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        method: 'get',
        cache: false
    });
}
//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].path = treeData[i].path;
        treeData[i].children = treeData[i].childs;
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);
        if (!(treeData[i].childs && treeData[i].childs.length)) {
        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
/*表格控制器*/
let tableBodyJYCX = avalon.define({ //表格定义组件
    $id: 'xtpegl_zfyyfrz_table',
    data: [],
    key: 'id',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    isAllChecked: false,
    selection: [],
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'xtpegl-zfyyfrz-tableDrag-style',
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObjectJYCX = {};
let table = avalon.define({
    $id: 'zfyyfrz_tabCont',
    //页面表格数据渲染
    loading: false,
    remoteList: [],
    changeData: [], //保存需要编辑或者删除的用户
    total: 0,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange() {
        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        zfyyfrzinitParams.page = params.page;
        zfyyfrzinitParams.pageSize = params.pageSize;
        this.fetch(params);
    },
    fetch(params) {
        tableObjectJYCX.loading(true);
        ajax({
            url: '/gmvcs/uap/log/inter/list',
            method: 'post',
            data: params
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: language_txt.xtywgl.zfyyfrz.fails,
                    title: language_txt.xtywgl.zfyyfrz.tips
                });
                this.loading = false;
                return;
            }
            if (result.data.overLimit) {
                this.total = result.data.limit * result.data.perPages; //总条数
            } else {
                this.total = result.data.totalElements; //总条数
            }
            if (result.data.currentElements) {
                if (storage && storage.setItem) {
                    storage.setItem('zfsypsjglpt-ywzx-zfyyfrz', JSON.stringify(params));
                } else {
                };
                this.changeData = []; //当表格刷新当前页数据置空
                let ret = [];
                avalon.each(result.data.currentElements, function (index, el) {
                    ret.push(el);
                });
                let len = ret.length; //记录当前页面的数据长度
                this.remoteList = [];
                this.remoteList = avalon.range(len).map(n => ({ //字段末尾带L：表示返回的是没经过处理的字段
                    logId: ret[n].logId || '-',
                    app: ret[n].app || '-',
                    userName: ret[n].user || '-',
                    org: ret[n].org || '-',
                    terminal: ret[n].terminal || '-',
                    operator: ret[n].operator || '-',
                    results: ret[n].results || '-',
                    failCode: ret[n].failCode || '-',
                    funcModule: ret[n].funcModule || '-',
                    conditions: ret[n].conditions || '-',
                    describe: ret[n].describe || '-',
                    insertTime: new Date(ret[n].insertTime).Format("yyyy-MM-dd hh:mm:ss"),
                    index: 1 + 20 * (this.current - 1) + n,
                    ip:ret[n].ip || '-'
                }));
                tableObjectJYCX.tableDataFnc(this.remoteList);
                tableObjectJYCX.loading(false);
            }
            this.loading = false;
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
    },
    handleSelectAll(selected, selectedRows) {
        for (let i = 0; i < selectedRows.length; i++) {
            table.changeData[i] = selectedRows[i];
        }
    }
});
//日期转时间戳
function getTimeByDateStr(stringTime) {
    var s = stringTime.split(" ");
    var s1 = s[0].split("-");
    var s2 = s[1].split(":");
    if (s2.length == 2) {
        s2.push("00");
    }
    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();
    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}
//定义树
let yspk_tree = avalon.define({
    $id: "ywzx_tree_zfyyfrz",
    yspk_data: [],
    tree_key: "",
    tree_title: "",
    tree_code: "",
    curTree: "",
    getSelected(key, title, e) {
        this.tree_key = key;
        this.tree_title = title;
        this.tree_code = e.path;
    },
    select_change(e, selectedKeys) {
        this.curTree = e.node.key;
        this.tree_code = e.node.path;
    },
    extraExpandHandle(treeId, treeNode, selectedKey) {
        let deptemp_child = [];
        ajax({
            url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: result.msg,
                    title: language_txt.xtywgl.zfyyfrz.tips
                });
            }
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            if (result.code == 0) {
                getDepTree(result.data, deptemp_child);
                treeObj.addNodes(treeNode, deptemp_child);
            }
            if (selectedKey != treeNode.key) {
                let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                treeObj.selectNode(node);
            }
        });
    }
});
function getDepTree(treelet, dataTree) {
    if (!treelet) {
        return;
    }
    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].key = item.orgId; //---部门id
        dataTree[i].title = item.orgName; //---部门名称
        dataTree[i].orgCode = item.orgCode; //---部门code
        dataTree[i].checkType = item.checkType; //---部门code
        dataTree[i].path = item.path; //---部门路径，search的时候需要发
        dataTree[i].isParent = true;
        dataTree[i].icon = "/static/image/zfsypsjglpt/users.png";
        dataTree[i].children = new Array();
        getDepTree(item.childs, dataTree[i].children);
    }
}