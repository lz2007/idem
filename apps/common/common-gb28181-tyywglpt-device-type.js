/*
 * @Author: mikey.liangzhu 
 * @Date: 2018-10-22 16:40:38 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-04-17 16:16:27
 */

// DSJ("DSJ", "执法仪"),
// DSJ_4G("DSJ4G","4G执法记录仪"),
// DSJ_2G("DSJ2G","2G执法记录仪"),
// DSJ_4G_GB("DSJ4GGB","4G执法记录仪(GB)"),
// WORKSTATION("WORKSTATION", "采集站"),
// KSBK("KSBK", "快速布控设备"),
// CZSL("CZSL", "车载摄录设备"),
// WRJ("WRJ", "无人机"),
// GLPT("GLPT", "移动视音频管理平台"),

/**
 * 28181协议统一编码规则中提及的部分
 * */
// MAIN_DEVICE("MAIN_DEVICE", "前端主设备"),
// PERIPHERAL_DEVICE("PERIPHERAL_DEVICE", "前端外围设备"),
// PLATFORM_DEVICE("PLATFORM_DEVICE", "平台设备"),
// PLATFORM_USER("PLATFORM_USER", "中心用户"),
// TERMINAL_USER("TERMINAL_USER", " 用户"),
// SIGNAL_GATEWAY("SIGNAL_GATEWAY", "平台外接服务器"),
// OTHER("OTHER", "拓展类型"),

/**
 * 28181协议其他类型
 * */

// INVALID("INVALID", "非法类型");

/**
 *获取设备类型值
 *
 * @export
 * @param {*} name 设备类型名
 * @returns type
 */
export function getTypeVal(name) {
    switch (name) {
        case '采集站':
            return 'WORKSTATION';
        case '移动视音频管理平台':
            return 'GLPT';
        case '2G执法记录仪':
            return 'DSJ2G';
        case '4G执法记录仪':
            return 'DSJ4G';
        case '4G执法记录仪(GB)':
            return 'DSJ4GGB';
        case '4G执法记录仪(V1)':
            return 'DSJV1';
        case '快速布控设备':
            return 'KSBK';
        case '车载摄录设备':
            return 'CZSL';
        case '无人机':
            return 'WRJ';
        case '无网络':
            return 'DSJNONET';
        case '前端外围设备':
            return 'PERIPHERAL_DEVICE';
        case '前端主设备':
            return 'MAIN_DEVICE';
        default:
            return ''
    }
}

/**
 *获取设备名
 *
 * @export
 * @param {*} type 设备类型
 * @returns name
 */
export function getTypeName(type) {
    switch (type) {
        case 'WORKSTATION':
            return '采集站';
        case 'GLPT':
            return '移动视音频管理平台';
        case 'DSJ2G':
            return '2G执法记录仪';
        case 'DSJ4G':
            return '4G执法记录仪';
        case 'DSJ4GGB':
            return '4G执法记录仪(GB)';
        case 'DSJV1':
            return '4G执法记录仪(V1)';
        case 'KSBK':
            return '快速布控设备';
        case 'CZSL':
            return '车载摄录设备';
        case 'WRJ':
            return '无人机';
        case 'DSJNONET':
            return '无网络';
        case 'PERIPHERAL_DEVICE':
            return '前端外围设备';
        case 'MAIN_DEVICE':
            return '前端主设备';
        default:
            return ''
    }
}

export const orgIcon = "/static/image/sszhxt/org.png"; //部门icon
const deviceOfflineIcon = "/static/image/sszhxt/device_offline.png"; // 设备离线icon
const deviceOnlineIcon = "/static/image/sszhxt/device_online.png"; // 设备在线icon
const DroneOutlineIcon = "/static/image/sszhxt/Droneoutline.png"; // 设备离线icon
const DroneOnlineIcon = "/static/image/sszhxt/Droneonline.png"; // 设备在线icon
const fastDevOutlineIcon = "/static/image/sszhxt/fastDevoutline.png"; // 快速布控离线线icon
const fastDevOnlineIcon = "/static/image/sszhxt/fastDevonline.png"; // 快速布控在线线icon
const carOutlineIcon = "/static/image/sszhxt/caroutline.png"; // 车载摄录设备在线icon
const carOnlineIcon = "/static/image/sszhxt/caronline.png"; // 车载摄录设备在线icon

/**
 *判断是否是设备
 *
 * @param {*} type 设备类型
 * @param {*} online 是否在线
 * @returns 返回设备对应图标路径
 */
export function isDevice(type, online) {
    let typeObj = {
        DSJNONET: online ? deviceOnlineIcon : deviceOfflineIcon,
        DSJ4G: online ? deviceOnlineIcon : deviceOfflineIcon,
        DSJV1: online ? deviceOnlineIcon : deviceOfflineIcon,
        DSJ2G: online ? deviceOnlineIcon : deviceOfflineIcon,
        DSJ4GGB: online ? deviceOnlineIcon : deviceOfflineIcon,
        PERIPHERAL_DEVICE: online ? deviceOnlineIcon : deviceOfflineIcon,
        MAIN_DEVICE: online ? deviceOnlineIcon : deviceOfflineIcon,
        WRJ: online ? DroneOnlineIcon : DroneOutlineIcon,
        KSBK: online ? fastDevOnlineIcon : fastDevOutlineIcon,
        CZSL: online ? carOnlineIcon : carOutlineIcon
    };

    if (type in typeObj) {
        return typeObj[type];
    } else {
        return orgIcon;
    }
}

/**
 *判断是否是DSJ设备
 *
 * @param {*} type 设备类型
 * @returns boolean
 */
export function isDSJDevice(type) {
    switch (type) {
        case 'DSJ':
        case 'DSJ2G':
        case 'DSJ2G':
        case 'DSJ4G':
        case 'DSJV1':
        case 'DSJ4GGB':
        case 'DSJNONET':
        case 'PERIPHERAL_DEVICE':
            return true;
        default:
            return false;
    }
}

/**
 *判断是否是快速布控 无人机 车载 设备
 *
 * @param {*} type 设备类型
 * @returns boolean
 */
export function isNotDSJDevice(type) {
    switch (type) {
        case 'WRJ':
        case 'KSBK':
        case 'CZSL':
            return true;
        default:
            return false;
    }
}

/**
 *获取设备
 *
 * @returns Array
 */
export function getDeviceAll() {
    return [
        'DSJ',
        'DSJ2G',
        'DSJ2G',
        'DSJ4G',
        'DSJV1',
        'DSJ4GGB',
        'DSJNONET',
        'PERIPHERAL_DEVICE',
        'WRJ',
        'KSBK',
        'CZSL'
    ];
}