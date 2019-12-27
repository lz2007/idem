/**
 * @Author: zhengwenlong
 * @prop {String} id 唯一标识符（表格id）
 * @prop {object} tableBody 界面表格controller对象，这个对象由页面自身定义，然后根据自身需要添加相应的属性和操作函数，可参考配置系统--用户管理tableBody_yhgl表格定义
 * @event {Function} tableDataFnc 给表格赋值的函数
 * @event {Function} loading 表格loading操作的函数
 * @event {Function} page 保存当前页面表格的分页情况
 * @event {Function} destroy 将传入的表格对象置空
 * 
 */
require('/apps/common/common-table-index.css');
let {
    languageSelect
} = require('/services/configService');
let storage = require('/services/storageService.js').ret;
(function ($, window, document) {
    var pluginName = 'tableIndex';
    var defaults = {
        'id': 'table-index', //表格id
        'tableBody': {}, //界面表格controller对象
    };

    var tableIndex = function (options) {
        this.settings = $.extend({}, defaults, options);
        this.defaults = defaults;
    };

    tableIndex.prototype = {
        init: function () {
            var that = this;
            if (!that.settings.tableBody) {
                return;
            }
            that.watchFnc(that.settings.tableBody);
        },
        setForm() { //调整表格界面自适应
            let that = this;
            let _this = that.settings.tableBody;
            let hg = $('#' + that.settings.id).find('.table-index-tbody').get(0);
            if (hg && (hg.clientHeight < hg.scrollHeight)) {
                _this.paddingRight = 17;
            } else if (hg && !(hg.clientHeight < hg.scrollHeight)) {
                _this.paddingRight = 0;
            }
        },
        popoverX() { //title的bootstrap tooltip
            let timer = {};
            $("[rel=drevil]").popoverX({
                trigger: 'manual',
                container: 'body',
                placement: 'top',
                //delay:{ show: 5000},
                //viewport:{selector: 'body',padding:0},
                //title : '<div style="font-size:14px;">title</div>',  
                html: 'true',
                content: function () {
                    return '<div class="title-content">' + $(this).attr('tdval') + '</div>';
                },
                animation: false
            }).on("mouseenter", function () {
                var _this = this;
                timer = setTimeout(function () {
                    $('div').siblings(".popover").popoverX("hide");
                    $(_this).popoverX("show");
                }, 500);
                $(this).siblings(".popover").on("mouseleave", function () {
                    $(_this).popoverX('hide');
                });
            }).on("mouseleave", function () {
                var _this = this;
                clearTimeout(timer);
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popoverX("hide");
                    }
                }, 100);
                $(".popover").on("mouseleave", function () {
                    $('.popover').hide();
                });
            }).on('shown.bs.popover', function () {
                $('.popover').mouseleave(function () {
                    $('.popover').hide();
                });
            });
        },
        watchFnc: function (tableBody) { //监听函数
            let that = this;
            let _this = tableBody;
            _this.$watch('checked.length', function (newV) {
                var currentPageKeys = _this.data
                    .map(function (record) {
                        return record[_this.key];
                    });
                _this.isAllChecked = currentPageKeys
                    .filter(function (key) {
                        return _this.checked.contains(key);
                    })
                    .length == currentPageKeys.length;
            });
            _this.$watch('data', function (v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
            });
            _this.$watch('data.length', function (v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
            });
            _this.$watch('loading', function (v) {
                if (v) {
                    _this.data = [];
                } else {
                    that.setForm();
                    that.popoverX();
                    if (that.settings.tableBody.isColDrag && !that.settings.tableBody.debouleHead)
                        that.makeTableDrag('table-index-thead', 'table-index-tbody');
                    if (that.settings.tableBody.debouleHead && that.settings.tableBody.debouleHead.length > 0)
                        that.makeTableDrag('table-index-thead', 'table-index-tbody', that.settings.tableBody.debouleHead);
                }
            });
            $(window).resize(function () { //监测浏览器发生大小变化
                that.setForm();
            });
        },
        tableDataFnc(data) { //表格数据赋值
            let that = this;
            that.settings.tableBody.data = data;
            that.setForm();
            that.popoverX();
            $('.table-index-thead>li').attr('style', '');
            $('.table-index-tbody .list-null').attr('style', '');
            that.rebackTableWidth();
            if (that.settings.tableBody.isColDrag && !that.settings.tableBody.debouleHead)
                that.makeTableDrag('table-index-thead', 'table-index-tbody');
            if (that.settings.tableBody.debouleHead && that.settings.tableBody.debouleHead.length > 0)
                that.makeTableDrag('table-index-thead', 'table-index-tbody', that.settings.tableBody.debouleHead);
        },
        loading(result) {
            this.settings.tableBody.loading = result;
        },
        page(currentPage, prePageSize) { //保存当前页面的分页情况
            this.settings.tableBody.currentPage = currentPage;
            this.settings.tableBody.prePageSize = prePageSize;
        },
        makeTableDrag(head, body, arr) { //表格列拖动
            let that = this;

            function isNullOrUndefined(obj) {
                if (typeof (obj) == "undefined" || obj == null || obj == false) {
                    return true;
                }
                return false;
            }

            function registerTableDragEvent() {

                var dragTH; //记录拖拽的列
                //第一步按下
                $('.' + head + ' li').mousedown(function (e) {

                    if ($(this).attr('parent')) {
                        return;
                    }
                    e = e || window.event;
                    if (e.offsetX > $(this).innerWidth() - 10) {
                        dragTH = $(this);
                        dragTH.mouseDown = true;
                        dragTH.oldX = e.pageX || e.clientX;
                        dragTH.oldWidth = $(this).innerWidth();
                        dragTH.liOldWidth = $('.' + body + '>li').innerWidth();
                        if ($('.' + body).find('.list-null').length > 0)
                            dragTH.listNullWidth = $('.' + body).find('.list-null').innerWidth();
                    }
                });
                //第二步 拖动
                $('.' + head + ' li').mousemove(function (e) {
                    if ($(this).attr('parent')) {
                        return;
                    }
                    //改鼠标样式

                    //显示与隐藏-资产统计里面的解释问号按钮
                    if ($("#zctj-jjb-pfl")) {
                        if ($("#zctj-jjb-pfl").width() > (languageSelect == "en" ? 205 : 140))
                            $("#zctj-jjb-pfl span").css({
                                "display": "inline-block"
                            });
                        else
                            $("#zctj-jjb-pfl span").hide();
                    }
                    if ($("#zctj-jjb-ccl")) {
                        if ($("#zctj-jjb-ccl").width() > 128)
                            $("#zctj-jjb-ccl span").css({
                                "display": "inline-block"
                            });
                        else
                            $("#zctj-jjb-ccl span").hide();
                    }

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
                        dragTH.outerWidth(newWidth);
                        if ($('.' + body).find('.list-null').length > 0) {
                            let minWidth = that.settings.tableBody.minWidth ? that.settings.tableBody.minWidth : 25; //如果没有定最小列宽默认是25
                            let dif = (newWidth - minWidth > 0) ? (newWidth - dragTH.oldWidth) : (minWidth - dragTH.oldWidth + 1);
                            let list_null_width = dragTH.listNullWidth + dif;
                            // let list_null_width = dragTH.listNullWidth + difference;
                            $('.' + body + '>li').outerWidth(list_null_width);
                        } else {
                            $('.' + body + '>li>div:nth-child(' + dragTH.attr('data-order') + ')').outerWidth(newWidth);
                        }
                        if (!dragTH.attr('son')) {
                            // return;
                        } else {
                            var dw = 0;
                            $('[son= ' + dragTH.attr('son') + ']').each(function () {
                                dw += $(this).outerWidth();
                            });
                            $('[parent=' + dragTH.attr('son') + ' ]').outerWidth(dw);
                        }
                    }
                });
                // 第三步，释放
                $(window).mouseup(function () {
                    if (dragTH && dragTH.mouseDown) {
                        dragTH.mouseDown = false;
                    }
                    that.setForm();
                });
                $('.' + head + ' li').mouseup(function (e) {
                    that.setForm();
                    if ($(this).attr('parent')) {
                        return;
                    }
                    dragTH.mouseDown = false;
                    if (!arr) arr = [head];
                    that.saveTableWidth(arr);
                });
                $('.' + body).scroll(function (e) {
                    // $('.' + head).css('margin-left', -e.target.scrollLeft);
                    // $('.' + head).css('margin-left', -e.target.scrollLeft);
                    if (!arr) {
                        arr = [head];
                    };
                    arr.forEach((val, key) => {
                        $('.' + val).css('margin-left', -e.target.scrollLeft);
                    });
                });
                //表格hover内容事件
                $('.' + body + ' li .tbody').mouseenter(function () {
                    $(this).siblings().addClass('hover-color');
                    $(this).addClass('hover-color');
                }).mouseleave(function () {
                    $(this).removeClass('hover-color');
                    $(this).siblings().removeClass('hover-color');
                });
            }
            registerTableDragEvent();
            $(window).resize(function () {
                let dragStorageName = that.settings.tableBody.dragStorageName;
                let obj = storage.getItem(dragStorageName);
                if (!obj) {
                    return;
                }
                $('[parent]').each(function () {
                    let w = 0;
                    $('[son=' + $(this).attr('parent') + ']').each(function () {
                        w += $(this).outerWidth();
                    });
                    $(this).outerWidth(w);
                });
            });
        },
        saveTableWidth(arr) {
            /*
             * 该方法保存所有表头的长度数据
             * 因为组件ondispose访问不到原表格DOM
             * 所以默认在makeTableDrag中的表头mouseup事件中保存
             */
            let that = this;
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
            let dragStorageName = that.settings.tableBody.dragStorageName;
            if (dragStorageName)
                storage.setItem(dragStorageName, obj, 0.5);
            // return obj;
        },
        rebackTableWidth() {
            /*
             * 该方法切换模块还原上次操作的表格长度 
             */
            let that = this;
            let dragStorageName = that.settings.tableBody.dragStorageName;
            let obj = storage.getItem(dragStorageName);
            if (!obj) {
                return;
            }
            let head = 'table-index-thead',
                body = 'table-index-tbody',
                arr = [];
            if (!that.settings.tableBody.debouleHead) {
                arr[0] = head;
            } else {
                arr = [].concat(that.settings.tableBody.debouleHead);
            }
            //第一步复原表头
            let headWidth = 0; //记录表头总长度
            arr.forEach((val, key) => {
                $('.' + val + ' li').each(function (value, keyli) {
                    $(this).outerWidth(obj['head' + key][value]);
                    if (key == 0) headWidth = headWidth + obj['head' + key][value];
                });
            });
            //第二步复原表格
            if (!$('.' + body + ' li').length) {
                return;
            } else if ($('.' + body).find('.list-null').length > 0) { //如果表格没有数据
                $('.' + body).find('.list-null').outerWidth(headWidth - 1);
                return;
            } else {
                $('.' + body + ' li').each(function (val, key) {
                    $(this).find('.tbody').each(function (value, keydiv) {
                        $(this).outerWidth(obj['head0'][value]);
                    });
                });
            }
        },
        destroy() {
            let that = this;
            that.settings.tableBody = {};
        }
    };

    $.tableIndex = function (opt) {
        var tableindex = new tableIndex(opt);
        tableindex.init();
        return tableindex;
    };
}(jQuery, window, document));