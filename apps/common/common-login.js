//
import {
    singleSignOn,
    gt,
    apiUrl,
    copyRight,
    telephone,
    titleName,
    languageSelect,
    titleNameStyle,
    hasLogo
} from '../../services/configService';

require('bootstrap');
require('../../vendor/jquery/jquery.placeholder.min.js');
import ajax from '../../services/ajaxService.js';
import {
    notification
} from "ane";

var storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;

document.title = titleName;

var login_vm = avalon.define({
    $id: 'login_vm',
    flag_lan: languageSelect == "en" ? true : false,
    login_txt: language_txt.login,
    currentPage: '',
    user: {},
    username: '',
    password: '',
    loginInfo: {},
    authInfo: {},
    singleSignOn: singleSignOn,
    hasLogo: hasLogo,
    titleName: titleName,
    copyRight: copyRight,
    telephone: telephone,
    version: '',
    identifyCode: '',
    identifyCodeFlag: false,
    identifyCodeSrc: "",
    uTipsFlag: false,
    pTipsFlag: false,
    vTipsFlag: false,
    uTipsText: '',
    pTipsText: '',
    vTipsText: '',
    loginState: false,
    login() {
        if (this.loginState) {
            return;
        }
        let _this = this;
        this.uTipsFlag = this.pTipsFlag = this.vTipsFlag = false;
        if (this.username == "") {
            this.uTipsFlag = true;
            this.uTipsText = this.login_txt.pleaseenterusername;
            return;
        }

        if (this.password == "") {
            this.pTipsFlag = true;
            this.pTipsText = this.login_txt.pleaseenterpassword;
            return;
        }

        this.loginState = true;
        ajax({
            url: '/gmvcs/uap/cas/login',
            method: 'post',
            data: {
                "account": $.trim(this.username),
                "password": $.trim(this.password),
                // "verificationCode": $.trim(this.identifyCode)
                "inputCode": $.trim(this.identifyCode),
                "vcode": $.trim(this.vcode)
            }
        }).then(result => {
            //1404表示未授权，1405表示授权已过期
            if (result.code == 1404 || result.code == 1405) {
                storage.setItem('license', 'none');
                storage.setItem("licenseCode", result.code);
                this.loginState = false;
                global.location.href = '/xtywgl.html#!/xtywgl-sqgl-index';
                return;
            }
            if (result.code == 2107) {
                this.loginState = false;
                this.identifyCodeFlag = true;
                this.vTipsFlag = true;
                this.vTipsText = this.login_txt.multipleloginfailed;
                this.getIdentifyCodeImg();
                return;
            }
            if (2108 == result.code) {
                this.loginState = false;
                this.vTipsFlag = true;
                this.vTipsText = this.login_txt.verificationcodeisincorrect;
                $("#identifyCode").css("color", "#de494f");
                $("#identifyCode").focus(function () {
                    $(this).val('');
                    _this.identifyCode = "";
                    $(this).css("color", "#fff");
                })
                if (this.identifyCodeFlag == true) {
                    this.getIdentifyCodeImg(); //登录失败验证码图片刷新
                }
                return;
            }
            if (1402 == result.code) {
                this.loginState = false;
                this.uTipsFlag = true;
                this.uTipsText = this.login_txt.usernamedoesnotexist;
                $("#user_input").css("color", "#de494f");
                $("#user_input").focus(function () {
                    $("#user_input").css("color", "#fff");
                })
                if (this.identifyCodeFlag == true) {
                    this.getIdentifyCodeImg(); //登录失败验证码图片刷新
                }
                return;
            }
            if (1403 == result.code) {
                this.loginState = false;
                this.pTipsFlag = true;
                this.pTipsText = this.login_txt.passwordisincorrect;
                $("#psw_input").css("color", "#de494f");
                $("#psw_input").focus(function () {
                    $(this).val('');
                    _this.password = "";
                    $(this).css("color", "#fff");
                })
                if (this.identifyCodeFlag == true) {
                    this.getIdentifyCodeImg(); //登录失败验证码图片刷新
                }
                return;
            }
            if (0 != result.code) {
                this.loginState = false;
                notification.error({
                    message: result.msg,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                });
                return;
            }
            this.handleLoginData(result.data);
        });
    },
    // pki登录
    pki_login() {
        let baseUrl = '/gmvcs/uap/cas/pki/login';
        // 单点登录
        if (GetQueryString('usercode')) {
            ajax({
                url: baseUrl + "?userCode=" + GetQueryString('usercode') + "&gt=" + gt,
                method: 'get',
                data: {}
            }).then(result => {
                if (0 == result.code) {
                    this.handleLoginData(result.data);
                }
            });
        } else {
            window.location.href = "http://" + window.location.host + apiUrl + baseUrl;
        }
    },
    handleLoginData(data) {
        // 是否已关闭浏览器下载提示，先保存在browserTipsHadHhow中间变量上，防止登录后清空
        let browserTipsHadShow = false;
        if (!!storage.getItem('browser-tips-had-show')) {
            browserTipsHadShow = storage.getItem('browser-tips-had-show');
        }
        storage.clearAll(); //清除之前的所有数据
        //设置本地储存或cookie > loginInfo
        storage.setItem('account', data.account);
        storage.setItem('userName', data.userName);
        storage.setItem('userCode', data.userCode);
        storage.setItem('orgCode', data.orgCode);
        storage.setItem('orgId', data.orgId);
        storage.setItem('orgPath', data.orgPath);
        storage.setItem('uid', data.uid);
        storage.setItem('nowlogintime', data.nowlogintime);
        storage.setItem('orgName', data.orgName);
        storage.setItem('nowLonginIp', data.nowLonginIp);
        storage.setItem('loginFailNum', data.loginFailNum);
        storage.setItem('accountExpireNum', data.accountExpireNum);
        storage.setItem('passwordExpireNum', data.passwordExpireNum);
        if (languageSelect == "en" && data.roleNames[0] == "超级用户") {
            storage.setItem('roleNames', ["admin"]);
        } else {
            storage.setItem('roleNames', data.roleNames);
        }
        storage.setItem('roleIds', data.roleIds);
        storage.setItem('lastlogintime', data.lastlogintime);
        storage.setItem('lastLonginIp', data.lastLonginIp);
        storage.setItem('browser-tips-had-show', browserTipsHadShow);



        //根据admin字段判断是否是超级管理员;若false->根据policeType字段判断是普通警员还是领导[true为领导,false为普通警员]
        /*
        LEVAM_JYLB_LD,           // 领导
        LEVAM_JYLB_ZONGDUI_LD,   // 总队领导
        LEVAM_JYLB_ZHIDUI_LD,   // 支队领导
        LEVAM_JYLB_DADUI_LD,    // 大队领导
        LEVAM_JYLB_ZHONGDUI_LD, // 中队领导
        
        LEVAM_JYLB_JY,           // 警员
        LEVAM_JYLB_ZSJY,        // 正式警员
        LEVAM_JYLB_FJ,          // 辅警

        LEVAM_JYLB_FZRY         //法制人员
        LEVAM_JYLB_FZLD         //法制领导

        LEVAM_JYLB_QT           // 其他
        */
        let tempPoliceType = false;
        let kplb_type; //0表示执法类,1表示法制类,2表示admin超级管理员,3表示其他
        if (data.admin) {
            tempPoliceType = true;
            kplb_type = 2;
        } else {
            let resultPolice = data.policeType;
            switch (resultPolice) {
                case "LEVAM_JYLB_LD":
                case "LEVAM_JYLB_ZONGDUI_LD":
                case "LEVAM_JYLB_ZHIDUI_LD":
                case "LEVAM_JYLB_DADUI_LD":
                case "LEVAM_JYLB_ZHONGDUI_LD":
                    tempPoliceType = true;
                    kplb_type = 0;
                    break;
                case "LEVAM_JYLB_JY":
                case "LEVAM_JYLB_FJ":
                    tempPoliceType = false;
                    kplb_type = 0;
                    break;
                case "LEVAM_JYLB_FZRY":
                    tempPoliceType = false;
                    kplb_type = 1;
                    break;
                case "LEVAM_JYLB_FZLD":
                    tempPoliceType = true;
                    kplb_type = 1;
                    break;
                case "LEVAM_JYLB_QT":
                    tempPoliceType = false;
                    kplb_type = 3;
                    break;
                default:
                    tempPoliceType = false;
                    kplb_type = 3;
                    break;
            }
        }

        storage.setItem("policeType", tempPoliceType);
        storage.setItem("kplb_type", kplb_type);
        ajax({
            url: '/gmvcs/uap/org/find/fakeroot/selected?uid=' + data.uid,
            method: 'get',
            data: {}
        }).then(result => {
            let checkType = result.data[0].checkType;
            if (checkType == "UNCHECK") {
                storage.setItem('policeState', true);
            } else {
                storage.setItem('policeState', false);
            }

            setTimeout(function () {
                login_vm.loginState = false;
                if (languageSelect == "zhcn") {
                    global.location.href = '/';
                } else if (languageSelect == "en") {
                    global.location.href = '/';
                }
            }, 0);
        });
        // setTimeout(function () {
        //     // if (languageSelect == "zhcn") {
        //     global.location.href = '/';
        //     // } else if (languageSelect == "en") {
        //     //     global.location.href = './sszhxt.html';
        //     // }
        // }, 0);
    },
    vcode: "",
    getIdentifyCodeImg() {
        // this.identifyCodeSrc = this.handleImgSrc(this.identifyCodeSrc);
        let baseUrl = '/gmvcs/uap/cas/image/code';
        ajax({
            url: baseUrl,
            method: 'get',
            data: {}
        }).then(result => {
            if (0 == result.code) {
                this.identifyCodeSrc = 'data:image/png;base64,' + result.data.imageCode;
                this.vcode = result.data.vcode;
            } else {

            }
        });
    },
    handleImgSrc(imgSrc) {
        imgSrc = "/gmvcs/uap/cas/user/check.jpg?";
        imgSrc = /^\w+:\/\//.test(imgSrc) ? imgSrc : apiUrl + imgSrc;
        imgSrc = imgSrc.replace(/\/apis\/api\//ig, '/api/'); //fix for ajax url
        imgSrc = imgSrc + Math.random(); //点击图片刷新
        return imgSrc;
    }
});


login_vm.$watch('onReady', function () {
    login_vm.loginState = false;
    setTimeout(() => {
        $(".main-line-login #login-title").html(titleNameStyle);
    }, 0);

    // 初始化浏览器下载提示localstorage
    storage.setItem('browser-tips-had-show', false);
    //兼容ie8的placeholder无效的问题
    $('input').placeholder();
    ajax({
        url: '/gmvcs/uap/cas/install/version',
        method: 'get',
        data: {}
    }).then(result => {
        if (0 != result.code) {
            return;
        }
        if (0 == result.code) {
            let versionTxt = language_txt.login.version;
            login_vm.version = versionTxt + result.data.installVersion;
        }
    });
});

function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return (r[2]);
    }
    return null;
}