/**
 * 在地图上绘制范围
 */
dojo.provide("extras.range.MapRange");
dojo.require("esri.geometry.Polyline");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("dojo._base.Color");
dojo.require("esri.geometry.ScreenPoint");
dojo.require("esri.geometry.Point");
dojo.require("esri.symbols.SimpleFillSymbol");


// define(['extras/range/IRange', "dojo/_base/declare", "esri/geometry/Polyline",
//     "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "dojo/_base/Color", "esri/geometry/ScreenPoint",
//         "esri/geometry/Point", "esri/symbols/SimpleFillSymbol"],
//     function (IRange, declare, Polyline, SimpleLineSymbol, SimpleMarkerSymbol, Color, ScreenPoint, Point, SimpleFillSymbol) {
dojo.declare("extras.range.MapRange", null, {
    _map: null,
    _line: null,
    _lineSymbol: null,
    _pointSymbol: null,
    _hightLightSymbol: null,
    _drawed: false,
    _mapPath: [],
    _text: "",
    _struct: null,
    _selected: false,
    _isShow: true,

    constructor: function (map, paths, text) {
        this._map = map;
        this._text = text;
        this._line = new esri.geometry.Polyline(this._map.spatialReference);

        this._lineSymbol = new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo._base.Color([0, 0, 255, 0.8]), 1);
        this._hightLightSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, this._lineSymbol, new dojo._base.Color([0, 0, 255, 0.25]));
        this._pointSymbol = new esri.symbols.SimpleMarkerSymbol().setColor(new dojo._base.Color([0, 0, 255, 0.5]));

        //组装多边型
        var tMapPath = [];
        dojo.forEach(paths, dojo.hitch(this, function (item) {
            var tScreenPoint = new esri.geometry.ScreenPoint(item.x, item.y);
            console.log("ScreenPoint: " + tScreenPoint);

            var tPoint = this._map.toMap(tScreenPoint);
            tPoint = new esri.geometry.Point(tPoint.x, tPoint.y, new esri.SpatialReference({wkid: 102100}));

            tMapPath.push(tPoint);
        }));

        //最后一个点
        if (0 != tMapPath.length)
            tMapPath.push(tMapPath[0]);

        this._mapPath = tMapPath;
        this._line.addPath(tMapPath);

        //结构组装
        this._build();

        this._drawed = false;
        this._selected = false;
    },

    _getTextGraphic: function (text) {
        //文字
        var textX = this._mapPath[0].x;
        var textY = this._mapPath[0].y + 80;

        var pt = new esri.geometry.Point(textX, textY, this._map.spatialReference);

        var font = new esri.symbol.Font();
        font.setSize(18);

        var textSymbol = new esri.symbol.TextSymbol();
        textSymbol.setText(text);
        textSymbol.setColor(new dojo._base.Color([0, 0, 255]));
        textSymbol.setFont(font);
        textSymbol.setKerning(true);

        return new esri.Graphic(pt, textSymbol);
    },

    _build: function () {
        //画点
        // dojo.forEach(this._mapPath, dojo.hitch(this, function(item){
        //     this._graphics.push(new esri.Graphic(item, this._pointSymbol));
        // }));

        //组装结构
        this._struct = {
            line: new esri.Graphic(this._line, this._lineSymbol),
            text: this._getTextGraphic(this._text),
            hightLight: new esri.Graphic(this._line, this._hightLightSymbol)
        }

        this._struct.hightLight.hide();
    },

    select: function () {
        if (true == this._isShow)
            this._struct.hightLight.show();

        this._selected = true;
    },

    deselect: function () {
        this._struct.hightLight.hide();
        this._selected = false;
    },

    setText: function (text) {
        this._text = text;

        //删除旧文字
        this._struct.text.hide();
        this._map.graphics.remove(this._struct.text);

        //更改文字图像
        this._struct.text = this._getTextGraphic(this._text);

        //绘制
        this._map.graphics.add(this._struct.text);
    },

    //Override
    draw: function (callback) {
        if (false != this._drawed)
            return;

        this._map.graphics.add(this._struct.line);
        this._map.graphics.add(this._struct.text);
        this._map.graphics.add(this._struct.hightLight);

        this._drawed = true;

        if (null != callback)
            callback();
    },

    //Override
    show: function () {
        this._struct.line.show();
        this._struct.text.show();

        if (true == this._selected)
            this._struct.hightLight.show();

        this._isShow = true;
    },

    //Override
    hide: function () {
        this._struct.line.hide();
        this._struct.text.hide();
        this._struct.hightLight.hide();

        this._isShow = false;
    },

    //Override
    remove: function () {
        //删除
        this.hide();

        this._map.graphics.remove(this._struct.line);
        this._map.graphics.remove(this._struct.text);
        this._map.graphics.remove(this._struct.hightLight);

        this._map.graphics.refresh();
        this._drawed = false;
    },

    //Override
    getPaths: function (getGCJ) {
        if (getGCJ) {
            dojo.require("extras.utils.GPSConvertor");
            var key = 0;
            $.each(this._mapPath, function (key, val) {
                var tMercator = extras.utils.GPSConvertor.mercator_decrypt(val.y, val.x);
                var tGCJ = extras.utils.GPSConvertor.gcj_encrypt(tMercator.lat, tMercator.lon);
                if (4 == key)
                    return;
                val.x = tGCJ.lon;
                val.y = tGCJ.lat;
            });
        }
        return this._mapPath;
    }
});