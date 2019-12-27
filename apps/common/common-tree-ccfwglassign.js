/**
 * 根据机构获取采集工作站或者部门人员等，再进行选择分配到右边的组件
 * @prop {Array} orgData 树数据
 * @prop {Object}  settings 配置对象，主要为一些选项的标题名称，notice提示信息等
 * @prop {Boolen} parentsNodeOrgIds 需通过外围弹框的确定或者取消重置为空
 * @prop {Array} stations 代表右边结果的列表
 * @prop {String} listStorageId 列表id
 * @event {Function} searchAjax  搜索的ajax请求方法
 * @event {Function} getItemsByOrgIdAjax  根据机构id获取下面选项插入成为子节点方法
 * @event {Function} getRightItemsByStorageId 根据某个列表id获取右边的列表的ajax方法
 * @event {Function} returnRightItems  获取组件返回结果
 * @example
 * ```
 * demo
 *<ms-tree-ccfwglassign :widget="{orgData:@orgData,listStorageId:@listStorageId,parentsNodeOrgIds:@parentsNodeOrgIds,searchAjax:@searchAjax,getItemsByOrgIdAjax:@getItemsByOrgIdAjax,getRightItemsByStorageId:@getRightItemsByStorageId,returnRightItems:@returnRightItems}"></ms-tree-ccfwglassign>
 * 可参见   tyywglpt-ccfwgl 模块
 * 
 * ```
 */

import {
    notification
} from "ane";
import ajax from '../../services/ajaxService';
require('/apps/common/common-tree-ccfwglassign.css');
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
const vm = avalon.component('ms-tree-ccfwglassign', {
    template: __inline('./common-tree-ccfwglassign.html'),
    defaults: {
        ccfwglassign_language: language_txt.xtywgl.cjzscfwgl, //多语言
        orgData: [],
        checkedKeys: [],
        expandedKeys: [],
        searchInputValue: '',
        parentsNodeOrgIds: [], //存储左边已经获取过下面子集的机构id集合
        hasAddChildNodes: [], //存储已经添加过的树节点
        searchResults: [],
        listStorageId: 'empty', //存储服务id
        rightItems: [], //获取到的右边列表项的数据
        curClickSelectNodes: [], //存储单击的临时节点，以便赋值给rightItems
        curClickRightItems: [], //存储右边单击的临时节点
        // resultsGroup: [{
        //     parentName: '第一机构',
        //     orgId: '1',
        //     children: [
        //         {
        //             name: '采集站01',
        //             rid: '11'
        //         }
        //     ]
        // }],
        tree: [],
        resultsGroup: [],
        treeObj: null,
        areadyAssignedItemIdS: [], //存储右边已经分配项id
        areadyAssignedItemorgIdS: [], //存储右边已经分配项的orgid
        singleNodeClickTimer: '',
        rightDisabled: true,
        leftDisabled: true,
        hasPosFlag: false,
        searchAjax: avalon.noop,
        getItemsByOrgIdAjax: avalon.noop,
        getOrgByOrgIdAjax: avalon.noop, //部门的分级加载
        getRightItemsByStorageId: avalon.noop,
        returnRightItems: avalon.noop,
        returnHasAddNodes: avalon.noop,
        settings: {
            type: 0,
            // leftTitle: '未分配到服务器的采集工作站',
            leftTitle: language_txt.xtywgl.cjzscfwgl.collectionWorkstationNotAssignedtotheserver,
            // rightTitle: '已分配到本服务器的采集工作站',
            rightTitle: language_txt.xtywgl.cjzscfwgl.collectionWorkstationAssignedtotheserver,
            rightEmptyTip: language_txt.xtywgl.cjzscfwgl.noResult,
            // searchPlaceHolder: '请输入采集工作站名称进行搜索'
            searchPlaceHolder: '',
            // searchPlaceHolder: language_txt.xtywgl.ccgl.enterOrg,
        },
        onInit() {
            let _this = this;
            // this.$watch('searchInputValue', function (n, o) {
            //     if (n == '') {
            //         this.delightNodes();
            //     }
            // });
            this.$watch('listStorageId', function (n, o) {
                if (n != '' && n != 'empty') {
                    let rootDataKey = _this.orgData[0]['key'];
                    let rootNode = _this.treeObj.getNodesByParam('key', rootDataKey, null);
                    //  _this.treeObj.expandNode(rootNode[0], true, false, false, false);
                    //_this.treeObj.expandNode(rootNode[0], true, null, null, true);
                    _this.getRightItemsByStorageId(n).then((ret) => {
                        if (ret.code == 0) {
                            let rightItems;
                            if (_this.settings.type == 0) {
                                rightItems = ret.data.tBasicInfos;
                            } else {
                                rightItems = _this.changeDataToMatch(ret.data, 3);
                            }
                            avalon.each(rightItems, function (key, val) {
                                val['active'] = false;
                            });
                            _this.rightItems = rightItems;
                            _this.hasAddChildNodes = [];
                            // _this.resultsGroup = _this.changeRightItemsData(rightItems);
                            // _this.dealNodesByHighliteOrHide(rightItems, false,true);

                        } else {
                            showMessage('error', '请求错误，错误代码为' + ret.code);
                        }
                    });
                }

            });
            this.$watch('rightItems', function (n, o) {
                _this.resultsGroup = _this.changeRightItemsData(n);
            });
            this.$watch('curClickSelectNodes', function (n, o) {
                if (n.length > 0)
                    _this.rightDisabled = false;
                else
                    _this.rightDisabled = true;
            });
            this.$watch('curClickRightItems', function (n, o) {
                if (n.length > 0)
                    _this.leftDisabled = false;
                else
                    _this.leftDisabled = true;
            });
            this.$watch('areadyAssignedItemIdS', function (n, o) {
                this.returnRightItems(n.$model);
            });
            this.$watch('hasAddChildNodes', function (n, o) {
                this.returnHasAddNodes(this.treeObj, this.hasAddChildNodes, this.parentsNodeOrgIds);
            });
        },

        onReady() {
            this.treeObj = $.fn.zTree.getZTreeObj($('.AllocationDialog  .ztree').attr('id'));
            let timer = setInterval(() => {
                if (this.tree.length > 0) {
                    this.orgData = this.tree;
                    clearInterval(timer);
                }
            }, 100);
        },
        onDispose() {

        },
        handleSelect(e, targetObj) {
            let _this = this;
            let node = targetObj['node'];
            if (/org/g.test(node['icon'])) { //单击父节点获取采集站
                let $ztree = $('#ccfwglassign .ztree');
                let treeId = $ztree.attr('id');
                _this.getNodesByOrgId(node['key'], node, treeId);
            } else { //单击采集站分配,支持ctrl多选
                clearTimeout(_this.singleNodeClickTimer);
                _this.singleNodeClickTimer = setTimeout(function () {
                    if (targetObj.event.ctrlKey == true) {
                        let matchIndex = _this.getMatchIndex(_this.curClickSelectNodes, 'rid', node['key']);
                        if (matchIndex != -1) {
                            _this.curClickSelectNodes.splice(matchIndex, 1);
                            if (_this.curClickSelectNodes.length > 0) {
                                _this.rightDisabled = false;
                            } else {
                                _this.rightDisabled = true;
                            }
                        } else {
                            _this.curClickSelectNodes.push(node);
                            _this.rightDisabled = false;
                        }
                    } else {
                        _this.curClickSelectNodes = []; //清空是为了多选之后再单击，就只能选中一个
                        _this.curClickSelectNodes.push(node);
                        _this.rightDisabled = false;
                    }
                }, 250);

            }
            //点击左侧，右侧取消所有选择
            _this.curClickRightItems = [];
            //ie8监控无效
            _this.leftDisabled = true;
            avalon.each(_this.resultsGroup, function (key, val) {
                avalon.each(val.children, function (i, v) {
                    v['active'] = false;
                })
            });

        },
        handleRightItemClick($$index, $index, $event) {
            let _this = this;
            clearTimeout(_this.singleNodeClickTimer);
            _this.singleNodeClickTimer = setTimeout(function () {
                let item = _this.resultsGroup[$index]['children'][$$index];
                let rid = item['rid'],
                    matchIndex;
                let deleteIndex = _this.areadyAssignedItemIdS.indexOf(rid);
                if ($event.ctrlKey == true) {
                    let matchIndex = _this.getMatchIndex(_this.curClickRightItems, 'rid', item['rid']);
                    if (matchIndex != -1) {
                        _this.curClickRightItems.splice(matchIndex, 1);
                        if (_this.curClickRightItems.length > 0) {
                            _this.leftDisabled = false;
                        } else {
                            _this.leftDisabled = true;
                        }
                    } else {
                        _this.curClickRightItems.push(item);
                        //ie8监控无效
                        _this.leftDisabled = false;
                    }
                } else {
                    avalon.each(_this.resultsGroup[$index]['children'], function (key, val) {
                        // if (val['rid'] == rid)//如果是已经加了active,不做处理，否则已经选中，后续item.active始终为true
                        //     return true;
                        val['active'] = false;
                    });
                    _this.curClickRightItems = []; //清空是为了多选之后再单击，就只能选中一个
                    _this.curClickRightItems.push(item);
                    //ie8监控无效
                    _this.leftDisabled = false;
                }

                item.active = !item.active;
            }, 250);
            //点击右侧，左侧取消已选
            _this.curClickSelectNodes = [];
            _this.rightDisabled = true;
        },
        handleRightItemDbClick($$index, $index, $event) {
            let _this = this;
            clearTimeout(_this.singleNodeClickTimer); //为了解决双击触发单击的冲突
            let item = _this.resultsGroup[$index]['children'][$$index];
            avalon.each(_this.resultsGroup[$index]['children'], function (key, val) {
                // if (val['rid'] == rid)//如果是已经加了active,不做处理，否则已经选中，后续item.active始终为true
                //     return true;
                val['active'] = false;
            });
            _this.curClickRightItems = []; //清空是为了防止跟单击后的重复
            _this.curClickRightItems.push(item);
            _this.leftDisabled = false;
            _this.handleToLeft();
        },
        handleToRight() {
            let _this = this;
            this.rightItems.pushArray(this.curClickSelectNodes);
            avalon.each(this.curClickSelectNodes, function (index, value) {
                _this.hideOrShowSingleNode(value);
            });
            _this.curClickSelectNodes = []; //防止按了多选再次多选
            _this.rightDisabled = true;
        },
        handleToLeft() {
            let _this = this;
            avalon.each(_this.curClickRightItems, function (key, val) {
                _this.handleSingleDeleteClick(null, null, val['rid']);
            });
            _this.curClickRightItems = [];
            _this.leftDisabled = true;
        },
        handleDblClick(e, targetObj) {
            let _this = this;
            let node = targetObj['node'],
                isParent = node['isParent'],
                isOpen = node['open'],
                matchItems = [],
                isParentDblClick;
            isParentDblClick = /org/g.test(node['icon']);
            if (isParentDblClick) { //文件夹双击
                if (isOpen) {
                    matchItems = _this.treeObj.getNodesByFilter(function (childNode) {
                        return (!/org/g.test(childNode['icon']) && (!$('#' + childNode['tId']).attr('hide') || $('#' + childNode['tId']).attr('hide') == 'false')); //找到没有服务的采集站
                    }, false, node);
                    // if(node.children && node.children.length>0){
                    //     avalon.each(node.children,function (index, value) {
                    //         if(!value.isParent){
                    //             matchItems.push(value);
                    //         }
                    //     })
                    // }else{
                    //     matchItems = [];
                    // }
                }

            } else {

                clearTimeout(_this.singleNodeClickTimer); //为了解决双击触发单击的冲突
                matchItems = [node];
                avalon.each(_this.curClickSelectNodes, function (key, val) {
                    if (val['rid'] == node['rid']) {
                        _this.curClickSelectNodes.splice(key, 1);
                    }
                });
                if (_this.curClickSelectNodes.length <= 0) {
                    _this.rightDisabled = true;
                } else {
                    _this.rightDisabled = false;
                }
            }
            let arr = [];
            avalon.each(matchItems, function (key, val) {
                if (_this.areadyAssignedItemIdS.indexOf(val['rid']) == -1) {
                    //_this.rightItems.pushArray([val]);
                    arr.push(val);
                }
            });
            _this.rightItems.pushArray(arr);
            avalon.each(matchItems, function (index, value) {
                _this.hideOrShowSingleNode(value);
            });
            //    _this.resultsGroup = _this.changeRightItemsData(_this.rightItems);

        },
        handleDeleteClick($index) {
            let _this = this;
            //  console.log('dele', this.hasAddChildNodes);
            // avalon.each(_this.resultsGroup[$index]['children'], function (key, val) {
            //     _this.handleSingleDeleteClick(null, null, val['rid']);
            // });
            let rid = _this.resultsGroup[$index]['children'][0]['rid'],
                length = _this.resultsGroup[$index]['children'].length;
            let deleteIndex = this.areadyAssignedItemIdS.indexOf(rid);
            avalon.each(_this.resultsGroup[$index]['children'], function (key, val) {
                for (var i = 0; i < _this.hasAddChildNodes.length; i++) {
                    let tempRid = _this.hasAddChildNodes[i]['rid'];
                    if (val['rid'] == tempRid) {
                        _this.hideOrShowSingleNode(_this.hasAddChildNodes[i], true);
                        break;
                    }
                }
            });
            this.rightItems.splice(deleteIndex, length);

        },
        handleSingleDeleteClick($index, $$index, id) {
            let _this = this;
            let rid = id || this.resultsGroup[$index]['children'][$$index]['rid'];
            let deleteIndex = this.areadyAssignedItemIdS.indexOf(rid);
            let matchIndex = -1;
            this.rightItems.splice(deleteIndex, 1);
            avalon.each(this.hasAddChildNodes, function (key, val) {
                if (val['rid'] == rid) {
                    matchIndex = key;
                    return false;
                }

            });
            //   console.log('nodeArr', this.hasAddChildNodes);
            if (matchIndex != -1) this.hideOrShowSingleNode(this.hasAddChildNodes[matchIndex], true);
            // avalon.each(this.curClickRightItems, function (key, val) {
            //     if (val['rid'] == rid) {
            //         _this.curClickRightItems.splice(key, 1);
            //     }
            // });
            return false; //阻止外围添加active
            //  this.resultsGroup = this.changeRightItemsData(this.rightItems);
        },
        handleSearchEnter(e) {
            if (e.keyCode == 13 && ($.trim(this.searchInputValue) != "")) {
                this.handleSearchClick();
                return false; //阻止ie8弹框中的确定，取消按钮事件
            }
        },
        //xie
        handleSearchClick() {
            if ($.trim(this.searchInputValue) == "") return;
            let _this = this;
            _this.delightNodes();
            _this.hasPosFlag = false;
            //先找已经加载的节点有没有
            // let nodeList = _this.treeObj.getNodesByFilter(function (node) {
            //     if ($.trim(_this.searchInputValue)== "") {
            //         node = null;
            //         return node;
            //     }
            //     return (!node.isParent) && (new RegExp(_this.searchInputValue).test(node.usercode) || new RegExp(_this.searchInputValue).test(node.username) || new RegExp(_this.searchInputValue).test(node.name));
            // }, false);
            // for (var j = 0; j < nodeList.length; j++) {
            //     var node = nodeList[j];
            //     if (node) {
            //         node.highlight = true;
            //         _this.treeObj.updateNode(node);
            //     }
            // }
            _this.searchAjax(_this.searchInputValue).then((ret) => {
                if (ret.data.length <= 0) {
                    showMessage('warn', languageSelect == "en" ? "No Result" : "暂无数据");
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
                    // return new RegExp(_this.searchInputValue).test(node.usercode) || new RegExp(_this.searchInputValue).test(node.username) || new RegExp(_this.searchInputValue).test(node.name);
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
        handleSearchClick11() {
            let _this = this;
            _this.delightNodes();
            _this.hasPosFlag = false;
            _this.searchAjax(_this.searchInputValue).then((ret) => {
                if (ret.code == 0) {
                    let data;
                    if (_this.settings.type == 0) { //采集站分配弹框
                        if (ret.data.tBasicInfos.length <= 0) {
                            showMessage('warn', languageSelect == "en" ? "No Result" : "暂无数据");
                            return false;
                        }
                        data = ret.data.tBasicInfos;
                    } else {
                        if (ret.data.length == 0) {
                            showMessage('warn', languageSelect == "en" ? "No Result" : "暂无数据");
                            return false;
                        }
                        data = _this.changeDataToMatch(ret.data, 2);
                    }
                    _this.searchResults.pushArray(data);

                    //  console.log('data1:', data);
                    let orgIdPairs = {},
                        nodeParents = [];
                    if (data.length != 0) {
                        _this.dealNodesByHighliteOrHide(data, true, false);

                    }
                    //如果搜索出来的执法仪都已经被分配，即全部在右侧分配列表中，提示暂无数据
                    let flag = 0;
                    for (var i = 0; i < data.length; i++) {
                        for (var j = 0; j < _this.rightItems.length; j++) {
                            if (data[i]['rid'] == _this.rightItems[j]['rid']) {
                                flag = 1; //表示搜索的数据右侧存在，即左侧已经被隐藏
                                break;
                            }
                            flag = 2; //搜索结果右侧不存在该条数据
                        }
                        if (flag == 2) {
                            break;
                        }
                    }
                    if (flag == 1) {
                        showMessage('warn', languageSelect == "en" ? "No Result" : "暂无数据");
                    }
                } else {
                    showMessage('error', '请求错误，错误代码为' + ret.code);
                }
            });
        },

        handleCollapseExpand($index) {
            let _this = this;
            //   let action =  _this.resultsGroup[$index]['action'];
            _this.resultsGroup[$index]['action'] = _this.resultsGroup[$index]['action'] == 'enter' ? 'leave' : 'enter';
            _this.resultsGroup[$index]['isIconCollapse'] = !_this.resultsGroup[$index]['isIconCollapse'];
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
        delightNodes1111() {
            let _this = this;
            avalon.each(_this.hasAddChildNodes, function (key, val) {
                if (val.highlight == true) {
                    val.highlight = false;
                    _this.treeObj.updateNode(val);
                }
            });

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
        hideNodes(hasAddChildNodes) {
            let _this = this;
            //  console.log('hasAddChildNodes', hasAddChildNodes);
            avalon.each(hasAddChildNodes, function (index, value) {
                if (value['storageId']) {
                    _this.hideOrShowSingleNode(value);
                }
            });
        },
        posFirstHighlightNode() {
            let $highlightNodes = $("a[style$='bold;']"),
                $ztreeWrap, ztreeWrapHeight; //相对于弹框
            if ($highlightNodes.length > 0) {
                $ztreeWrap = $('.AllocationDialog  .ztree').parent();
                ztreeWrapHeight = $ztreeWrap.outerHeight();
                $ztreeWrap.scrollTop(0);
                let highlightNodePosTop = $($highlightNodes[0]).position().top;
                let $ztreeWrapPosTop = $ztreeWrap.position().top;
                let relPos = highlightNodePosTop - $ztreeWrapPosTop;

                if (highlightNodePosTop > 0 && relPos >= ztreeWrapHeight) {
                    $ztreeWrap.animate({
                        scrollTop: relPos - ztreeWrapHeight + 80
                    });
                } else if (relPos < 0) {
                    // if(highlightNodePosTop < 0){
                    //     $ztreeWrap.animate({
                    //         scrollTop: $ztreeWrap.scrollTop() -  Math.abs(highlightNodePosTop) + $ztreeWrapPosTop 
                    //     });
                    // }else
                    if (highlightNodePosTop <= $ztreeWrapPosTop) {
                        $ztreeWrap.animate({
                            scrollTop: $ztreeWrap.scrollTop() - relPos
                        });
                    }
                };




            }
        },
        hideZyfNodes(hasAddChildNodes) { //隐藏已经显示在右侧的执法仪
            let _this = this;
            //   console.log('hasAddChildNodes', hasAddChildNodes);
            avalon.each(_this.areadyAssignedItemIdS, function (key, val) { //执法仪只隐藏右边出现的
                avalon.each(hasAddChildNodes, function (index, value) {
                    if (val == value['rid']) {
                        _this.hideOrShowSingleNode(value);
                    }
                });
            });
        },
        hideOrShowSingleNode(node, isShow) {
            let tId = node['tId'];
            let $dom = $('#' + tId);
            if (isShow) {
                $dom.attr('hide', false).show();
            } else {
                $dom.attr('hide', true).hide();
            }
            this.treeObj.updateNode(node);
        },
        dealNodesByHighliteOrHide(targetData, isHighlight, isExpand) { //搜索的采集站或者右边的采集站对应的部门先添加采集站(xie 用来往右边家节点的同时，左边树影藏节点)
            let _this = this;
            let orgIdPairs = {},
                nodeParents;
            avalon.each(targetData, function (key, val) {
                if (_this.parentsNodeOrgIds.indexOf(val['orgId']) == -1) {
                    nodeParents = _this.treeObj.getNodesByParam("key", val['orgId'], null);
                    if (nodeParents.length > 0) { //由于搜索出来的是全部，这里过滤下，只看到权限内的
                        _this.parentsNodeOrgIds.push(val['orgId']);
                        orgIdPairs[val.orgId] = nodeParents[0];
                    }

                }
            });
            //  console.log(orgIdPairs);
            for (var i in orgIdPairs) {
                let nodeParent = orgIdPairs[i];
                (function (i) {
                    _this.getItemsByOrgIdAjax(i).then((ret) => {
                        if (ret.code == 0) {
                            let data2;
                            if (_this.settings.type == 0) {
                                if (ret.data == null)
                                    return false;
                                data2 = ret.data.tBasicInfos;
                            } else {
                                let currentElements = ret.data.currentElements;
                                data2 = _this.changeDataToMatch(currentElements[i], 1);
                            }
                            data2 = data2.map((item) => {
                                return {
                                    key: item['rid'],
                                    title: item['name'],
                                    storageId: item['storageId'],
                                    orgId: item['orgId'],
                                    orgName: item['orgName'] || nodeParent['title'],
                                    rid: item['rid'],
                                    name: item['name'],
                                    active: false,
                                    highlight: false
                                };
                            });

                            let addResultNodes = _this.treeObj.addNodes(nodeParent, 0, data2, isExpand);
                            _this.hasAddChildNodes.pushArray(addResultNodes);
                            if (isHighlight) {
                                _this.highlightNodes(_this.hasAddChildNodes, targetData);

                            }
                            if (_this.settings.type == 0) //采集站是有storage才隐藏，执法仪不作处理
                                _this.hideNodes(_this.hasAddChildNodes);
                            if (_this.settings.type == 3)
                                _this.hideZyfNodes(_this.hasAddChildNodes);
                        } else {
                            showMessage('error', language_txt.xtywgl.cjzscfwgl.errorInObtainingTheCollectionStationAccordingToTheInstitutionIdErrorCode + ret.code);
                        }
                    });
                })(i);

            }

            _this.highlightNodes(_this.hasAddChildNodes, targetData);

        },
        handleBeforeExpand(treeId, treeNode) {
            if (!treeNode.children || treeNode.children.length == 0) this.getOrgByOrgIdAjax(treeId, treeNode); //先把部门加进去,并且不重复添加
            let _this = this;
            let orgId = treeNode['key'];
            _this.getNodesByOrgId(orgId, treeNode, treeId);
        },
        getNodesByOrgId(orgId, treeNode, treeId) {
            let _this = this;
            if (_this.parentsNodeOrgIds.indexOf(orgId) == -1) {
                _this.parentsNodeOrgIds.push(orgId);
                _this.getItemsByOrgIdAjax(orgId).then((ret) => {
                    if (ret.code == 0) {
                        let data2;
                        if (_this.settings.type == 0) {
                            if (ret.data == null)
                                return false;
                            data2 = ret.data.tBasicInfos;
                        } else {
                            let currentElements = ret.data.currentElements;
                            data2 = _this.changeDataToMatch(currentElements[orgId], 1);
                        }
                        data2 = data2.map((item) => { //获取执法仪的接口orgName会有空的情况,直接从树上拿名称才能在右边展示
                            // return { key: item['rid'], title: item['name'], storageId: item['storageId'], orgId: item['orgId'], orgName: item['orgName'] || treeNode['title'], rid: item['rid'], name: item['name'], active: false, highlight: false };
                            return {
                                key: item['rid'],
                                title: item['name'],
                                storageId: item['storageId'],
                                orgId: item['orgId'],
                                orgName: item['orgName'] || treeNode['title'],
                                rid: item['rid'],
                                name: item['name'],
                                active: false
                            };
                        });
                        if (!treeNode.children || treeNode.children.length == 0) this.getOrgByOrgIdAjax(treeId, treeNode); //先把部门加进去,并且不重复添加
                        let addResultNodes = _this.treeObj.addNodes(treeNode, 0, data2);
                        _this.hasAddChildNodes.pushArray(addResultNodes);
                        //_this.highlightNodes(_this.hasAddChildNodes, _this.searchResults);
                        //隐藏掉右侧已经加载的执法仪或工作站
                        let matchIndex = -1;
                        avalon.each(addResultNodes, function (key, val) {
                            for (var k = 0; k < _this.rightItems.length; k++) {
                                if (val['rid'] == _this.rightItems[k]['rid']) {
                                    matchIndex = key;
                                    _this.hideOrShowSingleNode(addResultNodes[matchIndex], false);
                                    break;
                                }
                            }

                        });
                        //标记与搜索结果相同的节点高亮
                        let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                            if ($.trim(_this.searchInputValue) == "") {
                                node = null;
                                return node;
                            }
                            // return new RegExp(_this.searchInputValue).test(node.usercode) || new RegExp(_this.searchInputValue).test(node.username) || new RegExp(_this.searchInputValue).test(node.name);
                            return new RegExp(_this.searchInputValue).test(node.name);
                        }, false, treeNode);
                        for (var j = 0; j < nodeList.length; j++) {
                            var node = nodeList[j];
                            if (node) {
                                node.highlight = true;
                                _this.treeObj.updateNode(node);
                            }
                        }
                        if (_this.settings.type == 0)
                            _this.hideNodes(_this.hasAddChildNodes);
                    } else {
                        showMessage('error', language_txt.xtywgl.cjzscfwgl.errorInObtainingTheCollectionStationAccordingToTheInstitutionIdErrorCode + ret.code);
                    }
                });
            }
        },
        changeRightItemsData(rightItems) {
            let _this = this;
            let resultsGroupPairs = {},
                ret = [];
            _this.areadyAssignedItemIdS = [];
            avalon.each(rightItems, function (key, val) {
                val['active'] = val['active'] || false; //防止选中时左边又跑过来右边样式选中的就没了
                resultsGroupPairs[val['orgId']] = resultsGroupPairs[val['orgId']] ? resultsGroupPairs[val['orgId']] : [];
                resultsGroupPairs[val['orgId']].push(val);
                _this.areadyAssignedItemIdS.push(val['rid']);
                if (_this.areadyAssignedItemorgIdS.indexOf(val['orgId']) == -1)
                    _this.areadyAssignedItemorgIdS.push(val['orgId']);
            });
            for (var i in resultsGroupPairs) {
                ret.push({
                    parentName: resultsGroupPairs[i][0]['orgName'],
                    orgId: resultsGroupPairs[i][0]['orgId'],
                    children: resultsGroupPairs[i],
                    action: 'enter',
                    isIconCollapse: false
                });

            };
            //  console.log('ret', ret);
            return ret;
        },
        changeDataToMatch(data, type) { //1---根据左边orgId获取执法仪;2---搜索执法仪;3--获取右边已分配执法仪
            let ret = [];
            avalon.each(data, function (key, val) {
                let obj = {
                    name: type == 3 ? val['dsjName'] : val['name'],
                    rid: type == 3 ? val['dsjGbcode'] : val['gbcode'],
                    orgId: type == 3 ? val['dsjOrgRid'] : (type == 1 ? val['orgRid'] : val['orgId']),
                    orgName: type == 3 ? val['dsjOrgName'] : val['orgName'],
                    storageId: val['storageId'] || null
                };
                ret.push(obj);
            });
            return ret;
        },
        //获取对象中符合条件的某个对象的下标
        getMatchIndex: function (arr, attr, value) {
            var Index = -1;
            for (var i = 0; i < arr.length; i++) {
                if (typeof arr[i] == 'object') {
                    for (var key in arr[i]) {
                        if (key == attr && arr[i][key] == value)
                            Index = i;
                    }
                }
            }
            return Index;
        },
    }
});

avalon.effect('assign-collapse', {
    enter: function (el, done) {
        $(el).slideDown(200, done);
    },
    leave: function (el, done) {
        $(el).slideUp(200, done);
    }
});
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: "通知",
        message: content,
    });
}