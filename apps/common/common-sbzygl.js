import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
const storage = require('../../services/storageService.js').ret;
import {
    notification
} from 'ane';
let language_txt = require('../../vendor/language').language;
import {
    languageSelect
} from '../../services/configService';
avalon.filters.fillterEmpty = function (str) {
    return (str === "" || str === null) ? "-" : str;
}

export default class Sbzygl {
    constructor(vm) {
        this.vm = vm;
        //0~255.0~255.0~255.0~255
        this.ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        this.nameReg = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
        this.nameReg2 = /^[\sa-zA-Z0-9\u4e00-\u9fa5_-]+$/;
        this.numReg = /^\d+$/;
        this.telReg = /^\d[\d-]{6,18}$/;
        this.telEasyReg = /^(\d|-)*$/;
        this.allotReg = /^[a-zA-Z0-9\u4e00-\u9fa5]+[(（][a-zA-Z0-9\u4e00-\u9fa5]+[)）]$/;
        this.sbzygl_language = language_txt.xtywgl.sbzygl; //多语言
    }
    /**
     * 全选框
     * @param {$event} e 事件对象
     * @param {Function} callback 回调函数
     */
    handleCheckAll(e, callback) {
        let checkedData = [];
        if (this.vm.checkAll) {
            avalon.each(this.vm.list, (index, item) => {
                item.checked = true;
            });
            this.vm.selectedRowsLength = this.vm.list.length;
            checkedData = this.vm.list;
        } else {
            avalon.each(this.vm.list, (index, item) => {
                item.checked = false;
            });
            this.vm.selectedRowsLength = 0;
        }
        avalon.isFunction(callback) && callback(checkedData);
    }
    /**
     * 勾选
     * @param {*} index 
     * @param {*} record 
     * @param {*} e 
     * @param {*} callback 
     */
    handleCheck(index, record, e, callback) {
        let hasChecked = this.vm.list.filter((item) => {
            return item.checked;
        });
        this.vm.selectedRowsLength = hasChecked.length;
        if (this.vm.selectedRowsLength === this.vm.list.length) {
            this.vm.checkAll = true;
        } else {
            this.vm.checkAll = false;
        }
        avalon.isFunction(callback) && callback(hasChecked, record);
    }

    //获取所属部门
    fetchOrgData(orgData, callback) {
        const self = this;
        let url = '/gmvcs/uap/org/find/fakeroot/mgr';
        this.ajax(url).then(result => {
            if (result.code !== 0) {
                this.showTips('error', self.sbzygl_language.departmentInformationAcquisitionFailed);
                return;
            }
            orgData = this.handleRemoteTreeData(result.data);
            avalon.isFunction(callback) && callback(orgData);
        }).fail((err) => {
            this.vm.loading = false;
            this.vm.isNull = true;
        });
    }

    /**
     * 获取升级包列表
     * @param {Number} type  设备类型 1--执法仪(暂定)  0--采集工作站
     * @param {Array} checkedData  勾选的数据集
     * @param {Array} updateData   获取的更新集
     */
    fetchUpdateList(type, checkedData, callback) {
        let updateData = [];
        let versions = [];
        for (let i = 0; i < checkedData.length; i++) {
            let current = checkedData[i].version;
            if (!current) {
                // current = "1.0.0"
                current = "0.0.0"
            }
            if (versions.indexOf(current) < 0) {
                versions.push(current);
            }
        }
        let data = {
            "manufacturer": Number(checkedData[0].manufacturer),
            "model": type === 0 ? checkedData[0].modelnum : checkedData[0].model,
            "versions": versions
        }
        this.ajax('/gmvcs/uom/package/getUpdatePackageInfoByInsertTime', 'post', data).then(result => {
            if (result.code !== 0) {
                this.showTips('warning', result.msg);
                return;
            }
            updateData = result.data;
            // avalon.each(updateData, (index, item) => {
            //     // updateData[index].description = item.description.slice(13);
            //     updateData[index].size = updateData[index].size ? parseFloat(item.size).toFixed(2) + 'M' : "";
            // })
            avalon.isFunction(callback) && callback(updateData);
        });
    }

    /**
     * 升级下发
     * @param {$event} e 事件对象
     * @param {Strign} type 'gbCode'--采集站 || gbcode'--执法仪
     * @param {Strign} updateWay 0-执法仪无线网络升级，1-执法仪通过采集工作站直接升级'，2-执法仪通过采集工作站定向升级，3-采集工作站升级
     * @param {Strign} updatePackageId 选择的升级包的id
     * @param {Array} checkedData 勾选的设备集合 
     */
    handleUpdate(e, type, updateWay, updatePackageId, checkedData, callback) {
        let data = []
        avalon.each(checkedData, (index, el) => {
            let item = {
                updatePackageId: updatePackageId
            }
            item.deviceId = el[type]; //国标编号
            item.updateWay = updateWay;
            data.push(item);
        });
        this.ajax('/gmvcs/uom/package/allocPackage', 'post', data).then(result => {
            if (result.code == 1500) {
                this.showTips('error', result.msg);
                return;
            } else if (result.code == 1607) {
                this.showTips('warning', language_txt.xtywgl.sbzygl.hasBeenIssued);
                return;
            } else if (result.code !== 0) {
                this.showTips('warning', result.msg);
                return;
            }
            avalon.isFunction(callback) && callback();
        });
    }

    /**
     * 发送ajax请求，默认为get请求
     * @param {*} url 
     * @param {*} method 
     * @param {*} data 
     */
    ajax(url, method, data) {
        return ajax({
            url: url,
            method: method || 'get',
            data: data,
            cache: false
        });
    }

    /**
     * 显示提示消息
     * @param {*} type 
     * @param {*} content 
     * @param {*} layout 
     */
    showTips(type, content, layout, duration) {
        const self = this;
        notification[type]({
            title: self.sbzygl_language.notification,
            message: content,
            layout: layout || 'topRight',
            timeout: duration || 1500
        });
    }

    //去除数据前后空格
    trimData(json) {
        avalon.each(json, (key, value) => {
            json[key] = $.trim(json[key]);
        })
        return json;
    }

    /**
     * 表单验证，focus事件
     * @param {string} name  字段名
     * @param {vmodel} vm  vm
     */
    handleFocus(event, name, vm) {
        if (vm.showJson[name] != undefined) {
            vm.showJson[name] = true;
        }
        vm.validJson[name] = true;
        $(event.target).siblings('.input-close-ywzx').show();
    }
    /**
     * 表单验证，blur进行验证
     * @param {string} name 要验证的字段名
     * @param {vmodel} vm vm
     * @param {regexp} reg  正则表达式
     * @param {number} lengthLimit  长度限制(默认30，对长度没有限制记得传null)
     */
    handleFormat(event, name, vm, reg, lengthLimit) {
        reg = reg || /\S+/g;
        lengthLimit = lengthLimit === undefined ? 30 : lengthLimit;
        vm.inputJson[name] = $.trim(vm.inputJson[name]);
        if (!reg.test(vm.inputJson[name]) || (lengthLimit && vm.inputJson[name].length > lengthLimit)) {
            vm.validJson[name] = false
        } else {
            vm.validJson[name] = true
        }
        if (vm.showJson[name] != undefined) {
            vm.showJson[name] = false;
        }
        $(event.target).siblings('.input-close-ywzx').hide();
    }
    /**
     * 表单验证，小红叉清空
     * @param {string} name 要清楚的字段名
     * @param {event} event 事件对象
     * @param {vmodel} vm vm
     */
    handleClear(event, name, vm) {
        vm.inputJson[name] = "";
        $(event.target).siblings('input').val('').focus();
    }

    /**
     * 初始化列表，主要是
     * 判断是否出现滚动条，在出现滚动条时列表头加上padding用来对齐
     */
    initList($header, $content) {
        $header = $header ? $header : $('.tyywglpt-list-header');
        $content = $content ? $content : $('.tyywglpt-list-content');
        // if ($content.get(0).offsetHeight < $content.get(0).scrollHeight - 1) {
        //     $header.css({
        //         'padding-right': '17px'
        //     });
        // } else {
        //     $header.css({
        //         'padding-right': '0'
        //     });
        // }
        $content.find("[data-toggle='popover']").popoverX({
            trigger: 'manual',
            container: 'body',
            placement: 'auto top',
            //delay:{ show: 5000},
            html: 'true',
            content: function () {
                return '<div class="title-content">' + $(this).attr('data-original-title') + '</div>';
            },
            animation: false
        }).off("mouseenter").on("mouseenter", (event) => {
            let target = event.target;
            if ($(target).text() === '-') {
                return;
            }
            this.vm.titleTimer = setTimeout(() => {
                $('div.popover').remove();
                $(target).popoverX("show");
                $(".popover").off("mouseleave").on("mouseleave", (event) => {
                    $(target).popoverX('hide');
                });
            }, 500);
        }).off("mouseleave").on("mouseleave", (event) => {
            let target = event.target;
            clearTimeout(this.vm.titleTimer);
            setTimeout(() => {
                if (!$(".popover:hover").length) {
                    $(target).popoverX("hide");
                }
            }, 100);
        });
    }

    //设置表格的top
    autoSetListPanelTop() {
        let $toobar = $('.tyywglpt-tool-bar-inner');
        if (!$toobar.length) {
            return;
        }
        //extraPix = $toobar的margin-bottom为8 + list-header的负margin-top为34 || 当too-bar里面的按钮都因为权限而隐藏时，则只需要list-header的负margin-top为34
        let extraPix = $toobar.outerHeight() > 0 ? 42 : 34;
        // $('.tyywglpt-list-panel').css({
        //     'top': $toobar.offset().top + $toobar.outerHeight() + extraPix
        //     // 'top': $toobar.offset().top + $toobar.outerHeight() + extraPix - 68
        // });
    }
    /** 
     * 初始化表头拖拽
     */
    initDragList(listHeaderName) {
        let $header = $('.tyywglpt-list-header');
        let $content = $('.tyywglpt-list-content');
        //判断列表是否为空
        let eleNull = $content.find('.list-null');
        if (eleNull.length) {
            eleNull.innerWidth($header.get(0).scrollWidth);
        } else {
            // 初始化表体格子宽度
            $header.find('li').each((index, el) => {
                index = index + 1;
                $('.tyywglpt-list-content>li>div:nth-child(' + index + ')').innerWidth($(el).innerWidth());
            });
            $('.tyywglpt-list-content .sqgl-special-item').attr('style', '');
        }
        //最开始是没有横向滚动条的
        $content.find('li').addClass('list-no-scroll-x');

        //表格横向滚动时保持表头与表体的对齐
        $content.off('scroll.draglist').on('scroll.draglist', function (event) {
            $header.css({
                'margin-left': -event.target.scrollLeft
            })
        });

        //窗口变化时，维持表格对齐
        $(window).off('resize.draglist').on('resize.draglist', function (event) {
            // 重置表体格子宽度
            $header.find('li').each((index, el) => {
                index = index + 1;
                $('.tyywglpt-list-content>li>div:nth-child(' + index + ')').innerWidth($(el).innerWidth());
            });
            $('.tyywglpt-list-content .sqgl-special-item').attr('style', '');
        });

        //鼠标样式判断
        $header.find('li').off('mousemove').on('mousemove', function (event) {
            let $target = $(event.target);
            //改鼠标样式
            if (!$target.hasClass("last-item") && event.offsetX > $target.innerWidth() - 10) {
                $target.css({
                    cursor: "e-resize"
                });
            } else {
                $target.css({
                    cursor: "default"
                });
            }
        });

        //拖拽
        $header.find('li').off('mousedown').on('mousedown', function (event) {
            let $target = $(event.target);
            let oldWidth = $target.innerWidth();
            if ($target.hasClass("last-item") || event.offsetX < oldWidth - 10) {
                event.preventDefault();
                return;
            }
            let dragTH = $target;
            //按下时鼠标距离页面的距离
            let startX = event.pageX;
            //从拖动到出现横向滚动条时鼠标移动的距离
            let hasScrollDir = 0;
            //是否出现横向滚动条
            let hasScroll = false;
            //授权管理页面横跨三栏的特殊项
            let sqglSpecOldWidth = $('.tyywglpt-list-content .sqgl-special-item').innerWidth();
            // 使用namespace，以防影响其他地方document的事件
            $(document).off('mousemove.draglist').on('mousemove.draglist', function (event) {
                //鼠标移动的实时距离
                let dir = event.pageX - startX;
                //出现横向滚动条之前记录鼠标移动的距离
                !hasScroll && (hasScrollDir = dir);
                //获得表头项的新宽度
                let newWidth = oldWidth + dir;
                if (newWidth < 30) {
                    return;
                }
                dragTH.innerWidth(newWidth);

                if (eleNull.length) { //暂无数据时
                    eleNull.innerWidth($header.get(0).scrollWidth);
                } else { //有数据时
                    let index = dragTH.index() + 1;
                    $('.tyywglpt-list-content>li>div:nth-child(' + index + ')').not('.sqgl-special-item').innerWidth(newWidth);

                    //判断是否有横向滚动条，根据有无添加相应的类名，以便应用相应的样式
                    if ($content.innerWidth() < $content.get(0).scrollWidth) { //有滚动条时
                        hasScroll = true;
                        $content.find('li').removeClass('list-no-scroll-x').addClass('list-has-scroll-x');

                        //授权管理页面的特殊处理
                        if (listHeaderName === "tyywglpt-sqgl-list-header") {
                            if ($target.hasClass('sqgl-special-header')) { //当拖动的是第一列的时候
                                //最后一行的第二列的宽度为：li的宽度 - 第一列的宽度（此处使用百分比）
                                let ratio = (1 - $('.sqgl-special-header').width() / $content.find('li:eq(0)').width()) * 100;
                                $('.tyywglpt-list-content .sqgl-special-item').css('width', ratio + '%');
                            } else { //当拖动的是其他列的时候
                                //最后一行的第二列的宽度为：原宽度sqglSpecOldWidth + 鼠标实际移动距离dir - 未出现滚动条之前鼠标移动的距离hasScrollDir
                                $('.tyywglpt-list-content .sqgl-special-item').innerWidth(sqglSpecOldWidth + dir - hasScrollDir);
                            }
                        }
                    } else { //无滚动条时
                        $content.find('li').removeClass('list-has-scroll-x').addClass('list-no-scroll-x');
                        //授权管理页面的特殊处理
                        if (listHeaderName === "tyywglpt-sqgl-list-header") {
                            //最后一行的第二列的宽度为：li的宽度 - 第一列的宽度（此处使用百分比）
                            let ratio = (1 - $('.sqgl-special-header').width() / $content.find('li:eq(0)').width()) * 100;
                            $('.tyywglpt-list-content .sqgl-special-item').css('width', ratio + '%');
                        }
                    }
                }
                event.preventDefault();
            });
            // 使用namespace，以防影响其他地方document的事件
            $(document).off('mouseup.draglist').on('mouseup.draglist', function (event) {
                $(document).off('mousemove.draglist').off('mouseup.draglist');
                //保留表头宽度，以便切换模块时可以使用
                let widthArr = [];
                $header.find('li').each((index, el) => {
                    widthArr.push($(el).innerWidth());
                });
                storage.setItem(listHeaderName, JSON.stringify(widthArr), 0.5);
            });
        });
    }

    /** 
     * 判断是否需要恢复上次拖拽后的表头，如果要则根据保持的宽度设置列表的表头宽度
     */
    setListHeader(listHeaderName) {
        //表头宽度设置
        let widthArrStr = storage.getItem(listHeaderName);
        let widthArr = widthArrStr ? JSON.parse(widthArrStr) : [];
        if (widthArr.length) {
            $('.tyywglpt-list-header li').each((index, el) => {
                $(el).innerWidth(widthArr[index]);
            })
        }
    }

    /**
     * 获取版本号较低的版本
     * @param {string} v1 要比较的版本号1
     * @param {string} v2 要比较的版本号2
     * 当v1,或者v2为null时，返回null； 当v1小于等于v2时，返回v1;否则，返回v2
     */
    getLowerVersion(v1, v2) {
        if (!v1 || !v2) {
            return null;
        }
        let reg = /\d+\.\d+\.\d+/g;
        let regMatchV1 = v1.match(reg);
        let regMatchV2 = v2.match(reg);
        if (!regMatchV1 || !regMatchV2) {
            return null;
        }
        let arrV1 = (regMatchV1[0]).split('.');
        let arrV2 = (regMatchV2[0]).split('.');
        avalon.each(arrV1, (index, el) => {
            arrV1[index] = parseInt(el);
        });
        avalon.each(arrV2, (index, el) => {
            arrV2[index] = parseInt(el);
        });
        if (arrV1[0] === arrV2[0]) {
            if (arrV1[1] === arrV2[1]) {
                return (arrV1[2] <= arrV2[2] ? v1 : v2);
            } else {
                return (arrV1[1] < arrV2[1] ? v1 : v2);
            }
        } else {
            return (arrV1[0] < arrV2[0] ? v1 : v2)
        }
    }

    /**
     * 处理远程部门树的数据
     * @param {array} remoteData  远程请求得到的数据
     */
    handleRemoteTreeData(remoteData) {
        if (!remoteData) {
            return;
        }
        let handledData = [];
        avalon.each(remoteData, (index, el) => {
            let item = {
                key: el.orgId,
                title: el.orgName,
                code: el.orgCode,
                path: el.path,
                checkType: el.checkType,
                children: el.childs,
                isParent: true,
                icon: "/static/image/tyywglpt/org.png"
            };
            handledData.push(item);
            this.handleRemoteTreeData(el.childs)
        });
        return handledData;
    }

    //逐级加载部门树
    fetchOrgWhenExpand(treeId, treeNode, selectedKey) {
        let url = '/gmvcs/uap/org/find/by/parent/mgr?pid=' + treeNode.key + '&checkType=' + treeNode.checkType
        this.ajax(url).then((result) => {
            let treeObj = $.fn.zTree.getZTreeObj(treeId);
            if (result.code == 0) {
                treeObj.addNodes(treeNode, this.handleRemoteTreeData(result.data));
            }
            if (selectedKey != treeNode.key) {
                let node = treeObj.getNodeByParam("key", selectedKey, treeNode);
                treeObj.selectNode(node);
            }
        });
    }

    /**
     * 处理远程下拉框
     * @param {string} url 请求地址
     * @param {string} keyLable 赋值给label的键名
     * @param {string} keyValue 赋值给value的键名
     * @param {string} type 下拉框的类型 如'manufacturer'--产商||'storage'--存储服务
     * @param {string} typeName 下拉框的类型的中文名  如产商 || 存储服务
     */
    handleRemoteSelect(url, keyLable, keyValue, type, typeName, callback, failCallback) {
        const self = this;
        this.ajax(url).then(result => {
            if (result.code !== 0) {
                this.showTips('error', self.sbzygl_language.acquire + typeName + self.sbzygl_language.informationFail);
                avalon.isFunction(failCallback) && failCallback();
                return;
            }
            let options = [];
            let shiftOptions = [];
            let data = null;
            if (type == "storage") {
                data = result.data.storageBasicInfos;
            } else {
                data = result.data;
            }
            avalon.each(data, function (index, el) {
                let items = {
                    "label": el[keyLable],
                    "value": type == "storage" ? el[keyValue] : el[keyValue].toString()
                };
                options.push(items);
            });
            shiftOptions = options.slice();
            if (shiftOptions.length > 0) {
                shiftOptions.shift(1);
            }
            avalon.isFunction(callback) && callback(options, shiftOptions);
        }).fail(() => {
            avalon.isFunction(failCallback) && failCallback();
        });
    }

    //cascade/unfiltered或者cascade级联接口的厂商处理
    handleRemoteManu(manufacturerData, callback) {
        let manuOptions = [];
        // 厂商
        avalon.each(manufacturerData, function (index, el) {
            let items = {
                "label": el.value,
                "value": String(el.key)
            };
            manuOptions.push(items);
        });
        let manuHasNullOptions = manuOptions.slice();
        if (manuHasNullOptions.length) {
            manuHasNullOptions.unshift({
                "label": languageSelect=='en' ? "All" : "不限",
                "value": "null"
            });
        }
        avalon.isFunction(callback) && callback(manuHasNullOptions, manuOptions);
    }

    //cascade/unfiltered或者cascade级联接口的类型处理
    handleRemoteType(typeData, callback) {
        let typeOptions = [];
        avalon.each(typeData, function (index, el) {
            let items = {
                "label": el.value,
                "value": String(el.key)
            };
            typeOptions.push(items);
        });
        let typeHasNullOptions = typeOptions.slice();
        if (typeHasNullOptions.length > 0) {
            typeHasNullOptions.unshift({
                "label": languageSelect=='en' ? "All" : "不限",
                "value": "null"
            });
        }
        avalon.isFunction(callback) && callback(typeHasNullOptions, typeOptions);
    }

    //cascade/unfiltered或者cascade级联接口的型号处理
    handleRemoteModel(modelData, callback) {
        let modelOptions = [];
        let validData = modelData.filter((item) => {
            return !!item;
        })
        avalon.each(validData, (index, el) => {
            let item = {
                label: el || '-',
                value: String(index)
            }
            modelOptions.push(item);
        })
        let modelHasNullOptions = modelOptions.slice();
        if (modelHasNullOptions.length) {
            modelHasNullOptions.unshift({
                "label": languageSelect=='en' ? "All" : "不限",
                "value": "null"
            });
        }
        avalon.isFunction(callback) && callback(modelHasNullOptions, modelOptions);
    }

    /**
     * 将后台返回的数组转换为字典结构，以便下拉框使用（暂时只用在了多路视频设备管理页面）
     * @param {*} remoteData 
     * @param {*} callback 
     */
    handleRemoteArrayToDic(remoteData, callback) {
        let options = [];
        let validData = remoteData.filter((item) => {
            return !!item;
        })
        avalon.each(validData, (index, el) => {
            let item = {
                label: el,
                value: el
            }
            options.push(item);
        })
        let hasNullOptions = options.slice();
        if (hasNullOptions.length) {
            hasNullOptions.unshift({
                "label": languageSelect=='en' ? "All" : "不限",
                "value": "null"
            });
        }
        avalon.isFunction(callback) && callback(hasNullOptions, options);
    }

    //去抖动函数
    debounce(fn, delay) {
        let timer = null;
        // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
        return function () {
            // 保存函数调用时的上下文和参数，传递给 fn
            let context = this
            let args = arguments
            // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
            clearTimeout(timer)
            // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
            // 再过 delay 毫秒就执行 fn
            timer = setTimeout(function () {
                fn.apply(context, args)
            }, delay)
            //将timer返回以暴露，以便可以在其他地方clearTimeout
            return timer;
        }
    }
}