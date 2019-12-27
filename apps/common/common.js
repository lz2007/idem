import 'es5-shim';
import 'es6-promise/dist/es6-promise.auto';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;
// 提前禁止avalon对Object.create的实现
if (!Object.create) {
    Object.create = function () {
        function F() {}

        return function (o) {
            F.prototype = o;
            return new F();
        };
    }();
}
var avalon = require('avalon2');
if (avalon.msie < 8) {
    Object.defineProperty = function (obj, property, meta) {
        obj[property] = meta.value;
    };
}
avalon.config({
    debug: __AVDEBUG__
});
require('common-canvas');
require('ane/dist/layout');
require('bootstrap');
require('es5-shim/es5-sham');
require('common-paging');
require('common-pages');
require('common-tree-select');
require('common-search-select');
require('common-ms-select');
require('common-tree-ccfwglassign');
require('common-ccfwglassign');
require('common-table');
require('common-table-li');
require('common-table-index.js');
require('common-ms-modal');
require('common-selectoption.js');
require('common-gm-webplayer');
require('common-player');
require('common-player-npGxx');
require('common-pic-player');
require('common-video');
require('common-audio');
require('common-download-tip');
require('common-header-operation');
require('spectrum-colorpicker');
require('common-browser-upgrade-tips');
require('common-glmt');
require('common-input');
require('common-select');
require('common-treeselect');
require('common-datepick');
require('common-textarea');
require('common-ms-month-picker');
require('../../vendor/jquery/jquery.tooltip-x.js');
require('../../vendor/jquery/jquery.popover-x.js');
require('../../vendor/jquery/jquery.ztree.all.js');
require('../../vendor/jquery/jquery.ztree.exhide.min.js')
require('../../vendor/jquery/migarate.js');
require('../../vendor/jquery/jquery.jqprint-0.3.js');
let storage = require('../../services/storageService.js').ret;

//使用 new Date().Format("yyyy-MM-dd hh:mm:ss");
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

// includes兼容
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            var len = o.length >>> 0;
            if (len === 0) {
                return false;
            }
            var n = fromIndex | 0;
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            while (k < len) {
                if (o[k] === searchElement) {
                    return true;
                }
                k++;
            }
            return false;
        }
    });
}

let notClearStorageKey = ['SESSION', 'account', 'userCode', 'jfVersion', 'msLastPath', 'orgCode', 'orgId', 'orgPath', 'orgName', 'roleNames', 'roleIds', 'uid', 'nowlogintime', 'nowLonginIp', 'loginFailNum','accountExpireNum','passwordExpireNum','userName', 'policeState', 'license', 'licenseCode', 'lastlogintime', 'lastLonginIp', 'policeType', 'kplb_type', 'browser-tips-had-show', 'pzzz-data',
    'tjfx-khqktj-table-obj', 'zfsypsjglpt-tjfx-khqktj', 'zfsypsjglpt-tjfx-khqktj-table-detail', 'tjfx-khqktj-table_01', 'tjfx-khqktj-table_02', 'tjfx-khqktj-breadcrumb-obj', 'npGxx-tips', 'sszhxt-znsb-rlbk-recordID', 'sszhxt-znsb-cpbk-record-item'
]; // 清除localstorage白名单
// 页面刷新、页面关闭时清除查询条件等缓存
$(window).unload(function () {
    var all = storage.getAll();
    avalon.each(all, function (key, val) {
        if (-1 == $.inArray(key, notClearStorageKey)) {
            storage.removeItem(key);
        }
    });
});

console.log('test')
exports.delete_ocx = function () {
    let globalOcxPlayer;
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        globalOcxPlayer = document.getElementById('gxxPlayOcx');
    else {
        globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic') || document.getElementById('npGSVideoPlugin');
        if (globalOcxPlayer && !globalOcxPlayer.GS_ReplayFunc)
            return;
    }

    if (!globalOcxPlayer)
        return;

    globalOcxPlayer.IMG_DestroyWnd();

    if ($("#gxx_ocx").length > 1)
        $("#gxx_ocx").hide();

    let data = {};
    data.action = 'Delete';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    data = {};
    data.action = 'LogOut';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
};