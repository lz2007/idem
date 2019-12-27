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
export const name = "zfsypsjglpt-zfda-ajgl-ck-zzsm-zjlysm";
import * as menuServer from '../../services/menuService';
// require("/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-zjlysm.css");
function Tools() {};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools();
function Format() {};
Format.prototype = Object.create(new Gm().format);
let Gm_format = new Format();
let storage = require('/services/storageService.js').ret;
let tester = null;
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-ck-zzsm-zjlysm.html"),
    defaults: {
        input_blur(e) {
           $(e.target).text(e.target.value);
        },
        css: {
            width: '100%',
            height: '100%',
        },
        dd: {
            value: '',
        },
        zzdw: {
            value: '',
        },
        size: {
            value: '',
        },
        ff: {
            value: '',
        },
        gs: {
            value: '',
        },
        sl: {
            value: '',
        },
        spmc: {
            value: '',
        },
        bz: {
            value: '',
        },
        date: {
            name: '开始时间',
            timeChange(e) {
                this.value = e;
            },
            placeHolder: '请选择开始时间',
            value: '',
            time: '',
            showTime: false,
            endDate: '',
        },
        propArr: ['date','bz','spmc', 'sl', 'gs', 'ff', 'size', 'zzdw', 'dd'],
        onInit() {
            let data = Gm_tool.getStorage('zjlysm');
            if (data) {
                Object.keys(data).forEach((val, key) => {
                    if (val == 'date') {
                        this[val].time = Gm_format.formatDate(data[val], true);
                    } else {
                        this[val].value = data[val];
                    }
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
            Gm_tool.setStorage('zjlysm', data, 0.5, function () { 
                console.log(data) 
            }) ;
        }
    }
});

