/**
 * 绘制范围基类
 */
dojo.provide("extras.range.IRange");

dojo.declare("extras.range.IRange",null,{
    draw: function(callback){},
    show: function(){},
    hide: function(){},
    remove: function () {},
    getPaths: function () {}
});