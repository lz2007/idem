/**
 * 菜单右上角操作弹窗组件
 * 修改密码弹窗、退出登录弹窗
 */
import {
    notification
} from "ane";
import ajax from '/services/ajaxService.js';
// import '../../vendor/jquery/jquery.SuperSlide.2.1.1';

require('/apps/common/common-header-operation.css');
let {
    mainIndex,
    languageSelect
} = require('/services/configService');
let language_txt = require('../../vendor/language').language;
let storage = require('/services/storageService.js').ret;

export const name = 'ms-header-operation';
const msHeaderOperation = avalon.component(name, {
    template: __inline('./common-header-operation.html'),
    defaults: {
        initData: function () {
            return {
                oldPwd: '',
                newPwd: '',
                repPwd: ''
            };
        },
        // 修改密码
        change_Pwd: avalon.define({
            $id: 'change_Pwd',
            pwd_language: getLan(),
            title: getLan().changePassword,
            extra_class: languageSelect == "en" ? true : false,
            oldPwd_tips_error: false,
            newPwd_tips_error: false,
            repPwd_tips_error: false,
            oldPwd_tips_text: '',
            newPwd_tips_text: '',
            repPwd_tips_text: '',
            record: {
                oldPwd: '',
                newPwd: '',
                repPwd: ''
            },
            // 输入框onChange事件
            iputhandle(e) {
                var objName = e.target.name;
                if (undefined == objName)
                    return;
                this.record[objName] = e.target.value;
                switch (objName) {
                    case 'oldPwd':
                        this.oldPwd_tips_error = false;
                        this.oldPwd_tips_text = '';
                        break;
                    case 'newPwd':
                        this.newPwd_tips_error = false;
                        this.newPwd_tips_text = '';
                        break;
                    case 'repPwd':
                        this.repPwd_tips_error = false;
                        this.repPwd_tips_text = '';
                        break;
                }
            },
            // 取消
            editCancel() {
                let _this = msHeaderOperation.defaults;
                _this.changePwd.show = false;
                _this.change_Pwd.record = _this.initData();
            },
            // 确定修改
            editOk() {
                let _this = msHeaderOperation.defaults;
                let change_Pwd = _this.change_Pwd;
                var pwdText = change_Pwd.record;
                if (pwdText.oldPwd == '') {
                    change_Pwd.oldPwd_tips_text = getLan().changePassword1;
                    change_Pwd.oldPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd == '') {
                    change_Pwd.newPwd_tips_text = getLan().changePassword2;
                    change_Pwd.newPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd.length < 6) {
                    change_Pwd.newPwd_tips_text = getLan().changePassword3;
                    change_Pwd.newPwd_tips_error = true;
                    return;
                };
                if (pwdText.repPwd == '') {
                    change_Pwd.repPwd_tips_text = getLan().changePassword4;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };
                if (pwdText.newPwd != pwdText.repPwd) {
                    change_Pwd.repPwd_tips_text = getLan().changePassword5;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };
                if (pwdText.oldPwd == pwdText.repPwd) {
                    change_Pwd.repPwd_tips_text = getLan().changePassword6;
                    change_Pwd.repPwd_tips_error = true;
                    return;
                };

                // 填写无误时初始化信息提示
                change_Pwd.oldPwd_tips_error = false;
                change_Pwd.newPwd_tips_error = false;
                change_Pwd.repPwd_tips_error = false;
                change_Pwd.oldPwd_tips_text = '';
                change_Pwd.newPwd_tips_text = '';
                change_Pwd.repPwd_tips_text = '';

                ajax({
                    url: '/gmvcs/uap/user/changPassword',
                    method: 'post',
                    data: {
                        "newPassword": pwdText.newPwd,
                        "oldPassword": pwdText.oldPwd
                    }
                }).then(data => {
                    if (0 != data.code) {
                        notification.error({
                            message: data.msg,
                            title: language_txt.mainIndex.notification
                        });
                        return;
                    }
                    _this.changePwd.show = false;
                    notification.success({
                        message: getLan().changePassword7,
                        title: language_txt.mainIndex.notification
                    });
                    storage.clearAll();
                    //强制退出跳转至登录页

                    setTimeout(() => {
                        global.location.href = '/main-login.html';
                    }, 3000);
                });
            }
        }),
        changePwd: avalon.define({
            $id: 'changePwd',
            show: false,
            editCancel() {
                this.show = false;
            },
            move_return_pwd(a, b) {
                $("#iframe_zfsyps").css({
                    width: "450px", //---- 这个是弹窗的宽度
                    height: "350px", //---- 这个是弹窗的高度
                    left: a,
                    top: b
                });
            }
        }),
        //我的二维码
        qrCodeVm: avalon.define({
            $id: 'qrCodeVm',
            qrCodeShow: false,
            qrCodeCancel() {
                this.qrCodeShow = false;
            },
            move_return_qrCode(a, b) {
                // console.log(a);
                // console.log(b);
                // $("#iframe_zfsyps").css({
                //     width: "450px", //---- 这个是弹窗的宽度
                //     height: "350px", //---- 这个是弹窗的高度
                //     left: a,
                //     top: b
                // });
            }
        }),
        qrCode: avalon.define({
            $id: 'qrCode',
            title: language_txt.mainIndex.qrCode,
            myCodeName: storage.getItem('userName') + '(' + storage.getItem('orgCode') + ')',
            myCodeOrg: storage.getItem('orgName'),
            result_list: [],
            result_list_click(index) {
                $(".qrCodeDialog .comparison_result .result_li").removeClass("listActive");
                $(".qrCodeDialog .comparison_result .result_li:eq(" + index + ")").addClass("listActive");

                this.qrCodeTxtObj = this.result_list[index];
            },
            qrCodeTxtObj: {},
            qrCodeTxt: language_txt.mainIndex
        }),
        //退出登录
        logout_vm: avalon.define({
            $id: 'logout_vm',
            show_logout: false,
            cancelLogout(e) {
                this.show_logout = false;
            },
            handleLogout() {
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

                    // notification.success({
                    //     message: '退出系统成功！',
                    //     title: '温馨提示'
                    // });
                    this.show_logout = false;
                    storage.clearAll();
                    setTimeout(() => {
                        global.location.href = '/main-login.html';
                    }, 0);
                });
            },
            move_return_logout(a, b) {
                $("#iframe_zfsyps").css({
                    width: "450px", //---- 这个是弹窗的宽度
                    height: "195px", //---- 这个是弹窗的高度
                    left: a,
                    top: b
                });
            }
        }),
        logout: avalon.define({
            $id: 'logout',
            title: getLan().logoutTitle,
            logoutMsg: getLan().logoutMsg,
            btn: {
                confirm: getLan().logoutSubmit,
                cancel: getLan().cancel
            },
            //实时指挥系统由于ocx会遮盖弹窗，所以重新定义了footer，以下两个事件用于footer的按钮
            handleLogout() {
                let _this = msHeaderOperation.defaults;
                let logout_vm = _this.logout_vm;
                logout_vm.handleLogout();
            },
            cancelLogout() {
                let _this = msHeaderOperation.defaults;
                let logout_vm = _this.logout_vm;
                logout_vm.cancelLogout();
            }
        }),
        onInit: function (event) {
            let _this = this;
            // 检测修改密码弹窗打开和关闭
            this.changePwd.$watch('show', v => {
                let iframeObj = document.getElementsByTagName('iframe');
                if (v) {
                    if (!$('.modal-dialog').hasClass('edit-pwd')) {
                        $('.modal-dialog').addClass('edit-pwd');
                        $('.modal-content').addClass('editPwdDraggable');
                    }
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.hide_player();
                    //     } catch (e) {}
                    // }
                } else {
                    $("#iframe_zfsyps").hide();
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.show_player();
                    //     } catch (e) {}
                    // }
                    this.change_Pwd.oldPwd_tips_error = false;
                    this.change_Pwd.newPwd_tips_error = false;
                    this.change_Pwd.repPwd_tips_error = false;
                    this.change_Pwd.oldPwd_tips_text = '';
                    this.change_Pwd.newPwd_tips_text = '';
                    this.change_Pwd.repPwd_tips_text = '';
                }
            });
            // 检测退出登录弹窗弹窗打开和关闭
            this.logout_vm.$watch('show_logout', v => {
                let iframeObj = document.getElementsByTagName('iframe');
                if (v) {
                    if (!$('.modal-dialog').hasClass('logout_vm')) {
                        $('.modal-dialog').addClass('logout_vm');
                        $('.modal-content').addClass('changePwdDraggable');
                    }
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.hide_player();
                    //     } catch (e) {}
                    // }
                } else {
                    $("#iframe_zfsyps").hide();
                    // for (let i in iframeObj) {
                    //     try {
                    //         iframeObj[i].contentWindow.show_player();
                    //     } catch (e) {}
                    // }
                }
            });

            // 监听二维码弹窗的显示与隐藏
            this.qrCodeVm.$watch('qrCodeShow', v => {
                if (v) {
                    ajax({
                        // url: '/api/getQrCode',
                        url: '/gmvcs/uom/device/dsj/qrcode/userbinding?userCode=' + storage.getItem("userCode"),
                        method: 'get',
                        data: {}
                    }).then(ret => {
                        // console.log(ret);
                        let resultArr = [];
                        avalon.each(ret.data, function (index, item) {
                            let obj = {
                                index: index,
                                txt: index + 1,
                                qrcode: "data:image/jpeg;base64," + item.qrcode,
                                name: item.devName,
                                model: item.model,
                                type: item.typeName,
                                number: item.gbcode
                            }
                            resultArr.push(obj);
                        });
                        _this.qrCode.result_list = resultArr;
                        _this.qrCode.qrCodeTxtObj = resultArr[0];
                        $(".qrCodeDialog .comparison_result .result_li:eq(0)").addClass("listActive");
                    });

                } else {

                }
            });
        },
        onReady: function (event) {},
        onDispose: function (event) {}
    }
});

function getLan() {
    return language_txt.sszhxt.main;
}