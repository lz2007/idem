//map页面track模式js
dojo.provide('MapTrack');

dojo.declare('MapTrack', null, {
    objMapCommon: null,

    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },

    //功能：对应模式化页面初始化
    trackInit: function () {
        var that = this;

        //html初始化
        $('.district,.setting,.map-sw-button,.check-point-id,.mac').hide();
        $('.map-result-list').addClass('track-list').animate({left: '10px'}, 500);
        //时间轴
        $('.time-axis').animate({'bottom': '10px'}, 500);
        //查询
        $('.map-query-box').animate({'top': '12px'}, 500);
        //数据初始化
        this.objMapCommon.getDeviceList(function () {
            $('.map-result-list li').click(function () {
                var diff = $('.time-axis .active').attr('data-date');
                $(this).addClass('active').siblings().removeClass('active');
                var deviceId = $(this).attr('data-id');
                that.objMapCommon.getLocationTrace(that.objMapCommon.getDateToday(diff || 0) + ' 00:00:00', that.objMapCommon.getDateToday() + ' 23:59:59', '["' + deviceId + '"]');
            });
        }, false);
        $('.btn-group .query').click(function () {
            var beginTime = $('input[name=begin_date]').val(),
                endTime = $('input[name=end_date]').val(),
                plateNum = $('input[name=plate-num]').val();
            if ('' == plateNum) {
                extras.widget.tips.init(0, '车牌号不能为空');
                $('input[name=plate-num]').focus();
                return;
            }
            that.objMapCommon.getLocationTrace(beginTime + ' 00:00:00', endTime + ' 23:59:59', '["' + plateNum + '"]', {
                'begin': beginTime,
                'end': endTime
            });
        });
    }
});

var objMapTrack = new MapTrack(objMapCommon);
objMapTrack.trackInit();//执行初始化