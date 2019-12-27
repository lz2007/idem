/**
 * 警车实时监控JS模块
 */
dojo.provide('MapDefault');

dojo.declare('MapDefault', null, {
    listCount: 1,
    date: new Date(),
    realCarArr: [],
    alarmType: 0,
    objMapCommon: null,
    lastReportHistory: {},
    constructor: function (objMapCommon) {
        this.objMapCommon = objMapCommon;
    },
    /**
     * 警车实时监控页面初始化
     */
    defaultInit: function () {
        var that = this;
        //html初始化
        $('.map-query-box,.map-query-box .time, .map-sw-button, .check-point-id, .mac, .plate-num').hide();
        $('.map-result-list').animate({left: '10px', top: '12px'}, 500);
        // $('.map-query-box').animate({top: '12px'}, 500);
        $('.map-marquee').fadeIn(200);
        $('.alram-list').hover(function () {
            $(this).addClass('alram-list-open').find('ul').fadeIn(200);
        }, function () {
            $(this).removeClass('alram-list-open').find('ul').fadeOut(200);
        });
        //设置区域
        $('.setting').click(function () {
            $('.map-result-list').animate({left: '-350px'}, 500, function () {
                $('.map-dstrict-list').animate({left: '10px'}, 500, function () {
                    var areaList = $(this);
                    xajax('/district/getDistrictList', '', 'GET', function (data) {
                        var list = data.Result, html = '';
                        for (var i in list) {
                            html += '<li data-id="' + list[i].Id + '" data-LTLat="' + list[i].TL_Latitude + '" data-LTLon="' + list[i].TL_Longitude + '" data-LRLat="' + list[i].LR_Latitude + '" data-LRLon="' + list[i].LR_Longitude + '"><div class="serial pull-left">' + (parseInt(i) + 1) + '.</div><div class="info pull-left"><span>' + list[i].DistrictName + '</span><a class="del pull-right fa fa-trash-o" title="删除"></a><a class="modify pull-right fa fa-pencil-square-o" title="修改"></a></div></li>';
                        }
                        $('.map-dstrict-list ul').html(html);
                    });
                    $(this).find('.close').click(function () {
                        areaList.animate({left: '-350px'}, 500);
                        $('.map-result-list').animate({left: '10px'}, 500);
                    });
                });
            });
        });

        //最近黑名单列列表
        var timer = setInterval(function () {
            that.objMapCommon.xajax('/alarm/getReportHistory?' + 'TimeBegin=1970-01-01%2000:00:00&TimeEnd=' + that.objMapCommon.getDateToday() + '%2023:59:59&' + 'PageNum=0', '', null,
                function (data) {
                    if (!data.Result)
                        return;
                    that.setAlarmList(data);
                }, function () {
                }, false)
        }, 5000);

        //隐藏\显示告警标记
        $('.clear-point').click(function (event) {
            $('.marquee marquee').html('');
            var size = $('.alram-list li').size();
            if (1 > size)
                return;
            for (var i = 0; i < $('.alram-list li').size(); i++) {
                that.objMapCommon.GisObject.layerManager.toggleGraphicFromMap('GM_Alarm', ('alarm' + i), that.type);
            }
            $(this).find('span').text(1 == that.type ? '隐藏' : '显示');
            that.type = 1 == that.type ? 0 : 1;
            event.stopPropagation();
        });

        this.objMapCommon.getDeviceList(function (carArr) {
            that.realCarArr = carArr;
            var quered = false;
            setInterval(function () {
                that.objMapCommon.xajax('/gps/getLastLocation', JSON.stringify(that.realCarArr), null, function (data) {
                    var gpsArr = [];
                    var count = 1;

                    $.each(data, function (key, val) {
                        if (key + 1 == data.length && !quered) {
                            getDeviceQuery();
                            quered = true;
                        }
                        that.objMapCommon.GisObject.layerManager.createLayerById('GM_Track' + count, true);
                        if (1 > val.length || !val[0] || !val[0].Location || !val[1] || !val[1].Location)
                            return;

                        var gpsGroup0 = val[0].Location.split(';');//经度
                        var gpsGroup1 = val[1].Location.split(';');//纬度
                        var current = $('.map-result-list li[data-id=' + key + ']');
                        var carStatus = current.attr('data-status');//车辆状态
                        //var direction = Math.atan((gpsGroup1[1] - gpsGroup0[1]) * Math.cos(gpsGroup1[0]) / (gpsGroup1[0] - gpsGroup0[0]));
                        //计算两个坐标偏移方向
                        var direction = 360 * Math.atan((gpsGroup1[1] - gpsGroup0[1]) * Math.cos(gpsGroup1[0]) / (gpsGroup1[0] - gpsGroup0[0])) / (2 * Math.PI) + (0 < gpsGroup1[0] - gpsGroup0[0] ? 180 : 0);
                        if (isNaN(direction))
                            direction = 0;

                        gpsArr[0] = {
                            'id': 'locus' + count, //唯一ID
                            'x': parseFloat(gpsGroup0[1]), //经度坐标
                            'y': parseFloat(gpsGroup0[0]), //纬度坐标
                            'attributes': {
                                'title': key + '的实时位置', //将对应属信息回传
                                'name': key,
                                'time': val[0].Time,
                                'interPhone': current.attr('data-interphone'),
                                'groupName': current.data('grouppath') || '未知',
                                'location': val[0].Location,
                                'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                            }
                        }
                        that.objMapCommon.GisObject.layerManager.addGraphicToMap('GM_Track' + count, 0, {
                            'showpopuptype': 2,
                            'geometries': gpsArr,
                            'symbol': {
                                'type': 'esriPMS', //点位图片展示
                                'angle': direction, //旋转角度
                                'height': 26, //高度
                                'width': 19, //宽度
                                'xoffset': 0, //x偏移量
                                'yoffset': 0, //y偏移量
                                'url': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/' + ('true' == carStatus ? 'blingbling.gif' : 'nobling.png') //图片访问路径
                            },
                            'infotemplate': {
                                'title': '{title}', //指定对应points -> attributes中的标题
                                'fieldInfos': [
                                    {
                                        'fieldName': 'name', //指定对应points ->attributes中的对应字段
                                        'label': '车牌', //显示弹窗信息对应的中文名称
                                        'visible': true //默认为显示状态 true,
                                    },
                                    {
                                        'fieldName': 'time', //指定对应points ->attributes中的对应字段
                                        'label': '时间', //显示弹窗信息对应的中文名称
                                        'visible': true          //默认为显示状态 true,
                                    }
                                ]
                            }
                        });

                        $('.map-result-list li[data-id="' + key + '"]').removeClass('disabled').attr({
                            'data-status': carStatus,
                            'data-coordinate': val[0].Location,
                            'data-x': gpsGroup0[1],
                            'data-y': gpsGroup0[0]
                        }).find('.time').text(val[0].Time);


                        $('.map-result-list li').off('click').click(function () {
                            if ($(this).hasClass('disabled')) {
                                extras.widget.tips.init(0, '警车' + $(this).attr('data-id') + '没有上报记录');
                                return false;
                            }
                            that.objMapCommon.GisObject.layerManager.pointOnClick({
                                    id: "locus" + count,
                                    x: $(this).attr('data-x'),
                                    y: $(this).attr('data-y'),
                                    name: $(this).attr('data-id'),
                                    time: $(this).find('.time').text(),
                                    interphone: $(this).attr('data-interphone'),
                                    groupname: $(this).data('grouppath') || '未知'
                                },
                                true
                            );
                        });
                        count++;
                    });
                }, function (data) {
                    console.log(data);
                }, false);
            }, 3000);
            //15秒重获一次设备
            setInterval(function () {
                that.objMapCommon.getDeviceList(function (carArr) {
                    that.realCarArr = carArr;
                    getDeviceQuery();
                }, true, false);
            }, 14000);
            //查找设备，设置对讲机、所属部门
            function getDeviceQuery() {
                that.objMapCommon.xajax('/device/deviceQuery', {"DeviceType": 100}, 'POST', function (data) {
                    var list = data.Result;
                    for (var i = 0; i < list.length; i++) {
                        $('.map-result-list li[data-id="' + list[i].DeviceId + '"]').attr({
                            'data-interPhone': list[i].InterPhone,
                            'data-groupname': list[i].GroupName
                        });
                    }
                });
            }

        }, true, false);

        var plateNum = $('input[name=plate-num]').val();
    },
    //近期黑名单列表
    setAlarmList: function (data) {
        var that = this, html = '', count = 0, gpsArr = [], alarmList = data.Result, item0 = alarmList['Item0'], prevTimeStamp = new Date(this.lastReportHistory.Time).getTime(), curTimeStamp = new Date(item0.Time).getTime();
        for (var i = 0; i < data.Count; i++) {
            if (prevTimeStamp < curTimeStamp && 0 == i) {
                var gpsData = item0.GPSData.split(';');
                $('.map-marquee marquee').append('<a data-id="alarm' + i + '" data-checkPointId="' + item0.CheckPointId + '" data-x="' + gpsData[1] + '" data-y="' + gpsData[0] + '" data-plateNum="' + item0.PlateNumber + '" data-time="' + item0.Time + '" data-alarmType="' + item0.AlarmType + '" data-memo="' + item0.Memo + '">' + that.listCount++ + '.<span>车牌：</span>' + item0.PlateNumber + '<span>卡口编号：</span>' + (item0.CheckPointId || '未知') + '<span>时间：</span>' + item0.Time + '</a>');
            }
            if (14 < i)
                continue;
            var item = alarmList['Item' + i];
            var gpsData = item.GPSData.split(';');
            html += '<li data-id="alarm' + i + '" data-checkPointId="' + item.CheckPointId + '" data-recordId="' + item.Id + '" data-x="' + gpsData[1] + '" data-y="' + gpsData[0] + '" data-plateNum="' + item.PlateNumber + '" data-time="' + item.Time + '" data-alarmType="' + (item.AlarmType || '未知') + '" data-memo="' + (item.Memo || '无') + '"><p class="plate-num">' + (10 > count ? '&nbsp;' : '') + (count + 1) + '. <span>车牌：</span>' + item.PlateNumber + '</p><p class="check-point-id">' + '<span>卡口编号：</span>' + (item.CheckPointId || '未知') + '</p><p class="time"><span>时间：</span>' + item.Time + '</p></li>';
            gpsArr[count] = {
                'id': 'alarm' + count, //唯一ID
                'x': parseFloat(gpsData[1]), //经度坐标
                'y': parseFloat(gpsData[0]), //纬度坐标
                'attributes': {
                    type: 'reporthistory',
                    title: item.PlateNumber + '的违章记录', //将对应属信息回传
                    name: item.PlateNumber,
                    time: item.Time,
                    recordId: item.Id,
                    alarmType: item.AlarmType || '未知',
                    checkPointId: item.CheckPointId || '未知',
                    memo: item.Memo || '无',
                    imgUrl: 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/webapp/map/themes/default/img/tt2.jpg'
                }
            };
            count++;
        }
        this.lastReportHistory = item0;
        $('.alram-list ul').html(html);
        var params = this.objMapCommon.getGPSParam(gpsArr, 20, 20, 'info.gif');
        this.objMapCommon.GisObject.layerManager.addGraphicToMap("GM_Alarm", 0, params);
        $('.alram-list ul li,.marquee a').unbind().click(function () {
            that.objMapCommon.GisObject.layerManager.toggleGraphicFromMap("GM_Alarm", $(this).attr('data-id'), 1);
            that.objMapCommon.GisObject.layerManager.pointOnClick({
                type: 'reporthistory',
                id: $(this).attr('data-pointid'),
                x: $(this).attr('data-x'),
                y: $(this).attr('data-y'),
                checkPointId: $(this).attr('data-checkPointId') || '未知',
                name: $(this).attr('data-plateNum'),
                time: $(this).attr('data-time'),
                recordId: $(this).attr('data-recordId'),
                alarmType: $(this).attr('data-alarmType'),
                memo: $(this).attr('data-memo'),
                attr: params
            }, false);
        });
    }
});

var objMapDefault = new MapDefault(objMapCommon);
objMapDefault.defaultInit();//执行初始化