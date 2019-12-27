/**
 * 黑名单车辆信息JS模块
 */
dojo.provide('MapBlacklist');

dojo.declare('MapBlacklist', null, {
    objMapCommon: null,

    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },

    //功能：对应模式化页面初始化
    blacklistInit: function () {
        var that = this;

        //html初始化
        $('.map-sw-button .fa-list').attr('href', 'Surveiling.html');

        //数据初始化
        setTimeout(function () {
            that.objMapCommon.xajax('/alarm/getAlarmList?PageNum=0', '', 'GET', function (data) {
                var html = '', gpsArr = [];
                var list = data.Result;
                var gpsCount = 0;
                for (var i in list)
                {
                    if (!list[i].ReportHistory)
                        continue;

                    var history = list[i].ReportHistory;
                    for (var k in history)
                    {
                        var gpsGroup = history[k].GPSData.split(';');
                        if(!gpsGroup[1]) //去掉一些无效坐标的点
                            continue;
                        html += '<li data-coordinate="' + history[k].GPSData + '" data-time="' + history[k].Time + '" data-pointid="locus' + gpsCount + '" data-x="' + gpsGroup[1] + '" data-y="' + gpsGroup[0] + '"><div class="serial">' + (parseInt(gpsCount) + 1) + '</div><div class="info"><p class="car-id">' + list[i].PlateNumber + '</p><p class="time">' + history[k].Time + '</p></div></li>';
                        gpsArr[gpsCount] = {
                            'id': 'locus' + gpsCount, //唯一ID
                            'x': parseFloat(gpsGroup[1]), //经度坐标
                            'y': parseFloat(gpsGroup[0]), //纬度坐标
                            'attributes': {
                                'title': list[i].PlateNumber + '的违章记录', //将对应属信息回传
                                'name': list[i].PlateNumber,
                                'time': history[k].Time,
                                'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                            }
                        }
                        gpsCount++;
                    }
                }

                var param = that.objMapCommon.getGPSParam(gpsArr, 20, 20, 'info.gif');
                $('.map-result-list').animate({left: '10px', top: '10px'}, 400, function () {
                    $(this).find('ul').html(0 == gpsCount ? '<li class="loading" style="background: none;">暂无黑名单车辆信息<li>' : html);
                    $('.map-result-list ul li').click(function () {
                        that.objMapCommon.GisObject.layerManager.pointOnClick({
                            id: $(this).attr('data-pointid'),
                            x: $(this).attr('data-x'),
                            y: $(this).attr('data-y'),
                            name: $(this).find('.car-id').text(),
                            time: $(this).find('.time').text(),
                            attr: param
                        }, false);
                    });
                });
                that.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track', 0, param);
            }, function () {});
        }, 1000);
    }
});

var objMapBlacklist = new MapBlacklist(objMapCommon);
objMapBlacklist.blacklistInit();//执行初始化