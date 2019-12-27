/*
 *  观察者模式的函数注册，触发
 *  这里包括部门的更新，增加，删除，人员的更新，增加，删除
 * */

import ajax from '../../services/ajaxService';


function EventTarget() {
    this.handlers = {};
}

EventTarget.prototype = {
    addHandler: function (type, handler) {
        if (typeof this.handlers[type] == 'undefined') {
            this.handlers[type] = [handler];
        } else {
            if (handler.toString() != this.handlers[type].toString())
                this.handlers[type].push(handler);
        }
    },

    removeHandler: function (type, handler) {
        var handlers = this.handlers[type];
        if (!handlers) {
            return;
        }

        for (var i = 0, len = handlers.length; i < len; i++) {
            if (handlers[i] === headler) {
                break;
            }
        }

        handlers.splice(i, 1);
    },

    fireHandler: function (event) {
        if (!event.target) {
            event.target = this;
        }

        var handlers = this.handlers[event.type];
        if (!handlers) {
            return;
        }

        for (var i = 0, len = handlers.length; i < len; i++) {
            handlers[i](event);
        }
    }
};

var events = {
    'ORG_FIRSTLOAD': 'org_firstload',
    'ORG_CHANGE': 'org_change',
    'ORG_COUNTCHANGE': 'org_countchange',
    'PERSON_CHANGE': 'person_change',
    'ORG_UPDATED': 'org_updated',
    'PERSON_UPDATED': 'person_updated'
};

var orgModel = (function () {

    var eventTarget = new EventTarget(),
        firstLoad = false,
        needUpdateOrg = {}, //保存需要请求更新的部门人员
        orgDetailInfo = [], //保存的旧部门
        orgTempDatail = [], ///部门树比较辅助数组
        orgPersonInfo = {}, //保存每个部门下面的人员
        orgMutilDevInfor = {}, //保存每个部门下面的多通道设备
        orgsAry = [],
        treeUpdateOwner = ''; //保存当前更新的是部门树属于哪一模块，实时指挥or视频监控

    //清空数据
    function clearSavedData() {
        firstLoad = false,
            //needUpdateOrg = {}, //保存需要请求更新的部门人员
            orgDetailInfo = [], //保存的旧部门
            orgTempDatail = [], ///部门树比较辅助数组
            orgPersonInfo = {}, //保存每个部门下面的人员
            orgMutilDevInfor = {}, //保存每个部门下面的多通道设备
            orgsAry = [];
            //treeUpdateOwner = ''; //保存当前更新的是部门树属于哪一模块，实时指挥or视频监控
    }
    // 获取部门数据 并没有在线人数/总人数，只有组织架构，没有人员
    function getAllorgs(callBack) {
        ajax({
            url: '/gmvcs/uap/org/all/',
            method: 'get'
        }).then(result => {
            if (result.code == 0) {
                callBack(result.data);
            } else {
                callBack([]);
            }
        })
    }
    // 根据OrgId获取警员列表,此处有人员状态返回
    function getMemberByOrgId(orgAry, callBack) {
        let data = {};
        data = orgAry;
        ajax({
            url: '/gmvcs/uom/device/dsj/listByOrgIds?vPage=0&vPageSize=50000',
            method: 'post',
            data: data
        }).then(result => {
            if (result.code == 0) {
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                avalon.each(result.data.currentElements, function (index, item) {
                    avalon.each(item, function (i, value) {
                        value.mytype = 0;
                    })

                })
                callBack(result.data);
            } else {
                callBack([]);
            }
        })
    }
    //根据orgId获取多通道设备
    function getmulti_channelDevByOrgId(orgAry, callBack) {
        let data;
        data = orgAry;
        ajax({
            url: '/gmvcs/uom/device/listByOrgIdList?page=0&pageSize=50000&attachChannelInfo=true',
            method: 'post',
            data: data
        }).then(result => {
            if (result.code == 0) {
                //mytype表示自定义设备类型0 执法仪， 1：快速 2：车 3:无人机
                avalon.each(result.data.currentElements, function (index, item) {
                    avalon.each(item, function (i, value) {
                        // value.online = 1;
                        if (value.type == '快速布控') {
                            value.mytype = 1;
                        } else if (value.type == '无人机') {
                            value.mytype = 3;
                        } else {
                            value.mytype = 2;
                        }
                    })
                });
                callBack(result.data);
            } else {
                callBack([]);
            }
        }).fail(() =>{
            callBack([]);
        })
    }

    // // 根据OrgId获取警员列表,此处有人员状态返回
    // function getMemberByOrgId(orgAry, callBack) {
    //     gmLibrary.ajaxPost('/gmvcshomepage/system/user/deviceState.action', {org_ids:orgAry}, function(ret){
    //
    //         if (ret.headers.ret != 0) {
    //             callBack([]);
    //         }
    //
    //         callBack(ret.body);
    //
    //     }, function(evt) {
    //         if (evt.status === 404 || evt.statusText === 'Not Found') {
    //             alert('登陆超时, 请重新登陆');
    //             window.top.document.location.reload();
    //             return;
    //         }
    //         callBack([]);
    //     });
    // }


    // // 获取所有部门自己部门下的总人数与在线人数
    // function getAllMemberCount(callBack) {
    //     gmLibrary.ajaxGet('/gmvcshomepage/system/user/orgDeviceCountAll.action', null, function(ret){
    //
    //         if (ret.headers.ret != 0) {
    //             callBack([]);
    //         }
    //
    //         callBack(ret.body);
    //
    //     }, function(evt) {
    //         if (evt.status === 404 || evt.statusText === 'Not Found') {
    //             alert('登陆超时, 请重新登陆');
    //             window.top.document.location.reload();
    //             return;
    //         }
    //         callBack([]);
    //     });
    // }

    // 获取部门数据并组装在线人数/总人数,现在无人数统计这些
    // function combinationOrgDetailInfo() {
    //     getAllMemberCount(function(ret) {
    //         orgTempDatail = ret;
    //
    //         if (!orgTempDatail || orgTempDatail.length == 0) {
    //             updateOrgTimerId = setTimeout(updateOrgtimer, 5000);
    //             return;
    //         }
    //
    //         countOrg(orgTempDatail);
    //
    //         if (firstLoad) {
    //             firstLoad = false;
    //
    //             eventTarget.fireHandler({
    //                 type: events.ORG_FIRSTLOAD,
    //                 data: {
    //                     type: 'change',
    //                     data: orgTempDatail
    //                 }
    //             });
    //         }
    //         else {
    //             compareOrgDetailInfo(orgDetailInfo, orgTempDatail);
    //         }
    //
    //         orgDetailInfo = orgTempDatail;
    //         orgTempDatail = [];
    //
    //         updateOrgTimerId = setTimeout(updateOrgtimer, 5000);
    //     });
    // }
    // 获取部门数据并组装在线人数/总人数,现在无人数统计这些
    function combinationOrgDetailInfo() {
        getAllorgs(function (ret) {
            orgTempDatail = ret;

            if (!orgTempDatail || orgTempDatail.length == 0) {
                updateOrgTimerId = setTimeout(updateOrgtimer, 30000);
                return;
            }

            countOrg(orgTempDatail);

            if (firstLoad) {
                firstLoad = false;

                eventTarget.fireHandler({
                    type: events.ORG_FIRSTLOAD,
                    data: {
                        type: 'change',
                        data: orgTempDatail
                    }
                });
            } else {
                compareOrgDetailInfo(orgDetailInfo, orgTempDatail);
            }

            orgDetailInfo = orgTempDatail;
            orgTempDatail = [];

            updateOrgTimerId = setTimeout(updateOrgtimer, 30000);
        });
    }
    // 递归算出部门在线总人数/总人数,现在无统计人数
    function countOrg(orgAry) {
        for (var i = 0, len = orgAry.length; i < len; i++) {
            //orgAry[i].nocheck = true;
            orgAry[i].isParent = true;
            if (orgAry[i].orgCount == 0) {
                orgAry[i].nocheck = true;
            }
            countOrg(orgAry[i].childs);

            // for (var j=0,size=orgAry[i].children.length; j<size; j++) {
            //     orgAry[i].totalCount += orgAry[i].children[j].totalCount;
            //     orgAry[i].orgCount += orgAry[i].children[j].orgCount;
            // }
            orgAry[i].displayName = orgAry[i].orgName;
            //orgAry[i].displayName = orgAry[i].orgName + " " +  orgAry[i].orgCount + "/" + orgAry[i].totalCount;
        }
    }

    function compareOrgDetailInfo(oldAry, newAry) {
        avalon.each(oldAry, function (index, item) {
            for (var i = 0, len = newAry.length; i < len; i++) {
                if (item.orgId == newAry[i].orgId) {
                    if (item.orgName != newAry[i].orgName) {

                        newAry[i].displayName = newAry[i].orgName;

                        // 变更的部门
                        eventTarget.fireHandler({
                            type: events.ORG_UPDATED,
                            data: {
                                type: 'change',
                                data: newAry[i]
                            }
                        });
                    }

                    compareOrgDetailInfo(item.childs, newAry[i].childs);
                    return;
                }
            }

            // 删除的部门
            eventTarget.fireHandler({
                type: events.ORG_UPDATED,
                data: {
                    type: 'delete',
                    data: item
                }
            });
        });

        avalon.each(newAry, function (index, item) {
            // 添加标示符标示部门
            item.nocheck = true;
            item.isParent = true;
            item.displayName = item.orgName;

            for (var i = 0, len = oldAry.length; i < len; i++) {
                if (item.orgId == oldAry[i].orgId) {
                    return;
                }
            }

            // 新增的部门
            eventTarget.fireHandler({
                type: events.ORG_UPDATED,
                data: {
                    type: 'add',
                    data: item
                }
            });
        });
    }

    function isArray(ary) {
        if (typeof Array.isArray !== 'undefined') {
            return Array.isArray(ary);
        } else {
            return typeof ary === 'object' && Object.prototype.toString(ary) === '[object Array]';
        }
    }

    //处理部门树数据
    function settleData(data, parentHead) {
        avalon.each(data, function (index, el) {
            // if (el.childs) {
            el.isParent = true;
            // value.orgId = value.id;
            el.displayName = el.orgName;
            el.icon = "/static/image/sszhxt/org.png"
            if (parentHead) {
                el.parentId = -1; //表示是最顶部的最最上层父节点
            } else {
                el.parentId = 1; //
            }
            if (el.childs && el.childs.length != 0) {
                settleData(el.childs, false);
            }
            //}
        });
    }


    // 对比人员数据
    function comparePerson() {
        var updateAry = [];
        // for (var item in needUpdateOrg) {
        //     updateAry = updateAry.concat(needUpdateOrg[item]);
        // }
        updateAry = updateAry.concat(needUpdateOrg[treeUpdateOwner]);
        if (updateAry.length == 0) {
            updatePerTimerId = setTimeout(updatePersontimer, 2000);
            // updatePerTimerId = setTimeout(updatePersontimer, 10000);
            return;
        }
        // avalon.each(updateAry, function (index, item) {
        //     getMemberByOrgId(item, function(ret) {
        //         for (var i=0,len=ret.length; i<len; i++) {
        //             if (typeof orgPersonInfo[ret[i].orgId] === 'undefined') {
        //                 continue;
        //             }
        //
        //             comparePersonDetailInfo(orgPersonInfo[ret[i].orgId], ret[i].currentElements, ret[i].orgId);
        //
        //             orgPersonInfo[ret[i].orgId] = ret[i].currentElements;
        //         }
        //     });
        // })
        // updatePerTimerId = setTimeout(updatePersontimer, 50000);

        getmulti_channelDevByOrgId(updateAry, function (ret) {
            avalon.each(ret.currentElements, function (index, item) {
                if (typeof orgMutilDevInfor[index] !== 'undefined') {
                    comparePersonDetailInfo(orgMutilDevInfor[index], item, index);
                    orgMutilDevInfor[index] = item;
                } else {
                    comparePersonDetailInfo([], item, index);
                    orgMutilDevInfor[index] = item;
                }

            })

        });
        getMemberByOrgId(updateAry, function (ret) {
            avalon.each(ret.currentElements, function (index, item) {
                if (typeof orgPersonInfo[index] !== 'undefined') {
                    comparePersonDetailInfo(orgPersonInfo[index], item, index);
                    orgPersonInfo[index] = item;
                } else {
                    comparePersonDetailInfo([], item, index);
                    orgPersonInfo[index] = item;
                }

            })
            // updatePerTimerId = setTimeout(updatePersontimer, 2000);
            updatePerTimerId = setTimeout(updatePersontimer, 15000);
        });
    }

    function comparePersonDetailInfo(oldAry, newAry, orgId) {
        avalon.each(oldAry, function (index, item) {
            for (var i = 0, len = newAry.length; i < len; i++) {
                if (item.gbcode == newAry[i].gbcode) {
                    if (item.usercode != newAry[i].usercode || item.username != newAry[i].username || item.online != newAry[i].online || item.isLocking != newAry[i].isLocking || item.name != newAry[i].name) {
                        // 变更的人员
                        eventTarget.fireHandler({
                            type: events.PERSON_UPDATED,
                            data: {
                                type: 'change',
                                orgId: orgId,
                                data: newAry[i]
                            }
                        });
                    }
                    return;
                }
            }

            // 删除的人员
            eventTarget.fireHandler({
                type: events.PERSON_UPDATED,
                data: {
                    type: 'delete',
                    orgId: orgId,
                    // data: newAry[i]
                    data: item //表示该节点已经被删除了
                }
            });
        });

        avalon.each(newAry, function (index, item) {
            for (var i = 0, len = oldAry.length; i < len; i++) {
                if (item.gbcode == oldAry[i].gbcode) {
                    return;
                }
            }

            // 新增人员
            eventTarget.fireHandler({
                type: events.PERSON_UPDATED,
                data: {
                    type: 'add',
                    orgId: orgId,
                    data: item
                }
            });
        });
    }

    var updateOrgTimerId = 0;
    // 定时更新详细的部门树 并通知子界面
    //  setTimeout(function updateOrgtimer() {
    //      combinationOrgDetailInfo();
    //      setTimeout(updateOrgtimer, 20000);
    //  }, 3000);

    var updatePerTimerId = 0;
    // 定时更新详细的人员 并通知子界面
    //  setTimeout(function updatePersontimer() {
    //      comparePerson();
    //      setTimeout(updatePersontimer, 10000);
    //  }, 10000);


    function updateOrgtimer() {
        combinationOrgDetailInfo();
        // comparePerson();
    }

    function updatePersontimer() {
        comparePerson();
    }

    return {
        startUpdateOrgTimer: function () {
            updateOrgTimerId = setTimeout(updateOrgtimer, 30000);
        },

        stopUpdateOrgTimer: function () {
            clearTimeout(updateOrgTimerId);
        },

        startUpdatePerTimer: function () {
            // updatePerTimerId = setTimeout(updatePersontimer, 2000);
            updatePerTimerId = setTimeout(updatePersontimer, 30000);
        },

        stopUpdatePerTimer: function () {
            clearTimeout(updatePerTimerId);
        },

        getAllorgInfo: function (callback, force) {
            if (orgDetailInfo.length == 0 || force == true) {
                getAllorgs(function (ret) {
                    settleData(ret, true);
                    orgDetailInfo = ret;
                    callback && callback(ret);
                });
            } else {
                callback && callback(orgDetailInfo);
            }
        },

        getOrgPerson: function (orgId, callback, failCallback, force) {
            if (typeof orgPersonInfo[orgId] === 'undefined' || force === true) {
                getMemberByOrgId([orgId], function (ret) {
                    if (!ret.currentElements[orgId] || ret.currentElements[orgId].length == 0 || typeof ret.currentElements === 'undefined') {
                        failCallback && failCallback();
                        return;
                    }
                    orgPersonInfo[orgId] = ret.currentElements[orgId];
                    callback && callback(ret.currentElements[orgId]);
                });
            } else {
                callback && callback(orgPersonInfo[orgId]);
            }
        },
        //获取多通道设备
        getOrgmutilDev: function (orgId, callback, failCallback) {
            if (typeof orgMutilDevInfor[orgId] === 'undefined') {
                getmulti_channelDevByOrgId([orgId], function (ret) {
                    if(ret.length == 0){
                        callback && callback([]);
                        return;
                    }
                    if (!ret.currentElements[orgId] || ret.currentElements[orgId].length == 0 || typeof ret.currentElements === 'undefined') {
                        //failCallback && failCallback();
                        callback && callback([]);
                        return;
                    }
                    orgMutilDevInfor[orgId] = ret.currentElements[orgId];
                    callback && callback(ret.currentElements[orgId]);
                });
            } else {
                callback && callback(orgMutilDevInfor[orgId]);
            }
        },

        addHandler: function (type, handler, owner, orgIds) {
            switch (type) {
                case events.PERSON_UPDATED:
                    needUpdateOrg[owner] = orgIds;
                    break;
            }
            if(owner){
                treeUpdateOwner = owner;
            }
            eventTarget.addHandler(type, handler);
        },

        removeHandler: function (type, handler, owner) {
            switch (type) {
                case events.PERSON_UPDATED:
                    delete needUpdateOrg[owner];
            }

            eventTarget.removeHandler(type, handler);
        },
        //用于切换设备和人员的时候显示不同名称的出发函数
        triggerHandler: function () {
            avalon.each(orgPersonInfo, function (index, item) {
                avalon.each(item, function (ind, el) {
                    eventTarget.fireHandler({
                        type: events.PERSON_UPDATED,
                        data: {
                            type: 'change',
                            orgId: el.orgRid,
                            data: el
                        }
                    });
                })
            })
        },
        //用于设置owner
        setOwner: function (owner) {
            treeUpdateOwner = owner;
        },
        //清空数据
        clearSavedData: clearSavedData
    }
}());

// orgModel.startUpdateOrgTimer();
// orgModel.startUpdatePerTimer();
export {
    orgModel
};