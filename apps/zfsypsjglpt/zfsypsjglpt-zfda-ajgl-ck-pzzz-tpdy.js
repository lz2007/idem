/**盘证制作-图片打印 tpdy */
import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;

export const name = "zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy";
require("/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy.css");
import {
    picFuc
} from "/vendor/pic_player/picasa.js";

let tpdy = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy.html"),
    defaults: {
        prePage:'',
        nextPage:'',
        dyImgShow01:false,
        dyImgShow02:false,
        list:[],
        totalPage:0,
        dyImgShow:false,
        jyaq:'',
        screenshotClick(){//点击截图显示弹窗
            let _this = this;
            _this.tpdy_jtslt.jtsltShow = true;
            tpdy.defaults.tpdy_jtsltVm.tpdyJtsltCheckAll = false;//初始化全选标志
            // console.log(tpdy.defaults.tpdy_jtsltVm.checkedData);
            // tpdy.defaults.tpdy_jtsltVm.checkedData = [];//初始化选中数据
            _this.tpdy_jtsltVm.tcResult = handleChecked(tpdy.defaults.list,tpdy.defaults.tpdy_jtsltVm.checkedData,6,true);
            // _this.tpdy_jtsltVm.tcResult = arrayCut(result.currentElements,6,true);
            // console.log(_this.tpdy_jtsltVm.tcResult);
            $('.jtslt-d-img').mousedown(function(e){
                let id = $(this).attr('id')+Number(new Date());
                $(this).attr('id',id);
                let pic_obj = new picFuc();
                pic_obj.picasa_init(id);
            });
        },
        getScreenshotData(){//获取选择截图弹窗的截图数据
            // console.log("查询数据");
            let _this = this;
            let pzzz_data = storage.getItem('pzzz-data');
            pzzz_data = JSON.parse(pzzz_data);
            // console.log(pzzz_data.jyaq);
            //ajbh案件编号;jyaq：简要案情
            if(pzzz_data.jyaq)_this.jyaq = pzzz_data.jyaq;
            // let data = 'type=1'+'&ajbh='+'A11111111'+'&page=0'+'&pageSize=2';
            let data = 'type=1'+'&ajbh='+pzzz_data.ajbh+'&page=-1'+'&pageSize=2';
            ajax({
                url: "/gmvcs/pzzz/file/list?"+data,
                method: 'get',
            }).then(result => {
                // console.log(result);
                let ret = result.data;
                tpdy.defaults.list = [].concat(ret.currentElements);
                // _this.tpdy_jtsltVm.tcResult = arrayCut(ret.currentElements,6,true);
                $('.jtslt-d-img').mousedown(function(e){
                    let id = $(this).attr('id')+Number(new Date());
                    $(this).attr('id',id);
                    let pic_obj = new picFuc();
                    pic_obj.picasa_init(id);
                });
            });
            
            // tpdy.defaults.list = [].concat(result.currentElements);
            // _this.tpdy_jtsltVm.tcResult = arrayCut(result.currentElements,6,true);
            // $('.jtslt-d-img').mousedown(function(e){
            //     let id = $(this).attr('id')+Number(new Date());
            //     $(this).attr('id',id);
            //     let pic_obj = new picFuc();
            //     pic_obj.picasa_init(id);
            // });
        },
        CheckedDataChange(val){//数据转化到渲染页面
            // console.log(val);
            if(val && val.length > 0){
                this.tpdy_c.currentPage = 0;
                this.tpdy_c.tpCheckedData = arrayCut(val,2);
                tpdy.defaults.totalPage = this.tpdy_c.tpCheckedData.length;
                if(tpdy.defaults.totalPage == 1){
                    $('.tpdy-footer').find('.pageDisable').removeClass('pageDisable');
                    $('.tpdy-footer .pre').addClass('pageDisable');
                    $('.tpdy-footer .next').addClass('pageDisable');
                    return;
                }
                $('.tpdy-footer').find('.pageDisable').removeClass('pageDisable');
                $('.tpdy-footer .pre').addClass('pageDisable');
            }else{
                this.tpdy_c.tpCheckedData = [];
                tpdy.defaults.totalPage = 0;
                this.tpdy_c.currentPage = 0;
                $('.tpdy-footer').find('.pageDisable').removeClass('pageDisable');
                $('.tpdy-footer .pre').addClass('pageDisable');
                $('.tpdy-footer .next').addClass('pageDisable');
            }
        },
        handlePre(){//上一页
            if(this.tpdy_c.currentPage == 0){
                return;
            }
            this.tpdy_c.currentPage = this.tpdy_c.currentPage - 1;
            if(this.tpdy_c.currentPage == 0){
                $('.tpdy-footer').find('.pageDisable').removeClass('pageDisable');
                $('.tpdy-footer .pre').addClass('pageDisable');
            } 
        },
        handleNext(){//下一页
            if((this.tpdy_c.currentPage+1) == tpdy.defaults.totalPage){
                return;
            }
            this.tpdy_c.currentPage = this.tpdy_c.currentPage + 1;
            if((this.tpdy_c.currentPage+1) == tpdy.defaults.totalPage){
                $('.tpdy-footer').find('.pageDisable').removeClass('pageDisable');
                $('.tpdy-footer .next').addClass('pageDisable');
            } 
        },
        /**打印当前页 */
        printCurrent(){
            let _this = this;
            if(_this.tpdy_c.tpCheckedData.length ){
                _this.dyImgShow = true;
            }else{
                _this.dyImgShow01 = true;
                _this.dyImgShow02 = true;
            }
            
            $("#tpdyContent").jqprint({
                debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
                importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
                printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
                operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
            });

            if(_this.tpdy_c.tpCheckedData.length ){
                _this.dyImgShow = false;
            }else{
                _this.dyImgShow01 = false;
                _this.dyImgShow02 = false;
            }
        },
        tpdy_c: avalon.define({
            $id: "tpdy_c",
            tpCheckedData:[],//选中截图要渲染打印页面的数据
            currentPage:0,//当前页码
        }),
        tpdy_jtslt: avalon.define({
            $id: 'tpdy_jtslt',
            jtsltShow:false,//控制弹窗显隐
            handleCancel(){
                tpdy.defaults.tpdy_jtsltVm.checkeding = [];//清空初始化
                this.jtsltShow = false;
            },
        }),
        tpdy_jtsltVm: avalon.define({
            $id: 'tpdy-jtsltVm',
            title: '选择截图',
            tcResult:[],//选择弹窗渲染数据
            checkedData:[],//选中数据
            checkeding:[],//正在选中的数据
            tpdyJtsltCheckAll:false,//全选标识
            // jyaq:'',//简要案情
            tpdyJtsltSave(){//确认所选
                if(tpdy.defaults.tpdy_jtsltVm.checkeding.length){
                    tpdy.defaults.tpdy_jtsltVm.checkedData = [].concat(tpdy.defaults.tpdy_jtsltVm.checkeding);
                    tpdy.defaults.CheckedDataChange(tpdy.defaults.tpdy_jtsltVm.checkedData);
                }
                tpdy.defaults.tpdy_jtslt.jtsltShow = false;
            },
            tpdyJtsltCancel(){//取消
                tpdy.defaults.tpdy_jtsltVm.checkeding = [];//清空初始化
                tpdy.defaults.tpdy_jtslt.jtsltShow = false;
            },
            tpdyJtsltCheckFnc(event){//全选
                if(event.target.checked){
                    let checked = [];
                    tpdy.defaults.tpdy_jtsltVm.tcResult.forEach(el => {
                        el.forEach(val =>{
                            val.checked = true;
                        });
                    });
                    tpdy.defaults.tpdy_jtsltVm.checkeding = arrFlatten(tpdy.defaults.tpdy_jtsltVm.tcResult);
                }else{
                    tpdy.defaults.tpdy_jtsltVm.tcResult.forEach(el => {
                        el.forEach(val =>{
                            val.checked = false;
                        });
                    });
                    tpdy.defaults.tpdy_jtsltVm.checkeding = [];
                }
            },
            jtsltDCheckFnc(index,n, record, event){//单选
                let hasChecked = [];
                tpdy.defaults.tpdy_jtsltVm.tcResult.forEach(el => {
                    let array = el.filter((item) => {
                        return item.checked === true;
                    });
                    hasChecked = hasChecked.concat(array);
                });
                tpdy.defaults.tpdy_jtsltVm.checkeding = [].concat(hasChecked);
                if (tpdy.defaults.list.length === hasChecked.length) {
                    tpdy.defaults.tpdy_jtsltVm.tpdyJtsltCheckAll = true;
                } else {
                    tpdy.defaults.tpdy_jtsltVm.tpdyJtsltCheckAll = false;
                }
                
            }
        }),
        onInit(){
            let _this = this;
            _this.getScreenshotData();
        },
        onReady(){
            let _this = this;
            this.windowResize();
            $(window).resize(function () {
                _this.windowResize();
            });
        },
        onDispose(){

        },
        windowResize() {//window界面自适应
            let v_height = $(window).height() - 96;
            let menu_height = $("body")[0].scrollHeight;
            if (v_height > 740) {
                $("#sidebar .zfsypsjglpt-menu").css("min-height", menu_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", menu_height - 68 + "px");
                }
            } else {
                $("#sidebar .zfsypsjglpt-menu").css("min-height", menu_height - 68 + "px");
                if (8 == avalon.msie) {
                    $("#sidebar").css("min-height", "860px");
                }
            }
        },
    }
});
/**
 * 数组切割函数
 * @param {Arrray}   arr    要切割的数组 
 * @param {int}      pre    切割成每pre个一组
 * @param {boolean}  type   需要路径转码
 */
function arrayCut(arr,pre,type){
    if(Object.prototype.toString.call(arr) != '[object Array]'){
        throw new Error('arrayCut函数第一个参数不是数组');
    }
    if(arr && arr.length == 0) return [];
    let newArray = [],
        b;
    arr.forEach((item,index) => {
        if(type){
            item.encodeURI = encodeURI(item.httpUrl);//转码，16进制
            item.checked = false;//添加勾选属性
        } 
        let a = Math.floor(index/pre);
        if(b !== a){
            b = a;
            newArray[a] = new Array();
        }
        newArray[a].push(item);
    });
    return newArray;
}
/**
 * 数组扁平化：由切割状态返回扁平状态
 */
function arrFlatten(arr){
    return arr.reduce(function(prev,item){
        return prev.concat(Array.isArray(item)?arrFlatten(item):item);
    },[]);
}
/**
 * 比较俩个数组选中情况初始化
 */
function handleChecked(arr1,arr2,pre,type){
    if(Object.prototype.toString.call(arr1) != '[object Array]'){
        throw new Error('handleChecked函数第一个参数不是数组');
    }
    if(Object.prototype.toString.call(arr2) != '[object Array]'){
        throw new Error('handleChecked函数第二个参数不是数组');
    }
    let newArray = [],
        b;
    if(arr2 && arr2.length == 0){//没有选中
        newArray = arrayCut(arr1,pre,type);
        return newArray;
    }
    if(arr2 && arr1 && (arr1.length == arr2.length)){//全部选中
        tpdy.defaults.tpdy_jtsltVm.tpdyJtsltCheckAll = true;
        arr2.forEach((item,index) => {
            let a = Math.floor(index/pre);
            if(b !== a){
                b = a;
                newArray[a] = new Array();
            }
            newArray[a].push(item);
        });
        // console.log('newArray:');
        // console.log(newArray);
        return newArray;
    }
    /**部分选中 */
    arr1.forEach((item,index) => {
        if(type){
            item.encodeURI = encodeURI(item.httpUrl);//转码，16进制
            arr2.forEach((el,n) =>{
                if(item.rid === el.rid){
                    item.checked = true;
                    return;
                }
            });
            if(!item.checked) item.checked = false;//添加勾选属性
        } 
        let a = Math.floor(index/pre);
        if(b !== a){
            b = a;
            newArray[a] = new Array();
        }
        newArray[a].push(item);
    });
    return newArray;
}
/**模拟数据 */
// let result = {
//     "totalPages": 1,
//     "totalElements": 1,
//     "currentPages": 0,
//     "perPages": 20,
//     "currentElements": [
//         {
//             "rid": "01",
//             "fileName": "01",
//             "startTime": 46564656456,
//             "httpUrl": "http://10.10.17.144:8030/image/u=1869421686904620394&fm=214&gp=0.jpg",
//             "base64":'',
//             "type": 1
//         },{
//             "rid": "02",
//             "fileName": "022",
//             "startTime": 46564656456,
//             "httpUrl": "http://10.10.17.144:8030/image/89a5f1e2b3da6bfaba218b092f245e07.jpg",
//             "base64":'',
//             "type": 1
//         },{
//             "rid": "03",
//             "fileName": "033",
//             "startTime": 46564656456,
//             "httpUrl": "http://10.10.17.144:8030/image/u=1869421686904620394&fm=214&gp=0.jpg",
//             "base64":'',
//             "type": 1
//         },{
//             "rid": "04",
//             "fileName": "044",
//             "startTime": 46564656456,
//             "httpUrl": "http://10.10.17.144:8030/image/89a5f1e2b3da6bfaba218b092f245e07.jpg",
//             "base64":'',
//             "type": 1
//         }
//     ]
// };
