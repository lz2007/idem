/*
 * @Author: mikey.liangzhu 
 * @Date: 2018-10-19 10:07:11 
 * @Last Modified by: mikey.xuanyanqing
 * @Last Modified time: 2019-12-03 17:09:35
 * 视图项管理api
 */

import ajax from '../../services/ajaxService';

import {
    errOK,
    ajaxErrInfo
} from './common-gb28181-tyywglpt-api';
let language_txt = require('../../vendor/language').language;
/**
 *通过父设备和平台ID获取视图项
 *
 * @export
 * @param {string} [parentRid=''] 父节点rid
 * @param {string} [platformId=''] 上级平台id
 * @param {boolean} [flag=false] 判断值，true为获取完整子节点，false为获取直属子节点
 * @param {*} [deviceTypeList=[]] 设备类型列表
 * @returns
 */
export function ViewItem(parentRid = '', platformId = '', flag = false, deviceTypeList = []) {

    // const url = `/gmvcs/uom/device/gb28181/v1/view/ViewItem?parentRid=${parentRid}&platformId=${platformId}&flag=${flag}${(deviceTypeList.length?`&deviceTypeList=${deviceTypeList}`:'')}`;
    const url = `/gmvcs/uom/device/gb28181/v1/view/ViewItemNew?parentRid=${parentRid}&superiorPlatformId=${platformId}`;

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        return ret;
    });
}

/**
 *根据设备（警员名称、警号、设备名称、国标编码）或部门（部门名称、部门国标编码）来查询视图节点信息
 *
 * @export
 * @param {string} [key=''] 1表示设备，2表示部门
 * @param {string} [value=''] 输入内容
 * @param {*} [deviceTypeList=[]] 设备类型列表
 * @returns
 */
export function checkView(key='',value='',deviceTypeList=[]) {

    const url = `/gmvcs/uom/device/gb28181/v1/view/checkView?key=${key}&value=${$.trim(value)}${(deviceTypeList.length?`&deviceTypeList=${deviceTypeList}`:'')}`;

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            if(ret.code == 1500) {
                ajaxErrInfo(language_txt.sszhxt.sszhxt_spjk.noAuthority);
            }else {
                ajaxErrInfo(ret.msg);
            }
        }
        return ret;
    });
}