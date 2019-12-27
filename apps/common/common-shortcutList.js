/*
 * @Author: linzhanhong 
 * @Date: 2017-12-01 16:55:09
 */

/*
 * 当添加的快捷菜单为一级菜单时，默认路由到其首个二级菜单
 */
// 系统平台快捷菜单配置
import {
    platformVersion
} from '/services/configService';
let diffList = [];
// 0 => 公安版   1 => 交警版
if (1 === platformVersion) {
    diffList = [{
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-sypgl-zfjlysyp',
            icon: 'icon-yspk',
            menuCode: 'AUDIO_MENU_SYPGL',
            title: '视音频管理'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-zfda-jycx_jiaojing',
            icon: 'icon-zfda',
            menuCode: 'AUDIO_MENU_ZFDA',
            title: '执法档案'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-kphczl_jiaojing',
            icon: 'icon-jdkp',
            menuCode: 'AUDIO_MENU_JDKP',
            title: '监督考评'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-khqktj_jiaojing',
            icon: 'icon-tjfx',
            menuCode: 'AUDIO_MENU_TJFX',
            title: '统计分析'
        }
    ];
} else {
    diffList = [{
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-sypgl-zfjlysyp',
            icon: 'icon-yspk',
            menuCode: 'AUDIO_MENU_SYPGL',
            title: '视音频管理'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-zfda-jqgl_gongan',
            icon: 'icon-zfda',
            menuCode: 'AUDIO_MENU_ZFDA',
            title: '执法档案'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-kphczl_gongan',
            icon: 'icon-jdkp',
            menuCode: 'AUDIO_MENU_JDKP',
            title: '监督考评'
        },
        {
            url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-khqktj_gongan',
            icon: 'icon-tjfx',
            menuCode: 'AUDIO_MENU_TJFX',
            title: '统计分析'
        }
    ];
}


const shortcutList = [
    // 系统平台
    {
        url: '/tyywglpt.html#!/tyywglpt-sbzygl-zfygl', // 路由地址
        icon: 'icon-tyywgl', // 图标背景色
        menuCode: '/gmvcs/uom', // 模块标识符
        title: '统一运维管理' // 标题
    },
    {
        url: '/zfsypsjglpt.html',
        icon: 'icon-yspsjgl',
        menuCode: '/gmvcs/audio',
        title: '视音频数据管理'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-yhgl',
        icon: 'icon-xtpzgl',
        menuCode: '/gmvcs/uap',
        title: '系统配置管理'
    },
    {
        url: '/sszhxt.html#!/sszhxt-sszh',
        icon: 'icon-sszhxt',
        menuCode: '/gmvcs/instruct',
        title: '实时指挥系统'
    },
    {
        url: '/zhzs.html',
        icon: 'icon-slqktj',
        menuCode: '/gmvcs/audiozhzs',
        title: '综合展示'
    },
    // {
    //     url: '',
    //     icon: 'icon-sqfwgl', 
    //     menuCode: '/gmvcs/license',
    //     title: '授权服务管理'
    // },
    // 系统配置管理平台
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-yhgl', // 路由地址
        icon: 'icon-yhgl', // 图标背景色
        menuCode: 'CAS_MENU_YHGL', // 模块标识符
        title: '用户管理'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-bmgl',
        icon: 'icon-bmgl',
        menuCode: 'CAS_MENU_BMGL',
        title: '部门管理'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-gnqx',
        icon: 'icon-gnqx',
        menuCode: 'CAS_MENU_GNQX',
        title: '角色管理'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-czrz',
        icon: 'icon-czrz',
        menuCode: 'CAS_MENU_CZRZ',
        title: '操作日志'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-sjzd',
        icon: 'icon-sjzd',
        menuCode: 'CAS_MENU_SJZD',
        title: '数据字典'
    },
    // 统一运维管理平台
    {
        url: '/tyywglpt.html#!/tyywglpt-sbzygl-zfygl', //一级菜单路由到其二级菜单页面
        icon: 'icon-sbzygl',
        menuCode: 'UOM_MENU_SBZYGL',
        title: '设备资源管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sbzygl-zfygl',
        icon: 'icon-zfygl',
        menuCode: 'UOM_MENU_SBZYGL_ZFJLYGL',
        title: '执法记录仪管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sbzygl-cjgzzgl',
        icon: 'icon-cjgzzgl',
        menuCode: 'UOM_MENU_SBZYGL_CJGZZGL',
        title: '采集工作站管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-rwgl-sjscrw',
        icon: 'icon-rwgl',
        menuCode: 'UOM_MENU_XTRWGL',
        title: '系统任务管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-rwgl-sjscrw',
        icon: 'icon-sjscrw',
        menuCode: 'UOM_MENU_XTRWGL_WJSCRW',
        title: '文件上传任务'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-ptjlgl-index',
        icon: 'icon-ajgl',
        menuCode: 'UOM_MENU_PTJLGL',
        title: '平台级联管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-ccfwgl-cjzscfwgl',
        icon: 'icon-ccfwgl',
        menuCode: 'UOM_MENU_CCFWGL',
        title: '存储服务管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-ccfwgl-cjzscfwgl',
        icon: 'icon-cjzscfwgl',
        menuCode: 'UOM_MENU_CCFWGL_WJSCFW',
        title: '采集站上传服务管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-ccfwgl-4gzfylxfwgl',
        icon: 'icon-cjzscfwgl',
        menuCode: 'UOM_MENU_CCFWGL_ZFYLXFW',
        title: '执法仪录像服务管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sjgl-sbsjrz',
        icon: 'icon-sjgl',
        menuCode: 'UOM_MENU_YCSJGL',
        title: '远程升级管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sjgl-sbsjrz',
        icon: 'icon-sbsjrz',
        menuCode: 'UOM_MENU_YCSJGL_SBSJZT',
        title: '设备升级日志'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sjgl-sjbgl',
        icon: 'icon-sjbgl',
        menuCode: 'UOM_MENU_YCSJGL_SJBGL',
        title: '升级包管理'
    },
    {
        url: '/tyywglpt.html#!/tyywglpt-sqgl-index',
        icon: 'icon-sqfwgl',
        menuCode: 'UOM_MENU_SQGL',
        title: '授权服务管理'
    },
    // 执法视音频数据管理平台
    // {
    //     url: '/zfsypsjglpt.html#!/zfsypsjglpt-yspk-zfyps',
    //     icon: 'icon-yspk',
    //     menuCode: 'AUDIO_MENU_SYPGL',
    //     title: '视音频管理'
    // },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-xtsy-index',
        icon: 'icon-glqktj',
        menuCode: 'AUDIO_MENU_XTSY',
        title: '系统首页'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-yspk-zfyps',
        icon: 'icon-zfyps',
        menuCode: 'AUDIO_MENU_SYPGL_ZFYSYP',
        title: '执法仪视音频'
    },
    // {
    //     url: '/zfsypsjglpt.html#!/zfsypsjglpt-zfda-jqgl_gongan',
    //     icon: 'icon-zfda',
    //     menuCode: 'AUDIO_MENU_ZFDA',
    //     title: '执法档案'
    // },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-zfda-jqgl_gongan',
        icon: 'icon-jqgl',
        menuCode: 'AUDIO_MENU_ZFDA_JQGL',
        title: '警情关联'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-zfda-ajgl_gongan',
        icon: 'icon-ajgl',
        menuCode: 'AUDIO_MENU_ZFDA_AJGL',
        title: '案件关联'
    },
    // {
    //     url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-slqktj',
    //     icon: 'icon-tjfx',
    //     menuCode: 'AUDIO_MENU_TJFX',
    //     title: '统计分析'
    // },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-slqktj',
        icon: 'icon-slqktj',
        menuCode: 'AUDIO_MENU_TJFX_SLQKTJ',
        title: '摄录情况统计'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-glqktj_gongan',
        icon: 'icon-glqktj',
        menuCode: 'AUDIO_MENU_TJFX_GLQKTJ',
        title: '关联情况统计'
    },
    { 
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-zctj',
        icon: 'icon-zctj',
        menuCode: 'AUDIO_MENU_TJFX_ZCTJ',
        title: '资产统计'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-tjfx-4gzfyzxltj',
        icon: 'icon-zctj', // 未對應圖標
        menuCode: 'AUDIO_MENU_TJFX_4GZFYZXLTJ',
        title: '4G执法仪在线率统计'
    },
    // {
    //     url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-jqkp',
    //     icon: 'icon-jdkp',
    //     menuCode: 'AUDIO_MENU_JDKP',
    //     title: '监督考评'
    // },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-jqkp',
        icon: 'icon-jdkp', // 未對應圖標
        menuCode: 'AUDIO_MENU_JDKP_JQKP',
        title: '警情考评'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-ajkp',
        icon: 'icon-jdkp', // 未對應圖標
        menuCode: 'AUDIO_MENU_JDKP_AJKP',
        title: '案件考评'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-jdkp-zhkp',
        icon: 'icon-jdkp', // 未對應圖標
        menuCode: 'AUDIO_MENU_JDKP_ZHKP',
        title: '综合考评'
    },
    {
        url: '/zfsypsjglpt.html#!/zfsypsjglpt-rzgl-index',
        icon: 'icon-rzgl',
        menuCode: 'AUDIO_MENU_RZGL',
        title: '日志管理'
    },
    // TODO 实时指挥menuCode数据库还没配置
    // 实时指挥系统平台
    {
        url: '/sszhxt.html#!/sszhxt-sszh',
        icon: 'icon-sszh',
        menuCode: 'INSTRUCT_MENU_SSZH',
        title: '实时指挥'
    },
    {
        url: '/sszhxt.html#!/sszhxt-spjk',
        icon: 'icon-spjk',
        menuCode: 'INSTRUCT_MENU_SPJK',
        title: '视频监控'
    },
    {
        url: '/sszhxt.html#!/sszhxt-lxhf',
        icon: 'icon-lxhf',
        menuCode: 'INSTRUCT_MENU_LXHF',
        title: '录像回放'
    },
    {
        url: '/sszhxt.html#!/sszhxt-gjcx',
        icon: 'icon-gjcx',
        menuCode: 'INSTRUCT_MENU_GJCX',
        title: '轨迹查询'
    },
    {
        url: '/sszhxt.html#!/sszhxt-gjgl-gjcx',
        icon: 'icon-gjgl',
        menuCode: 'INSTRUCT_MENU_GJGL',
        title: '告警管理'
    },
    {
        url: '/sszhxt.html#!/sszhxt-dzwl',
        icon: 'icon-dzwl',
        menuCode: 'INSTRUCT_MENU_DZWL',
        title: '电子围栏'
    },
    {
        url: '/sszhxt.html#!/sszhxt-jqdj',
        icon: 'icon-jqdj',
        menuCode: 'INSTRUCT_MENU_JQDJ',
        title: '集群对讲'
    },
    {
        url: '/sszhxt.html#!sszhxt-xxcj/sszhxt-xxcj-sfzcj',
        icon: 'icon-xxcj',
        menuCode: '',
        title: '信息采集'
    },
    {
        url: '/sszhxt.html#!sszhxt-xxcj/sszhxt-xxcj-sfzcj',
        icon: 'icon-sfzcj',
        menuCode: '',
        title: '身份证采集'
    },
    {
        url: '/sszhxt.html#!/sszhxt-xxcj/sszhxt-xxcj-rlcj',
        icon: 'icon-rlcj',
        menuCode: '',
        title: '人脸采集'
    },
    {
        url: '/sszhxt.html#!/sszhxt-xxcj/sszhxt-xxcj-cpcj',
        icon: 'icon-cpcj',
        menuCode: '',
        title: '车牌采集'
    },
    {
        url: 'http://10.10.18.88:8080/FaceFinder/facefinder/index.action',
        icon: 'icon-rlcj',
        menuCode: 'CAS_MENU_SBK',
        title: '人脸库'
    },
    {
        url: '/tyyhrzpt.html#!/tyyhrzpt-xtpzgl-sbk-cpk',
        icon: 'icon-cpcj',
        menuCode: 'CAS_MENU_SBK',
        title: '车牌库'
    },
    {
        url: '/sszhxt.html#!/sszhxt-znsb-rlbk',
        icon: 'icon-rlcj',
        menuCode: 'INSTRUCT_MENU_ZNSB',
        title: '智能识别'
    }
];

avalon.Array.merge(shortcutList, diffList);

export {
    shortcutList
};