/*
*   办案场所配置 ---办案区
* */
import avalon from 'avalon2';
import Sbzygl from '../common/common-sbzygl';
require('../common/common-tyywglpt.css');
require('../common/common-sbzygl.css');
require('./tyywglpt-bacspz-baq.css');
export const name = 'tyywglpt-bacspz-baq';

let vm = null;
let sbzygl = null;
let bacspz_baq =  avalon.component(name, {
    template: __inline('./tyywglpt-bacspz-baq.html'),
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
        //新增办案区
        addbaq(){
            let symbol = 'add';
            baqmodal.showbaqmodal(symbol);
        },
        //修改
        handleModify(item){
            let symbol = 'modify';
            baqmodal.showbaqmodal(symbol);
            baqmodal.name = item.name;
            baqmodal.org = item.orgName;
            baqmodal.number = item.number;
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

//新增办案区
let baqmodal = avalon.define({
    $id : "baqmodal",
    titlename : '新增办案区',
    showbaqmodal(symbol){
        this.show = true;
        this.symbol = symbol;
        if(this.symbol === "modify"){
            this.titlename = "修改办案区";
        }else{
            this.titlename = "新增办案区";
        }
    },
    handleCancel(){
        this.show =false;
        this.name= '';
        this.org = '';
        this.number = '';
        this.symbol = 'add';
    },
    handleOk(){
        let obj ={};
        obj.name = this.name;
        obj.org = this.org;
        obj.number = this.number;
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
                sbzygl.showTips('success','新增办案区成功');
                bacspz_baq.defaults.fetchList();
            }else{
                sbzygl.showTips('error',result.msg);
            }
        });
    },
    symbol: 'add',
    show : false,
    name :'',
    org : '国迈',
    number :''
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
                bacspz_baq.defaults.fetchList();
            }else{
                sbzygl.showTips('error',result.msg);
            }
        });
    }
})

