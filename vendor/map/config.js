var baseUrl = document.location.href.substring(0, document.location.href.lastIndexOf("/"));
var selfUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
var mapConfig = {
    server: 'http://10.10.9.95:8080',			//本地8080端口瓦片地图地址
    apiPath: '10.10.9.95:8088',		//JSAPI路径，默认为本机服务器IP。不能填写127.0.0.1|localhost 路径格式：IP(URL)+ /resources
    longitude: 113,									//地图默认中心坐标，经度(x),WGS-84(地球坐标系)
    latitude: 23,									//地图默认中心坐标，纬度(y),WGS-84(地球坐标系)
    extendDir: ''										//map扩展目录，默认为空。用于可能map目录在不同层级的情况，如：/webapp
};
var djConfig = {
    parseOnLoad: true,
    measureTotal: 0,
    modulePaths: {
        "extras": "/static/vendor/map/jsLib/extras"
    }
};