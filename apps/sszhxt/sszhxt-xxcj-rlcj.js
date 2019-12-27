import ajax from '../../services/ajaxService.js';
import { createForm, notification } from "ane";
import {
    Gxxplayer
} from '../../vendor/gosunocx/gosunocx';

 require('./sszhxt-xxcj-rlcj.css');

export const name = 'sszhxt-xxcj-rlcj';
const jqdj = avalon.component(name, {
    template: __inline('./sszhxt-xxcj-rlcj.html'),
    defaults: {
        $form:createForm(),
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
         
        },
        onReady() {
            cpcjPlayObj.init();
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
                // let datas = ret['data']['storageInfos'];
                // let total = ret['data']['count'];
                 let datas = ret['data'];
                 let total = datas.length;
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
                // if($('.sfzcj-list-content').get(0).offsetHeight < $('.sfzcj-list-content').get(0).scrollHeight - 1){
                //     $('.sfzcj-list-header').css({'padding-right':'17px'});
                // }else{
                //     $('.sfzcj-list-header').css({'padding-right':0});
                // }
            });
        },
         //获取当前页码
        getCurrent(current) {
            this.currentPage = current;
        },
        handlePageChange(curpage, pageSize) {
            this.ajaxTableList(this.orgId, --curpage, pageSize);
        },
        handlePicClick(){
            rlcjLookVideo.show = true;
          
            
        }
     


    }

});

let rlcjLookVideo = avalon.define({
    $id: 'rlcjLookVideo',
    show: false,
    cancelText:'关闭',
    title: '查看文件',
    modalWidth:585,
    handleCancel(e) {
        this.show = false;
    }
  
});
// 点击图片播放视频
let cpcjPlayObj = {
    init(){
        let ocxObject = document.getElementById('cpcjPlayOcx');
        let gxxPlayer = new Gxxplayer();
        if(!ocxObject.object){
            showMessage('warn','请先下载ocx播放器');
            return ;
        }
        gxxPlayer.init({
            'element': 'cpcjPlayOcx',
            'viewType': 1,
            'proxy': _onOcxEventProxy
        });

    },
    loadSS(){
       
    },
    playVedio(){

    }

};
function _onOcxEventProxy(){
    
 };
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title:"通知",
        message: content,
        timeout:200
    });
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
        // url: '/gmvcs/uom/storage/workstation/get',
        // type: 'post',
        // data: {
        //     orgId: orgId || null,
        //     type: 0,
        //     page: page,
        //     pageSize: pageSize
        // }
          url: '/api/sszhxt-rlcj',
          type: 'get',
          cashe: false
    });
}


