import avalon from 'avalon2';
import {
    createForm,
    notification
} from "ane";
import ajax from '../../services/ajaxService';
import './sszhxt-gjgl-gjsz.css';
export const name = 'sszhxt-gjgl-gjsz';
let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

let vm = null;
avalon.component(name, {
    template: __inline('./sszhxt-gjgl-gjsz.html'),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        gjsz_txt: language_txt.sszhxt.sszhxt_gjgl,
        deviceBattery: '',
        deviceStorage: '',
        deviceOnline: '',
        deviceOutline: '',
        deviceSOS: '',
        faceMonitoring: '',
        carMonitoring: '',
        sqlid: '', //数据库主键
        save() {
            let json = {
                "id": vm.sqlid,
                "sosConfigurations": [{
                    "sosLevel": vm.deviceBattery,
                    "sosSource": "DEVICE_ELECTRIC_CAPACITANCE",
                    "sosType": "DEVICE_SOS"
                }, {
                    "sosLevel": vm.deviceStorage,
                    "sosSource": "DEVICE_STORAGE_CAPACITANCE",
                    "sosType": "DEVICE_SOS"
                }, {
                    "sosLevel": vm.deviceOnline,
                    "sosSource": "DEVICE_ONLINE",
                    "sosType": "STATUS_SOS"
                }, {
                    "sosLevel": vm.deviceOutline,
                    "sosSource": "DEVICE_OFFLINE",
                    "sosType": "STATUS_SOS"
                }, {
                    "sosLevel": vm.deviceSOS,
                    "sosSource": "DEVICE_SOS",
                    "sosType": "BUSINESS_SOS"
                }, {
                    "sosLevel": vm.faceMonitoring,
                    "sosSource": "FACE_MONITORING",
                    "sosType": "BUSINESS_SOS"
                }, {
                    "sosLevel": vm.carMonitoring,
                    "sosSource": "CAR_MONITORING",
                    "sosType": "BUSINESS_SOS"
                }]
            };
            saveAjax(json).then((ret) => {
                if (ret.code == 0) {
                    showMessage('success', languageSelect == "en" ? "Save successfully!" : '保存成功');
                    return;
                }
                showMessage('error', languageSelect == "en" ? "A backend error in server occurred. Failed to save! " : '服务器后端出错,保存失败!');
            })
        },
        reset() {
            vm.deviceBattery = 3;
            vm.deviceStorage = 3;
            vm.deviceOnline = 3;
            vm.deviceOutline = 3;
            vm.deviceSOS = 3;
            vm.faceMonitoring = 3;
            vm.carMonitoring = 3;
        },
        onInit(event) {
            vm = event.vmodel
            fetchUserconfig().then((ret) => {
                if (ret.code == 0) {
                    vm.sqlid = ret.data.id;
                    avalon.each(ret.data.sosConfigurations, function (index, value) {
                        if (value.sosType == 'DEVICE_SOS' && value.sosSource == 'DEVICE_ELECTRIC_CAPACITANCE') {
                            vm.deviceBattery = value.sosLevel;
                        }
                        if (value.sosType == 'DEVICE_SOS' && value.sosSource == 'DEVICE_STORAGE_CAPACITANCE') {
                            vm.deviceStorage = value.sosLevel;
                        }
                        if (value.sosType == 'STATUS_SOS' && value.sosSource == 'DEVICE_ONLINE') {
                            vm.deviceOnline = value.sosLevel;
                        }
                        if (value.sosType == 'STATUS_SOS' && value.sosSource == 'DEVICE_OFFLINE') {
                            vm.deviceOutline = value.sosLevel;
                        }
                        if (value.sosType == 'BUSINESS_SOS' && value.sosSource == 'DEVICE_SOS') {
                            vm.deviceSOS = value.sosLevel;
                        }
                        if (value.sosType == 'BUSINESS_SOS' && value.sosSource == 'FACE_MONITORING') {
                            vm.faceMonitoring = value.sosLevel;
                        }
                        if (value.sosType == 'BUSINESS_SOS' && value.sosSource == 'CAR_MONITORING') {
                            vm.carMonitoring = value.sosLevel;
                        }
                    });
                    return;
                }
                showMessage('error',  languageSelect == "en" ? "A backend error in server occurred. Failed to get user configuration." : '服务器后端错误,获取用户配置失败')
            })
        },
        onReady() {
            $(document.body).css({
                "min-height": "720px"
            });
        },
        onDispose() {
            $(document.body).css({
                "min-height": "550px"
            });
        }
    }
})
/*
 * 请求后台获取用户设置
 * */

function fetchUserconfig() {
    return ajax({
        url: '/gmvcs/instruct/sos/level',
        method: 'get',
        cache: false
    });
}

/*
 *  保存
 * */
function saveAjax(data) {
    return ajax({
        url: '/gmvcs/instruct/sos/saveorupdate/level',
        method: 'post',
        cache: false,
        data: data
    });
}
//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: languageSelect == "en" ? "Tips" : "通知",
        message: content
    });
}