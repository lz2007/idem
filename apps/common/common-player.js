/**
 * 使用videojs的播放器插件
 * @prop {String}    src              播放地址
 * @prop {String}    downloadUrl      下载地址
 * @prop {String}    special_id       播放器ID
 * @prop {String}    media_type       媒体类型 0 视频；1 音频；2 图片
 * @example
 * ```
 * demo
 * <div :if="@init">
 *     <ms-h5-player :widget="{src: @play_url, special_id:'zfyps', media_type:@media_type, player_width:@web_width, player_height:@web_height, player_left:@web_left, player_top:@web_top, play_status:@play_status}"></ms-h5-player> 
 * </div>
 * 
 * 
 * 
 * 可参考 zfsypsjglpt-yspk-zfyps-detail 模块
 * 
 * @author lichunsheng
 * 创建时间：2019-5-9 18:00:00
 * ```
 */

import {
    notification
} from "ane";
import {
    languageSelect,
} from '../../services/configService';
require("/apps/common/common-player.less");
let language_txt = require('../../vendor/language').language;

avalon.component("ms-h5-player", {
    template: __inline("./common-player.html"),
    defaults: {
        languageTxt: language_txt,
        extra_class: languageSelect == "en" ? true : false,
        special_id: avalon.noop, //播放器ID
        src: avalon.noop, //播放地址
        media_type: avalon.noop, //媒体类型
        downloadUrl: "", //下载地址
        downloadClick: function () {
            if (!this.downloadUrl) {
                notification.warn({
                    message: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.noFoundURL,
                    title: language_txt.zfsypsjglpt.zfsypsjglpt_sypgl.notification
                });
                return;
            }
            window.open(this.downloadUrl);
        },

        onInit: function (event) {
            // vm = event.vmodel;
        },
        onReady: function () {

        },
        onDispose: function () {

        },
        mouseenter() {
            $(".h5-player .control-bar").fadeIn();
        },
        mouseleave() {
            $(".h5-player .control-bar").fadeOut();
        }
    }
});