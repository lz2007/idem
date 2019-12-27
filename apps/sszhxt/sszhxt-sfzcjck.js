import ajax from '../../services/ajaxService.js';
import { createForm, message } from "ane";
import {mapInitObj} from '../common/common-mapInit';



 require('../common/common-sszhxt.css');
 require('./sszhxt-sfzcjck.css');
 // const commonMap = require('../common/common-map.js');
 let vm, sfzcjCkMap,GisObject;
export const name = 'sszhxt-sfzcjck';
const jqdj = avalon.component(name, {
    template: __inline('./sszhxt-sfzcjck.html'),
    defaults: {
        currentIndex:0,
        pesonalInfo:{
            name:"张三",
            sex:"男",
            nation:"汉",
            register:"广东",
            birthDate:"1975.05.05",
            org:"广州市公安局",
            idCard:"44440123456789012",
            idCardExpireTime:"2010.12.01-2025.12.01",
        },
        runTableData:[{
          criminalCatalog:"持枪抢劫",
          caseNumber:'456345',
          runDate:'2015.7.10'
        }],
        exCriminalData:[{
            criminalCatalog:"持枪抢劫",
            caseNumber:'456345',
            catchDate:'2015.7.10',
            setFredDate:'2015.7.10'
        }],
        threePoliceData:[
            {
                criminalCatalog:"入室盗窃",
                caseNumber:'456345',
                policeOffice:'XX市第一看守所',
                outpoliceOfficeDate:'2015.7.10'
            },
            {
                criminalCatalog:"吸食毒品",
                caseNumber:'456345',
                policeOffice:'XX市第一戒毒所',
                outpoliceOfficeDate:'2015.7.10'
            },
            {
                criminalCatalog:"打架斗殴",
                caseNumber:'456345',
                policeOffice:'XX市第一拘留所',
                outpoliceOfficeDate:'2015.7.10'
            }

        ],
        onInit() {
            mapInitObj.initCallback();
        },
        onReady() {
            mapInitObj.domReadyCallback(sfzcjCkMap.initMap);
            
        },
        onDispose(){
            mapInitObj.disposeCallback();
        },
        handleBack(){
            avalon.vmodels['sszhxt_xxcj_sfzcj']['isDetailExist'] = false;
        },
        handleRunInfoClick($index){
            this.currentIndex = $index;
        },
        handleExCriminalClick($index){
            this.currentIndex = $index;
        },
        handleThreePoliceClick($index){
            this.currentIndex = $index;
        }
       


    }

});

//===============================地图初始化部分========================================
sfzcjCkMap = {
    initMap: function () {
        dojo.require("extras.MapInitObject");
        dojo.require("esri/geometry/Point");
        dojo.require("esri/geometry/Polyline");
        dojo.require("esri/symbols/PictureMarkerSymbol");
        dojo.require("esri/symbols/TextSymbol");
        dojo.require("esri/symbols/Font");
        dojo.require("esri/graphic");
        dojo.require("esri/InfoTemplate");
        dojo.require("esri/layers/GraphicsLayer");
        dojo.require("esri/toolbars/draw");
        dojo.require("esri/geometry/webMercatorUtils");
        dojo.require("esri/symbols/SimpleLineSymbol");
        dojo.require("esri/Color");
        dojo.ready(function () {
            GisObject = new extras.MapInitObject("xxcj-sfzcjck-map");
            GisObject.setMapOptions({
                logo: false,
                level: 2,
                center: [113.2693246420, 23.1520769760],
                zoom: 10
            });
            GisObject.addDefaultLayers();
            GisObject.map.setZoom(10);
            sfzcjCkMap.createMarker(null,{longitude:113.2643446427, latitude:23.1290765766});
        });
    },
    createMarker: function (url, oPoint) {
        var iconUrl = url ? url : "../../static/image/sszhxt/locate.png";
       //    var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(113.2693246420, 23.1520769760));
        var curPoint = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(oPoint.longitude, oPoint.latitude));
        var myIcon = new esri.symbols.PictureMarkerSymbol({ "url": iconUrl, "height": 19, "width": 13, "type": "esriPMS", xoffset: 0, yoffset: 8 });
        var pictureSymbol = new esri.symbols.PictureMarkerSymbol(myIcon);
        var marker = new esri.Graphic(curPoint, pictureSymbol);
        // marker.id = "testId";
        var graphicLayer = new esri.layers.GraphicsLayer();
        graphicLayer.add(marker);
        GisObject.map.addLayer(graphicLayer);
    },
   


};


//显示提示框
function showMessage(type, content) {
    message[type]({
        content: content
    });
};



/* api */
const _base = '/gmvcs/uap/';
/* 接口 */

/* 获取部门组织 */
function getDepartment() {
    return ajax({
        url: _base + 'app/all',
        type: 'get'
    });
}

