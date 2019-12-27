/**
 * 使用videojs的播放器插件
 * @prop {String} src                播放地址
 * @prop {String} playerID           播放器ID
 * @example
 * ```
 * demo
 * <div>    --- 自定义外壳
 *     <ms-gm-webplayer :widget="{src: @play_url}"></ms-gm-webplayer>
 * </div>
 * 
 * 需要注意的是：
 * 1. 外壳的宽高要写好。播放器是根据外壳来定义宽高。都是100%
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
require("/apps/common/common-gm-webplayer.css");

var vm, myPlayer, childFrameObj;
avalon.component("ms-gm-webplayer", {
    template: __inline("./common-gm-webplayer.html"),
    defaults: {
        src: avalon.noop,
        web_width: avalon.noop,
        web_height: avalon.noop,

        onInit: function (event) {
            vm = event.vmodel;
            var _this = this;

            this.$watch("src", (v) => {
                if (_this.src == "") {
                    return;
                }
                $("#gm_webplayer_panel").show();
                childFrameObj = document.getElementById('gm_webplayer');
                childFrameObj.contentWindow.parentWidth = _this.web_width;
                childFrameObj.contentWindow.parentHeight = _this.web_height;
                childFrameObj.contentWindow.paramFromParent = _this.src;
                childFrameObj.contentWindow.play();
            });
            this.$fire('src', this.src);
        },
        onReady: function (event) {
            var _this = this;
            this.$watch("web_width", (v) => {
                childFrameObj.contentWindow.web_resize(_this.web_width, _this.web_height);
            });
            this.$watch("web_height", (v) => {
                childFrameObj.contentWindow.web_resize(_this.web_width, _this.web_height);
            });

        },
        onDispose: function (event) {
            childFrameObj.contentWindow.stop();
            $("#gm_webplayer_panel").hide();
        }
    }
});