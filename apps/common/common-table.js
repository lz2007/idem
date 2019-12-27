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
require('/apps/common/common-table.css');
avalon.component('ms-table-saika', {
    template: __inline('./common-table.html'),
    defaults: {
        columns: [],
        data: [],
        currentPage:1,
        prePageSize:20,
        key: 'id',
        loading: false,
        display:'none',
        needSelection: false,
        checked: [],
        selection: [],
        isAllChecked: false,
        isAllSelected: true,
        isTitle:false,
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
        onInit: function(event) {
            var _this = this;
            var descriptor = getChildTemplateDescriptor(this);
            descriptor.forEach(function(column) {
                if (column.props.type == 'selection') {
                    _this.key = column.props.dataIndex || _this.key;
                    _this.needSelection = true;
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
                tableSaikaColumn();
                popover();
            });
            this.$watch('data.length', function(v) {
                _this.isAllChecked = false;
                _this.checked.clear();
                _this.selection.clear();
                tableSaikaColumn();
            });
            this.$watch('loading', function(v) {
                if(v){
                    this.data = [];
                    this.display = 'block';
                }else{
                    this.display = 'none';
                    tableSaikaColumn();
                    //popover();
                }
            });
            tableSaikaColumn();
            popover();
        },
        onReady: function(event) {
            //tableSaikaColumn();
            $("[data-toggle='tooltip']").tooltip();
            $(window).resize(function(){//监测浏览器发生大小变化
                tableSaikaColumn();
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

function tableSaikaColumn(){
    $(".fixed-table-saika-thead table").width($('.fixed-table-saika-tbody .table thead').width()+3);      
    $(".fixed-table-saika-thead  table").children("thead").find("th").each(function(){ 
        let idx = $(this).index();         
        let td=$('.fixed-table-saika-tbody table').children('thead').find("th").eq(idx);
        //console.log(idx+"--"+ $(this).width());
        //console.log(idx+"++"+  td.width());
        $(this).width(td.width());
    }); 
}

function popover(){//title的bootstrap tooltip
    let timer = {};
    $("[rel=drevil]").popoverX({  
        trigger:'manual',
        container: 'body',
        placement : 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',  
        content: function() { 
            return '<div class="title-content">'+ $(this).attr('tdval') +'</div>';  
        },  
        animation: false  
    }).on("mouseenter", function () {  
        var _this = this;
        timer = setTimeout(function(){
            $('div').siblings(".popover").popoverX("hide"); 
            $(_this).popoverX("show");
        },500);
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
        $('.popover').mouseleave(function(){
            $('.popover').hide();
        });
    }); 
}