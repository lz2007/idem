/**
 * 列宽拖拽浮窗表格组件
 * @param {Array}  表格数据............data 
 * @param {Boolean}  加载蒙版是否覆盖表格............loading
 * @param {Boolean} 表格是否需要列宽拖拽功能............isTableDrag,默认为false，不需要
 * @param {String}  表格自适应最小宽度的盒子选择器............boxSelector,可以不写，则有div.mask遮罩层hack右边空缺
 * @param {String}     表格本地缓存数据命名前缀............storageNamePrefix,默认值是ms-table-drag
 * @param {Function}     表格单元格点击事件发射器............actions(type, col, record, index)
 * @param {Function}  表格单元格选中事件............onSelect(record.$model, checked, this.selection.$model)
 * @param {Function}  表格单元格选中改变事件............selectionChange(checked, selection.$model)
 * @param {Function}  表格单元格全选事件............onSelectAll(e.target.checked, selection.$model)
 * 使用方法： <ms-table-drag :widget="{data:@data,loading:@loading, isTableDrag: true, 
 *            storageNamePrefix: @name,boxSelector: @boxSelector, actions:@actions,
 *            onSelect:@handleSelect,onSelectAll:@handleSelectAll,
 *            selectionChange:@handleSelectionChange}"></ms-table-drag>
 *
 * 拖拽浮窗单元格插槽
 * @param {String}  表格是否开启选择框功能............:widget={type: 'selection'} 则开启 
 * @param {String}  表格表头标题............title
 * @param {String}  表格表头下该列单元格数据............dataIndex 数据源、td标识符  
 * 注 dataIndex:'orgName',将去拿data中某个元素element的element.orgName,并且保证每个dataIndex不为空字符串
 * @param {Boolean} 表格表头下该列单元格数据是否需要浮窗功能............isPopover,默认为false，不需要
 * @param {String}  表格表头所跨行数............rowspan,默认为1
 * @param {String}  表格表头所跨列数............colspan,默认为1
 * @param {Boolean}  表格表头下是否有第二级表头............isInnerTable,默认为false
 * @param {Boolean}  表格表头是否是第二级表头............isSecondRow,默认为false
 * @param {Boolean}  是否删除表格表头下该列所有该列单元格内容............isHide,默认为false
 * @param {Boolean}  是否删除表格表头及下列单元格............isHideTd,默认为false 注，该功能ie8下被禁用，原因是ie8的Object.defineProperty不支持对原生对象使用
 * @param {string}     表格单元格点击事件监听器............handle(@param {string}'selfDefineType')
 * 使用方法:     <ms-table-header :widget="{title:'操作',dataIndex:'index',
 *               rowspan:'2',colspan:'1', isSecondRow: false, 
 *               isInnerTable: false, isPopover: true,
 *               isHide: true, isHideTd: false}">
 *                   FBI warning 
 *                   由于这里插入的html采用的是ms-html指令,里面不能使用外部controller的变量
 *                   如果确实需要使用的话，请在这个button(你使用的标签)套个中转的controller，接收外部变量
 *                   在common-ms-table-drag.html中已经限定每一列单元格表头的类名col-${index},
 *                   注意是由所有td决定index，不可见的td也会占用col-${index}
 *                   注意由于table宽度弹性适应，所以如果设置百分比宽度，尽量不要全部设置，让一些col自适应宽度
 *                   <button type="button" class="btn btn-danger btn-xs" :click="handle('delete')">删除</button>
 *             </ms-table-header>
 * 
 * author: fjr
 */



import avalon from "avalon2";
import "ane";
let storage = require('/services/storageService.js').ret;
require('./common-ms-table-drag.less');
export const name = "ms-table-drag";


avalon.component(name, {
    soleSlot: 'header',
    template: __inline('./common-ms-table-drag.html'),
    defaults: {
        boxSelector: '',

        columns: [],
        data: [],
        key: 'index',
        hideTdCount: 0,

        isTableDrag: false,
        isDoubleRow: false,
        emitTemplateChange: false,
        isHideSelectionTd: false,
        loading: false,
        needSelection: false,
        checked: [],
        selection: [],
        isLowIeVersion: false,
        isAllChecked: false,

        isNeedInitTable: false,

        onSelect: avalon.noop,
        onSelectAll: avalon.noop,
        selectionChange: avalon.noop,

        storageNamePrefix: '',
        tdWidthArr: [],
        secondTdWidthArr: [],
        isDrag: false,

        isStartDrag: false,

        $originX: Number,
        $originWidth: Number,
        $originTableWidth: Number,
        $originSearchBoxWidth: Number,

        $element: '',
        $elementColIndex: 0,
        $popoverElement: '',
        $isHidePopover: false,

        handleCheckAll(e) {
            const data = this.data;
            if (e.target.checked) {
                data.forEach(record => {
                    this.checked.ensure(record[this.key]);
                    this.selection.ensure(record);
                });
            } else {
                this.checked.removeAll(el => data.map(record => record[this.key]).indexOf(el) !== -1);
                this.selection.removeAll(el => data.indexOf(el) !== -1);
            }
            this.selectionChange(this.checked, this.selection.$model);
            this.onSelectAll(e.target.checked, this.selection.$model);
        },

        handleCheck(checked, record) {
            if (checked) {
                this.checked.ensure(record[this.key]);
                this.selection.ensure(record);
            } else {
                this.checked.remove(record[this.key]);
                this.selection.remove(record);
            }
            this.selectionChange(this.checked, this.selection.$model);
            this.onSelect(record.$model, checked, this.selection.$model);
        },

        actions: avalon.noop,
        handle(type, col, record, $index, ...extra) {
            let text = '';
            if (record[col.dataIndex]) {
                text = record[col.dataIndex].$model || record[col.dataIndex];
            }
            this.actions(type, text, record.$model, $index, ...extra);
        },


        isDragFn(evt) {
            if (!this.isTableDrag) return;
            if (this.isStartDrag) return;

            let reg = /inner-table/g;
            if (reg.test(evt.target.className)) return;
            if (evt.target.tagName != 'TD') return;
            let ele = evt.target;
            let $this = $(evt.target);

            let offsetX = evt.offsetX;
            let targetWidth = $this.outerWidth();

            if (targetWidth - 10 < offsetX) {

                this.isDrag = true;
                $this.css({
                    'cursor': 'ew-resize',
                    'user-select': 'none'
                });
            } else {
                this.isDrag = false;
                $this.css({
                    'cursor': 'default',
                    'user-select': 'text'
                });
            }
        },

        dragStart(evt) {
            if (!this.isTableDrag) return;
            let reg = /inner-table/g;
            if (reg.test(evt.target.className)) return;
            if (evt.target.tagName != 'TD') return;
            if (!this.isDrag) return;

            let $this = $(evt.target);
            if (this.needSelection) {
                this.$elementColIndex = +$this.attr('tdindex') + 1;
            } else {
                this.$elementColIndex = +$this.attr('tdindex');
            }
            // $this = $($('col')[index]);
            this.$originX = evt.pageX;
            this.$originWidth = $this.outerWidth();
            this.$originTableWidth = $('table.result').outerWidth();
            this.$element = $this;

            this.isDrag = true;
            this.isStartDrag = true;
        },

        dragMove(evt) {
            if (!this.isTableDrag) return;
            if (!this.isDrag || !this.isStartDrag) return;
            let $this = $(evt.target);
            if (this.$element) {
                $this = this.$element;
            }

            let newX = evt.pageX;
            let moveX = newX - this.$originX;
            let newWidth = this.$originWidth + moveX;

            let $colElement = $($('col')[this.$elementColIndex]);
            if (newWidth <= 15 && moveX < 0) {
                newWidth = 15;
                $colElement.outerWidth(newWidth);
                this.dragEnd();
                return;
            }

            if (newWidth == this.$originWidth) return;
            $colElement.outerWidth(newWidth);
            $this.outerWidth(newWidth);

            if (moveX > 0) {
                // $this.outerWidth(newWidth);
                $('table.result').outerWidth(this.$originTableWidth + moveX);
            } else if ($('table.result').outerWidth() > this.$originSearchBoxWidth) {
                // $this.outerWidth(newWidth);
                $('table.result').outerWidth(this.$originTableWidth + moveX);
            }

        },

        dragEnd(evt) {
            if (!this.isTableDrag) return;
            this.storageTableWidth();

            this.isDrag = false;
            this.isStartDrag = false;
            this.$isSonTable = false;
        },
        // setTableData(data) {
        //     this.data = data;
        //     this.reInitTableWidth();
        //     this.loading = false;

        // },
        // clearTable() {
        //     this.data = [];
        //     this.loading = true;
        //     // $('.popover').hide();
        // },

        // cleanStorageTableWidth() {
        //     this.tdWidthArr = [];
        //     this.secondTdWidthArr = [];
        // },
        storageTableWidth() {
            this.tdWidthArr = [];
            this.secondTdWidthArr = [];
            avalon.each($('.table-header>td'), (i, el) => {
                this.tdWidthArr.push($(el).outerWidth());
            });
            avalon.each($('.table-second-header>td'), (i, el) => {
                this.secondTdWidthArr.push($(el).outerWidth());
            });

            if (!this.storageNamePrefix) {
                this.storageNamePrefix = name;
            }
            storage.setItem(this.storageNamePrefix + '-tdWidthArr', this.tdWidthArr);
            storage.setItem(this.storageNamePrefix + '-secondTdWidthArr', this.secondTdWidthArr);
        },
        reInitTableWidth() {
            if (!this.storageNamePrefix) {
                this.storageNamePrefix = name;
            }
            let tdWidthArr = storage.getItem(this.storageNamePrefix + '-tdWidthArr');
            let secondTdWidthArr = storage.getItem(this.storageNamePrefix + '-secondTdWidthArr');
            let $cols = $('col');

            if (tdWidthArr) {
                // let tableWidth = tdWidthArr.reduce(reducer);
                // $('table.result').outerWidth(tableWidth);
                avalon.each($('.table-header>td'), (index, el) => {
                    $(el).outerWidth(tdWidthArr[index]);
                });

            }

            if (secondTdWidthArr) {
                avalon.each($('.table-second-header>td'), (index, el) => {
                    let colTdIndex = $(el).attr('tdindex');
                    if (this.needSelection) {
                        colTdIndex = +colTdIndex + 1;
                    }
                    $($cols[colTdIndex]).outerWidth(secondTdWidthArr[index]);
                });

            }

        },

        popover(evt, isPopover) {
            if (!isPopover) return;
            if (evt.target.tagName != 'TD') return;
            if (evt.target.className == 'popover-content') return;
            evt.cancelBubble = true;
            let $this = $(evt.target);

            let promise = new Promise((resolve, reject) => {
                if (this.$popoverElement && this.$popoverElement[0] != $this[0]) {
                    let tmpElement = this.$popoverElement;
                    tmpElement.popoverX('hide');
                    this.$isHidePopover = false;
                }

                resolve();

            });

            promise.then(
                () => {
                    this.$popoverElement = $this;
                    this.$popoverElement.popoverX({
                        // trigger: 'manual',
                        trigger: 'hover',
                        container: 'body',
                        placement: 'top',
                        // delay: {
                        //     show: 5000
                        // },
                        //viewport:{selector: 'body',padding:0},
                        //title : '<div style="font-size:14px;">title</div>',  
                        html: 'true',
                        content: function () {
                            return '<div class="title-content">' + $this.text() + '</div>';
                        },
                        animation: false
                    });
                    setTimeout(() => {
                        this.$popoverElement.popoverX('show');
                        this.$isHidePopover = true;

                    }, 500);
                }
            )



        },

        hidePopover(evt, isPopover) {
            if (!isPopover) return;
            let $this = $(evt.target);
            let el = evt.target;
            evt.cancelBubble = true;
            let isHide = false;
            let x = evt.clientX;
            let y = evt.clientY;
            let divx1 = el.offsetLeft;
            let divy1 = el.offsetTop;
            let divx2 = el.offsetLeft + el.offsetWidth;
            let divy2 = el.offsetTop + el.offsetHeight;
            if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
                this.$isHidePopover = false;
            }
            let promise = new Promise((resolve, reject) => {

                let self = this;
                $('.popover').hover((evt) => {
                    evt.stopPropagation();
                    this.$popoverElement.focus();

                }, (evt) => {
                    evt.stopPropagation();
                    let self = this;
                    $('.popover').hide();

                });
                resolve();
            });
            promise.then(
                setTimeout(() => {
                    if ($this[0] == this.$popoverElement[0] && (x < divx1 || x > divx2 || y < divy1 || y > divy2)) {
                        this.$isHidePopover = false;
                    }
                    if (!this.$isHidePopover && !$(".popover:hover").length) {
                        $('.popover').hide();
                    }
                }, 600)
            );
        },

        convertTableTemplateToDom() {

            const descriptor = getChildTemplateDescriptor(this);
            let self = this;
            descriptor.forEach(column => {
                if (column.props.type == 'selection') {
                    this.key = column.props.dataIndex || this.key;
                    this.isHideSelectionTd = column.props.isHideTd || false;
                    this.needSelection = true;
                    return false;
                }
            });
            descriptor.forEach(column => {
                if (column.props.colspan > 1 || column.props.rowspan > 1) {
                    this.isDoubleRow = true;
                    return false;
                }
            });
            descriptor.forEach(column => {
                if (Boolean(column.props.isInnerTable)) {
                    this.isDoubleRow = true;
                    return false;
                }
            });
            this.columns = getColumnConfig(descriptor);
        },

        onInit(event) {
            // if (ieVersion < 9 && ieVersion != -1 && ieVersion != 'edge') {
            //     this.isLowIeVersion = true;
            // }
            // hack 浏览器加载表格慢
            $('.no-result-table').hide();
            // $('.table-header div.ane-checkbox:nth-child(1)').hide();            
            this.convertTableTemplateToDom();
            let ieVersion = IEVersion();

            let self = this;
            if (this.$render) {
                avalon.each(this.$render.directives, (index, action) => {
                    if (action.is && action.value && typeof action.value.isHideTd != 'undefined') {

                        if (ieVersion < 9 && ieVersion != -1 && ieVersion != 'edge') return;
                        Object.defineProperty(this.$render.directives[index], "value", {
                            //ie8下不能运行。。。
                            set: function (newValue) {
                                avalon.each(self.columns, (idx, val) => {
                                    if (newValue && val.dataIndex == newValue.dataIndex) {
                                        //不明白为什么会跑三次
                                        self.columns[idx].isHideTd = newValue.isHideTd;
                                        self.storageTableWidth();
                                        // self.reInitTableWidth();
                                    }
                                })
                            },
                            enumerable: true,
                            configurable: true
                        });
                    }
                });
            }

            this.$watch('checked.length', (newV) => {
                const selectedItemKeys = this.data.map(record => record[this.key]);
                this.isAllChecked = selectedItemKeys
                    .filter(key => this.checked.contains(key))
                    .length == selectedItemKeys.length;
                // const currentPageKeys = this.getCurrentPageData()
                //     .map(record => record[this.key]);
                // this.isAllChecked = currentPageKeys
                //     .filter(key => this.checked.contains(key))
                //     .length == currentPageKeys.length;
            });
            this.$watch('data', (v) => {
                this.isAllChecked = false;
                this.checked = [];
                this.selection = [];
            });
            this.$watch('data.length', v => {
                this.isAllChecked = false;
                this.checked = [];
                this.selection = [];
            });

        },
        onReady(event) {
            this.reInitTableWidth();
            let self = this;
            let boxSelector = this.boxSelector;
            if (boxSelector) {
                $(window).on('resize', () => {
                    self.$originSearchBoxWidth = $(boxSelector).outerWidth();

                    $('table.result').css({
                        'min-width': self.$originSearchBoxWidth + 'px'
                    });
                });

                self.$originSearchBoxWidth = $(boxSelector).outerWidth();

                $('table.result').css({
                    'min-width': self.$originSearchBoxWidth + 'px'
                });
            }
            $('.table-header div.ane-checkbox:nth-child(1)').hide();
        },
        onDispose(vm, el) {}
    }
});

function getChildTemplateDescriptor(vmodel, render = vmodel.$render) {
    if (!render) {
        return [];
    }
    if (typeof render.directives == 'undefined') {
        return [];
    }
    return render.directives.reduce((acc, action) => {
        if (action.is) {

            let actionArrayElement = {
                is: action.is,
                props: action.value,
                inlineTemplate: action.fragment,
                children: getChildTemplateDescriptor(vmodel, action.innerRender || {
                    directives: []
                })
            };


            acc.push(actionArrayElement);
        }
        return acc;
    }, []);
}

function getColumnConfig(descriptor, level = 1) {
    return descriptor.reduce((acc, column) => {
        if (column.is != 'ms-table-header') return acc;
        if (column.props.type == 'selection') {
            return acc;
        }
        if (column.props.type == 'index') {
            acc.push({
                title: column.props.title,

                dataIndex: '',
                template: '{{$index + 1}}'
            });
            return acc;
        }

        let inlineTemplate = column.inlineTemplate;
        inlineTemplate = inlineTemplate.replace(/(ms-|:)skip="[^"]*"/g, '');
        inlineTemplate = inlineTemplate.replace(/<\s*ms-table-header[^>]*>.*<\/\s*ms-table-header\s*>/g, '');
        inlineTemplate = inlineTemplate.replace(/(ms-|:)click="@?handle\(([^"]*)\)"/g, ($0, $1, $2, $3) => {
            return `${$1}click="handle(${$2},)"`.replace(/,/, ', col, record, $index,').replace(/,\)/, ')');
        });
        if (inlineTemplate) {
            let tmp = inlineTemplate;
            inlineTemplate = inlineTemplate.split('');
            inlineTemplate.splice(tmp.indexOf('>'), 0, ` :if="${!Boolean(column.props.isHide) || false}" `);
            inlineTemplate = inlineTemplate.join('');
        }
        acc.push({
            title: column.props.title,
            dataIndex: column.props.dataIndex || '',
            isPopover: Boolean(column.props.isPopover),
            colspan: column.props.colspan || 1,
            rowspan: column.props.rowspan || 1,
            isInnerTable: Boolean(column.props.isInnerTable) || false,
            isHide: Boolean(column.props.isHide) || false,
            isHideTd: Boolean(column.props.isHideTd) || false,
            isSecondRow: Boolean(column.props.isSecondRow) || false,
            template: /^\s*$/.test(inlineTemplate) ? `<span :if="${!Boolean(column.props.isHide) || false}">{{record.` + column.props.dataIndex + '}}</span>' : inlineTemplate
        });
        let accConcatAccChild = acc.concat(getColumnConfig(column.children, level + 1));
        return accConcatAccChild;
    }, []);
}

const reducer = (accumulator, currentValue) => accumulator + currentValue;
let throttle = function (action, delay = 300) {
    let last = 0;
    return function () {
        let curr = +new Date()
        if (curr - last > delay) {
            return action.apply(this, arguments);
            last = curr;
        }
    }
    // let timer;
    // return (...args) => {
    //     if (!timer) {
    //         setTimeout(() => timer = null, delay);
    //         return action.apply(this, args);
    //     }
    // };
};

//自建的过滤器 节流
avalon.filters.throttle = (str, delay = 300) => {
    return throttle(str, delay);
};

function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return 7;
        } else if (fIEVersion == 8) {
            return 8;
        } else if (fIEVersion == 9) {
            return 9;
        } else if (fIEVersion == 10) {
            return 10;
        } else {
            return 6; //IE版本<=7
        }
    } else if (isEdge) {
        return 'edge'; //edge
    } else if (isIE11) {
        return 11; //IE11  
    } else {
        return -1; //不是ie浏览器
    }
}