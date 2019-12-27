/**
 * 图层管理类
 */
dojo.provide("extras.control.LayerManager");
dojo.require("esri.graphic");
dojo.require("esri.SpatialReference");
dojo.require("esri.geometry.Point");
dojo.require("esri.geometry.Extent");
dojo.require("esri.geometry.Multipoint");
dojo.require("esri.geometry.webMercatorUtils");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.layers.GraphicsLayer");
dojo.require("extras.utils.GPSConvertor");
dojo.require("esri.dijit.PopupTemplate");

dojo.declare("extras.control.LayerManager", null, {
    constructor: function () {
        dojo.subscribe("toolBarLoadedEvent", this, "setToolbar");
        this.initLayer();
        this._infoTip = null;
    },
    graphicAttr: null,
    setToolbar: function (toolbar) {
        this.toolbar = toolbar;
        this.map = toolbar.map;
    },
    initLayer: function () {
        this.layerContainer = {};
    },
    addOneGraphicToMap: function (layerId, graphicObj, isClear) {
        if (typeof graphicObj == "string") {
            graphicObj = dojo.fromJson(graphicObj);
        }
        var layer = this.createLayerById(layerId, isClear);
        if (layer) {
            try {
                var idKey = graphicObj.id;
                var ptObj = graphicObj.geometry;
                var point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(ptObj.x, ptObj.y));
                var symbol = new esri.symbols.PictureMarkerSymbol(graphicObj.symbol);
                var attributes = graphicObj.attributes;
                var graphic = new esri.Graphic(point, symbol, attributes);
                graphic.id = idKey;
                layer.add(graphic);

                dojo.connect(layer, "onClick", dojo.hitch(this, function (evt) {
                    this.toolbar.showInfoWindow(evt.graphic);
                }));
            } catch (e) {

            }
        }
    },
    /**
     * 弹出窗模板
     * @param attr
     * @param showLink
     */
    pointOnClick: function (attr, showLink) {
        this.graphicAttr = attr;
        var newGPS = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(attr.y), parseFloat(attr.x));
        var pt = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(newGPS.lon, newGPS.lat, {"wkid": 102100}));
        this.map.infoWindow.setContent(this.getWindowTemplate(attr, showLink));
        if ('reporthistory' == attr.type)
            this.map.infoWindow.resize(340, 390);
        else
            this.map.infoWindow.resize(330, 230);
        this.map.infoWindow.show(pt);
        this.map.centerAt(pt);

    },
    getWindowTemplate: function (attr, showLink) {
        var content = '<div class="custom-info" data-plateNum="' + attr.name + '" data-time="' + attr.time + '">';
        switch (attr.type) {
            case 'mac':
                content += '<b>MAC地址：</b>' + attr.mac + '<br/><b>反恐车辆：</b>' + attr.name + '<br/> <b>时间：</b>' + attr.time;
                break;
            case 'point':
                content += '<b>车牌号码：</b>' + attr.name + '<br/><b>抓拍时间：</b>' + attr.time + '<br/><b>反恐车辆：</b>' + attr.checkPointId + '<br/><b>车辆颜色：</b>' + attr.carColor + '<br/><b>车辆类型：</b>' + attr.carType + '<br/><b>上报地点：</b>' + attr.x + '; ' + attr.y;
                break;
            case 'reporthistory':
                content += '<b>车牌号码：</b>' + attr.name + '<br/><b>反恐车辆：</b>' + attr.checkPointId + '<br/><b>上报地点：</b>' + attr.x + '; ' + attr.y + '<br/><b>上报时间：</b>' + attr.time + '<br/><b>布控类型：</b>' + attr.alarmType + '<br/><b>备注： </b>' + attr.memo + '<hr>';
                $.ajax({ //请求记录上传图片
                    url: '/blackcarlist/queryReportPhoto?RecordId=' + attr.recordId,
                    data: '',
                    dataType: 'JSON',
                    async: false,
                    contentType: 'application/json',
                    dataType: 'JSON',
                    type: 'GET',
                    success: function (data) {
                        var resultList = data.Photos,
                            liHtml = '',
                            currentImg = '';
                        if (0 < resultList.length) { //判断有无图片
                            currentImg = '<img src="data:image/.jpg;base64,' + resultList[0] + '"/>'; //当前大图
                            for (var i in resultList) { //遍历图片信息
                                liHtml += '<li class="' + (0 == i ? 'active' : '') + '" ' + (2 < i ? 'style="display: none;"' : '') + '><img src="data:image/.jpg;base64,' + resultList[i] + '"/></li>';
                            }
                            liHtml += '<li class="angle-down ' + (1 < resultList.length ? "" : "disabled") + '" title="点击查看下一张图片"><span class="fa fa-angle-down"></span></li>'; //拼接点击下一项按钮
                        } else {
                            liHtml = '<li>暂无图片</li><li class="angle-down disabled" title="点击查看下一张图片"><span class="fa fa-angle-down"></span></li>';
                            currentImg = '暂无图片';
                        }
                        //组装图片Html
                        var imgHtml = '<div class="picture-box"><div class="current-img">' + currentImg + '</div><ul class="all-img"><li class="angle-up disabled" title="点击查看上一张图片"><span class="fa fa-angle-up"></span></li>' + liHtml + '</ul></div>';
                        content += imgHtml;
                    },
                    error: function () {
                        //组装图片Html
                        var imgHtml = '<div class="picture-box"><div class="current-img">暂无图片</div><ul class="all-img"><li class="angle-up disabled" title="点击查看上一张图片"><span class="fa fa-angle-up"></span></li><li>暂无图片</li><li class="angle-down disabled" title="点击查看下一张图片"><span class="fa fa-angle-down"></span></li></ul></div>';
                        content += imgHtml;
                    }
                });
                break;
            default:
                content += '<b>车牌：</b>' + attr.name + '<br/> <b>时间：</b>' + attr.time + (showLink ? '<br/><b>对讲机号：</b>' + (attr.interphone || '未知') : '') + (showLink ? '<br/><b>所属部门：</b>' + (attr.groupname || '未知') : '');
        }
        content += '</div><div class="break"></div>';
        if (showLink)
            content += '<div class="btn-group"><a href="javascript:;" id="video-taken">视频调用</a><a href="javascript:;" class="video-call disabled" title="敬请期待">视频呼叫</a><a href="javascript:;" class="voice-call disabled" title="敬请期待">视频通话</a><a href="javascript:;" class="msg disabled" title="敬请期待">消息下发</a></div> <div class="break"></div>';
        return content;
    },
    /**
     * 删除所有图层
     * layerId:图层id
     * fn:回调函数
     */
    removeAllGraphicFromMap: function (layerId, fn) {
        var layer = this.createLayerById(layerId, false);
        if (layer) {
            var code = 1;
            try {
                layer.clear();
            } catch (ex) {
                code = -1;
            }
            if (fn) {
                fn.apply(this, [{"code": code}]);
            }
        }
    },
    /**
     * 删除gaphic
     * layerId:图层id
     * gId:graphic的唯一标识
     * fn:回调函数
     */
    removeGraphicFromMap: function (layerId, gId, fn) {
        var layer = this.createLayerById(layerId, false);
        if (layer) {
            var graphic = this.getGrahpicById(layer, gId);
            if (graphic) {
                var code = 1;
                try {
                    layer.remove(graphic);
                } catch (ex) {
                    code = -1;
                }

                if (fn) {
                    fn.apply(this, [{"code": code}]);
                }
            }
        }
    },
    toggleGraphicFromMap: function (layerId, gId, type, fn) {
        var layer = this.createLayerById(layerId, false);
        if (layer) {
            var graphic = this.getGrahpicById(layer, gId);
            if (graphic) {
                var code = 1;
                var isShowing = this.map.infoWindow.isShowing;
                try {
                    if (1 == type)
                        graphic.show();
                    else
                        graphic.hide();
                    if (1 == type && isShowing)
                        this.map.infoWindow.show();
                    else
                        this.map.infoWindow.hide();
                } catch (ex) {
                    code = -1;
                }

                if (fn) {
                    fn.apply(this, [{"code": code}]);
                }
            }
        }
    },
    /**
     * layerId:图层id
     * graphicType:0:markger,1:polyline,2:polygon
     * graphicObj:图形json对象
     * isClear:是否需要先进行清洗数据
     * fn:回调函数
     */
    addGraphicToMap: function (layerId, graphicType, graphicObj, isClear, fn) {
        if (dojo.isString(graphicObj)) {
            graphicObj = dojo.fromJson(graphicObj);
        }
        var layer = this.createLayerById(layerId, isClear);
        if (layer) {
            try {
                var showpopuptype = graphicObj.showpopuptype; //默认0只显示文本，1显示图片，2显示视频，
                var geometriesArr = graphicObj.geometries;
                var symbolObj = graphicObj.symbol;
                var infoTemplateObj = graphicObj.infotemplate;

                if (!geometriesArr) return;
                var infoTemplate = null;
                //var mulitPoint = new esri.geometry.Multipoint();

                for (var i = 0, il = geometriesArr.length; i < il; i++) {
                    var idKey = geometriesArr[i].id;
                    var attributes = geometriesArr[i].attributes;
                    var geometry = null;
                    var symbol = null;
                    var oldX = geometriesArr[i].x;
                    var oldY = geometriesArr[i].y;
                    var newGPS = extras.utils.GPSConvertor.gcj_encrypt(geometriesArr[i].y, geometriesArr[i].x);
                    geometriesArr[i].x = newGPS.lon;
                    geometriesArr[i].y = newGPS.lat;
                    switch (graphicType) {
                        case 0:
                            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(geometriesArr[i].x, geometriesArr[i].y));
                            symbol = new esri.symbols.PictureMarkerSymbol(symbolObj);
                            break;
                        case 1:
                            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polyline(geometriesArr[i].paths));
                            symbol = new esri.symbols.SimpleLineSymbol(symbolObj);
                            break;
                        case 2:
                            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polygon(geometriesArr[i].rings));
                            symbol = new esri.symbols.SimpleFillSymbol(symbolObj);
                            break;
                    }

                    var graphic = this.getGrahpicById(layer, idKey);
                    var templateObj = {
                        type: attributes.type,
                        name: attributes.name,
                        time: attributes.time,
                        recordId: attributes.recordId,
                        alarmType: attributes.alarmType,
                        memo: attributes.memo,
                        interphone: attributes.interPhone,
                        groupname: attributes.groupName,
                        checkPointId: attributes.checkPointId,
                        mac: attributes.mac,
                        carColor: attributes.carColor,
                        carType: attributes.carType,
                        x: oldX,
                        y: oldY
                    };
                    // console.log(templateObj);
                    if (graphic) {
                        if (geometry)
                            graphic.setGeometry(geometry)

                        if (attributes)
                            graphic.setAttributes(attributes)

                        if (symbol)
                            graphic.setSymbol(symbol)

                        if (infoTemplateObj && !attributes.type) {
                            if (showpopuptype == undefined) {
                                //做其他处理
                            } else if (showpopuptype == 0 || showpopuptype == 1) {
                                infoTemplate = new esri.dijit.PopupTemplate(infoTemplateObj);
                                graphic.setInfoTemplate(infoTemplate);
                            } else if (showpopuptype == 2) {
                                this.map.infoWindow.resize(340, 390);
                                infoTemplate = new esri.dijit.PopupTemplate({"title": '测试'});
                                var valueObj = infoTemplateObj.mediaInfos[0].value;
                                var szNodeIdField = valueObj.szNodeId;
                                var szNodeNameField = valueObj.szNodeName;
                                var szNodeId = attributes[szNodeIdField];
                                var szNodeName = attributes[szNodeNameField];
                                var params = "videoValue=" + encodeURIComponent(szNodeId) + "&bmsIp=" + encodeURIComponent(GisObject.bms.ip) + "&bmsPort=" + encodeURIComponent(GisObject.bms.port) +
                                    "&bmsUserName=" + encodeURIComponent(GisObject.bms.userName) + "&bmsPassword=" + encodeURIComponent(GisObject.bms.password);
                                infoTemplate.setContent("<iframe width=300 height=210 frameborder='no' border='0' src='" + selfUrl + "/playRealtimeVideo.jsp?" + params + "'></iframe>");
                                graphic.setInfoTemplate(infoTemplate);
                            } else if (showpopuptype == 3) {

                            }
                        }
                        graphic.refresh();
                    } else {
                        graphic = new esri.Graphic(geometry, symbol, attributes);
                        graphic.id = idKey;
                        if (infoTemplateObj) {
                            if (showpopuptype == undefined) {
                                //做其他处理
                            } else if (showpopuptype == 0 || showpopuptype == 1) {
                                if ('reporthistory' == geometriesArr[i].attributes.type)
                                    this.map.infoWindow.resize(340, 390);
                                infoTemplate = new esri.dijit.PopupTemplate(infoTemplateObj);
                                infoTemplate.setContent(this.getWindowTemplate(templateObj, false));
                                graphic.setInfoTemplate(infoTemplate);
                            } else if (showpopuptype == 2) {
                                this.map.infoWindow.resize(340, 390);
                                infoTemplate = new esri.dijit.PopupTemplate({"title": '测试'});
                                infoTemplate.setTitle(szNodeName);
                                infoTemplate.setContent(this.getWindowTemplate(templateObj, true));
                                graphic.setInfoTemplate(infoTemplate);
                            }
                        }
                        if (!graphic.geometry.x || !graphic.geometry.y) //去掉无效的gps数据
                            continue;
                        layer.add(graphic);
                    }

                    //mulitPoint.addPoint(pt);

                    if (fn) {//回调函数
                        var evt = {};
                        evt.map = this.map;
                        evt.graphic = graphic;
                        fn.apply(this, [evt]);
                    }
                }

                //this.map.setExtent(mulitPoint.getExtent());
            }
            catch
                (e) {

            }
        }
    }
    ,
    resizeCenter: function (x, y) {
        var newGPS = extras.utils.GPSConvertor.gcj_encrypt(parseFloat(y), parseFloat(x));
        var pt = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(newGPS.lon, newGPS.lat, {"wkid": 102100}));
        this.map.centerAt(pt);
    }
    ,
    createLayerById: function (layerId, isClear) {
        var layer = null;
        if (layerId) {
            layer = this.layerContainer[layerId];
            if (!layer) {
                layer = new esri.layers.GraphicsLayer({id: layerId});
                layer.setScaleRange(2311162.217155, 1128.497176);
                this.map.addLayer(layer);
                this.layerContainer[layerId] = layer;

                dojo.connect(layer, "onClick", function (evt) {
                    try {
                        graphicClickHandler(evt);
                    } catch (e) {

                    }
                });
            }
        } else {
            layer = this.map.graphics;
        }

        if (isClear) {
            layer.clear();
        }
        this.map.reorderLayer(layer, this.map._layers.length - 1);
        return layer;
    }
    ,
    getGrahpicById: function (layer, idKey) {
        if (dojo.isString(layer)) {
            layer = this.map.getLayer(layer);
        }

        var graphicsArr = layer.graphics;
        for (var i = 0, il = graphicsArr.length; i < il; i++) {
            if (graphicsArr[i].id == idKey) {
                return graphicsArr[i];
            }
        }
        return null;
    }
    ,
    getP: function (layer, idKey) {
        if (dojo.isString(layer)) {
            layer = this.map.getLayer(layer);
        }

        var graphicsArr = layer.graphics;
        for (var i = 0, il = graphicsArr.length; i < il; i++) {
            if (graphicsArr[i].id == idKey) {
                return graphicsArr[i];
            }
        }
        return null;
    }
    ,
    getGraphicByLayer: function (layer) {
        if (dojo.isString(layer)) {
            layer = this.map
        }
        return this.map.Graphic.getLayer();
    }
    ,
    getLayerStyle: function () {

    }
    ,
    destroy: function () {
        for (var a in this.layerContainer) {
            this.layerContainer[a].destroy();
        }
        this.layerContainer = {};
    }
})