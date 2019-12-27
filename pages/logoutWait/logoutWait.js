import './logoutWait.less';
import 'ane';
import $ from 'jquery';
import {
    languageSelect
  } from '../../services/configService';
let language_txt = require('../../vendor/language').language;

var root = avalon.define({
    $id: 'logoutWait_vm',
    tips: "",
    extra_class: languageSelect == 'en' ? true : false,
});

root.$watch('onReady', function () {
    let item = parseInt(GetQueryString("type"));
    switch (item) {
        case -1:
            root.tips = language_txt.mainIndex.tips2;
            if(root.extra_class) {
                $(".logoutWait .loadingTxt").css({
                    "margin-left": "-482px"
                });
            }else {
                $(".logoutWait .loadingTxt").css({
                    "margin-left": "-316px"
                });
            }
            break;
        case 1003:
            root.tips = language_txt.mainIndex.tips1;
            if(root.extra_class) {
                $(".logoutWait .loadingTxt").css({
                    "margin-left": "-290px"
                });
            }else {
                $(".logoutWait .loadingTxt").css({
                    "margin-left": "-144px"
                });
            }
            break;
    }

    setTimeout(() => {
        global.location.href = `/main-login.html`;
    }, 3000);
});

function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return (r[2]);
    }
    return null;
}

document.title = language_txt.mainIndex.notification;

avalon.scan(document.body);