import ajax from '../../services/ajaxService.js';
import { createForm, message } from "ane";


require('./sszhxt-jqdj.css');
// const commonMap = require('../common/common-map.js');
let vm, GisObject, graphicLayer, policeSymbol, policeInfo, infoContent;
export const name = 'sszhxt-jqdj';
const jqdj = avalon.component(name, {
    template: __inline('./sszhxt-jqdj.html'),
    defaults: {
        searchValue: "",
        curGroup: "临时群组",//当前对讲群组
        isSaying: false,//是否显示临时群组标题，退出对讲按钮，及空闲，平台等
        fixedGroupData: [
            { num: 4, all: 6, name: "固定群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
            { num: 4, all: 6, name: "固定群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
            { num: 4, all: 6, name: "固定群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
        ],
        temporaryGroupData: [
            { num: 4, all: 6, name: "临时群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
            { num: 4, all: 6, name: "临时群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
            { num: 4, all: 6, name: "临时群组01", data: [{ text: "警员01", policeNum: "000001" }, { text: "警员01", policeNum: "000001" }] },
        ],
        onInit() {
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    createTemporaryGroupVm.orgData = changeTreeData(ret.data);
                } else {
                    showMessage('error', '获取部门失败！');
                }
            });
            //需要等dojo及一些必要文件加载完毕才能进行操作
            //    let timer = setInterval(function () {
            //     if (window.mapInitAlready) {
            //         clearInterval(timer);
            //         initMap();
            //     }
            // }, 200);
        },
        onReady() {
        },
        createNewTemporaryGroup() {
            //清空上一次的搜索采集站结果
            createTemporaryGroupVm.listId = "GM1100000020171120095021fe0fffffc";

            createTemporaryGroupVm.show = true;
        },

        handleMicrophoneSaying() {
            this.isSaying = true;
        },
        handleOutMicrophoneSaying() {
            this.isSaying = false;
        },
        handleDeleteTemporaryGroup($index) {
            deleteTemporaryGroupVm.curDeleteName = this.temporaryGroupData[$index]['name'];
            deleteTemporaryGroupVm.show = true;
        },

    }

});

//创建临时群组弹窗
let createTemporaryGroupVm = avalon.define({
    $id: 'createTemporaryGroup',
    title: "添加新临时群组",
    show: false,
    orgData: [],
    modalWidth: 600,
    okText: "确定",
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
    }



});
//删除临时群组提示弹框
let deleteTemporaryGroupVm = avalon.define({
    $id: "deleteTemporaryGroup",
    title: "删除临时群组",
    show: false,
    okText: "确定",
    curDeleteName: "",
    handleCancel(e) {
        this.show = false;
    },
    handleOk() {
        this.show = false;
    },


});
//将数据转换为key,title,children属性
function changeTreeData(treeData) {
    var i = 0,
        len = treeData.length,
        picture = '/static/image/tyywglpt/org.png';
    for (; i < len; i++) {
        treeData[i].icon = picture;
        treeData[i].key = treeData[i].orgId;
        treeData[i].title = treeData[i].orgName;
        treeData[i].children = treeData[i].childs;
        if(treeData[i].hasOwnProperty('dutyRange'))
           delete(treeData[i]['dutyRange']);
        if(treeData[i].hasOwnProperty('extend'))
           delete(treeData[i]['extend']);
        if(treeData[i].hasOwnProperty('orderNo'))
           delete(treeData[i]['orderNo']);
        
        if (!(treeData[i].childs && treeData[i].childs.length)) {

        } else {
            changeTreeData(treeData[i].childs);
        };
    };
    return treeData;
}



//显示提示框
function showMessage(type, content) {
    message[type]({
        content: content
    });
};

function initMap() {
    dojo.require("extras.MapInitObject");
    dojo.require("esri/geometry/Point");
    dojo.require("esri/symbols/PictureMarkerSymbol");
    dojo.require("esri/graphic");
    dojo.require("esri/InfoTemplate");
    dojo.require("esri/layers/GraphicsLayer");
    dojo.require("esri/toolbars/draw");
    dojo.require("esri/geometry/webMercatorUtils");
    dojo.require("esri/symbols/SimpleLineSymbol");
    dojo.ready(function () {
        GisObject = new extras.MapInitObject("jqdj-map");
        GisObject.setMapOptions({
            logo: false,
            level: 2,
            center: [113.2693246420, 23.1520769760],
            zoom: 10
        });
        GisObject.addDefaultLayers();
        GisObject.map.setZoom(10);

        // graphicLayer = new esri.layers.GraphicsLayer();
        // GisObject.map.addLayer(graphicLayer);
        // infoContent = '经度：${longitude}<br/>纬度：${latitude}<br/>描述：${markDesc}<br/>';
        // policeInfo = new esri.InfoTemplate('位置信息', infoContent);
        // policeSymbol = new esri.symbols.PictureMarkerSymbol({
        //     "type": "esriPMS", //点位图片展示
        //     "angle": 0, //旋转角度
        //     "height": 19, //高度
        //     "width": 13, //宽度
        //     "xoffset": 0, //x偏移量
        //     "yoffset": 8, //y偏移量
        //     "url": "../../static/image/sszh-lxhf/stamp.png" //图片访问路径
        // });
    });

}

/* api */
/* 获取所属机构 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/all',
        //   url: '/api/tyywglpt-cczscfwgl',

        method: 'get',
        cache: false
    });
}

/* 根据所属机构获取分配的采集工作站列表 */
function getStationByOrgIdAjax(orgId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicInfos/' + orgId,
        type: 'get',
    });
}
/* 根据存储服务ID获取分配的采集工作站列表 */
function getStationAjax(storageId) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/basicinfos/' + storageId,
        type: 'get',
        cache: false
    });
}
/* 模糊搜索采集站 */
function searchStationAjax(searchKey) {
    return ajax({
        url: '/gmvcs/uom/device/workstation/searchkey/' + encodeURIComponent(searchKey),
        type: 'get',
        cache: false
    });
}