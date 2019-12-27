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
require('/apps/zfsypsjglpt/zfsypsjglpt-zfda-jqgl-detail_gongan.css');
export const name = 'zfsypsjglpt-zfda-jqgl-detail_gongan';

function GMTools() {};
GMTools.prototype = Object.create(new Gm().tool);
let Gm_tool = new GMTools();
let delete_ocx = require('../../apps/common/common').delete_ocx; //---引入声明
let jqgl_ck_Man = null;
let jqglMan = null;
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-jqgl-detail_gongan.html'),
    defaults: {

        bh: '',

        //点击返回按钮
        jqgl_back(e) {
            Object.keys(this.cjxxInfo.infomation).forEach((val, key) => {
                this.cjxxInfo.infomation[val] = '-';
            });

            if (this.ocxPlayer) {
                delete_ocx();
                $("#gm_webplayer").hide();
                this.play_status = false;
                this.ocxPlayer = false;
                // delete_ocx();
            }
            avalon.history.setHash('/zfsypsjglpt-zfda-jqgl_gongan');
        },
        sp(e) {

            //用于点击勾选框阻止父级点击事件触发两次
        },

        //勾选单个媒体
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
        toggleShowCk: true,
        toggleShowTJGL: false,
        goBackFromTjgl() {
            tjgl_form.bjsj = ['last-week'];
            $('[name=user]').val('');
            tjgl_dialog.handleCancel();
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

        //媒体标志 -- 目前在那一类媒体上
        glmt_mark: 'cj',

        //关联媒体 -- 警情(接警和处警被合并了)
        jq_clickClass: 'glmt_jj', //按钮样式
        jq_data: [], //警情媒体
        jq_checked_data: [], //选中的警情媒体
        glmt_jq_show: false, //媒体切换
        gjdwMapShow: false,
        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },
        glmt_jq(e) { //点击警情  
            Tools.clickGlmt('jq');
        },
        glmt_tab_click(index) {
            if (0 == index) {
                this.jq_clickClass = 'glmt_jj';
                this.cj_clickClass = 'glmt_cj';
                this.glmt_cj_show = true;
                this.gjdwMapShow = false;
                $('.glmt-cj-content').css('height', '384px');
            } else {
                this.jq_clickClass = 'glmt_cj';
                this.cj_clickClass = 'glmt_jj';
                this.glmt_cj_show = false;
                this.gjdwMapShow = true;
                $('.glmt-cj-content').css('height', '424px');
            }
        },

        //关联媒体 -- 暂无
        cj_clickClass: 'glmt_cj', //按钮样式
        cj_data: [],
        cj_checked_data: [], //选中的处警媒体
        glmt_cj_show: true, //媒体切换
        glmt_cj(e) { //点击暂无 
            Tools.clickGlmt('cj');
        },

        jq_nodata: false,
        cj_nodata: false,

        src: '',
        video_url: '',
        audio_url: '',
        ocxPlayer: false,
        loading: false,
        imgff: false,
        media_type: false,
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,
        playingFile: '',

        //点击媒体文件名
        playFile(e) {

            //选中复选框时不触发该事件
            if (e.target.className == 'text check') {
                return;
            }

            /*获得相应的请求字段值*/
            var rid = $(e.currentTarget).find('[path]').attr('name'); //获取元素属性上用于请求的rid
            this.cjxxInfo.showing = rid; //更新正在展示的媒体rid
            // Tools.checker.checkedWork(rid); //点击整个媒体数据时选中该媒体复选框
            var type = $(e.currentTarget).find('[path]').attr('type'); //获取媒体类型: 视频/语音/图片/其他/文字
            var userName = $(e.currentTarget).find('[path]').attr('userName');
            var userCode = $(e.currentTarget).find('[path]').attr('userCode');
            var mark = jqgl_ck_Man.glmt_mark; //获取哪一类的关联媒体: 处警/接警等等
            /*获取结束*/

            //增加选中状态，切换底部信息栏
            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            jqglMan.playingFile = rid; //更新正在展示的媒体rid
            this.cjxx(); //自动切换到媒体信息栏

            //更新媒体信息
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    // 画轨迹所需参数
                    this.mapAjaxData = {
                        "deviceId": ret.data.deviceId,
                        "fileRid": ret.data.rid,
                        "fileType": ret.data.type,
                        "beginTime": ret.data.startTime,
                        "endTime": ret.data.endTime
                    };

                    /*处理,转换返回的字段*/
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
                    /*处理结束*/

                    if (ret.data.saveTime == '已过期') {

                        //过期文件不予播放
                        ret.data.path = "-";
                        jqgl_ck_Man.imgff = false;
                        jqgl_ck_Man.ocxPlayer = false;
                        $('.finishDelete').css('display', 'none');
                        $('.outDateMedia').css('display', 'block');
                        Tools.sayWarn('该文件已过期');
                    } else {
                        filePlayer.play(type, rid, '');
                    }

                    //更新底部的媒体信息栏，并对过长字段赋予popover
                    this.cjxxInfo.infomation = ret.data;
                    Tools.reduceWordForCjxx();
                } else {
                    Tools.sayError('获取详细媒体信息失败');
                }
            });
        },

        //点击添加关联
        show: false,
        tjgl(e) {
            delete_ocx();
            this.ocxPlayer = false;
            this.show = true;
            tjgl_form.loading = true;
            tjgl_form.loading = false;

            tjgl_form.tjgl_search();
            $('.jqtbprevPage').attr("disabled", "disabled").css('background', '#d4d7d9');
            tjgl_form.ocxPlayer_dia = true;
            $("#ocxPlayer_dia").css("visibility", "hidden");

            //播放器设置
            tjgl_form.video_url = "";
            tjgl_form.play_status = false;
            tjgl_form.web_width = $("#ocxPlayer_dia").width();
            tjgl_form.web_height = $("#ocxPlayer_dia").height();
            tjgl_form.web_left = $("#ocxPlayer_dia").offset().left + 1;
            tjgl_form.web_top = $("#ocxPlayer_dia").offset().top + 1;

            setTimeout(function () {
                $("#ocxPlayer_dia").css("visibility", "visible");
            }, 1000);
        },

        //点击删除关联
        show_confirm: false,
        delgl(e) {

            //删除选中的关联并重置关联媒体
            var i = 0,
                len = this.glmt_type.length,
                hasData = false;
            for (; i < len; i++) {

                var type = this.glmt_type[i];
                if (this[type].length > 0) {
                    hasData = true;
                    break;
                }
            };

            if (hasData) {
                $('#gm_webplayer').css('z-index', 0);
                this.show_confirm = true;
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
                $('.tjglConfirmClass .modal-title').text('确定删除');
            } else {
                Tools.sayWarn('并未选择关联媒体文件');
            }
        },
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: '299px', //---- 这个是弹窗的宽度
                height: '180px', //---- 这个是弹窗的高度
                left: a,
                top: b
            });
        },
        handleOk_confirm() {
            var data = {
                bh: jqglMan.bh,
                lx: 2,
                rids: []
            };
            var i = 0,
                len = this.glmt_type.length;
            for (; i < len; i++) {
                var mtType = this.glmt_type[i];
                var arr = this[mtType];
                var j = 0,
                    jlen = arr.length,
                    gllx;
                switch (mtType) {

                    case 'jq_checked_data':
                        gllx = 1;
                        break;

                    case 'cj_checked_data':
                        gllx = 2;
                        break;

                }
                for (; j < jlen; j++) {
                    data.rids.push({
                        rid: arr[j].rid,
                        gllx: gllx
                    });
                }
            };
            data.rids.forEach(function (val, index) {

                if (val.rid == jqgl_ck_Man.cjxxInfo.showing) {
                    jqgl_ck_Man.cjxxInfo.exist = true;
                    return;
                }
            });
            ajax({
                url: '/gmvcs/audio/case/deleteRelevance',
                method: 'post',
                data: data,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    //重置关联媒体
                    Tools.searchJQInfo();

                    //重置处警信息展示栏
                    if (jqgl_ck_Man.cjxxInfo.exist) {
                        jqgl_ck_Man.cjxxInfo.infomation = {
                            jobType: '-',
                            path: '-',
                            userName: '-',
                            userCode: '-',
                            keyFile: '-',
                            startTime: '-',
                            saveTime: '-',
                            importTime: '-'
                        };
                        jqgl_ck_Man.cjxxInfo.showing = '';
                        jqgl_ck_Man.cjxxInfo.exist = false;
                    }

                    Tools.saySuccess('删除关联成功');
                    this.show_confirm = false;
                    $('#gm_webplayer').css('z-index', 9999);

                    // Tools.showPlayer('ply');
                    $("#iframe_zfsyps").hide();

                    //如果删除的关联媒体中含有正在展示的媒体，则给予相应的提示并把下方媒体信息栏清空
                    var exist = data.rids.some(function (value, index, arr) {
                        return value.rid == jqglMan.playingFile;
                    });

                    if (exist) {
                        setTimeout(function () {
                            jqgl_ck_Man.imgff = false;
                            jqgl_ck_Man.video_url = '';
                            jqgl_ck_Man.ocxPlayer = false;
                            $('.finishDelete').css('display', 'block');
                            $('.outDateMedia').css('display', 'none');
                        }, 100);
                    } else {

                    }
                } else {
                    Tools.sayError(ret.msg);
                    this.show_confirm = false;
                    $('#gm_webplayer').css('z-index', 9999);
                    $("#iframe_zfsyps").hide();
                }
            });
        },
        handleCancel_confirm1() {
            this.show_confirm = false;
            $('#gm_webplayer').css('z-index', 9999);
            $("#iframe_zfsyps").hide();
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
            $id: 'jqgl_jbxx_info',
            infomation: {} //要做数据初始化
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
            $id: 'jqgl_cjxx_info',
            showing: '',
            exist: false,
            infomation: {
                jobType: '-',
                path: '-',
                userName: '-',
                userCode: '-',
                keyFile: '-',
                startTime: '-',
                saveTime: '-',
                importTime: '-'
            } //要做数据初始化
        }),

        authority: { // 按钮权限标识
            "CHECK_TJGL": false, //音视频库_执法档案_警情关联_查看_添加关联
            "CHECK_SCGL": false, //音视频库_执法档案_警情关联_查看_删除关联
            "CHECK_DOWNLOAD": false //音视频库_执法档案_警情关联_下载
        },

        //刷新离开
        back_confirm: false,
        move_return(a, b) {
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
            avalon.history.setHash('/zfsypsjglpt-zfda-jqgl_gongan');
        },
        handleCancel_confirm() {
            this.back_confirm = false;
            this.dialog_status = true;
            $("#iframe_zfsyps").hide();
        },
        resizeST: null,
        onInit(event) {
            jqgl_ck_Man = this;
            jqglMan = this;
            jqglMan.bh = window.jqgl_bh;
            if (!window.jqgl_bh) {
                this.jqgl_back();
            }
            Tools.searchJQInfo(); //初始化基本信息和处警信息          

            //初始化勾选的控制器
            Tools.checker.setChecker();
            Tools.diaChecker.setChecker();

            jqgl_ck_Man.jbxx(); //警情信息栏置为优先显示

            //初始化蒙板
            jqgl_ck_Man.loading = true;
            jqgl_ck_Man.loading = false;

            //初始化播放器
            jqgl_ck_Man.ocxPlayer = true;
            $("#ocxPlayer").css("visibility", "hidden");

            //播放器设置
            this.video_url = "";
            this.play_status = false;
            this.web_width = $("#ocxPlayer").width();
            this.web_height = $("#ocxPlayer").height();
            this.web_left = $("#ocxPlayer").offset().left + 1;
            this.web_top = $("#ocxPlayer").offset().top + 1;

            //自适应的处理
            function resize(params) {
                clearTimeout(jqglMan.resizeST);
                if (jqglMan.show) {

                    if (tjgl_form.ocxPlayer_dia) {
                        jqglMan.resizeST = setTimeout(() => {
                            Tools.setDiaPlayerWH();
                        }, 10);
                    }
                } else {

                    if (jqglMan.ocxPlayer) {
                        jqglMan.resizeST = setTimeout(() => {
                            Tools.setPlayerWH();
                        }, 10)
                    }
                }
            }
            setTimeout(function () {
                $("#ocxPlayer").css("visibility", "visible");

                $(window).resize(function () {
                    resize();
                });
                $(window).scroll(function () {
                    resize();
                });
                jqglMan.$watch('ocxPlayer', (v) => {

                    if (v) {
                        return;
                    } else {
                        jqglMan.play_status = false;
                    }
                });
            }, 1000);
            jqglMan.$watch('show', (v) => {

                this.toggleShowCk = !v;
                this.toggleShowTJGL = v;

                if (v) {

                }
            });
            jqgl_ck_Man.$watch('cj_checked_data', (v) => {

                if (v.length > 1) {
                    $('.download').prop('disabled', true).addClass('disablebtn');
                } else {
                    $('.download').prop('disabled', false).removeClass('disablebtn');
                }
            });
            jqgl_ck_Man.$watch('jbxxInfo.infomation', (v) => {

                if (v.jqbh.length >= 30) {
                    $('.jbxx-inline span:nth-child(1)').css({
                        'min-width': '350px',
                        width: '21%'
                    });
                    $('.jbxx-inline > span:gt(0)').css({
                        width: '17%'
                    });
                    $('.jbxx-inline > span:nth-child(1)').css({
                        width: '21%'
                    });
                }
            });
            // 添加关联、删除关联、下载按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_ZFDA_JQGL_/.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                if (func_list.length == 0)
                    return;

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK_TJGL":
                            jqgl_ck_Man.authority.CHECK_TJGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JQGL_CHECK_SCGL":
                            jqgl_ck_Man.authority.CHECK_SCGL = true;
                            break;
                        case "AUDIO_FUNCTION_ZFDA_JQGL_DOWNLOAD":
                            jqgl_ck_Man.authority.CHECK_DOWNLOAD = true;
                            break;
                    }
                });
            });
        },

        onReady() {
            $('.top-form input.form-control[name]').each(function (index, ele) {
                $(ele).wrap('<div class="inputWrap" />');
            });
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

                    jqglMan.back_confirm = true;
                    jqglMan.dialog_status = false;
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
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-jqgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-jqgl_gongan");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-zfda-jqgl") > -1)
                    avalon.history.setHash("/zfsypsjglpt-zfda-jqgl_gongan");
            });
        },
        onDispose() {
            $(document).unbind("keydown");

            if (this.ocxPlayer || tjgl_form.ocxPlayer_dia) {
                $("#gm_webplayer").hide();
                // document.getElementById('gm_webplayer').contentWindow.stop();
                $('#gm_webplayer').hide();
                delete_ocx();
            }
        }
    }
});
/**********添加关联弹窗以及弹窗查询表单**********/
let tjgl_dialog = avalon.define({
    $id: 'jqgl_tjgl_dialog',
    handleCancel(e) {
        tjgl_form.bjsj = ['last-week'];
        $('[name=user]').val('');
        Tools.clearPlayer('_dia');
        tjgl_form.kssj_isNull = 'none';
        tjgl_form.jssj_isNull = 'none';
        tjgl_form.allchecked = false;
        jqgl_ck_Man.show = false;
        $("#iframe_zfsyps").hide();

        //取消关闭弹窗时恢复表格初始化状态
        tjgl_form.diaglmt_data = [];
        tjgl_form.diaglmt_selected = [];
        tjgl_form.dateShow = false;
        tjgl_form.noDataShow = false;
        tjgl_form.fullDataShow = false;
        //清理查询表单
        Tools.clearFormCk();
    },
    move_return(a, b) {
        $("#iframe_zfsyps").css({
            width: '1320px', //---- 这个是弹窗的宽度
            height: '600px', //---- 这个是弹窗的高度
            left: a,
            top: b
        });
    },
    handleOk() {
        //添加关联
        if (tjgl_form.diaglmt_selected.length == 0) {
            Tools.sayWarn('没有勾选数据');
            return;
        };
        var data = {
                bh: jqglMan.bh,
                lx: 2,
                rids: []
            },
            gllx;
        switch (jqgl_ck_Man.glmt_mark) {
            case 'jq':
                gllx = 1;
                break;
            case 'cj':
                gllx = 2;
                break;
        }
        tjgl_form.diaglmt_selected.forEach(function (val, key) {
            data.rids.push({
                rid: val.rid,
                gllx: gllx
            });
        });
        ajax({
            url: '/gmvcs/audio/case/addRelevance',
            method: 'post',
            data: data,
            cache: false
        }).then(ret => {
            if (ret.code == 0) {
                //添加完关联后重置关联媒体和选中媒体记录
                tjgl_form.diaglmt_data = [];
                tjgl_form.diaglmt_selected = [];
                Tools.searchJQInfo();
                Tools.saySuccess('添加关联成功');

                //重置警情展示栏
                jqgl_ck_Man.cjxxInfo.infomation = {
                    jobType: '-',
                    path: '-',
                    userName: '-',
                    userCode: '-',
                    keyFile: '-',
                    startTime: '-',
                    saveTime: '-',
                    importTime: '-'
                };
                jqgl_ck_Man.cjxxInfo.showing = '';
                jqgl_ck_Man.cjxxInfo.exist = false;
            } else if (ret.code == 1605) {
                Tools.sayWarn(ret.msg);
                tjgl_form.diaglmt_data = [];
                tjgl_form.diaglmt_selected = [];
            } else {
                Tools.sayError('添加关联失败,请联系管理员');
                tjgl_form.diaglmt_data = [];
                tjgl_form.diaglmt_selected = [];
            }
        });
        Tools.clearFormCk();
        tjgl_form.bjsj = ['last-week'];
        $('[name=user]').val('');
        tjgl_form.dateShow = false;
        tjgl_form.fullDataShow = false;
        tjgl_form.noDataShow = false;
        jqgl_ck_Man.show = false;
        $("#iframe_zfsyps").hide();

        //添加关联后播放器重置
        Tools.clearPlayer('_dia');
    },
    tjgl_search() {
        tjgl_form.fetch(true);
    },
});
let tjgl_confirm = avalon.define({
    $id: 'tjgl-confirm',
    title: '提示'
});
let back_confirm = avalon.define({
    $id: 'back-confirm',
    title: '提示'
});
let tjgl_pagi = avalon.define({
    $id: 'glmt_pagination',
    perCount: 4,
    total: 0,
    now: 0,
    overLimit: false,
    $computed: {
        all: function () {
            return Math.ceil(this.total / this.perCount);
        }
    },
    firstPage(e) {
        tjgl_form.pagination.page = 0;
        tjgl_form.diaglmt_data = [];
        tjgl_form.diaglmt_selected = [];
        tjgl_form.fetch();
    },
    lastPage(e) {
        tjgl_form.pagination.page = this.all - 1;
        tjgl_form.diaglmt_data = [];
        tjgl_form.diaglmt_selected = [];
        tjgl_form.fetch();
    },
    nextPage(e) {

        if (tjgl_form.pagination.page == this.all - 1) {
            return;
        } else {
            tjgl_form.diaglmt_data = [];
            tjgl_form.diaglmt_selected = [];
            tjgl_form.pagination.page += 1;
            tjgl_form.fetch();
        }
    },
    prevPage(e) {
        if (tjgl_form.pagination.page == 0) {
            return;
        } else {
            tjgl_form.diaglmt_data = [];
            tjgl_form.diaglmt_selected = [];
            tjgl_form.pagination.page -= 1;
            tjgl_form.fetch();
        }
    }
});
let tjgl_form = avalon.define({
    $id: 'jqgl_tjgl_form',
    title: '添加关联',
    IEMark: false,
    IEMark2: false,
    $form: createForm({
        autoAsyncChange: true,
        record: jqgl_ck_initialData(),
    }),
    tjgl_search() {
        this.fetch(true);
    },

    //input
    jqgl_close_user: false,
    close_click(e) {
        switch (e) {
            case 'user':
                $('.diaglmt').find($("[name = 'user']")).val('');
                $('.diaglmt').find($("[name = 'user']")).focus();
                tjgl_form.$form.record.user = '';
                break;
        }
    },
    input_focus(e) {
        switch (e) {
            case 'user':
                this.jqgl_close_user = true;
                break;
        }
    },
    input_blur(e) {
        switch (e) {
            case 'user':
                this.jqgl_close_user = false;
                break;
        }
    },
    pagination: {
        page: 0,
        total: 0,
        pageSize: 4
    },
    diamt_total: 0,
    selected_length: 0,
    allchecked: false,
    checkAll: function (e, x, y) {
        var checked = e.target.checked;
        this.allchecked = checked;
        Tools.diaChecker.allChecked(checked);
    },
    // bottomMark: 0,
    enter_click(e) {
        $(e.target).val($(e.target).val().replace(/[`~!.;:*,""@\?#$%^&*_+<>\\\(\)\|{}\/'[\]]/img, ''));

        if (e.keyCode == "13") {
            this.fetch(true);
        }
    },
    fetch(mark) {
        var seachParams = this.$form.record;
        seachParams.user = seachParams.user.trim();

        if (mark) {
            this.pagination.page = 0;
            tjgl_pagi.now = 0;
            tjgl_pagi.total = 0;
            this.pagination.pageSize = 4;
            this.diaglmt_data = [];
            this.diaglmt_selected = [];
            tjgl_form.fullDataShow = false;
            this.allchecked = false;
        }
        seachParams.page = this.pagination.page;
        seachParams.pageSize = this.pagination.pageSize;

        //添加默认时间为一周
        if (this.dateShow) {

            if (seachParams.startTime == '' || seachParams.endTime == '') {

                if (seachParams.startTime == '') {
                    tjgl_form.kssj_isNull = 'block';
                } else {
                    tjgl_form.kssj_isNull = 'none';
                }
                if (seachParams.endTime == '') {
                    tjgl_form.jssj_isNull = 'block';
                } else {
                    tjgl_form.jssj_isNull = 'none';
                }
                return;
            } else {

                if (seachParams.startTime >= seachParams.endTime) {
                    Tools.sayWarn('开始时间不能超过结束时间');
                    return;
                }

                if (seachParams.endTime - seachParams.startTime > 365 * 86400000) {
                    Tools.sayWarn('时间间隔不能超过一年，请重新设置！');
                    return;
                }
            }
        } else {

            if (seachParams.startTime == '' && seachParams.endTime == '') {
                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;
                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;
                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);
                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);
                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                this.$form.record.endTime = Number(+sunday);
                this.$form.record.startTime = Number(+monday);
            }
        };
        seachParams.bh = jqglMan.bh;
        seachParams.lx = 2;
        let gllx = '';
        switch (jqgl_ck_Man.glmt_mark) {

            case 'jq':
                gllx = 1;
                break;

            case 'cj':
                gllx = 6;
                break;
        };
        seachParams.gllx = gllx;
        ajax({
            url: '/gmvcs/audio/basefile/findRelevance',
            method: 'post',
            data: seachParams,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                tjgl_form.diaglmt_selected = [];
                tjgl_form.allchecked = false;

                if (ret.data.currentElements && ret.data.currentElements.length == 0) {
                    Tools.dealTableWithoutDataDia();
                    return;
                };
                ret.data.currentElements.forEach(function (val, key) {
                    val.checked = false;
                    val.startTime = formatDate(val.startTime);
                    val.userName = val.userName + ' (' + val.userCode + ')';
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
                tjgl_form.noDataShow = false;
                tjgl_pagi.now = tjgl_form.pagination.page == 0 ? 1 : tjgl_form.pagination.page + 1;
                tjgl_pagi.overLimit = ret.data.overLimit;
                tjgl_pagi.total = tjgl_pagi.overLimit ? ret.data.limit * 4 : ret.data.totalElements;
                tjgl_form.diaglmt_data = ret.data.currentElements;
                Tools.reduceWordForDia();
            }
        });
    },
    //报警时间
    dateShow: false,
    noDataShow: false,
    fullDataShow: false,
    kssj_isNull: 'none',
    jssj_isNull: 'none',
    time_isNull: 'none',
    bjsj: ['last-week'],
    searchForm_bjsj_Change(e, a) {
        this.bjsj = [e.target.value];
        //以下是按照原项目计算方法 -- 时间的问题尚不够完善待修改
        Tools.timeCalculatorCk.calculate(e.target.value);
    },
    dialog_start_time: '',
    dialog_end_time: '',
    startTimeHandleChange(e) {

        if (e.target.value) {
            tjgl_form.$form.record.startTime = getTimeByDateStr(e.target.value + ' 00:00:00');
            tjgl_form.kssj_isNull = 'none';
        } else {
            tjgl_form.kssj_isNull = 'block';
            tjgl_form.$form.record.startTime = '';
        }
    },
    endTimeHandleChange(e) {
        if (e.target.value) {
            tjgl_form.$form.record.endTime = getTimeByDateStr(e.target.value + ' 23:59:59');
            tjgl_form.jssj_isNull = 'none';
        } else {
            tjgl_form.jssj_isNull = 'block';
            tjgl_form.$form.record.endTime = '';
        }
    },
    diaglmt_data: [

    ],

    diaglmt_selected: [],

    //勾选单个媒体文件
    checkOne_dia(e) {
        var checked = e.target.checked;
        var rid = $(e.target).parent().parent().attr('name');

        if (checked === false) {
            Tools.diaChecker.disCheckedWork(rid);
        } else {
            Tools.diaChecker.checkedWork(rid);
        }

        tjgl_form.allchecked = tjgl_form.diaglmt_data.every(function (el) {
            return el.checked;
        });
    },
    src: '',
    video_url: '',
    ocxPlayer_dia: false,
    audioPlayer_dia: false,
    audio_url: '',
    imgff: false,
    media_type: false,
    web_width: '',
    web_height: '',
    web_left: '',
    web_top: '',
    play_status: false,
    dialog_status: true,
    loading: false,
    //点击媒体文件
    clickMT_dia(e, z, y) {

        //获取点击的目标请求所需字段
        var checkbox = e.target;

        if (checkbox.className && checkbox.className === 'text check' || checkbox.type == 'checkbox') {
            return;
        }

        if (~e.currentTarget.className.indexOf('disable')) {
            return;
        }
        var rid = e.currentTarget.children[0].attributes.name.nodeValue;
        var type = e.currentTarget.children[0].attributes.type.nodeValue;

        //变换选中状态
        $('.clickMT').removeClass('clickMT');
        $(e.currentTarget).addClass('clickMT');

        //更新媒体信息
        ajax({
            url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
            method: 'get',
            data: null,
            cache: false
        }).then(ret => {

            if (ret.code == 0) {
                if (ret.data.saveTime == -2) {

                    //过期文件不予播放
                    tjgl_form.imgff = false;
                    tjgl_form.ocxPlayer_dia = false;
                    $('.outDateMedia_dia').css('display', 'block');
                    Tools.sayWarn('文件已过期');
                    return;
                } else {
                    filePlayer.play(type, rid, '_dia');
                }
            }
        });
    }
});
tjgl_form.$watch('pagination.page', (v) => {

    if (v == tjgl_pagi.all - 1) {
        $('.jqtbnextPage').attr("disabled", "disabled").css('background', '#d4d7d9');
    } else {
        $('.jqtbnextPage').attr("disabled", false).css('background', '');
    }

    if (v == 0) {
        $('.jqtbprevPage').attr("disabled", "disabled").css('background', '#d4d7d9');
    } else {
        $('.jqtbprevPage').attr("disabled", false).css('background', '');
    }
});
tjgl_form.$watch('ocxPlayer_dia', (v) => {

    if (v) {
        return;
    } else {
        tjgl_form.play_status = false;
    }
});
tjgl_form.$watch('kssj_isNull', (v) => {

    if (v == 'none' && tjgl_form.jssj_isNull == 'none') {
        tjgl_form.time_isNull = 'none';
    } else {
        tjgl_form.time_isNull = 'block';
    }
});
tjgl_form.$watch('jssj_isNull', (v) => {

    if (v == 'none' && tjgl_form.kssj_isNull == 'none') {
        tjgl_form.time_isNull = 'none';
    } else {
        tjgl_form.time_isNull = 'block';
    }
});
tjgl_form.$watch('diaglmt_data', (v) => {

    tjgl_form.diamt_total = v.length;
});
tjgl_form.$watch('diaglmt_selected', (v) => {

    tjgl_form.selected_length = v.length;
});

/**********通用函数工具**********/
let Tools = {
    setDiaPlayerWH() {
        tjgl_form.web_width = $("#ocxPlayer_dia").width();
        $('#gm_webplayer').css('width', $("#ocxPlayer_dia").width());
        tjgl_form.web_height = $("#ocxPlayer_dia").height();
    },
    setPlayerWH() {
        jqglMan.web_width = $("#ocxPlayer").width();
        $('#gm_webplayer').css('width', $("#ocxPlayer").width());
        jqglMan.web_height = $("#ocxPlayer").height();
    },
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
    clearPlayer: function (type) {
        delete_ocx();
        var playing = type == '_dia' ? tjgl_form : jqgl_ck_Man;

        if (type == '') {
            $('.finishDelete').css('display', 'none');
        }
        playing['ocxPlayer' + type] = false;
        playing.video_url = '';
        playing.imgff = false;
        jqgl_ck_Man.imgff = false;
        $('.outDateMedia' + type).css('display', 'none');
        $('.outDateMedia').css('display', 'none');
        $('.finishDelete').css('display', 'none');
        jqgl_ck_Man.ocxPlayer = true;
    },
    clearFormCk: function () {
        //清理表单
        tjgl_form.$form.record = jqgl_ck_initialData();
    },
    reduceWordForHead: function () {
        if ($('.jqgl-ck-head span').text().length > 15) {
            $('.jqgl-ck-head span').attr('title', $('.jqgl-ck-head span').text());
        }
    },
    reduceWordForDia: function () {
        $('.diatable .innerSpan').each(function () {

            if ($(this).text().length > 15) {
                $(this).attr('data-toggle', 'popover');
                $(this).attr('data-placement', 'top');
                Tools.setPopover($(this));
            } else {
                return;
            }
        });
        $('.diatable').find($("[data-toggle='popover']")).popover({

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
            }, 1000);

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
            $('.title-content').css('max-height', '80px');
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
    dealTableWithoutDataDia: function (page) {
        tjgl_form.noDataShow = true;
        tjgl_pagi.total = 0;
        tjgl_pagi.now = tjgl_form.pagination.page;
        tjgl_form.diaglmt_data = [];
        return;
    },
    getFirstDayOfWeek: function (date) {
        var day = date.getDay() || 7;
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
    },
    configGlmtNumber: function () {
        var type = jqgl_ck_Man.glmt_mark;
        jqgl_ck_Man.glmt_total = jqgl_ck_Man[type + '_data'].length;
        jqgl_ck_Man.glmt_selected = jqgl_ck_Man[type + '_checked_data'].length;
        jqgl_ck_Man.glmt_selected_total = jqgl_ck_Man.jq_checked_data.length + jqgl_ck_Man.cj_checked_data.length;
    },
    configAllChecked: function () {
        var type = jqgl_ck_Man.glmt_mark;
        var data = jqgl_ck_Man[type + '_data'];

        if (data.length == 0) {
            jqgl_ck_Man.allchecked = false;
            return;
        }
        jqgl_ck_Man.allchecked = data.every(function (el) {
            return el.checked;
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
        jqgl_ck_Man.glmt_name.forEach(function (val, key) {
            jqgl_ck_Man[val + '_clickClass'] = 'glmt_cj';
            jqgl_ck_Man['glmt_' + val + '_show'] = false;
        });
        jqgl_ck_Man[type + '_clickClass'] = 'glmt_jj';
        jqgl_ck_Man['glmt_' + type + '_show'] = true;
        jqgl_ck_Man.glmt_mark = type;
        Tools.checker.setChecker();
        Tools.configGlmtNumber();
        Tools.configAllChecked();
    },
    clearGlmtCheckedFile: function () {
        jqgl_ck_Man.glmt_name.forEach(function (val, key) {
            jqgl_ck_Man[val + '_checked_data'] = [];
        });
    },
    //基本信息和处警信息的查询
    searchJQInfo: function () {
        jqgl_ck_Man.glmt_type.forEach(function (val, key) {
            jqgl_ck_Man[val] = [];
        });
        jqgl_ck_Man.glmt_name.forEach(function (val, key) {
            jqgl_ck_Man[val + '_data'] = [];
        });
        ajax({
            url: '/gmvcs/audio/policeSituation/searchById/' + jqglMan.bh,
            method: 'post',
            data: '',
            cache: false
        }).then(ret => {

            if (ret.code == 0) {

                if (!ret.data) {

                } else {

                    // 处理警情信息
                    // jqgl_ck_Man.checkLooking = ret.data.jqmc + ' (' + ret.data.jqbh + ')';
                    ret.data.jqlb = ret.data.jqlbmc || '-';
                    ret.data.cjr = ret.data.cjr.join(',');
                    ret.data.cjrxm = ret.data.cjrxm.join(',');
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
                    
                    jqgl_ck_Man.checkLooking = ret.data.gxdwmc + ' - ' + ret.data.cjrxm + '(' + ret.data.cjr + ')';

                    jqgl_ck_Man.checkorgName = ret.data.gxdwmc;
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
                    jqgl_ck_Man.jq_data = ret.data.preBaseFiles;
                    jqgl_ck_Man.cj_data = ret.data.handelerBaseFiles;
                    jqgl_ck_Man.jq_nodata = !Boolean(jqgl_ck_Man.jq_data.length);
                    jqgl_ck_Man.cj_nodata = !Boolean(jqgl_ck_Man.cj_data.length);
                    this.configGlmtNumber(); //关联媒体总数和选中个数
                    this.configAllChecked();
                    Gm_tool.reduceWord('.cmspan_prop span', '.cmspan_prop', 15)
                }
            } else {

            }
        });
    },
    diaChecker: (function () {
        var States = {
            'check': function (rid) {
                Tools.pushDataWithChecked_dia(rid);
            },
            'discheck': function (rid) {
                Tools.spliceDataWithChecked_dia(rid);
            },
            'allcheck': function (checked) {

                tjgl_form.diaglmt_data.forEach(function (el) {

                    if (!el.relevanceStatus) {
                        el.checked = checked;
                    }
                });
                tjgl_form.diaglmt_selected = checked ? tjgl_form.diaglmt_data.filter((a, b) => {

                    if (!a.relevanceStatus) {
                        return a;
                    }
                }) : [];
            }
        };
        return {
            checkedWork: null,
            disCheckedWork: null,
            allChecked: null,
            setChecker: function () {
                this.checkedWork = States['check'];
                this.disCheckedWork = States['discheck'];
                this.allChecked = States['allcheck'];
            }
        };
    })(),
    pushDataWithChecked_dia: function (rid) {
        var exist = false;

        tjgl_form.diaglmt_selected.forEach(function (val, index) {

            if (val.rid == rid) {
                exist = true;
                return;
            }
        });
        if (exist) {
            return;
        }
        tjgl_form.diaglmt_data.forEach(function (val, key) {

            if (val.rid == rid) {
                val.checked = true;
                tjgl_form.diaglmt_selected.push(val);
                return;
            }
        });
    },
    spliceDataWithChecked_dia: function (rid) {
        tjgl_form.diaglmt_selected.forEach(function (val, key) {

            if (val.rid == rid) {
                val.checked = false;
                tjgl_form.diaglmt_selected.splice(key, 1);
                return;
            }
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
                var type = jqgl_ck_Man.glmt_mark;
                jqgl_ck_Man[type + '_data'].forEach(function (el) {
                    el.checked = checked;
                });
                jqgl_ck_Man[type + '_checked_data'] = checked ? jqgl_ck_Man[type + '_data'].concat() : [];
                Tools.configGlmtNumber();
            }
        };
        return {
            checkedWork: null,
            disCheckedWork: null,
            allChecked: null,
            setChecker: function () {
                this.checkedWork = States['check' + jqgl_ck_Man.glmt_mark.toUpperCase()];
                this.disCheckedWork = States['discheck' + jqgl_ck_Man.glmt_mark.toUpperCase()];
                this.allChecked = States['allcheck'];
            }
        };
    })(),
    pushDataWithChecked: function (type, rid) {

        var data = jqgl_ck_Man[type + '_data'],
            data_selected = jqgl_ck_Man[type + '_checked_data'],
            aim = null,
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
        jqgl_ck_Man[type + '_checked_data'].push(aim);
        jqgl_ck_Man.allchecked = jqgl_ck_Man[type + '_data'].every(function (el) {
            return el.checked;
        });
        this.configGlmtNumber();
    },
    spliceDataWithChecked: function (type, rid) {

        //取消勾选
        jqgl_ck_Man.allchecked = false;

        var i = 0,
            len = jqgl_ck_Man[type + '_checked_data'].length;

        for (; i < len; i++) {

            if (jqgl_ck_Man[type + '_checked_data'][i].rid == rid) {
                jqgl_ck_Man[type + '_checked_data'][i].checked = false;
                jqgl_ck_Man[type + '_checked_data'].splice(i, 1);
                break;
            }
        };
        this.configGlmtNumber();
    },
    timeCalculatorCk: (function () {
        var States = {
            'last-week': function () {
                tjgl_form.dateShow = false;

                var now = new Date();
                var oneDayTime = 24 * 60 * 60 * 1000;

                //显示周一
                var MondayTime = +Tools.getFirstDayOfWeek(now);
                //显示周日
                var SundayTime = MondayTime + 6 * oneDayTime;

                //初始化日期时间
                var monday = new Date(MondayTime);
                var sunday = new Date(SundayTime);

                sunday.setHours(23);
                sunday.setMinutes(59);
                sunday.setSeconds(59);

                tjgl_form.$form.record.endTime = String(+sunday);

                monday.setHours(0);
                monday.setMinutes(0);
                monday.setSeconds(0);
                tjgl_form.$form.record.startTime = String(+monday);
                tjgl_form.kssj_isNull = 'none';
                tjgl_form.jssj_isNull = 'none';
                $('.diatimeover .ane-datepicker-input').val('');
                now = null;
                oneDayTime = null;
                MondayTime = null;
                SundayTime = null;
                monday = null;
                sunday = null;
            },
            'last-month': function (jh) {
                tjgl_form.dateShow = false;

                var now = new Date();
                now.setDate(1);
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);

                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var d = new Date(year, month, 0);

                var end = new Date();
                end.setDate(d.getDate());
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);


                tjgl_form.$form.record.endTime = String(+end);
                tjgl_form.$form.record.startTime = String(+now);
                tjgl_form.kssj_isNull = 'none';
                tjgl_form.jssj_isNull = 'none';
                $('.diatimeover .ane-datepicker-input').val('');
                now = null;
                date = null;
                year = null;
                month = null;
                d = null;
                end = null;
            },
            'last-past-of-time': function (jh) {
                tjgl_form.dateShow = true;
                var now = new Date();
                now.setHours(23);
                now.setMinutes(59);
                now.setSeconds(59);
                var end = new Date();
                tjgl_form.$form.record.endTime = Number(+now);
                end.setMonth(now.getMonth() - 3 + '');
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                tjgl_form.$form.record.startTime = Number(+end);
                $('.diatimeover').find($("[placeholder = '开始时间']")).val(formatDate(+end, true).split(' ')[0]);
                $('.diatimeover').find($("[placeholder = '结束时间']")).val(formatDate(+now, true).split(' ')[0]);
            }
        };
        return {
            calculate: function (type) {
                States[type] && States[type]();
            }
        };
    })(),
    init: function () {

    }
};
/**********添加关联查询表单初始化函数(需单独提出)**********/
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

function jqgl_ck_initialData() {
    return {
        endTime: "",
        startTime: "",
        user: ""
    }
}
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
                let _self = this.playing;
                _self['ocxPlayer' + dia] = false;
                const promise = new Promise(function (resolve, reject) {
                    dia == '_dia' ? '' : $('.finishDelete').css('display', 'none');
                    $('.player' + dia + ' .ane-loading-mask').text('图片加载中...');
                    _self.loading = true;
                    if (dia == '_dia') {
                        $('.ane-loading-mask').css('height', '484px');
                    }
                    setTimeout(() => {
                        // _self['ocxPlayer' + dia] = false;
                        console.log('before');
                        setTimeout(() => {
                            console.log('after');
                            resolve();
                        }, 100);
                    }, 100);
                });
                promise.then(() => {
                    _self.imgff = false;
                    _self.src = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                    _self.imgff = true;
                    $('.outDateMedia' + dia).css('display', 'none');
                    _self.loading = false;
                });
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
                this.playing.media_type = true;
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