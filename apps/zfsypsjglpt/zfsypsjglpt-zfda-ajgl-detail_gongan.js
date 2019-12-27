import avalon from 'avalon2';
import {
    createForm,
    message
} from 'ane';
import {
    notification
} from 'ane';
import * as bootbox from 'bootbox';
import ajax from '../../services/ajaxService';
import * as menuServer from '../../services/menuService';
import {
    Gm
} from '../common/common-tools.js';
let {
    pzzzStatus
} = require('/services/configService')
let storage = require('/services/storageService.js').ret;
require('/apps/zfsypsjglpt/zfsypsjglpt-zfda-ajgl-detail_gongan.css');
export const name = 'zfsypsjglpt-zfda-ajgl-detail_gongan';

function GMTools() {};
GMTools.prototype = Object.create(new Gm().tool);
let Gm_tool = new GMTools();
let delete_ocx = require('../../apps/common/common').delete_ocx; //---引入声明
let ajgl_ck_Man = null;
let ajglMan = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-ajgl-detail_gongan.html'),
    defaults: {
        pzzzStatus: pzzzStatus,
        authority: { // 按钮权限标识
            "CHECK_TJGL": false, //音视频库_执法档案_案件关联_添加关联
            "CHECK_SCGL": false, //音视频库_执法档案_案件关联_删除关联
            "CHECK_DOWNLOAD": false //音视频库_执法档案_案件关联_下载
        },
        ajgl_back(e) {
            Object.keys(this.cjxxInfo.infomation).forEach((val, key) => {
                this.cjxxInfo.infomation[val] = '-';
            });
            if (this.ocxPlayer) {
                delete_ocx();
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
            }
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl_gongan');
        },
        bh: '',
        sp(e) {

        },
        //勾选单个媒体文件
        checkOne(e) {
            var checked = e.target.checked;
            var rid = e.target.offsetParent.attributes.name.nodeValue;

            if (checked === false) {
                Tools.checker.disCheckedWork(rid);
            } else {
                Tools.checker.checkedWork(rid);
            }
        },

        //全选勾选
        allchecked: false,
        checkAll(e) {
            var checked = e.target.checked;
            this.allchecked = checked;
            Tools.checker.allChecked(checked);
        },

        //页面标题 -- 正在看
        checkLooking: '',
        checkorgName: '',
        //共多少条关联媒体
        glmt_total: 0,

        //已选择多少条
        glmt_selected: 0,
        glmt_selected_total: 0, //共选择多少条

        //所有类型媒体的集合
        glmt_type: ['jq_checked_data', 'cj_checked_data'],
        glmt_name: ['jq', 'cj'],

        //媒体标志 -- 目前在哪一类媒体上
        glmt_mark: 'cj',

        //关联媒体 -- 接警
        // jq_clickClass: 'glmt_jj', //按钮样式
        jq_data: [], //展示的关联媒体
        jq_checked_data: [], //该媒体选中的文件
        glmt_jq_show: false, //媒体切换
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },

        // 接处警 class
        jq_clickClass: 'glmt_jj',
        // 接处警 显示隐藏
        glmt_cj_show: true,
        // 轨迹定位 class
        cj_clickClass: 'glmt_cj',
        // 轨迹定位 显示隐藏
        glmt_map_Show: false,
        //  轨迹定位传入数据
        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },
        // 接处警 ，轨迹定位 点击
        clickGlmtType(type) {
            // 接处警
            if (type == 0) {
                this.jq_clickClass = 'glmt_jj';
                this.cj_clickClass = 'glmt_cj';

                this.glmt_cj_show = true;
                this.glmt_map_Show = false;
            }
            // 轨迹定位
            if (type == 1) {
                this.jq_clickClass = 'glmt_cj';
                this.cj_clickClass = 'glmt_jj';

                this.glmt_cj_show = false;
                this.glmt_map_Show = true;
            }
        },

        //盘证制作
        glmt_pzzz(e) { //盘证制作
            let data = {};
            data.ajbh = this.jbxxInfo.infomation.ajbh;
            data.jyaq = this.jbxxInfo.infomation.jyaq;
            data.jq_data = this.cj_data;
            storage.setItem('pzzz-data', JSON.stringify(data), 0.5);
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl-detail-pzzz_gongan');
        },

        //关联媒体 -- 暂无
        cj_clickClass: 'glmt_cj',
        cj_data: [],
        cj_checked_data: [],
        glmt_cj_show: true,
        glmt_cj(e) {
            Tools.clickGlmt('cj');
        },
        jq_nodata: false,
        cj_nodata: false,

        //关联警情下拉及单独三个字段
        gljq_info: {
            bjsj: '',
            jqlbmc: '',
            bjnr: ''
        },
        selecting: '',
        typeOptions: [],
        viewJq(a, b, c) {
            this.selecting = a.target.value;
            Tools.searchMediaByJqbh();
        },

        src: '',
        video_url: '',
        audio_url: '',
        ajgl_ajbh: '', //截图的案件编号
        ocxPlayer: false,
        loading: false,
        imgff: false,
        media_type: false,
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,
        dialog_status: true,
        playingFile: '',

        //点击媒体文件名
        playFile(e) {
            $('.popover').hide();
            if (e.target.className == 'text check') {
                return;
            }
            var rid = $(e.currentTarget).find('[path]').attr('rid');
            // Tools.checker.checkedWork(rid);
            var type = $(e.currentTarget).find('[path]').attr('type'); //获取媒体类型: 视频/语音/图片/其他/文字
            var name = $(e.currentTarget).find('[path]').attr('name');
            var userName = $(e.currentTarget).find('[path]').attr('userName');
            var userCode = $(e.currentTarget).find('[path]').attr('userCode');

            // sgclkp_ck_Man.checkLooking = '正在查看：' + name;
            this.checkLooking = this.checkorgName + ' - ' + userName + '(' + userCode + ') - ' + name;
            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            ajglMan.playingFile = rid;
            this.cjxx();

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

                    // 画轨迹所需参数
                    this.mapAjaxData = {
                        "deviceId": ret.data.deviceId,
                        "fileRid": ret.data.rid,
                        "fileType": ret.data.type,
                        "beginTime": ret.data.startTime,
                        "endTime": ret.data.endTime
                    };

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
                        ajgl_ck_Man.imgff = false;
                        ajgl_ck_Man.ocxPlayer = false;
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
        jbxx_clickClass: 'jbxx-btn',
        jbxx_show: true,
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn';
            this.cjxx_clickClass = 'cjxx-btn';
            this.jbxx_show = true;
            this.cjxx_show = false;
            Tools.reduceWordForJbxx();
        },
        jbxxInfo: avalon.define({
            $id: 'ajgl_jbxx_info',
            infomation: {} //基本信息的数据
        }),

        //查看 -- 处警信息
        cjxx_clickClass: 'cjxx-btn',
        cjxx_show: false,
        cjxx(e) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.cjxx_clickClass = 'jbxx-btn';
            this.jbxx_show = false;
            this.cjxx_show = true;
            Tools.reduceWordForCjxx();
        },
        cjxxInfo: avalon.define({
            $id: 'ajgl_cjxx_info',
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            } //处警信息的数据
        }),


        //点击详细内容
        show_info: false,
        cancelInfo() {
            this.show_info = false;
            $('#gm_webplayer').css('z-index', 9999);
            $("#iframe_zfsyps").hide();
            $('.popover').hide();
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: '980px', //---- 这个是弹窗的宽度
                height: '400px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        show_allInfo() {
            $('#gm_webplayer').css('z-index', 0);
            this.show_info = true;
            Tools.addShowInfo('showInfo');
            $("#iframe_zfsyps").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_zfsyps").css({
                    "opacity": 1
                });
                $("#iframe_zfsyps").show();
            }, 600);
            Tools.reduceWordForAllInfo();
        },

        download(e) {

            if (this.cj_checked_data.length > 0) {

                if (this.cj_checked_data.length > 1) {
                    Tools.sayWarn('单次下载只能选取一个媒体文件');
                } else {
                    let _this = this;
                    let checkIfOutDate = new Promise((resolve, reject) => {
                        ajax({
                            url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + _this.cj_checked_data[0].rid,
                            method: 'get',
                            data: null,
                            cache: false
                        }).then(ret => {

                            if (ret.code == 0) {

                                if (ret.data.saveTime == -2) {
                                    reject(new Error('过期文件不提供下载!'));
                                } else {
                                    resolve();
                                }
                            } else {
                                reject(new Error('获取文件下载路径失败!'));
                            }
                        });
                    });
                    checkIfOutDate.then(val => {
                        let download = new Promise((resolve, reject) => {
                            ajax({
                                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + _this.cj_checked_data[0].rid,
                                method: 'get',
                                data: null,
                                cache: false
                            }).then(ret => {

                                if (ret.code == 0) {
                                    resolve(ret);
                                } else {
                                    reject(new Error('获取文件下载路径失败!'));
                                }
                            });
                        });
                        download.then(ret => {

                            if (_this.cj_checked_data[0].type == '图片') {
                                Tools.downloadImg(ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL);
                            } else {

                                //除了图片可以判断存在与否，其他类媒体暂时没做预处理
                                if (ret.data[0].storageFileURL || ret.data[0].wsFileURL) {
                                    window.open(ret.data[0].storageFileURL || ret.data[0].wsFileURL);
                                } else {
                                    Tools.sayError('获取文件下载路径失败!');
                                }
                            }
                        }).catch(error => {
                            Tools.sayError(error.message);
                        });
                    }).catch(error => {
                        Tools.sayError(error.message);
                    });
                }
            } else {
                Tools.sayWarn('并未选择关联媒体文件');
            }
        },

        //刷新离开
        back_confirm: false,
        move_return2(a, b) {
            $("#iframe_zfsyps").css({
                width: '299px', //---- 这个是弹窗的宽度
                height: '180px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        goback() {
            this.back_confirm = false;
            $("#iframe_zfsyps").hide();
            avalon.history.setHash('/zfsypsjglpt-zfda-ajgl_gongan');
        },
        handleCancel_confirm() {
            this.back_confirm = false;
            this.dialog_status = true;
            $("#iframe_zfsyps").hide();
        },
        onInit(event) {
            ajgl_ck_Man = this;
            ajglMan = this;
            this.bh = window.ajgl_bh;
            this.ajgl_ajbh = window.ajgl_bh;
            if (!window.ajgl_bh) {
                this.ajgl_back();
            }
            ajglMan.$watch('cj_checked_data', (v) => {

                if (v.length > 1) {
                    $('.download').prop('disabled', true).css('background', '#d4d7d9');
                } else {
                    $('.download').prop('disabled', false).css('background', '#0078d7');;
                }
            });
            ajglMan.$watch('jbxxInfo.infomation', (v) => {

                if (v.sldwmc.length >= 30) {
                    $('.jbxx-inline span:nth-child(2)[class!="innerSpan"]').css({
                        width: '29%',
                        'min-width': '350px'
                    });
                }
            });
            Tools.searchCaseInfo(); //初始化基本信息和处警信息        
            Tools.checker.setChecker(); //初始化勾选的控制器

            ajglMan.jbxx();

            ajgl_ck_Man.loading = true;
            ajgl_ck_Man.loading = false;
            ajgl_ck_Man.ocxPlayer = true;
            $("#ocxPlayer").css("visibility", "hidden");

            //播放器设置
            this.video_url = "";
            this.play_status = false;
            this.web_width = $("#ocxPlayer").width();
            this.web_height = $("#ocxPlayer").height();
            this.web_left = $("#ocxPlayer").offset().left + 1;
            this.web_top = $("#ocxPlayer").offset().top + 1;

            this.resizeTimer = null;
            setTimeout(function () {
                $("#ocxPlayer").css("visibility", "visible");

                $(window).resize(function () {
                    clearTimeout(ajglMan.resizeTimer);
                    $("#ocxPlayer").css("visibility", "hidden");
                    ajglMan.resizeTimer = setTimeout(function () {
                        ajglMan.web_width = $(".player").width();
                        $('#gm_webplayer').css('width', $(".player").width());
                        ajglMan.web_height = $("#ocxPlayer").height();
                        $("#ocxPlayer").css("visibility", "visible");
                    }, 100);
                });

                ajglMan.$watch('ocxPlayer', (v) => {

                    if (v) {
                        return;
                    } else {
                        ajglMan.play_status = false;
                    }
                });
            }, 1000);
            // 添加关联、删除关联、下载按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_AJGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_TJGL":
                            ajgl_ck_Man.authority.CHECK_TJGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_CHECK_SCGL":
                            ajgl_ck_Man.authority.CHECK_SCGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_AJGL_DOWNLOAD":
                            ajgl_ck_Man.authority.CHECK_DOWNLOAD = true;
                            break;
                    }
                });
            });
        },
        onReady() {
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

                    if (_this.back_confirm) {
                        return;
                    }

                    ajglMan.back_confirm = true;
                    ajglMan.dialog_status = false;
                    Tools.addConfirmClass('tjglConfirm');
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
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-ajgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-ajgl_gongan");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-ajgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-ajgl_gongan");
            });
        },
        onDispose() {
            $(document).unbind("keydown");

            if (this.ocxPlayer) {
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
                delete_ocx();
            }
        }
    }
});
let all_info = avalon.define({
    $id: 'ajgl-allinfo',
    title: '详细'
});
let info_body = avalon.define({
    $id: 'allinfo_body',
    allInfomation: {}
});
/**********通用函数工具类**********/
let Tools = {
    downloadImg(pathImg) {
        let imgLoad = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = function () {
                resolve(pathImg);
            };
            image.onerror = function () {
                reject(new Error('该图片文件不存在'));
            };
            image.src = pathImg;
        });
        imgLoad.then(pathImg => {
            window.open(pathImg);
        }).catch(error => {
            Tools.sayWarn(error.message);
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
    checkPlayerWeb() {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    },
    checkPlayerExist() {
        let _this = this;
        if (this.checkPlayerWeb()) {
            try {
                ie_obj = new ActiveXObject("zapwebplayer.ZapWebPlayer.1");
            } catch (e) {
                this.sayWarn('请先安装播放器，并允许浏览器加载');
            }
        } else {
            //暂无检测手段
        }
    },
    checkIE: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
            return true;
        } else {
            return false;
        };
    },
    checkIE11: function () {

        if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "WOW64") {
            return true;
        } else {
            return false;
        };
    },
    searchMediaByJqbh: function () {
        var id = ajglMan.selecting;

        if (id == '') {
            ajglMan.gljq_info = {
                bjsj: '',
                jqlbmc: '',
                bjnr: ''
            };
            info_body.allInfomation = {
                jqbh: '',
                bjsj: '',
                sfdd: '',
                bjrxm: '',
                bjrdh: '',
                bjnr: '',
                ddxcsj: '',
                cjrxm: '',
                xbmjmc: '',
                cjdwmc: '',
                sfsj: '',
                cjsj: '',
                jlly: '',
                jqlbmc: '',
                mjyj: '',
            };
            ajgl_ck_Man.cj_data = [];
            ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
            ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
            this.configGlmtNumber(); //关联媒体总数和选中个数
            this.configAllChecked();
            return;
        }
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + id,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {
                    Tools.saySuccess('该警情无相关数据');
                    ajglMan.gljq_info = {
                        bjsj: '',
                        jqlbmc: '',
                        bjnr: ''
                    };
                    info_body.allInfomation = {
                        jqbh: '',
                        bjsj: '',
                        sfdd: '',
                        bjrxm: '',
                        bjrdh: '',
                        bjnr: '',
                        ddxcsj: '',
                        cjrxm: '',
                        xbmjmc: '',
                        cjdwmc: '',
                        sfsj: '',
                        cjsj: '',
                        jlly: '',
                        jqlbmc: '',
                        mjyj: '',
                    };
                    ajgl_ck_Man.cj_data = [];
                    ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
                    ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数
                    this.configAllChecked();
                    return;
                }

                //处理关联警情字段
                ret.data.jlly = ret.data.jlly.join(',') == '01' ? '后台系统同步' : '管理系统人工录入';
                ajglMan.gljq_info = ret.data;

                ret.data.cjsj = ret.data.cjsj.map(function (cjsj) {
                    return formatDate(cjsj);
                }).join(',');
                ret.data.cjdwmc = ret.data.cjdwmc.join(',');
                ret.data.mjyj = ret.data.mjyj.join(',');
                ret.data.ddxcsj = (ret.data.ddxcsj.map(function (ddxcsj) {
                    return formatDate(ddxcsj);
                })).join(',');
                ret.data.cjrxm = ret.data.cjrxm.join(',') + '(' + (ret.data.cjr ? ret.data.cjr.join(',') : '') + ')';

                info_body.allInfomation = ret.data;
                Tools.reduceWordForGljq();

                //处理通过警情ID获得的媒体文件
                ret.data.preBaseFiles = ret.data.preBaseFiles ? ret.data.preBaseFiles : [];
                ret.data.handelerBaseFiles = ret.data.handelerBaseFiles ? ret.data.handelerBaseFiles : [];
                ['preBaseFiles', 'handelerBaseFiles'].forEach(function (val, key) {
                    ret.data[val].forEach(function (val, key) {
                        val.checked = false;
                        val.importTime = formatDate(val.importTime);
                        val.startTime = formatDate(val.startTime);
                        val.duration = Tools.formatDuring(val.duration * 1000);
                        val.toggle = false;
                        val.keyFile = val.match == true ? '已关联' : '未关联';
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
                ajgl_ck_Man.cj_data = ret.data.handelerBaseFiles;
                ajgl_ck_Man.jq_nodata = !Boolean(ajgl_ck_Man.jq_data.length);
                ajgl_ck_Man.cj_nodata = !Boolean(ajgl_ck_Man.cj_data.length);
                this.configGlmtNumber(); //关联媒体总数和选中个数
                this.configAllChecked();
                Gm_tool.reduceWord('.cmspan_prop span', '.cmspan_prop', 15)
            }
        });
    },
    clearPlayer: function (type) {
        var playing = type == '_dia' ? tjgl_form : ajgl_ck_Man;

        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing['ocxPlayer' + type] = false;
        playing.video_url = '';
        // playing['ocxPlayer' + type] = false;
        playing.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
    },
    reduceWordForToggle: function () {
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
    reduceWordForAllInfo: function () {
        $('.allinfo-dialog span').each(function () {

            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.allinfo-dialog').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'top',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text().split('：')[1] + '</div>';
            },
            animation: false
        });

    },
    reduceWordForGljq: function () {

        $('.gljq_inline .commonSpan div').each(function () {
            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.gljq_inline').find($("[data-toggle='popover']")).each(function () {

            $(this).popover({

                container: 'body',
                placement: 'top',
                html: 'true',
                content: function () {
                    return '<div class="title-content">' + $(this).text() + '</div>';
                },
                animation: false
            });
        });

    },
    reduceWordForHead: function () {

        if ($('.ajgl-ck-head span').text().length > 15) {
            $('.ajgl-ck-head span').attr('title', $('.ajgl-ck-head span').text());
        }
    },
    setPopover: function (ele) {
        ele.on("mouseenter", function () {
            var _this = this;
            clearTimeout(_this.timer);
            _this.timer = setTimeout(function () {
                $('div').siblings(".popover").popover("hide");
                $(_this).popover("show");
            }, 500);
            // _this.timer2 = setTimeout(function(){
            //     $( _this).popover('hide');
            // },5000);
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
        }).on('shown.bs.popover', function () {
            $('.title-content').css('max-height', '80px');
            $('.popover').mouseleave(function () {
                $('.popover').hide();
            });
        });
    },
    reduceWordForCjxx: function () {
        $('.cjxx .innerSpan').each(function () {

            if ($(this).text().length > 15) {
                // $(this).attr('title', $(this).text());
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

            if ($(this).text().length > 14) {
                // $(this).attr('title', $(this).text());
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.jbxx').find($("[data-toggle='popover']")).popover({

            container: 'body',
            placement: 'bottom',
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).text() + '</div>';
            },
            animation: false
        });

    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    addShowInfo: function (type) {
        var className = type + 'Class';
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        if (!$('.modal-dialog').hasClass('ajgl-showinfo')) {
            $('.modal-dialog').addClass('ajgl-showinfo');
        } else {
            return;
        }
    },
    searchCaseInfo: function () {
        ajgl_ck_Man.glmt_type.forEach(function (val, key) {
            ajgl_ck_Man[val] = [];
        });
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_data'] = [];
        });
        ajax({
            url: '/gmvcs/audio/case/searchById/' + ajglMan.bh,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {

                } else {

                    //处理案件信息
                    // ajgl_ck_Man.checkLooking = ret.data.ajmc + ' (' + ret.data.ajbh + ')';
                    ret.data.afsj = formatDate(ret.data.afsj);
                    ret.data.cjrxm = ret.data.cjrxm ? ret.data.cjrxm : '-';
                    ret.data.ajlb = ret.data.ajlbmc;
                    var sary = '';
                    ret.data.involvedPeoples = ret.data.involvedPeoples ? ret.data.involvedPeoples : [{
                        rymc: '-'
                    }];
                    ret.data.involvedPeoples.forEach(function (val, key) {

                        if (key == 0) {
                            sary += val.rymc;
                        } else {
                            sary += (',' + val.rymc);
                        }
                    });
                    ret.data.sary = sary;
                    ajgl_ck_Man.jbxxInfo.infomation = ret.data;
                    ajgl_ck_Man.checkorgName = ret.data.sldwmc;

                    Tools.reduceWordForJbxx();
                    Tools.reduceWordForHead();

                    //关联警情下拉菜单
                    var selectOption = [];
                    ret.data.policeSituation = ret.data.policeSituation ? ret.data.policeSituation : [];
                    ret.data.policeSituation.forEach(function (value, index, arr) {
                        selectOption.push({
                            label: value,
                            value: value
                        });
                    });
                    ajglMan.typeOptions = selectOption;
                    ajglMan.selecting = ret.data.policeSituation[0] ? ret.data.policeSituation[0] : '';
                    Tools.searchMediaByJqbh();
                }
            } else {

            }
        });
    },
    addConfirmClass: function (type) {
        var className = type + 'Class';
        $('.modal-content').addClass(className);
        $('.modal-content').addClass('draggable');

        if (!$('.modal-dialog').hasClass('tjgl-modalDialog-cf')) {
            $('.modal-dialog').addClass('tjgl-modalDialog-cf');
        } else {
            return;
        }
    },
    clickGlmt: function (type) {
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_clickClass'] = 'glmt_cj';
            ajgl_ck_Man['glmt_' + val + '_show'] = false;
        });
        ajgl_ck_Man[type + '_clickClass'] = 'glmt_jj';
        ajgl_ck_Man['glmt_' + type + '_show'] = true;
        ajgl_ck_Man.glmt_mark = type;
        Tools.checker.setChecker();
        Tools.configGlmtNumber();
        Tools.configAllChecked();
    },
    clearGlmtCheckedFile: function () {
        ajgl_ck_Man.glmt_name.forEach(function (val, key) {
            ajgl_ck_Man[val + '_checked_data'] = [];
        });
    },
    clickDataGlType: function (type, table_type) {
        tjgl_form.glsj_type.forEach(function (val, key) {
            tjgl_form['gl_' + val + '_data_class'] = 'gl_sxt_data';
            tjgl_form[val + '_show'] = false;
        });
        tjgl_form['gl_' + type + '_data_class'] = 'gl_zfy_data';
        tjgl_form[type + '_show'] = true;
        tjgl_form.glsj_mark = type;
        tjgl_form.glsj_table_mark = table_type;
    },
    configGlmtNumber: function () {
        var type = ajgl_ck_Man.glmt_mark;
        ajgl_ck_Man.glmt_total = ajgl_ck_Man[type + '_data'].length;
        ajgl_ck_Man.glmt_selected = ajgl_ck_Man[type + '_checked_data'].length;
        ajgl_ck_Man.glmt_selected_total = ajgl_ck_Man.jq_checked_data.length + ajgl_ck_Man.cj_checked_data.length;
    },
    configAllChecked: function () {
        var type = ajgl_ck_Man.glmt_mark;
        var data = ajgl_ck_Man[type + '_data'];

        if (data.length == 0) {
            ajgl_ck_Man.allchecked = false;
            return;
        }
        ajgl_ck_Man.allchecked = data.every(function (el) {
            return el.checked;
        });
    },
    checker: (function () {
        var States = {
            'checkJQ': function (rid) {
                Tools.pushDataWithChecked('jq', rid);
            },
            'checkCJ': function (rid) {
                Tools.pushDataWithChecked('cj', rid);
            },
            'discheckJQ': function (rid) {
                Tools.spliceDataWithChecked('jq', rid);
            },
            'discheckCJ': function (rid) {
                Tools.spliceDataWithChecked('cj', rid);
            },
            'allcheck': function (checked) {
                var type = ajgl_ck_Man.glmt_mark;
                ajgl_ck_Man[type + '_data'].forEach(function (el) {
                    el.checked = checked;
                });
                ajgl_ck_Man[type + '_checked_data'] = checked ? ajgl_ck_Man[type + '_data'].concat() : [];
                Tools.configGlmtNumber();
            }
        };
        return {
            checkedWork: null,
            disCheckedWork: null,
            allChecked: null,
            setChecker: function () {
                this.checkedWork = States['check' + ajgl_ck_Man.glmt_mark.toUpperCase()];
                this.disCheckedWork = States['discheck' + ajgl_ck_Man.glmt_mark.toUpperCase()];
                this.allChecked = States['allcheck'];
            }
        };
    })(),
    pushDataWithChecked: function (type, rid) {

        var data = ajgl_ck_Man[type + '_data'],
            aim = null,
            data_selected = ajgl_ck_Man[type + '_checked_data'],
            exist = false;

        data_selected.forEach(function (val, index) {

            if (val.rid == rid) {
                exist = true;
                return;
            }
        });
        if (exist) {
            return;
        }
        for (var i = 0, len = data.length; i < len; i++) {

            if (data[i].rid == rid) {
                data[i].checked = true;
                aim = data[i];
                break;
            }
        };
        ajgl_ck_Man.allchecked = ajgl_ck_Man[type + '_data'].every(function (el) {
            return el.checked;
        });
        ajgl_ck_Man[type + '_checked_data'].push(aim);
        this.configGlmtNumber();
    },
    spliceDataWithChecked: function (type, rid) {

        //取消勾选
        ajgl_ck_Man.allchecked = false;

        var i = 0,
            len = ajgl_ck_Man[type + '_checked_data'].length;

        for (; i < len; i++) {

            if (ajgl_ck_Man[type + '_checked_data'][i].rid == rid) {
                ajgl_ck_Man[type + '_checked_data'][i].checked = false;
                ajgl_ck_Man[type + '_checked_data'].splice(i, 1);
                break;
            }
        };
        this.configGlmtNumber();
    },
    init: function () {

    }
};
avalon.filters.formatDate = function (str) {

    if (str == '' || str == null) {
        return '-';
    } else {
        return formatDate(str);
    }
};
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null) {
        return '-';
    } else {
        return str;
    }
};
let tjgl_confirm = avalon.define({
    $id: 'back-confirm',
    title: '提示'
});
//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
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
                }, 10)
            } else {
                Tools.sayError('请求图片数据失败');
            }
            return;
        },
        'video': function (ret, dia) {
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                delete_ocx();
                this.playing.imgff = false;
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
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300)
            } else {
                Tools.sayError('请求视频数据失败');
            }
        },
        'audio': function (ret, dia) {
            this.playing.loading = false;
            dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');

            if (ret.code == 0) {
                delete_ocx();
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
                    this.playing['ocxPlayer' + dia] = true;
                    this.playing.play_status = true;
                }, 300)
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
            States.playing = dia == '_dia' ? tjgl_form : ajgl_ck_Man;

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