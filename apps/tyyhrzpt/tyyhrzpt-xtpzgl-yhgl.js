import 'jquery';
import ajax from '../../services/ajaxService.js';
import {
    createForm,
    notification
} from "ane";
import {
    apiUrl,
    accountType,
    languageSelect
} from '../../services/configService';
import * as menuServer from '../../services/menuService';
require('/apps/common/common-ajax-fileupload');

let language_txt = require('../../vendor/language').language;

export const name = 'tyyhrzpt-xtpzgl-yhgl';
require('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-yhgl.css');
require.async('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-yhgl-yhtc');
let storage = require('/services/storageService.js').ret;
let yhjs_uid = storage.getItem('uid');
let j = 0;

avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-yhgl.html'),
    defaults: {
        yhgl_txt: language_txt.xtpzgl.yhgl,
        extra_class: languageSelect == "en" ? true : false,
        dialog_width: languageSelect == "en" ? 860 : 690,

        yhgl_depCode: '', //部门编码
        //yhgl_depId: '', //部门id
        yhgl_subOrg: false, //是否包括子部门
        yhgl_job: '', //岗位名称
        policeKey: '', //警号/姓名
        LoginMgrScopes: [], //当前登录用户的管理范围

        //定义保存user弹窗的初始值变量的对象
        userStepObject: {},
        //查询导航栏包括子部门选择框src
        check_src: '/static/image/xtpzgl-yhgl/selectNo.png?__sprite',
        //input清除内容函数
        yhgl_handleClear(val) {
            switch (val) {
                case 'policeKey':
                    this.policeKey = '';
                    $(".userStep1-left input[name='policeKey']").focus();
                    return false;
                    break;
            }
        },
        policeKeyShowX: false,
        policeKey_blur() { //姓名、警号框光标失去
            this.policeKeyShowX = false;
        },
        policeKey_focus() { //光标获取
            this.policeKeyShowX = true;
        },
        //部门树绑定
        vm_tree_yhglSearch_dep: avalon.define({
            $id: "yhgl-search-dep",
            //expandedKeys:[],
            dataTree: [],
            yhgl_depName: '', //选择的部门名称
            yhgl_depId: '', //选择部门id
            // handleCheck(checkedKeys) {
            //     //console.log(checkedKeys);
            // },
            // selectfuc(event) {
            //     avalon['components'][name]['defaults'].yhgl_depCode = event.target.value;
            //     avalon['components'][name]['defaults'].yhgl_depId = event.target.selection.orgId;
            //     //console.log(avalon['components'][name]['defaults']['aqsjGlxtrz_depCode']);
            // },
            getSelected(key, title, node) {
                avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depId = key;
                avalon['components'][name]['defaults'].yhgl_depCode = node.orgCode;
                avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depName = title;
            },
            handleTreeChange(e, selectedKeys) {
                // this.orgId = e.node.orgId;
                // this.orgPath = e.node.path;
                avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depId = e.node.orgId;
                avalon['components'][name]['defaults'].yhgl_depCode = e.node.orgCode;
            },
            extraExpandHandle: function (treeId, treeNode) {
                yhgl_getOrgbyExpand(treeNode).then((ret) => {
                    if (ret.code == 0) {
                        $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, yhglDepTree(ret.data));
                        return;
                    }

                });
            },
            //depName: []
        }),

        //岗位列表下拉框
        vm_search_job: avalon.define({
            $id: 'yhgl-search-job',
            selValue: [],
            options: [],
            halderChange(event) {
                avalon['components'][name]['defaults'].yhgl_job = event.target.value;
            }
        }),

        // 新增用户弹窗
        vm_yhgl_addUser: avalon.define({
            $id: 'yhgl-addUser',
            show: false,
            handleCancel(e) {
                this.show = false;
                avalon['components'][name]['defaults']['vm_yhgl_addUserVm'].yhgl_addUserDialog = '';
            },
            handleOk() {
                this.show = false;
            }
        }),
        vm_yhgl_addUserVm: avalon.define({
            $id: 'yhgl-addUserVm',
            title: language_txt.xtpzgl.yhgl.addUser,
            AddParams: {}, //保存从第一步传过来的值
            yhgl_addUserDialog: '',
            yhgl_addUser_footerHtml: '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>',
            handleOk() { //下一步
                let userStep_data = avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep_data;

                this.AddParams = {
                    'userName': userStep_data.userName, //姓名
                    'idCard': userStep_data.userID, //身份证
                    'userCode': userStep_data.userPoliceNum, //警号
                    'account': userStep_data.userNum, //账号
                    'gender': userStep_data.userSex || 'male', //性别 ['male', 'female'],
                    'password': userStep_data.userPsw, //密码
                    'userType': userStep_data.yhlx_select || 'terminal', //用户类型['terminal', 'backend']
                    'org': {
                        'orgId': userStep_data.dep_code || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_dep_tree'].yhtc_depId
                    }, //所属部门编号userStep_data.dep_code
                    'policeType': {
                        "typeCode": userStep_data.policeType_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_policeType_select'].selValue[0]
                    }, //警员类别代号
                    'jobType': {
                        'code': userStep_data.job_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_job_select'].selValue[0]
                    }, //岗位名称
                    'mobelPhone': userStep_data.userMPhone, //手机
                    'email': userStep_data.userEmail, //电子邮箱
                    'accountType': userStep_data.userNumType || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_numRadio'].num_value, //账号类型['permanent', 'temporary'],
                    'expirationDate': userStep_data.userOutTime, //过期时间
                    'roles': [{
                        'id': userStep_data.role_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].selValue[0]
                    }], //用户角色
                    'mgrScopes': [],
                    "deleted": false,
                    "enable": false,
                    "repeatLogin": false,
                    "loginStatus": false
                };

                let yhgl_yhtc = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'];
                if (!this.AddParams.userName) { //姓名为空
                    yhgl_yhtc.userStep1_left.name_isNull = 'inline-block';
                    return;
                } else {
                    let reg_name = /[^a-zA-Z0-9\u4e00-\u9fa5]/;
                    if (reg_name.test(this.AddParams.userName)) { //姓名格式错误
                        yhgl_yhtc.userStep1_left.name_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.name_isTrue_html = language_txt.xtpzgl.yhgl.nameFormat;
                        return;
                    } else if (this.AddParams.userName.toString().length > 20) {
                        yhgl_yhtc.userStep1_left.name_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.name_isTrue_html = language_txt.xtpzgl.yhgl.nameMore;
                        return;
                    }
                }

                if (!this.AddParams.idCard) { //身份证为空
                    // yhgl_yhtc.userStep1_right.idCard_isNull = 'inline-block';
                    // return;
                } else {
                    let reg_idCard = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
                    if (!reg_idCard.test(this.AddParams.idCard)) { //身份证格式错误
                        yhgl_yhtc.userStep1_right.idCard_isTrue = 'inline-block';
                        return;
                    }
                }

                if (!this.AddParams.userCode) { //警号为空
                    yhgl_yhtc.userStep1_left.policeNum_isNull = 'inline-block';
                    return;
                } else {
                    if (this.AddParams.userCode.toString().length > 22) {
                        yhgl_yhtc.userStep1_left.policeNum_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.policeNum_isTrue_html = '警号不能超过22位字符';
                        return;
                    } else if (/[\u4e00-\u9fa5]/.test(this.AddParams.userCode)) {
                        yhgl_yhtc.userStep1_left.policeNum_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.policeNum_isTrue_html = '此警号不支持中文输入';
                        return;
                    }
                    if (yhgl_yhtc.userStep1_left.policeNum_check === 'inline-block') { //警号唯一
                        return;
                    }
                }

                if (!this.AddParams.account) { //账号为空
                    yhgl_yhtc.userStep1_right.num_isNull = 'inline-block';
                    return;
                } else {
                    let reg_account = /[^a-zA-Z0-9]/;
                    if (this.AddParams.account.toString().length > 13) { //账号超过13位
                        yhgl_yhtc.userStep1_right.num_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_right.num_isTrue_html = '不能超过13位';
                        return;
                    } else if (reg_account.test(this.AddParams.account)) { //账号格式错误
                        yhgl_yhtc.userStep1_right.num_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_right.num_isTrue_html = '请输入正确的账号';
                        return;
                    }
                }

                if (!this.AddParams.password) { //密码为空
                    yhgl_yhtc.userStep1_right.psw_isNull = 'inline-block';
                    return;
                } else {
                    let reg_password = /[^\u4e00-\u9fa5]{6,}$/;
                    if (this.AddParams.password.toString().length < 6) { //密码6位或者6位以上
                        yhgl_yhtc.userStep1_right.psw_isTrue = 'inline-block';
                        return;
                    }
                    if (!reg_password.test(this.AddParams.password)) { //密码格式错误
                        yhgl_yhtc.userStep1_right.psw_isTrue = 'inline-block';
                        return;
                    }
                }

                if (!this.AddParams.org) { //所属部门
                    notification.error({
                        message: "请选择所属部门！",
                        title: "温馨提示"
                    });
                    return;
                }

                if (!this.AddParams.userType) { //用户类型
                    notification.error({
                        message: "请选择用户类型！",
                        title: "温馨提示"
                    });
                    return;
                }

                // if (!this.AddParams.policeType) { //警员类别
                //     notification.error({
                //         message: "请选择警员类别！",
                //         title: "温馨提示"
                //     });
                //     return;
                // }

                // if (!this.AddParams.jobType.code) { //岗位名称
                //     notification.error({
                //         message: "请选择岗位名称！",
                //         title: "温馨提示"
                //     });
                //     return;
                // }

                if (!this.AddParams.roles[0].id) { //用户角色
                    notification.error({
                        message: "请选择用户角色！",
                        title: "温馨提示"
                    });
                    return;
                }

                if (this.AddParams.email) {
                    let reg_email = /^.+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                    if (!reg_email.test(this.AddParams.email)) { //邮箱
                        yhgl_yhtc.userStep1_right.email_isTrue = 'inline-block';
                        return;
                    }
                }

                if (this.AddParams.mobelPhone) {
                    if (!(/^1(2|3|4|5|7|8)\d{9}$/.test(this.AddParams.mobelPhone))) { //手机
                        yhgl_yhtc.userStep1_left.mPhone_isTrue = 'inline-block';
                        return;
                    }
                }

                if ("temporary" == this.AddParams.accountType) {
                    if ((!this.AddParams.expirationDate) || ("isNull" == this.AddParams.expirationDate)) { //有效时间为空
                        yhgl_yhtc.userStep1_right.time_isNull = 'inline-block';
                        return;
                    }
                } else {
                    this.AddParams.expirationDate = ''; //永久用户时有效时间置为空
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value = '';
                }

                ajax({ //检验身份证、账户是否已存在
                    url: '/gmvcs/uap/user/check',
                    method: 'post',
                    data: {
                        'idCard': this.AddParams.idCard, //身份证
                        'account': this.AddParams.account, //账号
                    }
                }).then(result => {
                    if (result.code == 0) { //填写基本信息成功
                        //$('.userStep1-total').css('display', 'none');
                        // let policeTypeCode = this.AddParams.policeType.typeCode;//警员类别编号
                        // if(policeTypeCode != 'LEVAM_JYLB_LD' && policeTypeCode != 'LEVAM_JYLB_ZONGDUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHIDUI_LD' 
                        //     && policeTypeCode != 'LEVAM_JYLB_DADUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHONGDUI_LD'){
                        //     //只有内置领导才有管理范围
                        //     yhgl_yhtc.userStep2_dep_tree.checkable = false;
                        //     this.handleAddfinish();
                        // }else{
                        $('.userStep1-total').css('display', 'none');
                        $('.userStep2-total').css('display', 'block');
                        yhgl_yhtc.userStep2_dep_tree.checkable = true;
                        this.yhgl_addUser_footerHtml = '<button class="yhgl-preStep" :click="@handlePreStep">上一步</button>' +
                            '<button class="yhgl-finish" :click="@handleAddfinish">完成</button>';
                        //}
                    } else {
                        return;
                    }
                });
            },
            handleAddfinish(e) { //完成
                if (click_yhgl_add) { //防止重复操作
                    click_yhgl_add = false;
                    setTimeout(function () {
                        click_yhgl_add = true;
                    }, 2000);
                } else {
                    return;
                }

                let mgrScopes = [];
                mgrScopes = avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep_data.mgrScopes; //管理范围
                ajax({
                    url: '/gmvcs/uap/user/create',
                    method: 'post',
                    data: {
                        'userName': this.AddParams.userName, //姓名
                        'idCard': this.AddParams.idCard, //身份证
                        'userCode': this.AddParams.userCode, //警号
                        'account': this.AddParams.account, //账号
                        'gender': this.AddParams.gender, //性别 ['male', 'female'],
                        'password': this.AddParams.password, //密码
                        'userType': this.AddParams.userType, //用户类型['terminal', 'backend']
                        'org': {
                            'orgId': this.AddParams.org.orgId
                        }, //所属部门编号userStep_data.dep_code
                        'policeType': this.AddParams.policeType.typeCode ? {
                            'code': this.AddParams.policeType.typeCode
                        } : null, //警员类别代号
                        'jobType': this.AddParams.jobType.code ? {
                            'code': this.AddParams.jobType.code
                        } : null, //岗位名称
                        'mobelPhone': this.AddParams.mobelPhone, //手机
                        'email': this.AddParams.email, //电子邮箱
                        'accountType': this.AddParams.accountType, //账号类型['permanent', 'temporary'],
                        'expirationDate': this.AddParams.expirationDate, //过期时间
                        'roles': [{
                            'id': this.AddParams.roles[0].id
                        }], //用户角色
                        'mgrScopes': mgrScopes,
                        "deleted": false,
                        "enable": false,
                        "repeatLogin": false,
                        "loginStatus": false
                    }
                }).then(result => {
                    if (result.code == 0) {
                        notification.success({
                            message: "恭喜您新增用户成功！",
                            title: "温馨提示"
                        });
                        avalon['components'][name]['defaults'].yhgl_searchFnc();
                        avalon['components'][name]['defaults']['vm_yhgl_addUser']['show'] = false;
                        $('.userStep2-total').css('display', 'none');
                        $('.userStep1-total').css('display', 'block');
                        this.yhgl_addUserDialog = '';
                    } else {
                        notification.error({
                            message: result.msg,
                            title: "温馨提示"
                        });
                        return;
                    }
                });
            },
            handlePreStep() { //处理上一步
                $('.userStep2-total').css('display', 'none');
                $('.userStep1-total').css('display', 'block');
                this.yhgl_addUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>';
            }
        }),

        // 编辑用户弹窗
        vm_yhgl_editUserVm: avalon.define({
            $id: 'yhgl-editUserVm',
            title: '编辑用户',
            editParams: {}, //保存编辑内容的对象
            uid: '', //用来保存编辑用户的用户id
            mgrEor: false,
            yhgl_editUserDialog: '',
            yhgl_editUser_footerHtml: '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>',
            handleOk() { //下一步
                let userStep_data = avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep_data;
                this.editParams = {
                    'userName': userStep_data.userName, //姓名
                    'idCard': userStep_data.userID, //身份证
                    'userCode': userStep_data.userPoliceNum, //警号
                    'account': userStep_data.userNum, //账号
                    'password': userStep_data.userPsw, //密码
                    'gender': userStep_data.userSex || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_sexRadio'].sex_value, //性别 ['male', 'female'],
                    'org': {
                        'orgId': userStep_data.dep_code || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_dep_tree'].yhtc_depId
                    }, //所属部门编号
                    'userType': userStep_data.yhlx_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_yhlx_select'].selValue[0], //用户类型['terminal', 'backend']
                    'policeType': {
                        "typeCode": userStep_data.policeType_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_policeType_select'].selValue[0]
                    }, //警员类别代号
                    'accountType': userStep_data.userNumType || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_numRadio'].num_value, //账号类型['permanent', 'temporary'],
                    'expirationDate': userStep_data.userOutTime || new Date(avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value).getTime(), //过期时间
                    'jobType': {
                        'code': userStep_data.job_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_job_select'].selValue[0]
                    }, //岗位名称
                    'roles': [{
                        'id': userStep_data.role_select || avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].selValue[0]
                    }], //用户角色
                    'mobelPhone': userStep_data.userMPhone, //手机
                    'email': userStep_data.userEmail, //电子邮箱
                    "deleted": false,
                    "enable": false,
                    "repeatLogin": false,
                    "loginStatus": false
                };

                let yhgl_yhtc = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'];
                if (!this.editParams.userName) { //姓名为空
                    yhgl_yhtc.userStep1_left.name_isNull = 'inline-block';
                    return;
                } else {
                    let reg_name = /[^a-zA-Z0-9\u4e00-\u9fa5]/;
                    if (reg_name.test(this.editParams.userName)) { //姓名格式错误
                        yhgl_yhtc.userStep1_left.name_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.name_isTrue_html = language_txt.xtpzgl.yhgl.nameFormat;
                        return;
                    } else if (this.editParams.userName.toString().length > 20) {
                        yhgl_yhtc.userStep1_left.name_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.name_isTrue_html = language_txt.xtpzgl.yhgl.nameMore;
                        return;
                    }
                }

                if (!this.editParams.idCard) { //身份证为空
                    // yhgl_yhtc.userStep1_right.idCard_isNull = 'inline-block';
                    // return;
                } else {
                    let reg_idCard = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
                    if (!reg_idCard.test(this.editParams.idCard)) { //身份证格式错误
                        yhgl_yhtc.userStep1_right.idCard_isTrue = 'inline-block';
                        return;
                    }
                }

                if (!this.editParams.userCode) { //警号为空
                    yhgl_yhtc.userStep1_left.policeNum_isNull = 'inline-block';
                    return;
                } else {
                    if (this.editParams.userCode.toString().length > 22) {
                        yhgl_yhtc.userStep1_left.policeNum_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.policeNum_isTrue_html = '警号不能超过22位字符';
                        return;
                    } else if (/[\u4e00-\u9fa5]/.test(this.editParams.userCode)) {
                        yhgl_yhtc.userStep1_left.policeNum_isTrue = 'inline-block';
                        yhgl_yhtc.userStep1_left.policeNum_isTrue_html = '此警号不支持中文输入';
                        return;
                    }
                    if (yhgl_yhtc.userStep1_left.policeNum_check === 'inline-block') { //警号唯一
                        return;
                    }
                }

                if (!this.editParams.account) { //账号为空
                    yhgl_yhtc.userStep1_right.num_isNull = 'inline-block';
                    return;
                }
                // else{
                //     let reg_account = /[^a-zA-Z0-9]/;
                //     if(this.editParams.account.toString().length > 13){//账号超过13位
                //         yhgl_yhtc.userStep1_right.num_isTrue = 'inline-block';
                //         yhgl_yhtc.userStep1_right.num_isTrue_html = '不能超过13位';
                //         return;
                //     } else if(reg_account.test(this.editParams.account)){//账号格式错误
                //         yhgl_yhtc.userStep1_right.num_isTrue = 'inline-block';
                //         yhgl_yhtc.userStep1_right.num_isTrue_html = '请输入正确的账号';
                //         return;
                //     }
                // }

                if (!this.editParams.password) { //密码为空
                    yhgl_yhtc.userStep1_right.psw_isNull = 'inline-block';
                    return;
                } else {
                    let reg_password = /[^\u4e00-\u9fa5]{6,}$/;
                    if (this.editParams.password.toString().length < 6) { //密码少于6位
                        yhgl_yhtc.userStep1_right.psw_isTrue = 'inline-block';
                        return;
                    }
                    if (!reg_password.test(this.editParams.password)) { //密码格式错误
                        yhgl_yhtc.userStep1_right.psw_isTrue = 'inline-block';
                        return;
                    }
                }

                if (!this.editParams.org.orgId) {
                    notification.error({
                        message: "请选择所属部门！",
                        title: "温馨提示"
                    });
                    return;
                }
                if (!this.editParams.userType) {
                    notification.error({
                        message: "请选择用户类型！",
                        title: "温馨提示"
                    });
                    return;
                }
                if (!this.editParams.roles[0].id) { //用户角色
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].userStep1_left.role_isNull = true;
                    return;
                }
                // if (!this.editParams.jobType.code) {//岗位名称
                //     avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].userStep1_right.job_isNull = true;
                //     return;
                // }
                // if (!this.editParams.policeType.typeCode) {//警员类别
                //     avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].userStep1_right.policeType_isNull = true;
                //     return;
                // }

                if (this.editParams.email) {
                    let reg_email = /^.+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                    if (!reg_email.test(this.editParams.email)) { //邮箱
                        yhgl_yhtc.userStep1_right.email_isTrue = 'inline-block';
                        return;
                    }
                }
                if (this.editParams.mobelPhone) {
                    if (!(/^1(2|3|4|5|7|8)\d{9}$/.test(this.editParams.mobelPhone))) { //手机
                        yhgl_yhtc.userStep1_left.mPhone_isTrue = 'inline-block';
                        return;
                    }
                }
                if ("temporary" == this.editParams.accountType) { //临时用户有效时间不能为空
                    if ((!this.editParams.expirationDate) || ("isNull" == this.editParams.expirationDate)) {
                        yhgl_yhtc.userStep1_right.time_isNull = 'inline-block';
                        return;
                    }
                } else {
                    this.editParams.expirationDate = ''; //永久用户时有效时间置为空
                    //avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].cache_time = '';
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value = '';
                }

                let each_flag = false;
                $('.userStep1-cont .form-inline .has-feedback').each(function (key, value) {
                    if ($(this).attr('change-class') == " has-error") {
                        notification.error({
                            message: "请输入对应的值！",
                            title: "温馨提示"
                        });
                        each_flag = true;
                        return false;
                    }
                });
                if (each_flag) {
                    return;
                }

                ajax({ //检验身份证、账户是否已存在
                    url: '/gmvcs/uap/user/check',
                    method: 'post',
                    data: {
                        'idCard': this.editParams.idCard, //身份证
                        //'account': this.editParams.account, //账号
                        'uid': avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].uid
                    }
                }).then(result => {
                    if (result.code == 0) { //填写基本信息成功
                        // let policeTypeCode = this.editParams.policeType.typeCode;//警员类别编号
                        // if(policeTypeCode != 'LEVAM_JYLB_LD' && policeTypeCode != 'LEVAM_JYLB_ZONGDUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHIDUI_LD' 
                        //     && policeTypeCode != 'LEVAM_JYLB_DADUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHONGDUI_LD'){
                        //     //只有内置领导管理范围
                        //     yhgl_yhtc.userStep2_dep_tree.checkable = false;
                        //     this.handleEditfinish();
                        // }else{
                        $('.userStep1-total').css('display', 'none');
                        $('.userStep2-total').css('display', 'block');
                        yhgl_yhtc.userStep2_dep_tree.checkable = true;
                        this.yhgl_editUser_footerHtml = '<div :if="@mgrEor" class="mgrEor">*注意：当前用户没有权限操作该用户管理范围</div>' + '<button class="yhgl-preStep" :click="@handlePreStep">上一步</button>' +
                            '<button class="yhgl-finish" :click="@handleEditfinish">完成</button>';
                        // }
                    } else {
                        yhgl_yhtc.userStep1_right.idCard_check = 'inline-block';
                        return;
                    }
                });
            },
            handleEditfinish() { //编辑完成

                if (click_yhgl_edit_sure) { //防止重复操作
                    click_yhgl_edit_sure = false;
                    setTimeout(function () {
                        click_yhgl_edit_sure = true;
                    }, 2000);
                } else {
                    return;
                }

                let userStep_data = avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep_data;
                let uid = avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].uid; //用户id

                let editMgrScopes = []; //管理范围
                if (!avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].userStep2_dep_tree.markOpt) {
                    let arrMgrScopes = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].mgrScopesDefault;
                    //let arrMgrScopes = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].checkedKeys;
                    //let checkedCode = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].checkedCode;
                    for (let i = 0; i < arrMgrScopes.length; i++) {
                        editMgrScopes[i] = new Object();
                        editMgrScopes[i].orgId = arrMgrScopes[i];
                        //editMgrScopes[i].orgCode = checkedCode[i];
                    }
                } else {
                    for (let i = 0; i < userStep_data.mgrScopes.length; i++) {
                        editMgrScopes[i] = new Object();
                        editMgrScopes[i].orgId = userStep_data.mgrScopes[i].orgId;
                        //editMgrScopes[i].orgCode = userStep_data.mgrScopes[i].orgCode;
                    }
                    let oneOrg = avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].userStep2_dep_tree.checkedKeys;
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].editDefault_mgrScopes.forEach(mgr => {
                        let isDiferent = true;
                        for (let i = 0; i < oneOrg.length; i++) {
                            isDiferent = true;
                            if (oneOrg[i] == mgr.orgId) {
                                isDiferent = false;
                                return false;
                            }
                        }
                        if (isDiferent) {
                            let orgId = {
                                'orgId': mgr.orgId
                            };
                            editMgrScopes.push(orgId);
                        }
                    });
                }

                let roleId = [];
                if (this.editParams.roles[0]) {
                    roleId = [{
                        'id': this.editParams.roles[0].id
                    }];
                }

                ajax({
                    url: '/gmvcs/uap/user/edit',
                    method: 'post',
                    data: {
                        'userName': this.editParams.userName, //姓名
                        'idCard': this.editParams.idCard, //身份证
                        'userCode': this.editParams.userCode, //警号
                        'account': this.editParams.account, //账号
                        'gender': this.editParams.gender, //性别 ['male', 'female'],
                        'password': this.editParams.password, //密码
                        'org': {
                            'orgId': this.editParams.org.orgId
                        }, //所属部门编号
                        'userType': this.editParams.userType, //用户类型['terminal', 'backend']
                        'policeType': this.editParams.policeType.typeCode ? {
                            'code': this.editParams.policeType.typeCode
                        } : null, //警员类别代号
                        'accountType': this.editParams.accountType, //账号类型['permanent', 'temporary'],
                        'expirationDate': this.editParams.expirationDate, //过期时间
                        'jobType': this.editParams.jobType.code ? {
                            'code': this.editParams.jobType.code
                        } : null, //岗位名称
                        'mobelPhone': this.editParams.mobelPhone, //手机
                        'email': this.editParams.email, //电子邮箱
                        'roles': roleId,
                        'mgrScopes': editMgrScopes, //管理范围
                        'uid': uid, //用户id
                        "deleted": false,
                        "enable": false,
                        "repeatLogin": false,
                        "loginStatus": false
                    }
                }).then(result => {
                    if (result.code == 0) {
                        notification.success({
                            message: "用户编辑成功！",
                            title: "温馨提示"
                        });
                        avalon['components'][name]['defaults'].yhgl_searchFnc(); //刷新数据
                        avalon['components'][name]['defaults']['vm_yhgl_editUser']['show'] = false;
                        $('.userStep2-total').css('display', 'none');
                        $('.userStep1-total').css('display', 'block');
                        this.yhgl_editUserDialog = '';
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].isEdit = false; //标志编辑状态
                    } else {
                        notification.error({
                            message: result.msg,
                            title: "温馨提示"
                        });
                        return;
                    }
                });
            },
            handlePreStep() { //处理上一步
                $('.userStep2-total').css('display', 'none');
                $('.userStep1-total').css('display', 'block');
                this.yhgl_editUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>';
            }
        }),
        vm_yhgl_editUser: avalon.define({
            $id: 'yhgl-editUser',
            show: false,
            handleCancel() {
                this.show = false;
                avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].yhgl_editUserDialog = '';
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].isEdit = false; //标志编辑状态

                //初始化
                let dialog = avalon['components'][name]['defaults'].userStepObject;
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].name_value = dialog.dialog_userName; //姓名初始化
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].policeNum_value = dialog.dialog_userCode; //警号
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].mPhone_value = dialog.dialog_mobelPhone; //手机  
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].idCard_value = dialog.dialog_idCard; //身份证
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].num_value = dialog.dialog_account; //账号
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].psw_value = dialog.dialog_password; //密码
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].email_value = dialog.dialog_email; //email
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value = dialog.dialog_expirationDate; //过期时间
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_dep_tree'].yhtc_depId = dialog.dialog_orgCode; //所属部门
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_policeType_select'].selValue = [dialog.dialog_policeTypeCode]; //警员类别
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_yhlx_select'].selValue = [dialog.dialog_userTypeL]; //用户类型
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_numRadio'].num_value = dialog.dialog_accountTypeL; //账户类型
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_sexRadio'].sex_value = dialog.dialog_genderL; //性别
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_job_select'].selValue = [dialog.dialog_job]; //岗位名称
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].selValue = [dialog.dialog_role]; //用户角色
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].checkedKeys = []; //管理范围
                avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].checkedCode = [];

            },
            handleOk() {
                this.show = false;
                avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].yhgl_editUserDialog = '';
            }
        }),

        // 管理范围设置弹窗
        vm_yhgl_mgrScopesVm: avalon.define({
            $id: 'yhgl-mgrScopesVm',
            title: '管理范围',
            uid: '',
            mgrScopes: [], //操作过程中管理范围
            yhgl_mgrScopes_footerHtml: '<button class="yhgl-nextStep" :click="@handleOk">完成</button>',
            default_mgrScopes: [],
            start_mgrScopes: [], //未经过操作的开始默认的管理范围
            mgrScopesTree: [],
            halfCheckable: true,
            expandedKeys: [],
            checkedKeys: [],
            markOpt: false, //标志是否操作了管理范围树（false默认不操作）
            mgrEor: false,
            handleOk() { //完成
                if (click_yhgl_mgrScopes_ok) { //防止重复操作
                    click_yhgl_mgrScopes_ok = false;
                    setTimeout(function () {
                        click_yhgl_mgrScopes_ok = true;
                    }, 2000);
                } else {
                    return;
                }
                let mgrScopesVm = avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'];
                let uid = avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].uid; //用户id

                let editMgrScopes = []; //管理范围
                if (!mgrScopesVm.markOpt) { //没有进行树选择操作
                    let arrMgrScopes = mgrScopesVm.start_mgrScopes;
                    for (let i = 0; i < arrMgrScopes.length; i++) {
                        editMgrScopes[i] = new Object();
                        editMgrScopes[i].orgId = arrMgrScopes[i].orgId;
                        //editMgrScopes[i].orgCode = checkedCode[i];
                    }
                } else {
                    for (let i = 0; i < mgrScopesVm.mgrScopes.length; i++) {
                        editMgrScopes[i] = new Object();
                        editMgrScopes[i].orgId = mgrScopesVm.mgrScopes[i].orgId;
                        //editMgrScopes[i].orgCode = userStep_data.mgrScopes[i].orgCode;
                    }
                    let oneOrg = mgrScopesVm.checkedKeys;
                    mgrScopesVm.default_mgrScopes.forEach(mgr => {
                        let isDiferent = true;
                        for (let i = 0; i < oneOrg.length; i++) {
                            isDiferent = true;
                            if (oneOrg[i] == mgr.orgId) {
                                isDiferent = false;
                                return false;
                            }
                        }
                        if (isDiferent) {
                            let orgId = {
                                'orgId': mgr.orgId
                            };
                            editMgrScopes.push(orgId);
                        }
                    });
                }
                ajax({
                    url: '/gmvcs/uap/user/edit/mgrscopes',
                    method: 'post',
                    data: {
                        'mgrScopes': editMgrScopes, //管理范围
                        'uid': uid, //用户id
                    }
                }).then(result => {
                    if (result.code == 0) {
                        notification.success({
                            message: "管理范围设置成功！",
                            title: "温馨提示"
                        });
                        avalon['components'][name]['defaults'].yhgl_searchFnc(); //刷新数据
                        avalon['components'][name]['defaults']['vm_yhgl_mgrScopes'].show = false;
                    } else {
                        notification.error({
                            message: result.msg,
                            title: "温馨提示"
                        });
                        return;
                    }
                });
            },
            handleCheck(checkedKeys, event) {
                let arrKeys = [];
                for (let i = 0; i < event.checkedNodes.length; i++) {
                    arrKeys[i] = new Object();
                    arrKeys[i].orgId = event.checkedNodes[i].key;
                }
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].markOpt = true;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].mgrScopes = arrKeys;

                if (event.node.isFlag) { //编辑状态下
                    let path = event.node.path;
                    let mgrScopes = [];
                    avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].default_mgrScopes.forEach(mgr => {
                        if (mgr.path.indexOf(path) == -1) { //没有找到，代表不是在当前操作节点的子节点下
                            mgrScopes.push(mgr);
                        }
                    });
                    avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].default_mgrScopes = mgrScopes;
                    let node = event.node;
                    node.isFlag = false;
                    $.fn.zTree.getZTreeObj(event.event.currentTarget.id).updateNode(node);
                }
            },
            beforeExpand(treeId, treeNode) {
                if (treeNode.children && treeNode.children.length > 0) return; //表示节点加过数据，不重复添加
                yhglManage_getOrgbyExpand(treeNode).then((ret) => {
                    if (ret.code == 0) {
                        $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, mgrScopesSetDepTree(ret.data, mgrscopesOpt));
                        let mgrScopes = [];
                        avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].default_mgrScopes.forEach(mgr => {
                            let node = $.fn.zTree.getZTreeObj(treeId).getNodeByParam("key", mgr.orgId, treeNode);
                            if (!node) { //目前树结构中不存在的管理范围节点
                                mgrScopes.push(mgr);
                            }
                        });
                        avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].default_mgrScopes = mgrScopes;
                        return;
                    }

                });
            }
        }),
        vm_yhgl_mgrScopes: avalon.define({
            $id: 'yhgl-mgrScopes',
            show: false,
            handleCancel() {
                this.show = false;
            },
            handleOk() {
                this.show = false;
            }
        }),

        // 删除用户弹窗
        vm_yhgl_deleteUserVm: avalon.define({
            $id: 'yhgl-deleteUserVm',
            title: '确定删除',
            deleteUser: [], //删除的用户信息
            yhgl_deleteUserCont: '', //删除的用户显示信息
            handleOk() {
                if (click_yhgl_delete_sure) { //防止重复操作
                    click_yhgl_delete_sure = false;
                    setTimeout(function () {
                        click_yhgl_delete_sure = true;
                    }, 2000);
                } else {
                    return;
                }

                if (avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.length == 0) {
                    notification.error({
                        message: "没有选中删除用户，导致删除失败！",
                        title: "温馨提示"
                    });
                } else if (avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.length == 1) {
                    deleteUser(avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser[0].uid); //删除单个用户
                } else if (avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.length > 1) {
                    deleteUserDb(avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser); //删除多个用户
                }
                avalon['components'][name]['defaults']['vm_yhgl_deleteUser']['show'] = false;

            },
            handleCancel() {
                avalon['components'][name]['defaults']['vm_yhgl_deleteUser']['show'] = false;
            }
        }),
        vm_yhgl_deleteUser: avalon.define({
            $id: 'yhgl-deleteUser',
            show: false,
            handleOk() {
                this.show = false;
            },
            handleCancel() {
                this.show = false;
            }
        }),

        //导入用户弹窗
        yhgl_importUserVm: avalon.define({
            $id: 'yhgl-importUserVm',
            title: '导入用户',
            yhgl_importUserUrl: '请选择导入文件路径',
            yhgl_importUserBtn(e) {
                this.yhgl_importUserUrl = e.target.value;
            }
        }),
        yhgl_importUser: avalon.define({
            $id: 'yhgl-importUser',
            show: false,
            //className: 'yhgl-importUser',
            handleOk() {
                if (click_yhgl_import_sure) { //防止重复操作
                    click_yhgl_import_sure = false;
                    setTimeout(function () {
                        click_yhgl_import_sure = true;
                    }, 2000);
                } else {
                    return;
                }

                let yhgl_importUserUrl = avalon['components'][name]['defaults'].yhgl_importUserVm.yhgl_importUserUrl;
                if (yhgl_importUserUrl == '请选择导入文件路径') {
                    notification.info({
                        message: "请先选择文件，谢谢",
                        title: "温馨提示"
                    });
                    return;
                }
                let len = yhgl_importUserUrl.toString().split('.');
                if ((len[len.length - 1] != 'xls') && (len[len.length - 1] != 'xlsx')) { //支持xls或者.xlsx表格文件
                    notification.error({
                        message: "只支持上传.xls和.xlsx表格文件",
                        title: "温馨提示"
                    });
                    return;
                }
                $.ajaxFileUpload({
                    url: "http://" + window.location.host + apiUrl + '/gmvcs/uap/user/importUsers',
                    secureuri: false,
                    fileElementId: 'fileToUpload', //file标签的id  
                    dataType: 'string', //返回数据的类型
                    //data: {}, //一同上传的数据  
                    success: function (data, status) {
                        let result = eval('(' + data + ')');
                        if (result.code == 0) {
                            notification.success({
                                message: '导入用户成功',
                                title: "温馨提示"
                            });
                            avalon['components'][name]['defaults'].yhgl_searchFnc(); //刷新数据
                            avalon['components'][name]['defaults'].yhgl_importUser.show = false;
                        } else {
                            notification.error({
                                message: result.msg,
                                title: "温馨提示"
                            });
                            avalon['components'][name]['defaults'].yhgl_importUser.show = false;
                            return;
                        }
                    },
                    error: function (data, status, e) {
                        notification.success({
                            message: "导入用户失败！",
                            title: "温馨提示"
                        });
                        avalon['components'][name]['defaults'].yhgl_importUser.show = false;
                        return;
                    }
                });
            },
            handleCancel() {
                this.show = false;
            }
        }),
        yhgl_importUserDataRadio: avalon.define({ //导入的密码类型
            $id: 'yhgl-importUserDataRadio',
            psw_value: ['Express']
        }),

        // 角色范围弹窗
        yhgl_setRoleArea: avalon.define({
            $id: 'yhgl-setRoleArea',
            show: false,
            handleCancel() {
                avalon['components'][name]['defaults'].yhgl_setRoleArea.show = false;
                avalon['components'][name]['defaults'].yhgl_setRoleAreaVm.setRoleCheck = false;
            }
        }),
        yhgl_setRoleAreaVm: avalon.define({
            $id: 'yhgl-setRoleAreaVm',
            title: '角色范围',
            roleAreaOptions: [],
            selectedRole: [], //存储勾选的角色信息
            checkedVal: [],
            setRoleCheck: false, //全选标识
            setRoleAreaOk() {
                let tempRoleScope = [];
                if (this.selectedRole.length != 0) {
                    avalon.each(this.selectedRole, function (index, val) {
                        tempRoleScope.push({
                            "id": val
                        });
                    });
                }
                ajax({
                    url: '/gmvcs/uap/user/update/roles/scope',
                    method: 'post',
                    data: {
                        "uid": avalon['components'][name]['defaults'].checkUserUid,
                        rolesScope: tempRoleScope
                    }
                }).then(result => {
                    if (result.code == 0) {
                        notification.success({
                            message: "角色范围设置成功！",
                            title: "温馨提示"
                        });
                        avalon['components'][name]['defaults'].yhgl_setRoleArea.show = false;
                        avalon['components'][name]['defaults'].yhgl_searchFnc();
                        this.setRoleCheck = false;
                    }
                });
            },
            setRoleAreaNo() {
                avalon['components'][name]['defaults'].yhgl_setRoleArea.show = false;
                this.setRoleCheck = false;
            },
            getRoleArea(event) {
                this.selectedRole = event.target.value;
                if (this.roleAreaOptions.length == this.selectedRole.length) { //是否全选
                    this.setRoleCheck = true;
                } else {
                    this.setRoleCheck = false;
                }
            },
            setRoleCheckFnc(event) { //全选
                if (event.target.checked) {
                    let checked = [];
                    avalon.each(this.roleAreaOptions, function (index, val) {
                        checked.push(val.value);
                    });
                    this.checkedVal = checked;
                } else {
                    this.checkedVal = [];
                }
            }
        }),

        checkUserUid: '',
        setRoleAreaFnc() { //设置用户角色范围-弹窗
            //清除上一次操作遗留的数据
            this.yhgl_setRoleAreaVm.roleAreaOptions = [];
            this.yhgl_setRoleAreaVm.checkedVal = [];
            if (table.changeData.length == 0) {
                notification.info({
                    message: "抱歉，当前没有选中用户！",
                    title: "温馨提示"
                });
                return;
            }
            if (table.changeData.length > 1) {
                notification.info({
                    message: "抱歉，当前选中用户已经超过一个！",
                    title: "温馨提示"
                });
                return;
            }
            //this.yhgl_setRoleArea.show = true;
            // if(!$('.modal-dialog').hasClass('yhgl-setRole')){
            //     $('.modal-dialog').addClass('yhgl-setRole');
            //     $('.modal-content').addClass('yhglDraggable');
            // }
            //获取到当前用户下的角色范围
            ajax({
                url: '/gmvcs/uap/user/findById/' + yhjs_uid,
                //url: '/gmvcs/uap/roles/all',
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code == 0 && result.data) {
                    let tempRoleOptions = [];
                    avalon.each(result.data.rolesScope, function (index, val) {
                        tempRoleOptions.push({
                            "label": val.roleName,
                            "value": val.id
                        });
                    });
                    this.yhgl_setRoleAreaVm.roleAreaOptions = tempRoleOptions;
                }
                //回选当前用户已勾选的角色范围
                avalon['components'][name]['defaults'].checkUserUid = table.changeData[0].uid;
                ajax({
                    url: '/gmvcs/uap/user/findById/' + table.changeData[0].uid,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code == 0 && result.data) {
                        let tempChecked = [];
                        if (result.data.rolesScope.length != 0) {
                            avalon.each(result.data.rolesScope, function (index, val) {
                                tempChecked.push(val.id);
                            });
                            this.yhgl_setRoleAreaVm.checkedVal = tempChecked;
                            if (this.yhgl_setRoleAreaVm.roleAreaOptions.length == tempChecked.length) { //如果是全选就全选勾上
                                this.yhgl_setRoleAreaVm.setRoleCheck = true;
                            }
                        }
                        avalon['components'][name]['defaults'].yhgl_setRoleArea.show = true;
                        if (!$('.modal-dialog').hasClass('yhgl-setRole')) {
                            $('.modal-dialog').addClass('yhgl-setRole');
                            $('.modal-content').addClass('yhglDraggable');
                        }
                        if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                            $('.modal-backdrop').addClass('yhgl-modal-backdrop');
                        }
                    }
                });
            });

        },

        //函数部分
        yhgl_searchFnc() { //查询用户
            if (click_yhgl_search) { //防止重复操作
                click_yhgl_search = false;
                setTimeout(function () {
                    click_yhgl_search = true;
                }, 2000);
            } else {
                return;
            }

            let yhgl_depCode = avalon['components'][name]['defaults']['yhgl_depCode'],
                key = avalon['components'][name]['defaults'].policeKey || this.policeKey,
                subOrg = avalon['components'][name]['defaults'].yhgl_subOrg;
            let params = {
                "orgId": avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depId,
                "orgCode": yhgl_depCode, //部门编号
                "key": key, //(警号/姓名)
                "subOrg": subOrg //是否包含子部门
            };
            if (avalon['components'][name]['defaults']['yhgl_job']) { //岗位名称
                params.jobTypeCode = avalon['components'][name]['defaults']['yhgl_job'];
            }
            table.current = 1;
            params.page = table.current - 1;
            params.pageSize = table.pageSize;
            table.paramsData = params;

            table.fetch(params);
        },
        checkChild: false,
        checkFnc(event) { //是否包括子部门
            if (event.target.checked) {
                this.check_src = '/static/image/xtpzgl-yhgl/selectYes.png?__sprite'; //选中
            } else {
                this.check_src = '/static/image/xtpzgl-yhgl/selectNo.png?__sprite'; //不选中
            }
            avalon['components'][name]['defaults'].yhgl_subOrg = event.target.checked;
        },
        getTableTrData(event) { //表格行选中事件
            //console.log(event);
        },
        policeEnter() { //警员回车查询
            avalon['components'][name]['defaults'].yhgl_searchFnc();
        },
        addUserFnc() { //新增用户--弹窗
            this.vm_yhgl_addUser.show = true;
            avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep1_right.iptPsw = 'none';
            avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep1_right.iptText = 'inline-block';
            if (!$('.modal-dialog').hasClass('yhgl-addUser')) {
                $('.modal-dialog').addClass('yhgl-addUser');
                $('.modal-content').addClass('yhglDraggable');
            }
            if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                $('.modal-backdrop').addClass('yhgl-modal-backdrop');
            }
            this.vm_yhgl_addUserVm.yhgl_addUserDialog = `<xmp is="tyyhrzpt-xtpzgl-yhgl-yhtc" :widget="{id:'tyyhrzpt-xtpzgl-yhgl-yhtc'}"></xmp>`;
            this.vm_yhgl_addUserVm.yhgl_addUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>';
            $('.userStep1-right .ane-datepicker-input').attr('disabled', true);
            avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].yhtcDepName = avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depName;
            avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].yhtcDepId = avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depId;
        },
        editUserFnc() { //编辑用户--弹窗
            if (click_yhgl_edit) { //防止重复操作
                click_yhgl_edit = false;
                setTimeout(function () {
                    click_yhgl_edit = true;
                }, 2000);
            } else {
                return;
            }

            let dataRow = table.changeData;
            if (dataRow.length == 0) {
                notification.info({
                    message: "抱歉，当前没有选中用户！",
                    title: "温馨提示"
                });
                return;
            }
            if (dataRow.length > 1) {
                notification.error({
                    message: "抱歉，当前选中用户已经超过一个！",
                    title: "温馨提示"
                });
                return;
            }

            //定义保存user弹窗的初始值变量
            avalon['components'][name]['defaults'].userStepObject = {
                dialog_userName: '', //姓名
                dialog_userCode: '', //警号
                dialog_mobelPhone: '', //手机  
                dialog_idCard: '', //身份证
                dialog_account: '', //账号
                dialog_password: '', //密码
                dialog_email: '', //email
                dialog_expirationDate: '', //过期时间
                dialog_job: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_job_select'].selValue[0], //岗位名称
                dialog_role: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].selValue[0], //用户角色
                dialog_orgCode: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_dep_tree'].yhtc_depId, //所属部门
                dialog_policeTypeCode: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_policeType_select'].selValue[0], //警员类别
                dialog_userTypeL: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_yhlx_select'].selValue[0], //用户类型
                dialog_accountTypeL: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_numRadio'].num_value, //账户类型
                dialog_genderL: avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_sexRadio'].sex_value, //性别
            };

            avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].uid = dataRow[0].uid;

            ajax({
                url: '/gmvcs/uap/user/findById/' + dataRow[0].uid,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: "编辑失败！",
                        title: "温馨提示"
                    });
                    return;
                }
                this.vm_yhgl_editUser.show = true;
                avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep1_right.iptPsw = 'inline-block';
                avalon.components['tyyhrzpt-xtpzgl-yhgl-yhtc'].defaults.userStep1_right.iptText = 'none';
                if (!$('.modal-dialog').hasClass('yhgl-editUser')) {
                    $('.modal-dialog').addClass('yhgl-editUser');
                    $('.modal-content').addClass('yhglDraggable');
                }
                if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                    $('.modal-backdrop').addClass('yhgl-modal-backdrop');
                }
                this.vm_yhgl_editUserVm.yhgl_editUserDialog = `<xmp is="tyyhrzpt-xtpzgl-yhgl-yhtc" :widget="{id:'tyyhrzpt-xtpzgl-yhgl-yhtc'}"></xmp>`;
                this.vm_yhgl_editUserVm.yhgl_editUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">' + language_txt.xtpzgl.yhgl.next + '</button>';
                if (result.data) {
                    let ret = result.data;
                    //编辑表格用户初始化
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].name_value = ret.userName; //姓名初始化
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].policeNum_value = ret.userCode; //警号
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_left'].mPhone_value = ret.mobelPhone; //手机  
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].idCard_value = ret.idCard; //身份证
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].num_value = ret.account; //账号
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].psw_value = ret.password; //密码
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].email_value = ret.email || ''; //email
                    if (!ret.expirationDate) {
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].cache_time = new Date(new Date().getTime()).Format("yyyy-MM-dd"); //无过期时间时显示当前时间
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value = '';
                    } else {
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].cache_time = new Date(ret.expirationDate).Format("yyyy-MM-dd"); //保存编辑用户的过期时间
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].outTime_value = new Date(ret.expirationDate).Format("yyyy-MM-dd"); //过期时间
                    }
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].yhtcDepId = isNullFnc(ret.org, 'orgId'); //所属部门
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].yhtcDepName = isNullFnc(ret.org, 'orgName'); //所属部门
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_policeType_select'].selValue = [isNullFnc(ret.policeType, 'code')]; //警员类别
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_job_select'].selValue = [isNullFnc(ret.jobType, 'code')]; //岗位名称
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].selValue = [isNullFnc(ret.roles[0], 'id')]; //用户角色
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].roleName = [isNullFnc(ret.roles[0], 'roleName')]; //用户角色
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_yhlx_select'].selValue = [ret.userType]; //用户类型
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_numRadio'].num_value = ret.accountType; //账户类型
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_sexRadio'].sex_value = ret.gender; //性别

                    //当前编辑用户与登录用户管理范围比较
                    let LoginMgrScopes = avalon['components'][name]['defaults'].LoginMgrScopes;
                    let isMgrVal = false;
                    if (LoginMgrScopes.length > 0) {
                        let ret = [].concat(result.data.mgrScopes);
                        for (let i = 0; i < ret.length; i++) {
                            let isMgr = false;
                            for (let y = 0; y < LoginMgrScopes.length; y++) {
                                if (ret[i].path.indexOf(LoginMgrScopes[y].path) != -1) {
                                    isMgr = true;
                                    break;
                                }
                            }
                            if (isMgr) {
                                isMgr = false;
                            } else {
                                isMgrVal = true; //说明没有找到一个值是匹配到LoginMgrScopes所有值
                                break;
                            }
                        }
                    }

                    let checkedKeysArr = [];
                    if (ret.mgrScopes.length > 0) { //管理范围
                        avalon.each(ret.mgrScopes, function (index, val) {
                            checkedKeysArr.push(val.orgId);
                        });
                    }
                    // avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].mgrEor  = isMgrVal;
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].isMgrVal = isMgrVal; //标志当前编辑用户管理范围是否大于当前登录用户
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].mgrScopesDefault = checkedKeysArr;
                    //avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep2_dep_tree'].checkedKeys = checkedKeysArr; 
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].editDefault_mgrScopes = ret.mgrScopes;
                    if (ret.accountType == 'temporary') { //临时用户可以选择时间
                        $('.userStep1-right .ane-datepicker-input').attr('disabled', false);
                        $('.userStep1-right .ane-datepicker-input').css('color', '#536C80');
                    } else {
                        $('.userStep1-right .ane-datepicker-input').attr('disabled', true);
                        $('.userStep1-right .ane-datepicker-input').css('color', '#999999');
                    }
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_right'].isEdit = true; //标志编辑状态
                    avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults'].uid = dataRow[0].uid; //标志编辑用户id
                    if (dataRow[0].uid == yhjs_uid)
                        avalon['components']['tyyhrzpt-xtpzgl-yhgl-yhtc']['defaults']['userStep1_role_select'].disabledSelect = true; //编辑当前用户用于角色不可编辑
                }
            });
        },
        setMgrScopesFnc() { //管理范围--弹窗
            if (click_yhgl_mgrScopes) { //防止重复操作
                click_yhgl_mgrScopes = false;
                setTimeout(function () {
                    click_yhgl_mgrScopes = true;
                }, 2000);
            } else {
                return;
            }
            let dataRow = table.changeData;
            if (dataRow.length == 0) {
                notification.info({
                    message: "抱歉，当前没有选中用户！",
                    title: "温馨提示"
                });
                return;
            }
            if (dataRow.length > 1) {
                notification.error({
                    message: "抱歉，当前选中用户已经超过一个！",
                    title: "温馨提示"
                });
                return;
            }
            mgrscopesOpt = false;
            avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].mgrEor = false; //初始化
            ajax({
                url: '/gmvcs/uap/user/findById/' + dataRow[0].uid,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: "编辑失败！",
                        title: "温馨提示"
                    });
                    return;
                }
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopes'].show = true;
                if (!$('.modal-dialog').hasClass('yhgl-mgrScopes')) {
                    $('.modal-dialog').addClass('yhgl-mgrScopes');
                    $('.modal-content').addClass('yhglDraggable');
                }
                let LoginMgrScopes = avalon['components'][name]['defaults'].LoginMgrScopes;
                let isMgrVal = false;
                if (LoginMgrScopes.length > 0) {
                    let ret = [].concat(result.data.mgrScopes);
                    for (let i = 0; i < ret.length; i++) {
                        let isMgr = false;
                        for (let y = 0; y < LoginMgrScopes.length; y++) {
                            if (ret[i].path.indexOf(LoginMgrScopes[y].path) != -1) {
                                isMgr = true;
                                break;
                            }
                        }
                        if (isMgr) {
                            isMgr = false;
                        } else {
                            isMgrVal = true; //说明没有找到一个值是匹配到LoginMgrScopes所有值
                            break;
                        }
                    }
                }

                // avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].mgrEor = isMgrVal;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].uid = dataRow[0].uid;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].default_mgrScopes = result.data.mgrScopes;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].start_mgrScopes = result.data.mgrScopes;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].markOpt = false;
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].mgrScopes = [];
                mgrScopesSetTree(dataRow[0].uid, isMgrVal);
            });

        },
        deleteUserFnc(val) { //删除用户--弹窗
            if (click_yhgl_delete) { //防止重复操作
                click_yhgl_delete = false;
                setTimeout(function () {
                    click_yhgl_delete = true;
                }, 2000);
            } else {
                return;
            }

            if (table.changeData.length == 0) {
                switch (val) {
                    case 'many':
                        break;
                    case 'one':
                        notification.info({
                            message: "请先选择删除的用户,谢谢！",
                            title: "温馨提示"
                        });
                        break;
                    default:
                        break;
                }
                return;
            } else if (table.changeData.length == 1) { //删除单个用户
                this.vm_yhgl_deleteUser.show = true;
                if (!$('.modal-dialog').hasClass('yhgl-deleteUser')) {
                    $('.modal-dialog').addClass('yhgl-deleteUser');
                    $('.modal-content').addClass('yhglDraggable');
                }
                if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                    $('.modal-backdrop').addClass('yhgl-modal-backdrop');
                }
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear(); //清除保存删除用户的数组
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].yhgl_deleteUserCont = '';
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.push(table.changeData[0]);
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].yhgl_deleteUserCont = 1;
            } else { //删除多个用户
                this.vm_yhgl_deleteUser.show = true;
                if (!$('.modal-dialog').hasClass('yhgl-deleteUser')) {
                    $('.modal-dialog').addClass('yhgl-deleteUser');
                    $('.modal-content').addClass('yhglDraggable');
                }
                if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                    $('.modal-backdrop').addClass('yhgl-modal-backdrop');
                }
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear(); //清除保存删除用户的数组
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].yhgl_deleteUserCont = '';
                avalon.each(table.changeData, function (index, el) {
                    avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.push(el);
                });
                avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].yhgl_deleteUserCont = table.changeData.length;
            }

        },
        importUserFnc() { //导入用户--弹窗
            this.yhgl_importUser.show = true;
            if (!$('.modal-dialog').hasClass('yhgl-importUser')) {
                $('.modal-dialog').addClass('yhgl-importUser');
                $('.modal-content').addClass('yhglDraggable');
            }
            if (!$('.modal-backdrop').hasClass('yhgl-modal-backdrop')) {
                $('.modal-backdrop').addClass('yhgl-modal-backdrop');
            }
            this.yhgl_importUserVm.yhgl_importUserUrl = '请选择导入文件路径';
        },
        exportUserFnc() { //导出用户--弹窗
            let yhgl_depCode = avalon['components'][name]['defaults']['yhgl_depCode'],
                yhgl_jobTypeCode = avalon['components'][name]['defaults']['yhgl_job'];
            let params = {
                "orgId": avalon['components'][name]['defaults'].vm_tree_yhglSearch_dep.yhgl_depId,
                "orgCode": yhgl_depCode, //部门编号
                "key": this.policeKey, //(警号/姓名)
                "uidList": [], //导出用户情况
                "jobTypeCode": '',
                "subOrg": avalon['components'][name]['defaults'].yhgl_subOrg, //是否包含子部门
            };
            if (yhgl_jobTypeCode) { //岗位名称
                params.jobTypeCode = yhgl_jobTypeCode;
            }
            avalon.each(table.changeData, function (index, val) {
                params.uidList.push(val.uid);
            });
            let data = 'orgId=' + params.orgId + '&orgCode=' + params.orgCode +
                '&key=' + params.key + '&subOrg=' + params.subOrg + '&jobTypeCode=' + params.jobTypeCode +
                '&uidList=' + params.uidList;
            window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/user/exportUsers?" + data; //远程服务器使用
        },
        exportTemFnc() { //导出模板--弹窗
            window.location.href = "http://" + window.location.host + apiUrl + "/gmvcs/uap/user/exportUsersTemplate";
        },

        authority: { //功能权限控制
            "IMPORT": false, //用户管理_导入
            "DELETE": false, //用户管理_删除
            "SEARCH": false, //用户管理_查询
            "SET_ORG": false, //用户管理_设置角色范围
            "EDIT": false, //用户管理_编辑
            "MGR": false, //用户管理_管理范围
            "EXPORT": false, //用户管理_导出
            "CREATE": false, //用户管理_新增
            "EXPORT_TEMPLATE": false //用户管理_导出模板
        },

        onInit() {
            tableObject_yhgl = $.tableIndex({ //初始化表格jq插件
                id: 'yhgl_table',
                tableBody: tableBody_yhgl
            });
            LoginMgrScopesFnc(yhjs_uid); //当前登录用户的管理范围
            this.check_src = '/static/image/xtpzgl-yhgl/selectNo.png?__sprite';
            avalon['components'][name]['defaults'].yhgl_job = ''; //清空岗位名称
            avalon['components'][name]['defaults']['vm_yhgl_editUserVm'].mgrEor = false;
            this.yhgl_subOrg = false; //初始值不包括子部门
            table.remoteList = []; //置空表格
            table.changeData = [];
            table.total = 0;
            table.current = 0;
            table.pageSize = 20;
            table.paramsData = {};

            //岗位名称
            yhgl_jobtype();

            let storageJson = storage.getItem('tyyhrzpt-xtpzgl-yhgl');
            if (storageJson) {
                ajax({
                    url: '/gmvcs/uap/org/queryById/' + storageJson.orgId,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if ((result.code == 0) && (!result.data)) {
                        notification.info({
                            message: "所属部门已更新，请重新操作",
                            title: "温馨提示"
                        });
                        avalon.components[name]['defaults']['vm_search_job'].selValue[0] = '';
                        avalon['components'][name]['defaults']['yhgl_job'] = '';
                        this.policeKey = ''; //警员姓名
                        avalon['components'][name]['defaults'].policeKey = '';
                        this.checkChild = false;
                        //tableObject_yhgl.page(1,20);
                        tableBody_yhgl.currentPage = 1;
                        tableBody_yhgl.prePageSize = 20;
                        dep_init(); //初始化部门下拉框
                    } else {
                        if (storageJson.jobTypeCode) { //岗位名称
                            avalon.components[name]['defaults']['vm_search_job'].selValue[0] = storageJson.jobTypeCode;
                            avalon['components'][name]['defaults']['yhgl_job'] = storageJson.jobTypeCode;
                        } else {
                            avalon.components[name]['defaults']['vm_search_job'].selValue[0] = '';
                        }
                        this.policeKey = storageJson.key; //姓名/警号
                        if (storageJson.subOrg) { //包括子部门
                            this.check_src = '/static/image/xtpzgl-yhgl/selectYes.png?__sprite'; //选中
                            this.checkChild = true;
                        } else {
                            this.check_src = '/static/image/xtpzgl-yhgl/selectNo.png?__sprite'; //不选中
                            this.checkChild = false;
                        }
                        avalon['components'][name]['defaults'].yhgl_subOrg = storageJson.subOrg;
                        dep_initStorage(); //所属部门
                        avalon.components[name].defaults.vm_tree_yhglSearch_dep.yhgl_depId = storageJson.orgId;
                        avalon.components[name].defaults.yhgl_depCode = storageJson.orgCode;
                        avalon.components[name].defaults.vm_tree_yhglSearch_dep.yhgl_depName = storageJson.orgName;
                        table.total = storageJson.total;
                        //tableObject_yhgl.page(storageJson.page + 1,storageJson.pageSize);
                        tableBody_yhgl.currentPage = storageJson.page + 1;
                        tableBody_yhgl.prePageSize = storageJson.pageSize;
                        tableObject_yhgl.tableDataFnc(storageJson.remoteList);
                        // tableObject_yhgl.tableDataFnc(storageJson.remoteList,true);
                        // tableObject_yhgl.rebackTableWidth();
                        //table.remoteList = storageJson.remoteList;//表格数据
                        table.current = storageJson.page + 1;
                        table.pageSize = storageJson.pageSize;
                        let params = {
                            "page": storageJson.page,
                            "pageSize": storageJson.pageSize,
                            "orgId": storageJson.orgId,
                            "orgCode": storageJson.orgCode, //部门编号
                            //"jobTypeCode": storageJson.jobTypeCode, //岗位编号
                            "key": storageJson.key, //(警号/姓名)
                            "subOrg": storageJson.subOrg //是否包含子部门
                        };
                        if (storageJson.jobTypeCode) {
                            params.jobTypeCode = storageJson.jobTypeCode;
                        }
                        table.paramsData = params;
                    }

                });
            } else {
                avalon.components[name]['defaults']['vm_search_job'].selValue[0] = '';
                avalon['components'][name]['defaults']['yhgl_job'] = '';
                this.policeKey = ''; //警员姓名
                avalon['components'][name]['defaults'].policeKey = '';
                this.checkChild = false;
                //tableObject_yhgl.page(1,20);
                tableBody_yhgl.currentPage = 1;
                tableBody_yhgl.prePageSize = 20;
                dep_init(); //初始化部门下拉框
            }

            this.$watch('policeKey', function (v) {
                avalon['components'][name]['defaults'].policeKey = this.policeKey;
            });

            menuServer.menu.then(menu => {

                let list = menu.CAS_FUNC_TYYHRZPT;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^CAS_FUNC_YHGL/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                let _this = this;
                if (0 == func_list.length) {
                    $('.yhgl-tabCont').css('top', '42px');
                    return;
                }
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "CAS_FUNC_YHGL_IMPORT": //用户管理_导入
                            _this.authority.IMPORT = true;
                            break;
                        case "CAS_FUNC_YHGL_DELETE": //用户管理_删除
                            _this.authority.DELETE = true;
                            break;
                        case "CAS_FUNC_YHGL_SEARCH": //用户管理_查询
                            _this.authority.SEARCH = true;
                            break;
                        case "CAS_FUNC_YHGL_SET_ORG": //用户管理_设置角色范围
                            _this.authority.SET_ORG = true;
                            break;
                        case "CAS_FUNC_YHGL_EDIT": //用户管理_编辑
                            _this.authority.EDIT = true;
                            break;
                        case "CAS_FUNC_YHGL_MGR": //用户管理_管理范围
                            _this.authority.MGR = true;
                            break;
                        case "CAS_FUNC_YHGL_EXPORT": //用户管理_导出
                            _this.authority.EXPORT = true;
                            break;
                        case "CAS_FUNC_YHGL_CREATE": //用户管理_新增
                            _this.authority.CREATE = true;
                            break;
                        case "CAS_FUNC_YHGL_EXPORT_TEMPLATE": //用户管理_导出模板
                            _this.authority.EXPORT_TEMPLATE = true;
                            break;
                    }
                });
                // 设置绝对定位的top，防止空白
                if (false == this.authority.SEARCH)
                    $('.yhgl-tabCont').css('top', '80px');
                if (false == this.authority.IMPORT && false == this.authority.DELETE && false == this.authority.SET_ORG && false == this.authority.EDIT && false == this.authority.MGR && false == this.authority.EXPORT && false == this.authority.CREATE && false == this.authority.EXPORT_TEMPLATE)
                    $('.yhgl-tabCont').css('top', '110px');

                $('.addUser-disabled').prop('disabled', false);
                $('.editUser-disabled').prop('disabled', true);
                $('.mgrScopes-disabled').prop('disabled', true);
                $('.deleteUser-disabled').prop('disabled', true);
                $('.setRole-disabled').prop('disabled', true);
                $('.addUser-disabled').removeClass('yhgl-btnBg');
                $('.editUser-disabled').addClass('yhgl-btnBg');
                $('.mgrScopes-disabled').addClass('yhgl-btnBg');
                $('.deleteUser-disabled').addClass('yhgl-btnBg');
                $('.setRole-disabled').addClass('yhgl-btnBg');
                $('.del-all-btn').addClass('del-btn-disabled');
            });
        },
        onReady() {
            //DragDrop.enable();//拖放初始化
        },
        onDispose() {
            avalon['components'][name]['defaults'].yhgl_subOrg = false;
            avalon['components'][name]['defaults'].LoginMgrScopes = [];
            click_yhgl_search = true;
            click_yhgl_add = true;
            click_yhgl_edit = true;
            click_yhgl_mgrScopes = true;
            click_yhgl_delete = true;
            click_yhgl_edit_sure = true;
            click_yhgl_mgrScopes_ok = true;
            click_yhgl_delete_sure = true;
            click_yhgl_import_sure = true;
            // tableObject_yhgl.destroy();
        }
    }
});
//let yhglStorage = window.localStorage;//localStorage定义
let click_yhgl_search = true; //查询定时器标识
let click_yhgl_add = true; //添加用户定时器标识
let click_yhgl_edit = true; //编辑用户定时器标识
let click_yhgl_mgrScopes = true; //管理范围设置定时器标识
let click_yhgl_delete = true; //删除用户定时器标识
let click_yhgl_edit_sure = true; //编辑用户确定按钮定时器标识
let click_yhgl_mgrScopes_ok = true; //管理范围设置完成按钮定时器标识
let click_yhgl_delete_sure = true; //删除用户确定按钮定时器
let click_yhgl_import_sure = true; //导入用户确定按钮定时器 

let table = avalon.define({ //页面表格数据渲染
    $id: 'yhgl_tabCont',
    remoteList: [],
    changeData: [], //保存需要编辑或者删除的用户
    total: 0,
    current: 0,
    pageSize: 20,
    paramsData: {},
    $computed: {
        pagination: function () {
            return {
                current: this.current,
                pageSize: this.pageSize,
                total: this.total,
                onChange: this.pageChange
            };
        }
    },
    getCurrent(current) {
        this.current = current;
    },
    getPageSize(pageSize) {
        this.pageSize = pageSize;
    },
    pageChange(current, pageSize) {
        let params = this.paramsData;
        params.pageSize = this.pageSize;
        params.page = this.current - 1;
        this.fetch(params);
    },
    fetch(params) {
        tableObject_yhgl.loading(true);
        ajax({
            url: '/gmvcs/uap/user/findByPage',
            method: 'post',
            data: {
                "page": params.page,
                "pageSize": params.pageSize,
                "orgId": params.orgId,
                "orgCode": params.orgCode, //部门编号
                "jobTypeCode": params.jobTypeCode, //岗位编号
                "key": params.key, //(警号/姓名)
                "subOrg": params.subOrg //是否包含子部门
            }
        }).then(result => {
            if (result.code != 0) {
                notification.error({
                    message: "查询失败！",
                    title: "温馨提示"
                });
                tableObject_yhgl.loading(false);
                return;
            }
            if (result.data.currentElements.length > 0) {
                this.changeData = []; //当表格刷新当前页数据置空
                $('.addUser-disabled').prop('disabled', false);
                $('.editUser-disabled').prop('disabled', true);
                $('.mgrScopes-disabled').prop('disabled', true);
                $('.deleteUser-disabled').prop('disabled', true);
                $('.setRole-disabled').prop('disabled', true);
                $('.addUser-disabled').removeClass('yhgl-btnBg');
                $('.editUser-disabled').addClass('yhgl-btnBg');
                $('.mgrScopes-disabled').addClass('yhgl-btnBg');
                $('.deleteUser-disabled').addClass('yhgl-btnBg');
                $('.setRole-disabled').addClass('yhgl-btnBg');
                $('.del-all-btn').addClass('del-btn-disabled');
                this.total = result.data.totalElements;
                //tableObject_yhgl.page(this.current,this.pageSize);
                tableBody_yhgl.currentPage = this.current;
                tableBody_yhgl.prePageSize = this.pageSize;
                let ret = result.data.currentElements;
                let len = ret.length; //记录当前页面的数据长度
                this.remoteList = [];
                this.remoteList = avalon.range(len).map(n => ({ //字段末尾带L：表示返回的是没经过处理的字段
                    uid: ret[n].uid,
                    userName: ret[n].userName || '-', //姓名
                    userCode: ret[n].userCode || '-', //警号
                    account: ret[n].account || '-', //账号
                    password: ret[n].password || '-', //密码
                    gender: isSex(ret[n].gender) || '-', //性别
                    genderL: ret[n].gender,
                    orgName: isNullFnc(ret[n].org, 'orgName') || '-', //所属部门
                    jobTypeName: isNullFnc(ret[n].jobType, 'name') || '-', //岗位名称
                    userType: isUserType(ret[n].userType) || '-', //用户类型
                    policeTypeName: isNullFnc(ret[n].policeType, 'name') || '-', //警员类别
                    accountType: isAType(ret[n].accountType) || '-', //账号类型
                    mobelPhone: ret[n].mobelPhone || '-', //手机
                    idCard: ret[n].idCard || '-', //身份证
                    expirationDate: formatDate(ret[n].expirationDate), //有效时间
                    email: ret[n].email || '-', //邮箱
                    userRole: isNullFnc(ret[n].roles[0], 'roleName') || '-', //用户角色
                }));
                tableObject_yhgl.tableDataFnc(this.remoteList);
            }
            if (result.data.totalElements == 0) {
                this.remoteList = [];
                this.changeData = []; //当表格刷新当前页数据置空
                this.total = result.data.totalElements;
                this.current = 0;
                tableObject_yhgl.tableDataFnc([]);
                tableBody_yhgl.currentPage = this.current;
                tableBody_yhgl.prePageSize = this.pageSize;
                tableObject_yhgl.loading(false);
                $('.addUser-disabled').prop('disabled', false);
                $('.editUser-disabled').prop('disabled', true);
                $('.mgrScopes-disabled').prop('disabled', true);
                $('.deleteUser-disabled').prop('disabled', true);
                $('.setRole-disabled').prop('disabled', true);
                $('.addUser-disabled').removeClass('yhgl-btnBg');
                $('.editUser-disabled').addClass('yhgl-btnBg');
                $('.mgrScopes-disabled').addClass('yhgl-btnBg');
                $('.deleteUser-disabled').addClass('yhgl-btnBg');
                $('.setRole-disabled').addClass('yhgl-btnBg');
                $('.del-all-btn').addClass('del-btn-disabled');
                //return;
            }
            tableObject_yhgl.loading(false);
            let dataStorage = {
                "page": params.page,
                "pageSize": params.pageSize,
                "orgId": params.orgId,
                "orgCode": params.orgCode, //部门编号
                "jobTypeCode": params.jobTypeCode, //岗位编号
                "key": params.key, //(警号/姓名)
                "subOrg": params.subOrg, //是否包含子部门
                "remoteList": this.remoteList, //表格数据
                "total": this.total, //查询总数
                "orgName": avalon.components[name].defaults.vm_tree_yhglSearch_dep.yhgl_depName //部门名称
            };
            storage.setItem('tyyhrzpt-xtpzgl-yhgl', dataStorage, 0.5);
        });
    },
    handleSelect(record, selected, selectedRows) {
        table.changeData = selectedRows;
        if (table.changeData.length == 1) { //单选、多选、全选禁用新增按钮
            $('.addUser-disabled').prop('disabled', true);
            $('.addUser-disabled').addClass('yhgl-btnBg');
            $('.editUser-disabled').prop('disabled', false);
            $('.mgrScopes-disabled').prop('disabled', false);
            $('.deleteUser-disabled').prop('disabled', false);
            $('.setRole-disabled').prop('disabled', false);
            $('.editUser-disabled').removeClass('yhgl-btnBg');
            $('.mgrScopes-disabled').removeClass('yhgl-btnBg');
            $('.deleteUser-disabled').removeClass('yhgl-btnBg');
            $('.setRole-disabled').removeClass('yhgl-btnBg');
            $('.del-all-btn').removeClass('del-btn-disabled');
        } else if (table.changeData.length > 1) { //多选、全选禁用编辑按钮
            $('.addUser-disabled').prop('disabled', true);
            $('.editUser-disabled').prop('disabled', true);
            $('.mgrScopes-disabled').prop('disabled', true);
            $('.setRole-disabled').prop('disabled', true);
            $('.addUser-disabled').addClass('yhgl-btnBg');
            $('.editUser-disabled').addClass('yhgl-btnBg');
            $('.mgrScopes-disabled').addClass('yhgl-btnBg');
            $('.setRole-disabled').addClass('yhgl-btnBg');
            $('.del-all-btn').removeClass('del-btn-disabled');
        } else {
            $('.addUser-disabled').prop('disabled', false);
            $('.editUser-disabled').prop('disabled', true);
            $('.mgrScopes-disabled').prop('disabled', true);
            $('.setRole-disabled').prop('disabled', true);
            $('.deleteUser-disabled').prop('disabled', false);
            $('.addUser-disabled').removeClass('yhgl-btnBg');
            $('.editUser-disabled').addClass('yhgl-btnBg');
            $('.mgrScopes-disabled').addClass('yhgl-btnBg');
            $('.setRole-disabled').addClass('yhgl-btnBg');
            $('.deleteUser-disabled').addClass('yhgl-btnBg');
            $('.del-all-btn').addClass('del-btn-disabled');
        }
    },
    handleSelectAll(selected, selectedRows) {
        if (selectedRows.length == 1) { //单选、多选、全选禁用新增按钮
            $('.addUser-disabled').prop('disabled', true);
            $('.addUser-disabled').addClass('yhgl-btnBg');
            $('.editUser-disabled').prop('disabled', false);
            $('.editUser-disabled').removeClass('yhgl-btnBg');
            $('.mgrScopes-disabled').prop('disabled', false);
            $('.mgrScopes-disabled').removeClass('yhgl-btnBg');
            $('.deleteUser-disabled').prop('disabled', false);
            $('.deleteUser-disabled').removeClass('yhgl-btnBg');
            $('.setRole-disabled').prop('disabled', false);
            $('.setRole-disabled').removeClass('yhgl-btnBg');
            $('.del-all-btn').removeClass('del-btn-disabled');
        } else if (selectedRows.length > 1) { //多选、全选禁用编辑按钮
            $('.addUser-disabled').prop('disabled', true);
            $('.editUser-disabled').prop('disabled', true);
            $('.mgrScopes-disabled').prop('disabled', true);
            $('.setRole-disabled').prop('disabled', true);
            $('.deleteUser-disabled').prop('disabled', false);
            $('.addUser-disabled').addClass('yhgl-btnBg');
            $('.editUser-disabled').addClass('yhgl-btnBg');
            $('.mgrScopes-disabled').addClass('yhgl-btnBg');
            $('.setRole-disabled').addClass('yhgl-btnBg');
            $('.deleteUser-disabled').removeClass('yhgl-btnBg');
            $('.del-all-btn').removeClass('del-btn-disabled');
        } else {
            $('.addUser-disabled').prop('disabled', false);
            $('.editUser-disabled').prop('disabled', true);
            $('.mgrScopes-disabled').prop('disabled', true);
            $('.setRole-disabled').prop('disabled', true);
            $('.deleteUser-disabled').prop('disabled', false);
            $('.addUser-disabled').removeClass('yhgl-btnBg');
            $('.editUser-disabled').addClass('yhgl-btnBg');
            $('.mgrScopes-disabled').addClass('yhgl-btnBg');
            $('.setRole-disabled').addClass('yhgl-btnBg');
            $('.deleteUser-disabled').addClass('yhgl-btnBg');
            $('.del-all-btn').addClass('del-btn-disabled');
        }
        table.changeData = selectedRows;
    }
});
// let tableObject_yhgl = $.tableIndex({//初始化表格jq插件
//     id:'yhgl_table',
//     controller:'yhgl_table',
//     tableObj:table,
//     currentPage: 1,
//     prePageSize: 20
// });

function dep_init() {
    //部门列表
    ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        method: 'get',
        data: {}
    }).then(result => {
        if (result.data && result.data.length > 0) {
            let temp = yhglDepTree(result.data);
            avalon.components[name].defaults.vm_tree_yhglSearch_dep.dataTree = temp;
            // avalon.components[name].defaults.vm_tree_yhglSearch_dep.depName = new Array(result.data[0].orgCode);
            //avalon.components[name].defaults.vm_tree_yhglSearch_dep.expandedKeys = new Array(result.data[0].orgCode);
            avalon.components[name].defaults.vm_tree_yhglSearch_dep.yhgl_depId = result.data[0].orgId;
            avalon.components[name].defaults.yhgl_depCode = result.data[0].orgCode;
            avalon.components[name].defaults.vm_tree_yhglSearch_dep.yhgl_depName = result.data[0].orgName;
            avalon['components'][name]['defaults'].yhgl_searchFnc();
        }
    });
}

function dep_initStorage() {
    //部门列表
    ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        method: 'get',
        data: {}
    }).then(result => {
        if (result.data && result.data.length > 0) {
            let temp = yhglDepTree(result.data);
            avalon.components[name].defaults.vm_tree_yhglSearch_dep.dataTree = temp;
            //let tempCode = [result.data[0].orgCode];
            //avalon.components[name].defaults.vm_tree_yhglSearch_dep.depName = new Array(tempCode);
            //avalon.components[name].defaults.vm_tree_yhglSearch_dep.expandedKeys = new Array(result.data[0].orgCode);
            //avalon['components'][name]['defaults'].yhgl_searchFnc();
        }
    });
}

function yhglDepTree(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].orgCode = treeData[i].orgCode;
        if (!treeData[i].childs) {
            treeData[i].children = new Array();
        } else {
            treeData[i].children = treeData[i].childs;
        }
        treeData[i].isParent = true;
        if (treeData[i].hasOwnProperty('dutyRange'))
            delete(treeData[i]['dutyRange']);
        if (treeData[i].hasOwnProperty('extend'))
            delete(treeData[i]['extend']);
        if (treeData[i].hasOwnProperty('orderNo'))
            delete(treeData[i]['orderNo']);

        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            yhglDepTree(treeData[i].childs);
        };
    };
    return treeData;
}

/*
 *分级获取部门
 *  */
function yhgl_getOrgbyExpand(treeNode) {
    let data = 'pid=' + treeNode.orgId + '&&checkType=' + treeNode.checkType;
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?' + data,
        method: 'get',
        cache: false
    });

}

//岗位列表
function yhgl_jobtype() {
    ajax({
        url: '/gmvcs/uap/jobtype/all',
        method: 'get',
        data: {}
    }).then(result => {
        let ret = result.data;
        if (ret && (ret.length > 0)) {
            let optJs = [];
            optJs[0] = new Object();
            optJs[0].label = language_txt.xtpzgl.yhgl.all;
            optJs[0].value = '';
            for (let i = 0; i < ret.length; i++) {
                optJs[i + 1] = new Object();
                optJs[i + 1].label = ret[i].name;
                optJs[i + 1].value = ret[i].code;
            }
            let vm_search_job = avalon.components[name]['defaults']['vm_search_job'];
            vm_search_job.options = optJs;
            vm_search_job.selValue[0] = optJs[0].value;
        }
    });
}

//管理范围设置树
let mgrscopesOpt = false;

function mgrScopesSetTree(uid, type) { //type为true代表编辑用户管理范围大于登录用户的管理范围
    ajax({
        url: '/gmvcs/uap/org/find/fakeroot/selected?uid=' + uid,
        method: 'get',
        data: {}
    }).then(result => {
        if (result.data && result.data.length > 0) {
            let checkedKeys = [];
            result.data.forEach(ret => {
                if (ret.checkType == 'CHECKALL') {
                    checkedKeys.push(ret.orgId);
                }
            });
            if (checkedKeys.length == result.data.length && type) { //编辑用户的管理范围高于当前用户的管理范围
                avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].mgrEor = true;
                mgrscopesOpt = type ? true : false;
            }
            let temp = mgrScopesSetDepTree(result.data, mgrscopesOpt);
            avalon.components[name].defaults.vm_yhgl_mgrScopesVm.mgrScopesTree = temp; //管理范围树
            avalon.components[name].defaults.vm_yhgl_mgrScopesVm.checkedKeys = checkedKeys;
        }
    });
}

function mgrScopesSetDepTree(dataTree, type) { //管理范围展开树规范节点
    let org_icon = '/static/image/tyywglpt/org.png?__sprite';
    if (!dataTree) {
        return;
    }
    for (let i = 0; i < dataTree.length; i++) {

        dataTree[i].key = dataTree[i].orgId;
        dataTree[i].title = dataTree[i].orgName;
        dataTree[i].icon = org_icon;
        dataTree[i].orgCode = dataTree[i].orgCode;
        dataTree[i].isParent = true;
        dataTree[i].children = new Array();
        switch (dataTree[i].checkType) {
            case 'CHECKALL':
                dataTree[i].checked = true;
                dataTree[i].isFlag = false;
                dataTree[i].chkDisabled = type;
                break;
            case 'CHECKHALF':
                dataTree[i].halfCheck = true;
                dataTree[i].isFlag = true; //标志树默认状态下是半勾选
                break;
            case 'UNCHECK':
                dataTree[i].isFlag = false;
                break;
        }
    }
    return dataTree;
}

function yhglManage_getOrgbyExpand(treeNode) { //管理范围树
    let uid = avalon['components'][name]['defaults']['vm_yhgl_mgrScopesVm'].uid,
        pid = treeNode.orgId;
    let checkType = '';
    if (treeNode.halfCheck) {
        checkType = treeNode.checkType;
    } else if (!treeNode.halfCheck && treeNode.checked) {
        checkType = 'CHECKALL';
    } else if (!treeNode.halfCheck && !treeNode.checked) {
        checkType = 'UNCHECK';
    }
    //checkType = treeNode.checkType;
    let data = 'uid=' + uid + '&&pid=' + pid + '&&checkType=' + checkType;
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/selected?' + data,
        method: 'get',
        cache: false
    });
}

function LoginMgrScopesFnc(id) { //获取当前登录用户的管理范围
    ajax({
        url: '/gmvcs/uap/user/findById/' + id,
        method: 'get',
        data: {}
    }).then(result => {
        if (result && result.code == 0) {
            if (result.data) {
                if (result.data.admin) {
                    avalon['components'][name]['defaults'].LoginMgrScopes = [];
                    return;
                }
                avalon['components'][name]['defaults'].LoginMgrScopes = result.data.mgrScopes;
            }
        }
    });
}

//删除单个用户
function deleteUser(id) {
    ajax({
        url: '/gmvcs/uap/user/delete/' + id,
        method: 'get'
    }).then(result => {
        if (result.code == 0) {
            notification.success({
                message: "删除用户成功！",
                title: "温馨提示"
            });
            avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear();
            avalon['components'][name]['defaults'].yhgl_searchFnc();
        } else {
            notification.error({
                message: result.msg,
                title: "温馨提示"
            });
            avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear();
            return;
        }
    });
}

//删除多个用户
function deleteUserDb(arr) {
    let arrId = [];
    for (let i = 0; i < arr.length; i++) {
        arrId.push(arr[i].uid);
    }
    ajax({
        url: '/gmvcs/uap/user/batch/delete',
        method: 'post',
        data: arrId
    }).then(result => {
        if (result.code == 0) {
            notification.success({
                message: "删除用户成功！",
                title: "温馨提示"
            });
            avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear();
            avalon['components'][name]['defaults'].yhgl_searchFnc();
        } else {
            notification.error({
                message: result.msg,
                title: "温馨提示"
            });
            avalon['components'][name]['defaults']['vm_yhgl_deleteUserVm'].deleteUser.clear();
            return;
        }
    });
}

//表格返回数据处理函数
function arrayFnc(arr, arrTemp) { //数组值显示
    if (!arr) {
        return false;
    } else {
        let msg = '';
        for (let i = 0; i < arr.length; i++) {
            msg = msg + ' ' + arr[i][arrTemp] + ' ';
        }
        return msg;
    }
}

function returnArr(arr, arrTemp) { //返回数组
    if (!arr) {
        return false;
    } else {
        let m = [];
        for (let i = 0; i < arr.length; i++) {
            m.push(arr[i].id);
        }
        return m;
    }
}

function isNullFnc(data, dataChild) { //判断是否为空

    if (data) {
        return data[dataChild];
    } else {
        return false;
    }
}

function isSex(str) { //判断性别
    if (!str) {
        return false;
    } else if (str === 'male') {
        return language_txt.xtpzgl.yhgl.male;
    } else if (str === 'female') {
        return language_txt.xtpzgl.yhgl.female;
    } else {
        return false;
    }
}

function isUserType(str) { //判断用户类型
    if (!str) {
        return false;
    } else if (str === 'terminal') {
        return language_txt.xtpzgl.yhgl.endUser;
    } else if (str === 'backend') {
        return language_txt.xtpzgl.yhgl.backstageUser;
    } else {
        return false;
    }
}

function isAType(str) { //判断账户类型
    if (!str) {
        return false;
    } else if (str === 'permanent') {
        return language_txt.xtpzgl.yhgl.permanentUser;
    } else if (str === 'temporary') {
        return language_txt.xtpzgl.yhgl.casualUser;
    } else {
        return false;
    }
}

//时间戳转日期
function formatDate(date) {
    if (date) {
        var d = new Date(date);
        var year = d.getFullYear();
        var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
        var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
        var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
        var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
        var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

        return year + "-" + month + "-" + date;
    } else {
        return '';
    }
}

//表格插件jq
let tableBody_yhgl = avalon.define({ //表格定义组件
    $id: 'yhgl_table',
    data: [],
    key: 'uid',
    currentPage: 1,
    prePageSize: 20,
    loading: false,
    paddingRight: 0, //有滚动条时内边距
    checked: [],
    selection: [],
    isAllChecked: false,
    isColDrag: true, //true代表表格列宽可以拖动
    dragStorageName: 'yhgl-tableDrag-style', //表格拖动样式style存储storage名称，另外：在表格内所有元素中切记不要使用style定义样式以免造成影响
    // debouleHead:[],//多级表头，需要将所有表头的class名当做数组传入；单级表格可以忽略这个参数
    handleCheckAll: function (e) {
        var _this = this;
        var data = _this.data;
        if (e.target.checked) {
            data.forEach(function (record) {
                _this.checked.ensure(record[_this.key]);
                _this.selection.ensure(record);
            });
        } else {
            if (data.length > 0) {
                this.checked.clear();
                this.selection.clear();
            } else {
                this.checked.removeAll(function (el) {
                    return data.map(function (record) {
                        return record[_this.key];
                    }).indexOf(el) !== -1;
                });
                this.selection.removeAll(function (el) {
                    return data.indexOf(el) !== -1;
                });
            }
        }
        // this.selectionChange(this.checked, this.selection.$model);
        table.handleSelectAll(e.target.checked, this.selection.$model);
    },
    handleCheck: function (checked, record) {
        if (checked) {
            this.checked.ensure(record[this.key]);
            this.selection.ensure(record);
        } else {
            this.checked.remove(record[this.key]);
            this.selection.remove(record);
        }
        // this.selectionChange(this.checked, this.selection.$model);
        table.handleSelect(record.$model, checked, this.selection.$model);
    },
    handle: function (type, col, record, $index) { //操作函数
        var extra = [];
        for (var _i = 4; _i < arguments.length; _i++) {
            extra[_i - 4] = arguments[_i];
        }
        var text = record[col].$model || record[col];
        table.actions.apply(this, [type, text, record.$model, $index].concat(extra));
    }
});
let tableObject_yhgl = {};