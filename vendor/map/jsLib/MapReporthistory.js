//map页面reporthistory模式js
dojo.provide('MapReporthistory');

dojo.declare('MapReporthistory', null, {
    pointCount: 1,
    page: 0,
    loop: false,
    objMapCommon: null,

    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },

    //功能：对应模式化页面初始化
    reporthistoryInit: function () {
        var that = this;
        //html初始化
        $('.district,.setting,.check-point-id,.mac').hide();
        $('.map-sw-button .fa-list').attr('href', 'report-history.html');
        $('.map-result-list').find('ul').css('padding-top', '30px');
        $('.map-query-box').animate({top: '12px'}, 500);
        $('.query').click(function () {
            if ($(this).hasClass('disabled'))
                return;
            var beginTime = $('input[name=begin_date]').val();
            var endTime = $('input[name=end_date]').val();
            var plateNum = $('input[name=plate-num]').val();
            that.loop = false;
            that.pointCount = 1;
            that.page = 0;
            var param = {BeginTime: beginTime, EndTime: endTime, PlateNum: plateNum};
            if ('' == beginTime && '' == endTime && '' == plateNum)
                param = null;
            $(this).addClass('disabled');
            that.getAlarmReportHistory(param, true);
        });

        //数据初始化
        // that.getAlarmReportHistory();
    },

    //功能：对应模式化页面初始化
    getAlarmReportHistory: function (param, isSearch) {
        var that = this;
        var timeParam = '';
        this.loop = true;
        if (param)
            timeParam = 'TimeBegin=' + param.BeginTime + '%2000:00:00&TimeEnd=' + param.EndTime + '%2023:59:59&';

        setTimeout(function () {
            that.objMapCommon.xajax('/alarm/getReportHistory?' + timeParam + 'PageNum=' + that.page, '' != param.PlateNum ? '["' + param.PlateNum + '"]' : '[]', null, function (data) {
                var html = '', gpsArr = [];
                var list = data.Result;
                var key = 0;
                if (!data)
                    $('.query').removeClass('disabled')

                for (var i in list) {
                    var point = list[i];
                    if (point.GPSData)
                        var gpsGroup = point.GPSData.split(';');

                    if (2 > gpsGroup.length)
                        continue;

                    gpsArr[key] = {
                        'id': 'locus' + that.pointCount, //唯一ID
                        'x': parseFloat(gpsGroup[1]), //经度坐标
                        'y': parseFloat(gpsGroup[0]), //纬度坐标
                        'attributes': {
                            'type': mode,
                            'title': point.PlateNumber + '的违章记录', //将对应属信息回传
                            'recordId': point.Id,
                            'name': point.PlateNumber,
                            'time': point.Time,
                            'alarmType': point.AlarmType,
                            'memo': point.Memo || '无',  
                            'x': parseFloat(gpsGroup[1]),
                            'y': parseFloat(gpsGroup[0]),
                            'checkPointId': point.CheckPointId || '未知',
                            'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                        }
                    };
                    html += '<li data-coordinate="' + point.GPSData + '" data-time="' + point.Time + '" data-checkooiptid="' + (point.CheckPointId || '未知') + '" data-recordId="' + point.Id + '" data-pointid="locus' + that.pointCount + '" data-x="' + gpsGroup[1] + '" data-y="' + gpsGroup[0] + '" data-alarmType="' + point.AlarmType + '" data-memo="' + (point.Memo || '无') + '"><div class="serial">' + that.pointCount++ + '</div><div class="info"><p class="car-id">' + list[i].PlateNumber + '</p><p class="time">' + point.Time + '</p></div></li>';
                    key++;
                }

                var gpsParam = that.objMapCommon.getGPSParam(gpsArr, 20, 20, 'info.gif');
                $('.map-result-list').animate({left: '10px'}, 400, function () {
                    $(this).find('ul').append(html);
                    if (0 == that.page)
                        that.objMapCommon.getListCount('/alarm/getHistoryCount?' + timeParam + ('' != param.PlateNum ? 'CarIdList=' + param.PlateNum : ''));
                    $('.map-result-list ul li').click(function () {
                        that.objMapCommon.GisObject.layerManager.pointOnClick({
                            type: mode,
                            id: $(this).attr('data-pointid'),
                            recordId: $(this).attr('data-recordId'),
                            x: $(this).attr('data-x'),
                            y: $(this).attr('data-y'),
                            name: $(this).find('.car-id').text(),
                            time: $(this).find('.time').text(),
                            alarmType: $(this).attr('data-alarmType'),
                            memo: $(this).attr('data-memo'),
                            checkPointId: $(this).attr('data-checkooiptid'),
                            attr: gpsParam
                        }, false);
                    });
                    that.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track', 0, gpsParam);
                    if (0 == data.Count % 100 && that.loop) {
                        that.loop = true;
                        that.page++;
                        that.getAlarmReportHistory(param, false);
                    }
                    else {
                        that.loop = false;
                        $('.query').removeClass('disabled');
                    }
                });

            }, function (code) {
                extras.widget.tips.init(0, '暂无相关黑名单历史数据，代码(' + code + ')');
            }, isSearch, function (data) {
                if (204 == data.status) {
                    // extras.widget.tips.init(0, '暂无相关黑名单历史数据，代码(' + data.status + ')');
                    extras.widget.tips.init(0, '暂无相关数据');
                    $('.query').removeClass('disabled');
                }
            }, true);
        }, 1000);
    }
});

var objMapReporthistory = new MapReporthistory(objMapCommon);
objMapReporthistory.reporthistoryInit();//执行初始化