import avalon from 'avalon2';
import {
    notification
} from 'ane';
import * as bootbox from 'bootbox';
import ajax from '../../services/ajaxService';
import * as menuServer from '../../services/menuService';
import 'bootstrap';
let storage = require('/services/storageService.js').ret;
let delete_ocx = require('../../apps/common/common').delete_ocx;

require('/apps/zfsypsjglpt/zfsypsjglpt-jdkp-jqkp-wkp_gongan.css');
export const name = 'zfsypsjglpt-jdkp-jqkp-wkp_gongan';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;
let policeType = storage.getItem("policeType");
let kplb_type = storage.getItem("kplb_type");

let jqglMan = null;
let jqgl_ck_Man = null;
let tempUnselected = [], //全局的存储未勾选的考核标准项
    globalEvaList = {
        retData: []
    }, //全局的存储考评信息
    currentList = {
        jckp: false,
        fzkp: false
    };
let jqgl_session = (function () {
    let jqbh = '';
    return {
        getJqbh: function () {
            jqbh = storage.getItem('zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData').jqbh_jqkp;
            return jqbh;
        }
    };
})();
avalon.component(name, {
    template: __inline('./zfsypsjglpt-jdkp-jqkp-wkp_gongan.html'),
    defaults: {
        // zfsypsjglpt_language: getLan(), //英文翻译
        //媒体标志 -- 目前在那一类媒体上
        glmt_mark: 'cj',
        jq_data: [], //警情媒体
        glmt_jq_show: false, //媒体切换
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },
        //关联媒体 -- 暂无
        cj_clickClass: 'glmt_cj', //按钮样式
        cj_data: [],
        glmt_cj_show: true, //媒体切换
        glmt_cj(e) { //点击暂无 
            Tools.clickGlmt('cj');
        },
        jq_nodata: false,
        cj_nodata: false,
        //点击折叠
        toggleMt(e, z, x) {
            var arr = e.srcElement.src.split('/');
            var path = arr[arr.length - 1].split('?')[0];
            var mark = false;
            var rid = e.srcElement.attributes.name.nodeValue;
            var type = jqgl_ck_Man.glmt_mark;
            var aim = null;
            jqgl_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    aim = val;
                }
            });

            if (path == 'zk.png') {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/wzk.png?__sprite';
                mark = false;
            } else {
                e.srcElement.src = '/static/image/zfda-ajgl-ck/zk.png?__sprite';
                mark = true;

                ajax({
                    url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                    method: 'get',
                    data: null,
                    cache: false
                }).then(ret => {

                    if (ret.code == 0) {
                        aim.jobType = ret.data.jobType;

                        if (ret.data.saveTime == -1) {
                            aim.saveTime = '永久存储';
                        } else if (ret.data.saveTime == -2) {
                            aim.saveTime = '已过期';
                        } else {
                            aim.saveTime = ret.data.saveTime + '天';
                        }

                        if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                            aim.path = "采集工作站、存储服务器";
                        } else {

                            if (ret.data.saveSiteWs) {
                                aim.path = "采集工作站";
                            } else if (ret.data.saveSiteSt) {
                                aim.path = "存储服务器";
                            }
                        }

                        if (aim.saveTime == '已过期') {
                            aim.path = "-";
                        }
                    } else {
                        Tools.sayError('获取详细信息失败');
                    }
                    Tools.reduceWordForToggle();
                });
            };

            jqgl_ck_Man[type + '_data'].forEach(function (val, key) {

                if (val.rid == rid) {
                    val.toggle = mark;
                    return;
                }
            });
        },


        //页面标题 -- 正在看
        checkLooking: '',
        //点击返回按钮
        jqgl_back(e) {
            delete_ocx();
            $('.popover').hide();
            Tools.clearPlayer('');
            jqgl_ck_Man.jckpStatus = false;
            jqgl_ck_Man.fzkpStatus = false;
            $("#gm_webplayer").hide();
            storage.removeItem("zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData");
            //路由跳转至查询页面
            avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp_gongan");
        },
        //共多少条关联媒体
        glmt_total: 0,
        src: '',
        video_url: '',
        // web_width: 0,
        // web_height: 0,
        audio_url: '',
        ocxPlayer: false,
        loading: false,
        media_type: false,
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,
        playingFile: '',
        imgff: false,
        //点击媒体文件名
        playFile(e) {
            //点击:选中的添加类名clickMTCK, 底部按钮切换至媒体信息
            var rid = $(e.currentTarget).find('[path]').attr('name');
            var type = $(e.currentTarget).find('[path]').attr('type');

            var name = $(e.currentTarget).find('[path]').attr('fileName'); //文件名
            var orgNameStr = $(e.currentTarget).find('[orgName]').attr('orgName'); //部门名称
            var userNmaeAndCode = $(e.currentTarget).find('[userName]').attr('userName') + '(' + $(e.currentTarget).find('[userCode]').attr('userCode') + ')'; //民警
            if (name && orgNameStr) {
                jqgl_ck_Man.checkLooking = '正在查看：' + orgNameStr + ' - ' + userNmaeAndCode + ' - ' + name;
            } else {
                jqgl_ck_Man.checkLooking = '正在查看：' + name;
            }


            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            this.mtxx();

            var mark = jqgl_ck_Man.glmt_mark;
            jqglMan.playingFile = rid;

            // filePlayer.play(type, rid, '');
            //更新媒体信息
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    ret.data.importTime = formatDate(ret.data.importTime);
                    ret.data.startTime = formatDate(ret.data.startTime);
                    ret.data.keyFile = ret.data.match == true ? '已关联' : '未关联';

                    if (ret.data.saveTime == -1) {
                        ret.data.saveTime = '永久存储';
                    } else if (ret.data.saveTime == -2) {
                        ret.data.saveTime = '已过期';
                    } else {
                        ret.data.saveTime = ret.data.saveTime + '天';
                    }

                    if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                        ret.data.path = "采集工作站、存储服务器";
                    } else {

                        if (ret.data.saveSiteWs) {
                            ret.data.path = "采集工作站";
                        } else if (ret.data.saveSiteSt) {
                            ret.data.path = "存储服务器";
                        }
                    }
                    if (ret.data.saveTime == '已过期') {
                        ret.data.path = "-";
                        jqgl_ck_Man.imgff = false;
                        jqgl_ck_Man.ocxPlayer = false;
                        $('.finishDelete').css('display', 'none');
                        $('.outDateMedia').css('display', 'block');
                        Tools.sayWarn('该文件已过期');
                    } else {
                        filePlayer.play(type, rid, '');
                    }
                    this.cjxxInfo.infomation = ret.data;
                    Tools.reduceWordForCjxx();
                } else {
                    Tools.sayError('获取详细媒体信息失败');
                }
            });
        },

        //查看 -- 基本信息
        jbxx_clickClass: 'cjxx-btn',
        jbxx_show: false,

        //查看 -- 基层考评
        jckp_clickClass: 'jbxx-btn',
        fzkp_clickClass: 'cjxx-btn',
        mtxx_clickClass: "cjxx-btn",
        cjxx_show: -1,
        kpType: 'jckp',
        jbxxInfo: avalon.define({
            $id: 'jqgl_jbxx_info_jdkp_qjzb',
            infomation: {} //要做数据初始化
        }),
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = "cjxx-btn";
            this.jbxx_show = true;
            this.cjxx_show = -1;
            Tools.reduceWordForJbxx();
        },
        //查看媒体信息
        mtxx() {
            this.mtxx_clickClass = 'jbxx-btn';
            this.fzkp_clickClass = 'cjxx-btn';
            this.jckp_clickClass = 'cjxx-btn';
            this.jbxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.cjxx_show = 2;
            Tools.reduceWordForJbxx();
        },
        cjxx(kpType) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.mtxx_clickClass = 'cjxx-btn';
            this.jbxx_show = false;
            this.kpType = kpType;
            this.cjxx_show = -1;
            jqgl_ck_Man.cjxxInfo.selectEva = [];
            tempUnselected = [];
            if (kpType == 'jckp') {
                this.jckp_clickClass = 'jbxx-btn';
                this.fzkp_clickClass = 'cjxx-btn';
            } else {
                this.jckp_clickClass = 'cjxx-btn';
                this.fzkp_clickClass = 'jbxx-btn';
            }
            //点击基层考评
            if (kpType == 'jckp') {
                if (currentList.jckp) {
                    getEvaInfo("BASIC");
                } else {
                    getPolicesituation();
                }
            } else {
                //点击法制考评
                if (currentList.fzkp) {
                    getEvaInfo("LEGAL");
                } else {
                    getPolicesituation();
                }
            }

        },
        alreadyKP_cont: avalon.define({
            $id: 'alreadyKP_cont_qjzb',
            alreadyEvaLists: [],
            alreadyComments: '',
            result: [], //考评结果
            comment: '', //考评评语
            orgName: '', //考评部门
            userName: '', //考评人
            userCode: '', //考评人警号
            createTime: '', //考评时间
            passed: false, //考评 是否通过true-通过，false-不通过
            noneEvaList: false
        }),
        noneKP_cont: avalon.define({
            $id: 'noneKp_cont_qjzb',
            evaLists: [],
            commentValue: '',
            getCommentVal(e) {
                let _this = this;
                _this.commentValue = e.target.value;
                if (e.target.value != "") {
                    let temp = document.getElementById("commentBox");
                    temp.style.color = '#536b82';
                }
            },
            selectCheck: [{
                "code": "LEVAM_JYCXKP_SFTG",
                "name": "是否通过",
                "desc": "没有描述",
                "order": 46,
                "createdTime": 1514169646000,
                "createBy": "admin",
                "check": "none"
            }], //考核选择
            selectEva: [],
            jqkpPassed: true,
            handleChangePassed(e) {
                let _this = this;
                _this.jqkpPassed = e.target.value == 'Y' ? true : false;
                _this.selectCheck[0].check = 'checked';
            },
            handleChange(e) {
                let _this = this;
                let tempArr = e.target.value.split('-');
                let tempArrCode = tempArr[0];
                let tempArrName = tempArr[1];
                let tempArrChecked = (tempArr[2] == "Y") ? true : false;
                if (tempArrChecked) {
                    _this.jqkpPassed = false; //如果选择了一项考评为 是，则不通过考评；
                }
                let tempIndex = findElem(_this.selectEva, 'code', tempArrCode);
                _this.selectEva[tempIndex].check = tempArrChecked;
                let tempId = document.getElementById(tempArrCode);
                tempId.style.color = "#536b82";
            },
            //完成评语
            submitComment() {
                //判断考评是否完成,若已完成,则弹出确认框,否则标红未进行考评的选项
                let _this = this;
                tempUnselected = [];
                let tempSelectEva = _this.selectEva;
                if (jqgl_ck_Man.noneKP_cont.commentValue.length > 500) {
                    notification.warn({
                        message: '评语最多输入500个字',
                        title: '温馨提示'
                    });
                    return;
                }
                if (jqgl_ck_Man.noneKP_cont.selectEva.length == 0) {
                    notification.warn({
                        message: '考核标准项为空,不允许提交考评,请联系管理员!',
                        title: '提示'
                    });
                    return;
                }
                // if (jqgl_ck_Man.noneKP_cont.selectCheck[0].check == 'none') {
                //     notification.warn({
                //         message: '请选择考评是否通过!',
                //         title: '温馨提示'
                //     });
                //     return;
                // }
                for (var i = 0; i < tempSelectEva.length; i++) {
                    if (tempSelectEva[i].check == true) {
                        tempUnselected.push({
                            code: tempSelectEva[i].code,
                            name: tempSelectEva[i].name
                        });
                    }
                }

                // if (jqgl_ck_Man.noneKP_cont.commentValue != "" || (tempUnselected.length >= 1)) { //考评项或 评语二选一
                if (jqgl_ck_Man.noneKP_cont.commentValue != "") { // 评语为必选项
                    confirmCont.confirmShow = true;
                    confirmVm.operation_type = 1;
                    confirmVm.dialog_text = "确认评价？";
                } else {
                    unFinishBox_cont.unFinishShow = true;
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
            }
        }),
        cjxxInfo: avalon.define({
            $id: 'jqgl_cjxx_info_jdkp_qjzb', //要做数据初始化
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            }
        }),
        //警员类型,结合权限控制底部按钮的显示隐藏
        jckpStatus: false,
        fzkpStatus: false,
        authority: { // 按钮权限标识
            "JCKP": false, //监督考评-警情考评-查看-基层考评
            "FZKP": false //监督考评-警情考评-查看-法制考评
        },
        onInit(event) {
            jqglMan = this;
            jqgl_ck_Man = this;
            jqgl_ck_Man.cjxx_show = '-2';
            //置空警情/媒体信息栏的初始值
            this.jbxxInfo.infomation = {};
            this.cjxxInfo.infomation = {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            };
            currentList.jckp = (storage.getItem("zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData").jckpStatus) ? true : false;
            currentList.fzkp = (storage.getItem("zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData").fzkpStatus) ? true : false;

            //请求警情信息并进行页面填充操作
            globalEvaList = {
                retData: []
            };
            // 基层考评/法制考评按钮权限控制->查看按钮不需要权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_JDKP_JQKP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_JDKP_JQKP_JCKP":
                            jqgl_ck_Man.authority.JCKP = true;
                            break;
                        case "AUDIO_FUNCTION_JDKP_JQKP_FZKP":
                            jqgl_ck_Man.authority.FZKP = true;
                            break;
                    }
                });
                Tools.searchJQInfo(); //初始化基本信息和处警信息
            });

            jqgl_ck_Man.ocxPlayer = true;
            $("#ocxPlayer").css("visibility", "hidden");

            //播放器设置
            this.video_url = "";
            this.play_status = false;
            this.web_width = $("#ocxPlayer").width();
            this.web_height = $("#ocxPlayer").height();
            this.web_left = $("#ocxPlayer").offset().left + 1;
            this.web_top = $("#ocxPlayer").offset().top + 1;
            // $("#gm_webplayer").css({
            //     "left": ($("#ocxPlayer").offset().left + 1) + "px", // -----$(".zfyps_video") 为放播放器的位置，取好位置的宽高
            //     "top": ($("#ocxPlayer").offset().top + 1) + "px"
            // });
            // $("#gm_webplayer").show();
            // document.getElementById('gm_webplayer').contentWindow.web_resize($("#ocxPlayer").width(), $("#ocxPlayer").height());
            // $("#gm_webplayer").width($("#ocxPlayer").width()); // -----设iframe的宽高
            // $("#gm_webplayer").height($("#ocxPlayer").height());


            //设置播放器宽高并显示
            setTimeout(function () {

                $("#ocxPlayer").css("visibility", "visible");

                $(window).resize(function () {
                    jqglMan.web_width = $("#ocxPlayer").width();
                    jqglMan.web_height = $("#ocxPlayer").height();
                });

                // $("#gm_webplayer").show();
                // $(window).resize(function () {

                //     $("#gm_webplayer").width($("#ocxPlayer").width()); // -----设iframe的宽高
                //     $("#gm_webplayer").height($("#ocxPlayer").height());

                //     if (document.getElementById('gm_webplayer').style.display != "none") { //-----加个判断，在iframe显示并且是在你当前模块的时候才进行操作
                //         document.getElementById('gm_webplayer').contentWindow.web_resize($("#ocxPlayer").width(), $("#ocxPlayer").height());
                //     }
                // });

                jqgl_ck_Man.$watch('ocxPlayer', (v) => {

                    // if (v) {
                    //     document.getElementById('gm_webplayer').contentWindow.web_resize($("#ocxPlayer").width(), $("#ocxPlayer").height());
                    //     $("#gm_webplayer").width($("#ocxPlayer").width()); // -----设iframe的宽高
                    //     $("#gm_webplayer").height($("#ocxPlayer").height());
                    //     $("#gm_webplayer").show();
                    // } else {
                    //     document.getElementById('gm_webplayer').contentWindow.stop();
                    //     $("#gm_webplayer").hide();
                    // }
                    if (v) {
                        return;
                    } else {
                        this.play_status = false;
                    }
                });
            }, 1000);


        },
        onReady() {
            Tools.searchJQInfo(); //初始化基本信息和处警信息
            let _this = this;
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    if (ev.preventDefault) {
                        ev.preventDefault();
                    } else {
                        ev.keyCode = 0;
                        ev.returnValue = false;
                    }
                    //若已有弹窗则阻止f5刷新操作
                    if (confirmCont.confirmShow || unFinishBox_cont.unFinishShow)
                        return;
                    confirmVm.operation_type = 2;
                    confirmVm.dialog_text = ' 是否确认离开此页面？';
                    confirmCont.confirmShow = true;
                    $("#gm_webplayer").hide();
                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                }
            });
            $(window).bind('beforeunload', function (event) { //ie
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-jqkp") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp_gongan");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-jdkp-jqkp") > -1)
                    avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp_gongan");
            });
        },
        onDispose() {
            Tools.clearPlayer('');
            $(document).unbind("keydown");
            storage.removeItem("zfsypsjglpt-jdkp-jqkpQjzb-current-jqkpData");

            $("#gm_webplayer").hide();
            this.play_status = false;
            this.ocxPlayer = false;
            if (this.ocxPlayer) {
                this.play_status = false;
                this.ocxPlayer = false;
                $("#gm_webplayer").hide();
            }
        }
    }
});

let confirmCont = avalon.define({
    $id: 'confirmCont_qjzb',
    confirmShow: false,
    move_return(a, b) {
        $("#iframe_zfsyps").css({
            width: "300px",
            height: "180px",
            left: a,
            top: b
        });
    },
    confirmCancel() {
        this.confirmShow = false;
        $("#iframe_zfsyps").hide();
    },
    confirmOk() {
        if (confirmVm.operation_type == 1) {
            let clickType = jqgl_ck_Man.kpType;
            let tempType = jqgl_ck_Man.kpType == 'jckp' ? "BASIC" : "LEGAL";
            ajax({
                url: '/gmvcs/audio/policeSituation/eva',
                method: 'post',
                data: {
                    // "type": tempType,
                    // "dataType": "PS",
                    "bh": jqgl_session.getJqbh(),
                    evaInfo: {
                        evaItems: jqgl_ck_Man.noneKP_cont.selectEva,
                        comment: jqgl_ck_Man.noneKP_cont.commentValue,
                        passed: jqgl_ck_Man.noneKP_cont.jqkpPassed //是否通过
                    }
                },
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '考评成功',
                        title: "温馨提示"
                    });
                    //考评成功之后,必须去修改currentList
                    if (clickType == 'jckp') {
                        currentList.jckp = true;
                    } else {
                        currentList.fzkp = true;
                    }
                    this.confirmShow = false;
                    $("#iframe_zfsyps").hide();
                    //重新刷新页面获取已考评信息
                    getEvaInfo(tempType);
                } else {
                    this.confirmShow = false;
                    $("#iframe_zfsyps").hide();
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
        } else if (confirmVm.operation_type == 2) {
            $(document).unbind("keydown");
            setTimeout(function () {
                avalon.history.setHash("/zfsypsjglpt-jdkp-jqkp_gongan");
            }, 300);
            this.confirmShow = false;
            $("#iframe_zfsyps").hide();
        }

    }
});
let confirmVm = avalon.define({
    $id: 'confirmVm_qjzb',
    title: '提示',
    dialog_text: "",
    operation_type: 1, //1表示确认评价的提示语,2表示f5刷新的提示语
});

let unFinishBox_cont = avalon.define({
    $id: 'unFinishBox_cont_qjzb',
    unFinishShow: false,
    move_return(a, b) {
        $("#iframe_zfsyps").css({
            width: "300px",
            height: "180px",
            left: a,
            top: b
        });
    },
    unFinishCancel() {
        this.unFinishShow = false;
        $("#iframe_zfsyps").hide();
        //对于未做考评项的进行文字标红操作
        markRedIcon();
    }
});
let unFinishBox_vm = avalon.define({
    $id: 'unFinishBox_vm_qjzb',
    title: '提示',
    unFinishOK() {
        unFinishBox_cont.unFinishShow = false;
        $("#iframe_zfsyps").hide();
        markRedIcon();
    }
});
//对于未做考评项的进行文字标红操作
function markRedIcon() {
    for (var k = 0; k < tempUnselected.length; k++) {
        let tempId = document.getElementById(tempUnselected[k].code);
        tempId.style.color = "red";
    }
    let temp = document.getElementById("commentBox");
    if (jqgl_ck_Man.noneKP_cont.commentValue == "") {
        temp.style.color = "red";
    } else {
        temp.style.color = "#536b82";
    }
}
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null) {
        return '-';
    } else {
        return str;
    }
};

/**********通用函数工具**********/
let Tools = {
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : jqgl_ck_Man;
        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing.video_url = '';
        playing['ocxPlayer' + type] = false;
        playing.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
    },
    reduceWordForHead: function () {
        if ($('.jqgl-ck-head span').text().length > 15) {
            $('.jqgl-ck-head span').attr('title', $('.jqgl-ck-head span').text());
        }

    },
    reduceWordForToggle: function (e) {
        $('.mtsecondpart .jj-inline-div .inlineSpan span:nth-child(2)').each(function () {
            if ($(this).text().length > 13) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.mtsecondpart .jj-inline-div .inlineSpan').find($("[data-toggle='popover']")).popover({
            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    setPopover: function (ele) {
        ele.on("mouseenter", function () {
            var _this = this;
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function () {
                $('div').siblings(".popover").popover("hide");
                $(_this).popover("show");
            }, 500);
            $(this).siblings(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            clearTimeout(_this.timer);
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 100);
            $(".popover").on("mouseleave", function () {
                $('.popover').hide();
            });
        }).on('shown.bs.popover', function () {
            $('.popover').mouseleave(function () {
                $('.popover').hide();
            });
        });
    },
    reduceWordForCjxx: function () {
        $('.cjxx .innerSpan').each(function () {

            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.cjxx').find($("[data-toggle='popover']")).popover({
            trigger: 'manual',
            container: 'body',
            placement: 'bottom',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    reduceWordForJbxx: function () {
        $('.jbxx .innerSpan').each(function () {
            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.jbxx').find($("[data-toggle='popover']")).popover({
            trigger: 'manual',
            container: 'body',
            placement: 'bottom',
            //delay:{ show: 5000},
            //viewport:{selector: 'body',padding:0},
            //title : '<div style="font-size:14px;">title</div>',  
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });
    },
    formatDuring: function (mss) {
        var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (mss % (1000 * 60)) / 1000;
        hours = hours < 10 ? ('0' + hours) : hours;
        minutes = minutes < 10 ? ('0' + minutes) : minutes;
        seconds = seconds < 10 && seconds >= 0 ? ('0' + seconds) : seconds;
        return hours + " : " + minutes + " : " + seconds;
    },
    checkSpace: function (aim) {
        var isOk = true;

        if (aim instanceof Array) {
            for (var i = 0, len = aim.length; i < len; i++) {

                if (!aim[i].toString().replace(/\s+/g, '')) {
                    isOk = false;
                    break;
                }
            };
        } else {
            isOk = !aim.replace(/\s+/g, '') ? false : true;
        };
        return isOk;
    },
    sayError: function (word) {
        notification.error({
            message: word,
            title: '温馨提示'
        });
    },
    sayWarn: function (word) {
        notification.warn({
            message: word,
            title: '温馨提示'
        });
    },
    saySuccess: function (word) {
        notification.success({
            message: word,
            title: '温馨提示'
        });
    },
    dealTableData: function (arr) {
        for (var i = 0, len = arr.length; i < len; i++) {

            switch (arr[i].type) {

                case 0:
                    arr[i].type_chinese = '视频';
                    break;
                case 1:
                    arr[i].type_chinese = '音频';
                    break;
                case 2:
                    arr[i].type_chinese = '图片';
                    break;
                case 3:
                    arr[i].type_chinese = '文本';
                    break;
                case 4:
                    arr[i].type_chinese = '其他';
                    break;
            };
        };
        return arr;
    },
    configGlmtNumber: function () {
        var type = jqgl_ck_Man.glmt_mark;
        jqgl_ck_Man.glmt_total = jqgl_ck_Man[type + '_data'].length;
    },
    clickGlmt: function (type) {
        jqgl_ck_Man.glmt_name.forEach(function (val, key) {
            jqgl_ck_Man[val + '_clickClass'] = 'glmt_cj';
            jqgl_ck_Man['glmt_' + val + '_show'] = false;
        });
        jqgl_ck_Man[type + '_clickClass'] = 'glmt_jj';
        jqgl_ck_Man['glmt_' + type + '_show'] = true;
        jqgl_ck_Man.glmt_mark = type;
        Tools.configGlmtNumber();
    },

    //基本信息和处警信息的查询
    searchJQInfo: function () {
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + jqgl_session.getJqbh(),
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                if (!ret.data) {} else {
                    // 处理警情信息
                    jqgl_ck_Man.checkLooking = (ret.data.jqmc || '-') + '(' + (ret.data.jqbh || '-') + ')';
                    ret.data.jqlb = ret.data.jqlbmc || '-';
                    ret.data.zbmj = ret.data.zbmj.join(',');
                    ret.data.zbmjxm = ret.data.zbmjxm.join(',');
                    ret.data.bjsj = formatDate(ret.data.bjsj);
                    ret.data.ddxcsj = (ret.data.ddxcsj.map(function (ddxcsj) {
                        return formatDate(ddxcsj);
                    })).join(',');
                    ret.data.sfsj = formatDate(ret.data.sfsj);
                    ret.data.cjsj = (ret.data.cjsj.map(function (cjsj) {
                        return formatDate(cjsj);
                    })).join(',');
                    ret.data.mjyj = ret.data.mjyj.join(',');
                    ret.data.jlly = ret.data.jlly.join(',') == '01' ? '后台系统同步' : '管理系统人工录入';
                    ret.data.relationCase = ret.data.relationCase == true ? '是' : '否';
                    jqgl_ck_Man.jbxxInfo.infomation = ret.data;

                    Tools.reduceWordForJbxx();
                    Tools.reduceWordForHead();

                    // 处理接警和处警媒体
                    ret.data.preBaseFiles = ret.data.preBaseFiles ? ret.data.preBaseFiles : [];
                    ret.data.handelerBaseFiles = ret.data.handelerBaseFiles ? ret.data.handelerBaseFiles : [];
                    ['preBaseFiles', 'handelerBaseFiles'].forEach(function (val, key) {
                        ret.data[val].forEach(function (val, key) {
                            val.checked = false;
                            val.importTime = formatDate(val.importTime);
                            val.startTime = formatDate(val.startTime);
                            val.duration = Tools.formatDuring(val.duration * 1000);
                            val.toggle = false;
                            val.keyFile = val.keyFile == true ? '是' : '否';
                            val.type = (function () {
                                switch (val.type) {

                                    case 0:
                                        return '视频';
                                        break;
                                    case 1:
                                        return '音频';
                                        break;
                                    case 2:
                                        return '图片';
                                        break;
                                    case 3:
                                        return '文本';
                                        break;
                                    case 4:
                                        return '其他';
                                        break;
                                }
                            }());
                        });
                    });

                    //处理选中已经总共数量的显示
                    jqgl_ck_Man.jq_data = ret.data.preBaseFiles;
                    jqgl_ck_Man.cj_data = ret.data.handelerBaseFiles;
                    jqgl_ck_Man.jq_nodata = !Boolean(jqgl_ck_Man.jq_data.length);
                    jqgl_ck_Man.cj_nodata = !Boolean(jqgl_ck_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数
                }
            }
        });


        // //测试数据
        // jqgl_ck_Man.authority.JCKP = false;
        // jqgl_ck_Man.authority.FZKP = true;
        // kplb_type = 1;
        // policeType = false;


        //kplb==2为超级管理员
        if (kplb_type == 2) {
            jqgl_ck_Man.jckp_clickClass = "jbxx-btn";
            jqgl_ck_Man.kpType = 'jckp';
            jqgl_ck_Man.mtxx_clickClass = 'cjxx-btn';
            jqgl_ck_Man.jbxx_clickClass = "cjxx-btn";
            jqgl_ck_Man.fzkp_clickClass = "cjxx-btn";
            jqgl_ck_Man.jckpStatus = true;
            jqgl_ck_Man.fzkpStatus = true;
            jqgl_ck_Man.authority.JCKP = true;
            jqgl_ck_Man.authority.FZKP = true;
            if (currentList.jckp) {
                getEvaInfo("BASIC");
            } else {
                getPolicesituation();
            }
            return;
        }

        //初始情况放在这,统一解决选中警情信息
        jqgl_ck_Man.mtxx_clickClass = 'cjxx-btn';
        jqgl_ck_Man.jbxx_clickClass = "jbxx-btn";
        jqgl_ck_Man.fzkp_clickClass = "cjxx-btn";
        jqgl_ck_Man.jckp_clickClass = "cjxx-btn";
        jqgl_ck_Man.jbxx_show = true;
        jqgl_ck_Man.cjxx_show = -1;
        jqgl_ck_Man.jckpStatus = false;
        jqgl_ck_Man.fzkpStatus = false;
        jqgl_ck_Man.kpType = 'jckp';

        if ((jqgl_ck_Man.authority.JCKP == true)) {
            jqgl_ck_Man.fzkpStatus = false;
            switch (kplb_type) {
                case 0:
                    if (currentList.jckp) {
                        getEvaInfo("BASIC");
                    } else if (policeType == true) {
                        jqgl_ck_Man.kpType = 'jckp';
                        getPolicesituation();
                    } else {
                        return;
                    }
                    //控制底部法制考评是否出现
                    if ((policeType == true) && (jqgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                        jqgl_ck_Man.fzkpStatus = true;
                    }
                    getSelectedItem("jckp");
                    break;
                case 1:
                    if (jqgl_ck_Man.authority.FZKP == true) {
                        jqgl_ck_Man.fzkpStatus = true;
                        //法制类领导,基层/法制页面有配权限且基层未考评过=>选中法制考评
                        if (currentList.jckp == true && policeType == true) {
                            getEvaInfo("BASIC");
                            getSelectedItem("jckp");
                        } else {
                            if (currentList.fzkp) {
                                getEvaInfo("LEGAL");
                                getSelectedItem("fzkp");
                            } else if (policeType == true) {
                                getPolicesituation();
                                jqgl_ck_Man.kpType = 'fzkp';
                                getSelectedItem("fzkp");
                            } else {
                                jqgl_ck_Man.fzkpStatus = false;
                            }
                        }
                    } else {
                        jqgl_ck_Man.fzkpStatus = false;
                    }
                    break;
                default:
                    //警员类别为其他时,有考评则显示
                    if (currentList.jckp == true) {
                        getEvaInfo("BASIC");
                        getSelectedItem("jckp");
                        //法制考评有配置,且已考评过，则显示
                        if ((jqgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                            jqgl_ck_Man.fzkpStatus = true;
                        }
                    } else if ((jqgl_ck_Man.authority.FZKP == true) && (currentList.fzkp == true)) {
                        jqgl_ck_Man.fzkpStatus = true;
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
            }
        } else if ((jqgl_ck_Man.authority.JCKP == false) && (jqgl_ck_Man.authority.FZKP == true)) {
            switch (kplb_type) {
                case 0:
                    if (policeType == true && currentList.fzkp == true) {
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
                case 1:
                    if (currentList.fzkp) {
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    } else if (policeType == true) {
                        getPolicesituation();
                        jqgl_ck_Man.kpType = 'fzkp';
                        getSelectedItem("fzkp");
                    }
                    break;
                default:
                    if (currentList.fzkp == true) {
                        jqgl_ck_Man.fzkpStatus = true;
                        getEvaInfo("LEGAL");
                        getSelectedItem("fzkp");
                    }
                    break;
            }
        }
    }
};

//修改底部选中信息状态[传参:需要选中的状态]
function getSelectedItem(status) {
    switch (status) {
        case "jckp":
            jqgl_ck_Man.jckp_clickClass = "jbxx-btn";
            jqgl_ck_Man.jbxx_clickClass = "cjxx-btn";
            jqgl_ck_Man.jckpStatus = true;
            jqgl_ck_Man.jbxx_show = false;
            jqgl_ck_Man.kpType = 'jckp';
            break;
        case "fzkp":
            jqgl_ck_Man.jbxx_clickClass = "cjxx-btn";
            jqgl_ck_Man.fzkp_clickClass = 'jbxx-btn';
            jqgl_ck_Man.jbxx_show = false;
            jqgl_ck_Man.fzkpStatus = true;
            jqgl_ck_Man.kpType = 'fzkp';
            break;

    }

}
//已考评:获取警情考评项列表[基层考评跟法制考评复用:传类型进去]
function getEvaInfo(type) {
    ajax({
        url: '/gmvcs/audio/policeSituation/eva/info/' + jqgl_session.getJqbh(),
        method: 'get',
        data: {
            // type: type,
            // dataType: "PS",
            // bh: jqgl_session.getJqbh()
        },
        cache: false
    }).then(ret => {
        if (ret.code == 0) {
            let tempEvaList = [];
            //增加ret.data==null的判断,避免执行ret.data.comment报错
            if (!ret.data) {

            } else {
                if (ret.data.comment) {
                    jqgl_ck_Man.alreadyKP_cont.comment = ret.data.comment;
                } else {
                    jqgl_ck_Man.alreadyKP_cont.comment = "无";
                }
                jqgl_ck_Man.alreadyKP_cont.result = (ret.data.passed ? '通过。原因：' : '不通过。原因：') + ret.data.result;
                jqgl_ck_Man.alreadyKP_cont.orgName = ret.data.orgName;
                jqgl_ck_Man.alreadyKP_cont.userName = ret.data.userName;
                jqgl_ck_Man.alreadyKP_cont.userCode = ret.data.userCode;
                jqgl_ck_Man.alreadyKP_cont.createTime = formatDate(ret.data.createTime);
                // avalon.each(ret.data.evaItems, function (index, val) {
                //     if (val.check) {
                //         tempEvaList.push({
                //             name: val.name
                //         });
                //     }
                // });
                // //若考评项均是false,则页面展示->考核标准:无
                // if (tempEvaList.length == 0) {
                //     jqgl_ck_Man.alreadyKP_cont.alreadyEvaLists = [];
                //     jqgl_ck_Man.alreadyKP_cont.noneEvaList = true;
                // } else {
                //     jqgl_ck_Man.alreadyKP_cont.alreadyEvaLists = tempEvaList;
                //     jqgl_ck_Man.alreadyKP_cont.noneEvaList = false;
                // }
                //展示已考评
                jqgl_ck_Man.cjxx_show = 1;
            }
        } else {
            notification.error({
                message: '服务器后端错误,请联系管理员',
                title: '温馨提示'
            });
        }
    });
}

//未考评
function getPolicesituation() {
    //判断是否已经存储有考评项列表,有->缓存拿数据;无->重新请求;
    if (globalEvaList.retData.length != 0) {
        let tmpSelectEva = [];
        avalon.each(globalEvaList.retData, function (index, val) {
            tmpSelectEva.push({
                name: val.name,
                code: val.code,
                check: false
            });
        });
        jqgl_ck_Man.noneKP_cont.selectEva = tmpSelectEva;
        jqgl_ck_Man.noneKP_cont.evaLists = globalEvaList.retData;
        jqgl_ck_Man.noneKP_cont.commentValue = "";
        jqgl_ck_Man.cjxx_show = 0;
        return;
    }
    //获取警情考评项列表
    ajax({
        url: '/gmvcs/audio/eva/items/policesituation',
        method: 'get',
        data: {},
        cache: false
    }).then(ret => {
        if (ret.code == 0) {
            if (ret.data.length != 0) {
                let selectEva = [];
                avalon.each(ret.data, function (index, val) {
                    selectEva.push({
                        name: val.name,
                        code: val.code,
                        check: false
                    });
                });
                //基层/法制页面切换时,避免重复调用考评项列表的接口
                globalEvaList.retData = ret.data;
                jqgl_ck_Man.noneKP_cont.selectEva = selectEva;
                jqgl_ck_Man.noneKP_cont.evaLists = ret.data;
            } else {
                notification.warn({
                    message: '考核标准项为空,请联系管理员',
                    title: '温馨提示'
                });
            }
            //展示未考评
            jqgl_ck_Man.noneKP_cont.commentValue = "";
            jqgl_ck_Man.cjxx_show = 0;
        }
    });
}

//时间戳转日期
function formatDate(date, day) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    if (day) {
        return year + "-" + month + "-" + date + "";
    } else {
        return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    }
}

let filePlayer = (function () {
    var States = {
        'picture': function (ret, dia) {
            if (ret.code == 0) {
                delete_ocx();
                dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
                var _self = this.playing;
                _self['ocxPlayer' + dia] = false;
                $('.player' + dia + '.ane-loading-mask').text('图片加载中...');
                this.playing.loading = true;
                if (dia == '_dia') {
                    $('.ane-loading-mask').css('height', '484px');
                }
                _self.imgff = false;
                setTimeout(() => {
                    this.playing.src = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                    _self.imgff = true;
                    $('.outDateMedia' + dia).css('display', 'none');
                    _self.loading = false;
                }, 10);
            } else {
                Tools.sayError('请求图片数据失败');
            }
            return;
        },
        'video': function (ret, dia) {
            delete_ocx();
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                jqgl_ck_Man.imgff = false;
                // this.playing['ocxPlayer' + dia] = true;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                this.playing.media_type = false;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('视频地址无效，无法播放');
                    return;
                }
                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    // this.playing.video_url = 'http://10.10.17.93/audio_test3.wav';
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300);
            } else {
                Tools.sayError('请求视频数据失败');
            }
        },
        'audio': function (ret, dia) {
            delete_ocx();
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                this.playing['ocxPlayer' + dia] = true;
                this.playing.imgff = false;
                $('.outDateMedia' + dia).css('display', 'none');
                this.playing['ocxPlayer' + dia] = false;
                this.playing.media_type = true;
                this.playing.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Tools.sayError('语音地址无效，无法播放');
                    return;
                }
                setTimeout(() => {
                    this.playing.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    // this.playing.video_url = 'http://10.10.17.93/audio_test3.wav';
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300);
            } else {
                Tools.sayError('请求音频数据失败');
            }
            return;
        },
        playing: null
    };
    return {
        play: function (type, rid, dia) {

            if (type == '图片') {
                type = 'picture';
            } else if (type == '视频') {
                type = 'video';
            } else if (type == '音频') {
                type = 'audio';
            } else if (type == '文本') {
                type = 'word';

                if (dia == '_dia') {
                    Tools.saySuccess('文本文件类型添加关联后需下载查看');
                } else {
                    Tools.saySuccess('文本文件类型需下载查看');
                }
                return;
            } else {
                type = 'other';

                if (dia == '_dia') {
                    Tools.saySuccess('其它文件类型添加关联后需下载查看');
                } else {
                    Tools.saySuccess('其他文件类型需下载查看');
                }
                return;
            };
            States.playing = dia == '_dia' ? tjgl_form : jqgl_ck_Man;
            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + rid,
                // url: '/api/findVideoPlayByRid',
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {
                States[type](ret, dia);
            });
        }
    };
})();

/*按照属性值，查找对象*/
function findElem(arrayToSearch, attr, val) {
    for (var i = 0; i < arrayToSearch.length; i++) {
        if (arrayToSearch[i][attr] == val) {
            return i;
        }
    }
    return -1;
}
