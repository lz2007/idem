import avalon from 'avalon2';
import {
    createForm,
    notification
} from "ane";
import ajax from '../../services/ajaxService';
import './sszhxt-gjgl-gjdy.css';
export const name = 'sszhxt-gjgl-gjdy';
import {
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;

let vm = null;
let myvm = avalon.component(name, {
    template: __inline('./sszhxt-gjgl-gjdy.html'),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        gjdy_language: language_txt.sszhxt.sszhxt_gjgl,
        deviceSOS: [], //保存是否勾选
        sosLevelClass: '',
        onLineLevelClass: '',
        offLineLevelClass: '',
        batteryLevelClass: '',
        storageLevelClass: '',
        jsonLevel: {
            'sosLevel': '',
            'faceLevel': '',
            'carLevel': '',
            'onLineLevel': '',
            'offLineLevel': '',
            'batteryLevel': '',
            'storageLevel': ''
        }, //后台返回的级别
        sqlid: '', //后台返回的数据库id
        orgData: [],
        deviceArr: [], //根据部门获取执法仪
        rightDevArr: [], //右边已分配的执法仪
        contianChild: [], //是否包含子部门
        orgId: "", //保存上一次部门点击的部门id
        $orgIdArr: [], //保存勾选包含子部门的时候，后台放回的所有部门id
        showTip: false,
        leftallchecked: false,
        contianChildCheck: false,
        onInit(event) {
            vm = event.vmodel;
            fetchUserInitData().then((ret) => {
                if (ret.code == 0) {
                    vm.sqlid = ret.data.id;
                    if (ret.data['businessRSS'].length != 0) {
                        // if (ret.data['businessRSS'][0].subscribed)
                        //     vm.deviceSOS.push('DEVICE_SOS');
                        // vm.jsonLevel.sosLevel = ret.data['businessRSS'][0].sosLevel;
                        for (let i = 0; i < ret.data['businessRSS'].length; i++) {
                            if (ret.data['businessRSS'][i].subscribed)
                                vm.deviceSOS.push(ret.data['businessRSS'][i].sosSource);
                            if (ret.data['businessRSS'][i].sosSource == 'DEVICE_SOS') {
                                vm.jsonLevel.sosLevel = ret.data['businessRSS'][i].sosLevel;
                            } else if (ret.data['businessRSS'][i].sosSource == 'FACE_MONITORING') {
                                vm.jsonLevel.faceLevel = ret.data['businessRSS'][i].sosLevel;
                            } else if (ret.data['businessRSS'][i].sosSource == 'CAR_MONITORING') {
                                vm.jsonLevel.carLevel = ret.data['businessRSS'][i].sosLevel;
                            }
                        }
                    }
                    if (ret.data['deviceRSS'].length != 0) {
                        for (let i = 0; i < ret.data['deviceRSS'].length; i++) {
                            if (ret.data['deviceRSS'][i].subscribed)
                                vm.deviceSOS.push(ret.data['deviceRSS'][i].sosSource);
                            if (ret.data['deviceRSS'][i].sosSource == 'DEVICE_ELECTRIC_CAPACITANCE') {
                                vm.jsonLevel.batteryLevel = ret.data['deviceRSS'][i].sosLevel;
                            } else {
                                vm.jsonLevel.storageLevel = ret.data['deviceRSS'][i].sosLevel;
                            }
                        }
                    }
                    if (ret.data['statusRSS'].length != 0) {
                        for (let i = 0; i < ret.data['statusRSS'].length; i++) {
                            if (ret.data['statusRSS'][i].subscribed)
                                vm.deviceSOS.push(ret.data['statusRSS'][i].sosSource);

                            if (ret.data['statusRSS'][i].sosSource == 'DEVICE_ONLINE') {
                                vm.jsonLevel.onLineLevel = ret.data['statusRSS'][i].sosLevel;
                            } else {
                                vm.jsonLevel.offLineLevel = ret.data['statusRSS'][i].sosLevel;
                            }
                        }

                    }
                    if (!ret.data['devicesRSS'] || ret.data['devicesRSS'].length <= 0) {
                        this.fetchOrgData();
                    } else {
                        settleDeviceData(ret.data['devicesRSS'], true);
                        this.fetchOrgData();
                    }
                    if (ret.data['orgIdsRSS'] && ret.data['orgIdsRSS'].length > 0) settleDeviceData(ret.data['orgIdsRSS'], false);

                    return;
                }
                showMessage('error', vm.gjdy_language.getSubcribedInfoError);
            });
        },
        onReady() {
            $(document.body).css({
                "min-height": "770px"
            });
        },
        onDispose() {
            $(document.body).css({
                "min-height": "550px"
            });
        },
        $computed: {
            sosLevelClass: function () {
                if (this.jsonLevel.sosLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.sosLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.sosLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.sosLevel == 3) {
                    return 'PROMPT';
                }
            },
            faceLevelClass: function () {
                if (this.jsonLevel.faceLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.faceLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.faceLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.faceLevel == 3) {
                    return 'PROMPT';
                }
            },
            carLevelClass: function () {
                if (this.jsonLevel.carLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.carLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.carLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.carLevel == 3) {
                    return 'PROMPT';
                }
            },
            onLineLevelClass: function () {
                if (this.jsonLevel.onLineLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.onLineLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.onLineLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.onLineLevel == 3) {
                    return 'PROMPT';
                }
            },
            offLineLevelClass: function () {
                if (this.jsonLevel.offLineLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.offLineLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.offLineLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.offLineLevel == 3) {
                    return 'PROMPT';
                }
            },
            batteryLevelClass: function () {
                if (this.jsonLevel.batteryLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.batteryLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.batteryLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.batteryLevel == 3) {
                    return 'PROMPT';
                }
            },
            storageLevelClass: function () {
                if (this.jsonLevel.storageLevel == 0) {
                    return 'URGENT';
                } else if (this.jsonLevel.storageLevel == 1) {
                    return 'IMPORTANT';
                } else if (this.jsonLevel.storageLevel == 2) {
                    return 'GENERAL';
                } else if (this.jsonLevel.storageLevel == 3) {
                    return 'PROMPT';
                }
            }
        },
        handleCheckboxChange(e) {
            var checked = e.target.checked,
                value = e.target.value;
            // if(checked){
            //     avalon.Array.ensure(vm.deviceSOS,value);
            //
            // }else{
            //     if(vm.deviceSOS.indexOf(value) != -1){
            //         vm.deviceSOS.splice(vm.deviceSOS.indexOf(value), 1);
            //     }
            // }

        },
        //告警源全选
        gjycheckAll(e) {
            var checked = e.target.checked;
            if (checked) {
                vm.deviceSOS = ["DEVICE_SOS", "FACE_MONITORING", "CAR_MONITORING", "DEVICE_ONLINE", "DEVICE_OFFLINE", "DEVICE_ELECTRIC_CAPACITANCE", "DEVICE_STORAGE_CAPACITANCE"];
            } else {
                vm.deviceSOS = [];
            }
        },
        //包含子部门勾选
        handleOrgCheckboxChange(e) {
            var checked = e.target.checked;
            if (checked) {
                vm.contianChildCheck = true;
            } else {
                vm.contianChildCheck = false;
            }
        },
        extraExpandHandle: function (treeId, treeNode, selectedKey) {
            getOrgbyExpand(treeNode.orgId, treeNode.checkType).then((ret) => {
                let treeObj = $.fn.zTree.getZTreeObj(treeId);
                if (ret.code == 0) {
                    treeObj.addNodes(treeNode, changeTreeData(ret.data));
                }
                if (selectedKey != treeNode.key) {
                    let node = treeObj.getNodeByParam('key', selectedKey, treeNode);
                    treeObj.selectNode(node);
                }
            });
        },
        fetchOrgData() {
            // ajax 请求部门列表
            getOrgAll().then((ret) => {
                if (ret.code == 0) {
                    let data = changeTreeData(ret.data);
                    this.orgData = data;
                } else {
                    showMessage('error', this.gjdy_language.getDepartmentMsg);
                }
            });
        },
        handleTreeCheck(event, treeId, treeNode) {
            let orgId = treeNode.orgId,
                title = treeNode.orgName,
                node = treeNode;
            this.getSelected(orgId, title, node);
        },
        extraProcessWhenPersonChange() {

        },
        getSelected(orgId, title, node) {
            // let _this = this;
            //点了包含子部门
            if (vm.contianChild.length > 0 && vm.contianChildCheck) {
                //注意点击部门的时候，getselected是会调用两次的
                vm.contianChildCheck = false
                vm.showTip = false;
                fetchOrgChildren(orgId).then((ret) => {
                    vm.leftallchecked = false;
                    vm.$orgIdArr = [];
                    if (ret.code == 0) {
                        let obj = {};
                        obj.orgName = node.orgName;
                        obj.orgId = node.orgId;
                        ret.data.unshift(obj);
                        avalon.each(ret.data, function (index, item) {
                            item.username = item.orgName;
                            item.selected = false;
                            item.checked = false;
                            item.visible = false;
                            vm.$orgIdArr.push(item.orgId);
                            vm.orgId = '';
                        })
                        vm.deviceArr.clear();
                        vm.deviceArr.pushArray(ret.data);
                    } else {
                        showMessage('error', this.gjdy_language.notificationTips);
                    }
                    vm.contianChildCheck = true;
                })
                return;
            }
            if (vm.contianChild.length > 0) return;
            if (vm.orgId == orgId) {
                //说明当前部门已经请求过，并且加在了左侧
                return;
            }
            vm.orgId = orgId;
            vm.$orgIdArr = [];
            getDevicebyOrgId([orgId]).then((ret) => {
                if (ret.code == 0) {
                    vm.leftallchecked = false;
                    if (JSON.stringify(ret.data.currentElements) == "{}") {
                        vm.showTip = true;
                        vm.deviceArr = [];
                        return;
                    }
                    avalon.each(ret.data.currentElements[orgId], function (index, value) {
                        value.checked = false;
                        value.visible = true;
                        value.orgName = title;
                        value.gbCode = value.gbcode;
                        value.orgId = value.orgRid;
                        value.selected = false;
                        value.username = value.username + ` ${vm.gjdy_language.bodyCamera}`;
                        // value.username = value.username + vm.extra_class ? ' Body Camera' : '执法记录仪';
                        delete value.gbcode;
                    });
                    //如果某个设备已经被订阅，处理左侧列表的订阅设备为selected,vm.rightDevArr是二维数组
                    let temp1 = [],
                        temp2 = ret.data.currentElements[orgId].concat([]);
                    for (var i = 0; i < vm.$model.rightDevArr.length; i++) {
                        let temp3 = vm.$model.rightDevArr[i].list;
                        if (temp3.length > 0 && temp3[0].orgId == orgId) {
                            temp1 = temp3;
                            break;
                        }
                    }
                    for (var j = 0; j < temp2.length; j++) {
                        for (var k = 0; k < temp1.length; k++) {
                            if (temp1[k].gbCode && temp2[j].gbCode == temp1[k].gbCode) {
                                temp2[j].selected = true;
                                //temp2[j].checked = true;
                                break;
                            }
                        }

                    }
                    vm.deviceArr.clear();
                    vm.deviceArr = temp2;
                    //vm.deviceArr.pushArray(ret.data.currentElements[orgId]);
                    // temp2 =[];
                    // avalon.each(temp2, function (index ,item) {
                    //     _this.deviceArr.push(item);
                    // })

                } else {
                    showMessage('error', vm.gjdy_language.notificationTips);
                }

            });
        },
        leftcheckOne(e) {
            var checked = e.target.checked;
            if (checked === false) {
                vm.leftallchecked = false;
            } else { //avalon已经为数组添加了ecma262v5的一些新方法
                vm.leftallchecked = vm.deviceArr.every(function (el) {
                    return el.checked;
                });
            }
        },
        leftcheckAll(e) {
            var checked = e.target.checked;
            vm.deviceArr.forEach(function (el) {
                el.checked = checked;
            });
        },
        rightcheckAll(e) {
            var checked = e.target.checked;
            vm.rightDevArr.forEach(function (el) {
                el.checked = checked;
                avalon.each(el.list, function (index, value) {
                    value.checked = checked;
                });
            });
        },
        rightcheckOrg(e, item) {
            var checked = e.target.checked;
            avalon.each(item, function (index, value) {
                value.checked = checked;
            });
        },
        rightcheckOne(e, item) {
            var checked = e.target.checked;
            if(!checked) {
                item.checked = false;
            } else {
                item.checked = item.list.every(function (el) {
                    return el.checked;
                });
            }
        },
        handleToLeft() {
            let symbol = false;
            for(let i = vm.rightDevArr.$model.length - 1; i >= 0; i--) {
                if(vm.rightDevArr[i].checked) {
                    symbol = true;
                    let item = vm.rightDevArr[i].list;
                    if (item[0].orgId == vm.orgId || vm.$orgIdArr.indexOf(item[0].orgId != -1)) {
                        //x掉的部门跟左侧同一个部门
                        for (var k = 0; k < vm.deviceArr.length; k++) {
                            vm.deviceArr[k].selected = false;
                        }
                    }
                    //二维数组删除先要删除其里面的元素
                    vm.rightDevArr[i].list.splice(0, vm.rightDevArr[i].list.length);
                    vm.rightDevArr.splice(i, 1);
                } else {
                    let list = vm.rightDevArr[i].list;
                    for(let j = 0; j < list.length; j++) {
                        let value = list[j];
                        if(value.checked) {
                            symbol = true;
                            for (let k = 0; k < vm.deviceArr.length; k++) {
                                if (value.gbCode == vm.deviceArr[k].gbCode) {
                                    vm.deviceArr[k].selected = false;
                                }
                            }
                            vm.rightDevArr[i].list.splice(j, 1);
                            j--;
                            //二维数组已经空了，删掉
                            if (vm.rightDevArr[i].list.length == 0) {
                                vm.rightDevArr.splice(i, 1);
                            }
                        }
                    }
                }
            }
            if (!symbol) {
                showMessage('info', vm.gjdy_language.notSelected);
                return;
            }
        },
        hanleToright() {
            let arr = [];
            let tem = vm.$model.deviceArr;
            let symbol = false;
            for (var k = 0; k < tem.length; k++) {
                //selected表示这个设备是没有选到右侧去的
                if (tem[k].checked) {
                    symbol = true;
                }
                if (tem[k].checked && !tem[k].selected) {
                    tem[k].checked = false;
                    arr.push(tem[k]);
                    // vm.deviceArr.splice(k--, 1);
                    vm.deviceArr[k].selected = true;
                    vm.showTip = false;
                }
                vm.deviceArr[k].checked = false;
            }
            vm.leftallchecked = false;
            if (!symbol) {
                showMessage('info', vm.gjdy_language.notSelected);
                return;
            }
            if (arr.length == 0) {
                if (vm.contianChild.length > 0) {
                    showMessage('info', vm.gjdy_language.depSubscribed);

                } else {
                    showMessage('info', vm.gjdy_language.devSubscribed);
                }

                return;
            }
            //订阅设备
            if (vm.rightDevArr.length == 0 && arr[0].gbCode) {
                let arrItem = {};
                arrItem.checked = false;
                arrItem.list = arr;
                vm.rightDevArr.push(arrItem);
                return;
            } else if (vm.rightDevArr.length == 0 && !arr[0].gbCode) {
                avalon.each(arr, function (index, value) {
                    let arrItem = {};
                    arrItem.checked = false;
                    arrItem.list = [value];
                    vm.rightDevArr.push(arrItem);
                })

                // let dev = arr.map(function (value) {
                //     return value.orgId;
                // });
                // getDevicebyOrgId(dev).then((ret)=>{
                //     avalon.each(ret.data.currentElements, function (key, value) {
                //         if(value.length <=0)return;
                //         avalon.each(value, function (index, item) {
                //             item.checked =true;
                //             item.visible = true;
                //             item.gbCode = item.gbcode;
                //             item.orgId = item.orgRid;
                //             item.username = (item.username =='') ? '执法记录仪':item.username;
                //             delete item.gbcode;
                //         });
                //         //分批处理
                //         // (function  (v) {
                //         //     let val =v;
                //         //     if(val.length > 250){
                //         //         let num = Math.floor(val.length/250);
                //         //         for(var i=0;i<num;i++){
                //         //             let obj = val.slice(i*250,(i+1)*250);
                //         //             (function (arr) {
                //         //                 setTimeout(function () {
                //         //                     vm.rightDevArr.push(arr);
                //         //                 }, 2000 * i);
                //         //             })(obj);
                //         //         }
                //         //         return;
                //         //     }
                //         //     setTimeout(function () {
                //         //         vm.rightDevArr.push(val);
                //         //     }, 2000)
                //         // })(value)
                //
                //
                //     })
                // })

                return;
            }
            //订阅设备,此时要判断右侧，有两种可能，1，右侧是订阅整个部门的，直接删掉，直接显示订阅整个部门，2，订阅的是设备，往里面添加设备就好，
            // 注意，我在getselected已经过滤过数据的，右侧已经选过的是不会再push的
            if (arr[0].gbCode) {
                for (var i = 0; i < vm.rightDevArr.length; i++) {
                    //右侧是订阅设备
                    if (vm.rightDevArr[i].list[0].orgId == arr[0].orgId) {
                        //右边加过这个部门的设备，vm.rightDevarr是二维数组,因为我在左边显示的时候就已经过滤去掉了在右边显示的数据，这时候直接push就好
                        //let returnarr = vm.$model.rightDevArr[i].concat(arr);

                        //右侧订阅的是设备
                        if (vm.rightDevArr[i].list[0].gbCode) {
                            avalon.each(arr, function (index, value) {
                                vm.rightDevArr[i].list.push(value);
                            })
                            //显示所有li
                            avalon.each(vm.rightDevArr[i].list, function (index, value) {
                                value.visible = true;
                            })
                            break;
                        }
                        //订阅部门，不用理啦，因为都已经订阅了整个部门，
                        showMessage('info', vm.gjdy_language.devSubscribed);
                        break;

                    }
                }
                if (i == vm.rightDevArr.length) {
                    //没有加过
                    let arrItem = {};
                    arrItem.checked = false;
                    arrItem.list = arr;
                    vm.rightDevArr.push(arrItem);
                }
            } else {
                //订阅部门
                //左侧显示的是部门，先判断右侧是否具有该部门的订阅，如果有，删掉，直接显示部门
                let temp = []; //存储没有添加在右侧的部门，即没有订阅该部门
                let copyArr = vm.rightDevArr;
                for (var i = 0; i < arr.length; i++) {
                    for (var j = 0; j < copyArr.length; j++) {
                        if (arr[i].orgId == copyArr[j].list[0].orgId) {
                            //该部门已经订阅过了,删掉再push进去
                            if (copyArr[j].list.length > 0) {
                                //先移除掉二维数组里面的元素
                                copyArr[j].list.clear();
                            }
                            copyArr.removeAt(j);
                            j--;
                            // getDevicebyOrgId([arr[i].orgId]).then((ret)=>{
                            //     let a = j;
                            //     avalon.each(ret.data.currentElements, function (key, value) {
                            //         avalon.each(value, function (index, item) {
                            //             item.checked =true;
                            //             item.visible = true;
                            //             item.gbCode = item.gbcode;
                            //             item.orgId = item.orgRid;
                            //             item.username = (item.username =='') ? '执法记录仪':item.username;
                            //             delete  item.gbcode;
                            //         })
                            //         vm.rightDevArr.push(value);
                            //     })
                            //
                            // })
                            break;
                        }

                    }
                    // if(j == copyArr.length){
                    //     //该部门没有订阅过
                    //     temp.push(arr[i].orgId);
                    // }
                }
                // if(temp.length>0){
                //     getDevicebyOrgId(temp).then((ret)=>{
                //         avalon.each(ret.data.currentElements, function (key, value) {
                //             avalon.each(value, function (index, item) {
                //                 item.checked =true;
                //                 item.visible = true;
                //                 item.gbCode = item.gbcode;
                //                 item.orgId = item.orgRid;
                //                 item.username = (item.username =='') ? '执法记录仪':item.username;
                //                 delete  item.gbcode;
                //             })
                //             if(value.length>0) vm.rightDevArr.push(value);
                //         })
                //     })
                // }
                avalon.each(arr, function (index, value) {
                    let arrItem = {};
                    arrItem.checked = false;
                    arrItem.list = [value];
                    vm.rightDevArr.push(arrItem);
                })

                temp, copyArr = null;
            }
        },
        // //部门点击x
        // deleteOrgDevice(item,i){
        //     //orgRid 和orgId是一个东西
        //     if(item[0].orgId == vm.orgId){
        //         //x掉的部门跟左侧同一个部门
        //         for(let j=0;j<item.$model.length;j++){
        //             vm.deviceArr.push(item.$model[j]);
        //             this.deleteDevice([item[i]],i,j);
        //             j--;
        //         }
        //         // vm.deviceArr = arr;
        //     }else{
        //         for(let j=0;j<item.$model.length;j++){
        //             this.deleteDevice([item[i]],i,j);
        //             j--;
        //         }
        //     }
        //     //vm.rightDevArr.splice(i,1);
        //},
        //部门点击x
        deleteOrgDevice(item, i) {
            //orgRid 和orgId是一个东西
            if (item[0].orgId == vm.orgId || vm.$orgIdArr.indexOf(item[0].orgId != -1)) {
                //x掉的部门跟左侧同一个部门
                for (var k = 0; k < vm.deviceArr.length; k++) {
                    vm.deviceArr[k].selected = false;
                }
                // vm.deviceArr = arr;
            }
            //二维数组删除先要删除其里面的元素
            vm.rightDevArr[i].list.splice(0, vm.rightDevArr[i].list.length);
            vm.rightDevArr.splice(i, 1);
        },
        //人员点击x
        deleteDevice(item, i, j) {
            // if (item.orgId == vm.orgId || vm.$orgIdArr.indexOf(item.orgId) != -1) {
                //x掉的设备的部门跟左侧同一个部门
                //let arr = vm.$model.deviceArr.concat(item[j]);
                for (var k = 0; k < vm.deviceArr.length; k++) {
                    if (item.gbCode == vm.deviceArr[k].gbCode) {
                        vm.deviceArr[k].selected = false;
                    }
                }
                ///vm.deviceArr = arr;
            // }
            vm.rightDevArr[i].list.splice(j, 1);
            //二维数组已经空了，删掉
            if (vm.rightDevArr[i].list.length == 0) {
                vm.rightDevArr.splice(i, 1);
            }
        },
        hideOrshowLi(item, i) {
            avalon.each(item, function (index, value) {
                value.visible = !value.visible;
            })
        },
        save() {
            let data = settlePostData();
            saveByAjax(data).then((ret) => {
                if (ret.code == 0) {
                    showMessage('success', vm.gjdy_language.SaveSuccess);
                    return;
                }
                showMessage('error', vm.gjdy_language.notificationTips);
            })
        },
        reset() {
            vm.deviceSOS = [];
            for (let i = 0; i < vm.rightDevArr.length; i++) {
                vm.rightDevArr[i].list.splice(0, vm.rightDevArr[i].list.length);
            }
            vm.rightDevArr.splice(0, vm.rightDevArr.length);
            avalon.each(vm.deviceArr, function (index, value) {
                value.selected = false;
            })
        }
    }
})

//提示框提示
function showMessage(type, content) {
    notification[type]({
        title: languageSelect == "en" ? vm.gjdy_language.notification : "通知",
        message: content
    });
}
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
        treeData[i].isParent = true;
    };
    return treeData;
}
/*
 * 集合1与集合2，求集合1的差集
 * */
function oneDifference(a, b) {
    let temp = [];
    for (var i = 0; i < a.length; i++) {
        if (!OneisContainTwo(b, a[i])) {
            temp.push(a[i]);
        }
    }
    return temp;
}

/*
 * 两个数组的并
 * */
function ArrUnion(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        if (!OneisContainTwo(arr2, arr1[i])) {
            arr2.push(arr1[i]);
        }
    }
    return arr2;
}
/*
 * 集合1是否包含集合2的元素
 * */
function OneisContainTwo(one, two) {
    for (var i = 0; i < one.length; i++) {
        if (one[i].gbcode == two.gbcode || one[i].gbCode == two.gbcode) {
            return true;
        }
    }
    return false;
}
/*
 *  处理后台放回的数据
 * */

function settleDeviceData(data, flag) {
    let obj = {},
        arr = [];
    if (flag) {
        for (var i = 0; i < data.length; i++) {
            data[i].username = data[i].userName + ` ${vm.gjdy_language.bodyCamera}`;
            // data[i].username = data[i].userName + '执法记录仪';
            delete data[i].userName;
            data[i].visible = false;
            data[i].checked = false;
            if (obj[data[i].orgId]) {
                obj[data[i].orgId].push(data[i]);
            } else {
                obj[data[i].orgId] = [data[i]];
            }
        }
        avalon.each(obj, function (key, item) {
            let arrItem = {};
            arrItem.checked = false;
            arrItem.list = item;
            vm.rightDevArr.push(arrItem);
        })
    } else {
        for (var i = 0; i < data.length; i++) {
            data[i].username = data[i].orgName;
            data[i].visible = false;
            data[i].checked = false;
            let arrItem = {};
            arrItem.checked = false;
            arrItem.list = [data[i]];
            vm.rightDevArr.push(arrItem);
        }
    }

}
/*
 * 处理提交给后台的数据
 * */
function settlePostData() {
    let data = {
        "id": vm.sqlid,
        "businessRSS": [{
            "sosType": "BUSINESS_SOS",
            "sosSource": "DEVICE_SOS",
            "sosLevel": vm.jsonLevel.sosLevel,
            "subscribed": vm.deviceSOS.indexOf('DEVICE_SOS') != -1 ? true : false
        }, {
            "sosType": "BUSINESS_SOS",
            "sosSource": "FACE_MONITORING",
            "sosLevel": vm.jsonLevel.faceLevel,
            "subscribed": vm.deviceSOS.indexOf('FACE_MONITORING') != -1 ? true : false
        }, {
            "sosType": "BUSINESS_SOS",
            "sosSource": "CAR_MONITORING",
            "sosLevel": vm.jsonLevel.carLevel,
            "subscribed": vm.deviceSOS.indexOf('CAR_MONITORING') != -1 ? true : false
        }],
        "statusRSS": [{
                "sosType": "STATUS_SOS",
                "sosSource": "DEVICE_ONLINE",
                "sosLevel": vm.jsonLevel.onLineLevel,
                "subscribed": vm.deviceSOS.indexOf('DEVICE_ONLINE') != -1 ? true : false
            },
            {
                "sosType": "STATUS_SOS",
                "sosSource": "DEVICE_OFFLINE",
                "sosLevel": vm.jsonLevel.offLineLevel,
                "subscribed": vm.deviceSOS.indexOf('DEVICE_OFFLINE') != -1 ? true : false
            }
        ],
        "deviceRSS": [{
                "sosType": "DEVICE_SOS",
                "sosSource": "DEVICE_ELECTRIC_CAPACITANCE",
                "sosLevel": vm.jsonLevel.batteryLevel,
                "subscribed": vm.deviceSOS.indexOf('DEVICE_ELECTRIC_CAPACITANCE') != -1 ? true : false
            },
            {
                "sosType": "DEVICE_SOS",
                "sosSource": "DEVICE_STORAGE_CAPACITANCE",
                "sosLevel": vm.jsonLevel.storageLevel,
                "subscribed": vm.deviceSOS.indexOf('DEVICE_STORAGE_CAPACITANCE') != -1 ? true : false
            }
        ],
        "devicesRSS": [],
        "orgIdsRSS": []
    };
    var arr = vm.$model.rightDevArr;
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].list.length; j++) {
            if (arr[i].list[j].gbCode) {
                data.devicesRSS.push(arr[i].list[j].gbCode);
            } else {
                data.orgIdsRSS.push(arr[i].list[j].orgId);
            }

        }
    }
    return data;
}

avalon.filters.InitValue = function (str) {
    return str ? str : '-';
}

avalon.filters.changeWord = function (str) {
    if (str == 0) {
        return vm.gjdy_language.Urgent;
    } else if (str == 1) {
        return vm.gjdy_language.Important;
    } else if (str == 2) {
        return vm.gjdy_language.General;
    } else {
        return vm.gjdy_language.Note;
    }

}
// 接口
/* 获取部门 */
function getOrgAll() {
    return ajax({
        url: '/gmvcs/uap/org/find/fakeroot/mgr',
        //url: '/gmvcs/uap/org/all',
        //   url: '/api/tyywglpt-cczscfwgl',

        method: 'get',
        cache: false
    });
}
/*
 *分级获取部门
 *  */
function getOrgbyExpand(orgId, checkType) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent/mgr?pid=' + orgId + '&&checkType=' + checkType,
        method: 'get',
        cache: false
    });
}

/*
 * 获取部门下的执法记录仪
 * */

function getDevicebyOrgId(orgId) {
    return ajax({
        url: '/gmvcs/uom/device/dsj/listByOrgIds?vPage=0&vPageSize=50000',
        method: 'post',
        cache: false,
        data: orgId,
        async: true
    });
}
/*
 *  点击保存
 * */
function saveByAjax(data) {
    return ajax({
        url: '/gmvcs/instruct/sos/saveorupdate/myself/rss',
        method: 'post',
        cache: false,
        data: data
    });
}
/*
 * 获取登录用户的告警订阅
 * */

function fetchUserInitData() {
    return ajax({
        url: '/gmvcs/instruct/sos/myself/rss',
        method: 'get',
        cache: false
    })
}
/*
 * 请求后台获取用户设置
 * */

function fetchUserconfig() {
    return ajax({
        url: '/sos/sos/level',
        method: 'get',
        cache: false
    });
}
/*
 * 获取勾选部门的所有子部门
 * */

function fetchOrgChildren(orgId) {
    return ajax({
        url: '/gmvcs/uap/org/find/by/parent?pid=' + orgId,
        method: 'get'
    })
}