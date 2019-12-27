/**
 * 使用videojs的播放器插件
 * @prop {String} src                播放地址
 * @prop {String} special_id         一个特定的id, 用于区分播放器
 * @prop {boolean} media_type        媒体类型 0 视频；1 音频；2 图片
 * @example
 * ```
 * demo
 * <div ms-if="false">    --- 自定义外壳
 *     <ms-video :widget="{src: @play_url, special_id: 'special_id'}"></ms-video>
 * </div>
 * 
 * 需要注意的是：
 * 1. 最好配合ms-if来进行使用。在需要播放视频的时候置自定义外壳的ms-if为true，再给播放器url；不需要使用播放器的时候尽量将播放器模块去掉，置ms-if为false。
 * 2. 最好在dispose该播放器的时候，清空 src: @play_url 里面 play_url 的值，即 play_url = "" 。
 * 
 * 可参见 zfsypsjglpt-yspk-zfyps 模块
 * 
 * @author lichunsheng
 * 创建时间：2017-12-18 15:59:23
 * ```
 */
import {
    notification
} from "ane";
import {
    languageSelect,
} from '../../services/configService';
require("/apps/common/common-video.css");
import 'video.js/dist/video-js.css';
import videojs from 'video.js';
let language_txt = require('../../vendor/language').language;

var vm, myPlayer;
avalon.component("ms-video", {
    template: __inline("./common-video.html"),
    defaults: {
        languageTxt: language_txt.zfsypsjglpt.common,
        extra_class: languageSelect == "en" ? true : false,
        src: "", //媒体播放路径
        special_id: avalon.noop,
        media_type: avalon.noop,
        play_init: true,
        video_wait: true,
        video_error: false,
        video_init: false,
        downloadUrl: "",
        columnArray: new Array(28),
        timer: null,

        onInit: function (event) {
            vm = event.vmodel;
            var _this = this;

            var speed = 1, //默认速度
                speed_time, //改变播放速度时，提示语的定时器
                curTime = "00:00", //当前播放时间
                video_duration; //媒体时长

            this.$watch("src", (v) => {
                // _this.src = vm.src;
                if (_this.src == "") {
                    return;
                }

                _this.play_init = false;
                _this.play_init = true;

                // if (_this.media_type) {
                //     $(".common_player .audio_img").height(($(".common_player").height() - 50));
                //     $(".common_player .audio_img").width($(".common_player").width());
                //     $(window).resize(function () {
                //         $(".common_player .audio_img").height(($(".common_player").height() - 50));
                //         $(".common_player .audio_img").width($(".common_player").width());
                //     });
                // }

                var video_id = _this.special_id + "-my-video-" + getTimestamp(); //根据时间造唯一的video_id
                _this.video_init = true;
                $("." + _this.special_id + " .video-js").attr("id", video_id);

                myPlayer = videojs(video_id, {
                    "controls": true,
                    "autoplay": true,
                    "preload": "auto",
                    "language": "en"
                }, function () {
                    $(".vjs-control-bar").append('<div class="video_time"><span class="current_time">00:00</span> / <span class="video_duration">00:00</span></div><div class="video_controller_panel"><div class="videoBtn speed_down" title="' + language_txt.zfsypsjglpt.common.speedReduction + '"></div><div class="videoBtn back_off" title="' + language_txt.zfsypsjglpt.common.backwardTxt + '(-10s)"></div><div class="videoBtn play" title="' + language_txt.zfsypsjglpt.common.playTxt + '"></div><div class="videoBtn pause" title="' + language_txt.zfsypsjglpt.common.pauseTxt + '"></div><div class="videoBtn fast_forward" title="' + language_txt.zfsypsjglpt.common.forwardTxt + '(+10s)"></div><div class="videoBtn speed_up" title="' + language_txt.zfsypsjglpt.common.speedUp + '"></div><span class="current_speed"></span></div><a class="downloadBtn" title="' + language_txt.zfsypsjglpt.common.downloadTxt + '"><img src="/static/image/zfsypsjglpt/downloadVideo_icon.png"></a>');
                    if (_this.media_type == 1) { //音频隐藏全屏按钮
                        $("." + _this.special_id + " .video-js .vjs-fullscreen-control").hide();
                        $("." + _this.special_id + " .video-js .downloadBtn").css({
                            "right": "18px"
                        });
                    }
                    $("." + _this.special_id + " .video-js .video_controller_panel .play").addClass("item_hide");

                    $("." + _this.special_id + " .video-js .video_controller_panel .play").unbind().click(function () { //播放
                        myPlayer.play();
                    });

                    $("." + _this.special_id + " .video-js .video_controller_panel .pause").unbind().click(function () { //暂停
                        myPlayer.pause();
                    });

                    $("." + _this.special_id + " .video-js .video_controller_panel .fast_forward").unbind().click(function () { //快进
                        var fastTime = myPlayer.currentTime() + 10;
                        if (video_duration < fastTime)
                            myPlayer.currentTime(parseInt(video_duration));
                        else
                            myPlayer.currentTime(fastTime);
                    });

                    $("." + _this.special_id + " .video-js .video_controller_panel .back_off").unbind().click(function () { //后退
                        myPlayer.currentTime(myPlayer.currentTime() - 10);
                    });

                    $("." + _this.special_id + " .video-js .video_controller_panel .speed_up").unbind().click(function () { //加速
                        clearTimeout(speed_time);
                        if (speed == 8) {
                            $("." + _this.special_id + " .current_speed").text(language_txt.zfsypsjglpt.common.speed + "8x");
                            $("." + _this.special_id + " .current_speed").fadeIn();
                            speed_time = setTimeout(function () {
                                $("." + _this.special_id + " .current_speed").fadeOut();
                            }, 2000);
                            return;
                        }
                        if (speed < 1)
                            speed += 0.25;
                        else
                            speed += 1;
                        myPlayer.playbackRate(speed);
                        var current_speed = language_txt.zfsypsjglpt.common.speed + speed + "x";
                        $("." + _this.special_id + " .current_speed").text(current_speed);
                        $("." + _this.special_id + " .current_speed").fadeIn();
                        speed_time = setTimeout(function () {
                            $("." + _this.special_id + " .current_speed").fadeOut();
                        }, 2000);
                    });

                    $("." + _this.special_id + " .video-js .video_controller_panel .speed_down").unbind().click(function () { //减速
                        clearTimeout(speed_time);
                        if (speed == 0.25) {
                            $("." + _this.special_id + " .current_speed").text(language_txt.zfsypsjglpt.common.speed + "0.25x");
                            $("." + _this.special_id + " .current_speed").fadeIn();
                            speed_time = setTimeout(function () {
                                $("." + _this.special_id + " .current_speed").fadeOut();
                            }, 2000);
                            return;
                        }
                        if (speed <= 1)
                            speed -= 0.25;
                        else
                            speed -= 1;
                        myPlayer.playbackRate(speed);
                        var current_speed = language_txt.zfsypsjglpt.common.speed + speed + "x";
                        $("." + _this.special_id + " .current_speed").text(current_speed);
                        $("." + _this.special_id + " .current_speed").fadeIn();
                        speed_time = setTimeout(function () {
                            $("." + _this.special_id + " .current_speed").fadeOut();
                        }, 2000);
                    });

                    $("." + _this.special_id + " .video-js .downloadBtn").unbind().click(function () { //下载
                        if (!_this.downloadUrl) {
                            notification.warn({
                                message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.noFoundURL,
                                title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                            });
                            return;
                        }
                        window.open(_this.downloadUrl);
                    });

                });
                myPlayer.on("error", function () {
                    _this.video_wait = false;
                    _this.video_error = true;
                    // _this.media_type = false;
                    $("." + _this.special_id + " .video-js").hide();
                });

                myPlayer.on("loadedmetadata", function () {
                    _this.video_wait = false;
                });

                myPlayer.on("durationchange", function () {
                    if (!isNaN(myPlayer.duration()))
                        video_duration = myPlayer.duration();
                    else
                        video_duration = "00:00";
                });

                myPlayer.on("firstplay", function () {
                    $("." + _this.special_id + " .video_duration").text(formatSeconds(video_duration));
                    // myPlayer.pause();
                    // myPlayer.currentTime(0.001);
                });

                myPlayer.on("seeking", function () {
                    myPlayer.playbackRate(speed);
                });

                myPlayer.on("timeupdate", function () {
                    if (video_duration < myPlayer.currentTime()) {
                        $("." + _this.special_id + " .current_time").text(formatSeconds(video_duration));
                        return;
                    }

                    var format_time = formatSeconds(myPlayer.currentTime());

                    if (format_time != curTime) {
                        $("." + _this.special_id + " .current_time").text(format_time);
                        curTime = format_time;
                    }
                });

                myPlayer.on("ended", function () {
                    $("." + _this.special_id + " .video-js .video_controller_panel .pause").addClass("item_hide");
                    $("." + _this.special_id + " .video-js .video_controller_panel .play").removeClass("item_hide");
                });

                myPlayer.on("play", function () {
                    myPlayer.playbackRate(speed);
                    if (_this.media_type == 1) {
                        for (let i = 0; i < _this.columnArray.length; i++) {
                            _this.columnArray[i] = {};
                            let num = Math.random() * 80;
                            _this.columnArray[i].height = num;
                        }
                        clearInterval(_this.timer);
                        _this.timer = setInterval(() => {
                            for (let i = 0; i < _this.columnArray.length; i++) {
                                _this.columnArray[i] = {};
                                let num = Math.random() * 80;
                                _this.columnArray[i].height = num;
                            }
                        }, 500);
                    }
                    $("." + _this.special_id + " .video-js .video_controller_panel .play").addClass("item_hide");
                    $("." + _this.special_id + " .video-js .video_controller_panel .pause").removeClass("item_hide");

                });

                myPlayer.on("pause", function () {
                    if (_this.media_type == 1) {
                        clearInterval(_this.timer);
                    }
                    $("." + _this.special_id + " .video-js .video_controller_panel .pause").addClass("item_hide");
                    $("." + _this.special_id + " .video-js .video_controller_panel .play").removeClass("item_hide");
                });
            });
            this.$fire('src', this.src);
        },
        onReady: function (event) {},
        onDispose: function (event) {
            if (myPlayer !== undefined)
                myPlayer.dispose();
            this.src == "";
            this.columnArray = [];
        }
    }
});

/* ==================== videojs 中文语言包 start  ==================== */
// videojs.addLanguage("zh-CN", {
//     "Play": "播放",
//     "Pause": "暂停",
//     "Current Time": "当前时间",
//     "Duration Time": "时长",
//     "Remaining Time": "剩余时间",
//     "Stream Type": "媒体流类型",
//     "LIVE": "直播",
//     "Loaded": "加载完毕",
//     "Progress": "进度",
//     "Fullscreen": "全屏",
//     "Non-Fullscreen": "退出全屏",
//     "Mute": "静音",
//     "Unmute": "取消静音",
//     "Playback Rate": "播放速度",
//     "Subtitles": "字幕",
//     "subtitles off": "关闭字幕",
//     "Captions": "内嵌字幕",
//     "captions off": "关闭内嵌字幕",
//     "Chapters": "节目段落",
//     "Close Modal Dialog": "关闭弹窗",
//     "Descriptions": "描述",
//     "descriptions off": "关闭描述",
//     "Audio Track": "音轨",
//     "You aborted the media playback": "视频播放被终止",
//     "A network error caused the media download to fail part-way.": "网络错误导致视频下载中途失败。",
//     "The media could not be loaded, either because the server or network failed or because the format is not supported.": "视频因格式不支持或者服务器或网络的问题无法加载。",
//     "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "由于视频文件损坏或是该视频使用了你的浏览器不支持的功能，播放终止。",
//     "No compatible source was found for this media.": "无法找到此视频兼容的源。",
//     "The media is encrypted and we do not have the keys to decrypt it.": "视频已加密，无法解密。",
//     "Play Video": "播放视频",
//     "Close": "关闭",
//     "Modal Window": "弹窗",
//     "This is a modal window": "这是一个弹窗",
//     "This modal can be closed by pressing the Escape key or activating the close button.": "可以按ESC按键或启用关闭按钮来关闭此弹窗。",
//     ", opens captions settings dialog": ", 开启标题设置弹窗",
//     ", opens subtitles settings dialog": ", 开启字幕设置弹窗",
//     ", opens descriptions settings dialog": ", 开启描述设置弹窗",
//     ", selected": ", 选择"
// });
/* ==================== videojs 中文语言包 end  ==================== */

//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime());
}

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        // if (minute >= 60) {
        //     hour = parseInt(minute / 60);
        //     minute = parseInt(minute % 60);
        // }
    }
    // if (hour < 10)
    //     hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = minute + ":" + second;
    // result = hour + ":" + minute + ":" + second;
    return result;
}