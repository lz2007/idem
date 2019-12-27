import $ from 'jquery';
import './common-mask-element.less';
let language_txt = require("/vendor/language").language;
let language_txt_loading = language_txt.zfsypsjglpt.common.tips1;
//给窗口添加滚动事件，在滚动时遮罩跟着元素移动
$(window).bind("scroll", function () {
    var masks = $(".mask");
    for (var i = 0; i < masks.length; i++) {
        var ele_id = $(masks[i]).attr("ele");
        var eleTop = $(ele_id).offset().top;
        var gun = $(document).scrollTop();
        var top = eleTop - gun;
        $(masks[i]).css({
            "top": top + 'px'
        });
    }
});

//timeout cache
var cache = {};

/*
 * full screen loading mask
 */
$.mask_fullscreen = function (timeout, titName = language_txt_loading) {
    if ($(".mask[ele=full_screen]").length > 0) {
        return;
    }
    //禁止滚动
    $("body").addClass("scroll-off");
    var mask = '<div class="mask" ele="full_screen"><div>' + titName + '</div></div>';
    $("body").append(mask);
    clearTimeout(cache["full_screen"]);
    if (timeout && timeout > 0) {
        var s = setTimeout(function () {
            $(".mask[ele=full_screen]").remove();
            $("body").removeClass("scroll-off");
        }, timeout);
        cache["full_screen"] = s;
    }
}

/*
 * certain element loading mask
 */
$.mask_element = function (ele_id, titName = language_txt_loading, timeout) {
    //判断当前元素是否已经添加遮罩，如果已添加，则直接返回

    if ($(".mask").length > 0) {
        return;
    }

    //添加遮罩元素
    var mask = '<div class="mask" ele=' + ele_id + ' style="width: ' + $(ele_id).width() + 'px !important;z-index: 99999; height: ' + $(ele_id).height() + 'px !important; left: ' + $(ele_id).offset().left + 'px !important; top: ' + $(ele_id).offset().top + 'px !important;"><div>' + titName + '</div></div>';
    $("body").append(mask);
    clearTimeout(cache[ele_id]);
    if (timeout && timeout > 0) {
        var s = setTimeout(function () {
            $(".mask[ele=" + ele_id + "]").remove();
        }, timeout);
        cache[ele_id] = s;
    }
}

$.update_mask_close = function (ele_id, titName) {
    $(".mask div").html(titName);
}

/*
 * close certain loading mask
 */
$.mask_close = function (ele_id) {
    $(".mask[ele=" + ele_id + "]").remove();
}

/*
 * close all loading mask
 */
$.mask_close_all = function () {
    $(".mask").remove();
}