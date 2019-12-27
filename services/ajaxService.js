import avalon from 'avalon2';
import jQuery from 'jquery';
global.$ = global.jQuery = jQuery;

import {
    notification
} from 'ane';
import {
    serviceUrl,
    apiUrl,
    mainIndex,
    ajaxTimeout
} from './configService';
let language_txt = require('../vendor/language').language;


// 拦截ajax请求，检测是否超时，以重新登录
$(document).ajaxComplete((event, xhr, settings) => {
    if (xhr.status === 200) {
        if (settings.dataType === 'json' && xhr.responseJSON !== void 0) {
            // let result = xhr.responseJSON;
            // if (1003 === result.code) {
            //     // 没有session登录信息时跳转至登录页
            //     global.location.href = "/main-login.html";
            // }
        }
    } else if (xhr.status === undefined || xhr.status === 0) {} else {
        notification.error({
            message: language_txt.mainIndex.notificationTips,
            title: language_txt.mainIndex.notification
        });
    }
});

export default function (options) {
    const defaultOptions = {
        dataType: 'json',
        cache: true,
        jsonp: 'callback',
        timeout: ajaxTimeout
    };
    options.data = processRequest(options);
    options.url = /^\w+:\/\//.test(options.url) ? options.url : apiUrl + options.url;
    options.url = options.url.replace(/\/apis\/api\//ig, '/api/'); //fix for ajax url
    // options.url = encodeURI(options.url);
    options.headers = {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=utf-8"
    };
    return $.ajax({
        ...defaultOptions,
        ...options
    }).then(processResponse);
};

// 标准化传给后台的参数
function processRequest(r) {
    const str = r.data || {};
    if ('get' == r.method) {
        if ($.isEmptyObject(str) || null == str) {
            return {
                t: new Date().getTime()
            };
        } else {
            return {
                //添加时间戳随机数
                params: JSON.stringify(str),
                t: new Date().getTime()
            };
        }
    } else {
        return JSON.stringify(str);
    }
}

// 标准化后台相应数据格式
function processResponse(r) {
    let str = {};
    if (r.rows) {
        str = r;
        str.code = 0;
        str.list = r.rows;
        delete str.rows;
    } else {
        if (!r.error) {
            if (-1 === r.code || 1003 === r.code) { //-1 账号在其他地方登陆；1003 没有session信息（session过期）
                // notification.error({
                //     title: language_txt.mainIndex.notification,
                //     message: r.msg,
                //     timeout: 5000
                // });

                setTimeout(() => {
                    global.location.href = `/logoutWait.html?type=${r.code}`;
                }, 0);
                return;
            }
            if (0 <= r.code) {
                str = r;
            } else {
                str.code = 0;
                str.data = r;
            }
        } else {
            str.code = -9999;
            str.message = r.message || r.error;
        }
    }
    return str;
}