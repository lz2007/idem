/**盘证制作 pzzz */
import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;

export const name = "zfsypsjglpt-zfda-ajgl-detail-pzzz_gongan";
require("/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-detail-pzzz_gongan.css");
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-gdkl');

let pzzz = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-detail-pzzz_gongan.html"),
    defaults: {
        pzzz_currentPage: '',
        getPage(component) {
            const html = `<xmp is="${component}" :widget="{id:'${component.replace(/\-/g, '_')}',expire:${Date.now()}}"></xmp>`;
            return html;
        },
        focusMenu(id) {
            $('.pzzz-active').removeClass('pzzz-active');
            $('#' + id).addClass('pzzz-active');
        },
        clickMenu(val) {
            this.focusMenu(val);
            let _this = this;
            switch (val) {
                case 'tpdy':
                    this.pzzz_currentPage = this.getPage("zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy");
                    _this.jmsp();
                    break;
                case 'zzsm':
                    this.pzzz_currentPage = this.getPage("zfsypsjglpt-zfda-ajgl-ck-zzsm");
                    _this.jmsp();
                    break;
                case 'gdkl':
                    this.pzzz_currentPage = this.getPage("zfsypsjglpt-zfda-ajgl-ck-gdkl");
                    _this.jmsp();
                default:
                    // this.pzzz_currentPage = this.getPage("zfsypsjglpt-zfda-ajgl-ck-zzsm");
                    break;
            }
        },
        onInit() {
            this.pzzz_currentPage = this.getPage("zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy");
            // avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-ck-pzzz-tpdy');
        },
        jmsp() {
            let _this = this;
            _this.windowResize();
            $(window).resize(function () {
                _this.windowResize();
            });
        },
        back() {
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-detail_gongan');
        },
        windowResize() { //window界面自适应
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