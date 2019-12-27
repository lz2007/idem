/*
 * @Author: zhengwenlong
 * 播放器弹窗页面
 * 使用描述：页面进来http://127.0.0.1:3000/video-demo.html?deviceId=44010000901511943864'，需要传点流设备deviceId
 */

// 公共引用部分，兼容IE8用
require('/apps/common/common');
import {
    Gxxplayer
} from '../../vendor/gosunocx/gosunocx';
import { notification } from 'ane';
import moment from 'moment';
import ajax from '/services/ajaxService.js';

document.title = '实时播放';

let ocxVideo_vm = avalon.define({
    $id: 'ocx-video',
    isIe:''
});

ocxVideo_vm.$watch('onReady', function() {
    let _this = this;
    ocxVideo_vm.isIe = isIE();
    let ocxele = document.getElementById("videoMain");
    let player = new Gxxplayer();
     // 初始化播放器
     player.init({
        'element': 'videoMain',
        'model': 1,
        //'proxy': _onOcxEventProxy
    });
    $(window).unload(function() {//当前窗口关闭事件
        if (0 != player.getStatusByIndex(-1)) {
            player.stopRec(1); //结束视频
        }
    });
    // let childGbcode = '44010000901511943864';
    let childGbcode = GetQueryString('deviceId');
    if(!childGbcode){
        notification.error({
            title: '通知',
            message: '获取设备deviceId失败'
        });
        return;
    }
    setTimeout(function () { 
        ajax({
            url: '/gmvcs/uom/ondemand/dsj/intranet/streamserver?requestType=play_realtime_video&deviceId=' + childGbcode,
            method: 'get',
            data: null
        }).then(result => {
            if (result.code == 1702) {
                notification.error({
                    title: '通知',
                    message: '设备不在线'
                });
                return;
            } else if (result.code == 1701) {
                notification.error({
                    title: '通知',
                    message: '获取流媒体信息失败'
                });
                return;
            } else if (result.code == 1500) {
                notification.error({
                    title: '通知',
                    message: '获取流媒体信息失败'
                });
                return;
            } else if (result.code == 0) {
                result.data.gbcode = childGbcode;
                if (result.data.gb28181Mode && result.data.gb28181Mode == 1) { //表示gsp方式点流
                    result.data.url = result.data.gsp;
                    let code = player.playRecByUrl(result.data);
                    if (code != 0) {
                        notification.error({
                            title: '通知',
                            message: '视频呼叫失败'
                        });
                        return;
                    }
                } else {
                    let code = player.login(result.data); //先登录流媒体
                    if (code != 0) {
                        notification.error({
                            title: '通知',
                            message: '流媒体服务登录失败,出错代码为' + code
                        });
                        return;
                    }
                    // setTimeout();
                    code = player.playRec(result.data); //实时点流
                    if (code == -2) { //表示登录失败
                        return;
                    }
                }
    
            }
        });
    },2000);
    
});

/**
 * 是否是ie
 */
function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}
/**
 * 获取当前窗口url后面携带的参数
 * @param {string} name   
 */
function GetQueryString (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return (r[2]);
    }
    return null;
}

avalon.scan(document.body);