import ajax from '../../services/ajaxService.js';
import { createForm, message } from "ane";
import { changeTreeData } from "../../apps/common/common-tyywglpt-ccfwgl/common-tyywglpt-ccfwgl";
require('./tyywglpt-ccfwgl-baqlxfwgl.css');
let ec = require('echarts/dist/echarts.min');
export const name = 'tyywglpt-ccfwgl-baqlxfwgl';

 avalon.component(name, {
    template: __inline('./tyywglpt-ccfwgl-baqlxfwgl.html'),
    defaults:{
        orgData:[],
        orgId:"",
        total:0,//总记录数
        noData:false,
        currentPage:1,//用于查询时重新更新分页组件的current
        $form:createForm(),
        getSelectedValue(){
            
        },
        onInit(event) {
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    this.orgData = changeTreeData(ret.data,'./static/image/tyywglpt-ccfwgl/org.png');
                } else {
                    showMessage('error', '获取所属机构失败！');
                }
            
            });

        },
        ajaxTableList(orgId, page, pageSize) {
            let _this = this;
            getTableData(orgId, page, pageSize).then((ret) => {
                if (ret.data == null) {
                    _this.noData = true;
                    return false;
                }
                _this.total = total;
            
            });
        },
      
        handlePageChange(curPage,pageSize){
             this.ajaxTableList(this.orgId,curPage--,pageSize);
        }
        
      
    }
});


/* 接口 */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        //   url: '/gmvcs/uap/org/all',
        url: '/api/tyywglpt-cczscfwgl',
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