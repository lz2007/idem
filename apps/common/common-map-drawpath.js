export default function DrawPath(json, mapObj, vm,getTrackTotalAjax,getPageDeviceTrackAjax) {
    this.json = json;
    this.totalPage = 0;
    this.maxPage = 0;
    this.curGpsPage = 0;
    this.gpsPageSize = 200;
    this.beginPoint = {};
    this.isGettingTrack = true;
    this.curTrackId = null;
    this.TrackGraphicLayer = null;
    this.beginPoint = {};
    this.timer = null;
    this.timers = [];//用来存储画线定时器句柄
    this.polyineCount = 0;
    this.polyLineEndCount = 0;
    this.arrPoints = [];//用于存储蓝色标记数组
    this.markerCount = 0;//蓝色标记数组下标
    this.markerGraphics = [];//上一个蓝色标记数组(包括设备和时间信息)
    this.markerId = "";
    this.markerLayer = null;
    this.map = mapObj.map;
    this.vm = vm;
    this.getTrackTotalAjax = getTrackTotalAjax;
    this.getPageDeviceTrackAjax = getPageDeviceTrackAjax;
    this.init();

}
DrawPath.prototype = {
    constructor: DrawPath,
    init: function () {
        DrawPath.curTrackId = this.curTrackId = 'trackLine' + Math.random();
        DrawPath.TrackGraphicLayer = this.TrackGraphicLayer = new esri.layers.GraphicsLayer({ id: DrawPath.curTrackId });
    },
    draw: function () {
        this.getTrackTotal();
    },
    getTrackTotal: function () {
        this.getTrackTotalAjax(this.json).then((ret) => {
            this.total = ret.data.gpsSize;
            this.maxPage = Math.ceil(this.total / this.gpsPageSize);
            //   this.mapObj.polyLineEndCount = this.maxPage-1;
            if (this.total == 0) {
                showMessage('warn', '暂无gps轨迹信息');
                return false;
            }

            this.getGpsPageTrack(this.json, 0, this.gpsPageSize);

        });
    },
    getGpsPageTrack: function (json, page, pageSize) {
        console.log('m:' + this.maxPage, 'page' + this.curGpsPage, this.timers);
        if (this.curGpsPage >= this.maxPage) {
            //   vm.btnDisabled = false;
            return false;
        } else if (!this.isGettingTrack) {
            return false;
        }
        this.getPageDeviceTrackAjax(json, page, pageSize).then((ret) => {
            if (this.curGpsPage == 0) {
                this.beginPoint = ret.data.currentElements[0];
                console.log('lon:' + this.beginPoint.longitude, 'this.lat:' + this.beginPoint.latitude);
                this.map.centerAndZoom(new esri.geometry.Point(this.beginPoint.longitude, this.beginPoint.latitude), 20);
            }
            this.polyLine(ret.data.currentElements, this.maxPage - 1);
            //  this.mapObj.addLine(ret.data.currentElements, 200,vm.curGpsPage);
            this.arrPoints = this.arrPoints.concat(ret.data.currentElements);
            ++this.curGpsPage;
            this.getGpsPageTrack(json, this.curGpsPage, this.gpsPageSize);

        });
    },
    polyLine: function (curArr, curPage) {
        let paths = [];
        let inPaths = [];
        for (var i in curArr) {
            inPaths.push([curArr[i]['longitude'], curArr[i]['latitude']]);
        }
        paths.push(inPaths);
        let polyline = new esri.geometry.Polyline({
            "paths": paths, "spatialReference": this.map.spatialReference
        });
        polyline = esri.geometry.webMercatorUtils.geographicToWebMercator(polyline);
        //画线
        let polylineSymbol = new esri.symbols.SimpleLineSymbol().setColor(new esri.Color([255, 0, 0, 0.5])).setWidth(5);
        let poliLineGraphic = new esri.Graphic(polyline, polylineSymbol);
        //   this.TrackGraphicLayer =  new esri.layers.GraphicsLayer({ id: this.curTrackId });
        // this.map.centerAndZoom(new esri.geometry.Point(beginPoint.longitude, beginPoint.latitude),16);

        //画起始,终止点
        //  let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
        //  let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);

        if (DrawPath.TrackGraphicLayer == this.TrackGraphicLayer) //为了防止请求时上一次的轨迹没清完
            DrawPath.TrackGraphicLayer.add(poliLineGraphic);
        if (this.polyineCount == 0) {
            let beginPoint = curArr[0];
            let beginMarkerGraphic = this.createMarker("../../static/image/sszhxt/begin.png", beginPoint);
            DrawPath.TrackGraphicLayer.add(beginMarkerGraphic);
            this.vm.btnDisabled = true;
        }
        console.log('trackId:' + DrawPath.curTrackId);
        if (this.polyineCount == curPage) {
            let endPoint = curArr[curArr.length - 1];
            let endMarkerGraphic = this.createMarker("../../static/image/sszhxt/end.png", endPoint);
            DrawPath.TrackGraphicLayer.add(endMarkerGraphic);
            this.vm.btnDisabled = false;//轨迹画完播放按钮才能呈现激活状态
        }
        this.map.addLayer(DrawPath.TrackGraphicLayer);
        ++this.polyineCount;
    },
    setMapExtend: function (geometry) {
        this.map.setExtent(geometry.getExtent().expand(2));
    },

    createMarker: function (url, oPoint) {
        var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
        // var cruPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(113.2693246420, 23.1520769760));
        var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(oPoint.longitude, oPoint.latitude));
        var myIcon = new esri.symbols.PictureMarkerSymbol({ "url": iconUrl, "height": 19, "width": 13, "type": "esriPMS", xoffset: 0, yoffset: 8 });
        var pictureSymbol = new esri.symbols.PictureMarkerSymbol(myIcon);
        var marker = new esri.Graphic(curPoint, pictureSymbol);
        return marker;
    },
    addMarker: function (timeInterval, step) {
        this.timer = setInterval(() => {
            this.clearGraphicsByLayer(this.markerId);//清除上一次的蓝色标记
            if (this.markerCount == (this.arrPoints.length)) {
                this.markerCount = 0;
                clearInterval(this.timer);
                this.vm.showPlayBtn = true;
                return false;
            }
            let curPoint = this.arrPoints[this.markerCount];
            let diviceInfo = (curPoint['deviceName'] || '-') + '(' + (curPoint['deviceId'] || '-') + ')';
            let deviceTiime =DrawPath.formatDate(curPoint['time']);
            this.markerId = 'markerId' + Math.random();
            let point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(curPoint.longitude, curPoint.latitude));
            //蓝色标记物
            let markerGraphic = this.createMarker(null, curPoint);
            let font = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑").setWeight(esri.symbol.Font.WEIGHT_BOLD);
            let font2 = new esri.symbols.Font().setSize("16px").setFamily("微软雅黑");
            let textSymbol = new esri.symbols.TextSymbol(diviceInfo).setFont(font).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 55).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            let textSymbol2 = new esri.symbols.TextSymbol(deviceTiime).setFont(font2).setColor(new esri.Color([4, 128, 209, 0.9])).setOffset(-70, 35).setAlign(esri.symbol.TextSymbol.ALIGN_START);
            //设备名称
            let textGraphic = new esri.Graphic(point, textSymbol);
            //时间
            let textGraphic2 = new esri.Graphic(point, textSymbol2);
            this.markerLayer = new esri.layers.GraphicsLayer({ id: this.markerId });
            this.markerGraphics.concat([markerGraphic,textGraphic,textGraphic2]);
            this.markerLayer.add(markerGraphic);
            this.markerLayer.add(textGraphic);
            this.markerLayer.add(textGraphic2);
            this.map.addLayer(this.markerLayer);
            let step = step || 1;
            this.markerCount = this.markerCount + step;
        }, timeInterval);
    },
    removeLayer: function (layerId) {
        var layer = this.map.getLayer(layerId);
        if (layer) {
            this.map.removeLayer(layer);
        }
    },
    clearGraphicsByLayer: function (markerId) {
        var markerLayer = this.map.getLayer(markerId);
        if(markerLayer)
            markerLayer.clear();
    },
    resetLayerPos:function(centePpoint,zoom){
        this.map.centerAndZoom(new esri.geometry.Point(centePpoint.longitude, centePpoint.latitude), 10);
    },
    addLine: function (arr, time, curPage) {
        let length = arr.length, count = 0, addLineTimer = null;
        let _this = this;
        addLineTimer = setInterval(() => {
            if (count == length - 1) {
                //  console.log(111);
                clearInterval(addLineTimer);
                // gjcxMap.setMapExtend(new esri.geometry.Polyline({
                //     "paths": gjcxMap.paths
                // }));
                return false;
            }
            //   console.log(count,arr[count]['longitude'],arr[count]['latitude']);

            let point1 = arr[count];
            let point2 = arr[++count];
            let arrTwoPoint = [point1, point2];
            // if(count == arr.length-1)
            // _this.polyLine([arr[arr.length-2],arr[arr.length-1]]);
            // else
            //  console.log('count'+count);
            _this.polyLine(arrTwoPoint, curPage);
        }, time);
        gjcxMap.timers.push(addLineTimer);

    },
    clearTimer: function () {
        if (this.timer)
            clearInterval(this.timer);
        for (var i in this['timers']) {
            clearInterval(this['timers'][i]);
            this['timers'][i] = null;
        }
        this.timer = null;
        this['timers'] = [];
    }
};

DrawPath.formatDate = function(now) {
    if(!now)
    return '-';
    let date = new Date(now);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var dat = date.getDate();
    var hour = date.getHours();
    var mm = date.getMinutes();
    var seconds = date.getSeconds();
    return year + '-' + month + '-' + dat + "  " + hour + ":" + mm + ":" + seconds;
};