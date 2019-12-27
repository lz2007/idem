/*
 * @Author: mikey.zhaopeng 
 * @Date: 2018-09-20 10:40:49 
 * @Last Modified by: mikey.xuanyanqing
 * @Last Modified time: 2019-09-11 17:55:49
 */
 
/**
 *  ms-comtable
 * @param data array 表格数据
 * @param actions object 表格操作回调
 * @param onChange object 表格单选多选回调
 * @param panelCss object 表格样式
 * @param current number 表格数据  作用于表格序号
 * @param pageSize number 表格数据 作用于表格序号
 * @param loading boolean 表格数据 loading提示
 * ms-comtable-header
 * @param isHide boolean 是否显示
 * @param popover string 表格是否启用popover功能
 * @param title string 表格表头内容
 * @param colwidth string 表格宽度 咱只支持 百分比
 * @param handle object 表格操作回调
 * @param dataIndex string 不知道怎么描述 （data 数据里的对象的 key）
 * @param type string {type:selection} 表格显示多选 || {type:index} 表格序号  ms-comtable 传入current && pageSize 可自动排序序号
 * 
 * 
    html
    <ms-comtable :widget="{current:@pagination.current,pageSize:@pagination.pageSize,loading:@loading,data:@list,actions:@actions,onChange:selectChange,panelCss:{marginTop: 42,height: 700}}">
        <ms-comtable-header :widget="{dataIndex:'id',type:'selection',colwidth:'5%'}"></ms-comtable-header>
        <ms-comtable-header :widget="{title:'序号',type:'index',colwidth:'5%',popover:true}"></ms-comtable-header>
        <ms-comtable-header :widget="{title:'操作',colwidth:'10%'}">
            <button type="button" class="btn btn-danger btn-xs" :click="handle('delete')">修改</button>
            <button type="button" class="btn btn-danger btn-xs" :click="handle('delete')">删除</button>
        </ms-comtable-header>
        <ms-comtable-header :widget="{title:'姓名',dataIndex:'address',colwidth:'10%',popover:true}"></ms-comtable-header>
        <ms-comtable-header :widget="{title:'性别',dataIndex:'province',colwidth:'10%',isHide:false,popover:true}"></ms-comtable-header>
        <ms-comtable-header :widget="{title:'人员类型',colwidth:'10%',popover:true}">
            <span :skip>{{record.name}}</span>
        </ms-comtable-header>
    </ms-comtable>

    js
    import '../common/common-ms-table/common-ms-table';
    
    loading: false,
        // 表格
    list: avalon.range(20).map(n => ({
        id: n,
        name: '老狼' + n,
        address: '深山',
        province: '老林',
        checked: false
    })),
    // 表格-操作回调
    actions(type, text, record, index) {
        if (type == 'delete') {
            this.list.removeAll(el => el.id == record.id);
            message.success({
                content: '删除成功'
            });
        }
    },
    // 表格-选择回调
    selectChange(type, data) {
        // console.log(type)
        // console.log(data)
        // console.log(this.list)
    },

    // 分页
    pagination: {
        total: 100,
        pageSize: 20,
        current: 1
    },
 */

import './common-ms-table.less'
let {
    languageSelect
} = require('/services/configService');

let unwatch, popoverMove = false;

avalon.component('ms-comtable-header', {
    template: '<th><slot /></th>',
    soleSlot: 'content',
    defaults: {
        content: '',
        col: ''
    }
});

avalon.component('ms-table-checkbox', {
    template: `<i class="fa" :css="[checkboxStyle,(config.checked?checkStyle:uncheckStyle)]" :click="@chage | stop | prevent" :class="[(config.checked?'fa-check-square checked':'fa-square-o')]"></i>`,
    defaults: {
        onInit(e) {},
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#0078d7'
        },
        uncheckStyle: {
            color: '#cccccc'
        },
        onChang: avalon.noop,
        chage(event) {
            console.log(this.config.hasOwnProperty('checked'))
            if (this.config.hasOwnProperty('checked')) {
                this.config.checked = !this.config.checked;
                this.onChang(this.config);
            } else {
                avalon.error('ms-gdkl-checkbox组件 config 参数未传入checked');
            };
        }
    }
});


/**
 *  @prop {Array} colwidth 列表宽度
 * 
 */

avalon.component('ms-comtable', {
    soleSlot: 'header',
    template: `<div>
                <div class="common-list-panel" :css="panelCss" :class="[(isdown?'unselect':'')]">
                    <div class="common-list-header-wrap">
                        <ul class="common-list-header" :mouseleave="headermouseleave($event)" :mousemove="headermove($event)" :css="{'margin-left':marginLeft,paddingRight:paddingRight}">
                            <li :for="($index,el) in @columns" :if="!el.isHide" :mousedown="headerdown($event, $index)" :mouseup="headerup($event,$index)" :class="[((($index+1)==columns.length && @ispaddingRight)?'last-item':'')]" :css="{width:el.colwidth}">
                                <span :if="el.title">{{el.title}}</span>                                
                                <span :if="!el.title"><i class="fa" :css="[checkboxStyle,(allChecked?checkStyle:uncheckStyle)]" :click="@selectAll | stop | prevent" :class="[(allChecked?'fa-check-square checked':'fa-square-o')]"></i></span>
                            </li>
                        </ul>
                    </div>
                    <ul class="common-list-content" :scroll="lisSroll">
                        <li :if="@loading" class="list-loading">
                            <span>{{@loading_txt}}</span>
                        </li>
                        <li :if="(!@data.length && !@loading)" class="list-null">{{@none_txt}}</li>
                        <li :if="!@loading" class="common-list-no-scroll-x" :for="($index, record) in @data">
                            <div :mouseover="popovermouseover($event,key)" :mouseout="popovermouseout($event)" 
                             :for="(key,col) in @columns" :if="!col.isHide" :css="{width:col.colwidth}">
                             <span :if="col.title" :html="col.template"></span>
                             <span :if="!col.title"><i class="fa" :css="[checkboxStyle,(record.checked?checkStyle:uncheckStyle)]" :click="@selectOne(record,$index) | stop | prevent" :class="[(record.checked?'fa-check-square checked':'fa-square-o')]"></i></span>
                             </div>
                        </li>
                    </ul>
                </div>

                <div class="clearfix"></div>
            </div>`,
    defaults: {
        header: '',

        // 表头数据
        columns: [],

        // 传入表格data
        data: [],

        loading_txt: languageSelect == "en" ? "loading..." : "结果加载中",
        none_txt: languageSelect == "en" ? "No Result" : "暂无数据",

        // 调整表格 css
        panelCss: {
            position: 'absolute',
            bottom: 60,
            top: 180,
            left: 0,
            right: 8,
        },

        // loading
        loading: false,

        // 表格 -调整
        marginLeft: 0,
        paddingRight: 17,
        ispaddingRight: false,

        // 分页 -用于序号
        current: 0,
        pageSize: 0,

        // 表格拖动
        isdown: false,
        pageX: 0,
        clientWidth: 0,
        liindex: 0,
        headerdown(e, index) {
            if (e.target.clientWidth - e.offsetX < 8) {
                this.liindex = index;
                this.pageX = e.pageX;
                this.clientWidth = e.target.offsetWidth;
                this.isdown = true;
            }
        },
        headermove(e) {
            if (e.target.localName == 'span' || e.target.localName == 'i') {
                return false;
            }

            if (e.target.clientWidth - e.offsetX < 8) {
                avalon(e.target).css({
                    'cursor': 'e-resize'
                })
            } else {
                avalon(e.target).css({
                    'cursor': 'auto'
                })
            }

            if (this.isdown) {

                avalon(this.$element).addClass('unselect');
                avalon(e.target).css({
                    'cursor': 'e-resize'
                });

                this.columns[this.liindex].colwidth = this.clientWidth + (e.pageX - this.pageX);

                this.autoHeader(true);
            }
        },
        headerup(e, index) {
            this.isdown = false;
            avalon(e.target).css({
                'cursor': 'auto'
            })
            avalon(this.$element).removeClass('unselect');
        },
        headermouseleave(e) {
            this.headerup(e);
        },

        // 表格操作回调
        actions: avalon.noop,
        handle: function (type, col, record, $index) {
            var extra = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                extra[_i - 4] = arguments[_i];
            }
            // var text = record[col.dataIndex].$model || record[col.dataIndex];
            var text = '';
            this.actions.apply(this, [type, text, record.$model, $index].concat(extra));
        },

        // 表格popover提示
        popoverTime: '',
        popovermouseover(e, key) {
            // console.log(e.pageX)
            // console.log(e.pageY)
            if (!this.columns[key].popover) {
                return false
            }

            let targetEle = $(e.target);

            targetEle.popover({
                trigger: 'manual',
                container: 'body',
                placement: 'top',
                html: 'true',
                content: function () {
                    return $(this).text()
                },
                animation: false
            })

            clearTimeout(this.popoverTime);

            this.popoverTime = setTimeout(() => {
                targetEle.popover('show');
            }, 1000);
        },
        popovermouseout(e) {
            clearTimeout(this.popoverTime);
            setTimeout(() => {
                if (popoverMove) {
                    $(e.target).popover('show');
                } else {
                    $(e.target).popover('hide');
                }
            }, 100)
        },

        // 表格滚动监听
        scrollLeft: 0,
        lisSroll(e) {
            this.scrollLeft = e.target.scrollLeft;
        },
        isScroll: false,
        hasScrollbar() {
            return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
        },
        autoHeader(isdrap) {

            let content = avalon(this.$element).element.children[0];
          
            let tableH = $(this.$element).find('.common-list-content');
          
            if (tableH[0].scrollHeight > tableH.height()) {
                this.paddingRight = 17;
                this.ispaddingRight = false;
            } else {
                this.paddingRight = 0;
                this.ispaddingRight = true;
            }

            if (isdrap) {
                this.autoHeaderWidth(content.firstChild.firstChild, isdrap);
            } else {
                this.autoHeaderWidth(content.firstChild.firstChild);
            }
        },
        autoHeaderWidth(parentElement, isdrap) {
            let parentElementWidth = parentElement.clientWidth;
            let parentElementChildren = parentElement.children;

            let parentElementChildrenWidth = 0;
            avalon.each(parentElementChildren, (index, item) => {
                parentElementChildrenWidth += avalon(item).width()
            });

            if (parentElementChildrenWidth < (parentElementWidth - this.columns.length)) {
                this.ispaddingRight = false;
                if (isdrap) {
                    this.isScroll = false;
                    // console.log('无横向滚动条')
                }
            } else {
                this.ispaddingRight = true;
                if (isdrap) {
                    this.isScroll = true;
                    // console.log('有横向滚动条')
                }
            }
        },

        /**
         * 选择回调
         * @param type
         * @param selectData
         */
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#0078d7'
        },
        uncheckStyle: {
            color: '#cccccc'
        },

        onChange: avalon.noop,
        // 全选控制
        allChecked: false,
        // 全选 、 不全选
        selectAll() {
            this.allChecked = !this.allChecked;

            avalon.each(this.data, (index, el) => {
                el.checked = this.allChecked;
            });
            this.onChange('all', this.data);
        },
        // 单选
        selectOne(select, index) {

            this.data[index].checked = !this.data[index].checked;

            if (select.checked) {
                this.isSelect();
            } else {
                this.allChecked = false;
            }
            this.onChange('one', select, index);
        },

        isSelect() {
            let flab = true;
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].checked == false) {
                    flab = false;
                    break;
                }
            }
            flab ? (this.allChecked = true) : (this.allChecked = false);
        },

        onInit(event) {
            popoverMove = false;
            let descriptor = getChildTemplateDescriptor(this);
            this.columns = getColumnConfig(descriptor);
            $(document).off('mouseenter').on('mouseenter', '.popover.top.in', function () {
                popoverMove = true;
                $(this).show();
            });

            $(document).off('mouseleave').on('mouseleave', '.popover.top.in', function () {
                popoverMove = false;
                $(this).hide();
            });
        },
        onReady(event) {
            this.autoHeader();

            unwatch = this.$watch('scrollLeft', val => {
                this.marginLeft = -val;
            });

            this.$watch('data', val => {
                this.autoHeader();
                this.isSelect();
            });
        },
        onDispose(vm, el) {
            unwatch();
            clearTimeout(this.popoverTime);
            $(document).off('mouseenter', '.popover.top.in');
            $(document).off('mouseleave', '.popover.top.in');
        }
    }
});

function getChildTemplateDescriptor(vmodel, render) {
    if (render === void 0) {
        render = vmodel.$render;
    }
    if (render.directives === undefined) {
        return [];
    }
    return render.directives.reduce(function (acc, action) {
        if (action.is) {
            acc.push({
                is: action.is,
                props: action.value,
                inlineTemplate: action.fragment,
                children: getChildTemplateDescriptor(vmodel, action.innerRender || {
                    directives: []
                })
            });
        }
        return acc;
    }, []);
}

function getColumnConfig(descriptor, level) {
    if (level === void 0) {
        level = 1;
    }
    return descriptor.reduce(function (acc, column) {
        if (column.is != 'ms-comtable-header')
            return acc;
        if (column.props.type == 'selection') {
            acc.push({
                title: '',
                colwidth: column.props.colwidth || '',
                checked: column.props.checked || false
            });
            return acc;
        }
        if (column.props.type == 'index') {
            acc.push({
                title: column.props.title,
                dataIndex: '',
                template: '{{(@current-1)*@pageSize+$index+1}}',
                colwidth: column.props.colwidth || '',
                popover: column.props.popover || 0,
                isHide: column.props.isHide || 0,
            });
            return acc;
        }
        var inlineTemplate = column.inlineTemplate;
        inlineTemplate = inlineTemplate.replace(/(ms-|:)skip="[^"]*"/g, '');
        inlineTemplate = inlineTemplate.replace(/<\s*ms-comtable-header[^>]*>.*<\/\s*ms-comtable-header\s*>/g,
            '');
        inlineTemplate = inlineTemplate.replace(/(ms-|:)click="handle\(([^"]*)\)"/g, function ($0, $1,
            $2, $3) {
            return ($1 + "click=\"handle(" + $2 + ",)\"").replace(/,/, ', col, record, $index,')
                .replace(/,\)/, ')');
        });
        acc.push({
            title: column.props.title,
            dataIndex: column.props.dataIndex || '',
            template: /^\s*$/.test(inlineTemplate) ? '{{record.' + column.props.dataIndex +
                '}}' : inlineTemplate,
            colwidth: column.props.colwidth || '',
            popover: column.props.popover || 0,
            isHide: column.props.isHide || 0,
        });
        return acc.concat(getColumnConfig(column.children, level + 1));
    }, []);
}