import ajax from '../../services/ajaxService.js';
import { createForm, message } from "ane";

require('./tyywglpt-ccfwgl-khdscfwgl.css');
let ec = require('echarts/dist/echarts.min');
export const name = 'tyywglpt-ccfwgl-khdscfwgl';
let vm = null;
 avalon.component(name, {
    template: __inline('./tyywglpt-ccfwgl-khdscfwgl.html'),
    defaults:{
        checkAll: false,
        checkBox: [],//存储已经选中的元素
        btnDisabled: true,
        online: "在线",
        offline: "离线",
        noData: false,//获取列表没有数据
        tableData: [],
        orgData:[],
        editData: {},
        currentPage: 1,
        page: 1,
        pageSize: 20,
        orgId: '',//外围所选所属机构id
        total: 0,
        currentPage:1,//用于查询时重新更新分页组件的current
        $form:createForm(),
        getSelected(key){
            this.orgId = key;
            alert(key);
        },
        clearEdit() {
            this.editData = {};
        },
        //点击查询，获取数据
        querySearch() {
            this.ajaxTableList(this.orgId);
            // console.log(avalon.vmodels);
            vm.currentPage = 1;
        },
        onInit(event) {
            let _this = this;
            vm = event.vmodel;
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    _this.orgData = changeTreeData(ret.data,'./static/image/tyywglpt-ccfwgl/org.png');
                } else {
                    showMessage('error', '获取所属机构失败！');
                }
            });
               //获取数据列表
               _this.ajaxTableList();

        },
        ajaxTableList(orgId, page, pageSize) {
            let _this = this;
            getTableData(orgId, page, pageSize).then((ret) => {
                if (ret.data == null) {
                    _this.noData = true;
                    return false;
                }
                let datas = ret['data']['storageInfos'];
                let total = ret['data']['count'];
                _this.total = total;
                if (!datas.length) {
                    _this.noData = true;
                    showMessage("info", "暂无数据");
                }
                avalon.each(datas, (i, el) => {
                    datas[i].active = false;
                    datas[i].checked = false;
                });
                _this.tableData = datas;
                _this.clearEdit();
            });
        },
        handlePageChange(curpage, pageSize) {
            this.ajaxTableList(this.orgId, --curpage, pageSize);
        },
        //全选复选框
        handleCheckAll(e) {
            let list = this.tableData;
            let bol = e.target.checked;
            this.checkBox.clear();
            avalon.each(list, (key, val) => {
                val.checked = bol;
                val.active = bol;
                if (bol)
                    this.checkBox.pushArray([val]);
                else
                    this.checkBox.clear();
            });
            if (this.checkBox.length == 1)
                this.btnDisabled = false;
            else
                this.btnDisabled = true;
        },
        //单选复选框
        handleCheck($index, item, e) {
            let _this = this;
            let list = this.tableData;
            list[$index]['checked'] = item.checked;
            let ret = list.filter((item) => {
                return item['checked'];
            });
            if (ret.length == list.length)
                this.checkAll = true;
            else
                this.checkAll = false;
            if (e.target.checked == true)
                this.checkBox.ensure(item);
            else
                this.checkBox.remove(item);

            if (_this.checkBox.length == 1)
                _this.btnDisabled = false;
            else
                _this.btnDisabled = true;
            this.editData = item;
        },
          //获取所属机构
        getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgId = e.node.orgId;
        },
         //查看点击
        handleLookClick($index, item) {
              lookModifyCommom(ccfwglLookDialog, item);
                ccfwglLookDialog.show = true;
        },
        //添加按钮点击
        handleAddClick() {
            ccfwglAddDialog.show = true;
        },
        //修改点击
        handleModifyClick($index, item) {
            lookModifyCommom(ccfwglModifyDialog, item);
            ccfwglModifyDialog.show = true;
        },
        //删除按钮点击
        handleDeleteClick() {
            let length = this.checkBox.length;
            if (length == 0) {
                showMessage('info', '请至少选择一项!');
                return false;
            } else {
                deleteVm.deleteCount = length;
            }
            deleteVm.show = true;
        },
        //存储策略按钮点击
        handleMethodClick() {
            if (this.btnDisabled == true)
                return false;
                ccfwglMethodDialog.ordinaryVideo = this.editData.expireDaysNormal;
                ccfwglMethodDialog.markVideo = this.editData.expireDaysSpecial;
            ccfwglMethodDialog.show = true;
         
        },
        
      
    }
});


//查看弹框vm
let ccfwglLookDialog = avalon.define({
    $id: 'ccfwglLookDialog',
    title: "查看",
    show: false,
    json: {
        name: "",
        ip: "",
        port: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        pointPlayUrl: "",
        belong:"",
        id:"",
        type: 0
    },
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;

    }

});
//添加弹框vm
let ccfwglAddDialog = avalon.define({
    $id: 'ccfwglAddDialog',
    show: false,
    title: "添加",
    searchResult: "",
    $skipArray: ['searchResult'],
    json: {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        pointPlayUrl: "",
        id:"",
        type: 0
    },
    handleCancel(e) {
        this.show = false;
        clearInput(this);
      //  this.searchOrgTreeVm2.orgName = "";
    },
    handleOk() {
        let Exp = /^[0-9]*$/g;
        let json = this.json.$model;
        if (!checkDataPass(json)) {
            showMessage('warn', getTips(emptyKey) + "不能为空!");
            return false;
        } else if (!json.port.match(Exp)) {
            showMessage('warn', "端口必须为数字!");
            return false;
        } else if (!checkTime(this.json.worktimeBegin, this.json.worktimeEnd)) {
            showMessage('warn', "开始时段不能大于结束时段!");
            return false;
        } else {
            addAjax(this.json).then((ret) => {
                if (ret.code == 0) {
                    showMessage('info', '添加成功');
                    vm.ajaxTableList();
                } else {
                    showMessage('error', ret.msg);
                }
            });

        }
        this.show = false;
        clearInput(this);
        this.searchOrgTreeVm2.orgName = "";

    },

});

//修改弹框vm
let ccfwglModifyDialog = avalon.define({
    $id: 'ccfwglModifyDialog',
    title: "修改",
    json: {
        name: "",
        ip: "",
        port: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        pointPlayUrl: "",
        belong:"",
        id:"",
        type: 0
       
    },
    
    show: false,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let _this = this;
        let data = {
            account: _this.json.account,
            downloadUrl: _this.json.downloadUrl,
            id: _this.json.id,
            ip: _this.json.IP,
            name: _this.json.serviceName,
            orgId: _this.json.orgId,
            password: _this.json.passWord,
            pointPlayUrl: _this.json.bunchPath,
            port: _this.json.PORT,
            uploadUrl: _this.json.uploadUrl,
            worktimeBegin: _this.beginTime,
            worktimeEnd: _this.endTime
        };
        data.port = data.port + "";
        let Exp = /^[0-9]*$/g;
        if (!checkDataPass(data)) {
            showMessage('info', getTips(emptyKey) + "不能为空!");
            return false;
        } else if (!data.port.match(Exp)) {
            showMessage('warn', "端口必须为数字!");
            return false;
        } else if (!checkTime(data.worktimeBegin, data.worktimeEnd)) {
            showMessage('warn', "开始时段不能大于于结束时段!");
            return false;
        } else {
            modifyAjax(data).then((ret) => {
                if (ret.code == 0) {
                    showMessage('info', '修改成功');
                    vm.ajaxTableList();
                    vm.checkAll = false;
                } else {
                    showMessage('error', ret.msg);
                }

            });

        }


        this.show = false;

    },



});

//删除弹框
let deleteVm = avalon.define({
    $id: "delete",
    title: "删除",
    show: false,
    okText: "确定",
    deleteCount: 1,
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let serverId = getServerId();
        deleteAjax(serverId).then((ret) => {
            if (ret.code == 0) {
                showMessage('success', '删除成功');
                vm.ajaxTableList();
                vm.checkAll = false;
            } else {
                showMessage('error', ret.msg);
            }

        });
        this.show = false;
    },


});


//查看，修改弹框共用逻辑
function lookModifyCommom(vm, editData) {
    let data = editData;
    vm['json']['name'] = data.name;//服务名称
    vm['json']['account'] = data.account;//账号
    vm['json']['password'] = data.password;//密码
    vm['json']['downloadUrl'] = data.downloadUrl;//下载路径
    vm['json']['pointPlayUrl'] = data.pointPlay;//点播路径
    vm['json']['ip'] = data.ip;//服务类型
    vm['json']['uploadUrl'] = data.uploadUrl;//上传路径
    vm['json']['port'] = data.port;//存储服务地址
    vm['json']['belong'] = data.orgName;//归属机构
    vm['json']['id'] = data.rid;//存储服务Id
  
}
//存储策略弹框vm
let ccfwglMethodDialog = avalon.define({
    $id: 'ccfwglMethodDialog',
    show: false,
    title: '存储策略',
    ordinaryVideo: "",
    markVideo: "",

    // relatedVideo: "",
    // timeCallVideo: "",
    displayValue: '显示默认值',

    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        let json = {
            strategyId: vm.editData['strategyId'],
            expireDaysNormal: this.ordinaryVideo,
            expireDaysSpecial: this.markVideo

        };
        let Exp = /^[0-9]*$/g;
        if (!checkDataPass(this.json)) {
            showMessage('warn', getTips(emptyKey) + "不能为空!");
            return false;
        } else if (('' + json.expireDaysNormal).match(Exp) === null) {
            showMessage('warn', getTips('expireDaysNormal') + "必须为数字!");
            return false;
        } else if (('' + json.expireDaysSpecial).match(Exp) === null) {
            showMessage('warn', getTips('expireDaysSpecial') + "必须为数字!");
            return false;
        } else {
            methodComfirmAjax(json).then((ret) => {
                if (ret.code == 0)
                    showMessage('info', '修改存储策略成功');
                else
                    showMessage('warn', ret.msg);
                   vm.ajaxTableList();
                   vm.btnDisabled = true;
            });

        }



        this.show = false;
    }
});
//提示框提示
function showMessage(type, content) {
    message[type]({
        content: content
    });
}
//【添加弹框】 点击确定，或取消按钮清除input框
function clearInput(Vm) {
    Vm.json = {
        name: "",
        ip: "",
        orgId: "",
        port: "",
        worktimeBegin: "",
        worktimeEnd: "",
        account: "",
        password: "",
        uploadUrl: "",
        downloadUrl: "",
        pointPlayUrl: "",
    };
};
//检查增，改,存储策略表单数据是否为空
function checkDataPass(jsonData) {
    let flag = true;
    avalon.each(jsonData, (key, val) => {
        if (val == "" && key != "type") {
            flag = false;
            emptyKey = key;
            return false;
        }
    });
    return flag;
};
//获取存储服务Id
function getServerId() {
    let data = vm.checkBox.$model;
    let json = data.map(function (item) {
        return item['rid'];
    });
    json = json.join(',');
    return json;
}
//渲染采集站列表以便插入所属机构
function renderStationIntoOrg(item) {
    let html = '';
    html += '<ul class="line" >';
    html += '<li tabindex="0" hidefocus="true" treenode="">';
    html += '<span title="" class="button level2 switch bottom_docu" treenode_switch=""></span>';
    html += '<a  style="color:#333;font-weight:normal;" title="' + item.name + '">';
    html += '<span class="button ico_docu" style="background:url(/static/image/tyywglpt-ccfwgl/station.png?__sprite) 0 0 no-repeat;"></span>';
    html += '<span class="node_name  station"  stationId="' + item.rid + '">' + item.name + '</span></a>';
    html += '</li>';
    html += '</ul>';
    return html;
};

//提示信息
function getTips(key) {
    let checkDataObj = {
        account: "账号",
        downloadUrl: "下载路径",
        id: "存储服务Id",
        ip: "ip",
        name: "服务名称",
        orgId: "所属机构",
        password: "密码",
        pointPlayUrl: "点播路径",
        port: "PORT",
        uploadUrl: "上传路径",
        worktimeBegin: "开始时段",
        worktimeEnd: "结束时段",
        /*-------------*/
        expireDaysNormal: "普通视音频存储期限",
        expireDaysSpecial: "执法视频频存储期限"
    };
    return checkDataObj[key];
}
//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/img-gnqx/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].children = treeData[i].childs;

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}
//所属机构模糊搜索
function searchDeparment(treeId, departmentTreeVm) {
    let zTree = $.fn.zTree.getZTreeObj(treeId);
    let nodeList = zTree.getNodesByParamFuzzy("title", $.trim(departmentTreeVm.orgName), null);
    searchResult = nodeList;
    departmentTreeVm.expandedKeys.clear();
    for (var i = 0; i < nodeList.length; i++) {
        let curNode = nodeList[i];
        if (curNode.children.length == 0) {
            let parentNode = curNode.getParentNode();
            zTree.expandNode(parentNode, true, false, true);
        } else {
            zTree.expandNode(curNode, true, false, true);
        }
        curNode.highlight = true;
        zTree.updateNode(curNode);
    }
}
function checkTime(beginTime, endTime) {
    let bTime = $.trim(beginTime).split(":")[0];
    let eTime = $.trim(endTime).split(":")[0];
    if (bTime > eTime)
        return false;
    return true;
}
/* 接口 */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
           url: '/gmvcs/uap/org/all',
       // url: '/api/tyywglpt-cczscfwgl',
        method: 'get',
        cache: false
    });
}
/* 获取列表记录 */
function getTableData(orgId=null, page = 0, pageSize = 20) {
    return ajax({
        url: '/gmvcs/uom/storage/workstation/get',
        type: 'post',
        data: {
            orgId: orgId || null,
            type: 0,
            page: page,
            pageSize: pageSize
        }
    });
}