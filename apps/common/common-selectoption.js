/**
 * 带模糊搜索的树选择组件
 * @prop {Boolean} showSearch 是否开启模糊搜索
 * @prop {TreeNode} treeData 树数据
 * @prop {String}  selectedKey 默认选中并展开的节点的key（可不传，不传的时候默认选中根节点）
 * @prop {String} wrapId $(tree-select-wrap)这个元素的id(当页面有用到多个ms-tree-selecting为必传，因为要用用这个来进行唯一标识)
 * @prop {Boolean} hasIframe 当用到视频ocx时，传true，否则树会被ocx挡住
 * @prop {Number} width 下拉框的宽度（默认240px）
 * @prop {Number} height 下拉框的高度（默认300px）
 * @event {Function} onChange 当选择树节点时触发， 参数(e,key,title)
 * @example
 * ```
 * demo 执法档案-警情||案件关联的查询页面
 * ```
 */

import {
    message
} from "ane";
import {
    notification
} from 'ane';
import ajax from '../../services/ajaxService';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
// require('/apps/common/common-selectoption.css');


const sop = avalon.component('ms-select-option', {
    template: __inline('./common-selectoption.html'),
    defaults: {
        select_txt: language_txt.sszhxt.main,

        visible: false,
        showSearch: false, //模糊搜索未做
        searchValue: '',
        selectedKey: '',
        treeId: '',
        selectedTitle: '',
        $tree_target: null,
        treeData: [],
        searchData: [],
        wrapId: avalon.noop,
        noMatch: false,
        isShowTreeOresult: true,
        disabledSelect: false,
        hasIframe: false,
        iframeHeight: '100%',
        iframeWidth: '100%',
        width: 240,
        height: 300,
        onChange: avalon.noop,
        onExpand: avalon.noop,
        onSelect: function (event, treeId, treeNode) {

            //点击节点默认操作,显示选中节点
            this.selectedKey = treeNode.key;
            this.selectedTitle = treeNode.title;
            this.visible = false;

            treeId = treeId ? treeId : this.treeId;
            //执行用户自定义操作
            this.onChange(event, treeId, treeNode, this.$tree_target);
        },
        sayError: function (word) {
            notification.error({
                message: word,
                title: '温馨提示'
            });
        },
        onExpand: function (event, treeId, treeNode, treeTarget) {

            //执行用户自定义操作          
            ajax({
                //id->orgId
                url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.orgId + '&checkType=' + treeNode.checkType,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    if (ret.data) {

                        if (treeNode.children && treeNode.children.length) {

                            //已经有子部门 = 已经请求过
                            return;
                        } else {
                            var node = this.$tree_target.getNodeByTId(treeNode.tId);
                            this.$tree_target.addNodes(node, this.addIcon(ret.data));
                        }
                    } else {
                        this.sayError('请求下级部门数据失败');
                    }
                } else {
                    this.sayError('请求下级部门数据失败');
                }
            });
        },
        addIcon: function (arr) {

            // 深拷贝原始数据
            var dataSource = JSON.parse(JSON.stringify(arr));
            var res = [];

            // 每一层的数据都 push 进 res
            res.push(...dataSource);

            // res 动态增加长度
            for (var i = 0; i < res.length; i++) {
                var curData = res[i];
                curData.icon = '/static/image/zfsypsjglpt/users.png';
                curData.key = curData.orgId;
                curData.name = curData.orgName;
                curData.title = curData.orgName;
                curData.isParent = true;
                curData.children = curData.childs;

                // null数据置空
                curData.orderNo = curData.orderNo == null ? '' : curData.orderNo;
                curData.dutyRange = curData.dutyRange == null ? '' : curData.dutyRange;
                curData.extend = curData.extend == null ? '' : curData.extend;

                // 如果有 children 则 push 进 res 中待搜索
                if (curData.childs) {
                    res.push(...curData.childs.map(d => {
                        return d;
                    }));
                }
            }
            return dataSource;
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
            this.treeId = +new Date();
            this.$watch('searchValue', (v) => {

                if (v == '') {
                    this.isShowTreeOresult = true;
                }
            });
            this.$watch('treeData', (v) => {


                if (this.$tree_target) {
                    return;
                } else {
                    var setting = {
                        data: {
                            key: {
                                children: 'children',
                                key: 'key',
                                name: 'name',
                                title: 'title',
                            }
                        },
                        view: {

                        },
                        callback: {
                            onClick: this.onSelect,
                            onExpand: this.onExpand
                        }
                    };
                    $.fn.zTree.init($("#" + this.treeId), setting, v.toJSON());
                    this.$tree_target = $.fn.zTree.getZTreeObj(this.treeId + '');
                    this.selectedKey = this.selectedKey ? this.selectedKey : v[0].key;
                    this.initSelect(this.selectedKey);
                };
                avalon.bind(document, 'click', (e) => {
                    let $target = $('.tree-select-wrap');
                    if (this.visible && !$target.is(e.target) && $target.has(e.target).length === 0) {
                        this.visible = false;
                        this.searchValue = '';
                    }
                });
            });
            this.$watch('selectedKey', (v) => {
                this.initSelect(v);
            });
        },
        initSelect(selectedKey) {

            //根据传入的节点，展开并选中之
            if (!typeof selectedKey === 'string') {
                selectedKey = selectedKey.toJSON()[0] ? selectedKey.toJSON()[0] : '';
            }
            let node = this.$tree_target.getNodeByParam("key", selectedKey, null);

            if (node) {
                this.selectedTitle = node.title;
                this.$tree_target.expandNode(node, true, false, true);
                this.$tree_target.selectNode(node);
            }
        },
        resetZtree() {
            //一个页面可能有多个树选择组件，所以要进行变量的重置以指向当前的树（如果把下列三个变量换为组件的属性，ie8下搜索的时候会报错）
            // $ztree = $('#' + this.wrapId + ' .ztree');
            // treeId = $ztree.attr('treeId');
            // zTree = $.fn.zTree.getZTreeObj(treeId);
        },
        onReady: function (event) {

        },
        onDispose: function (event) {

        }
    }
});
//搜索
function getSearchResult(value) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/key?k=' + value,
        method: 'get',
        data: ''
    })
}