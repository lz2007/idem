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
import './xtywgl-gjpz-index-zfymm-psw';
let language_txt = require('../../vendor/language').language;
export const name = 'xtywgl-zfymm';
require('./xtywgl-gjpz-index-zfymm.less');
let vm = avalon.component(name, {
    template: __inline('./xtywgl-gjpz-index-zfymm.html'),
    defaults: {
        zfymm_txt: language_txt.xtywgl.gjpz,
        loading: false,
        modelArr: [],
        authority: { //功能权限控制
            "QUERY": false, //查询
        },
        sayError: function (word) {
            notification.error({
                message: word,
                title: language_txt.xtywgl.gjpz.tips
            });
        },
        onInit(event) {
            menuServer.menu.then(menu => {
                let list = menu.UOM_MENU_TYYWGLPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^ADVANCED_FUNCTION_ZFYMMCK/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                let _this = this;
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "ADVANCED_FUNCTION_ZFYMMCK": 
                            _this.authority.QUERY = true;
                            break;
                    }
                });
            });
            this.loading = true;
            var _this = this;
            ajax({
                url: '/gmvcs/uom/device/gb28181/v1/device/dsj/pass/query',
                method: 'get',
                data: {}
            }).then(result => {
                if(result.code == 0) {
                    for(let i = 0; i < result.data.length; i++) {
                        let modelNamePswObj = {};
                        modelNamePswObj["name"] = result.data[i].model.replace(/#,#/g,",");
                        modelNamePswObj["psw"] = result.data[i].pass;
                        _this.modelArr.push(modelNamePswObj);
                    }
                    this.loading = false;
                }else {
                    this.loading = false;
                    _this.sayError(_this.zfymm_txt.queryFail);
                }
            });
        },
        onReady() {
        },
    }
});