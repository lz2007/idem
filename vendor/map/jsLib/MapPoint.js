/**
 * 移动卡口过车记录JS模块
 */
dojo.provide('MapPoint');

dojo.declare('MapPoint', null, {
    pointCount: 1,
    page: 0,
    loop: true,
    mapRange: null,                         //地图划区域类
    WGS84: null,                            //世界大地坐标系
    tips: null,
    objMapCommon: null,

    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },

    //功能：对应模式化页面初始化
    pointInit: function () {
        var that = this;

        //html初始化
        $('.map-query-box').find('.mac, .check-point-id').hide();
        $('.check-point-id').show();
        $('.map-district-button').fadeIn();
        $('.map-sw-button .fa-list').attr('href', mode + '.html');

        $('.map-query-box').animate({top: '12px'}, 500);
        $('.map-result-list').animate({left: '10px'}).find('ul').css('padding-top', '30px');
        $('.query').click(function () {
            if ($(this).hasClass('disabled'))
                return;
            var timeBegin = $('input[name=begin_date]').val();
            var timeEnd = $('input[name=end_date]').val();
            var checkPointId = $('input[name=checkPointId]').val();
            var plateNum = $('input[name=plate-num]').val();
            if ('' == timeBegin || '' == timeEnd) {
                alert('请选择时间');
                return;
            }
            var param = {
                TimeBegin: timeBegin,
                TimeEnd: timeEnd,
                CheckPointId: checkPointId,
                PlateNum: plateNum
            };
            that.page = 0;
            that.pointCount = 1;
            that.loop = false;
            $(this).addClass('disabled')
            that.getCarrecordReportHistory(param, true);
        });

        //数据初始化
        this.getCarrecordReportHistory();

        //框选
        $('.map-district-button').mousedown(function (event) {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $('.dstrict-mask').hide();
                $(document).off('mousedown mouseup mousemove');
                $('.map-query-box').animate({top: 10}, 500);
                $('.map-result-list,.map-result-count').animate({left: 10}, 500);
                $('.map-district-button').animate({right: 166}, 500, function () {
                    $('.esriSimpleSliderTL,.map-sw-button').fadeIn(500);
                });
            }
            else {
                $('.dstrict-mask').show();
                $('.map-query-box').animate({top: -70}, 500);
                $('.map-result-list,.map-result-count').animate({left: -350}, 500);
                $('.esriSimpleSliderTL,.map-sw-button').fadeOut(500, function () {
                    $('.map-district-button').animate({right: 15}, 500);
                });
                $(this).addClass('active');
                $(document).mousedown(function (event) {
                    that.loop = false;
                    that.page = 0;
                    that.pointCount = 1;
                    if (2 == event.button) {
                        $(this).off('mousemove mouseup');
                        return;
                    }
                    var dstrictMask = $(this);
                    var startX = event.pageX;
                    var startY = event.pageY;
                    var width = 0;
                    var height = 0;
                    $(this).off('mousemove mouseup').on({
                        mousemove: function (moveEvent) {
                            var domX = moveEvent.pageX;
                            var domY = moveEvent.pageY;
                            width = Math.abs(domX - startX); //取开始坐标和当前坐标的绝对值设置宽度
                            height = Math.abs(domY - startY); //取开始坐标和当前坐标的绝对值设置高度
                            if (1 > $('.canvas-mask').size())
                                $('body').append('<div class="canvas-mask" style="left:' + startX + '" top="' + startY + '"></div>');

                            var selLayer = $('.canvas-mask');
                            selLayer.css({
                                'width': width,
                                'height': height,
                                'left': Math.min(domX, startX),
                                'top': Math.min(domY, startY),
                                'display': 'block'
                            });
                        }, mouseup: function (event) {
                            if (that.mapRange)
                                that.mapRange.remove();

                            var points = [
                                {x: startX, y: startY},
                                {x: startX + event.pageX - startX, y: startY},
                                {x: startX + event.pageX - startX, y: startY + event.pageY - startY},
                                {x: startX, y: startY + event.pageY - startY}
                            ];
                            $(this).off('mousemove');
                            that.objMapCommon.GisObject.layerManager.createLayerById('GM_Track', true);
                            that.mapRange = new extras.range.MapRange(that.objMapCommon.GisObject.map, points, '');
                            that.mapRange.draw();
                            that.WGS84 = that.mapRange.getPaths(true);
                            $('.canvas-mask').remove();
                            that.tips = extras.widget.tips.init(2, '正在搜索该区域过车记录...');
                            that.loop = true;
                            that.page = 0;
                            that.pointCount = 1;
                            that.districtAjax();
                        }
                    });
                });
            }
            event.stopPropagation();
        });
    },
    //功能：获取过车记录
    getCarrecordReportHistory: function (param, isSearch) {
        var that = this;
        var params = param || {TimeBegin: this.objMapCommon.getDateToday(), TimeEnd: this.objMapCommon.getDateToday()};
        var pointParam = 'TimeBegin=' + params.TimeBegin + '%2000:00:00&TimeEnd=' + params.TimeEnd + '%2023:59:59&';
        if (param)
            pointParam += (params.CheckPointId ? 'CheckPointId=' + params.CheckPointId + '&' : '');
        else
            param = {};
        setTimeout(function () {
            that.objMapCommon.xajax('/carrecordquery/queryReportHistory?' + pointParam + 'PageNum=' + that.page, param ? (param.PlateNum ? '["' + param.PlateNum + '"]' : '[]') : '[]', null, function (data) {
                that.getDataSuccess(data, isSearch, 'getCarrecordReportHistory', param, isSearch, pointParam);
            }, function () {
                extras.widget.tips.init(0, '没有该时间段移动卡口过车记录');
                $('.map-result-list ul').html('<li class="null">没有该时间段移动卡口过车记录</li>')
            }, false, function (data) {
                if (204 == data.status || 404 == data.status) {
                    extras.widget.tips.init(0, '暂无相关黑名单历史数据，代码(' + data.status + ')');
                    $('.query').removeClass('disabled');
                }
            }, false);
        }, 1000);
    },

    //功能：获取数据成功处理
    getDataSuccess: function (data, isSearch, loopFuncName) {
        var that = this;
        var html = '', gpsArr = [];
        var list = data.Result;
        var key = 0;
        if (!data)
            $('.query').removeClass('disabled')
        for (var i in list) {
            var point = list[i];
            gpsArr[key] = {
                'id': 'locus' + this.pointCount, //唯一ID
                'x': parseFloat(point.Longitude), //经度坐标
                'y': parseFloat(point.Latitude), //纬度坐标
                'attributes': {
                    'type': mode,
                    'title': point.PlateNumber + '的违章记录', //将对应属信息回传
                    'name': point.PlateNumber,
                    'time': point.Time,
                    'checkPointId': point.CheckPointId,
                    'carColor': point.CarColor || '未知',
                    'carType': point.CarType || '未知',
                    'imgUrl': this.objMapCommon.selfUrl + '/webapp/map/themes/default/img/tt2.jpg'
                }
            }
            html += '<li data-coordinate="' + point.GPSData + '" data-checkPointId="' + point.CheckPointId + '" data-carColor="' + (point.CarColor || '未知') + '" data-carType="' + (point.CarType || '未知') + '" data-time="' + point.Time + '" data-pointid="locus' + this.pointCount + '" data-x="' + point.Longitude + '" data-y="' + point.Latitude + '"><div class="serial">' + this.pointCount++ + '</div><div class="info"><p class="car-id">' + list[i].PlateNumber + '</p><p class="time">' + point.Time + '</p></div></li>';
            key++;
        }

        var param = this.objMapCommon.getGPSParam(gpsArr);
        that.objMapCommon.getListCount('/carrecordquery/getCarRecordCount?' + arguments[5] + ('' != arguments[3].PlateNum && isSearch ? 'CarIdList=' + arguments[3].PlateNum : ''));
        if (0 == this.page)
            $('.map-result-list ul').html(html);
        else
            $('.map-result-list ul').append(html);

        $('.map-result-list ul li').click(function () {
            that.objMapCommon.GisObject.layerManager.pointOnClick({
                type: mode,
                id: $(this).attr('data-pointid'),
                x: $(this).attr('data-x'),
                y: $(this).attr('data-y'),
                checkPointId: $(this).attr('data-checkPointId'),
                carColor: $(this).attr('data-carColor'),
                carType: $(this).attr('data-carType'),
                name: $(this).find('.car-id').text(),
                time: $(this).find('.time').text(),
                attr: param
            }, false);
        });

        this.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track', 0, param, isSearch && 0 == this.page ? true : false);

        if (1 == this.pointCount % 100)
            this.loop = true;

        if (1 == this.pointCount % 100 && this.loop && 1 < this.pointCount)// && $.isFunction(loopFunc)
        {
            this.page++;
            if (loopFuncName == 'getCarrecordReportHistory')
                this.getCarrecordReportHistory(arguments[3], arguments[4]);//循环的时候不要忘记带上以前的参数，否则会出错
            else if (loopFuncName == 'districtAjax')
                this.districtAjax();
        } else
            $('.query').removeClass('disabled');
    },
    //功能：获取数据成功处理
    getDistrictSuccess: function (data, isSearch, loopFuncName) {
        var that = this;
        var html = '', gpsArr = [];
        var list = data.Result;
        var key = 0;
        var minLongitude = Math.min(this.WGS84[0].x, this.WGS84[2].x);
        var maxLongitude = Math.max(this.WGS84[0].x, this.WGS84[2].x);
        var minLatitude = Math.min(this.WGS84[0].y, this.WGS84[2].y);
        var maxLatitude = Math.max(this.WGS84[0].y, this.WGS84[2].y);
        if (!data)
            $('.query').removeClass('disabled')
        for (var i in list) {
            var point = list[i];
            //如果发送来的数据不是在框选范围之内，就抛弃不合法数据
            if (!(point.Longitude >= minLongitude && point.Longitude <= maxLongitude && point.Latitude >= minLatitude && point.Latitude <= maxLatitude))
                continue;

            gpsArr[key] = {
                'id': 'locus' + this.pointCount, //唯一ID
                'x': parseFloat(point.Longitude), //经度坐标
                'y': parseFloat(point.Latitude), //纬度坐标
                'attributes': {
                    'title': list[i].PlateNumber + '的违章记录', //将对应属信息回传
                    'name': list[i].PlateNumber,
                    'time': point.Time,
                    'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                }
            }
            html += '<li data-coordinate="' + point.GPSData + '" data-checkPointId="' + point.CheckPointId + '" data-carColor="' + (point.CarType || '未知') + '" data-carType="' + (point.CarType || '未知') + '" data-time="' + point.Time + '" data-pointid="locus' + this.pointCount + '" data-x="' + point.Longitude + '" data-y="' + point.Latitude + '"><div class="serial">' + this.pointCount++ + '</div><div class="info"><p class="car-id">' + list[i].PlateNumber + '</p><p class="time">' + point.Time + '</p></div></li>';
            key++;
        }

        var param = this.objMapCommon.getGPSParam(gpsArr);
        if (0 == this.page)
            $('.map-result-list ul').html(html);
        else
            $('.map-result-list ul').append(html);

        $('.map-result-list ul li').click(function () {
            that.objMapCommon.GisObject.layerManager.pointOnClick({
                type: mode,
                id: $(this).attr('data-pointid'),
                x: $(this).attr('data-x'),
                y: $(this).attr('data-y'),
                checkPointId: $(this).attr('data-checkPointId'),
                carColor: $(this).attr('data-carColor'),
                carType: $(this).attr('data-carType'),
                name: $(this).find('.car-id').text(),
                time: $(this).find('.time').text(),
                attr: param
            }, false);
        });

        this.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track', 0, param, isSearch && 0 == this.page ? true : false);
        if (!this.loop)
            return;

        if (1 == this.pointCount % 100)
            this.loop = true;

        if (1 == this.pointCount % 100 && this.loop && 1 < this.pointCount)// && $.isFunction(loopFunc)
        {
            this.page++;
            if (loopFuncName == 'getCarrecordReportHistory')
                this.getCarrecordReportHistory(arguments[3], arguments[4]);//循环的时候不要忘记带上以前的参数，否则会出错
            else if (loopFuncName == 'districtAjax')
                this.districtAjax();
        } else
            $('.query').removeClass('disabled');
    },

    //功能：获取框选数据
    districtAjax: function () {
        var that = this;
        this.objMapCommon.xajax('/carrecordquery/queryReportHistory1', {
            PageNum: this.page || 0,
            Time: '1970-01-01 00:00:00,' + this.objMapCommon.getDateToday() + ' 23:59:59',
            DistrictLongitude: Math.min(this.WGS84[0].x, this.WGS84[2].x) + ',' + Math.max(this.WGS84[0].x, this.WGS84[2].x),
            DistrictLatitude: Math.min(this.WGS84[0].y, this.WGS84[2].y) + ',' + Math.max(this.WGS84[0].y, this.WGS84[2].y)
        }, 'GET', function (data) {
            that.getDistrictSuccess(data, false, 'districtAjax');
            that.tips.remove(2);
        }, function (code) {
            extras.widget.tips.init(0, '该区域没有数据');
        }, null, function () {
            that.tips.remove();
        }, false);
    }
});

var objMapPoint = new MapPoint(objMapCommon);
objMapPoint.pointInit();//执行初始化