import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;

export const name = "zfsypsjglpt-jdkp-kpcczl-ck";
require("/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck.css");
require.async('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck-jycxkp');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck-fxccf');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck-qzcs');
// require.async('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-kpcczl-ck-sgcl');
let zhkp_vm;

avalon.component(name, {
    template: __inline("./zfsypsjglpt-jdkp-kpcczl-ck.html"),
    defaults: {

        //tab-content
        jycxkp: '',
        fxccf: '',
        qzcs: '',
        sgcl: '',

        //tab-visible
        jycxkpShow: false,
        fxccfShow: false,
        qzcsShow: false,
        sgclShow: false,
        All: ['jycxkp', 'fxccf', 'qzcs', 'sgcl'],

        //click-tab
        tabChange(e) {

            if (!$(e.target).attr('uil')) {
                return;
            }
            let _this = this;
            $('.lightTab').removeClass('lightTab');
            $(e.target).addClass('lightTab');
            this.All.forEach(function (value, index) {

                if (value == $(e.target).attr('uil')) {
                    _this[value + 'Show'] = true;
                    window.kpcczl_ck_showing = value;
                } else {
                    _this[value + 'Show'] = false;
                }
            });
        },
        onInit() {
            let _this = this;
            let fix_tab = new Promise((resolve, reject) => {
                _this.All.forEach(function (value, index) {
                    _this[value] = `<xmp is="zfsypsjglpt-jdkp-kpcczl-ck-${value}" :widget="{id:'zfsypsjglpt-jdkp-kpcczl-ck-${value}'}"></xmp>`;
                });
                resolve();
            });
            fix_tab.then(() => {

                if (!window.kpcczl_ck_showing) {
                    _this.jycxkpShow = true;
                    return;
                }
                _this.All.forEach(function (value, index) {

                    if (value == window.kpcczl_ck_showing) {
                        $('[uil=' + value + ']').click();
                        return;
                    }
                });
            });
        },
        onReady() {
            $('.popover').hide();
        },
        onDispose() {

        }
    }
});