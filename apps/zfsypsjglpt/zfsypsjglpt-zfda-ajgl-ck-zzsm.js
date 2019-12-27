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
export const name = "zfsypsjglpt-zfda-ajgl-ck-zzsm";
import * as menuServer from '../../services/menuService';
require("/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm.css");
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-zjzzsm');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-zjlysm');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-gpmfsm');
require.async('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-ck-zzsm-gpbasm');
function Tools() {};
function Format() {};
function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();
let storage = require('/services/storageService.js').ret;
let zzsm = null;
let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-ajgl-ck-zzsm.html"),
    defaults: {
        //tab-content
        zjzzsm: '',
        zjlysm: '',
        gpmfsm: '',
        gpbasm: '',

        //tab-visible
        zjzzsm_show: false,
        zjlysm_show: false,
        gpmfsm_show: false,
        gpbasm_show: false,

        //aim
        aim: '',
        All: ['zjzzsm', 'zjlysm', 'gpmfsm', 'gpbasm'],
        print() {
            Gm_tool.bindDataForPrint();
            $("." + this.aim).jqprint({
                debug: false, //如果是true则可以显示iframe查看效果（iframe默认高和宽都很小，可以再源码中调大），默认是false
                importCSS: true, //true表示引进原来的页面的css，默认是true。（如果是true，先会找$("link[media=print]")，若没有会去找$("link")中的css文件）
                printContainer: true, //表示如果原来选择的对象必须被纳入打印（注意：设置为false可能会打破你的CSS规则）。
                operaSupport: true //表示如果插件也必须支持歌opera浏览器，在这种情况下，它提供了建立一个临时的打印选项卡。默认是true
            });
            // $("#printview").jqprint();
        },
        setZdx() {
            var h = ($("." + this.aim).height() || 691);
            var height = (h + 10) /2 ;
            $('.zdx-mid').css('top', $('.zdx-top').height())
            // $('.zdx').css('top', $('.zdx-top').height());
            $('.print_btn').css('margin-top', height*2 -300)
        },
        changeTab(e) {
            if (!$(e.target).attr('id')) {
                return;
            }
            this.aim = $(e.target).attr('id');
            let _this = this;
            $('.light-btn').removeClass('light-btn');
            $(e.target).addClass('light-btn');
            this.All.forEach(function (value, index) {

                if (value == $(e.target).attr('id')) {
                    _this[value + '_show'] = true;
                } else {
                    _this[value + '_show'] = false;
                }
            });
            this.setZdx();
        },
        onInit() {
            zzsm = this;
            $('#zjzzsm').addClass('light-btn');
            this.zjzzsm = true;
            let _this = this;
            let fix_tab = new Promise((resolve, reject) => {
                _this.All.forEach(function (value, index) {
                    _this[value] = `<xmp is="zfsypsjglpt-zfda-ajgl-ck-zzsm-${value}" :widget="{id:'zfsypsjglpt-zfda-ajgl-ck-zzsm-${value}'}"></xmp>`;
                });
                resolve();
            });
            fix_tab.then(() => {
                _this.zjzzsm_show = true;
                _this.aim = 'zjzzsm';
                $('#zjzzsm').click();
                return;
            });
        },
        windowResize() {
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
        onReady() {
            let _this = this;
            setTimeout(function () {
                // _this.setZdx()
            },200);
            this.windowResize();
            $(window).resize(function () {
                _this.windowResize();
            });
        },
        onDispose(){
            
        }
    }
});

