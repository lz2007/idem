/*
*   办案场所配置 ---功能室
* */
import avalon from 'avalon2';
import Sbzygl from '../common/common-sbzygl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./tyywglpt-bacspz-gns.css');
export const name = 'tyywglpt-bacspz-baq';

let vm = null;
let sbzygl = null;
let bacspz_gns =  avalon.component(name, {
    template: __inline('./tyywglpt-bacspz-gns.html'),
    defaults: {
        list: [],
        total: 0,
        current: 1,
        pageSize: 20,
        checkAll: false,
        selectedRowsLength: 0,
        checkedData: [],
        tablebodyHeight: 0,
        onInit(event) {
            vm = event.vmodel;
            sbzygl = new Sbzygl(vm);
        },
        onReady(){
            this.fetchList();
            this.tablebodyHeight = $(".bacspz-baqlb").height() - 33;
        },
        pageChange() {
            this.fetchList()
        },
        getCurrent(current) {
            this.current = current;
        },
        fetchList(){
            //获取初始化的办案区
            let url = "../../mock/table_list.json";

            sbzygl.ajax(url,'get',{}).then(result => {
                avalon.each(result.data.currentElements, function (index, el) {
                    el.checked = false;
                });
                this.list = result.data.currentElements;
                this.total = result.data.totalElements;
            })
        },
        //新增功能室
        addgns(){
            let symbol = 'add';
            gnsmodal.showbaqmodal(symbol);
        },
        //修改
        handleModify(item){
            let symbol = 'modify';
            gnsmodal.showbaqmodal(symbol);
            gnsmodal.name = item.name;
            gnsmodal.org = item.orgName;
            gnsmodal.number = item.number;
            gnsmodal.type = item.type;
            gnsmodal.canmera = iten.canmera;
        },
        //删除
        handleDelete(item){
            deletModal.showDeleteModal();
            deletModal.deleteArr.push(item.number);
        },
        //全选列表
        handleCheckAll(e) {
            sbzygl.handleCheckAll(e, (list) => {
                this.checkedData = list;
            })
        },
        //勾选列表
        handleCheck(index, record, e) {
            sbzygl.handleCheck(index, record, e, (hasChecked, record) => {
                this.checkedData = hasChecked;
            })
        },
        //批量删除
        handleBatchDelete() {
            if (this.selectedRowsLength < 1) return;
            avalon.each(this.checkedData, (index, el) => {
                deletModal.deleteArr.push(el.number);
            })
            deletModal.showDeleteModal();
        }
    }
});

//新增功能室
let gnsmodal = avalon.define({
    $id : "gnsmodal",
    titlename :"新增功能室",
    showbaqmodal(symbol){
        this.show = true;
        this.symbol = symbol;
        if(this.symbol === "modify"){
            this.titlename = "修改功能室";
        }else{
            this.titlename = "新增功能室";
        }
    },
    handleCancel(){
        this.show =false;
        this.name= '';
        this.org = '';
        this.number = '';
        this.symbol = 'add';
        this.type = '';
        this.canmera = '';
    },
    handleOk(){
        let obj ={};
        obj.name = this.name;
        obj.org = this.org;
        obj.number = this.number;
        obj.type = this.type;
        obj.canmera = this.canmera;
        let url;
        if(this.symbol === 'modify'){
            url = '...';
        }else{
            url = '...';
        }
        sbzygl.ajax(url,'post',obj).then(result => {
            if(result.code == 0){
                this.show =false;
                this.name= '';
                this.org = '';
                this.number = '';
                this.symbol = 'add';
                this.type = '';
                this.canmera = '';
                sbzygl.showTips('success','新增办案区成功');
                bacspz_gns.defaults.fetchList();
            }else{
                sbzygl.showTips('error',result.msg);
            }
        });
    },
    symbol: 'add',
    show : false,
    name :'',
    org : '国迈',
    number :'',
    type : '',
    canmera :''
});

//删除弹窗
let deletModal = avalon.define({
    $id : 'deletemodal',
    show : false,
    deleteArr :[],
    showDeleteModal(){
        this.show = true;
    },
    handleCancel(){
        this.show = false;
        this.deleteArr = [];
    },
    handleOk(){
        let url = '...';
        sbzygl.ajax(url,'post',this.deleteArr).then(result => {
            if(result.code == 0){
                this.show =false;
                this.deleteArr = [];
                sbzygl.showTips('success','新增办案区成功');
                bacspz_gns.defaults.fetchList();
            }else{
                sbzygl.showTips('error',result.msg);
            }
        });
    }
})

