/**
 * 拖拽事件包装
 */
dojo.provide("extras.range.DragEventWrapper");
dojo.require("dojo.Evented");
dojo.require("dojo._base.sdeclare");
// define(["dojo/Evented", "dojo/_base/declare"], function(Evented, declare){
dojo.declare("extras.range.DragEventWrapper", null, {
    MouseDown: "IDragEventWrapper_MouseDown",
    MouseMove: "IDragEventWrapper_MouseMove",
    MouseUp: "IDragEventWrapper_MouseUp",

    constructor: function (eventObj) {
        var isHtmlElement = eventObj instanceof Array || eventObj instanceof HTMLElement;

        if (true == isHtmlElement)
            this._wrapHtmlElementEvent(eventObj);
        else
            this._wrapMapEvent(eventObj);
    },

    _wrapHtmlElementEvent: function (item) {
        item.on("mousedown", dojo.hitch(this, function (e) {
            this.emit(this.MouseDown, this._parsePoint(e));
        }));

        item.on("mousemove", dojo.hitch(this, function (e) {
            this.emit(this.MouseMove, this._parsePoint(e));
        }));

        item.on("mouseup", dojo.hitch(this, function (e) {
            this.emit(this.MouseUp, this._parsePoint(e));
        }));
    },

    _wrapMapEvent: function (item) {
        item.on("mouse-down", dojo.hitch(this, function (e) {
            this.emit(this.MouseDown);
        }));

        item.on("mouse-move", dojo.hitch(this, function (e) {
            this.emit(this.MouseMove);
        }));

        item.on("mouse-up", dojo.hitch(this, function (e) {
            this.emit(this.MouseUp);
        }));
    },

    _parsePoint: function (e) {
        var point = {
            x: e.pageX,
            y: e.pageY
        }
        return point;
    }
});
// });


