/**
 * ======================系统常规配置======================
 * 系统全局标题、版权、单点登录、默认浏览器下载等配置项
 */

/**
 * 定义语言版本
 * @param languageSelect  zhcn 中文  en 英文
 * 
 */
let languageSelect = 'zhcn';
module.exports.languageSelect = languageSelect;

// 导航栏特殊系统名称。加i标签目的是使i的颜色与DEM不同，颜色为#16b8b3，DEM为#ffffff。
module.exports.titleNameStyle = '<i>i</i>DEM';

module.exports.titleName = 'Integrated Digital Evidence Management Platform';

module.exports.copyRight = languageSelect == 'en' ? 'Copyright © 2005-2019, Gosuncn Technology Group Co., Ltd., All Rights Reserved' : 'Copyright © 2005-2018，高新兴国迈科技有限公司，版权所有';

module.exports.telephone = languageSelect == 'en' ? 'Tech Support: TEL 400 6578 900' : '技术支持：400 6578 900';

// 默认城市，依次填写城市名称，经度，纬度
module.exports.defalutCity = {
    city: 'Guangzhou',
    lon: 113.2744940000,
    lat: 23.1484710000
};

// singleSignOn 单点登录标志 false => 手动登录， true => 自动登录
module.exports.singleSignOn = false;

// 单点登录gt参数
module.exports.gt = '74df37c22e352ea2e2fc1a885dcd825e';

// 高新兴国迈安全浏览器默认下载  0 => 火狐浏览器（定制版）   1 => 谷歌浏览器（定制版）  默认为0
module.exports.defaultBrowser = 0;

module.exports.accountType = "permanent|temporary"; //账号类型： permanent 永久用户，temporary 临时用户

// 平台版本
module.exports.platformVersion = 1; // 0 => 公安版    1 => 交警版

module.exports.pageSize = 10;

// DEMS中是否显示轨迹信息
module.exports.isTrackInfo = false; //true为显示轨迹信息（地图）

/**
 * 首页自定义版本
 * @param mainIndex  main_index 主线版本  main_sdjj 山东 版本
 * 
 */

module.exports.mainIndex = 'main_index';

// 是否需要logo
module.exports.hasLogo = true; // true => 有logo    false => 无logo



/**
 * 是否打开案件管理查看视频页面-盘证制作按钮
 * @param pzzzStatus  true 打开；false 关闭
 * 
 */
module.exports.pzzzStatus = false;

/* 
 *  =============================实时指挥系统相关配置项 =============================
 * 
 *  地图配置说明，针对打包后的文件夹，在sszhEsriMap.html改.css,.js文件ip和端口，在window.mapConfig里面改地图瓦片数据server ip和端口
 *
 *  地图配置，0是高新兴地图，1是百度在线地图 2是mapLite（深圳项目）
 *  配置为mapLite时，可在mapLite.html中配置不同的底图
 *  配置代码位置：
 *  map = new MapLite.Map("mapDiv", {
        center: tmpPoint,
        level: 12,
        isInertiaDrag: false,
        basemap: "online/tdt/map"//可以配置不同底图："online/baidu/map", "online/google/map" , "online/qq/map", "online/amap/map", "online/tdt/map"
                                //分别为"百度", "谷歌", "腾讯", "高德", "天地图"
    });
*
* */

module.exports.mapType = 0;

//实时指挥高新兴地图初始化显示级别
module.exports.mapLevel = 9;

module.exports.webSocketIp = (window.location.host == '127.0.0.1:3000' || window.location.host == '10.10.16.169:3000') ? '192.168.55.10:8202' : window.location.host;

// 高新兴离线地图配置
module.exports.mapConfig = {
    server: 'zhcn' == languageSelect ? '//172.16.5.63:8088' : '//172.16.5.63:8088' // 地图瓦片服务IP端口地址（前者中文版配置、后者英文版配置）
};

//实时指挥是否允许语音
module.exports.isAllowSpeak = true;

//实时指挥是否允许视频
module.exports.isAllowVideo = true;

//实时指挥是否允许录像
module.exports.isAllowRecord = false;

//实时指挥是否允许拍照
module.exports.isAllowPhotograph = false;

//实时指挥是否允许锁定
module.exports.isAllowLock = false;


/**
 * ======================OCX播放器相关配置======================
 * 
 */

//视音频播放器配置
module.exports.playerConfig = true; //false h5;true webplayer

//高新兴ocx图像增强功能输出文件夹
module.exports.imageEnhanceOutPut = "C:\\Windows\\Temp\\imageEnhanceOutPut\\";

//高新兴ocx视频播放截图输出文件夹
module.exports.screenShotOutPut = "D:\\screenShotOutPut";

//高新兴ocx现使用的版本号
module.exports.gxxOcxVersion = "4.0.0.82";


/**
 * ======================ajax请求配置======================
 * 
 */

//  请求超时时间 （默认：10分钟）
module.exports.ajaxTimeout = 10 * 60 * 1000;


/**
 * ======================系统固定常量配置======================
 * 开发、打包环境变量，勿修改
 */

module.exports.domain = '__DOMAIN__';

module.exports.serviceUrl = '__SERVICE_URL__';

module.exports.apiUrl = '__API_URL__';