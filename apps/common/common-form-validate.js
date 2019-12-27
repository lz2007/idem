import avalon from 'avalon2';
import { notification } from 'ane';

// 表单验证公共类
export default class FaajValidate {
    constructor() {
        this.caches = [];
        this.strategy = {
            //验证是否为空
            isNoEmpty: function (value, errMsg) {
                return /^\s*$/.test(value) ? errMsg : '';
            },
            minLength: function (value, length, errMsg) {

            },
            //验证是否输入前后空格
            firstLastisNoEmpty: function (value, errMsg) {
                return /(^\s+)|(\s+$)/.test(value) ? errMsg : '';
            },
            //验证输入最大长度
            maxLength: function (value, length, errMsg) {
                return value.length > length ? errMsg : '';
            },
            //验证是否是数字
            isNumber: function (value, errMsg) {
                return /^[0-9]*$/g.test(value) ? '' : errMsg;
            },
            //验证输入最大正整数9位不包含0
            isMaxNumber9: function (value, errMsg) {
                return /^([1-9]\d{0,8})$/gi.test(value) ? '' : errMsg;
            },
            //验证Ip不包含端口
            testIpNotPort: function (value, errMsg) {
                if (false == /(\d+)\.(\d+)\.(\d+)\.(\d+)$/g.test(value))
                    return errMsg;
                if (RegExp.$1 > 255 || RegExp.$2 > 255 || RegExp.$3 > 255 || RegExp.$4 > 255)
                    return errMsg;
                return '';
            },
            //验证端口范围
            testPortRange: function (value, errMsg) {
                if (value < 0 || value > 65535)
                    return errMsg;
                return '';
            },

            //常规：如验证开始时段不能大于结束时段等，如果真大于falg为true
            isCommon: function (flag, errMsg) {
                return flag ? errMsg : '';
            },
            //验证不含特殊字符
            includeSpecialChar: function (value, errMsg) {
                // return /[~#^$@%&!*]/gi.test(value) ? errMsg : '';
                //   return /[`~!@#$%^&*_+<>{}\/'[\]]/im.test(value) ? errMsg : '';
                return /((?=[\x21-\x7e]+)[^A-Za-z0-9])/ig.test(value) ? errMsg : '';
            },
            //验证合法的上传路径或下载路径,extraHead为ftp:// or http://
            isVaildUrl:function(value, errMsg){
                if (false == new RegExp("((http|ftp|https)://)(\\d+).(\\d+).(\\d+).(\\d+)$","g").test(value))
                    return errMsg;
                if (RegExp.$3 > 255 || RegExp.$4 > 255 || RegExp.$5 > 255 || RegExp.$6 > 255)
                    return errMsg;
                return '';
            }
        };
    }
    add(value, rule, errMsg) {
        let arr = rule.split(":");
        let _this = this;
        this.caches.push(
            function () {
                let methodName = arr.shift();
                arr.unshift(value);
                arr.push(errMsg);
                return _this.strategy[methodName].apply(_this.strategy, arr);
            }
        );
    }
    start() {
        let caches = this.caches;
        for (let i = 0; i < caches.length; i++) {
            let ruleFunc = this.caches[i];
            let errMsg = ruleFunc();
            if (errMsg)
                return errMsg;
        }
        return null;
    }

}
Function.prototype.before = function (fn) {
    var self = this;
    return function () {
        var msg = fn.apply(null, arguments);
        if (msg) {
            //  notification.warn({ title:"通知",message: msg });
            //   return false;//返回false主要为了阻止弹框关闭
            return msg;
        }
        return self.apply(null, arguments);
    };
};