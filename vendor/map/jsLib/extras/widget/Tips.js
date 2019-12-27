/**
 * Created by PC_avx on 2016/9/7.
 */

dojo.provide("extras.widget");
extras.widget.tips = {
    timer: null,
    init: function (type, message) {
        var vClass = 'tips_';
        switch (type) {
            case 0:
                vClass += 'error fa-remove';
                break;
            case 2:
                vClass += 'loading';
                break;
            default:
                vClass += 'success fa-check';
        }
        $('body').append('<div class="map_tips_box fa ' + vClass + '">' + message + '</div>"');
        if (2 != type)
            setTimeout(function () {
                $('.map_tips_box').fadeOut(500, function () {
                    $(this).remove();
                });
            }, 3000);
        else
            return this;
    },
    remove: function (type) {
        if (2 == type)
            $('.map_tips_box').remove();
    }
};