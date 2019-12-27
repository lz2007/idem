/**
 * 移动设备信息查询JS模块
 */
dojo.provide('MapMac');

dojo.declare('MapMac', null, {
    macCount: 1,
    page: 0,
    loop: true,
    objMapCommon: null,

    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },

    //功能：对应模式化页面初始化
    macInit: function () {
        var that = this;

        //html初始化
        $('.map-sw-button .fa-list').attr('href', mode + '.html');
        $('.map-query-box .plate-num').hide();
        $('.map-result-list').find('ul').css('padding-top', '30px');
        $('.map-query-box').animate({top: '12px'}, 500);
        $('.query').click(function () {
            if ($(this).hasClass('disabled'))
                return;
            var timeBegin = $('input[name=begin_date]').val();
            var timeEnd = $('input[name=end_date]').val();
            var checkPointId = $('input[name=checkPointId]').val();
            var mac = $('input[name=mac]').val();
            if ('' == timeBegin || '' == timeEnd) {
                alert('请选择时间');
                return;
            }
            var param = {
                TimeBegin: timeBegin,
                TimeEnd: timeEnd,
                CheckPointId: checkPointId,
                Mac: mac
            };
            $(this).addClass('disabled');
            that.getMobileReportHistory(param, true);
        });

        //数据初始化
        //getMobileReportHistory();
    },

    //功能：获取移动设备信息
    getMobileReportHistory: function (params, isSearch) {
        var that = this;
        if (isSearch) {
            this.loop = false;
            this.page = 0;
            this.macCount = 1;
        }
        var params = params || {TimeBegin: getDateToday(), TimeEnd: getDateToday()};
        var pointParam = 'TimeBegin=' + params.TimeBegin + '%2000:00:00&TimeEnd=' + params.TimeEnd + '%2023:59:59&';

        if (params)
            pointParam += (params.CheckPointId ? 'CheckPointId=' + params.CheckPointId + '&' : '');

        setTimeout(function () {
            that.objMapCommon.xajax('/mobile/queryReportHistory?' + pointParam + 'PageNum=' + that.page, params ? (params.Mac ? '["' + params.Mac + '"]' : '[]') : '[]', null, function (data) {
                var html = '', gpsArr = [];
                var list = data.Result;
                var key = 0;
                if (!data)
                    $('.query').removeClass('disabled')
                for (var i in list) {
                    var macItem = list[i];
                    gpsArr[key] = {
                        'id': 'locus' + that.macCount, //唯一ID
                        'x': parseFloat(macItem.Longitude), //经度坐标
                        'y': parseFloat(macItem.Latitude), //纬度坐标
                        'attributes': {
                            'type': mode,
                            'title': macItem.CheckPointId + '的移动设备信息', //将对应属信息回传
                            'name': macItem.CheckPointId,
                            'time': macItem.Time,
                            'mac': macItem.MAC,
                            'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                        }
                    }
                    html += '<li data-coordinate="' + macItem.GPSData + '" data-checkooiptid="' + macItem.CheckPointId + '" data-time="' + macItem.Time + '" data-pointid="locus' + that.macCount + '" data-x="' + macItem.Longitude + '" data-y="' + macItem.Latitude + '"><div class="serial">' + that.macCount++ + '</div><div class="info"><p class="car-id">' + list[i].MAC + '</p><p class="time">' + macItem.Time + '</p></div></li>';
                    key++;
                }

                var gpsParam = that.objMapCommon.getGPSParam(gpsArr);
                $('.map-result-list').animate({left: '10px'}, 400, function () {
                    $(this).find('ul').append(html);
                    if (0 == that.page)
                        that.objMapCommon.getListCount('/mobile/getMACHistoryCount?' + pointParam + ('' != params.Mac ? 'MACList=' + params.Mac : ''));

                    that.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track', 0, gpsParam, isSearch && 0 == that.page ? true : false);
                    if (1 == that.macCount % 100) {
                        that.page++;
                        that.getMobileReportHistory(params, false);
                    }
                    else
                        $('.query').removeClass('disabled');

                    if (1 == that.macCount)
                        that.loop = true;
                    $('.map-result-list ul li').unbind('click').click(function () {
                        that.objMapCommon.GisObject.layerManager.pointOnClick({
                            type: mode,
                            id: $(this).attr('data-pointid'),
                            checkPointId: $(this).attr('data-checkooiptid'),
                            x: $(this).attr('data-x'),
                            y: $(this).attr('data-y'),
                            name: $(this).attr('data-checkooiptid'),
                            time: $(this).find('.time').text(),
                            mac: $(this).find('.car-id').text(),
                            attr: gpsParam
                        }, false);
                    });
                });
            }, function () {
                extras.widget.tips.init(0, '没有该时间段移动设备信息记录');
            }, isSearch, function (data) {
                if (204 == data.status || 404 == data.status) {
                    extras.widget.tips.init(0, '没有该时间段移动设备信息记录，代码(' + data.status + ')');
                    $('.query').removeClass('disabled');
                }
            }, true);
        }, 1000);
    }
});

var objMapMac = new MapMac(objMapCommon);
objMapMac.macInit();//执行初始化