/**
 * 使用videojs的播放器插件
 * @prop {String} src 播放地址
 * @example
 * ```
 * demo
 * <div ms-if="false">    --- 自定义外壳
 *     <ms-audio :widget="{src: @play_url}"></ms-audio>
 * </div>
 * 
 * 
 * 需要注意的是：
 * 1. 最好配合ms-if来进行使用。在需要播放音频的时候置自定义外壳的ms-if为true，再给播放器url；不需要使用播放器的时候尽量将播放器模块去掉，置ms-if为false。
 * 2. 最好在dispose该播放器的时候，清空 src: @play_url 里面 play_url 的值，即 play_url = "" 。
 * 
 * 可参见 zfsypsjglpt-yspk-zfyps 模块
 * 
 * @author lichunsheng
 * 创建时间：2018-2-5 10:58:13
 * ```
 */

require("/apps/common/common-audio.css");


var vm, timer, media_total_time, play_status, mediaPlayer,
    mousemove_flag = false,
    myPlayer = "";
avalon.component("ms-audio", {
    template: __inline("./common-audio.html"),
    defaults: {
        src: "", //媒体播放路径
        is_ie: true,
        gm_audio: true,
        current_time: "00:00",
        total_time: "00:00",
        v_blue_line_width: "",
        v_circle_span_left: "",

        onInit: function (event) {
            vm = event.vmodel;
            var _this = this;

            this.$watch("src", (v) => {
                _this.src = vm.src;
                if (_this.src == "") {
                    return;
                }
                _this.gm_audio = false;
                _this.gm_audio = true;

                $(".audio_player .progress_bar").width($("#audio_player").width() - 320);
                $(".audio_player .play_btn").hide();
                $(".audio_player .mute").hide();

                if (navigator.userAgent.toLowerCase().indexOf("msie") == "-1") {
                    _this.is_ie = false;

                    mediaPlayer = document.getElementById("gm_audio");
                    new scale('p_circle_span', 'p_white_line', 'p');
                    new scale('v_circle_span', 'v_white_line', 'v');

                    play_status = true;
                    mediaEvent("loadedmetadata"); //成功获取资源长度
                    mediaEvent("timeupdate"); //播放时间改变
                    mediaEvent("ended"); //播放结束
                } else {
                    _this.is_ie = true;

                    // myPlayer = document.getElementById("play_id");
                    myPlayer = play_id;
                    myPlayer.URL = _this.src;
                    myPlayer.settings.volume = 50;
                    play_status = true;


                    new scale('p_circle_span', 'p_white_line', 'ie_p');
                    new scale('v_circle_span', 'v_white_line', 'ie_v');

                    setTimeout(function () {
                        media_total_time = myPlayer.currentMedia.duration;
                        // _this.current_time = "00:01";
                        _this.total_time = formatSeconds(media_total_time);
                    }, 500);

                    timer = setInterval(time_fuc, 1000);
                }
            });
            this.$fire('src', this.src);
        },
        onReady: function (event) {
            $(window).resize(function () {
                $(".audio_player .progress_bar").width($("#audio_player").width() - 320);
            });
        },
        onDispose: function (event) {
            if (navigator.userAgent.toLowerCase().indexOf("msie") != "-1") {
                if (myPlayer != "")
                    myPlayer.controls.stop();
                myPlayer = "";
                clearInterval(timer);
            }
            this.src = "";
        },
        play() {
            var _this = this;

            if (_this.is_ie) {
                _this.current_time = formatSeconds(myPlayer.controls.currentPosition);
                timer = setInterval(time_fuc, 1000);
                myPlayer.controls.play();
            } else {
                mediaPlayer.play();
            }
            play_status = true;
            $(".audio_player .play_btn").hide();
            $(".audio_player .pause_btn").show();
        },
        pause() {
            var _this = this;

            if (_this.is_ie) {
                clearInterval(timer);
                myPlayer.controls.pause();
            } else {
                mediaPlayer.pause();
            }
            play_status = false;
            $(".audio_player .pause_btn").hide();
            $(".audio_player .play_btn").show();
        },
        voice() {
            var _this = this;

            if (_this.is_ie) {
                myPlayer.settings.mute = true;
            } else {
                mediaPlayer.muted = true;
            }

            _this.v_blue_line_width = $(".v_blue_line").width();
            _this.v_circle_span_left = document.getElementById("v_circle_span").style.left;
            $(".v_blue_line").width(0);
            document.getElementById("v_circle_span").style.left = "-6px";
            $(".audio_player .voice").hide();
            $(".audio_player .mute").show();
        },
        mute() {
            var _this = this;

            if (_this.is_ie) {
                if (myPlayer.settings.volume == "0")
                    return;
                myPlayer.settings.mute = false;
            } else {
                if (mediaPlayer.volume == "0")
                    return;
                mediaPlayer.muted = false;
            }

            $(".v_blue_line").width(_this.v_blue_line_width);
            document.getElementById("v_circle_span").style.left = _this.v_circle_span_left;
            $(".audio_player .mute").hide();
            $(".audio_player .voice").show();
        }
    }
});

function time_fuc() {
    vm.current_time = formatSeconds(myPlayer.controls.currentPosition);

    if (myPlayer.PlayState != "1") {
        var cur_width = myPlayer.controls.currentPosition / media_total_time * $(".progress_bar").width();
        $(".p_blue_line").width(cur_width);
        document.getElementById("p_circle_span").style.left = cur_width + "px";
    } else {
        play_status = false;
        clearInterval(timer);
        $(".audio_player .play_btn").show();
        $(".audio_player .pause_btn").hide();

        $(".p_blue_line").width(0);
        document.getElementById("p_circle_span").style.left = "-6px";
    }

}

var mediaEvent = function (e) {
    mediaPlayer.addEventListener(e, function () {
        switch (e) {
            case "loadedmetadata":
                media_total_time = mediaPlayer.duration;
                vm.total_time = formatSeconds(mediaPlayer.duration);

                break;
            case "timeupdate":
                if (!mousemove_flag) {
                    vm.current_time = formatSeconds(mediaPlayer.currentTime);
                    var cur_width = mediaPlayer.currentTime / media_total_time * $(".progress_bar").width();
                    $(".p_blue_line").width(cur_width);
                    document.getElementById("p_circle_span").style.left = cur_width + "px";
                }

                break;
            case "ended":
                play_status = false;
                $(".p_blue_line").width(0);
                document.getElementById("p_circle_span").style.left = "-6px";
                vm.current_time = "00:00";
                mediaPlayer.currentTime = 0;
                $(".audio_player .play_btn").show();
                $(".audio_player .pause_btn").hide();

                break;
        }
    }, false);
}

var scale = function (btn, bar, flag) {
    this.btn = document.getElementById(btn);
    this.bar = document.getElementById(bar);
    this.step = $("#" + bar).next()[0];
    this.init(flag);
};
scale.prototype = {
    init: function (flag) {
        var f = this,
            g = document,
            b = window,
            m = Math,
            current_num, total_num, sum_width;
        f.btn.onmousedown = function (e) {
            e.preventDefault();
            var x = (e || b.event).clientX;
            var l = this.offsetLeft;
            var max = f.bar.offsetWidth - this.offsetWidth + 6;
            total_num = max;
            sum_width = max + 6;
            g.onmousemove = function (e) {
                var thisX = (e || b.event).clientX;
                var to = m.min(max, m.max(-6, l + (thisX - x)));
                f.btn.style.left = to + 'px';
                f.ondrag(m.round(m.max(0, to / max) * 100), to);
                current_num = to;
                b.getSelection ? b.getSelection().removeAllRanges() : g.selection.empty();

                switch (flag) {
                    case "p":
                        mediaPlayer.pause();
                        mousemove_flag = true;
                        var cur_progress = parseInt((current_num + 6) / sum_width * media_total_time);
                        mediaPlayer.currentTime = cur_progress;
                        vm.current_time = formatSeconds(mediaPlayer.currentTime);

                        break;
                    case "v":
                        var cur_voice = (sum_width - (total_num - current_num)) / sum_width;
                        if (cur_voice == "0") {
                            $(".audio_player .voice").hide();
                            $(".audio_player .mute").show();
                        } else {
                            $(".audio_player .mute").hide();
                            $(".audio_player .voice").show();
                        }
                        mediaPlayer.volume = cur_voice;

                        break;
                    case "ie_p":
                        clearInterval(timer);
                        myPlayer.controls.pause();
                        mousemove_flag = true;
                        var cur_progress = parseInt((current_num + 6) / sum_width * media_total_time);
                        myPlayer.controls.currentPosition = cur_progress;
                        vm.current_time = formatSeconds(myPlayer.controls.currentPosition);

                        break;
                    case "ie_v":
                        var cur_voice = parseInt((sum_width - (total_num - current_num)) / sum_width * 100);
                        if (cur_voice == "0") {
                            $(".audio_player .voice").hide();
                            $(".audio_player .mute").show();
                        } else {
                            $(".audio_player .mute").hide();
                            $(".audio_player .voice").show();
                        }
                        myPlayer.settings.volume = cur_voice;

                        break;
                }
            };
            // g.onmouseup = new Function('this.onmousemove=null');
            g.onmouseup = function (e) {
                g.onmousemove = null;
                if (flag == "ie_p" && mousemove_flag == true) {
                    if (play_status == true) {
                        myPlayer.controls.play();
                        timer = setInterval(time_fuc, 1000);
                    }
                    // if ((current_num + 6) / sum_width == "1") {
                    //     myPlayer.controls.stop();
                    //     clearInterval(timer);
                    //     $(".audio_player .pause_btn").hide();
                    //     $(".audio_player .play_btn").show();
                    // }
                    mousemove_flag = false;
                }
                if (flag == "p" && mousemove_flag == true) {
                    if (play_status == true)
                        mediaPlayer.play();

                    mousemove_flag = false;
                }
            };
        };
    },
    ondrag: function (pos, x) {
        this.step.style.width = Math.max(0, x) + 'px';
    }
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