/**
 * 使用videojs的播放器插件
 * @prop {String} src                播放地址
 * @prop {String} playerID           播放器ID，为了一个页面可以多个播放器，命名时再加上时间戳精确到毫秒，以保证不会有重复的播放器id
 * @prop {String} preview_w          预览宽
 * @prop {String} preview_h          预览高
 * @example
 * ```
 * demo
 * <div :if="@pic_show">    --- 自定义外壳
 *     <ms-pic-player :widget="{src: @play_url, playerID:'xxx', preview_w:'xxx', preview_h:'xxx'}"></ms-pic-player>
 * </div>
 * 
 * 需要注意的是：
 * 1. 外壳的宽高要写好。播放器是根据外壳来定义宽高。都是100%
 * 2. 外壳需要给一个pic_show，使用的时候，才让 pic_show = true ，不使用时置 pic_show = false
 * 2. 切换照片显示时，需要置 pic_show = false 后再置 pic_show = true
 * 
 * 可参见 zfsypsjglpt-yspk-zfyps 模块
 * 
 * @author lichunsheng
 * 创建时间：2018-2-7 20:15:08
 * ```
 */
import {
    notification
} from "ane";
require("/apps/common/common-pic-player.css");
import {
    m_Event
} from "/vendor/pic_player/event.js";
import {
    Magnifier
} from "/vendor/pic_player/magnifier.js";
import {
    picFuc
} from "/vendor/pic_player/picasa.js";

import '/vendor/pic_player/viewer.css';
import Viewer from '/vendor/pic_player/viewer.js';

import {
    imageEnhanceOutPut,
    gxxOcxVersion,
    languageSelect
} from '/services/configService';
import moment from 'moment';
var storage = require('../../services/storageService.js').ret;
let language_txt = require('../../vendor/language').language;

var vm, pic_id, content_id, pic_a_id, thum_id, preview_id, magnifier_obj, pic_obj, viewer = null;
var globalOcxPlayer, item = 0,
    img_mousedown = false,
    inputPath = "",
    szOutputPath = "",
    filename = "",
    mousedown_x, mousedown_y;
avalon.component("ms-pic-player", {
    template: __inline("./common-pic-player.html"),
    defaults: {
        pic_class: languageSelect == "en" ? true : false,
        player_txt: language_txt.zfsypsjglpt.common,

        src: avalon.noop,
        playerID: avalon.noop,
        preview_w: avalon.noop,
        preview_h: avalon.noop,
        fd_flag: false,
        is_IE: isIE_fuc(),
        loading: false,
        is_download: false,
        mark_left: "",
        mark_right: "",
        mark_top: "",
        mark_bottom: "",
        change_num: 1,
        player_dialog_show: false,
        cancelText: language_txt.zfsypsjglpt.common.cancelTxt,
        dialog_width: "400",
        dialog_height: languageSelect == "en" ? "230" : "200",

        onInit: function (event) {
            vm = event.vmodel;
            var _this = this;
            _this.fd_flag = false;
            _this.change_num = 1;
            _this.loading = false;
            _this.is_download = false;
            group_arr = [];
            group_path = [];

            pic_id = _this.playerID + "-pic-" + getTimestamp();
            content_id = _this.playerID + "-" + getTimestamp();
            thum_id = _this.playerID + "-img-" + getTimestamp();
            pic_a_id = _this.playerID + "-a-" + getTimestamp();
            preview_id = _this.playerID + "-p-" + getTimestamp();
            // _this.mark_left = content_id + "-mark";
            _this.mark_left = content_id + "-left";
            _this.mark_right = content_id + "-right";
            _this.mark_top = content_id + "-top";
            _this.mark_bottom = content_id + "-bottom";

            $(".common_pic_show." + _this.playerID).attr("id", pic_id);
            $(".common_pic_show." + _this.playerID + " .pic_content").attr("id", content_id);
            $(".common_pic_show." + _this.playerID + " .pic_content .pic_mark").attr("id", content_id + "-mark");
            $(".common_pic_show." + _this.playerID + " .pic_content .mark_left").attr("id", _this.mark_left);
            $(".common_pic_show." + _this.playerID + " .pic_content .mark_right").attr("id", _this.mark_right);
            $(".common_pic_show." + _this.playerID + " .pic_content .mark_top").attr("id", _this.mark_top);
            $(".common_pic_show." + _this.playerID + " .pic_content .mark_bottom").attr("id", _this.mark_bottom);
            $(".common_pic_show." + _this.playerID + " .pic_content a").attr("id", pic_a_id);
            $(".common_pic_show." + _this.playerID + " .pic_content img").attr("id", thum_id);
            $(".common_pic_show." + _this.playerID + " .pic_large").attr("id", preview_id);

            $("#" + preview_id).width(_this.preview_w);
            $("#" + preview_id).height(_this.preview_h);
            document.getElementById(preview_id).style.left = $("." + _this.playerID).parent().width() + "px";

            // var evt = new m_Event();
            magnifier_obj = new Magnifier(new m_Event());
            magnifier_obj.moveFuc(document.getElementById(pic_id));

            magnifier_obj.attach({
                thumb: "#" + thum_id,
                large: _this.src,
                largeWrapper: preview_id,
                zoom: 5,
                zoomable: true,
                onthumbenter: function (data) {
                    setTimeout(function () {
                        _this.set_mark();
                    }, 10);
                },
                onthumbmove: function (data) {
                    _this.set_mark();
                },
                onthumbleave: function (data) {

                },
                onzoom: function (data) {
                    _this.set_mark();
                }
            });

            $("#" + preview_id).hide();
            $("#" + content_id + "-mark").hide();
            // });

            // this.$fire('src', this.src);
            var encode_url = encodeURI(_this.src); //转码，将url的空格转为十六进制的转义空格
            // $("#" + pic_a_id).attr("rel", "Picasa[" + encode_url + "]");
            // pic_obj = new picFuc();
            // pic_obj.picasa_init(pic_a_id);


            //新增插件
            viewer = new Viewer(document.querySelector('.more-img'), {
                inline: false,
                navbar: false,
                title: false,
                toolbar: {
                    "zoomIn": true,
                    "zoomOut": true,
                    "oneToOne": true,
                    "reset": true,
                    "rotateLeft": true,
                    "rotateRight": true,
                    "flipHorizontal": true,
                    "flipVertical": true,
                }
                //"zoomIn", "zoomOut", "oneToOne", "reset", "prev", "play", "next", "rotateLeft", "rotateRight", "flipHorizontal", "flipVertical"
            });

            //start 图像增强
            if (vm.is_IE) {
                globalOcxPlayer = document.getElementById('gxxPlayOcx');

            }else {
                globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic');
            }
            // console.dir(globalOcxPlayer);
            if (this.is_IE) {
                try {
                    var ocx = document.getElementById('gxxPlayOcx');
                    if (ocx.object == null) {
                        document.getElementById("common_pic_panel").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>" + language_txt.zfsypsjglpt.common.downloadGxx + "</a>";
                        notification.error({
                            message: language_txt.zfsypsjglpt.common.installTip,
                            title: language_txt.zfsypsjglpt.common.notification
                        });
                    }
                } catch (e) {
                    document.getElementById("common_pic_panel").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>" + language_txt.zfsypsjglpt.common.downloadGxx + "</a>";
                    notification.error({
                        message: language_txt.zfsypsjglpt.common.installTip,
                        title: language_txt.zfsypsjglpt.common.notification
                    });
                }
            } else {
                if (globalOcxPlayer.GS_ReplayFunc == undefined) {
                    document.getElementById("common_pic_panel").innerHTML = "<a class='update_web' href='/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe'>" + language_txt.zfsypsjglpt.common.downloadGxx + "</a>";
                    notification.error({
                        message: language_txt.zfsypsjglpt.common.installTip,
                        title: language_txt.zfsypsjglpt.common.notification
                    });
                }
            }

            var index = _this.src.lastIndexOf('/') + 1;
            filename = encodeURI(_this.src.substr(index, _this.src.length));
            // inputPath = imageEnhanceOutPut + filename;
            let lastStr = filename.substr(filename.length - 4, filename.length);
            if (lastStr == ".jpg" || lastStr == ".JPG") {} else {
                filename = "outPutImage@" + moment().format("YYYY-MM-DD_HH-mm-ss") + ".jpg";
            }
            inputPath = imageEnhanceOutPut + filename;
            // if (vm.is_IE)
            //     globalOcxPlayer = document.getElementById('gxxPlayOcx');
            // else
            //     globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic');

            var data = {};
            data.action = 'InitDeviceSdk'; //初始化
            globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            globalOcxPlayer.RegJsFunctionCallback(_onOcxEventProxy);

            data = {};
            data.action = 'GetVersion';
            let ret = globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            let version = eval('(' + ret + ')').data.version,
                is_alert = storage.getItem("npGxx-tips");

            if (!is_alert && compare_version(version)) {
                //弹窗提示升级播放器版本
                if (languageSelect == "en") {
                    player_dialog_vm.close_txt = 'Your GXX player plugin version is ' + version + ' and the latest version is ' + gxxOcxVersion + '. Please download the latest version.'
                } else {
                    player_dialog_vm.close_txt = "您的高新兴视频播放器插件版本为" + version + "，最新版为" + gxxOcxVersion + "。部分功能可能将无法使用，请下载最新版本！";
                }
                vm.player_dialog_show = true;
            }
        },
        onReady: function (event) {
            var _this = this;
            // console.log(this.src);
            // this.src = "https://192.168.9.181:443/disk0/2019-09-11/chen1_44010401901501507702/chen1@2019-09-11_22-30-56.JPG";
            // console.log(this.src);
            $(window).on('resize', windowResize);

            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
            // $("#" + preview_id).hide();
            // $("#" + content_id + "-mark").hide();
            // $("#" + thum_id + "-lens").hide();
            // $(".change_panel").hide();
            // $(".controller_btn").removeClass("controller_btn_click");
            $("#yt").addClass("controller_btn_click");

            $("#" + thum_id).mousedown(function (e) { //鼠标图片里down
                e.preventDefault();
                img_mousedown = true;
                mousedown_x = e.offsetX;
                mousedown_y = e.offsetY;
                if ($("#szqy").hasClass("setSize")) {
                    document.getElementById("line_left").style.display = "inline-block";
                    document.getElementById("line_right").style.display = "inline-block";
                    document.getElementById("line_top").style.display = "block";
                    document.getElementById("line_bottom").style.display = "block";
                }
            });

            $("#" + thum_id).mouseup(function (e) { //鼠标图片里up
                img_mousedown = false;
            });

            $("#" + thum_id).mousemove(function (e) { //鼠标图片里移动
                if (!img_mousedown || !$("#szqy").hasClass("setSize"))
                    return;

                var x = Math.abs(e.offsetX - mousedown_x);
                var y = Math.abs(e.offsetY - mousedown_y);

                var position_l = Math.min(e.offsetX, mousedown_x);
                var position_t = Math.min(e.offsetY, mousedown_y);

                $("#line_left").css({
                    width: "1px",
                    height: y + "px",
                    left: (position_l) + "px",
                    top: (position_t - $("#" + thum_id).height()) + "px"
                });

                $("#line_right").css({
                    width: "1px",
                    height: y + "px",
                    left: (position_l + x - 1) + "px",
                    top: (position_t - $("#" + thum_id).height()) + "px"
                });

                $("#line_top").css({
                    width: x + "px",
                    height: "1px",
                    left: (position_l) + "px",
                    top: (position_t - $("#" + thum_id).height() - y - 5) + "px"
                });

                $("#line_bottom").css({
                    width: x + "px",
                    height: "1px",
                    left: position_l + "px",
                    top: (position_t - $("#" + thum_id).height() - 6) + "px"
                });
            });
        },
        onDispose: function (event) {
            this.mark_left = "";
            this.mark_right = "";
            this.mark_top = "";
            this.mark_bottom = "";
            this.src = "";
            magnifier_obj = "";
            preview_id = "";
            pic_obj = "";

            viewer = null;

            $("#" + pic_a_id + "-PicasaMask").remove();
            $("#" + pic_a_id + "-PicasaView").remove();

            $(window).off('resize', windowResize);

            // globalOcxPlayer.IMG_DestroyWnd();
        },
        line_mouseup() {
            img_mousedown = false;
        },
        mouseover: function () {
            if (!this.fd_flag)
                return;
            $("#" + preview_id).show();
            $("#" + content_id + "-mark").show();
            $("#" + thum_id + "-lens").show();
        },
        mouseout: function () {
            $("#" + preview_id).hide();
            $("#" + content_id + "-mark").hide();
            $("#" + thum_id + "-lens").hide();
        },
        set_mark: function () {
            var _this = this;

            if ($("#" + content_id).length == "0" || _this.mark_left == "")
                return;

            var pic_height = document.getElementById(content_id).offsetHeight;
            var pic_width = document.getElementById(content_id).offsetWidth;
            var lens_left = document.getElementById(thum_id + "-lens").offsetLeft;
            var lens_top = document.getElementById(thum_id + "-lens").offsetTop;
            var lens_width = document.getElementById(thum_id + "-lens").offsetWidth;
            var lens_height = document.getElementById(thum_id + "-lens").offsetHeight;

            //左遮罩层
            document.getElementById(_this.mark_left).style.left = 0;
            document.getElementById(_this.mark_left).style.top = 0;
            document.getElementById(_this.mark_left).style.width = lens_left + "px";
            document.getElementById(_this.mark_left).style.height = pic_height + "px";

            //右遮罩层            
            document.getElementById(_this.mark_right).style.right = 0;
            document.getElementById(_this.mark_right).style.top = 0;
            document.getElementById(_this.mark_right).style.width = (pic_width - lens_left - lens_width) + "px";
            document.getElementById(_this.mark_right).style.height = pic_height + "px";

            //上遮罩层
            document.getElementById(_this.mark_top).style.left = lens_left + "px";
            document.getElementById(_this.mark_top).style.top = 0;
            document.getElementById(_this.mark_top).style.width = lens_width + "px";
            document.getElementById(_this.mark_top).style.height = lens_top + "px";

            //下遮罩层
            document.getElementById(_this.mark_bottom).style.left = lens_left + "px";
            document.getElementById(_this.mark_bottom).style.top = (lens_top + lens_height) + "px";
            document.getElementById(_this.mark_bottom).style.width = lens_width + "px";
            document.getElementById(_this.mark_bottom).style.height = (pic_height - lens_top - lens_height) + "px";
        },
        yt() { //点击原图
            this.fd_flag = false;

            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
            $(".change_panel").hide();

            $(".controller_btn").removeClass("controller_btn_click");
            $("#yt").addClass("controller_btn_click");

            $(".controller_btn").removeClass("not_allowed");
            if ($("#szqy").hasClass("setSize"))
                $("#fd").addClass("not_allowed");
            group_arr = [];
            group_path = [];
        },
        qwm() { //点击去雾霾
            if (($("#szqy").hasClass("setSize") && $("#qwm").hasClass("not_allowed")) || $("#qwm").hasClass("not_allowed") || ($("#szqy").hasClass("setSize") && $("#qwm").hasClass("controller_btn_click"))) {
                return;
            }

            this.fd_flag = false;

            $(".change_panel").hide();

            // $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            // $("#qwm").addClass("controller_btn_click");
            // $("#qwm").removeClass("not_allowed");
            // $("#yt").removeClass("not_allowed");

            controller(0, "qwm", $("#qwm").hasClass("controller_btn_click"));
        },
        qqg() { //点击去强光
            if (($("#szqy").hasClass("setSize") && $("#qqg").hasClass("not_allowed")) || $("#qqg").hasClass("not_allowed") || ($("#szqy").hasClass("setSize") && $("#qqg").hasClass("controller_btn_click"))) {
                return;
            }
            this.fd_flag = false;

            var param = {};
            param.deStrongLightParam = 1;
            item = 7;

            this.change_num = 1;
            $(".change_txt").text(language_txt.zfsypsjglpt.common.GrayscaleCorrection);
            $(".change_panel").show();

            // $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            // $("#qqg").addClass("controller_btn_click");
            // $("#qqg").removeClass("not_allowed");
            // $("#yt").removeClass("not_allowed");

            controller(7, "qqg", $("#qqg").hasClass("controller_btn_click"), param);

            // $(".img_panel").hide();
        },
        zft() { //点击直方图
            if (($("#szqy").hasClass("setSize") && $("#zft").hasClass("not_allowed")) || $("#zft").hasClass("not_allowed") || ($("#szqy").hasClass("setSize") && $("#zft").hasClass("controller_btn_click"))) {
                return;
            }
            this.fd_flag = false;

            $(".change_panel").hide();

            // $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            // $("#zft").addClass("controller_btn_click");
            // $("#zft").removeClass("not_allowed");
            // $("#yt").removeClass("not_allowed");

            controller(1, "zft", $("#zft").hasClass("controller_btn_click"));
            // $(".img_panel").hide();
        },
        gzbc() { //点击光照补偿
            if (($("#szqy").hasClass("setSize") && $("#gzbc").hasClass("not_allowed")) || $("#gzbc").hasClass("not_allowed") || ($("#szqy").hasClass("setSize") && $("#gzbc").hasClass("controller_btn_click"))) {
                return;
            }
            this.fd_flag = false;

            var param = {};
            param.lowIlluminationParam = 1;
            item = 2;

            this.change_num = 1;
            $(".change_txt").text(language_txt.zfsypsjglpt.common.gammaCorrection);
            $(".change_panel").show();

            // $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            // $("#gzbc").addClass("controller_btn_click");
            // $("#gzbc").removeClass("not_allowed");
            // $("#yt").removeClass("not_allowed");

            controller(2, "gzbc", $("#gzbc").hasClass("controller_btn_click"), param);
            // $(".img_panel").hide();
        },
        qz() { //点击去噪
            if (($("#szqy").hasClass("setSize") && $("#qz").hasClass("not_allowed")) || $("#qz").hasClass("not_allowed") || ($("#szqy").hasClass("setSize") && $("#qz").hasClass("controller_btn_click"))) {
                return;
            }
            this.fd_flag = false;

            $(".change_panel").hide();

            // $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            // $("#qz").addClass("controller_btn_click");
            // $("#qz").removeClass("not_allowed");
            // $("#yt").removeClass("not_allowed");

            controller(8, "qz", $("#qz").hasClass("controller_btn_click"));
            // $(".img_panel").hide();
        },
        szqy() { //点击设置区域
            if ($("#szqy").hasClass("not_allowed")) {
                return;
            }
            this.fd_flag = false;

            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
            $(".change_panel").hide();
            // $(".img_panel").css({
            //     "display": "inline-block"
            // });
            $(".controller_btn").removeClass("controller_btn_click");
            if ($("#szqy").hasClass("setSize")) {
                $("#szqy").removeClass("setSize");
                $("#fd").removeClass("not_allowed");

                document.getElementById("line_left").style.display = "none";
                document.getElementById("line_right").style.display = "none";
                document.getElementById("line_top").style.display = "none";
                document.getElementById("line_bottom").style.display = "none";
                $(".controller_btn").removeClass("controller_btn_click");
                $("#yt").addClass("controller_btn_click");
            } else {
                $("#szqy").addClass("setSize");
                $("#fd").addClass("not_allowed");
            }
        },
        fd() { //点击放大
            if (($("#szqy").hasClass("setSize") && $("#fd").hasClass("not_allowed")) || $("#fd").hasClass("not_allowed")) {
                return;
            }
            this.fd_flag = true;

            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
            $(".change_panel").hide();
            // $(".img_panel").css({
            //     "display": "inline-block"
            // });
            $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
            $("#fd").addClass("controller_btn_click");
            $("#fd").removeClass("not_allowed");
            $("#yt").removeClass("not_allowed");
        },
        lcw() { //点击另存为
            if ($("#yt").hasClass("controller_btn_click")) {
                let data = {};
                data.action = 'HttpDownLoadFile';
                data['arguments'] = {};
                data['arguments']['strUrl'] = encodeURI(vm.src);
                data['arguments']['strFileName'] = inputPath;
                globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
                vm.loading = true;
                let timer = setInterval(function () {
                    if (!vm.loading) {
                        clearInterval(timer);
                        saveFile_fuc(inputPath);
                    }
                }, 500);
            } else
                saveFile_fuc(szOutputPath);
        },
        reduce_btn() { //点击参数调节时的-号
            let _this = this;
            if (_this.change_num == "1")
                return;
            _this.change_num--;

            switch (item) {
                case 7:
                    var param = {};
                    param.deStrongLightParam = _this.change_num;
                    controller(7, "", false, param);
                    // controller(7, "qqg", param);
                    break;
                case 2:
                    var param = {};
                    param.lowIlluminationParam = _this.change_num;
                    // controller(2, "gzbc", param);
                    controller(2, "", false, param);
                    break;
            }
        },
        add_btn() { //点击参数调节时的+号
            let _this = this;
            if (_this.change_num == "10")
                return;
            _this.change_num++;

            switch (item) {
                case 7:
                    var param = {};
                    param.deStrongLightParam = _this.change_num;
                    controller(7, "", false, param);
                    // controller(7, "qqg", param);
                    break;
                case 2:
                    var param = {};
                    param.lowIlluminationParam = _this.change_num;
                    controller(2, "", false, param);
                    // controller(2, "gzbc", param);
                    break;
            }
        },
        move_return(a, b) {
            let _this = this;
            // $("#iframe_zfsyps").css({
            //     width: _this.dialog_width + "px",
            //     height: _this.dialog_height + "px",
            //     left: a,
            //     top: b
            // });
        },
        dialogOk() {
            this.player_dialog_show = false;
            storage.setItem("npGxx-tips", true);
            let downURL = "http://" + window.location.host + "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe"; //远程服务器使用
            window.location.href = downURL;
        },
        dialogCancel() {
            this.player_dialog_show = false;
            storage.setItem("npGxx-tips", true);
        }
    }
});

function saveFile_fuc(val) {
    let val_arr = val.split("\\"),
        index = val_arr.indexOf("outputImg");
    let out_filename = val_arr[index + 1];
    if (index == -1)
        out_filename = val_arr[val_arr.length - 1];
    let data = {};
    data.action = 'BrowseMenu';
    data['arguments'] = {};
    let ret = globalOcxPlayer.GS_ExtFunc(JSON.stringify(data));
    let ret_json = eval('(' + ret + ')');

    if (ret_json.code == 0 && ret_json.data) {
        data.action = 'CopyFile';
        data['arguments'] = {};
        data['arguments']['filePath'] = val;
        data['arguments']['dirPath'] = ret_json.data.filePath;
        globalOcxPlayer.GS_ExtFunc(JSON.stringify(data));

        notification.success({
            message: language_txt.zfsypsjglpt.common.pictureTips + ret_json.data.filePath + "\\" + out_filename,
            title: language_txt.zfsypsjglpt.common.notification,
            timeout: 3500
        });
    }
}

//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime());
}

//判断是否需要加载图片
function controller(val, type, hasClass, algparam) {
    // console.log("controller");
    // console.log(val, type, hasClass, algparam);
    if (!vm.is_download) {
        setTimeout(function () {
            // globalOcxPlayer.RegJsFunctionCallback(_onOcxEventProxy);

            let data = {};
            data.action = 'HttpDownLoadFile';
            data['arguments'] = {};
            data['arguments']['strUrl'] = encodeURI(vm.src);
            data['arguments']['strFileName'] = inputPath;
            globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
            vm.loading = true;
            let timer = setInterval(function () {
                if (!vm.loading) {
                    clearInterval(timer);
                    change_img(val, algparam);
                    groupHandle(type);
                }
            }, 500);
        }, 1000);
        vm.is_download = true;
    } else {
        if (type)
            groupHandle(type);
        if (hasClass) {
            if (group_arr.length == 0) {
                $('.pic_ocx').css({
                    "width": "1px",
                    "height": "1px",
                    "left": "0px",
                    "top": "0px"
                });
            } else {
                var param = {};
                if (getNameByNum(group_arr[0]) == 2) {
                    param.lowIlluminationParam = 1;
                }
                if (getNameByNum(group_arr[0]) == 7) {
                    param.deStrongLightParam = 1;
                }
                change_img(getNameByNum(group_arr[0]), param);
            }
        } else
            change_img(val, algparam);
    }
}

//图像增强
function change_img(val, algparam) {
    // console.log('change_img',val, algparam);
    var obj = getImgSize(document.getElementById(thum_id));
    var img_w, img_h, img_x, img_y;
    if ($("#szqy").hasClass("setSize")) {
        var rateX = obj.w / $("#" + content_id).width();
        var rateY = obj.h / $("#" + content_id).height();

        img_x = $('#line_left').position().left * rateX;
        img_y = $('#line_left').position().top * rateY;
        img_w = $("#line_top").width() * rateX;
        img_h = $("#line_left").height() * rateY;
    } else {
        img_x = 0;
        img_y = 0;
        img_w = obj.w;
        img_h = obj.h;
    }
    // $('.pic_ocx').css({
    //     "width": $("#" + content_id).width() + "px",
    //     "height": $("#" + content_id).height() + "px",
    //     "left": "0px",
    //     "top": "0px"
    // });
    $('.pic_ocx').css({
        "width": "1px",
        "height": "1px",
        "left": "0px",
        "top": "0px"
    });
    var param = {};
    param.AlgorithmType = val;
    param.arguments = algparam;

    let szInputPath;

    if (group_arr.length == 0) {
        szInputPath = inputPath;
        szOutputPath = imageEnhanceOutPut + 'outputImg\\' + filename.split(".")[0] + "_" + getTimestamp() + "-" + getNameByValue(val) + "." + filename.split(".")[1];
    } else if (group_arr.length == 1) {
        szInputPath = inputPath;
        szOutputPath = imageEnhanceOutPut + 'outputImg\\' + filename.split(".")[0] + "_" + getTimestamp() + "-" + getNameByValue(group_arr[0]) + "." + filename.split(".")[1];
    } else if (group_arr.length == 2) {
        szInputPath = group_path[0];
        szOutputPath = imageEnhanceOutPut + 'outputImg\\' + filename.split(".")[0] + "_" + getTimestamp() + "-" + getNameByValue(group_arr[0]) + "-" + getNameByValue(val) + "." + filename.split(".")[1];
    }

    // szOutputPath = szOutputPath + filename.split(".")[0] + "_" + getTimestamp() + "." + filename.split(".")[1];

    var jsonParam = {
        "action": "ImageEnhance_Ex",
        "arguments": {
            'szInputPath': szInputPath,
            'szOutputPath': szOutputPath,
            'nX': img_x,
            'nY': img_y,
            'nHeight': img_h,
            'nWidth': img_w,
            'enhanceParam': param
        }
    };

    globalOcxPlayer.GS_ExtFunc(JSON.stringify(jsonParam));

    globalOcxPlayer.IMG_DestroyWnd();
    globalOcxPlayer.IMG_CreateWnd();
    globalOcxPlayer.IMG_ShowLocalImage(szOutputPath);
    globalOcxPlayer.IMG_ShowToolBar(0);

    let index = group_arr.indexOf(val);
    if (group_arr.length == 2 && index == -1)
        return;
    if (index == -1) {
        // group_arr.push(val);
        group_path.push(szOutputPath);
    } else {
        // group_arr.splice(index, 1);
        group_path.splice(index, 1);
    }
}

function getImgSize(img) {
    var img_size = {
        w: 0,
        h: 0,
    };
    if (typeof img.naturalWidth == "undefined") {
        // IE 6/7/8 
        var i = new Image();
        i.src = img.src;
        img_size.w = i.width;
        img_size.h = i.height;
    } else {
        // HTML5 browsers 
        img_size.w = img.naturalWidth;
        img_size.h = img.naturalHeight;
    }

    if (img_size.w > 1920 || img_size.h > 1080)
        img_size = {
            w: 1920,
            h: 1080,
        };
    return img_size;
}

function getNameByValue(value) {
    if (value == 0 || value == "qwm") {
        // 去雾霾
        return language_txt.zfsypsjglpt.common.toSmogName;
        // return "qwm";
    } else if (value == 7 || value == "qqg") {
        // 去强光
        return language_txt.zfsypsjglpt.common.toGlareName;
        // return "qqg";
    } else if (value == 1 || value == "zft") {
        // 对比度增强
        return language_txt.zfsypsjglpt.common.contrastEnhancementName;
        // return "zft";
    } else if (value == 2 || value == "gzbc") {
        // 低照度图像增强
        return language_txt.zfsypsjglpt.common.lowIlluminationImageEnhancementName;
        // return "gzbc";
    } else if (value == 8 || value == "qz") {
        // 去噪
        return language_txt.zfsypsjglpt.common.denoisingName;
    } else if (value == -1) {
        return "yt";
    }
}

function getNameByNum(value) {
    if (value == "qwm") {
        return 0;
    } else if (value == "qqg") {
        return 7;
    } else if (value == "zft") {
        return 1;
        // return "dbdzq";
    } else if (value == "gzbc") {
        return 2;
        // return "dzdtxzq";
    } else if (value == "qz") {
        return 8;
    } else if (value == "yt") {
        return -1;
    }
}

let player_dialog_vm = avalon.define({
    $id: "player_pic_dialog",
    title: language_txt.zfsypsjglpt.common.downloadTitle,
    close_txt: "",
    player_txt: language_txt.zfsypsjglpt.common

});

function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

//注册回调函数
function _onOcxEventProxy(data) {
    var ret = eval('(' + data + ')');

    if (ret.action == "HttpDownLoadFile") {
        vm.loading = false;
    }
}


function windowResize() {
    if (preview_id != "") {
        document.getElementById(preview_id).style.left = $("." + vm.playerID).parent().width() + "px";
        // pic_obj.win_resize();
    }
    if ($("#common_pic_panel").length > 0) {
        if ($("#yt").hasClass("controller_btn_click")) {
            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
        }else {
            // $('.pic_ocx').css({
            //     "width": $("#" + content_id).width() + "px",
            //     "height": $("#" + content_id).height() + "px",
            //     "left": "0px",
            //     "top": "0px"
            // });
            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });

        }
            
    }
}

let group_arr = [],
    group_path = [];

function groupHandle(val) {
    if ($("#szqy").hasClass("setSize")) {
        $(".controller_btn").removeClass("controller_btn_click").addClass("not_allowed");
        $("#" + val).removeClass("not_allowed").addClass("controller_btn_click");
        $("#yt").removeClass("controller_btn_click not_allowed");
    } else {
        let index = group_arr.indexOf(val);
        if (group_arr.length == 2 && index == -1)
            return;
        if (index == -1) {
            group_arr.push(val);
            // group_path.push(szOutputPath);
        } else {
            group_arr.splice(index, 1);
            // group_path.splice(index, 1);
            if (group_arr.indexOf("gzbc") > -1 || group_arr.indexOf("qqg") > -1) {
                vm.change_num = 1;
                if (group_arr.indexOf("qqg") > -1)
                    $(".change_txt").text(language_txt.zfsypsjglpt.common.GrayscaleCorrection);
                else
                    $(".change_txt").text(language_txt.zfsypsjglpt.common.gammaCorrection);

                $(".change_panel").show();
            } else
                $(".change_panel").hide();
        }

        $(".init_btn").removeClass("controller_btn_click");
        $(".controller_btn").removeClass("controller_btn_click not_allowed");

        if (group_arr.length == 0) {
            $(".init_btn").addClass("controller_btn_click");
            $('.pic_ocx').css({
                "width": "1px",
                "height": "1px",
                "left": "0px",
                "top": "0px"
            });
        } else if (group_arr.length == 1) {
            $("#szqy").addClass("not_allowed");
            $("#fd").addClass("not_allowed");
        } else if (group_arr.length == 2) {
            $(".controller_btn").addClass("not_allowed");
        }

        for (let i = 0; i < group_arr.length; i++) {
            $("#" + group_arr[i]).removeClass("not_allowed").addClass("controller_btn_click");
        }
    }
}

//对比版本函数
function compare_version(curVersion) {
    //return true 代表版本过低
    let curVerArr = curVersion.split("."), //当前安装版本
        gxxOcxVerArr = gxxOcxVersion.split("."); //config.js 里注明的ocx版本

    for (let i = 0; i < gxxOcxVerArr.length; i++) {
        if (parseInt(curVerArr[i]) < parseInt(gxxOcxVerArr[i]))
            return true;
    }

    return false;
}