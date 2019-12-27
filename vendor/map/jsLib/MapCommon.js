/**
 * 地图公用JS模块
 */

dojo.provide('MapCommon');

dojo.declare('MapCommon', null, {
    activeLeft: 0,
    isClick: false,
    GisObject: null,
    scaleBar: null,
    videoCount: 0,
    lastReportHistory: null,
    strFormat: 'yyyy-MM-dd',

    /**
     * 把js时间格式转换成自己想要的格式日期
     * @param date js获取的格式日期时间
     * @param fmt 时间格式化方式,eg:'yyyy-MM-dd'
     * @returns {*}
     */
    xdateFormat: function (date, fmt) {
        var objReg = {
            'M+': date.getMonth() + 1,                                  //月
            'd+': date.getDate(),                                       //日
            'h+': date.getHours(),                                      //时
            'm+': date.getMinutes(),                                    //分
            's+': date.getSeconds(),                                    //秒
            'q+': Math.floor((date.getMonth() + 3) / 3),                //季
            'S': date.getMilliseconds()                                 //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));

        for (var k in objReg) {
            if (new RegExp('(' + k + ')').test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (objReg[k]) : (('00' + objReg[k]).substr(('' + objReg[k]).length)));
        }

        return fmt;
    },

    //功能：通用初始化
    commonInit: function () {
        var that = this;
        //日期初始化
        var getBeginInput = $('.map-query-box input[name=begin_date]'),
            getEndInput = $('.map-query-box input[name=end_date]'),
            date = new Date(),
            endDay = this.xdateFormat(date, this.strFormat);
        date.setDate(date.getDate() - 3);
        var beginDay = this.xdateFormat(date, this.strFormat);
        getBeginInput.val(beginDay).datebox({
            Width: 166,
            Height: 28,
            formatter: function (date) {
                return that.xdateFormat(date, that.strFormat);
            },
            parser: function (date) {
                return new Date(Date.parse(date.replace(/-/g, '/')));
            }
        }).datebox('calendar').calendar({
            validator: function (date) {
                var curent = that.xdateFormat(date, that.strFormat).replace(/-/g, '');
                // var now = new Date();
                // var d1 = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                // var begin = that.xdateFormat(d1, that.strFormat).replace(/-/g, '');
                var begin = "19700101";//初始化选择日期为1970年01月01日
                var end = getEndInput.val().replace(/-/g, '');
                return parseInt(begin, 10) <= parseInt(curent, 10) && parseInt(curent, 10) <= parseInt(end, 10);
            }
        });
        getEndInput.val(endDay).datebox({
            panelWidth: 180,
            formatter: function (date) {
                return that.xdateFormat(date, that.strFormat);
            },
            parser: function (date) {
                return new Date(Date.parse(date.replace(/-/g, '/')));
            }
        }).datebox('calendar').calendar({
            validator: function (date) {
                var curent = that.xdateFormat(date, that.strFormat).replace(/-/g, '');
                var begin = $('.map-query-box input[name=begin_date]').val().replace(/-/g, '');
                var end = endDay.replace(/-/g, '');
                return parseInt(begin, 10) <= parseInt(curent, 10) && parseInt(curent, 10) <= parseInt(end, 10);
            }
        });

        //地区列表初始化
        this.xajax('/district/getDistrictList', '', 'GET', function (data) {
            var destrict = data.Result;
            var html = '';
            for (var i in destrict) {
                html += '<option valur="' + destrict[i].DistrictName + '">' + destrict[i].DistrictName + '</option>';
            }
            $('.map-query-box .district select').html(html);
        }, function () {
        }, false);

        //html初始化
        $('.map-query-box .textbox-icon').addClass('fa fa-th');
        $('.setting').hide();
        $('.time-axis .node').each(function (i) {
            $(this).css({left: ($(this).parent().width() + 13) / 7 * i + 6.5});
        });

        $('.time-axis em').mousedown(function (e) {
            if (that.isClick)
                return;

            that.isClick = true;
            var em = $(this);
            var timeAxis = $(this).parents('.time-axis');
            var x = e.pageX;
            $(document).mousemove(function (event) {
                var offset = timeAxis.offset().left;
                var pX = event.pageX;
                var range = [12, -12];
                //防止点击时往下触发
                if (Math.abs(x - pX) < 1)
                    return true;
                if (pX < offset + range[0])
                    pX = offset + range[0];
                that.activeLeft = pX - offset - range[0];

                if (range[0] > that.activeLeft)
                    that.activeLeft = range[0] + 6.5;
                if (timeAxis.width() < that.activeLeft + 26)
                    that.activeLeft = timeAxis.width() - 28;
                em.css({'left': that.activeLeft});
                $('.innertimeline').css({'width': that.activeLeft - 18});
            }).mouseup(function (event) {
                var timeAxis = $('.time-axis');
                var activeNode = timeAxis.find('em');
                var nodeScale = timeAxis.find('.node:eq(1)').offset().left - timeAxis.find('.node:eq(0)').offset().left;
                var median = nodeScale / 2;//两点中间值
                var nodeTime = parseInt(that.activeLeft / nodeScale);//倍数
                var nodeMod = that.activeLeft % nodeScale;//余数
                //判断偏移方向
                if (nodeMod - 13 > median)
                    nodeTime++;

                activeNode.animate({'left': nodeScale * nodeTime + 18.5}, 500);
                $('.innertimeline').animate({'width': nodeScale * nodeTime + 12}, 500);
                timeAxis.find('.node:eq(' + nodeTime + ')').addClass('active').siblings().removeClass('active');

                var date = timeAxis.find('.active').attr('data-date');
                var deviceId = $('.map-result-list li.active').attr('data-deviceid');
                that.getLocationTrace(that.getDateToday(date) + ' 00:00:00', that.getDateToday() + ' 23:59:59', '["' + deviceId + '"]', parseInt(date));
                $(this).off('mousemove mouseup');
                $('#_easyui_textbox_input1').val(that.getDateToday(parseInt(date) + 1));
                $('#_easyui_textbox_input2').val(that.getDateToday());
            });
        });

        $('.time-axis .node').click(function () {
            var date = $(this).attr('data-date');
            var deviceId = $('.map-result-list li.active').attr('data-deviceid');
            $(this).addClass('active').siblings().removeClass('active');
            that.getLocationTrace(that.getDateToday(date) + ' 00:00:00', that.getDateToday() + ' 23:59:59', '["' + deviceId + '"]', parseInt(date));
            var nodeLeft = parseInt($(this).css('left').replace('px', ''));
            $('.time-axis em').animate({'left': nodeLeft + 12.5}, 500);
            $('.innertimeline').animate({'width': nodeLeft}, 500);
            $('#_easyui_textbox_input1').val(that.getDateToday(parseInt(date) + 1));
            $('#_easyui_textbox_input2').val(that.getDateToday());
        });

        $(document).on('click', '#video-taken', function () {
            var plateNum = $('.custom-info').attr('data-plateNum');
            var time = $('.custom-info').attr('data-time');
            that.xajax('/device/deviceIpList', '["' + plateNum + '"]', null, function (data) {
                var item = data.Result;
                if (1 > item.length) {
                    extras.widget.tips.init(0, '该警车没有绑定IP');
                    return;
                }

                $('.video-line').animate({right: 0}, 500, function () {
                    var videoLine = $(this);
                    $('.esriSimpleSliderTL').animate({right: 350}, 500);
                    $('#home-button').animate({right: 428}, 500);
                    if (1 > $('.video-line li[data-plateNum="' + plateNum + '"]').size()) {
                        that.videoCount++;
                        var stopVideo = that.getRTSPCode(item[0].Ip, 1, 0, 0);
                        videoLine.find('ul').append(stopVideo);
                        var videoItem = '<li data-plateNum="' + plateNum +
                            '" data-time="' + time + '"><div class="loading">正在载入视频...</div>' +
                            that.getRTSPCode(item[0].Ip, 1) +
                            '<div class="line-area"></div>' +
                            '<img name="lineArea" width=78 height=78 usemap="#lineArea1Map' + that.videoCount + '" border="0"/>' +
                            '<map name="lineArea1Map' + that.videoCount + '" id="lineArea1Map">' +
                            '<area shape="poly" coords="25,5,32,23,38,23,44,24,52,5,44,2,33,2" class="active" title="正前相机" data-line="1" />' +
                            '<area shape="poly" coords="44,24,53,32,72,24,67,16,60,9,53,5" title="右侧前相机" data-line="2" />' +
                            '<area shape="poly" coords="53,33,53,44,73,52,75,43,75,34,72,25" title="右侧垂相机"  data-line="3" />' +
                            '<area shape="poly" coords="69,60,61,68,52,72,45,54,50,49,53,45,72,52" title="右侧后相机" data-line="4" />' +
                            '<area shape="poly" coords="32,53,25,72,33,75,45,75,52,72,45,54" title="大华羁押位相机" data-line="8" />' +
                            '<area shape="poly" coords="23,45,28,50,32,53,25,72,16,68,9,61,5,52" title="左侧后相机" data-line="7" />' +
                            '<area shape="poly" coords="24,33,23,39,23,45,4,52,2,44,2,35,5,25" title="左侧垂相机" data-line="6" />' +
                            '<area shape="poly" coords="5,24,11,15,17,9,24,5,32,24,24,32" title="左侧前相机" data-line="5" />' +
                            '</map>' +
                            '<div class="info"><span>正面相机</span><!--<a class="maximize pull-right"></a>--><em class="time pull-right">' + time + '</em><em class="plate-num pull-right">' + plateNum + '&nbsp;&nbsp;</em></div><em class="close"></em></li>';

                        videoLine.find('ul #vlc').remove();
                        videoLine.find('ul').append(videoItem);
                        videoLine.find('area').click(function () {
                            if ($(this).hasClass('active'))
                                return;

                            var curIndex = $(this).index();
                            var line = $(this).attr('data-line');
                            $(this).parents('li').find('.info span').text($(this).attr('title'));
                            $(this).addClass('active').siblings().removeClass('active');
                            $(this).parents('li').find('.line-area').animate({border: 0}, {
                                step: function () {
                                    $(this).css('transform', 'rotate(' + curIndex * 45 + 'deg)');
                                },
                                duration: 'slow'
                            }, 'linear');
                            $(this).parents('li').find('#vlc').remove();
                            var stop = that.getRTSPCode(item[0].Ip, line, 0, 0);
                            $(this).parents('li').find('#vlc').append(stop);
                            var code = that.getRTSPCode(item[0].Ip, line);
                            $(this).parents('li').find('#vlc').remove();
                            $(this).parents('li').append(code);
                        });
                        videoLine.find('.close').click(function () {
                            $(this).parents('li').remove();
                            that.videoCount--;
                            if (0 == $('.video-line li').size()) {
                                $('.video-line').animate({'right': '-350px'}, 500);
                                $('.esriSimpleSliderTL').animate({right: 90}, 500);
                                $('#home-button').animate({right: 166}, 500);
                                $('.map-sw-button').animate({right: 15}, 500);
                            }
                            that.setArrow();
                        });
                    }

                });
            }, function () {
                extras.widget.tips.init(0, '该警车没有可调取的视频');
            }, false);

            that.setArrow();
        });

        /**
         * 委派记录图片的点击事件
         */
        $(document).on('click', '.all-img li', function () {
            var pictureBox = $(this).parents('.picture-box'),
                active = pictureBox.find('.all-img .active'),
                currentImg = pictureBox.find('.current-img');
            if ($(this).hasClass('angle-up')) { //点击查看上一条图片按钮
                if (active.prev().hasClass('angle-up')) //判断是否到顶了
                    return;
                if (active.prev().is(':hidden')) { //判断上一张图片是否隐藏
                    active.next().next().hide();
                    active.prev().show();
                }
                active.removeClass('active').prev().addClass('active');
                currentImg.html(active.prev().html()); //更换当前图片
            } else if ($(this).hasClass('angle-down')) { //点击查看下一条图片按钮
                if (active.next().hasClass('angle-down')) //判断是否到底了
                    return;
                if (active.next().is(':hidden')) { //判断下一张图片是否隐藏
                    active.prev().prev().hide();
                    active.next().show();
                }
                active.removeClass('active').next().addClass('active');
                currentImg.html(active.next().html()); //更换当前图片
            } else { //点击查看图片
                $(this).addClass('active').siblings().removeClass('active');
                currentImg.html($(this).html());
            }
            //以下if语句根据判断class来改变上下点击按钮状态
            if (pictureBox.find('.active').prev().hasClass('angle-up') || 0 == pictureBox.find('.active').length) {
                pictureBox.find('.angle-up').addClass('disabled');
            } else
                pictureBox.find('.angle-up').removeClass('disabled');
            if (pictureBox.find('.active').next().hasClass('angle-down') || 0 == pictureBox.find('.active').length) {
                pictureBox.find('.angle-down').addClass('disabled');
            } else
                pictureBox.find('.angle-down').removeClass('disabled');
        });
        //地图初始化
        this.GisObject = new extras.MapInitObject('meii-map');
        this.GisObject.setMapOptions({
            logo: false,
            extent: '12557877.595482401,2596928.9267310356,12723134.450635016,2688653.360673282',
            center: null,
            zoom: 12
        });
        this.GisObject.addDefaultLayers();
    },

    //功能：获取警车轨迹路径
    getLocationTrace: function (beginTime, endTime, deviceId, days) {
        var that = this;
        this.GisObject.layerManager.createLayerById('GM_Track', true);
        this.xajax('/gps/getLocationTrace?TimeBegin=' + beginTime + '&TimeEnd=' + endTime, deviceId || '[]', null, function (data) {
            var html = '', gpsArr = [];
            var list = data.Result;
            for (var i in list) {

                html += '<li data-id=' + ('locus' + i) + ' data-coordinate="' + list[i].GPSData + '"><div class="serial">' + (parseInt(i) + 1) + '</div><div class="info"><p class="time">' + list[i].Time + '</p><p class="car-id">' + list[i].DeviceId + '</p></div></li>';
                var gpsGroup = list[i].GPSData.split(';');
                gpsArr[i] = {
                    'id': 'locus' + i, //唯一ID
                    'x': parseFloat(gpsGroup[1]), //经纬度坐标
                    'y': parseFloat(gpsGroup[0]), //经纬度坐标
                    'attributes': {
                        'title': list[i].DeviceId + '的轨迹', //将对应属信息回传
                        'name': list[i].DeviceId,
                        'time': list[i].Time,
                        'imgUrl': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/tt2.jpg'
                    }
                }
            }

            if (0 == gpsArr.length) {
                extras.widget.tips.init(0, '该警车没有' + ('object' == typeof days ? days.begin + '至' + days.end : (days || $('.time-axis .active').attr('data-date'))) + '天内轨迹');
                return;
            }

            var param = that.getGPSParam(gpsArr);
            that.GisObject.layerManager.addGraphicToMap('GM_Track', 0, param);
            that.GisObject.layerManager.resizeCenter(gpsArr[0].x, gpsArr[0].y);
        }, function (data) {
            //console.log(data);
        }, false, function () {
            that.isClick = false;
        });
    },

    /**
     * 获取当天日期 如：1970-01-01
     * @param diff 距离今天相差天数  如：1-获取昨天日期，2-获取前天日期
     * @returns {string}
     */
    getDateToday: function (diff) {
        var date = new Date();
        if (diff) {
            var date2 = new Date(date);
            date2.setDate(date.getDate() - diff + 1);
            return date2.getFullYear() + '-' + (('0' + (date2.getMonth() + 1)).slice(-2)) + '-' + ('0' + date2.getDate()).slice(-2);
        }
        return date.getFullYear() + '-' + (('0' + (date.getMonth() + 1)).slice(-2)) + '-' + ('0' + date.getDate()).slice(-2);
    },
    /**
     * 获取警车列表
     * @param func
     * @param showStatus
     * @param showAxis
     */
    getDeviceList: function (func, showStatus) {
        var that = this;
        setTimeout(function () {
            that.xajax('/gps/getDeviceList', {
                    'TimeBegin': '1970-01-01 00:00:00',
                    'TimeEnd': that.getDateToday() + ' 23:59:59'
                }, 'GET', function (data) {
                    var carArr = [];
                    var onlineHtml = '';
                    var offlineHtml = '';
                    var onlineCount = 0;
                    var offlineCount = 1;
                    //中文排序
                    var list = convertPinyinSort(data.Result, 'DeviceId', 'asc', 1);
                    for (var i = 0; i < data.DeviceCount; i++) {
                        carArr[i] = {
                            'CarId': list[i].DeviceId,
                            'CarStatus': list[i].Online
                        }
                        if (list[i].Online)
                            onlineHtml += '<li data-status="' + list[i].Online + '" data-grouppath="' + list[i].GroupPath + '" data-groupname="' + list[i].GroupName + '" data-id="' + list[i].DeviceId + '" class="disabled"><div class="serial">' + (++onlineCount) + '</div><div class="info"><p class="car-id" >' + list[i].DeviceId + '<span>(' + (list[i].GroupName || '未分组') + ')</span>' + (showStatus ? '<i class="status">' + (list[i].Online ? '在线' : '离线') + '</i>' : '') + '</p>' + (showStatus ? '<p class="time">' + list[i].Time + '</p>' : '') + '</div></li>';
                    }
                    for (var i = 0; i < data.DeviceCount; i++) {
                        if (!list[i].Online)
                            offlineHtml += '<li data-status="' + list[i].Online + '" data-grouppath="' + list[i].GroupPath + '" data-groupname="' + list[i].GroupName + '" data-id="' + list[i].DeviceId + '" class="disabled"><div class="serial">' + (onlineCount + offlineCount++) + '</div><div class="info"><p class="car-id" >' + list[i].DeviceId + '<span>(' + (list[i].GroupName || '未分组') + ')</span>' + (showStatus ? '<i class="status">' + (list[i].Online ? '在线' : '离线') + '</i>' : '') + '</p>' + (showStatus ? '<p class="time">' + list[i].Time + '</p>' : '') + '</div></li>';
                    }
                    $('.map-result-list ul').html(onlineHtml + offlineHtml);
                    if ($.isFunction(func))
                        func(carArr);
                },
                function () {
                }
            );
        }, 1000);
    },

    //功能：返回绘图用的数据结构体
    getGPSParam: function (pointArr, width, height, icon, angle, xOffset, yOffset) {
        return {
            'showpopuptype': 0,
            'geometries': pointArr,
            'symbol': {
                'type': 'esriPMS', //点位图片展示
                'width': width || 14, //宽度
                'height': height || 14, //高度
                'xoffset': xOffset || 0, //x偏移量
                'yoffset': yOffset || 0, //y偏移量
                'angle': angle || 0, //旋转角度
                'url': 'http://' + mapConfig.apiPath + mapConfig.extendDir + '/map/themes/default/img/' + (icon || 'track_icon.png') //图片访问路径
            },
            'infotemplate': {
                'fieldInfos': [
                    {
                        'fieldName': 'name', //指定对应points ->attributes中的对应字段
                        'label': '车牌：', //显示弹窗信息对应的中文名称
                        'visible': true //默认为显示状态 true,
                    },
                    {
                        'fieldName': 'time', //指定对应points ->attributes中的对应字段
                        'label': '时间：', //显示弹窗信息对应的中文名称
                        'visible': true //默认为显示状态 true,
                    }
                ]
            }
        }
    },

    //功能：视频样式处理
    setArrow: function () {
        var size = $('.video-line li').size();
        var width = $('.video-line ul').height();
        if (width < 244 * size) {
            $('.video-line .prev,.video-line .next').fadeIn();
            $('.video-line .prev').mousedown(function () {
                console.log('2');
            });
        }
        else {
            $('.video-line .prev,.video-line .next').fadeOut();
        }
    },

    //功能：获取播放对应视频html代码
    getRTSPCode: function (ip, line, width, height) {
        var startURL = 'rtsp://' + ip + ':8554/EasyRelayModule?name=' + line + '&url=rtsp://172.18.100.' + line + '/h264ESVideoTestSecond';
        if (8 == line)
            startURL = 'rtsp://' + ip + ':8554/EasyRelayModule?name=8&url=rtsp://admin:admin@172.18.100.8:554/cam/realmonitor?channel=1&subtype=1';

        if (0 == width && 0 == height)
            startURL = 'rtsp://' + ip + ':8554/EasyRelayModule?name=' + line + '&cmd=stop';

        return '<object style="z-index:1;" classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921" codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab"  id="vlc" name="vlc" class="vlcPlayer"  events="True">' +
            '<param name="Src" value=' + startURL + ' />' +
            '<param name="ShowDisplay" value="True" />' +
            '<param name="AutoLoop" value="False" />' +
            '<param name="AutoPlay" value="True" />' +
            '<param name="wmode" value="transparent" />' +
            '<embed id="vlcEmb" type="application/x-google-vlc-plugin" version="VideoLAN.VLCPlugin.2" wmode="transparent" autoplay="yes" loop="no" width="' + (width || 320) + '" height="' + (height || 230) + '"  target="' + startURL + '" ></embed>' +
            '</object>';
    },
    getListCount: function (url, data) {
        this.xajax(url, data || '', 'GET', function (result) {
            var countStr = '共查询到 ' + result.Count + '条记录';
            if (0 < $('.map-result-count').size())
                $('.map-result-count').text(countStr);
            else
                $('.map-result-list').before('<div class="map-result-count"> ' + countStr + '</div>')
        }, function () {
        }, false, function () {
        }, false);
    },
    //功能：AJAX公共函数
    xajax: function (url, data, type, success, error, search, complete, isList) {
        $.ajax({
            url: url,
            data: data,
            dataType: 'JSON',
            contentType: 'application/json',
            dataType: 'JSON',
            type: type || 'POST',
            beforeSend: function () {
                if (search && '' != search)
                    $('.map-result-list ul').html('<li class="loading">' + (search ? '正在搜索...' : search) + '</li>');
            },
            success: function (data) {
                if (!data && isList) {
                    $('.map-result-list ul').html('<li class="null">暂无数据</li>');
                    return;
                }
                $('.map-result-list .null').remove();
                if ($.isFunction(success))
                    success(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                if ($.isFunction(error))
                    error(xhr.status, '', textStatus, errorThrown);
            },
            complete: function (XMLHttpRequest, textStatus) {
                $('.map-result-list .loading').remove();
                if (204 == XMLHttpRequest.status || 404 == XMLHttpRequest.status)
                    $('.map-result-count').remove();
                if ($.isFunction(complete))
                    complete(XMLHttpRequest, textStatus);
            }
        });
    }
});