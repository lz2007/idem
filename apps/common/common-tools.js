/*
 * name: Gm
 * description: 个人开发工具类
 * author: Lemon
 * last-update: 2018-6-53
 * api -- > tool   --> 负责页面通用功能
 *     -- > format --> 负责页面通用格式转换
 *     -- > reg    --> 负责页面通用正则
 * 
 * usage: 本地文件导入，如import{Gm} = './该文件路径',并在本地文件新增对应模块类予以继承
 *  function Tools() { 自定义本模块的工具属性&方法 };
 *  function Format() { 自定义本模块的格式化属性&方法 };
 *  function Reg() { 自定义本模块的正则属性&方法};
 *  Tools.prototype = Object.create(new Gm().tool);
 *  Format.prototype = Object.create(new Gm().format);
 *  Reg.prototype = Object.create(new Gm().reg);
 *  
 *  //本模块全局调用对象
 *  let Gm_tool = new Tools();
 *  let Gm_format = new Format();
 *  let Gm_reg = new Reg();
 */
import {
    notification
} from 'ane';
let storage = require('/services/storageService.js').ret;

function Gm(name) {
    this.name = name;
};
Gm.prototype = {
    constructor: Gm,
    tool: {
        beautyProp(obj) {
            Object.keys(obj).forEach((val, key) => {
                
                if (obj[val] == null) {
                    obj[val] = '';
                }
            });
        },
        resetProp(obj) {
            Object.keys(obj).forEach((val, key) => {
                obj[val] = '';
            });
            return this;
        },
        assign(aim, target) {
            Object.keys(target).forEach(prop => {
                aim[prop] = target[prop];
            });
        },

        /**
         * popover 公用方法
         *
         * @param {*} ele
         * 
         * example: let tooltipsDom = $("[data-toggle='popover']");
         *          Gm_tool.showPopover(tooltipsDom);
         * 
         */
        showPopover(ele) {
            let _this = this;
            $(document).off('mouseenter').on('mouseenter', '.popover.top.in', function () {
                _this.popoverMove = true;
                $(this).show();
            });

            $(document).off('mouseleave').on('mouseleave', '.popover.top.in', function () {
                _this.popoverMove = false;
                $(this).hide();
            });
            let popovermouseover = e => {
                let targetEle = $(e.target);

                if ((targetEle.text()).replace(/\u200B/g, '') == '' || targetEle.text() === '-') {
                    return false;
                }

                targetEle.popover({
                    trigger: 'manual',
                    container: 'body',
                    placement: 'top',
                    html: 'true',
                    content: function () {
                        return $(this).text();
                    },
                    animation: false
                })

                clearTimeout(this.popoverTime);

                this.popoverTime = setTimeout(() => {
                    targetEle.popover('show');
                }, 1000);
            };

            let popovermouseout = e => {
                clearTimeout(this.popoverTime);
                setTimeout(() => {
                    if (_this.popoverMove) {
                        $(e.target).popover('show');
                    } else {
                        $(e.target).popover('hide');
                    }
                }, 100);
            };
            ele.each(function () {
                $(this).mouseover(popovermouseover);
                $(this).mouseout(popovermouseout);
            });
        },

        /*表头拖动处理*/
        resetTableWidth(params) {
            /*
             * 该方法重置表格未初始化长度
             * 参数说明: params需要包含三个属性
             * body: 表格的父级的class
             * name: 这个name用来声明storage，最好加上自己模块特殊标志，警惕与其他storage名字重复
             * arr: 表头的class的集合，按照有效表头/子表的顺序开始,arr[0]为有效表头,a[1]为父级表头,a[2]......
             * demo: 考评总览  Gm_tool.resetTableWidth(params);
             */
            if (typeof params != 'object' || params == null) {
                throw new Error('参数不是对象');
            }
            let {
                body,
                name,
                arr
            } = params;
            let obj = this.getStorage(name);
            if (!obj && body && arr) {
                // console.log('正在查询表格..');
                return;
            }
            if (arr instanceof Array != true || !arr.length || typeof obj !== 'object') {
                throw new Error('参数类型不正确');
            }
            arr.forEach(function (val, index) {
                $('.' + val + '>li').attr('style', '');
            });
            $('.' + body + ' li [style]').attr('style', '');
            Object.keys(obj).forEach((val, key) => {
                obj[val].length = 0;
            });
        },
        rebackTableWidth(params) {
            /*
             * 该方法切换模块还原上次操作的表格长度
             * 参数说明 params需要包含三个属性 与resetTableWidth，rebackTableWidth说明一样
             * demo: 考评总览  Gm_tool.rebackTableWidth(params)
             */
            if (typeof params != 'object' || params == null) {
                throw new Error('参数不是对象');
            }
            let {
                body,
                name,
                arr
            } = params;
            let obj = this.getStorage(name);
            if (!obj && body && arr) {
                // console.log('第一次初始化表格..');
                return;
            }
            if (arr instanceof Array != true || !arr.length || typeof obj !== 'object') {
                throw new Error('参数类型不正确');
            }
            let exist = true;
            Object.keys(obj).forEach((val, key) => {
                exist = obj[val].length ? true : false;
            });
            if (!obj || !exist) {
                return;
            }
            //第一步复原表头
            arr.forEach((val, key) => {
                $('.' + val + ' li').each(function (value, keyli) {
                    $(this).outerWidth(obj['head' + key][value]);
                });
            });
            //第二步复原表格
            if (!$('.' + body + ' li').length) {
                return;
            } else {
                $('.' + body + ' li').each(function (val, key) {
                    $(this).find('div').each(function (value, keydiv) {
                        $(this).outerWidth(obj['head0'][value]);
                    });
                });
            }
        },
        saveTableWidth(arr, name) {
            /*
             * 该方法保存所有表头的长度数据
             * 因为组件ondispose访问不到原表格DOM
             * 所以默认在makeTableDrag中的表头mouseup事件中保存
             */
            if (arr instanceof Array != true || !arr.length) {
                throw new Error('参数类型不正确');
            }
            let obj = {};
            for (let i = 0; i < arr.length; i++) {
                obj['head' + i] = [];
            };
            arr.forEach((val, key) => {
                $('.' + val + ' li').each(function (value, keyli) {
                    obj['head' + key].push($(this).outerWidth());
                });
            });
            this.setStorage(name, obj, 0.5);
            return obj;
        },
        makeTableDrag(params) {
            /*
             * 参数说明 params需要包含三个属性 与resetTableWidth，rebackTableWidth说明一样
             * demo: 考评总览 Gm_tool.makeTableDrag(params);
             * 注意事项: 因为当再次查询时会清理拖动过的痕迹，重置原始表格，所以建议表头的li 和表格内容li中的div不要用style控制样式       
             */
            if (typeof params != 'object' || params == null) {
                throw new Error('参数不是对象');
            }
            let {
                body,
                name,
                arr
            } = params;
            if (arr instanceof Array != true || !arr.length || typeof name !== 'string') {
                throw new Error('参数类型不正确');
            }
            let _this = this;

            function isNullOrUndefined(obj) {
                if (typeof (obj) == "undefined" || obj == null || obj == false) {
                    return true;
                }
                return false;
            }

            function registerTableDragEvent() {

                var dragTH; //记录拖拽的列
                var zwsj_width = 0;
                //第一步按下
                $('.' + arr[0] + ' li').mousedown(function (e) {

                    if ($(this).attr('parent')) {
                        return;
                    }
                    e = e || window.event;
                    if (e.offsetX > $(this).innerWidth() - 10) {
                        dragTH = $(this);
                        dragTH.mouseDown = true;
                        dragTH.oldX = e.pageX || e.clientX;
                        dragTH.oldWidth = $(this).innerWidth();
                    }
                    if ($('.list-null').length) {
                        zwsj_width = $('.list-null').outerWidth();
                    }
                })
                //第二步 拖动
                $('.' + arr[0] + ' li').mousemove(function (e) {
                    if ($(this).attr('parent')) {
                        return;
                    }
                    //改鼠标样式
                    if (e.offsetX > $(this).innerWidth() - 10) {
                        $(this).css({
                            cursor: "e-resize"
                        });
                    } else {
                        $(this).css({
                            cursor: "default"
                        });
                    }
                    if (isNullOrUndefined(dragTH)) {
                        dragTH = $(this);
                    }
                    if (!isNullOrUndefined(dragTH.mouseDown) && dragTH.mouseDown == true) {
                        var difference = (e.pageX - dragTH.oldX) || (e.clientX - dragTH.oldX);
                        var newWidth = dragTH.oldWidth + difference; //新的宽度

                        if ($('.list-null').length) {
                            $('.list-null').outerWidth(zwsj_width + difference);
                        }
                        dragTH.outerWidth(newWidth);
                        $('.' + body + '>li>div:nth-child(' + dragTH.attr('data-order') + ')').outerWidth(newWidth);
                        //表格hover内容事件
                        $('.' + body + ' li>div').mouseenter(function () {
                            $(this).siblings().addClass('hover-color');
                            $(this).addClass('hover-color');
                        }).mouseleave(function () {
                            $(this).removeClass('hover-color');
                            $(this).siblings().removeClass('hover-color');
                        });
                        if (!dragTH.attr('son')) {
                            return;
                        } else {
                            var dw = 0;
                            $('[son= ' + dragTH.attr('son') + ']').each(function () {
                                dw += $(this).outerWidth();
                            });
                            $('[parent=' + dragTH.attr('son') + ' ]').outerWidth(dw)
                        }
                    }
                })
                // 第三步，释放
                $(window).mouseup(function (e) {
                    if (!dragTH) {
                        return;
                    }
                    dragTH.mouseDown = false;
                });
                $('.' + arr[0] + ' li').mouseup(function (e) {
                    if ($(this).attr('parent')) {
                        return;
                    }
                    dragTH.mouseDown = false;
                    return _this.saveTableWidth && _this.saveTableWidth(arr, name);
                });
                $('.' + body).scroll(function (e) {
                    if (!arr) {
                        arr = [arr[0]]
                    };
                    arr.forEach((val, key) => {
                        $('.' + val).css('margin-left', -e.target.scrollLeft);
                    });
                })
            }
            registerTableDragEvent()
            $(window).resize(function () {
                $('[parent]').each(function () {
                    let w = 0;
                    $('[son=' + $(this).attr('parent') + ']').each(function () {
                        w += $(this).outerWidth();
                    });
                    $(this).outerWidth(w);
                });
            });
        },
        /*表头拖动处理结束*/
        bindDataForPrint() {
            //搞定 type=text, 同时如果checkbox,radio,select>option的值有变化, 也绑定一下, 这里忽略button  
            $("input,select option").each(function () {
                $(this).attr('value', $(this).val());
            });

            //搞定 type=checkbox,type=radio 选中状态  
            $("input[type='checkbox'],input[type='radio']").each(function () {
                if ($(this).attr('checked'))
                    $(this).attr('checked', true);
                else
                    $(this).removeAttr('checked');
            });

            //搞定select选中状态  
            $("select option").each(function () {
                if ($(this).attr('selected'))
                    $(this).attr('selected', true);
                else
                    $(this).removeAttr('selected');
            });

            //搞定 textarea  
            $("textarea").each(function () {
                $(this).html($(this).val());
            });

        },
        checkPlayerExist() {
            let _this = this;
            if (this.checkIE()) {
                try {
                    let ie_obj = new ActiveXObject("zapwebplayer.ZapWebPlayer.1");
                } catch (e) {
                    this.sayWarn('请先安装播放器，并允许浏览器加载');
                }
            } else {
                //暂无检测手段
            }
        },
        checkGXXPlayerExist() {
            let _this = this;
            if (this.checkIE()) {
                try {
                    var ocx = document.getElementById('gxxPlayOcx');
                    if (ocx.object == null) {
                        this.sayWarn('请先安装播放器，并允许浏览器加载');
                    }
                } catch (e) {
                    this.sayWarn('请先安装播放器，并允许浏览器加载');
                }
            }
        },
        addClassForDialog(type) {
            // 给弹窗最外层添加一个类名，方便控制
            var className = type + 'Class';
            $('.modal-content').addClass(className);

            if (!$('.modal-dialog').hasClass(type + '-dialog')) {
                $('.modal-dialog').addClass(type + '-dialog');
            } else {
                return;
            }
        },
        /* 三种通用提示工具的再封装 */
        sayError: function (word) {
            notification.error({
                message: word,
                title: '温馨提示'
            });
        },
        sayWarn: function (word) {
            notification.warn({
                message: word,
                title: '温馨提示'
            });
        },
        saySuccess: function (word) {
            notification.success({
                message: word,
                title: '温馨提示'
            });
        },
        /* 三种通用提示工具的结尾 */

        setPopover: function (ele) {
            // 定义提示弹出框行为, ele为已经设置了'data-toggle'属性为'popover'的元素
            ele.on("mouseenter", function () {
                var _this = this;
                clearTimeout(_this.timer);
                _this.timer = setTimeout(function () {
                    $('div').siblings(".popover").popover("hide");
                    $(_this).popover("show");
                }, 1000);

                $(this).siblings(".popover").on("mouseleave", function () {
                    $(_this).popover('hide');
                });
            }).on("mouseleave", function () {
                var _this = this;
                clearTimeout(_this.timer);
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide");
                    }
                }, 100);
                $(".popover").on("mouseleave", function () {
                    $('.popover').hide();
                });
            }).on('shown.bs.popover', function () {
                $('.title-content').css('max-height', '80px');
                $('.popover').mouseleave(function () {
                    $('.popover').hide();
                });
            });
        },
        reduceWord(aim, which, length) {
            /*
             *  参数说明
             *  --> aim: 需要设置弹出框的元素类名， 如'.jbxx span'
             *  --> which: 是aim的大类， 如'.jbxx' 
             *  --> length: 字符长度大于length才做提示弹窗的定义
             */
            let _this = this;
            $(aim).each(function () {

                if ($(this).text().length > length) {
                    $(this).attr('data-toggle', 'popover');
                    $(this).attr('data-placement', 'top');
                    _this.setPopover($(this));
                } else {
                    return;
                }
            });
            $(which).find($("[data-toggle='popover']")).popover({

                container: 'body',
                placement: 'bottom',
                html: 'true',
                content: function () {
                    return '<div class="title-content">' + $(this).text() + '</div>';
                },
                animation: false
            });
        },
        getFirstDayOfWeek: function (date) {
            var day = date.getDay() || 7;
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
        },
        timeCalculator: function () {
            let _this = this;
            let States = {

                //States内含三种时间算法
                status: 'last-week', //用以判断请求时时间处在哪种model
                'last-week': function (type, obj, propend, propstart, resolve) {
                    this.status = 'last-week';
                    var now = new Date();
                    var oneDayTime = 24 * 60 * 60 * 1000;
                    //显示周一
                    var MondayTime = +_this.getFirstDayOfWeek(now);
                    //显示周日
                    var SundayTime = MondayTime + 6 * oneDayTime;
                    //初始化日期时间
                    var monday = new Date(MondayTime);
                    var sunday = new Date(SundayTime);
                    sunday.setHours(23);
                    sunday.setMinutes(59);
                    sunday.setSeconds(59);
                    monday.setHours(0);
                    monday.setMinutes(0);
                    monday.setSeconds(0);
                    obj[propend] = Number(+sunday);
                    obj[propstart] = Number(+monday);
                    resolve({
                        type,
                        end: sunday,
                        now: monday,
                    });
                },
                'last-month': function (type, obj, propend, propstart, resolve) {
                    this.status = 'last-month';
                    var now = new Date();
                    now.setDate(1);
                    now.setHours(0);
                    now.setMinutes(0);
                    now.setSeconds(0);
                    var date = new Date();
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    var d = new Date(year, month, 0);
                    var end = new Date();
                    end.setDate(d.getDate());
                    end.setHours(23);
                    end.setMinutes(59);
                    end.setSeconds(59);
                    obj[propend] = Number(+end);
                    obj[propstart] = Number(+now);
                    resolve({
                        type,
                        end,
                        now
                    });
                },
                'last-past-of-time': function (type, obj, propend, propstart, resolve) {
                    this.status = 'last-past-of-time';
                    var now = new Date();
                    now.setHours(23);
                    now.setMinutes(59);
                    now.setSeconds(59);
                    var end = new Date();
                    end.setMonth(now.getMonth() - 3 + '');
                    end.setHours(0);
                    end.setMinutes(0);
                    end.setSeconds(0);
                    obj[propend] = Number(+now);
                    obj[propstart] = Number(+end);
                    resolve({
                        type,
                        end,
                        now
                    });
                }
            };
            let callback = {
                week(end, now) {},
                month(end, now) {},
                others(end, now) {},
            };
            return {
                calculate: function (type, obj, propend, propstart) {
                    /*
                     *  参数说明
                     *  --> type: 'last-week'，'last-month'，'last-past-of-time'三个字符串中的一个，对应States三种算法
                     *  --> obj: 目标对象， 
                     *  --> propend&propstart: 自定义的属性名，算法算出来的结果给予obj， 如obj[propend] = 结果
                     */
                    if (!callback) {
                        callback = {};
                    }
                    let timer = new Promise((resolve, reject) => {
                        States[type] && States[type](type, obj, propend, propstart, resolve);
                    });
                    timer.then((ret) => {
                        switch (type) {
                            case 'last-week':
                                callback.week(ret);
                                break;
                            case 'last-month':
                                callback.month(ret);
                                break;
                            case 'last-past-of-time':
                                callback.others(ret);
                                break;
                        }
                    });
                },
                setCallBack(cb) {
                    callback = cb;
                },
                getStatus: function () {
                    return States.status;
                },
                setStatus: function (sts) {
                    States.status = sts;
                }
            };
        },
        getRandom(much) {
            let arr = [];
            for (let i = 0; i < much; i++) {
                arr[i] = Math.floor(Math.random() * (9 - 0 + 1) + 0);
            };
            return arr.join('');
        },
        checkIE() {
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                return true;
            } else {
                return false;
            }
        },
        checkIE8: function () {

            if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
                return true;
            } else {
                return false;
            };
        },
        checkIE11: function () {

            if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "WOW64") {
                return true;
            } else {
                return false;
            };
        },
        getStorage(name) {

            if (storage && storage.getItem) {

                if (storage.getItem(name)) {
                    return JSON.parse(storage.getItem(name));
                } else {
                    return null;
                }
            } else {
                return null;
            }
        },
        setStorage(name, data, time, callback) {

            if (storage && storage.setItem) {
                storage.setItem(name, JSON.stringify(data), time || 0.5);
                return callback && callback();
            } else {
                throw error('storage is not be supported');
            };
        },
        deleteUndefinedOrNullProp(obj) {
            Object.keys(obj).forEach(function (prop) {

                //对VM中null / undefined属性进行过滤
                if (obj[prop] == undefined) {
                    obj[prop] = '';
                }
            });
        },
        addIcon(arr, operate) {

            // 深拷贝原始数据
            var dataSource = JSON.parse(JSON.stringify(arr));
            var res = [];

            // 每一层的数据都 push 进 res
            res.push(...dataSource);

            // res 动态增加长度
            for (var i = 0; i < res.length; i++) {
                var curData = res[i];
                this.deleteUndefinedOrNullProp(curData);
                operate(curData);

                // 如果有 children 则 push 进 res 中待搜索
                if (curData.childs) {
                    res.push(...curData.childs.map(d => {
                        return d;
                    }));
                }
            }
            return dataSource;
        }
    },
    format: {

        //日期转时间戳 dateTransToTime('2018-5-9') -> 1525795200000
        dateTransToTime(stringTime, end_flag) {
            // var s = stringTime.split(" ");
            // var s1 = s[0].split("-");
            var s1 = stringTime.split("-");
            var s2 = ["00", "00", "00"];
            // if (s2.length == 2) {
            //     s2.push("00");
            // }
            if (end_flag == true)
                s2 = ["23", "59", "59"];

            return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

            // 火狐不支持该方法，IE CHROME支持
            //var dt = new Date(stringTime.replace(/-/, "/"));
            //return dt.getTime();
        },

        //getTimeByDateStr('2018-5-9 14:20:20') -> 1525846820000
        getTimeByDateStr(stringTime) {
            var s = stringTime.split(" ");
            var s1 = s[0].split("-");
            var s2 = s[1].split(":");
            if (s2.length == 2) {
                s2.push("00");
            }

            return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

            // 火狐不支持该方法，IE CHROME支持
            //var dt = new Date(stringTime.replace(/-/, "/"));
            //return dt.getTime();
        },

        //formatDate(1525846820000) -> "2018-05-09 14:20:20"        
        formatDate(date, day) {
            if(date == '') {
                return ''
            }
            var d = new Date(date);
            var year = d.getFullYear();
            var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
            var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
            var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
            var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
            var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

            if (day) {
                return year + "-" + month + "-" + date + "";
            } else {
                return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
            }
        },

        //abc(24500) -> "00 : 00 : 24.5"
        formatDuring: function (mss) {
            var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = (mss % (1000 * 60)) / 1000;
            hours = hours < 10 ? ('0' + hours) : hours;
            minutes = minutes < 10 ? ('0' + minutes) : minutes;
            seconds = seconds < 10 && seconds >= 0 ? ('0' + seconds) : seconds;
            return hours + " : " + minutes + " : " + seconds;
        },
    },
    reg: {

        //违背规则的字段提示
        alertText: {
            'illegal_word': '请输入合法字符',
            'number': '请输入数字',
            'require': '字段不能为空'
        },

        //非法字符
        illegal_word: /[`~!.\-_;:,""@\?#$%^&*+<>\\\|{}\/'[\]]/img,

        //检验数字类字段用以下两个正则
        minus: /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/, //校验负数
        positive: /^\d+(\.\d+)?$/, //校验正数,

        //检验非空
        require: /^[\s\S]*.*[^\s][\s\S]*$/,

        //正整数
        int: /^[0-9]\d*$/,
    }
};
export {
    Gm
};