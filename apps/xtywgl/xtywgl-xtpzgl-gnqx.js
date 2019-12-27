import avalon from 'avalon2';
import 'ane';
import {
    createForm,
    notification
} from "ane";
import ajax from "../../services/ajaxService";
import * as menuServer from '../../services/menuService';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
export const name = 'xtpzgl-gnqx';
require('apps/xtywgl/xtywgl-xtpzgl-gnqx.less');
var storage = require('../../services/storageService.js').ret;
let roleIdStorage = storage.getItem('roleIds');

let authority_tree_data = [], //全局的存储功能权限树数据
    jsgl_vm;
let jsgl_click_flag_set = {
    addRole_click: true, //新增角色标识
    editRole_click: true, //编辑角色标识
    deleteRole_click: true, //删除角色标识
    saveAuthority_click: true, //保存权限标识
};
let authorityTree = [],
    initFlag = false, //解决页面切换回来渲染两次的Bug
    tempCheckTree = [], //保存树的展开状态
    globalSelectedItem = null; //全局的存储选中的角色列表[解决IE8]
let vm = avalon.component(name, {
    template: __inline('./xtywgl-xtpzgl-gnqx.html'),
    defaults: {
        extra_class: languageSelect == 'en' ? true : false,
        gnqxClass: languageSelect == 'en' ? 'btnIcon' : 'btnIcon btnIcon_zhcn',
        gnqx_language: language_txt.xtywgl.jsgl, //多语言
        org_icon: '/static/image/tyywglpt/org.png',
        menu_icon: '/static/image/xtpzgl-gnqx/menu.png',
        fuc_icon: '/static/image/xtpzgl-gnqx/function.png',
        gnqx_opt: avalon.define({
            $id: 'gnqx_opt',
            jsMenuBg: '', //菜单颜色置灰类名
            authority: { // 按钮权限标识
                "CREATE": false, //功能权限_新增角色
                "DELETE": false, //功能权限_删除角色
                "EDIT": false, //功能权限_编辑角色
                "BJQX": false //功能权限_保存权限
            }
        }),
        clickRoleItem: function (obj, event) {
            $(event.target).parent().addClass("item_select");
            $(event.target).parent().siblings().removeClass("item_select");
            globalSelectedItem = {
                id: obj.item.id,
                roleName: obj.item.roleName
            };
            this.ajaxSelectedItemMenus(globalSelectedItem.id);
        },
        ajaxRolesList() { //获取左侧的角色列表
            $(".roleLists_body").find("li").removeClass("item_select");
            ajax({
                url: '/gmvcs/uap/roles/all',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取角色列表失败，请联系管理员',
                        title: jsgl_vm.gnqx_language.tips
                    });
                    return;
                }
                let tempList = [];
                if (result.data.length == 0) {
                    notification.info({
                        message: '暂无角色列表',
                        title: jsgl_vm.gnqx_language.tips
                    });
                    authority_tree.checkable = true;
                    this.gnqx_opt.jsMenuBg = '';
                    authority_tree.authority_data = authorityTree;
                    tempExpandedKeys.push("all");
                    authority_tree.expandedKeys = tempExpandedKeys;
                    return;
                }
                avalon.each(result.data, function (index, val) {
                    if (index == 0) {
                        globalSelectedItem = {
                            roleName: val.roleName,
                            id: val.id
                        };
                    }
                    tempList.push({
                        roleName: val.roleName,
                        id: val.id
                    });
                });
                roleItem_cont.roleItemsLists = tempList;
                $(".roleLists_body").find("li").first().addClass("item_select");
                this.ajaxSelectedItemMenus(globalSelectedItem.id);
            });
        },
        ajaxFunction_tree: function () { //获取右侧的功能权限树
            ajax({
                url: '/gmvcs/uap/app/listAll',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code == 0) {
                    getRoleTree(result.data, authority_tree_data);
                    var obj = new Array();
                    obj[0] = new Object();
                    obj[0].children = new Array();
                    obj[0].children = authority_tree_data;
                    obj[0].title = this.gnqx_language.all;
                    obj[0].key = 'all';
                    obj[0].icon = vm.defaults.org_icon;
                    // console.log(obj);
                    authorityTree = obj;
                    // var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
                    // var nodes = gnqx_tree.getNodes();            
                    // gnqx_tree.setChkDisabled(nodes[0], true, true, true);   
                } else {
                    notification.error({
                        message: result.msg,
                        title: jsgl_vm.gnqx_language.tips
                    });
                }
                this.ajaxRolesList();
            });
        },
        //获取已选中角色对应的功能权限
        ajaxSelectedItemMenus(itemId) {
            if (itemId == roleIdStorage[0]) { //判断目前选中角色是否是当前登陆用户的角色
                this.gnqx_opt.jsMenuBg = 'jsMenuBg';
                // authority_tree.checkable = false;
                let data = [];
                getRoleTreeDate(authorityTree, data);
                authority_tree.authority_data = [].concat(data);
                tempExpandedKeys.push("all");
                authority_tree.expandedKeys = tempExpandedKeys;
                return;
            }
            authority_tree.checkable = true;
            this.gnqx_opt.jsMenuBg = '';
            ajax({
                url: '/gmvcs/uap/roles/queryById/' + itemId,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code == 0) {
                    let checkedArr = []; //过滤后台返回的含有子节点的父节点
                    if (result.data.menus.length != 0) {
                        avalon.each(result.data.menus, function (index, val) {
                            if (tmpParent.indexOf(val.menuCode) == -1) {
                                checkedArr.push(val.menuCode);
                            }
                        });
                    }
                    // if (initFlag) {
                    authority_tree.authority_data = authorityTree;
                    tempExpandedKeys.push("all");
                    authority_tree.expandedKeys = tempExpandedKeys;
                    // initFlag = false;
                    // }
                    authority_tree.checkedKeys = checkedArr;
                    finalCheckedArr = checkedArr;

                    //不允许操作右侧树
                    var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
                    if (gnqx_tree == null) //当树对象为null，则不执行下面的代码
                        return;
                    var nodes = gnqx_tree.getNodes();
                    gnqx_tree.setChkDisabled(nodes[0], true, true, true);
                    jsgl_vm.editAuthorityStatu = true;
                } else {
                    notification.error({
                        message: result.msg,
                        title: jsgl_vm.gnqx_language.tips
                    });
                }
            });
        },
        onInit(e) {
            //不需要存储数据进localStorage中,页面默认选中第一条数据,解决角色列表有更新问题.
            jsgl_vm = e.vmodel;
            let _this = this;
            authority_tree.authority_data = [];
            initFlag = true;
            tempExpandedKeys = [];
            this.ajaxFunction_tree();
            // 新增、编辑、删除按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_GNQX/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                // if (0 == func_list.length) {
                //     // 设置绝对定位的top，防止空白
                //     $('.contentBox').css('top', '9px');
                //     return;
                // }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_GNQX_EDIT":
                            _this.gnqx_opt.authority.EDIT = true;
                            break;
                        case "CAS_FUNC_GNQX_CREATE":
                            _this.gnqx_opt.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_GNQX_DELETE":
                            _this.gnqx_opt.authority.DELETE = true;
                            break;
                        case 'CAS_FUNC_GNQX_BJQX':
                            _this.gnqx_opt.authority.BJQX = true;
                    }
                });
            });
        },

        //刷新页面操作
        refreshEvt() {
            document.getElementById("scrollBox").scrollTop = 0;
            this.ajaxRolesList();
        },
        addRole() {
            if (jsgl_click_flag_set.addRole_click) {
                jsgl_click_flag_set.addRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.addRole_click = true;
                }, 2000);
            } else {
                return;
            }
            add_editVm.title = jsgl_vm.gnqx_language.newRole;
            add_editVm.roleName = '';
            add_editVm.name_display = 'none';
            add_editVm.jsgl_close_name = false;
            add_edit_cont.add_editShow = true;
        },
        editRole(obj, event) {
            jsgl_vm.clickRoleItem(obj, event);
            if (this.gnqx_opt.jsMenuBg) return; //置灰不可编辑
            if (jsgl_click_flag_set.editRole_click) {
                jsgl_click_flag_set.editRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.editRole_click = true;
                }, 2000);
            } else {
                return;
            }
            add_editVm.title = jsgl_vm.gnqx_language.edit;
            add_editVm.roleName = globalSelectedItem.roleName;
            add_editVm.name_display = 'none';
            add_editVm.roleId = globalSelectedItem.id;
            add_editVm.jsgl_close_name = true;
            add_edit_cont.add_editShow = true;

        },
        deleteRole(obj, event) {
            //删除角色的时候增加选中效果
            $(event.target).parent().parent().addClass("item_select");
            $(event.target).parent().parent().siblings().removeClass("item_select");
            globalSelectedItem = {
                id: obj.item.id,
                roleName: obj.item.roleName
            };
            this.ajaxSelectedItemMenus(globalSelectedItem.id);
            if (this.gnqx_opt.jsMenuBg) return; //置灰不可编辑
            if (jsgl_click_flag_set.deleteRole_click) {
                jsgl_click_flag_set.deleteRole_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.deleteRole_click = true;
                }, 2000);
            } else {
                return;
            }
            deleteRoleVm.deleteId = globalSelectedItem.id;
            deleteRole_cont.deleteRoleShow = true;
        },
        saveAuthority() {
            if (this.gnqx_opt.jsMenuBg) return; //置灰不可编辑
            if (jsgl_click_flag_set.saveAuthority_click) {
                jsgl_click_flag_set.saveAuthority_click = false;
                setTimeout(function () {
                    jsgl_click_flag_set.saveAuthority_click = true;
                }, 2000);
            } else {
                return;
            }
            //将获取到的menucode转换成后台要求的格式
            let tempCheckObj = [];
            for (let i = 0; i < finalCheckedArr.length; i++) {
                tempCheckObj.push({
                    "menuCode": finalCheckedArr[i]
                });
            }
            ajax({
                url: '/gmvcs/uap/roles/privilege/save',
                method: 'post',
                data: {
                    "menus": tempCheckObj,
                    "id": globalSelectedItem.id,
                }
            }).then(result => {
                if (result.code == 0) {
                    saveAuthority_cont.saveAuthorityShow = true;
                } else {
                    notification.error({
                        message: result.msg,
                        title: jsgl_vm.gnqx_language.tips
                    });
                    return;
                }
            });
        },
        editAuthorityStatu: true,
        editAuthority() {
            //设置树可编辑            
            var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
            var nodes = gnqx_tree.getNodes();
            gnqx_tree.setChkDisabled(nodes[0], false, true, true);
            this.editAuthorityStatu = false;
        },
        cancelEditAuthority() {
            var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
            var nodes = gnqx_tree.getNodes();
            gnqx_tree.setChkDisabled(nodes[0], true, true, true);
            this.editAuthorityStatu = true;
        },
        onReady() {
            setTimeout(() => {
                var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
                if (gnqx_tree == null) //当树对象为null，则不执行下面的代码
                    return;
                var nodes = gnqx_tree.getNodes();
                gnqx_tree.setChkDisabled(nodes[0], true, true, true);
            }, 1000);
            // this.$watch('editAuthorityStatu', function(v) {
            //     if (!this.editAuthorityStatu) {
            //         return;
            //     }
            // });
        },
        onDispose() {
            jsgl_click_flag_set = {
                addRole_click: true,
                editRole_click: true,
                deleteRole_click: true,
                saveAuthority_click: true,
            };
        }
    }
});

//角色列表->不抽取出来会导致数值已改变，但页面渲染没出来
let roleItem_cont = avalon.define({
    $id: 'roleItem_cont',
    roleItemsLists: []
});

//功能权限树
let finalCheckedArr = [];
let authority_tree = avalon.define({
    $id: 'authority_tree',
    authority_data: [],
    expandedKeys: [],
    checkable: true,
    handleBeforeExpand: function (treeId, treeNode) {
        var index = tempCheckTree.indexOf(treeNode.key);
        if (index == -1) {
            tempCheckTree.push(treeNode.key);
        }
    },
    handleBeforeCollapse: function (treeId, treeNode) {
        var index = tempCheckTree.indexOf(treeNode.key);
        tempCheckTree.splice(index, 1);
    },
    checkedTree: function (checkedKeys, depNode) {
        finalCheckedArr = [];
        let tempCheckedNodes = depNode.checkedNodes;
        let tmpLength = tempCheckedNodes.length;
        for (let i = 0; i < tmpLength; i++) {
            if (tempCheckedNodes[i].level == 0) {
                finalCheckedArr = allFunc;
            } else if (tempCheckedNodes[i].level == 1) {
                getRun(tempCheckedNodes[i].children);
            } else {
                if (tempCheckedNodes[i].checked) { //只有被选中的节点才能被加进去
                    let parentCode = tempCheckedNodes[i].pCode.split("+");
                    for (var m = 0; m < parentCode.length; m++) {
                        if (parentCode[m] != '') {
                            if (finalCheckedArr.indexOf(parentCode[m]) == -1) {
                                finalCheckedArr.push(parentCode[m]);
                            }
                        }
                    }
                    if (tempCheckedNodes[i].isParent == true) {
                        for (let k = 0; k < tempCheckedNodes[i].children.length; k++) {
                            if (tempCheckedNodes[i].children[k].checked) { //只有被选中的节点才能被加进去
                                finalCheckedArr.push(tempCheckedNodes[i].children[k].key);
                            }
                            getRun(tempCheckedNodes[i].children[k].children);
                        }
                    }
                }
            }
        }
    },
    checkedKeys: []
});

//循环遍历取出勾选子节点的父父节点直至最上一级
function getRun(tempArr) {
    if (tempArr.length != 0) {
        for (let t = 0; t < tempArr.length; t++) {
            if (tempArr[t].checked) { //只有被选中的节点才能被加进去
                finalCheckedArr.push(tempArr[t].key);
            }
            if (tempArr[t].children.length != 0) {
                getRun(tempArr[t].children);
            }
        }
    }
}

let tmpParent = []; //存储含有子节点的key
let allFunc = []; //存储所有的菜单跟功能
let tempExpandedKeys = []; //存储初始条件展开的节点
//配置权限名称
let menuListName = {
    "MVMS": language_txt.xtywgl.jsgl.MVMS,
    "Monitor": language_txt.xtywgl.jsgl.Monitor,
    "Query": language_txt.xtywgl.jsgl.Query,
    "Alarm": language_txt.xtywgl.jsgl.Alarm,
    "Subscribe": language_txt.xtywgl.jsgl.Subscribe,
    "Command": language_txt.xtywgl.jsgl.Command,
    "Trace": language_txt.xtywgl.jsgl.Trace,
    "Playback": language_txt.xtywgl.jsgl.Playback,
    "HOME": language_txt.xtywgl.jsgl.HOME,
    "Home": language_txt.xtywgl.jsgl.Home,
    "DEMS": language_txt.xtywgl.jsgl.DEMS,
    "Media": language_txt.xtywgl.jsgl.Media,
    "Marked": language_txt.xtywgl.jsgl.Marked,
    "Change": language_txt.xtywgl.jsgl.Change,
    "Details": language_txt.xtywgl.jsgl.Details,
    "Delete": language_txt.xtywgl.jsgl.Delete,
    "Download": language_txt.xtywgl.jsgl.Download,
    "Statistics": language_txt.xtywgl.jsgl.Statistics,
    "Media Statistics": language_txt.xtywgl.jsgl.MediaStatistics,
    "Device Statistics": language_txt.xtywgl.jsgl.DeviceStatistics,
    "Mangement": language_txt.xtywgl.jsgl.Mangement,
    "Docking Station": language_txt.xtywgl.jsgl.DockingStation,
    "Security": language_txt.xtywgl.jsgl.Security,
    "Batch Delete": language_txt.xtywgl.jsgl.BatchDelete,
    "Storage Days": language_txt.xtywgl.jsgl.StorageDays,
    "Edit": language_txt.xtywgl.jsgl.Edit,
    "Add": language_txt.xtywgl.jsgl.Add,
    "Upgrade": language_txt.xtywgl.jsgl.Upgrade,
    "Upgrade Package": language_txt.xtywgl.jsgl.UpgradePackage,
    "Upload": language_txt.xtywgl.jsgl.Upload,
    "Upgrade History": language_txt.xtywgl.jsgl.UpgradeHistory,
    "BWC": language_txt.xtywgl.jsgl.BWC,
    "ISSUE": language_txt.xtywgl.jsgl.ISSUE,
    "Device": language_txt.xtywgl.jsgl.Device,
    "Add BWC": language_txt.xtywgl.jsgl.AddBWC,
    "Storage": language_txt.xtywgl.jsgl.Storage,
    "File upload service": language_txt.xtywgl.jsgl.Fileuploadservice,
    "4G video storage": language_txt.xtywgl.jsgl.videoStorage,
    "Storage Days": language_txt.xtywgl.jsgl.StorageDays,
    "Details": language_txt.xtywgl.jsgl.Details,
    "Storage Allocation": language_txt.xtywgl.jsgl.StorageAllocation,
    "Organization": language_txt.xtywgl.jsgl.Organization,
    "Add Department": language_txt.xtywgl.jsgl.AddDepartment,
    "Delete Department": language_txt.xtywgl.jsgl.DeleteDepartment,
    "Edit Department": language_txt.xtywgl.jsgl.EditDepartment,
    "Add User": language_txt.xtywgl.jsgl.AddUser,
    "Delete User": language_txt.xtywgl.jsgl.DeleteUser,
    "Edit User": language_txt.xtywgl.jsgl.EditUser,
    "Export User": language_txt.xtywgl.jsgl.ExportUser,
    "Export Template": language_txt.xtywgl.jsgl.ExportTemplate,
    "Import User": language_txt.xtywgl.jsgl.ImportUser,
    "Log": language_txt.xtywgl.jsgl.Log,
    "Exprot log": language_txt.xtywgl.jsgl.Exprotlog,
    "License": language_txt.xtywgl.jsgl.License,
    "Role": language_txt.xtywgl.jsgl.Role,
    "Ok": language_txt.xtywgl.jsgl.Ok,
    "OK": language_txt.xtywgl.jsgl.OK,
    "Add Role": language_txt.xtywgl.jsgl.AddRole,
    "Delete Role": language_txt.xtywgl.jsgl.DeleteRole,
    "Edit Role": language_txt.xtywgl.jsgl.EditRole,
    "View Others": language_txt.xtywgl.jsgl.ViewOthers,
    "Export Data": language_txt.xtywgl.jsgl.ExportData,
    "Delete Data": language_txt.xtywgl.jsgl.DeleteData,
    "Local Domain": language_txt.xtywgl.jsgl.LocalDomain,
    "Permission": language_txt.xtywgl.jsgl.Permission,
    "View": language_txt.xtywgl.jsgl.View,
    "Administrative Division": language_txt.xtywgl.jsgl.AdministrativeDivision,
    "Business Group": language_txt.xtywgl.jsgl.BusinessGroup,
    "R&D Log": language_txt.xtywgl.zfyyfrz.title,
    "Download": language_txt.xtywgl.zfyyfrz.download,
    "ADVANCED": language_txt.xtywgl.gjpz.title,
    "Storage Mode": language_txt.xtywgl.gjpz.title1,
    "BWC Pwd": language_txt.xtywgl.gjpz.title2,
    "EDIT": language_txt.xtywgl.gjpz.edit,
    "QUERY": language_txt.xtywgl.gjpz.query,
};
function getRoleTree(treelet, dataTree, pCode) {
    if (!treelet) {
        return;
    }
    // console.log(treelet);
    for (let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].children = new Array();
        if (item.code) { //系统
            dataTree[i].key = item.code;
            let itemName = item.name;
            dataTree[i].title = menuListName[itemName];
            // dataTree[i].title = item.name;
            dataTree[i].icon = vm.defaults.org_icon;
            dataTree[i].hasChild = true;
            dataTree[i].flag = true;
            // dataTree[i].open = true;
            tmpParent.push(item.code);
            if (tempExpandedKeys.indexOf(item.code) == -1) {
                tempExpandedKeys.push(item.code);
                tempCheckTree.push(item.code);
            }
            getRoleTree(item.menus, dataTree[i].children, "");
        } else { //全选的时候，只传菜单和功能，不传系统
            allFunc.push(item.menuCode);
            dataTree[i].key = item.menuCode;
            let itemMenuName = item.menuName;
            dataTree[i].title = menuListName[itemMenuName];
            // dataTree[i].title = item.menuName;
            dataTree[i].hasChild = false;
            dataTree[i].pCode = pCode + '+' + item.menuCode;
            // dataTree[i].open = true;
            if (item.menuType == "MENU") {
                // if (tempExpandedKeys.indexOf(item.menuCode) == -1) {
                //     tempExpandedKeys.push(item.menuCode);
                // }
                dataTree[i].icon = vm.defaults.menu_icon;
                dataTree[i].hasChild = true;
                if (item.childs.length != 0) {
                    tmpParent.push(item.menuCode);
                }
                getRoleTree(item.childs, dataTree[i].children, dataTree[i].pCode);
            } else {
                dataTree[i].icon = vm.defaults.fuc_icon;
            }
        }
    }

}

/**
 * 重新处理权限列表树的数据
 * @param {Array} treeData  传入的树数据
 * @param {Array} dataTree  存放处理后树数据
 */
function getRoleTreeDate(treeData, dataTree) {
    var i = 0,
        len = treeData.length;
    for (var i = 0; i < len; i++) {
        dataTree[i] = new Object();
        Object.keys(treeData[i]).forEach(prop => {
            dataTree[i][prop] = treeData[i][prop];
        });
        dataTree[i].checked = true;
        dataTree[i].chkDisabled = true;
        dataTree[i].children = new Array();
        getRoleTreeDate(treeData[i].children, dataTree[i].children);
    };
}

//新增 and 编辑角色
let add_edit_cont = avalon.define({
    $id: 'add_edit_cont',
    add_editShow: false,
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    okText: language_txt.xtywgl.ccgl.save,
    cancelText: language_txt.xtywgl.ccgl.cancel,
    add_editCancel: function () {

        this.add_editShow = false;
        add_editVm.roleName = '';
        add_editVm.name_display = 'none';
        add_editVm.roleNameTips = 'none';
        add_editVm.name_isNull = 'none';
    },
    add_editOk: function () {
        this.gnqx_language;
        if (add_editVm.roleName == '') {
            add_editVm.name_isNull = 'block';
            return;
        }
        if (add_editVm.roleNameTips == 'block') {
            add_editVm.jsgl_close_name = true;
            return;
        }
        if (add_editVm.title == jsgl_vm.gnqx_language.newRole) {
            ajax({
                url: '/gmvcs/uap/roles/create',
                method: 'post',
                data: {
                    "roleName": add_editVm.roleName
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: jsgl_vm.gnqx_language.newRoleSuccess,
                        title: jsgl_vm.gnqx_language.tips
                    });
                    this.add_editShow = false;
                    vm.defaults.refreshEvt();
                } else {
                    notification.error({
                        message: result.msg,
                        title: jsgl_vm.gnqx_language.tips
                    });
                }
            });
        } else {
            ajax({
                url: '/gmvcs/uap/roles/edit',
                method: 'post',
                data: {
                    "roleName": add_editVm.roleName,
                    "id": add_editVm.roleId
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: jsgl_vm.gnqx_language.editRoleSuccess,
                        title: jsgl_vm.gnqx_language.tips
                    });
                    this.add_editShow = false;
                    vm.defaults.refreshEvt();
                } else {
                    notification.error({
                        message: result.msg,
                        title: jsgl_vm.gnqx_language.tips
                    });
                }
            });
        }
    }
});
let add_editVm = avalon.define({
    $id: 'add_editVm',
    title: '新增角色',
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    okText: language_txt.xtywgl.ccgl.save,
    cancelText: language_txt.xtywgl.ccgl.cancel,
    roleName: '',
    roleId: '',
    name_display: 'none',
    name_isNull: 'none',
    roleNameTips: 'none',
    jsgl_close_name: false,
    close_click: function () {
        let _this = this;
        _this.roleName = "";
        _this.jsgl_close_name = false;
        _this.name_display = "block";
        _this.roleNameTips = "none";
        $(".roleName_input").focus();
        return false;
    },
    focusRoleName: function () {
        if (this.roleName.length != 0) {
            this.jsgl_close_name = true;
            $(".roleName_input").addClass("jsgl_change_padding");
        }
        this.name_isNull = 'none';
        if (this.roleNameTips == 'block') {
            $(".add_edit_dialog  .common_input input[name='name']").addClass('has-error');
        } else {
            this.name_display = 'block';
        }
    },
    blurRoleName: function () {
        this.jsgl_close_name = false;
        this.name_display = 'none';
        if (this.roleNameTips == 'block') {
            $(".add_edit_dialog  .common_input input[name='name']").removeClass('has-error');
        }
    },
    roleNameEvt: function (e) {
        this.roleName = e.target.value;
        let name_val = e.target.value;
        // var reg = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
        if(jsgl_vm.extra_class) {
            var reg = new RegExp("^[A-Za-z0-9]+$"); //只允许英文字母和数字
        }else {
            var reg = new RegExp("^[A-Za-z0-9\u4e00-\u9fa5]+$");
        }
        this.name_isNull = 'none';
        if (name_val.length == 0) {
            this.jsgl_close_name = false;
            $(".roleName_input").removeClass("jsgl_change_padding");
        } else {
            this.jsgl_close_name = true;
            $(".roleName_input").addClass("jsgl_change_padding");
        }
        if (name_val == '' || reg.test(name_val)) {
            this.name_display = 'block';
            this.roleNameTips = 'none';
            $(".add_edit_dialog  .common_input input[name='name']").removeClass('has-error');
        } else {
            this.name_display = 'none';
            this.roleNameTips = 'block';
            $(".add_edit_dialog  .common_input input[name='name']").addClass('has-error');
        }
    },
});

//删除角色
let deleteRole_cont = avalon.define({
    $id: 'deleteRole_cont',
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    okText: language_txt.xtywgl.ccgl.save,
    cancelText: language_txt.xtywgl.ccgl.cancel,
    deleteRoleShow: false,
    deleteRoleCancel: function () {
        this.deleteRoleShow = false;
    },
    deleteRoleOk: function () {
        ajax({
            url: '/gmvcs/uap/roles/delete/' + deleteRoleVm.deleteId,
            method: 'get',
            data: {}
        }).then(result => {
            if (result.code == 0) {
                notification.success({
                    message: jsgl_vm.gnqx_language.deleteSuccess,
                    title: jsgl_vm.gnqx_language.tips
                });
                this.deleteRoleShow = false;
                vm.defaults.refreshEvt();
            } else {
                notification.error({
                    message: result.msg,
                    title: jsgl_vm.gnqx_language.tips
                });
            }
        });
    }
});
let deleteRoleVm = avalon.define({
    $id: 'deleteRoleVm',
    title: language_txt.xtywgl.jsgl.delTitle,
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    okText: language_txt.xtywgl.ccgl.save,
    cancelText: language_txt.xtywgl.ccgl.cancel,
    deleteId: ''
});


let saveAuthority_cont = avalon.define({
    $id: 'saveAuthority_cont',
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    saveAuthorityShow: false,
    saveAuthorityCancel: function () {
        this.saveAuthorityShow = false;
    }
});
let saveAuthorityVm = avalon.define({
    $id: 'saveAuthorityVm',
    gnqx_language: language_txt.xtywgl.jsgl, //多语言
    title: language_txt.xtywgl.jsgl.tips,
    saveAuthorityOk: function () {
        saveAuthority_cont.saveAuthorityShow = false;

        var gnqx_tree = $.fn.zTree.getZTreeObj($('#authority_tree .ztree').attr('id'));
        if (gnqx_tree == null) //当树对象为null，则不执行下面的代码
            return;
        var nodes = gnqx_tree.getNodes();
        gnqx_tree.setChkDisabled(nodes[0], true, true, true);
        jsgl_vm.editAuthorityStatu = true;
    },
});