import {
    createForm,
    notification
} from 'ane';
import ajax from '../../services/ajaxService.js';
import $ from 'jquery';
require('/apps/tyyhrzpt/tyyhrzpt-xtpzgl-yhgl-yhtc.css');
import {
    accountType,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;

//let avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'] = avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'];
export const name = 'tyyhrzpt-xtpzgl-yhgl-yhtc';

/*新增/编辑用户弹窗组件 --> 步骤一（用户基本信息）*/
avalon.component(name, {
    template: __inline('./tyyhrzpt-xtpzgl-yhgl-yhtc.html'),
    defaults: {
        yhgl_txt: language_txt.xtpzgl.yhgl,
        extra_class: languageSelect == "en" ? true : false,

        uid: '', //用户id
        editDefault_mgrScopes: [], //编辑状态下默认的管理范围
        mgrScopesNoInTree: [], //记录当前树结构不存在的管理范围节点
        yhtcDepName: '',
        yhtcDepId: '',

        userStep_data: {
            dep_code: '', //所属部门
            role_select: '', //用户角色选择
            job_select: '', //岗位名称选择
            yhlx_select: '', //用户类型的选择
            policeType_select: '', //警员类别
            userName: '', //用户姓名
            userPoliceNum: '', //用户警号
            userSex: 'male', //用户性别
            userID: '', //用户身份证
            userNum: '', //用户账户
            userPsw: '', //用户密码

            userMPhone: '', //用户手机
            userNumType: '', //账户类型
            userEmail: '', //用户E-mail
            userOutTime: '', //用户过期时间

            mgrScopes: [] //管理范围
        },

        userStep1_left: avalon.define({
            $id: 'userStep1-left',
            name_value: '', //姓名初始化
            policeNum_value: '', //警号
            mPhone_value: '', //手机
            name_isNull: 'none',
            policeNum_isNull: 'none',
            mPhone_isTrue: 'none', //手机错误格式提示
            policeNum_isTrue: 'none', //警号错误格式提示
            name_isTrue: 'none', //姓名错误格式提示
            name_display: 'none', //姓名规则display
            mPhone_display: 'none', //手机规则display
            policeNum_display: 'none', //警号规则display
            policeNum_check: 'none', //验证警号是否存在
            name_isTrue_html: language_txt.xtpzgl.yhgl.nameFormat, //请输入正确的姓名格式
            policeNum_isTrue_html: '', //警号错误格式提示
            policeNum_html: language_txt.xtpzgl.yhgl.noneCn, //警号不支持中文输入
            name_html: language_txt.xtpzgl.yhgl.formatRule, //支持中文、字母、数字
            isClear_policeNum: false,
            isClear_name: false,
            isClear_mPhone: false,
            role_isNull: false, //用户角色是否为空
            addShow: false,
            $left_form: createForm({
                onFieldsChange(fields, record) {
                    avalon.components[name].defaults.userStep_data.userName = record.name;
                    avalon.components[name].defaults.userStep_data.userPoliceNum = record.policeNum;
                    avalon.components[name].defaults.userStep_data.userMPhone = record.mPhone;
                }
            }),
            yhtc_left_focus(type) { //光标获取
                switch (type) {
                    case 'name':
                        this.name_isNull = 'none';
                        if (this.name_isTrue == 'inline-block') {
                            $(".userStep1-left input[name='name']").parent().addClass('has-error');
                        } else {
                            this.name_display = 'inline-block';
                        }
                        break;
                    case 'policeNum': //警号
                        this.policeNum_isNull = 'none';
                        this.policeNum_check = 'none';
                        if (this.policeNum_isTrue == 'inline-block') {
                            $(".userStep1-left input[name='policeNum']").parent().addClass('has-error');
                        } else {
                            this.policeNum_display = 'inline-block';
                        }
                        break;
                    case 'mPhone':
                        this.mPhone_display = 'inline-block';
                        this.mPhone_isTrue = 'none';
                        break;
                }
            },
            yhtc_left_blur(type) { //光标失去
                switch (type) {
                    case 'name':
                        this.name_display = 'none';
                        if (this.name_isTrue == 'inline-block') {
                            $(".userStep1-left input[name='name']").parent().removeClass('has-error');
                        }
                        break;
                    case 'policeNum':
                        this.policeNum_display = 'none';
                        let user_policeNum = avalon.components[name].defaults.userStep_data.userPoliceNum;
                        if (this.policeNum_isTrue == 'inline-block') {
                            $(".userStep1-left input[name='policeNum']").parent().removeClass('has-error');
                        } else if (user_policeNum && (this.policeNum_value != user_policeNum)) {
                            ajax({ //检验警号是否唯一
                                url: '/gmvcs/uap/user/check',
                                method: 'post',
                                data: {
                                    'userCode': user_policeNum, //警号
                                }
                            }).then(result => {
                                if (result.code == 0) { //成功
                                    this.policeNum_check = 'none';
                                } else {
                                    this.policeNum_check = 'inline-block';
                                }
                            });
                        }
                        break;
                    case 'mPhone':
                        this.mPhone_display = 'none';
                        let reg_mPhone = /^1(2|3|4|5|7|8)\d{9}$/;
                        let user_MPhone = avalon.components[name].defaults.userStep_data.userMPhone;
                        if (!reg_mPhone.test(user_MPhone) && user_MPhone) {
                            this.mPhone_isTrue = 'inline-block';
                        }
                        break;
                }
            },
            handleChange_name(e) { //姓名
                let name_val = e.target.value;
                if (name_val.toString().length > 20) {
                    //this.name_rules.message = '姓名不能超过20位字符';
                    this.name_display = 'none';
                    this.name_isTrue = 'inline-block';
                    this.name_isTrue_html = language_txt.xtpzgl.yhgl.nameMore;
                    $(".userStep1-left input[name='name']").parent().addClass('has-error');
                    // } else if (/[^a-zA-Z0-9\u4e00-\u9fa5]/.test(name_val)) {
                } else if (/[#$%&*()]/.test(name_val)) {
                    //this.name_rules.message = language_txt.xtpzgl.yhgl.nameFormat;
                    this.name_display = 'none';
                    this.name_isTrue = 'inline-block';
                    this.name_isTrue_html = language_txt.xtpzgl.yhgl.nameFormat;
                    $(".userStep1-left input[name='name']").parent().addClass('has-error');
                } else {
                    this.name_display = 'inline-block';
                    this.name_isTrue = 'none';
                    this.name_isTrue_html = language_txt.xtpzgl.yhgl.nameFormat;
                    $(".userStep1-left input[name='name']").parent().removeClass('has-error');
                }

                if (name_val) {
                    this.isClear_name = false;
                }
            },
            handleChange_policeNum(e) { //警号
                let policeNum_val = e.target.value;
                if (policeNum_val.toString().length > 21) {
                    this.policeNum_display = 'none';
                    this.policeNum_isTrue = 'inline-block';
                    this.policeNum_isTrue_html = '警号不能超过22位字符';
                    $(".userStep1-left input[name='policeNum']").parent().addClass('has-error');
                } else if (/[\u4e00-\u9fa5]/.test(policeNum_val)) {
                    this.policeNum_display = 'none';
                    this.policeNum_isTrue = 'inline-block';
                    this.policeNum_isTrue_html = '此警号不支持中文输入';
                    $(".userStep1-left input[name='policeNum']").parent().addClass('has-error');
                } else {
                    this.policeNum_isTrue = 'none';
                    this.policeNum_display = 'inline-block';
                    this.policeNum_isTrue_html = '';
                    $(".userStep1-left input[name='policeNum']").parent().removeClass('has-error');
                }

                if (policeNum_val) {
                    this.isClear_policeNum = false;
                }
            },
            handleChange_mPhone(e) { //手机
                if (e.target.value) {
                    this.isClear_mPhone = false;
                }
            },
            handleClear(type) {
                switch (type) {
                    case 'name':
                        this.isClear_name = true;
                        $(".userStep1-left input[name='name']").focus();
                        return false;
                        break;
                    case 'policeNum':
                        this.isClear_policeNum = true;
                        $(".userStep1-left input[name='policeNum']").focus();
                        return false;
                        break;
                    case 'mPhone':
                        this.isClear_mPhone = true;
                        $(".userStep1-left input[name='mPhone']").focus();
                        return false;
                        break;
                }
            }
        }),

        userStep1_right: avalon.define({
            $id: 'userStep1-right',
            idCard_value: '', //身份证
            num_value: '', //账号
            psw_value: '', //密码
            email_value: '', //email
            outTime_value: '', //过期时间
            cache_time: '', //保存编辑用户的过期时间
            idCard_isNull: 'none',
            idCard_check: 'none',
            num_isNull: 'none',
            num_check: 'none',
            time_isNull: 'none',
            psw_isNull: 'none',
            idCard_isTrue: 'none', //身份证格式错误提示
            psw_isTrue: 'none', //密码错误格式提示
            email_isTrue: 'none', //邮箱错误格式提示
            num_isTrue: 'none', //账号错误格式提示
            num_isTrue_html: language_txt.xtpzgl.yhgl.accountFormat, //账号错误格式提示内容
            idCard_display: 'none', //身份证规则display
            num_display: 'none', //账号规则display
            email_display: 'none', //邮箱规则display
            psw_display: 'none', //密码规则display
            type: 'password',
            iptPsw: 'none',
            iptText: 'inline-block',
            show_flag: false,
            isEdit: false, //标志当前弹窗(新增或编辑)
            isMgrVal: false, //当前编辑用户管理范围是否比登录用户大
            job_isNull: false, //岗位名称是否为空
            policeType_isNull: false, //警员类别是否为空
            isClear_idCard: false,
            isClear_num: false,
            isClear_email: false,
            isClear_psw: false,
            isClear_psw_edit: false,
            addShow: false, //编辑状态下不显示
            psw_addShow: false, //密码
            num_html: language_txt.xtpzgl.yhgl.accountRule,
            idCard_html: language_txt.xtpzgl.yhgl.IDcardRule,
            $right_form: createForm({
                onFieldsChange(fields, record) {
                    avalon.components[name].defaults.userStep_data.userID = record.idCard;
                    avalon.components[name].defaults.userStep_data.userNum = record.num;
                    avalon.components[name].defaults.userStep_data.userPsw = record.psw;
                    avalon.components[name].defaults.userStep_data.userEmail = record.Email;
                }
            }),
            outTimeHandleChange(event) { //时间选择事件
                if (event.target.value) {
                    avalon.components[name].defaults.userStep_data.userOutTime = getTimeByDateStr(event.target.value + ' 23:59:59');
                    this.time_isNull = 'none';
                } else {
                    avalon.components[name].defaults.userStep_data.userOutTime = 'isNull';
                }
            },
            yhtc_right_focus(type) { //获取光标
                switch (type) {
                    case 'idCard':
                        this.idCard_display = 'inline-block';
                        this.idCard_isNull = 'none';
                        this.idCard_check = 'none';
                        this.idCard_isTrue = 'none';
                        break;
                    case 'psw':
                        this.psw_display = 'inline-block';
                        this.psw_isNull = 'none';
                        this.psw_isTrue = 'none';
                        break;
                    case 'email':
                        this.email_display = 'inline-block';
                        this.email_isTrue = 'none';
                        break;
                    case 'num':
                        if (this.num_isTrue == 'inline-block') {
                            $(".userStep1-right input[name='num']").parent().addClass('has-error');
                        } else {
                            this.num_display = 'inline-block';
                        }
                        this.num_isNull = 'none';
                        this.num_check = 'none';
                        break;
                }
            },
            yhtc_right_blur(type) { //失去光标
                switch (type) {
                    case 'idCard':
                        this.idCard_display = 'none';
                        let idCard_value = avalon.components[name].defaults.userStep_data.userID;
                        let reg_idCard = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
                        if (!reg_idCard.test(idCard_value) && idCard_value) { //身份证格式错误提示
                            this.idCard_isTrue = 'inline-block';
                        } else if (reg_idCard.test(idCard_value) && (idCard_value != this.idCard_value)) {
                            ajax({ //检验身份证是否已存在
                                url: '/gmvcs/uap/user/check',
                                method: 'post',
                                data: {
                                    'idCard': idCard_value, //身份证
                                }
                            }).then(result => {
                                if (result.code == 0) { //成功
                                    this.idCard_check = 'none';
                                } else {
                                    this.idCard_check = 'inline-block';
                                }
                            });
                        }
                        break;

                    case 'num':
                        this.num_display = 'none';
                        let num_value = avalon.components[name].defaults.userStep_data.userNum;
                        let reg_num = /^\w{1,13}$/;
                        if (this.num_isTrue == 'inline-block') {
                            $(".userStep1-right input[name='num']").parent().removeClass('has-error');
                        } else if (reg_num.test(num_value) && (num_value != this.num_value)) {
                            ajax({ //账户是否已存在
                                url: '/gmvcs/uap/user/check',
                                method: 'post',
                                data: {
                                    'account': num_value, //账号
                                }
                            }).then(result => {
                                if (result.code == 0) { //成功
                                    this.num_check = 'none';
                                } else {
                                    this.num_check = 'inline-block';
                                }
                            });
                        }
                        break;

                    case 'psw':
                        this.psw_display = 'none';
                        let reg_psw = /[^\u4e00-\u9fa5]{6,}$/;
                        let user_Psw = avalon.components[name].defaults.userStep_data.userPsw;
                        if (!reg_psw.test(user_Psw) && user_Psw) {
                            this.psw_isTrue = 'inline-block';
                        }
                        break;
                    case 'email':
                        this.email_display = 'none';
                        let reg_email = /^.+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                        let user_Email = avalon.components[name].defaults.userStep_data.userEmail;
                        if (!reg_email.test(user_Email) && user_Email) {
                            this.email_isTrue = 'inline-block';
                        }
                        break;
                }
            },
            handleChange_idCard(e) {
                if (e.target.value) {
                    this.isClear_idCard = false;
                }
            },
            handleChange_num(e) { //账号
                let numValue = e.target.value;
                if (numValue.toString().length > 13) {
                    this.num_isTrue = 'inline-block';
                    this.num_display = 'none';
                    this.num_isTrue_html = language_txt.xtpzgl.yhgl.accountMore;
                    $(".userStep1-right input[name='num']").parent().addClass('has-error');
                } else if (/[^a-zA-Z0-9]/.test(numValue)) {
                    this.num_isTrue = 'inline-block';
                    this.num_display = 'none';
                    this.num_isTrue_html = language_txt.xtpzgl.yhgl.accountFormat;
                    $(".userStep1-right input[name='num']").parent().addClass('has-error');
                } else {
                    this.num_isTrue = 'none';
                    this.num_display = 'inline-block';
                    $(".userStep1-right input[name='num']").parent().removeClass('has-error');
                    this.num_isTrue_html = language_txt.xtpzgl.yhgl.accountFormat;
                }

                if (numValue) {
                    this.isClear_num = false;
                }
            },
            handleChange_psw() {
                if (!this.show_flag) {
                    this.show_flag = true;
                    avalon.components[name].defaults.userStep1_right.psw_value = '';
                    avalon.components[name].defaults.userStep1_right.iptText = 'inline-block';
                    avalon.components[name].defaults.userStep1_right.iptPsw = 'none';
                    this.psw_addShow = true;
                }
            },
            handleChange_text(e) {
                if (e.target.value) {
                    this.isClear_psw = false;
                }
            },
            handleChange_email(e) { //邮箱
                if (e.target.value) {
                    this.isClear_email = false;
                }
            },
            handleClear(type) {
                switch (type) {
                    case 'idCard':
                        this.isClear_idCard = true;
                        $(".userStep1-right input[name='idCard']").focus();
                        return false;
                        break;
                    case 'num':
                        this.isClear_num = true;
                        $(".userStep1-right input[name='num']").focus();
                        return false;
                        break;
                    case 'email':
                        this.isClear_email = true;
                        $(".userStep1-right input[name='Email']").focus();
                        return false;
                        break;
                    case 'psw':
                        if (!this.psw_addShow) {
                            this.isClear_psw_edit = true;
                        }
                        this.isClear_psw = true;
                        $(".userStep1-right input[name='psw']").focus();
                        return false;
                        break;
                }
            }
        }),

        userStep1_dep_tree: avalon.define({ //所属部门树
            $id: 'userStep1-dep-tree',
            dataTree: [],
            yhtc_depName: '', //所属部门名称
            yhtc_depId: '', //部门id
            //expandedKeys:[],
            //handleCheck(checkedKeys) {},
            // selectfunc(event) {
            //     avalon['components'][name]['defaults'].userStep_data.dep_code = event.target.value;
            // },
            //depName: [] 
            getSelected(key, title, node) {
                avalon['components'][name]['defaults'].userStep_data.dep_code = key;
                avalon['components'][name]['defaults'].userStep1_dep_tree.yhtc_depId = key;
                avalon['components'][name]['defaults'].userStep1_dep_tree.yhtc_depName = title;
            },
            handleTreeChange(e, selectedKeys) {
                // this.orgId = e.node.orgId;
                // this.orgPath = e.node.path;
                avalon['components'][name]['defaults'].userStep_data.dep_code = e.node.orgId;
                avalon['components'][name]['defaults'].userStep1_dep_tree.yhtc_depId = e.node.orgId;
            },
            extraExpandHandle: function (treeId, treeNode) {
                yhtc_getOrgbyExpand(treeNode.orgId).then((ret) => {
                    if (ret.code == 0) {
                        $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, yhglInDepTree(ret.data));
                        return;
                    }

                });
            }
        }),

        userStep2_dep_tree: avalon.define({ //管理范围部门树
            $id: 'userStep2-dep-tree',
            dataTree: [],
            checkable: true,
            halfCheckable: false,
            expandedKeys: [],
            checkedKeys: [],
            checkedCode: [],
            mgrScopesDefault: [],
            markOpt: false, //标志是否操作了管理范围树（false默认不操作）
            handleCheck(checkedKeys, event) {
                let arrKeys = [];
                for (let i = 0; i < event.checkedNodes.length; i++) {
                    arrKeys[i] = new Object();
                    arrKeys[i].orgId = event.checkedNodes[i].key;
                }
                avalon['components'][name]['defaults'].userStep2_dep_tree.markOpt = true;
                avalon['components'][name]['defaults'].userStep_data.mgrScopes = arrKeys;

                if (avalon['components'][name]['defaults']['userStep1_right'].isEdit && event.node.isFlag) { //编辑状态下
                    let path = event.node.path;
                    let mgrScopes = [];
                    avalon['components'][name]['defaults'].editDefault_mgrScopes.forEach(mgr => {
                        if (mgr.path.indexOf(path) == -1) { //没有找到，代表不是在当前操作节点的子节点下
                            mgrScopes.push(mgr);
                        }
                    });
                    avalon['components'][name]['defaults'].editDefault_mgrScopes = mgrScopes;
                    let node = event.node;
                    node.isFlag = false;
                    $.fn.zTree.getZTreeObj(event.event.currentTarget.id).updateNode(node);
                }
            },
            beforeExpand(treeId, treeNode) {
                if (treeNode.children && treeNode.children.length > 0) return; //表示节点加过数据，不重复添加
                if (avalon['components'][name]['defaults']['userStep1_right'].isEdit) { //编辑状态下展开树节点
                    yhtcManage_getOrgbyExpand(treeNode).then((ret) => {
                        if (ret.code == 0) {
                            $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, yhglManageDepTree(ret.data));
                            let mgrScopes = [];
                            avalon['components'][name]['defaults'].editDefault_mgrScopes.forEach(mgr => {
                                let node = $.fn.zTree.getZTreeObj(treeId).getNodeByParam("key", mgr.orgId, treeNode);
                                if (!node) { //目前树结构中不存在的管理范围节点
                                    mgrScopes.push(mgr);
                                }
                            });
                            avalon['components'][name]['defaults'].editDefault_mgrScopes = mgrScopes;
                            return;
                        }

                    });
                } else { //新增状态下展开树节点
                    yhtcManage_getOrgbyExpand_add(treeNode).then((ret) => {
                        if (ret.code == 0) {
                            $.fn.zTree.getZTreeObj(treeId).addNodes(treeNode, yhglManageDepTree_add(ret.data, treeNode));
                            return;
                        }

                    });
                }
            }
        }),

        userStep1_sexRadio: avalon.define({ //性别定义
            $id: 'userStep1-sexRadio',
            sex_value: 'male',
            handleChange(event) {
                if (event.denyValidate) {
                    avalon['components'][name]['defaults'].userStep_data.userSex = event.target.value[0];
                } else {
                    avalon['components'][name]['defaults'].userStep_data.userSex = event.target.value;
                }
            }
        }),
        userStep1_numRadio: avalon.define({ //账号类型定义
            $id: 'userStep1-numRadio',
            num_value: 'permanent',
            handleChange(event) {
                if (event.denyValidate) {
                    avalon['components'][name]['defaults'].userStep_data.userNumType = event.target.value[0];
                } else {
                    avalon['components'][name]['defaults'].userStep_data.userNumType = event.target.value;
                }
                if (event.target.value == 'temporary') {
                    $('.userStep1-right .ane-datepicker-input').attr('disabled', false);
                    $('.userStep1-right .ane-datepicker-input').css('color', '#536C80');
                    $('.userStep1-right .datepicker-cls .control-label').css('color', '#536C80');
                    $('.userStep1-right .datepicker-cls').removeClass('activeTime-bg');
                } else {
                    $('.userStep1-right .ane-datepicker-input').attr('disabled', true);
                    $('.userStep1-right .ane-datepicker-input').css('color', '#999999');
                    $('.userStep1-right .datepicker-cls').addClass('activeTime-bg');
                    $('.userStep1-right .datepicker-cls .control-label').css('color', '#999999');
                    avalon['components'][name]['defaults'].userStep1_right.time_isNull = 'none';
                }

                if (false == avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'].vm_yhgl_editUser.show) {
                    if (event.target.value == 'temporary') {
                        avalon['components'][name]['defaults'].userStep1_right.outTime_value = new Date(new Date().getTime()).Format("yyyy-MM-dd");
                    } else {
                        avalon['components'][name]['defaults'].userStep1_right.outTime_value = '';
                    }
                } else {
                    if (event.target.value == 'temporary') {
                        avalon['components'][name]['defaults'].userStep1_right.outTime_value = avalon['components'][name]['defaults'].userStep1_right.cache_time;
                    } else {
                        avalon['components'][name]['defaults'].userStep1_right.outTime_value = '';
                    }
                }
            }
        }),

        userStep1_role_select: avalon.define({ //用户角色下拉框
            $id: 'userStep1-role-select',
            selValue: [],
            options: [],
            roleName: '',
            disabledSelect: false,
            handleChange(event) {
                avalon['components'][name]['defaults'].userStep_data.role_select = event.target.value;
                if (event.target.value) {
                    avalon['components'][name]['defaults'].userStep1_left.role_isNull = false;
                } else {
                    avalon['components'][name]['defaults'].userStep1_left.role_isNull = true;
                }
            }
        }),

        userStep1_job_select: avalon.define({ //岗位名称下拉框
            $id: 'userStep1-job-select',
            selValue: [],
            options: [],
            handleChange(event) {
                avalon['components'][name]['defaults'].userStep_data.job_select = event.target.value;
                // if(event.target.value){
                //     avalon['components'][name]['defaults'].userStep1_right.job_isNull = false;
                // }else{
                //     avalon['components'][name]['defaults'].userStep1_right.job_isNull = true;
                // }
            }
        }),

        userStep1_yhlx_select: avalon.define({ //用户类型下拉框
            $id: 'userStep1-yhlx-select',
            selValue: ['terminal'],
            options: [{
                'label': language_txt.xtpzgl.yhgl.endUser,
                'value': 'terminal'
            }, {
                'label': language_txt.xtpzgl.yhgl.backstageUser,
                'value': 'backend'
            }],
            handleChange(event) {
                avalon['components'][name]['defaults'].userStep_data.yhlx_select = event.target.value;
            }
        }),

        userStep1_policeType_select: avalon.define({ //警员类别下拉框
            $id: 'userStep1-policeType-select',
            selValue: [],
            options: [],
            handleChange(event) {
                avalon['components'][name]['defaults'].userStep_data.policeType_select = event.target.value;
                let policeTypeCode = event.target.value;
                policeTypeFnc(policeTypeCode);
                // if(event.target.value){
                //     avalon['components'][name]['defaults'].userStep1_right.policeType_isNull = false;
                // }else{
                //     avalon['components'][name]['defaults'].userStep1_right.policeType_isNull = true;//警员类别为空提示
                // }
            }
        }),

        onInit() {
            $('.userStep1-right .datepicker-cls').addClass('activeTime-bg');
            $('.userStep1-right .ane-datepicker-input').css('color', '#999999');
            this.userStep1_right.show_flag = false;
            this.userStep1_left.name_isNull = 'none'; //姓名
            this.userStep1_left.policeNum_isNull = 'none'; //警号
            this.userStep1_left.name_isTrue = 'none'; //姓名格式错误提示
            this.userStep1_left.mPhone_isTrue = 'none'; //手机格式错误提示
            this.userStep1_left.policeNum_isTrue = 'none'; //警号格式错误提示
            this.userStep1_left.policeNum_check = 'none'; //警号验证唯一性
            this.userStep1_left.name_isTrue_html = language_txt.xtpzgl.yhgl.nameFormat; //姓名格式错误提示内容
            this.userStep1_left.policeNum_isTrue_html = ''; //警号格式错误提示内容
            this.userStep1_right.num_isNull = 'none'; //账号
            this.userStep1_right.psw_isNull = 'none'; //密码
            this.userStep1_right.idCard_isNull = 'none'; //身份证
            this.userStep1_right.psw_isTrue = 'none'; //密码格式错误提示
            this.userStep1_right.num_check = 'none'; //账号验证存在提示
            this.userStep1_right.idCard_isTrue = 'none'; //身份格式错误提示
            this.userStep1_right.idCard_check = 'none'; //身份证验证存在提示
            this.userStep1_right.time_isNull = 'none'; //有效时间是否为空提示
            this.userStep1_right.email_isTrue = 'none'; //邮箱格式错误提示
            this.userStep1_right.num_isTrue = 'none'; //账号格式错误提示
            this.userStep1_right.num_isTrue_html = language_txt.xtpzgl.yhgl.accountFormat; //账号格式错误提示内容

            //input框×清除功能初始化
            this.userStep1_left.isClear_policeNum = false;
            this.userStep1_left.isClear_name = false;
            this.userStep1_left.isClear_mPhone = false;
            this.userStep1_right.isClear_idCard = false,
                this.userStep1_right.isClear_num = false;
            this.userStep1_right.isClear_email = false;
            this.userStep1_right.isClear_psw = false;
            this.userStep1_right.isClear_psw_edit = false;

            //清理上一次打开弹窗的值
            //avalon['components'][name]['defaults'].userStep_data.dep_code = '';//所属部门树
            avalon['components'][name]['defaults'].userStep_data.mgrScopes = []; //管理范围部门树
            avalon['components'][name]['defaults'].userStep_data.userSex = ''; //性别定义
            avalon['components'][name]['defaults'].userStep_data.userNumType = ''; //账号类型定义
            avalon['components'][name]['defaults'].userStep_data.job_select = ''; //岗位名称下拉框
            avalon['components'][name]['defaults'].userStep_data.role_select = ''; //用户角色下拉框
            avalon['components'][name]['defaults'].userStep_data.yhlx_select = ''; //用户类型下拉框
            avalon['components'][name]['defaults'].userStep_data.policeType_select = ''; //警员类型下拉框
            avalon.components[name].defaults.userStep_data.userOutTime = ''; //有效时间清空
            avalon['components'][name]['defaults'].userStep2_dep_tree.markOpt = false;
            avalon['components'][name]['defaults'].userStep1_right.job_isNull = false; //岗位名称为空提示
            avalon['components'][name]['defaults'].userStep1_right.policeType_isNull = false; //警员类别为空提示
            avalon['components'][name]['defaults'].userStep1_left.role_isNull = false; //用户角色是否为空


            if (avalon['components'][name]['defaults']['userStep1_right'].isEdit) { //编辑状态下账号不可编辑
                $(".userStep1-right input[name='num']").attr('readonly', true);
                $(".userStep1-right input[name='num']").css('color', '#999999');
                $(".userStep1-right input[name='num']").prev().css('color', '#999999');
                this.userStep1_right.num_html = language_txt.xtpzgl.yhgl.accountEdit;
                this.userStep1_right.addShow = false;
                this.userStep1_right.psw_addShow = false;
                //身份证不可编辑
                // $(".userStep1-right input[name='idCard']").attr('readonly',true);
                // $(".userStep1-right input[name='idCard']").css('color','#999999');
                // $(".userStep1-right input[name='idCard']").prev().css('color','#999999');
                // this.userStep1_right.idCard_html = '此处身份证不可编辑';
                //警号不可编辑
                $(".userStep1-left input[name='policeNum']").attr('readonly', true);
                $(".userStep1-left input[name='policeNum']").css('color', '#999999');
                $(".userStep1-left input[name='policeNum']").prev().css('color', '#999999');
                this.userStep1_left.policeNum_html = language_txt.xtpzgl.yhgl.policeEdit;
                this.userStep1_left.addShow = false;
                //姓名不可编辑
                $(".userStep1-left input[name='name']").attr('readonly', true);
                $(".userStep1-left input[name='name']").css('color', '#999999');
                $(".userStep1-left input[name='name']").prev().css('color', '#999999');
                this.userStep1_left.name_html = language_txt.xtpzgl.yhgl.nameEdit;
                this.userStep1_left.addShow = false;
                //管理范围部门树--编辑状态
                avalon['components'][name]['defaults'].userStep2_dep_tree.halfCheckable = true;
                let uid = avalon['components'][name]['defaults'].uid;
                mgrScopesTree(uid);
            } else {
                $(".userStep1-right input[name='num']").removeAttr('disabled');
                $(".userStep1-right input[name='num']").css('color', '');
                $(".userStep1-right input[name='num']").prev().css('color', '');
                this.userStep1_right.num_html = language_txt.xtpzgl.yhgl.accountRule;
                this.userStep1_right.addShow = true;
                this.userStep1_right.psw_addShow = true;
                //身份证
                $(".userStep1-right input[name='idCard']").removeAttr('disabled');
                $(".userStep1-right input[name='idCard']").css('color', '');
                $(".userStep1-right input[name='idCard']").prev().css('color', '');
                this.userStep1_right.idCard_html = language_txt.xtpzgl.yhgl.IDcardRule;
                //警号
                $(".userStep1-left input[name='policeNum']").removeAttr('disabled');
                $(".userStep1-left input[name='policeNum']").css('color', '');
                $(".userStep1-left input[name='policeNum']").prev().css('color', '');
                this.userStep1_left.policeNum_html = language_txt.xtpzgl.yhgl.noneCn;
                this.userStep1_left.addShow = true;
                //姓名
                $(".userStep1-left input[name='name']").removeAttr('disabled');
                $(".userStep1-left input[name='name']").css('color', '');
                $(".userStep1-left input[name='name']").prev().css('color', '');
                this.userStep1_left.name_html = language_txt.xtpzgl.yhgl.formatRule;
                this.userStep1_left.addShow = true;
                //管理范围部门树--新增状态
                avalon['components'][name]['defaults'].userStep2_dep_tree.halfCheckable = false;
                ajax({
                    url: '/gmvcs/uap/org/find/fakeroot/mgr',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.data && result.data.length > 0) {
                        let temp = yhglInDepTree(result.data);
                        avalon.components[name].defaults.userStep2_dep_tree.dataTree = temp;
                    }
                });
            }

            if ('permanent' == avalon['components'][name]['defaults'].userStep1_numRadio.num_value) {
                $('.userStep1-right .datepicker-cls .control-label').css('color', '#999999');
            } else {
                $('.userStep1-right .datepicker-cls .control-label').css('color', '#536C80');
            }

            yhtcDepFnc(); //所属部门列表树
            //所属部门列表树
            // ajax({
            //     url: '/gmvcs/uap/org/find/root',
            //     method: 'get',
            //     data: {}
            // }).then(result => {
            //     if(result.data && result.data.length > 0){
            //         let temp = yhglInDepTree(result.data);
            //         avalon.components[name].defaults.userStep1_dep_tree.dataTree = temp;
            //     }
            // });

            // ajax({
            //     url: '/gmvcs/uap/org/all',
            //     method: 'get',
            //     data: {}
            // }).then(result => {
            //     if(result.data.length > 0){
            //         let temp = [];
            //         yhglManageDepTree(result.data,temp);
            //         avalon.components[name].defaults.userStep2_dep_tree.dataTree = temp;//管理范围树
            //         let tempArr = [result.data[0].orgId];
            //         // avalon.components[name].defaults.userStep2_dep_tree.expandedKeys = tempArr;
            //     }
            // });
            //用户角色列表
            roles();
            //警员类别
            policeType();
            //岗位名称
            jobtype();
        },
        onReady() {
            //配置中是否需要临时用户
            if ((accountType.indexOf('|') == -1) && (accountType == 'permanent')) { //不存在‘|’并且配置账号类型中只有permanent永久用户
                $("input[value='temporary']").parent().parent().css('display', 'none');
                $('#user_outTime').css('display', 'none');
            } else {
                $("input[value='temporary']").parent().parent().css('display', 'inline-block');
                $('#user_outTime').css('display', 'inline-block');
            }
        },
        onDispose() {
            avalon['components'][name]['defaults'].userStep1_right.outTime_value = '';
            avalon['components'][name]['defaults'].userStep_data.dep_code = ''; //所属部门树
            avalon['components'][name]['defaults'].uid = '';
            avalon['components'][name]['defaults'].userStep2_dep_tree.mgrScopesDefault = []; //初始默认的管理范围
            avalon['components'][name]['defaults']['userStep1_role_select'].disabledSelect = false;
        }
    }
});

//所属部门列表树调用函数
function yhtcDepFnc() {
    ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        method: 'get',
        data: {}
    }).then(result => {
        if (result.data && result.data.length > 0) {
            let temp = yhglInDepTree(result.data);
            avalon.components[name].defaults.userStep1_dep_tree.dataTree = temp;
            avalon['components'][name]['defaults']['userStep1_dep_tree'].yhtc_depId = avalon['components'][name]['defaults'].yhtcDepId;
            avalon['components'][name]['defaults']['userStep1_dep_tree'].yhtc_depName = avalon['components'][name]['defaults'].yhtcDepName;
        }
    });
}
//let j = 0;
function yhglInDepTree(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
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
            yhglInDepTree(treeData[i].childs);
        };
    };
    return treeData;
}

/*
 *分级获取部门
 *  */
function yhtc_getOrgbyExpand(orgId) { //所属部门
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent?pid=' + orgId,
        method: 'get',
        cache: false
    });

}

function yhtcManage_getOrgbyExpand(treeNode) { //管理范围树(编辑状态)
    let uid = avalon['components'][name]['defaults'].uid,
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

function yhtcManage_getOrgbyExpand_add(treeNode) { //管理范围树(新增状态)
    let pid = treeNode.orgId;
    let checkType = treeNode.checkType;
    let data = 'pid=' + pid + '&&checkType=' + checkType;
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?' + data,
        method: 'get',
        cache: false
    });

}

//管理范围部门树
// function yhglManageDepTree(tree,dataTree){

//     let org_icon =  '/static/image/tyywglpt/org.png?__sprite';
//     if(!tree){
//         return;
//     }
//     for(let i = 0, item; item = tree[i]; i++) {
//         dataTree[i] = new Object();

//         dataTree[i].key = item.orgId;
//         dataTree[i].title = item.orgName;
//         dataTree[i].icon = org_icon;
//         dataTree[i].orgCode = item.orgCode;
//         dataTree[i].halfCheck = true;
//         dataTree[i].checked = true;
//         dataTree[i].children = new Array();

//         yhglManageDepTree(item.childs, dataTree[i].children);
//     } 
// }
function mgrScopesTree(uid) {
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
            let isMgrVal = avalon['components'][name]['defaults']['userStep1_right'].isMgrVal;
            if (checkedKeys.length == result.data.length && isMgrVal) {
                avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults']['vm_yhgl_editUserVm'].mgrEor = isMgrVal;
                avalon['components'][name]['defaults']['userStep1_right'].isMgrVal = true;
            } else {
                avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults']['vm_yhgl_editUserVm'].mgrEor = false;
                avalon['components'][name]['defaults']['userStep1_right'].isMgrVal = false;
            }
            let temp = yhglManageDepTree(result.data);
            avalon.components[name].defaults.userStep2_dep_tree.dataTree = temp; //管理范围树
            // let tempArr = [result.data[0].orgId];
            // avalon.components[name].defaults.userStep2_dep_tree.expandedKeys = tempArr;

            avalon.components[name].defaults.userStep2_dep_tree.checkedKeys = checkedKeys;
        }
    });
}

function yhglManageDepTree(dataTree) { //管理范围展开树规范节点（编辑状态下）
    let isMgrVal = avalon['components'][name]['defaults']['userStep1_right'].isMgrVal;
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
                dataTree[i].chkDisabled = isMgrVal; //是否可以操作
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

function yhglManageDepTree_add(dataTree, treeNode) { //管理范围展开树规范节点（新增状态下）

    let org_icon = '/static/image/tyywglpt/org.png?__sprite';
    let checked = false;
    if (!dataTree) {
        return;
    }
    if (treeNode.checked) {
        checked = true;
    }
    for (let i = 0; i < dataTree.length; i++) {

        dataTree[i].key = dataTree[i].orgId;
        dataTree[i].title = dataTree[i].orgName;
        dataTree[i].icon = org_icon;
        dataTree[i].orgCode = dataTree[i].orgCode;
        dataTree[i].isParent = true;
        dataTree[i].children = new Array();
        dataTree[i].checked = checked;
    }
    return dataTree;
}

//岗位名称列表
function jobtype() {
    ajax({
        url: '/gmvcs/uap/jobtype/all',
        method: 'get',
        data: {}
    }).then(result => {
        let ret = result.data;
        if (ret && (ret.length > 0)) {
            let optJs = [];
            for (let i = 0; i < ret.length; i++) {
                optJs[i] = new Object();
                optJs[i].label = ret[i].name;
                optJs[i].value = ret[i].code;
            }
            let userStep1_job_select = avalon.components[name]['defaults']['userStep1_job_select'];
            userStep1_job_select.options = optJs;
            if (avalon['components'][name]['defaults']['userStep1_right'].isEdit) {
                userStep1_job_select.selValue = [avalon['components'][name]['defaults']['userStep1_job_select'].selValue[0]];
            } else {
                userStep1_job_select.selValue = [optJs[0].value];
            }
        }
    });
}

//警员类别
function policeType() {
    ajax({
        url: '/gmvcs/uap/policetype/all',
        method: 'get'
    }).then(result => {
        if (result.data && result.data.length > 0) {
            let r = result.data;
            let optJs = [];
            for (let i = 0; i < r.length; i++) {
                optJs[i] = new Object();
                optJs[i].label = r[i].name;
                optJs[i].value = r[i].code;
            }
            let userStep1_policeType_select = avalon.components[name]['defaults']['userStep1_policeType_select'];
            userStep1_policeType_select.options = optJs;
            if (avalon['components'][name]['defaults']['userStep1_right'].isEdit) {
                userStep1_policeType_select.selValue = [avalon['components'][name]['defaults']['userStep1_policeType_select'].selValue[0]];
            } else {
                userStep1_policeType_select.selValue = [optJs[0].value];
            }
            let policeTypeCode = userStep1_policeType_select.selValue[0];
            policeTypeFnc(policeTypeCode);
        }
    });
}

//角色名称
function roles() {
    let roleId = avalon['components'][name]['defaults']['userStep1_role_select'].selValue[0],
        differ = true;
    ajax({
        url: '/gmvcs/uap/roles/all',
        method: 'get',
        data: {}
    }).then(result => {
        let ret = result.data;
        if (ret && (ret.length > 0)) {
            let optJs = [];
            for (let i = 0; i < ret.length; i++) {
                optJs[i] = new Object();
                optJs[i].label = ret[i].roleName;
                optJs[i].value = ret[i].id;
                if (roleId && (roleId == ret[i].id)) { //存在该角色
                    differ = false;
                }
            }
            let userStep1_role_select = avalon.components[name]['defaults']['userStep1_role_select'];
            if (avalon['components'][name]['defaults']['userStep1_right'].isEdit) {
                if (differ && roleId) { //当角色超过该登录用户的角色列表范围时不可编辑
                    optJs.push({
                        label: userStep1_role_select.roleName,
                        value: roleId
                    });
                    userStep1_role_select.disabledSelect = true;
                }
                userStep1_role_select.options = optJs;
                userStep1_role_select.selValue = [avalon['components'][name]['defaults']['userStep1_role_select'].selValue[0]];
            } else {
                userStep1_role_select.options = optJs;
                userStep1_role_select.selValue = [optJs[0].value];
            }
        }
    });
}

function policeTypeFnc(policeTypeCode) {
    // if(policeTypeCode != 'LEVAM_JYLB_LD' && policeTypeCode != 'LEVAM_JYLB_ZONGDUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHIDUI_LD' 
    //     && policeTypeCode != 'LEVAM_JYLB_DADUI_LD' && policeTypeCode != 'LEVAM_JYLB_ZHONGDUI_LD'){
    //     if(avalon['components'][name]['defaults']['userStep1_right'].isEdit){
    //         avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'].vm_yhgl_editUserVm.yhgl_editUser_footerHtml = '<button class="yhgl-finish" :click="@handleOk">完成</button>';
    //     }else{
    //         avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'].vm_yhgl_addUserVm.yhgl_addUser_footerHtml = '<button class="yhgl-finish" :click="@handleOk">完成</button>';
    //     }
    // }else{
    //     if(avalon['components'][name]['defaults']['userStep1_right'].isEdit){
    //         avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'].vm_yhgl_editUserVm.yhgl_editUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">下一步</button>';
    //     }else{
    //         avalon['components']['tyyhrzpt-xtpzgl-yhgl']['defaults'].vm_yhgl_addUserVm.yhgl_addUser_footerHtml = '<button class="yhgl-nextStep" :click="@handleOk">下一步</button>';
    //     }
    // }
}

function getTimeByDateStr(stringTime) {
    var s = stringTime.split(" ");
    var s1 = s[0].split("-");
    var s2 = s[1].split(":");
    if (s2.length == 2) {
        s2.push("00");
    }

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}