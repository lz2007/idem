import avalon from 'avalon2';
import ajax from '../../services/ajaxService.js';
import { createForm, notification } from "ane";
import * as menuServer from '../../services/menuService';



require('../common/common-sszhxt.css');
// require('./sszhxt-xxcj-sfzcj.css');
export const name = 'sszhxt-xxcj-sfzcj';
const jqdj = avalon.component(name, {
    template: __inline('./sszhxt-xxcj-sfzcj.html'),
    defaults: {
        $form:createForm(),
        orgId:"",
        noData:false,
        sfzcjDetail:"",
        isDetailExist:false,
        currentPage:"",
        pageSize:"",
        orgData:[],
        tableData:[],
        editData:{},
        total:0,
        pageSize:20,
        authority: { // 按钮权限标识
            "CK": true,  //存储服务管理_采集站上传服务管理_查看
            "SEARCH": true,  //存储服务管理_采集站上传服务管理_查询
            "OPT_SHOW": false //操作栏-显隐
        },
       //获取所属机构
       getSelected(key, title) {
            this.orgId = key;
        },
        handleTreeChange(e, selectedKeys) {
            this.orgId = e.node.orgId;
        },
        onInit() {
            var _this = this;
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    handleRemoteTreeData(ret.data,_this.orgData);
                } else {
                    showMessage('error', '获取执法部门失败！');
                }
            });

               // 按钮权限控制
            //    menuServer.menu.then(menu => {
            //     let list = menu.UOM_MENU_TYYWGLPT;
            //     let func_list = [];
            //     avalon.each(list, function (index, el) {
            //         if (/^UOM_FUNCTION_CJZSCFWGL/.test(el))
            //             avalon.Array.ensure(func_list, el);
            //     });
                
            //     if (func_list.length == 0)
            //         return;
            //     avalon.each(func_list, function (k, v) {
            //         switch (v) {

            //             case "UOM_FUNCTION_CJZSCFWGL_CK":
            //                 _this.authority.CK = true;
            //                 break;
                      
            //             case "UOM_FUNCTION_CJZSCFWGL_SEARCH":
            //                 _this.authority.SEARCH = true;
            //                 break;
            //         }
            //     });
            //     if( false == _this.authority.MODIFY && false == _this.authority.CK )
            //         _this.authority.OPT_SHOW = true;
            // });
            let $toobar = $('.sszhxt-tool-bar');
            $('.sszhxt-list-panel').css({'top': $toobar.outerHeight() + 52});
        },
        onReady() {
           
        },
        handleQuery(){
        //  alert(JSON.stringify(this.$form.record));
        this.ajaxTableList(this.orgId);
        this.currentPage = 1;
        },
        clearEdit() {
            this.editData = {};
        },
        ajaxTableList(orgId, page, pageSize) {
            let _this = this;
            getTableData(orgId, page, pageSize).then((ret) => {
                let datas = ret['data']['storageInfos'];
                let total = ret['data']['count'];
                _this.total = total;
                if (datas.length ==0) {
                    _this.noData = true;
                }else{
                    _this.noData  = false;
                }
               
                avalon.each(datas, (i, el) => {
                    datas[i].active = false;
                    datas[i].checked = false;
                });
                _this.tableData = datas;
                _this.clearEdit();
            //    _this.checkBox = [];
           //    _this.checkAll = false;
           //    _this.btnDisabled = true;
              
                if($('.sfzcj-list-content').get(0).offsetHeight < $('.sfzcj-list-content').get(0).scrollHeight - 1){
                    $('.sfzcj-list-header').css({'padding-right':'17px'});
                }else{
                    $('.sfzcj-list-header').css({'padding-right':0});
                }
            });
        },
         //获取当前页码
        getCurrent(current) {
            this.currentPage = current;
        },
        handlePageChange(curpage, pageSize) {
            this.ajaxTableList(this.orgId, --curpage, pageSize);
        },
        handleLookClick(){
            let _this = this;
            require.async('/apps/sszhxt/sszhxt-sfzcjck', function(m){
                 _this.sfzcjDetail = getDetailPages(m.name);
                 _this.isDetailExist = true;
            });
        }
    
     


    }

});



//提示框提示
function showMessage(type, content) {
    notification[type]({
        title:"通知",
        message: content,
        timeout:200
    });
}
function getDetailPages(component){
    const html = `<xmp is="${component}" :widget="{id:'${component.replace(/\-/g,'_')}',expire:${Date.now()}}"></xmp>`;
    return html;
}
function handleRemoteTreeData(remoteData, handledData) {
    if (!remoteData) {
        return;
    }
    avalon.each(remoteData, (index, el) => {
        let item = {
            key: el.orgId,
            title: el.orgName,
            code: el.orgCode,
            children: [],
            icon: "/static/image/tyywglpt/org.png"
        };
        handledData.push(item);
        handleRemoteTreeData(el.childs, handledData[index].children);
    });
};


/* 接口 */

/* 获取部门组织 */
function getOrgAll() {
    return ajax({
        url:'/gmvcs/uap/org/all',
      // url: '/api/tyywglpt-cczscfwgl',
        type: 'get',
        cashe: false
    });
}
/* 获取列表记录 */
function getTableData(orgId, page = 0, pageSize = 20) {
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

