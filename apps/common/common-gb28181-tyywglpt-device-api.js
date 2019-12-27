/*
 * @Author: mikey.liangzhu 
 * @Date: 2018-10-19 10:07:11 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-04-17 13:54:30
 * 设备管理api
 */

import ajax from '../../services/ajaxService';
import {
    getTypeVal
} from './common-gb28181-tyywglpt-device-type';

import {
    errOK,
    ajaxErrInfo
} from './common-gb28181-tyywglpt-api';

/**
 * 批量注册设备
 *
 * @param {*} [deviceInfoList=[]]
 */
export function registerDevice(deviceInfoList = []) {
    const url = '/gmvcs/uom/device/gb28181/v1/device/registerDevice';

    return ajax({
        url,
        method: 'post',
        data: deviceInfoList
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }
        return ret;
    });
}

/**
 * 修改注册设备
 *
 * @param {*} [deviceInfo={}]
 */
export function modifyDevice(deviceInfo = {}) {
    const url = '/gmvcs/uom/device/gb28181/v1/device/modifyDevice';

    return ajax({
        url,
        method: 'post',
        data: deviceInfo
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }
        return ret;
    });
}

/**
 * 批量删除设备
 *
 * @param {*} [deviceIdList=[]]
 */
export function deleteDevice(deviceIdList = []) {
    const url = '/gmvcs/uom/device/gb28181/v1/device/deleteDevice';

    return ajax({
        url,
        method: 'post',
        data: deviceIdList
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }
        return ret;
    });
}

/**
 *  搜索设备
 *
 * @export
 * @param {*} [searchParam={}]
 * @param {boolean} [searchDeletedDevice=false] 是否搜索已删除的设备
 * @returns
 */
export function searchDevice(searchParam = {}, searchDeletedDevice = false) {
    const url = `/gmvcs/uom/device/gb28181/v1/device/searchDevice?searchDeletedDevice=${searchDeletedDevice}`;

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

let nullOptions = {
    label: '不限',
    value: null
}
/**
 *转换下拉
 *
 * @param {*} ret
 * @returns
 */
function toOptions(ret) {
    let options = [];
    let optionsTpye = [];
    let hasNullOptions = [];
    hasNullOptions.push(nullOptions);

    if (ret.data) {

        ret.data = ret.data.filter(item => item);
        ret.data.forEach(item => {
            let getTypeValue = getTypeVal(item);
            let optionObject = {
                label: item,
                value: getTypeValue ? getTypeValue : item
            }
            options.push(optionObject);
            optionsTpye.push(getTypeVal(item));
            hasNullOptions.push(optionObject);
        });
        ret.options = options;
        ret.optionsTpye = optionsTpye;
        ret.hasNullOptions = hasNullOptions;
    }

    return ret;
}

/**
 * 获取执法记录仪类型
 *
 * @param {string} [manufacturer=''] 厂商名称
 * @param {boolean} [allType=false] 是否查询所有设备类型，如果为true，将忽略manufacturer参数，如果为false，则根据manufacturer参数查询出厂商支持的设备类型
 * @returns
 */
export function getDeviceDsjType(manufacturer = '', allType = false) {
    const url = `/gmvcs/uom/device/gb28181/v1/device/deviceDsjType?manufacturer=${manufacturer}&allType=${allType}`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }

        return toOptions(ret);
    });

}


/**
 * 获取设备类型
 *
 * @param {string} [manufacturer=''] 厂商名称
 * @param {boolean} [allType=false] 是否查询所有设备类型，如果为true，将忽略manufacturer参数，如果为false，则根据manufacturer参数查询出厂商支持的设备类型
 * @returns
 */
export function getDeviceType(manufacturer = '', allType = true) {
    const url = `/gmvcs/uom/device/gb28181/v1/device/deviceType?manufacturer=${manufacturer}&allType=${allType}`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }

        return toOptions(ret);
    });

}

/**
 * 获取厂商列表
 *
 * @returns
 */
export function getManufacturer() {
    const url = `/gmvcs/uom/device/gb28181/v1/device/manufacturer?manufacturer`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }
        if (ret.data) {
            ret.data = ret.data.filter(item => item);
        }

        return toOptions(ret);
    });

}

/**
 * 获取型号列表
 *
 * @export
 * @param {string} [manufacturer=''] 厂商名称
 * @param {string} [deviceType=''] 型号名称
 */
export function getModel(manufacturer = '', deviceType = '') {
    const url = `/gmvcs/uom/device/gb28181/v1/device/model?manufacturer=${manufacturer}&allType=${deviceType}`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }

        if (ret.data) {
            ret.data = ret.data.filter(item => item);
        }

        return toOptions(ret);
    });

}

/**
 *获取设备状态类型列表
 *
 * @export
 * @returns
 */
export function getStatusType() {
    const url = '/gmvcs/uom/device/gb28181/v1/device/statusType'

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        if (ret.code != errOK) {
            ajaxErrInfo(ret.msg);
        }

        let options = [];
        let hasNullOptions = [];

        if (ret.data) {

            ret.data = ret.data.filter(item => item);

            ret.data.forEach(item => {
                let optionObject = {
                    label: item.descript,
                    value: String(item.id)
                }
                hasNullOptions.push(optionObject);
                if (item.id == 0) {
                    return;
                }
                options.push(optionObject);
            });
            ret.options = options;
            ret.hasNullOptions = hasNullOptions;
        }

        return ret;
    });

}

/**
 *自动生成国际编号
 *
 * @export
 * @param {string} [orgCode=''] 部门编号
 * @param {string} [type=''] 设备类型
 * @returns
 */
export function getGbCode(orgCode = '', type = '') {
    const url = `/gmvcs/uom/device/gb28181/v1/device/getGbCode?orgCode=${orgCode}&type=${type}`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        return ret;
    });

}

/**
 *当前登录用户获取用户顶级骨架表信息
 *
 */
export function getTopArchetypeInfo() {
    const url = '/gmvcs/uom/device/gb28181/v1/arch/getTopArchetypeInfo'

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        return ret;
    });

}

/**
 *当前登录用户根据父级节点获取子级信息，只获取下一级信息
 *
 * @export
 * @param {string} [id=''] 父级唯一标识
 * @returns
 */
export function getChildArchetypeInfo(id) {
    const url = `/gmvcs/uom/device/gb28181/v1/arch/getChildArchetypeInfo?id=${id}`

    return ajax({
        url,
        method: 'get'
    }).then(ret => {
        return ret;
    });

}

// --
/**
 *获取部门
 *
 */
export function getMgr() {
    let url = '/gmvcs/uap/org/find/fakeroot/mgr';
    return ajax({
        url,
        method: 'get',
    });
}

/**
 *获取下一级部门
 *
 */
export function getByParentMgr(pid) {
    let url = `/gmvcs/uap/org/find/by/parent/mgr?pid=${pid}&checkType=CHECKALL`;
    return ajax({
        url,
        method: 'get',
    });
}

/**
 *通过部门ID查询设备
 *
 * @param {*} [pid = string] 部门ID
 * 
 */
export function getDeviceInfoByOrgIdList(pid) {
    let url = `/gmvcs/uom/device/gb28181/v1/device/queryDeviceInfoByOrgIdList?pageSize=20000&page=0`;
    return ajax({
        url,
        method: 'post',
        data: [pid]
    });
}

/**
 * 在某个骨架组织上面查询，cas部门信息查询下一级部门以及设备信息
 *
 * @export
 * @param {*} pageSize 分页大小
 * @param {*} page 页码
 * @param {*} orgPath 部门路径
 * @param {*} orgId 部门id
 * @param {*} archId 骨架项目rid
 * @returns ajax
 */
export function queryDeviceInfoForArch(pageSize = 20000, page = 0, orgPath, orgId, archId) {
    let url = `/gmvcs/uom/device/gb28181/v1/device/queryDeviceInfoForArch?pageSize=${pageSize}&page=${page}&orgPath=${orgPath}&orgId=${orgId}&archId=${archId}`;
    return ajax({
        url,
        method: 'post'
    });
}


/**
 *通过部门ID，姓名，查询人员
 *
 * @param {*} key 警号、姓名
 * @param {*} orgId 部门id
 * @param {*} orgCode 部门code
 * @returns
 */
export function getFindByPage(key, orgId, orgCode) {
    let url = `/gmvcs/uap/user/findByPage`;
    return ajax({
        url,
        method: 'post',
        data: {
            key: key,
            orgId,
            orgCode,
            page: 0,
            pageSize: 100,
            subOrg: true
        }
    });
}

/**
 *添加用户管理权限
 *
 * @param {string} [orgPath='']
 * @param {*} [userInfoRoleList=[]]
 * @returns
 */
export function submitUserArchetypeRole(orgPath = '', userInfoRoleList = []) {
    let url = '/gmvcs/uom/device/gb28181/v1/arch/submitUserArchetypeRole';
    return ajax({
        url,
        method: 'post',
        data: {
            orgPath,
            userInfoRoleList
        }
    });
}

/**
 *根据组织路径查询其管理人员
 *
 * @param {*} orgPath 	组织路径
 * @returns
 */
export function findRoleByOrgPath(orgPath) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/findRoleByOrgPath?orgPath=${orgPath}`;
    return ajax({
        url,
        method: 'get',
    });
}

/**
 *单个删除某组织的管理人员
 *
 * @param {*} orgPath 组织路径
 * @param {*} userCode 警号
 * @returns
 */
export function deleteRole(orgPath, userCode) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/deleteRole?orgPath=${orgPath}&userCode=${userCode}`;
    return ajax({
        url,
        method: 'get',
    });
}

/**
 *自动生成国标 本域管理
 *
 * @param {*} parentCode 父级节点国标编码
 * @param {*} codeType 国标编码类型
 * @param {*} type 	0表示生成行政区划编码，1表示其他
 * @returns
 */
export function autoCreateCode(parentCode, codeType, type = 0) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/autoCreateCode?parentCode=${parentCode}&codeType=${codeType}&type=${type}`;
    return ajax({
        url,
        method: 'get'
    });
}

/**
 *单个删除视图目录项
 *
 * @param {*} itemIdList id
 * @returns
 */
export function forceDelete(itemIdList = []) {
    let url = `/gmvcs/uom/device/gb28181/v1/arch/deleteItem?forceDelete=true`;
    return ajax({
        url,
        method: 'post',
        data: itemIdList
    });
}