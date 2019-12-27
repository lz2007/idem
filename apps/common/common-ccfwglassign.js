import {
    notification
} from "ane";
const name = 'ms-ccfwglassign';
require('/apps/common/common-tree-ccfwglassign.css');
require('/apps/common/common-ccfwglassign.css');
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;

let vm,
    orgIdArr = []; //保存后台分配过的部门的orgid,给勾选左侧节点使用
avalon.component(name, {
    template: __inline('./common-ccfwglassign.html'),
    defaults: {
        ccfwgl_language: language_txt.xtywgl.cjzscfwgl, //多语言
        resultsGroup: [],
        tree: [],
        orgData: [],
        righttree: [],
        treeObj: '',
        treeId: '',
        searchResult: [],
        searchInputValue: '',
        $leftCheckOrgArr: [],
        $rightCheckArr: [],
        rightDisabled: true,
        leftDisabled: true,
        allchecked: false,
        isGiveParm: true,
        listStorageId: '', //服务器存储id
        getOrgByOrgIdAjax: avalon.noop, //部门的分级加载
        returnRightItems: avalon.noop,
        searchAjax: avalon.noop,
        getRightItemsByStorageId: avalon.noop, //根据存储id获取右边已经分配的部门
        getOrgArrByOrgId: avalon.noop, //根据部门id获取所有子部门
        settings: {
            type: 0,
            leftTitle: '未分配到服务器的部门',
            rightTitle: '已分配到本服务器的部门',
            rightEmptyTip: '暂无已分配的部门',
            // searchPlaceHolder: '请输入部门名称进行搜索'
            searchPlaceHolder: ''
        },
        onInit(event) {
            vm = event.vmodel;
            let arr = [];
            avalon.each(this.righttree, function (index, item) {
                arr.push(changeTreeData(item));
            })
            this.righttree = arr;
            let _this = this;
            this.$watch('listStorageId', function (n, o) {
                $('#righttree').empty();
                if (n != '' && n != 'empty') {
                    _this.getRightItemsByStorageId(n).then((ret) => {
                        vm.allchecked = false;
                        vm.resultsGroup = [];
                        vm.searchResult = [];
                        vm.searchInputValue = '';
                        orgIdArr = [];
                        if (ret.code == 0) {
                            if (!ret.data) {
                                ret.data = [];
                            }
                            _this.handleToRight(ret.data);
                            avalon.each(ret.data, function (i, v) {
                                orgIdArr.push(v.orgCode);
                            })
                        } else {
                            showMessage('error', '请求错误，错误代码为' + ret.code);
                        }
                    });
                }
            });
            this.$watch('resultsGroup', function (n, o) {
                let orgCodeArr = [];
                avalon.each(n, function (i, v) {
                    orgCodeArr.push(v.orgCode);
                })
                this.returnRightItems(orgCodeArr, vm.treeObj);
            });
        },
        onReady() {
            this.treeId = $('.AllocationDialog  .ztree').attr('id');
            this.treeObj = $.fn.zTree.getZTreeObj($('.AllocationDialog  .ztree').attr('id'));
            let timer = setInterval(() => {
                if (this.tree.length > 0) {
                    this.orgData = this.tree;
                    clearInterval(timer);
                }
            }, 100);
        },
        handleToRight(rightArr) {
            //if (this.$leftCheckOrgArr.length <= 0) return;
            let arr = [];
            //删掉重复的
            this.$leftCheckOrgArr = rightArr ? rightArr : this.$leftCheckOrgArr;
            for (let i = 0; i < this.resultsGroup.length; i++) {
                let b = this.resultsGroup[i];
                for (var j = 0; j < this.$leftCheckOrgArr.length; j++) {
                    let a = this.$leftCheckOrgArr[j];
                    if (a.orgCode == b.orgCode) {
                        this.$leftCheckOrgArr.splice(i, 1);
                        break;
                    }
                }
            }
            let string = '';
            avalon.each(this.$leftCheckOrgArr, function (index, item) {
                string += '<li class="rightreeli" data-orgcode=' + item.orgCode + '>' +
                    '<input type="checkbox" class="rightspan" style="margin-right: 3px;" data-orgcode=' + item.orgCode + '>' +
                    '<span class="rightspan spanorg">' + item.orgName + '</span>' +
                    '<span class="fa faClose fa-lg" data-orgcode=' + item.orgCode + '></span>' +
                    '</li>'
            })
            this.resultsGroup = this.resultsGroup.concat(this.$leftCheckOrgArr);
            this.$leftCheckOrgArr = [];
            $('#righttree').append(string);
            $('#righttree li').off('click', 'input');
            $('#righttree li').off('click', 'span.faClose');
            $('#righttree li').on("click", 'input', function (e) {
                vm.check_one(e);
            })
            $('#righttree li').on("click", 'span.faClose', function (e) {
                vm.handleSingleDeleteClick($(e.target).attr('data-orgcode'));
            })
            if (this.$leftCheckOrgArr.length == 0) {
                this.rightDisabled = true;
            } else {
                this.rightDisabled = false;
            }
            // avalon.scan($('body')[0]);
        },
        handleToLeft() {
            if (this.$rightCheckArr.length <= 0) {
                return;
            }
            let arr = this.$rightCheckArr.concat([]);
            avalon.each(arr, function (index, item) {
                vm.handleSingleDeleteClick(item);
            });
        },
        check_one: function (e) {
            var checked = e.target.checked
            var orgcode = $(e.target).attr('data-orgcode');
            if (checked === true) {
                this.$rightCheckArr.push(orgcode);
                //表示全选了
                if (this.$rightCheckArr.length == $('#righttree li').length) {
                    this.allchecked = true;
                }
            } else {
                this.allchecked = false;
                for (var i = 0; i < this.$rightCheckArr.length; i++) {
                    if (this.$rightCheckArr[i] == orgcode) {
                        this.$rightCheckArr.splice(i, 1);
                        break;
                    }
                }
            }
            if (this.$rightCheckArr.length == 0) {
                this.leftDisabled = true;
            } else {
                this.leftDisabled = false;
            }
        },
        checkAll(e) {
            var checked = e.target.checked
            if (checked) {
                $("#righttree li :checkbox").prop("checked", true);
                let liArr = $('#righttree li');
                var _this = this;
                let temparr = [];
                avalon.each(liArr, function (index, item) {
                    temparr.push($(item).attr('data-orgcode'));
                })
                this.$rightCheckArr = temparr;
            } else {
                $("#righttree li :checkbox").prop("checked", false)
                this.$rightCheckArr = [];
            }
            if (this.$rightCheckArr.length == 0) {
                this.leftDisabled = true;
            } else {
                this.leftDisabled = false;
            }

        },
        handleSingleDeleteClick: function (orgcode) {
            //右边点删除
            for (var i = 0; i < this.resultsGroup.length; i++) {
                if ($.trim(this.resultsGroup[i].orgCode) == $.trim(orgcode)) {
                    //左侧部门树取消对应勾选
                    let node = vm.treeObj.getNodeByParam('orgCode', orgcode);
                    if (node) {
                        vm.treeObj.checkNode(node, false)
                    }
                    $("#righttree li").eq(i).remove();
                    this.resultsGroup.splice(i, 1);
                    break;
                }
            }
            //以及选择的也要删掉数据
            for (var i = 0; i < this.$rightCheckArr.length; i++) {
                if (this.$rightCheckArr[i] == orgcode) {
                    this.$rightCheckArr.splice(i, 1);
                    break;
                }
            }
            if (this.$rightCheckArr.length == 0) {
                this.leftDisabled = true;
                this.allchecked = false;
            } else {
                this.leftDisabled = false;
            }
        },
        handleSearchEnter(e) {
            if (e.keyCode == 13 && ($.trim(this.searchInputValue) != "")) {
                this.handleSearchClick();
                return false; //阻止ie8弹框中的确定，取消按钮事件
            }
        },
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
            //     return new RegExp(_this.searchInputValue).test(node.orgName);
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
                    vm.isGiveParm = false;
                    return;
                }
                vm.isGiveParm = true;
                //切割orgpath
                let temp = [];
                avalon.each(ret.data, function (index, value) {
                    let arr = value.orgPath.split('/');
                    avalon.each(arr, function (i, v) {
                        if (temp.indexOf(v) == -1 && v != "") temp.push(v);
                    })
                })
                vm.searchResult = temp;
                avalon.each(temp, function (key, item) {
                    var nodes = _this.treeObj.getNodesByFilter(function (node) {
                        return (node.orgCode == item || node.orgId == item);
                    });
                    if (nodes.length > 0 && nodes[0].open == true) return;
                    if (nodes.length > 0) {
                        _this.treeObj.expandNode(nodes[0], true, false, true, false);
                        _this.treeObj.setting.callback.beforeExpand(vm.treeId, nodes[0], temp)
                    }
                });
                let nodeList = _this.treeObj.getNodesByFilter(function (node) {
                    if ($.trim(_this.searchInputValue) == "") {
                        node = null;
                        return node;
                    }
                    return new RegExp(_this.searchInputValue).test(node.orgName);
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
        handleBeforeExpand(treeId, treeNode) {
            /*将treeobj放回回去*/
            let orgCodeArr = [];
            avalon.each(this.resultsGroup.$model, function (i, v) {
                orgCodeArr.push(v.orgCode);
            })
            this.returnRightItems(orgCodeArr, vm.treeObj);

            if (treeNode.children && treeNode.children.length > 0) return;
            let string = vm.isGiveParm ? vm.searchInputValue : '';
            if (!treeNode.children || treeNode.children.length == 0) this.getOrgByOrgIdAjax(treeId, treeNode, '', vm.searchResult, string, orgIdArr); //先把部门加进去,并且不重复添加

        },
        handleonCheck(checkedKeys, e) {
            if (e.checked == true) {
                //请求部门列表
                vm.getOrgArrByOrgId(e.node.orgId).then((ret) => {
                    if (ret.code == 0) {
                        if (vm.$leftCheckOrgArr.length == 0) {
                            let arr = ret.data;
                            avalon.each(vm.resultsGroup, function (index, item) {
                                for (var i = 0; i < arr.length; i++) {
                                    if (arr[i].orgCode == item.orgCode) {
                                        arr.splice(i, 1);
                                        break;
                                    }
                                }
                            })
                            vm.$leftCheckOrgArr = arr;
                            if (vm.$leftCheckOrgArr.length == 0) {
                                vm.rightDisabled = true;
                            } else {
                                vm.rightDisabled = false;
                            }
                        } else {
                            //这里表示上次勾选了部门，但是没有点击右侧过去箭头
                            avalon.each(ret.data, function (index, item) {
                                for (var i = 0; i < vm.$leftCheckOrgArr.length; i++) {
                                    if (vm.$leftCheckOrgArr[i].orgCode == item.orgCode) {
                                        break;
                                    }
                                }
                                //表示这个部门没有添加过
                                if (i == vm.$leftCheckOrgArr.length) {
                                    vm.$leftCheckOrgArr.push(item);
                                }
                            })
                            if (vm.$leftCheckOrgArr.length == 0) {
                                vm.rightDisabled = true;
                            } else {
                                vm.rightDisabled = false;
                            }
                        }

                    } else {
                        showMessage('error', '获取部门数据失败');
                    }
                })
            } else {
                //表示点击取消了跟部门,请求一次列表，对比之后删掉
                if (vm.$leftCheckOrgArr.length <= 0) return;
                //请求部门列表
                this.getOrgArrByOrgId(e.node.orgId).then((ret) => {
                    if (ret.code == 0) {
                        avalon.each(ret.data, function (index, item) {
                            for (let i = 0; i < vm.$leftCheckOrgArr.length; i++) {
                                if (vm.$leftCheckOrgArr[i].orgCode == item.orgCode) {
                                    vm.$leftCheckOrgArr.splice(i, 1);
                                    break;
                                }
                            }
                        })
                        if (vm.$leftCheckOrgArr.length == 0) {
                            vm.rightDisabled = true;
                        } else {
                            vm.rightDisabled = false;
                        }
                    } else {
                        showMessage('error', '获取部门数据失败');
                    }
                })
            }
            // this.$leftCheckOrgArr = this.treeObj.getCheckedNodes(true);
        },
        handleDblClick(e, targetObj) {
            this.treeObj.checkNode(targetObj['node'], '', '', true);
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
    }
})
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: "通知",
        message: content,
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