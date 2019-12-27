/**
 * 带模糊搜索的树选择组件
 * @prop {Boolean} showSearch 是否开启模糊搜索
 * @prop {TreeNode} tree 树数据
 * @prop {Boolean} changeTree 用于触发 树数据的改变
 * @prop {String}  selectedKey 默认选中并展开的节点的key（可不传，不传的时候默认选中根节点）
 * @prop {String} wrapId $(tree-select-wrap)这个元素的id(当页面有用到多个ms-tree-selecting为必传，因为要用用这个来进行唯一标识)
 * @prop {Boolean} hasIframe 当用到视频ocx时，传true，否则树会被ocx挡住
 * @prop {Boolean} disabledSelect 是否禁用下拉框，仅显示选中值
 * @prop {Number} width 下拉框的宽度（默认240px）
 * @prop {Number} height 下拉框的高度（默认300px）
 * @prop {Boolean} branchShow 是否使用“包含子部门”勾选框
 * @prop {Boolean} includedStatus 是否勾选中
 * @event {Function} clickBranchBack 点击“包含子部门”时的回调
 * @event {Function} onChange 当选择树节点时触发， 参数(e,key,title)
 * @event {Function} getSelected  获取当前选中的树节点的相关数据， 参数(key,title)
 * @example
 * ```
 * demo
 * <ms-tree-selecting :widget="{tree:@orgData, showSearch:true, selectedKey:@selectedKey, wrapId: 'tree-select-wrap-1', getSelected:@getSelected, onChange:@handleTreeChange, branchShow:true, clickBranchBack:@clickBranchBack}"></ms-tree-selecting>
 * 可参见 tyywglpt-sbzygl-zfygl 模块
 * 
 * ```
 */

import {
    message
} from "ane";
import ajax from '../../services/ajaxService';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
require('/apps/common/common-tree-select.css');

let $ztree, treeId, zTree;

const vm = avalon.component('ms-tree-selecting', {
    template: __inline('./common-tree-select.html'),
    defaults: {
        select_txt: language_txt.sszhxt.main,
        visible: false,
        showSearch: false,
        searchValue: '',
        selectedKey: '',
        selectedTitle: '',
        tree: [],
        treeData: [],
        searchData: [],
        wrapId: "tree-select-wrap",
        expandedKeys: [],
        noMatch: false,
        isShowTreeOresult: true,
        disabledSelect: false,
        hasIframe: false,
        iframeHeight: '100%',
        iframeWidth: '100%',
        width: 240,
        height: 300,
        changeTree: false,
        isTriggerWhenChange: true, //是否在onChange时触发getSelected
        onChange: avalon.noop,
        getSelected: avalon.noop,
        //changeTreeData:avalon.noop,//自己的部门树数据处理函数
        extraExpandHandle: avalon.noop, //展开树节点后的额外工作函数

        clickBranchBack: avalon.noop, //点击包含子部门的回调
        branchShow: false, //是否显示 包含子部门
        includedStatus: false, //是否勾选中
        includedImg: "/static/image/xtpzgl-yhgl/selectNo.png",
        includedClick() {
            this.includedStatus = !this.includedStatus;
            this.clickBranchBack(this.includedStatus);
        },

        beforeExpand: function (treeId, treeNode) {
            let _this = this;
            if (treeNode.children && treeNode.children.length > 0) return; //表示节点加过数据，不重复添加
            this.extraExpandHandle(treeId, treeNode, this.selectedKey);
            // getOrgbyExpand(treeNode.orgId).then((ret)=>{
            //     if(ret.code == 0){
            //         $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, _this.changeTreeData(ret.data));
            //         return;
            //     }
            //
            // });
        },
        onSelect: function (selectedKeys, e) {
            this.selectedKey = e.node.key;
            this.selectedTitle = e.node.title;
            this.visible = false;
            this.onChange(e, selectedKeys);
            if (this.isTriggerWhenChange) {
                this.getSelected(e.node.key, e.node.title, e.node);
            }
        },
        handleClick(e) {
            if (this.disabledSelect) {
                return false;
            }
            this.visible = !this.visible;
            this.searchValue = '';
            if (this.visible) {
                let treePanel = this.$element.querySelector('.tree-panel');
                treePanel.scrollTop = 0;
                this.iframeWidth = treePanel.scrollWidth;
                this.iframeHeight = treePanel.scrollHeight;
            }
            if (this.showSearch) {
                this.$element.getElementsByTagName('input').search.focus()
            }
        },
        //仅前端搜索
        handleSearch(value) {
            let nodeList = $.trim(value) == "" ? [] : zTree.getNodesByParamFuzzy("title", $.trim(value), null);
            let highlightNodeList = zTree.getNodesByParam("highlight", true, null);
            let nodeTids = [];
            let highlightNodeTids = [];
            if (nodeList.length == 0 && value !== "") {
                this.noMatch = true;
            } else {
                this.noMatch = false;
            }
            avalon.each(nodeList, function (index, node) {
                nodeTids.push(node.tId);
            });
            avalon.each(highlightNodeList, function (index, node) {
                highlightNodeTids.push(node.tId);
            });
            let extraNodeTids = diffArr(nodeTids, highlightNodeTids);
            avalon.each(extraNodeTids, function (index, el) {
                let node = zTree.getNodeByTId(el);
                node.highlight = !node.highlight;
                if (node.highlight) {
                    if (node.children.length == 0) {
                        let parentNode = node.getParentNode();
                        zTree.expandNode(parentNode, true);
                    } else {
                        zTree.expandNode(node, true);
                    }
                    $('#' + el + '_span').css('color', '#a60000');
                } else {
                    $('#' + el + '_span').css('color', '#536b82');
                }
                zTree.updateNode(node);
            });
            if (nodeList.length > 0) {
                let $firstMatchNode = $ztree.find('#' + nodeTids[0]);
                let $ztreeParent = $ztree.parent('div');
                let posTop = $firstMatchNode.position().top;
                let scrollTop = $ztreeParent.scrollTop();
                let height = $ztreeParent.height();
                if ($firstMatchNode.length > 0) {
                    if (posTop > height) {
                        let distance = posTop + scrollTop - height;
                        //加40是为了在出现横向滚动条时第一个高亮项不被遮挡
                        $ztreeParent.animate({
                            scrollTop: distance + 40
                        }, 1000);
                    } else if (posTop < 0) {
                        let distance = scrollTop + posTop;
                        $ztreeParent.animate({
                            scrollTop: distance
                        }, 1000);
                    }
                }
            }
        },
        //配合后台搜索
        handelSearchByAjax(event) {
            this.noMatch = false;
            let _this = this;
            if (event.keyCode == 13) {
                if ($.trim(this.searchValue) == '') {
                    _this.isShowTreeOresult = true;
                    return;
                } //如果是空格回车就给他显示部门树
                getSearchResult(this.searchValue).then((ret) => {
                    if (ret.code == 0) {
                        if (ret.data.length == 0) {
                            _this.noMatch = true;
                            return;
                        }
                        //处理一下数据，为了能复用onselect
                        let coypArr = [];
                        avalon.each(ret.data, function (index, item) {
                            item.title = item.orgName;
                            item.key = item.orgId;
                            item.code = item.orgCode;
                            let obj = {
                                'node': item
                            };
                            coypArr.push(obj)
                        })
                        _this.isShowTreeOresult = false;
                        _this.searchData = coypArr;
                    }
                });
            }

        },
        onInit: function (event) {
            let _this = this;
            this.$watch('includedStatus', (v) => {
                if (v)
                    _this.includedImg = "/static/image/xtpzgl-yhgl/selectYes.png";
                else
                    _this.includedImg = "/static/image/xtpzgl-yhgl/selectNo.png";
            });
            this.$fire('includedStatus', this.includedStatus);

            this.$watch('treeData', (v) => {
                this.selectedKey = this.selectedKey ? this.selectedKey : v[0].key;
                this.initSelect(this.selectedKey);
            });
            this.$watch('selectedKey', (v) => {
                this.initSelect(v);
            })
            this.$watch('changeTree', (v) => {
                this.treeData = this.tree;
            })
            $(document).on('click', this.hidePanel);
            // avalon.bind(document, 'click', (e) => {
            //     let $target = $('.tree-select-wrap');
            //     if (this.visible && !$target.is(e.target) && $target.has(e.target).length === 0) {
            //         this.visible = false;
            //         this.searchValue = '';
            //     }
            // });
        },
        initSelect(selectedKey) {
            //this.expandedKeys = [selectedKey];
            this.resetZtree();
            if (zTree) {
                let node = zTree.getNodeByParam("key", selectedKey, null);
                if (node) {
                    zTree.selectNode(node);
                    this.selectedTitle = node.title;
                    this.getSelected(node.key, node.title, node);
                } else {
                    zTree.cancelSelectedNode();
                }
            }
        },
        resetZtree() {
            //一个页面可能有多个树选择组件，所以要进行变量的重置以指向当前的树（如果把下列三个变量换为组件的属性，ie8下搜索的时候会报错）
            $ztree = $('#' + this.wrapId + ' .ztree');
            treeId = $ztree.attr('id');
            zTree = $.fn.zTree.getZTreeObj(treeId);
        },
        hidePanel(e) {
            let $target = $('.tree-select-wrap');
            if (this.visible && !$target.is(e.target) && $target.has(e.target).length === 0) {
                this.visible = false;
                this.searchValue = '';
            }
        },
        onReady: function (event) {
            //直接从外面传treeData进来，ie8下会堆栈溢出，暂通过tree来中转
            let timer = setInterval(() => {
                if (this.tree.length > 0) {
                    this.treeData = this.tree;
                    clearInterval(timer);
                }
            }, 100);
        },
        onDispose: function (event) {
            $(document).off('click', this.hidePanel);
        }
    }
});

function diffArr(arr1, arr2) {
    let arr1Copy = arr1.slice();
    let arr = [];
    avalon.Array.merge(arr1, arr2);
    avalon.each(arr1, function (index, el) {
        if (arr1Copy.indexOf(el) == -1 || arr2.indexOf(el) == -1) {
            arr.push(el);
        }
    });
    return arr;
}
//搜索
function getSearchResult(value) {
    let newUrl = '/gmvcs/uap/org/find/by/key?k=' + value;
    return ajax({
        url: encodeURI(newUrl),
        method: 'get',
    });
}