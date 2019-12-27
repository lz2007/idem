import avalon from 'avalon2';
import 'ane';
import {
    createForm,
    notification
} from "ane";
import ajax from "../../services/ajaxService";
import * as menuServer from '../../services/menuService';
import Sbzygl from '../common/common-sbzygl';
export const name = 'tyywglpt-sqgl';
require('apps/tyywglpt/tyywglpt-sqgl-index.css');

import 'jquery';
import 'bootstrap';

let storage = require('../../services/storageService.js').ret;

let sbzygl = null;
const listHeaderName = name + "-list-header";

let vm = avalon.component(name, {
    template: __inline('./tyywglpt-sqgl-index.html'),
    defaults: {
        licenseList: [],
        machineCode: '',
        licenseToggle: true,
        alreadyLicense: '',
        noneLicense: '',
        onInit: function (event) {
            sbzygl = new Sbzygl(event.vmodel);
            this.licenseList = [];
            ajax({
                url: '/gmvcs/uap/cas/license/info',
                method: 'get',
                data: {}
            }).then(result => {
                let tempList = [];
                if (result.code == 0) {
                    this.machineCode = result.data.machineCode;
                    let item = result.data;
                    let tempData = [{
                            'name1': '机器码',
                            'value1': item.machineCode,
                            'name2': '用户名称',
                            'value2': item.userName,
                            'lastLi': false
                        },
                        {
                            'name1': '系统id',
                            'value1': item.sysid,
                            'name2': '产品名称',
                            'value2': item.productName,
                            'lastLi': false
                        },
                        {
                            'name1': '产品编码',
                            'value1': item.productCode,
                            'name2': '产品信息',
                            'value2': item.productInfo,
                            'lastLi': false
                        },
                        {
                            'name1': '功能信息',
                            'value1': item.functionInfo,
                            'name2': '计数器',
                            'value2': item.counter,
                            'lastLi': false
                        },
                        {
                            'name1': '过期保护',
                            'value1': isFalseFunc(item.expireProtect),
                            'name2': '过期时间',
                            'value2': isNullFunc(item.expireTime),
                            'lastLi': false
                        },
                        {
                            'name1': '授权描述',
                            'value1': item.licenseDesc,
                            'name2': '扩展信息',
                            'value2': item.extend,
                            'lastLi': false
                        },
                        {
                            'name1': '概要',
                            'value1': item.summary,
                            'lastLi': true
                        }
                    ];
                    this.licenseList = tempData;
                    //1405授权已过期
                    if (storage.getItem('license') == 'none' && storage.getItem('licenseCode') == 1405) {
                        this.licenseToggle = false;
                        this.noneLicense = '授权已过期';
                    } else if (storage.getItem('license') == 'none' && storage.getItem('licenseCode') == 1404) {
                        this.licenseToggle = false;
                        this.noneLicense = '未授权';
                    } else {
                        this.licenseToggle = true;
                        this.alreadyLicense = '已授权';
                    }
                    // setTimeout(() => {
                    //     if ($('.tyywglpt-list-content').get(0).offsetHeight < $('.tyywglpt-list-content').get(0).scrollHeight - 1) {
                    //         $('.tyywglpt-list-header').css({
                    //             'padding-right': '17px'
                    //         });
                    //     } else {
                    //         $('.tyywglpt-list-header').css({
                    //             'padding-right': '0'
                    //         });
                    //     }
                    // }, 100);
                    _popover(); //激活title功能
                    sbzygl.initDragList(listHeaderName);
                } else {
                    notification.error({
                        message: 'Server backend error, please contact administrator.',
                        title: 'Tips'
                    });
                }
            });

        },
        onReady: function () {
            //表头宽度设置
            sbzygl.setListHeader(listHeaderName);
        },
        updateLicenseEvt: function () {
            updateCont.machineCode = this.machineCode;
            updateCont.licenseValue = '';
            updateCont.updateShow = true;
        }
    }
});

function isFalseFunc(item) {
    if (item) {
        return '是';
    } else if (item == false) {
        return '否';
    } else {
        return '';
    }

}
//时间戳转日期
function isNullFunc(item) {
    if (item) {
        var d = new Date(item);
        var year = d.getFullYear();
        var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
        var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
        var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
        var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
        var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    } else {
        return '';
    }
}
let updateCont = avalon.define({
    $id: 'updateLicense_Cont',
    updateShow: false,
    machineCode: '',
    licenseValue: '',
    handleCancel: function () {
        this.updateShow = false;
    },
    getLicenseVal: function (e) {
        this.licenseValue = e.target.value;
    },
    updateOk: function () {
        var tempVal = $(".inputHbox textarea").val();
        if (tempVal == '') {
            notification.warn({
                message: '请输入授权信息',
                title: '温馨提示'
            });
            return;
        }
        ajax({
            url: '/gmvcs/uap/cas/license/update',
            method: 'post',
            data: {
                'token': this.licenseValue
            }
        }).then(result => {
            if (result.code == 0) {
                notification.success({
                    message: '授权信息更新成功！',
                    title: '温馨提示'
                });
                this.updateShow = false;
                storage.removeItem('license');
                setTimeout(function () {
                    ajax({
                        url: '/gmvcs/uap/cas/logout',
                        method: 'get',
                        data: {}
                    }).then(data => {
                        if (0 !== data.code) {
                            notification.warn({
                                message: data.msg,
                                title: '温馨提示'
                            });
                            return;
                        }
                        storage.clearAll();
                        global.location.href = './main-login.html';
                    });
                }, 1000);
            } else {
                notification.error({
                    message: result.msg,
                    title: '温馨提示'
                });
            }
        });
    }
});

/*title显示,方便复制*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            return '<div class="title-content">' + $(this)[0].innerText + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
// 表格数据判空
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}