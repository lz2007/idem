import avalon from 'avalon2';
import { createForm, message, Loading, notification } from 'ane';
import ajax from '../../services/ajaxService';
require('/apps/sszhxt/sszhxt-dzwl.css');

const commonMap = require('../common/common-map.js');

export const name = 'sszhxt-dzwl';
avalon.component(name, {
    template: __inline('./sszhxt-dzwl.html'),
    defaults: {
        onReady() {
            // 获取树结构
            this.get_dzwl_tree();
            // 响应左右布局的宽度
            this.onResizeW();
            window.onresize = () => {
                this.onResizeW();
            };
        },
        dzwl_right_width: 0,
        onResizeW() {
            let w = avalon(window).width();
            this.dzwl_right_width = w - 273;
        },

        // ajax 请求树的字段
        get_dzwl_tree() {
            // 获取树的一级字段
            dzwl.getAppAll().then((ret) => {
                if (ret.code != 0) {
                    notification.error({
                        message: "获取系统列表失败，请稍后再试",
                        title: "通知"
                    });
                    return;
                }

                let treeData = ret.data;
                avalon.each(treeData, (index, item) => {
                    treeData[index].key = item.code;
                    treeData[index].title = item.name;
                    treeData[index].icon = "/static/image/xtpzgl-xtcd/app.png";
                });
                this.show_dzwl_tree(treeData);
            });
        },

        // 显示树 
        show_dzwl_tree(dzwl_tdata) {
            let zTreeObj,
                setting = {
                    view: {
                        selectedMulti: false
                    },
                    callback: {
                        onClick: this.dzwl_click_tree
                    }
                },
                zTreeNodes = dzwl_tdata;
            zTreeObj = $.fn.zTree.init($("#dzwltree"), setting, zTreeNodes);
        },
        //  父节点id（code） 
        dicTypecode: '',
        //  子节点id（code） 
        dictionary_code: "",
        //  树选择节点的回调 
        //判断点击的是 子节点(true) 或者 父节点(false)
        click_child: false,
        dzwl_click_tree(event, treeId, treeNode) {
            if (treeNode.childs) {
                // 父节点点击
                this.dicTypecode = treeNode.code;
                this.getTreeType(this.dicTypecode);
                this.click_child = false;
            } else {
                // 子节点点击
                this.dictionary_code = treeNode.code;
                this.page = 0;
                this.ajaxTableList(this.dictionary_code, this.page, this.pageSize);
                this.click_child = true;
            }
        },
        // 存储点击的二级code 
        saveAppCode: [],
        // 获取树的二级字段
        getTreeType(appCode) {
            if ($.inArray(appCode, this.saveAppCode) > -1) {
                return false;
            }
            dzwl.findByAppCode(appCode).then((ret) => {
                if (ret.code != 0) {
                    notification.error({
                        message: "获取数据失败，请稍后再试",
                        title: "通知"
                    });
                    return;
                }

                let childsData = ret.data;
                avalon.each(childsData, (i, item) => {
                    childsData[i].key = item.code;
                    childsData[i].title = item.name;
                    childsData[i].icon = "/static/image/xtpzgl-xtcd/menu.png";
                    childsData[i].order = item.order == null ? "" : item.order;
                });
                // z-tree 
                let treeObj = $.fn.zTree.getZTreeObj("dzwltree");
                let sNodes = treeObj.getSelectedNodes();

                if (ret.data.length) {
                    this.saveAppCode.push(appCode);
                    treeObj.addNodes(sNodes[0], childsData);
                } else {
                    this.tableData = [];
                    message.warn({
                        content: '暂无数据',
                        duration: 2000
                    });
                }
            })
        },

        // 查看电子围栏弹框
        look_dzwl: function() {
            this.vm_look_dewl_dialog.show = true;
            // 加载表格数据
            this.vm_table_vm.ajaxTableList();
        },
        vm_look_dewl_dialog: avalon.define({
            $id: 'look_dewl_dialog',
            show: false,
            handleCancel() {
                this.show = false;
            }
        }),
        vm_look_dewl_dialogVm: avalon.define({
            $id: 'look_dewl_dialogVm',
            title: '查看电子围栏'
        }),
        onInit(event) {
            // ajax 获取表格数据
            // this.ajaxTableList();
            //需要等dojo加载完毕后才能进行地图的操作，使用定时器不断查询直至dojo加载完毕
            let timer = setInterval(function() {
                if (window.dojo) {
                    clearInterval(timer);
                    //可能是dojo加载后还要加载其他的，这里要延迟1s左右才能进行操作否则报错
                    setTimeout(function() {
                        dzwlMapObject.initMap();
                    }, 1000)
                }
            }, 200)
        },
        vm_table_vm: avalon.define({
            $id: 'table_vm',
            // 加载表格数据 begin
            list: [],
            loading: false,
            current: 1,
            pageSize: 10,
            // 数据总量
            total: 0,
            // selValue: 10,
            $computed: {
                // 共几页
                pageTotal: function () {
                    return Math.ceil(this.total / this.pageSize);
                }
            },
            // 手动修改页码，回车跳转
            handleEnter(e) {
                if (e.keyCode == 13) {
                    let exp = /\d/g;
                    let value = parseInt(e.target.value);
                    if ($(e.target).hasClass('pagesize')) {
                        if (!exp.test(e.target.value) || value > this.total || isNaN(value)) {
                            message.error({
                                content: '请输入正确的数字！'
                            });
                            this.pageSize = 10;
                            return false;
                        }
                        this.pageSize = value;
                        this.ajaxTableList(this.current, this.pageSize);
                    } else {
                        if (e.keyCode == 13 && $(e.target).hasClass('current')) {
                            if (!exp.test(e.target.value) || value < 1 || value > this.pageTotal || isNaN(value)) {
                                message.error({
                                    content: '请输入正确的页码！'
                                });
                                this.current = 1;
                                return false;
                            }
                            this.current = value;
                            this.ajaxTableList(this.current, this.pageSize);
                        }
                    }
                }
            },
            prevPage: function() {
                if (this.current > 1) {
                    this.current--;
                } else {
                    message.warning({
                        content: '当前页已经是第一页！'
                    });
                }
                this.ajaxTableList(this.current, this.pageSize);
            },
            nextPage: function() {
                if (this.current < Math.ceil(this.total / this.pageSize)) {
                    this.current++;
                } else {
                    message.warning({
                        content: '当前页已经是最后一页！'
                    });
                }
                this.ajaxTableList(this.current, this.pageSize);
            },
            toStartPage: function() {
                if (this.current > 1) {
                    this.current = 1;
                } else {
                    message.warning({
                        content: '当前页已经是第一页！'
                    });
                }
                this.ajaxTableList(1, this.pageSize);
            },
            toEndPage: function() {
                if (this.current < this.pageTotal) {
                    this.current = this.pageTotal
                } else {
                    message.warning({
                        content: '当前页已经是最后一页！'
                    });
                }
                this.ajaxTableList(this.total, this.pageSize);
            },
            refresh: function() {
                this.getCurrent(this.current);
                this.getPageSize(this.pageSize);
                this.onChange(this.current);
                message.success({
                    content: '刷新成功！'
                });
            },
            onChange: avalon.noop,
            getCurrent: avalon.noop,
            getPageSize: avalon.noop,
            dzwlTableContent: '',
            // ajax获取弹框表格数据
            ajaxTableList(page = 0, pageSize = 10) {
                this.loading = true;
                dzwl.lookTableList(page, pageSize).then(ret => {
                    this.total = ret.total;
                    this.list = ret.list;
                    // this.total = ret.data.totalElements;
                    // if(this.total === 0){
                    //     message.success({
                    //         content: '暂无数据'
                    //     });
                    // }
                    this.loading = false;
                    // this.list = ret.data.currentElements;
                    var html = '<tr ><th>序号</th><th>警员编号</th><th>警员名称</th><th>围栏名称</th><th>告警类型</th><th>告警时间</th></tr>';
                    for (var i = 0, len = ret.list.length; i < len; i++) {
                        var workName = ret.list[i].workName;
                        html += '<tr><td>' + (i - 0 + 1) + '</td><td>警员编号' + workName + '</td><td>警员名称' + workName + '</td><td>围栏名称' + workName + '</td><td>告警类型' +
                            workName + '</td><td>告警时间' + workName + '</td></tr>';
                    }
                    this.dzwlTableContent = html;
                });
            }
        })
    }
});

// 地图
var dzwlMapVm = avalon.define({
    $id : 'dzwlMapVm',
    // 框选围栏范围
    RectChooseArea: function(event){
        dzwlMapObject.addRectChooseArea(event);
    },
    // 自定义围栏范围
    RadomChooseArea: function(){
        dzwlMapObject.addRadomChooseArea();
    },
    lookChooseArea: function(){
        dzwlMapObject.showChooseArea();
    },
    buttontoggle: false,
    top: 0,
    left: 0,
    delChooseArea: function(){
        dzwlMapObject.delChooseArea();
    }
});
let GisObject;
const dzwlMapObject={
    initMap: function(){
        dojo.require("extras.MapInitObject");
        dojo.require("esri.geometry.Extent");
        dojo.require("esri.toolbars.draw");
        dojo.require("esri.symbols.SimpleFillSymbol");
 
        dojo.ready(function() {
            GisObject = new extras.MapInitObject("dzwl-map");
            GisObject.setMapOptions({
                logo: false,
                extent: "11501488.165446503, 3695866.152885527, 11678516.32295504, 3728734.075048165",
                level: 2,
                center: [113.2643446427, 23.1290765766]
            });
            GisObject.addDefaultLayers();
        });
    },
    // 框选围栏范围
    addRectChooseArea: function(){
        GisObject.addToolPanel();
        GisObject.toolbar.draw(esri.toolbars.draw.EXTENT,new esri.symbols.SimpleFillSymbol({
        	type:"esriSFS",
            style:"esriSFSSolid",
            color: [230, 245, 255, 90],
            outline:{
                type:"esriSLS",
            	style:"esriSLSSolid",
            	width:1.5,
            	color: [9, 110, 198]
            }
        }),function(data){
            console.log(data.geometry)
            var value = esri.geometry.webMercatorUtils.xyToLngLat(data.geometry.xmax, data.geometry.ymin,true);
            GisObject.layerDraw.addPointByText(value[0]-0.008, value[1]-0.002, '确定');
            GisObject.layerDraw.addPointByText(value[0]-0.003, value[1]-0.002, '取消');
            
            console.log(GisObject.map.getLayer('dzwl-map_graphics'))
            console.log(GisObject.map.graphics)
            console.log(GisObject.map.layerIds)
             
        });
        GisObject.addDefaultLayers();
    },
    // 框选自定义围栏范围
    addRadomChooseArea: function(){
        message.warning({
            content: '单击开始绘制，双击结束绘制'
        });
        GisObject.toolbar.draw(esri.toolbars.draw.POLYGON,new esri.symbols.SimpleFillSymbol({
        	type:"esriSFS",
            style:"esriSFSSolid",
            color: [230, 245, 255, 90],
            outline:{
            	type:"esriSLS",
            	style:"esriSLSSolid",
            	width:1.5,
            	color: [9, 110, 198]
            }
        }),function(data){
            console.log(data)
            // GisObject.toolbar.draw(esri.toolbars.draw.POINT,new esri.symbols.TextSymbol({
            //     type:"esriTS",
            //     angle:0,
            //     color:[51,51,51,255],
            //     font:{
            //         family:"微软雅黑",
            //         size:14,
            //         style:"normal",
            //         variant:"normal",
            //         weight:"normal"
            //     },
            //     horizontalAlignment:"center",
            //     kerning:true,
            //     rotated:false,
            //     text:"添加默认文本222",
            //     xoffset:0,
            //     yoffset:10
            // }));
           
        });
    },
    // 显示已经框选的范围
    showChooseArea: function(){
        // var value = esri.geometry.webMercatorUtils.xyToLngLat(12607640.590205181, 2649938.412973099,true);
        // console.log(value); // returns 379.22, 11.78
        // var value2 = esri.geometry.webMercatorUtils.xyToLngLat(12607755.245747609, 2645600.6116179214,true);
        // console.log(value2); // returns 379.22, 11.78
        // GisObject.layerDraw.addPolygon([value,value2]);
    }
}

// ajax 请求数据
const dzwl = (function() {
    const _baseUrl = '/gmvcs/uap/';

    // 获取树的一级字段
    function getAppAll() {
        return ajax({
            url: _baseUrl + 'app/all',
            type: 'get'
        })
    };

    // 获取树的二级字段
    function findByAppCode(appCode) {
        return ajax({
            url: _baseUrl + `dic/findByAppCode/${appCode}?page=0&pageSize=9`,
            type: 'get'
        });
    };

    // 获取查看围栏情况的弹框表格数据
    function lookTableList(page, pageSize) {
        return ajax({
            url: '/api/tyywglpt-rwgl-sjscrw-tableList',
            // url:  _baseUrl + `dic/findByDicTypeCode/0001?page=${page}&pageSize=${pageSize}&time=${Date.parse(new Date)}`,
            method: 'get'
        })
    }

    return {
        getAppAll: getAppAll,
        findByAppCode: findByAppCode,
        lookTableList: lookTableList
    }
})();