/**
 * table-saika组件
 * @prop {Number} [currentPage=1] 当前页
 * @prop {Number} [prePageSize=10] 每页的数据量
 * @prop {Number} [data] 所有数据
 * @event {Function} onSelect 单选事件
 * @event {Function} onSelectAll 全选事件
 * @event {boolean} isTitle title显示（默认不显示）
 * @example
 * ```
 * <ms-table-saika :class="['yhgl-tabCont']" :widget="{data:@remoteList,currentPage:@currentPage,prePageSize:@prePageSize,onSelect:@handleSelect,onSelectAll:@handleSelectAll}" :click="@getTableTrData" >               
 *     <ms-table-header :widget="{dataIndex:'uid',type:'selection'}"></ms-table-header>
 *     <ms-table-header :widget="{title:'序号', type:'index' }" ></ms-table-header>
 *     <ms-table-header :widget="{title:'所属部门',dataIndex:'orgName'}"></ms-table-header>	                	                
 *     <ms-table-header :widget="{title:'有效时间'}"><span :skip>{{record.expirationDate|date("yyyy-MM-dd")}}</span></ms-table-header>
 * </ms-table-saika>
 *
 * ```
 * 可配合ms-paging组件使用，具体使用：统一用户认证平台--用户管理
 *  @zhengwenlong
 * 
 */
import 'jquery';
import 'bootstrap';
require('/apps/common/common-table-li.css');
avalon.component('ms-table-saika-li', {
    template: __inline('./common-table-li.html'),
    defaults: {
        table_id: '',
        columns: [],
        data: [],
        data_01:[],
        data_02:[],
        data_03:[],
        data_04:[],
        currentPage: 1,
        prePageSize: 20,
        paddingRight: 0,
        key: 'id',
        loading: false,
        display: 'none',
        needSelection: false,
        selectWidth: 5,
        checked: [],
        selection: [],
        isAllChecked: false,
        isAllSelected: true,
        isTitle: false,
        headerPopover: false,
        onSelect: avalon.noop,
        onSelectAll: avalon.noop,
        selectionChange: avalon.noop,
        handleCheckAll: function(e) {
            var _this = this;
            var data = _this.data;
            if (e.target.checked) {
                data.forEach(function(record) {
                    _this.checked.ensure(record[_this.key]);
                    _this.selection.ensure(record);
                });
            } else {
                if (data.length > 0) {
                    this.checked.clear();
                    this.selection.clear();
                } else {
                    this.checked.removeAll(function(el) { return data.map(function(record) { return record[_this.key]; }).indexOf(el) !== -1; });
                    this.selection.removeAll(function(el) { return data.indexOf(el) !== -1; });
                }
            }
            this.selectionChange(this.checked, this.selection.$model);
            this.onSelectAll(e.target.checked, this.selection.$model);
        },
        handleCheck: function(checked, record) {
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
        handle: function(type, col, record, $index) {
            var extra = [];
            for (var _i = 4; _i < arguments.length; _i++) {
                extra[_i - 4] = arguments[_i];
            }
            var text = record[col.dataIndex].$model || record[col.dataIndex];
            this.actions.apply(this, [type, text, record.$model, $index].concat(extra));
        },
        onChange: avalon.noop,
        watchData: function(){//监听表格数据变化后的处理
            var _this = this;
            let data01 = avalon.slice(_this.data,0,5);
            let data02 = avalon.slice(_this.data,5,10);
            let data03 = avalon.slice(_this.data,10,15);
            let data04 = avalon.slice(_this.data,15,20);
            setTimeout(function(){
                _this.data_01 = data01.length ? data01 : [];
                tableSaikaColumn(_this);
                popover();
            },1);
            setTimeout(function(){
                _this.data_02 = data02.length ? data02 : [];
                tableSaikaColumn(_this);
                popover();
            },2);
            setTimeout(function(){
                _this.data_03 = data03.length ? data03 : [];
                tableSaikaColumn(_this);
                popover();
            },2);
            setTimeout(function(){
                _this.data_04 = data04.length ? data04 : [];
                tableSaikaColumn(_this);
                popover();
            },2);
            if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion .split(";")[1].replace(/[ ]/g,"")=="MSIE8.0"){
                loadingTime(_this);//ie8浏览器
            }else{
                if(!_this.loading){
                    _this.display = 'none';
                }
            }
        },
        onInit: function(event) {
            var _this = this;
            _this.table_id = event.vmodel.$id;
            var descriptor = getChildTemplateDescriptor(this);
            descriptor.forEach(function(column) {
                if (column.props.type == 'selection') {
                    _this.key = column.props.dataIndex || _this.key;
                    _this.needSelection = true;
                    _this.selectWidth = column.props.width ? column.props.width : 5;
                    return false;
                }
            });
            this.columns = getColumnConfig(descriptor);
            this.$watch('checked.length', function(newV) {
                var currentPageKeys = _this.data
                    .map(function(record) { return record[_this.key]; });
                _this.isAllChecked = currentPageKeys
                    .filter(function(key) { return _this.checked.contains(key); })
                    .length == currentPageKeys.length;
            });
            this.$watch('data', function(v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
                _this.watchData();
                //tableSaikaColumn(_this);
                popover();
            });
            this.$watch('data.length', function(v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
                tableSaikaColumn(_this);
            });
            this.$watch('loading', function(v) {
                if (v) {
                    _this.data = [];
                    _this.display = 'block';
                } else {
                    //this.display = 'none';
                    //tableSaikaColumn(_this);
                    //popover();
                }
            });
            tableSaikaColumn(_this.table_id);
            popover();
        },
        onReady: function(event) {
            //tableSaikaColumn();
            $("[data-toggle='tooltip']").tooltip();
            let _this = this;
            $(window).resize(function() { //监测浏览器发生大小变化
                tableSaikaColumn(_this);
            });
        },
        onDispose: function(vm, el) {
            $('div').siblings(".popover").popover("hide");
        }
    }
});

function getColumnConfig(descriptor, level) {
    if (level === void 0) { level = 1; }
    return descriptor.reduce(function(acc, column) {
        if (column.is != 'ms-table-header')
            return acc;
        if (column.props.type == 'selection') {
            return acc;
        }
        if (column.props.type == 'index') {
            acc.push({
                title: column.props.title,
                width: column.props.width,
                promptBox: column.props.promptBox || '',
                className: column.props.className || '',
                dataIndex: '',
                template: '{{(@currentPage-1)*@prePageSize+$index + 1}}'
            });
            return acc;
        }
        var inlineTemplate = column.inlineTemplate;
        inlineTemplate = inlineTemplate.replace(/(ms-|:)skip="[^"]*"/g, '');
        inlineTemplate = inlineTemplate.replace(/<\s*ms-table-header[^>]*>.*<\/\s*ms-table-header\s*>/g, '');
        inlineTemplate = inlineTemplate.replace(/(ms-|:)click="handle\(([^"]*)\)"/g, function($0, $1, $2, $3) {
            return ($1 + "click=\"handle(" + $2 + ",)\"").replace(/,/, ', col, record, $index,').replace(/,\)/, ')');
        });
        acc.push({
            title: column.props.title,
            width: column.props.width,
            promptBox: column.props.promptBox || '',
            dataIndex: column.props.dataIndex || '',
            className: column.props.className || '',
            template: /^\s*$/.test(inlineTemplate) ? '{{record.' + column.props.dataIndex + '}}' : inlineTemplate
        });
        return acc.concat(getColumnConfig(column.children, level + 1));
    }, []);
}

function getChildTemplateDescriptor(vmodel, render) {
    if (render === void 0) { render = vmodel.$render; }
    if (render.directives === undefined) {
        return [];
    }
    return render.directives.reduce(function(acc, action) {
        if (action.is) {
            acc.push({
                is: action.is,
                props: action.value,
                inlineTemplate: action.fragment,
                children: getChildTemplateDescriptor(vmodel, action.innerRender || { directives: [] })
            });
        }
        return acc;
    }, []);
}

function tableSaikaColumn(_this) {
    let hg = $('#' + _this.table_id).find('.table-saika-tbody').get(0);
    if (hg && (hg.offsetHeight < hg.scrollHeight)) {
        _this.paddingRight = 17;
    } else if (hg && !(hg.offsetHeight < hg.scrollHeight)) {
        _this.paddingRight = 0;
    }
    // $(".fixed-table-saika-thead table").width($('.fixed-table-saika-tbody .table thead').width()+3);      
    // $(".fixed-table-saika-thead  table").children("thead").find("th").each(function(){ 
    //     let idx = $(this).index();         
    //     let td=$('.fixed-table-saika-tbody table').children('thead').find("th").eq(idx);
    //     //console.log(idx+"--"+ $(this).width());
    //     //console.log(idx+"++"+  td.width());
    //     $(this).width(td.width());
    // }); 
}

function popover() { //title的bootstrap tooltip
    let timer = {};
    $("[rel=drevil]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function() {
            return '<div class="title-content">' + $(this).attr('tdval') + '</div>';
        },
        animation: false
    }).on("mouseenter", function() {
        var _this = this;
        timer = setTimeout(function() {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");
        }, 500);
        $(this).siblings(".popover").on("mouseleave", function() {
            $(_this).popoverX('hide');
        });
    }).on("mouseleave", function() {
        var _this = this;
        clearTimeout(timer);
        setTimeout(function() {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
        $(".popover").on("mouseleave", function() {
            $('.popover').hide();
        });
    }).on('shown.bs.popover', function() {
        $('.popover').mouseleave(function() {
            $('.popover').hide();
        });
    });
}

function loadingTime(obj){
    let _this = obj;
    if(_this.data.length == 0){
        if(!_this.loading){
            _this.display = 'none';
        }
    }else if(_this.data.length < 6 && _this.data.length > 0){
        setTimeout(function () { 
            if(!_this.loading){
                _this.display = 'none';
            }
        },1500);
    }else if(_this.data.length < 11 && _this.data.length >= 6){
        setTimeout(function () { 
            if(!_this.loading){
                _this.display = 'none';
            }
        },1800);
    }else if(_this.data.length < 16 && _this.data.length >= 11){
        setTimeout(function () { 
            if(!_this.loading){
                _this.display = 'none';
            }
        },2000);
    }else if(_this.data.length < 21 && _this.data.length >= 16){
        setTimeout(function () { 
            if(!_this.loading){
                _this.display = 'none';
            }
        },2500);
    }
}