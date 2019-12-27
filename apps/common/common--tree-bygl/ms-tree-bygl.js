/*
 * @Author: mikey.liangzhu 
 * @Date: 2019-04-15 11:40:05 
 * @Last Modified by: mikey.liangzhu
 * @Last Modified time: 2019-04-23 15:23:13
 */

avalon.component('ms-tree-bygl', {
    template: __inline('./ms-tree-bygl.html'),
    defaults: {
        addHoverDom: avalon.noop,
        removeHoverDom: avalon.noop,
        zTreeBeforeExpand: avalon.noop,
        zTreeOnExpand: avalon.noop,
        zTreeBeforeClick: avalon.noop,
        zTreeOnClick: avalon.noop,
        zTreeOnDblClick: avalon.noop,
        zTreebeforeCheck: avalon.noop,
        zTreeOnCheck: avalon.noop,
        zTreeBeforeAsync: avalon.noop,
        onAsyncSuccess: avalon.noop,
        onAsyncError: avalon.noop,
        treeId: Math.random().toString(36).substr(2),
        enable: false,
        chkboxType: {
            "Y": "ps",
            "N": "ps"
        },
        async: {
            enable: false,
            type: "get",
            dataType: "json",
            url: "",
            autoParam: [],
            otherParam: {},
            dataFilter: avalon.noop
        },
        treeData: [],
        inInitWatchData() {
            this.$watch('treeData.length', newLength => {
                if (newLength > 0) {
                    zTreeInit(this);
                } else {
                    $.fn.zTree.destroy(this.treeId);
                }

            });
        },
        onInit() {
            this.inInitWatchData();
        },
        onReady: function () {},
        onDispose() {
            $.fn.zTree.destroy(this.treeId);
        }
    }
});

/**
 *树初始化
 *
 * @param {*} params
 */

function zTreeInit(vm) {
    let setting = {
        data: {
            key: {
                name: "title",
                title: "name"
            }
        },
        check: {
            enable: vm.enable || false,
            chkStyle: 'checkbox',
            chkboxType: vm.chkboxType
        },
        view: {
            addHoverDom: vm.addHoverDom,
            removeHoverDom: vm.removeHoverDom,
            selectedMulti: false,
            fontCss: getFontCss,
            nameIsHTML: true
            // showLine: false
        },
        callback: {
            beforeExpand: vm.zTreeBeforeExpand,
            onExpand: vm.zTreeOnExpand,
            beforeClick: vm.zTreeBeforeClick,
            onClick: vm.zTreeOnClick,
            onDblClick: vm.zTreeOnDblClick,
            beforeCheck: vm.zTreebeforeCheck,
            onCheck: vm.zTreeOnCheck,
            beforeAsync: vm.zTreeBeforeAsync,
            onAsyncSuccess: vm.onAsyncSuccess,
            onAsyncError: vm.onAsyncError,
        },
        async: {
            enable: vm.async.enable,
            type: vm.async.type,
            dataType: vm.async.dataType,
            url: vm.async.url,
            autoParam: vm.async.autoParam,
            otherParam: vm.async.otherParam,
            dataFilter: vm.async.dataFilter
        }

    };
    //初始化节点 
    $.fn.zTree.init($("#" + vm.treeId), setting, vm.treeData);
}


/**
 *设置树样式
 *
 * @param {*} treeId
 * @param {*} treeNode
 * @returns
 */
function getFontCss(treeId, treeNode) {
    return treeNode.highlight ? {
        color: "#A60000",
        "font-weight": "bold"
    } : {
        color: "#333",
        "font-weight": "normal"
    };
}