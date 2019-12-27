import ajax from '/services/ajaxService.js';
import {
    createForm,
    notification
} from "ane";
import 'ane';
import {
    languageSelect
} from '/services/configService';
var storage = require('/services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;

//退出登录
// var logout_vm = avalon.define({
//     $id: 'logout_vm',
//     show_logout: false,
//     cancelLogout(e) {
//         this.show_logout = false;
//     },
//     handleLogout() {
//         ajax({
//             url: '/gmvcs/uap/cas/logout',
//             method: 'get',
//             data: {}
//         }).then(data => {
//             if (0 !== data.code) {
//                 notification.warn({
//                     message: data.msg,
//                     title: '温馨提示'
//                 });
//                 return;
//             }

//             // notification.success({
//             //     message: '退出系统成功！',
//             //     title: '温馨提示'
//             // });
//             this.show_logout = false;
//             storage.clearAll();
//             setTimeout(() => {
//                 global.location.href = './main-login.html';
//             }, 0);
//         });
//     }
// });

//系统设置
var setting = avalon.define({
    $id: 'setting',
    toggle: false,
    extra_class: languageSelect == "en" ? true : false,
    language: language_txt.sszhxt.main,
    setting_click() {
        this.toggle = !this.toggle;
    },
    help_click(e) {
        help_vm.show = true;
    },
    bindModify() {
        // change_pwd_vm.show = true;
        // editPassword.show = true;
        avalon.components['ms-header-operation'].defaults.changePwd.show = true;
    },
    bindLogout() {
        // logout_vm.show_logout = true;
        avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
        // if(!$('.modal-dialog').hasClass('logout_vm')){
        //     $('.modal-dialog').addClass('logout_vm');
        //     $('.modal-content').addClass('changePwdDraggable');
        // }
    },
    showSet() {
        this.toggle = true;
    },
    hideSet() {
        this.toggle = false;
    },
    toMain_index() {
        global.location.href = '/';
    }
});

var help_vm = avalon.define({
    $id: 'help_vm',
    cancelText: '关闭',
    show: false,
    extraClass: 'help-dialog',
    $innerVm: avalon.define({
        $id: 'help_inner_vm',
        title: '帮助',
        helpMsg: '暂无信息',
        handleClose() {
            help_vm.show = false;
        }
    }),
    handleCancle() {
        this.show = false;
    }
});

// var logout = avalon.define({
//     $id: 'logout',
//     title: '退出登录',
//     logoutMsg: '您确定要退出登录吗？',
//     //实时指挥系统由于ocx会遮盖弹窗，所以重新定义了footer，以下两个事件用于footer的按钮
//     handleLogout(){
//         logout_vm.handleLogout();
//     },
//     cancelLogout(){
//         logout_vm.cancelLogout();
//     }
// });


//统一运维管理平台下修改密码（按照统一认证管理那样写在IE下修改密码弹窗内为blank）
// const editPwdVm = avalon.define({
//     $id: 'edit-pwd-vm',
//     show: false,
//     $innerVm: avalon.define({
//         $id: 'edit-pwd-innerVm',
//         title: '修改密码'
//     }),
//     handleCancel(e) {
//         this.show = false;
//     },
//     //保存修改后的密码操作
//     handleOk() {
//         var pwdText = pwdForm[1];
//         if (pwdText.oldPwd.value == '') {
//             notification.warn({
//                 message: '请输入原密码！',
//                 title: '温馨提示'
//             });
//             return;
//         };
//         if (pwdText.newPwd.value == '') {
//             notification.warn({
//                 message: '请输入新密码！',
//                 title: '温馨提示'
//             });
//             return;
//         };
//         if (pwdText.newPwd.value != pwdText.repPwd.value) {
//             notification.warn({
//                 message: '您两次输入的密码不同，请重新输入！',
//                 title: '温馨提示'
//             });
//             return;
//         };
//         // if (pwdText.old_pwd == pwdText.rep_pwd) {
//         //     notification.warn({
//         //         message: '修改密码不能一致！',
//         //         title: '温馨提示'
//         //     });
//         //     return;
//         // };

//         ajax({
//             url: '/gmvcs/uap/user/changPassword',
//             method: 'post',
//             data: {
//                 "newPassword": pwdText.newPwd.value,
//                 "oldPassword": pwdText.oldPwd.value
//             }
//         }).then(data => {
//             if (0 != data.code) {
//                 notification.error({
//                     message: data.msg,
//                     title: '温馨提示'
//                 });
//                 return;
//             }
//             this.show = false;
//             notification.success({
//                 message: '修改密码成功,请您重新登录！',
//                 title: '温馨提示'
//             });
//             storage.clearAll();
//             //强制退出跳转至登录页
//             setTimeout(() => {
//                 global.location.href = '/main-login.html';
//             }, 3000);
//         });
//     }
// });

//显示当前用户名和角色名
// try {
//     var user_name = storage.getItem('user_name');
//     var role_name = storage.getItem('role_name');
//     if(user_name != null && user_name != '' && role_name != null && role_name != '') {
//         xtsz.role = user_name + '（' + role_name + '）';
//     } else { //无登录信息时退出并跳转登录页
//         storage.clearAll();
//         global.location.href = './main-login';
//     }
// } catch(e) {
//     //无本地存储或cookie时退出并跳转登录页
//     storage.clearAll();
//     global.location.href = './main-login';
// }