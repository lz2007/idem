/*
 * @Author: mikey.liangzhu 
 * @Date: 2018-10-19 10:07:11 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-04-11 18:23:06
 * 目录项管理api
 */

import ajax from '../../services/ajaxService';

import {
    errOK,
    ajaxErrInfo
} from './common-gb28181-tyywglpt-api';

/**
 * 获取本机平台信息
 *
 */
export function getLocalPlatformInfo() {
    const url = '/gmvcs/uom/device/gb28181/v1/arch/getLocalPlatformInfo';

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
            return {};
        }
        return ret.data;
    });
}

/**
 *搜索目录项
 *
 * @export
 * @param {*} [searchParam={}]
 * SearchParam {
 *    deviceId (string, optional): item唯一标识Id ,
 *    localPlatform (integer): 是否本域，0表示不限，1表示本域，2表示外域 ,
 *    manufacturer (string, optional): 厂商 ,
 *    model (string, optional): 设备型号 ,
 *    page (integer): 页码 ,
 *    pageSize (integer): 每页显示个数 ,
 *    parentId (string, optional): 父节点id ,
 *    path (string, optional): 由device_id按层级组成的路径 ,
 *    platformId (string, optional): 所属域id ,
 *    searchSubPath (boolean, optional): 是否查询子节点 ,
 *    type (Array[string], optional): 项目类型
 * }
 *
 * @returns {*} [Promise={}]
 */
export function searchItem(searchParam = {}) {
    const url = '/gmvcs/uom/device/gb28181/v1/arch/searchItem';

    return ajax({
        url,
        method: 'post',
        data: searchParam
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }
        return ret;
    });
}

/**
 *GET /gb28181/v1/view/getPlatformView搜索平台级视图项
 *
 * @export
 * @returns
 */
export function getPlatformView() {
    const url = '/gmvcs/uom/device/gb28181/v1/view/getPlatformView';

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
            return false;
        }
        return ret;
    });
}


export function getStatus(deviceId) {
    const url = '/gmvcs/device/report/status?deviceId='+deviceId;
    return ajax({
        url,
        method: 'get'
    });
}

