
# 本文档已经弃用
# 已创建独立支持的"ANE天坑小组"
# 有志愿参与项目的同事请直接联系前端组头


## ane

###修正tree缺少id
约3961行，68号模板。新增
:attr=\"{id:@$id}\"

###修正ms-input无类型定义
约4681行，新增
type: 'input',
约3883行，55号模板，修改 :attr
type:@type,

###修复ms-tree-select触发无效
约5538行，新增
this.$watch('treeData', function (v) {
    _this.treeData = v;
    innerVm.treeData = v;
});

###修正ms-pagination当前页为0时的上一页按钮问题
约4105行，修改
:attr=\"{disabled:@current === 1 || @current === 0}\"

###修正隐藏ms-dialog后ms-tree-select没有隐藏的问题
约4800行，新增
$('body').trigger("click");


###添加ms-dialog组件的extraClass属性
约4486行，新增
extraClass:'',
约4498行，新增
className:vm.extraClass,

###添加ms-input的disabled属性
约102行，新增
disabled:false
约3884行，55号模板，修改 :attr
disabled:@disabled,

###添加message的layout选项
约4894行，新增
layout: 'topCenter'
约4898,4907,4916,4925,4934行
将var content = _a.content, duration = _a.duration;  修改为 var content = _a.content, duration = _a.duration, layout = _a.layout;
约4902,4911,4920,4929行，增加
layout: layout || defaultOptions.layout,
约4935行，增加
layout: layout
约4941行，增加
if (options.duration !== undefined) {
    defaultOptions.duration = options.duration;
}

###添加notification的layout选项
约4958行，新增
layout:'topRight'
约4962,4971,4980,4989,4998行
将var message = _a.message, title = _a.title, timeout = _a.timeout; 修改为 var message = _a.message, title = _a.title, timeout = _a.timeout, layout = _a.layout;
约4966,4975,4984,4993行，增加
layout: layout || defaultOptions.layout,
约4999行，增加
layout: layout
约5005行，增加
if (options.duration !== undefined) {
    defaultOptions.duration = options.duration;
}

###添加ms-tree-select的模糊搜索功能
约617行，新增
noMatch: false,
约617~724行,新增
searchNode,diffArr函数
约4006行，新增noMatch的ms-visible判断，新增
`<div class=\"ane-select-dropdown-menu-item ane-select-dropdown-menu-item-disabled\" :visible=\"@noMatch && @searchValue\">无数据</div>\n`
约5609行，新增
innerVm.searchNode(v);

###添加ms-input的title属性
约3939行，新增
title:@text

###添加ms-select的extraClass属性
约5230行，新增
extraClass: '',
约5253行，新增
var vm = event.vmodel;
约5268行，新增
this.panelClass = vm.extraClass + ' ane-select-dropdown';

###添加ms-select的title属性
约3969行，新增
:attr=\"{title:@option.label}\" \n
约3975行，新增
:attr=\"{title:@displayValue}\"