/**
 * 绘制矩形范围
 * 说明:
 * 1.鼠标松开完成绘图
 */
dojo.provide("extras.range.AnimationRectRange");
dojo.require("dojo._base.array");
dojo.require("extras.range.IRange");

// define(["dojo/_base/array", 'extras/range/IRange', "dojo/_base/declare"], function (array, IRange, declare) {
dojo.declare("extras.range.AnimationRectRange", null, {
    _dragEvent: null,
    _paths: [],
    _markNode: null,
    _eventHandler: [],
    _callback: null,
    _startPoint: null,
    _endPoint: null,
    _mouseIsDown: false,
    _changed: false,
    _defaultStyle: {
        backgroundColor: "blue",
        width: "100px",
        height: "100px",
        zIndex: 800,
        position: "absolute",
        left: "0px",
        top: "0px",
        display: "none",
        opacity: 0.4
    },

    _canvas: null,

    constructor: function (dragEvent) {
        this._dragEvent = dragEvent;

        //绘图层
        this._canvas = dojo.create("div");
        dojo.create(this._canvas, {
            style: {
                width: "100%",
                height: "100%",
                zIndex: 100,
                position: "absolute",
                left: "0px",
                top: "0px",
                display: "none"
            }
        }, dojo.body());

        //遮罩
        this._markNode = dojo.create("div");
        dojo.create(this._markNode, {
            style: this._defaultStyle
        }, dojo.body());
    },

    //Override
    draw: function (callback) {
        this._showCanvas(true);
        this._callback = callback;
        this._initEvent();
    },

    //Override
    show: function () {
        //ignore
    },

    //Override
    hide: function () {
        //ignore
    },

    //Override
    remove: function () {
        //ignore
    },

    //Override
    getPaths: function () {
        return this._paths;
    },

    _initEvent: function () {
        if (0 != this._eventHandler.length)
            return;

        this._eventHandler.push(this._dragEvent.on(this._dragEvent.MouseDown, dojo.hitch(this, this._mouseDown)));
        this._eventHandler.push(this._dragEvent.on(this._dragEvent.MouseMove, dojo.hitch(this, this._mouseMove)));
        this._eventHandler.push(this._dragEvent.on(this._dragEvent.MouseUp, dojo.hitch(this, this._mouseUp)));
    },

    _unInitEvent: function () {
        dojo._base.array.forEach(this._eventHandler, function (handler) {
            handler.remove();
        });

        this._eventHandler = [];
    },

    _mouseDown: function (e) {
        this._mouseIsDown = true;

        console.info(e);
        this._startPoint = e;
        this._endPoint = e;

        this._show(this._calMarkStyle());

        //开始更新界面
        this._updateMark();
    },

    _mouseMove: function (e) {
        if (false == this._mouseIsDown)
            return;

        console.info("e:" + e);
        if (this._endPoint.x == e.x && this._endPoint.y == e.y)
            return;

        this._endPoint = e;
        this._changed = true;

        console.info("move:" + this._changed);
    },

    _mouseUp: function (e) {
        this._mouseIsDown = false;
        this._showCanvas(false);

        console.info(e);
        this._unInitEvent();
        this._hide();

        //多边形
        var tPosInfo = this._getPos();
        this._paths = [
            {
                x: tPosInfo.x,
                y: tPosInfo.y
            },
            {
                x: tPosInfo.x + tPosInfo.width,
                y: tPosInfo.y
            },
            {
                x: tPosInfo.x + tPosInfo.width,
                y: tPosInfo.y + tPosInfo.height
            },
            {
                x: tPosInfo.x,
                y: tPosInfo.y + tPosInfo.height
            }
        ];

        if (null != this._callback)
            this._callback();
    },

    _updateMark: function () {
        if (false == this._mouseIsDown)
            return;

        setTimeout(dojo.hitch(this, this._updateMark), 30);

        if (false == this._changed)
            return;

        this._changed = false;
        dojo.setStyle(this._markNode, this._calMarkStyle());
    },

    _show: function (style) {
        style = style || this._defaultStyle;
        style.display = "block";
        dojo.setStyle(this._markNode, style);
    },

    _hide: function () {
        dojo.setStyle(this._markNode, "display", "none");
    },

    _showCanvas: function (isShow) {
        if (true == isShow) {
            dojo.setStyle(this._canvas, "display", "block");
        } else {
            dojo.setStyle(this._canvas, "display", "none");
        }
    },

    _calMarkStyle: function () {
        var tPosInfo = this._getPos();
        return {
            position: "absolute",
            left: tPosInfo.x + "px",
            top: tPosInfo.y + "px",
            width: tPosInfo.width + "px",
            height: tPosInfo.height + "px"
        }
    },

    _getPos: function () {
        var startPos = {};
        var width = 0;
        var height = 0;

        if (this._startPoint.x > this._endPoint.x) {
            startPos.x = this._endPoint.x;
        } else {
            startPos.x = this._startPoint.x;
        }

        if (this._startPoint.y > this._endPoint.y) {
            startPos.y = this._endPoint.y;
        } else {
            startPos.y = this._startPoint.y;
        }

        width = Math.abs(this._startPoint.x - this._endPoint.x);
        height = Math.abs(this._startPoint.y - this._endPoint.y);

        return {
            x: startPos.x,
            y: startPos.y,
            width: width,
            height: height
        }
    }
});