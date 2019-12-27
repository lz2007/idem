import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import $ from 'jquery';
import "ane";
import {
    createForm,
    notification
} from 'ane';
import * as menuServer from '../../services/menuService';
import {
    apiUrl,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
export const name = 'xtywgl-ccms';
require('./xtywgl-gjpz-index-ccms.less');
let vm = avalon.component(name, {
    template: __inline('./xtywgl-gjpz-index-ccms.html'),
    defaults: {
        ccms_txt: language_txt.xtywgl.gjpz,
        // curValue: "Hybrid",
        // radioOptions: [
        //         { label: language_txt.xtywgl.gjpz.hybrid, value: 'Hybrid' },
        //         { label: language_txt.xtywgl.gjpz.centralized, value: 'Centralized' },
        //         { label: language_txt.xtywgl.gjpz.distributed, value: 'Distributed' }
        //     ],
        // handleChange(event) {
        //     console.log(event);
        // },
        isHybridLight: false,  //是否混合式的显示高亮图片和文字
        isCentralizedLight: false,  //是否集中式的显示高亮图片和文字
        isDistributedLight: false,  //是否分布式的显示高亮图片和文字
        selectMode: null, //后台返回的存储模式,用来设置是否显示右上角的勾选图片和蓝色边框
        showEdit: true,   //是否展示编辑按钮，true为展示编辑按钮，false为展示保存和取消按钮
        currentSelectMode: null,  //当前用户选择的存储模式
        select_mode(modeName) {  //点击各个存储模式框触发的函数
            if(this.showEdit) {  //如果按钮展示的是编辑按钮，则不是编辑状态，不执行后面的代码
                return;
            }
            switch(modeName) {
                case "hybrid":
                    this.isHybridLight = true;
                    this.isCentralizedLight = false;
                    this.isDistributedLight = false;
                    this.currentSelectMode = 2;
                    break;
                case "centralized":
                    this.isCentralizedLight = true;
                    this.isHybridLight = false;
                    this.isDistributedLight = false;
                    this.currentSelectMode = 0;
                    break;
                case "distributed":
                    this.isDistributedLight = true;
                    this.isHybridLight = false;
                    this.isCentralizedLight = false;
                    this.currentSelectMode = 1;
                    break;
            }
        },
        handleEdit() {
            this.showEdit = false;
            // let radioLen = $('.ywzx-ccms .ane-radio input[type=radio]').length;
            // for(let i = 0; i < radioLen; i++) {
            //     $($('.ywzx-ccms .ane-radio input[type=radio]')[i]).attr("disabled", false);
            //     $($('.ywzx-ccms .ane-radio input[type=radio] + .text')[i]).css("opacity", "1");
            // }
        },
        handleSave() {
            // this.showEdit = true;
            // let radioLen = $('.ywzx-ccms .ane-radio input[type=radio]').length;
            // for(let i = 0; i < radioLen; i++) {
            //     $($('.ywzx-ccms .ane-radio input[type=radio]')[i]).attr("disabled", "disabled");
            //     $($('.ywzx-ccms .ane-radio input[type=radio] + .text')[i]).css("opacity", "0.5");
            // }

            // console.log(this.currentSelectMode);
            var _this = this;
            //请求编辑存储模式接口
            ajax({
                url: '/gmvcs/uom/task/fileUpload/UploadTaskStrategy/edit',
                method: 'post',
                data: {
                    "uploadTaskStrategy": _this.currentSelectMode,
                }
            }).then(result => {
                if(result.code == 0) {
                    _this.showEdit = true;
                    _this.isDistributedLight = false;
                    _this.isHybridLight = false;
                    _this.isCentralizedLight = false;
                    _this.saySuccess(_this.ccms_txt.editSuccess);
                    //请求查询存储模式接口
                    ajax({
                        url: '/gmvcs/uom/task/fileUpload/UploadTaskStrategy/list',
                        method: 'get',
                        data: {}
                    }).then(res => {
                        if(res.code == 0) {
                            _this.selectMode = res.data;
                            _this.currentSelectMode = res.data;  //避免点击编辑按钮之后，没有选择任何存储模式选择框，直接点击保存，出现currentSelectMode为上一次选则的值的问题。
                        }else {
                            _this.sayError(_this.ccms_txt.queryModeFail);
                        }
                    });
                }else {
                    _this.sayError(_this.ccms_txt.editFail);
                }
            });
        },
        handleCancel() {
            // let radioLen = $('.ywzx-ccms .ane-radio input[type=radio]').length;
            // for(let i = 0; i < radioLen; i++) {
            //     $($('.ywzx-ccms .ane-radio input[type=radio]')[i]).attr("disabled", "disabled");
            //     $($('.ywzx-ccms .ane-radio input[type=radio] + .text')[i]).css("opacity", "0.5");
            // }
            this.currentSelectMode = this.selectMode;  //避免点击编辑按钮之后，没有选择任何存储模式选择框，直接点击保存，出现currentSelectMode为上一次选则的值的问题
            this.showEdit = true;
            this.isDistributedLight = false;
            this.isHybridLight = false;
            this.isCentralizedLight = false;
        },
        authority: { //功能权限控制
            "EDIT": false, //编辑
        },
        sayError: function (word) {
            notification.error({
                message: word,
                title: language_txt.xtywgl.zfyyfrz.tips
            });
        },
        saySuccess: function (word) {
            notification.success({
                message: word,
                title: language_txt.xtywgl.zfyyfrz.tips
            });
        },
        onInit(event) {
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^ADVANCED_FUNCTION_CCMSBJ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                let _this = this;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "ADVANCED_FUNCTION_CCMSBJ": //编辑
                            _this.authority.EDIT = true;
                            break;
                    }
                });
            });

            var _this = this;
            //请求查询存储模式接口
            ajax({
                url: '/gmvcs/uom/task/fileUpload/UploadTaskStrategy/list',
                method: 'get',
                data: {}
            }).then(result => {
                if(result.code == 0) {
                    _this.selectMode = result.data;
                    _this.currentSelectMode = result.data;  //避免初始化之后，点击了编辑按钮之后，没有点击任何存储模式框，直接点击保存，出现currentSelectMode为null的情况
                }else {
                    _this.sayError(_this.ccms_txt.queryModeFail);
                }
            });
        },
        onReady() {
            // console.log($('.ywzx-ccms .ane-radio input[type=radio]'), $('.ywzx-ccms .ane-radio input[type=radio] + .text'));
            // let radioLen = $('.ywzx-ccms .ane-radio input[type=radio]').length;
            // for(let i = 0; i < radioLen; i++) {
            //     $($('.ywzx-ccms .ane-radio input[type=radio]')[i]).attr("disabled", "disabled");
            //     $($('.ywzx-ccms .ane-radio input[type=radio] + .text')[i]).css("opacity", "0.5");
            // }
            
        },
    }

});
