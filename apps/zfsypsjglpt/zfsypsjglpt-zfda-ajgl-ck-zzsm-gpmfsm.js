import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import {
    Gm
} from '../common/common-tools.js';
import moment from 'moment';
import ajax from "/services/ajaxService";
export const name = "zfsypsjglpt-zfda-ajgl-ck-zzsm-gpmfsm";
import * as menuServer from '../../services/menuService';
// require("/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-gpmfsm.css");
function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();
function Format() {};
Format.prototype = Object.create(new Gm().format);
let Gm_format = new Format();
let storage = require('/services/storageService.js').ret;
let tester = null;
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-ck-zzsm-gpmfsm.html"),
    defaults: {
        input_blur(e) {
           $(e.target).text(e.target.value);
        },
        css: {
            width: '100%',
            height: '100%',
        },
        zzdw: {
            value: '',
        },
        bz: {
            value: '',
        },
        propArr: ['zzdw','bz'],
        onInit() {
            let data = Gm_tool.getStorage('gpmfsm');
            if (data) {
                Object.keys(data).forEach((val, key) => {
                        this[val].value = data[val];
                })
            }
        },
        onReady() {
           
        },
        onDispose(){
            let data = {},
                that = this;
            that.propArr.forEach((val, key) => {
                data[val] = that[val].value;
            });
            Gm_tool.setStorage('gpmfsm', data, 0.5, function () { 
                console.log(data) 
            }) ;
        }
    }
});

