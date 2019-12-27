import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import $ from 'jquery';
import "ane";
import moment from 'moment';
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
export const name = 'ms-xtywgl-zfymm-psw';
require('./xtywgl-gjpz-index-zfymm.less');
let vm = avalon.component(name, {
    template: __inline('./xtywgl-gjpz-index-zfymm-psw.html'),
    defaults: {
        zfymm_txt: language_txt.xtywgl.gjpz,
        extra_class: languageSelect == 'en' ? true : false,
        data: avalon.noop,
        idIndex: avalon.noop,
        iptPsw: 'inline-block',
        iptTxt: 'none',
        modelName: '',
        psw_value: '',
        old_psw_value: '',
        showPsw: false,
        handleChange_psw(e) {
            this.psw_value = e.target.value;
            let regex = new RegExp('^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?![\\s_!@#$%^&*`~\\\\(\){}+=\'\",.<>\/?\|;:\[\\]\-]+$)[0-9a-zA-Z\\s_!@#$%^&*`~\\\\(\){}+=\'\",.<>\/?\|;:\[\\]\-]{6,12}$');  //验证密码正则
            if(!regex.test(this.psw_value)) { //验证密码，密码不正确
                this.pswError = true;
            }else {
                this.pswError = false;
            }
        },
        showPswOrTxt() {
            this.showPsw = !this.showPsw;
            this.iptPsw = this.iptPsw == 'inline-block' ? 'none' : 'inline-block';
            this.iptTxt = this.iptTxt == 'inline-block' ? 'none' : 'inline-block';
        },
        showEdit: true,
        handleEdit() {
            this.showEdit = false;
            let idName = this.modelName.replace(/,/g,"");
            let pswIptLen = $(`.${idName}.pswContent .pswIpt input`).length;
            for(let i = 0; i < pswIptLen; i++) {
                $($(`.${idName}.pswContent .pswIpt input`)[i]).attr("disabled", false);
            }
            if(this.psw_value == '') {
                this.pswError = true;
            }
        },
        handleSave() {
            var _this = this;
            ajax({
                url: '/gmvcs/uom/device/gb28181/v1/device/dsj/pass/edit',
                method: 'post',
                data: [{
                    "model": _this.modelName.replace(/,/g,"#,#"),
                    "pass": _this.psw_value,
                }]
            }).then(result => {
                if(result.code == 0) {
                    _this.saySuccess(_this.zfymm_txt.editSuccess);
                    _this.showEdit = true;
                    _this.pswError = false;
                    let idName = _this.modelName.replace(/,/g,"");
                    setTimeout(function(){  //等待渲染完成
                        let pswIptLen = $(`.${idName}.pswContent .pswIpt input`).length;
                        for(let i = 0; i < pswIptLen; i++) {
                            $($(`.${idName}.pswContent .pswIpt input`)[i]).attr("disabled", "disabled");
                        }
                    }, 100);
                    ajax({
                        url: '/gmvcs/uom/device/gb28181/v1/device/dsj/pass/query',
                        method: 'get',
                        data: {}
                    }).then(res => {
                        if(res.code == 0) {
                            for(let j = 0; j < res.data.length; j++) {
                                if(res.data[j].model == _this.modelName.replace(/,/g,"#,#")) {
                                    _this.psw_value = res.data[j].pass;
                                    _this.old_psw_value = res.data[j].pass;
                                }
                            }
                        }else {
                            _this.sayError(_this.zfymm_txt.queryFail);
                            _this.psw_value = _this.old_psw_value;
                        }
                    });
                }else {
                    _this.sayError(_this.zfymm_txt.editFail);
                }
            });
        },
        handleCancel() {
            this.psw_value = this.old_psw_value;
            this.showEdit = true;
            this.pswError = false;
            let idName = this.modelName.replace(/,/g,"");
            setTimeout(function(){ //等待渲染完成
                let pswIptLen = $(`.${idName}.pswContent .pswIpt input`).length;
                for(let i = 0; i < pswIptLen; i++) {
                    $($(`.${idName}.pswContent .pswIpt input`)[i]).attr("disabled", "disabled");
                }
            },100);
        },
        showRuleTip: false,
        psw_focus() {
            this.showRuleTip = true;
        },
        psw_blur() {
            this.showRuleTip = false;
        },
        pswError: false,
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
                    if (/^ADVANCED_FUNCTION_ZFYMMBJ/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                let _this = this;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "ADVANCED_FUNCTION_ZFYMMBJ":
                            _this.authority.EDIT = true;
                            break;
                    }
                });
            });
            this.modelName = this.data.name;
            this.psw_value = this.data.psw;
            this.old_psw_value = this.data.psw;
        },
        onReady() {
            let idName = this.modelName.replace(/,/g,"");
            let pswIptLen = $(`.${idName}.pswContent .pswIpt input`).length;
            for(let i = 0; i < pswIptLen; i++) {
                $($(`.${idName}.pswContent .pswIpt input`)[i]).attr("disabled", "disabled");
            }
        },
    }
});