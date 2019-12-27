import avalon from "avalon2";
import "ane";
import { notification, Loading } from "ane";
import ajax from "/services/ajaxService";

export const name = "xtpzgl-xtcd";

require("/apps/tyyhrzpt/tyyhrzpt-xtpzgl-xtcd.css");

let app_icon = "/static/image/xtpzgl-xtcd/app.png",
    menu_icon = "/static/image/xtpzgl-xtcd/menu.png",
    fuc_icon = "/static/image/xtpzgl-xtcd/function.gif";

let xtcd_vm = avalon.component(name, {
    template: __inline("./tyyhrzpt-xtpzgl-xtcd.html"),
    defaults: {
        import_show: false,
        table_pagination: {
            current: 0,
            pageSize: 17
        },
        select_node: {},
        onInit(event) {
            get_xtcd_tree();
        },
        onReady() {

        },
        actions(type, text, record, index) {
            console.log(type);
        },
        import_menu() { //导入菜单
            notification.warn({ //因接口有问题,功能暂时关闭
                message: "功能开发中！",
                title: "温馨提示"
            });
            return;
            this.import_show = true;
        },
        dialogCancel() {
            this.import_show = false;
        },
        dialogOk() {
            this.import_show = false;
        },
        selectfuc(event, depNode) {
            this.select_node = depNode.node;
            if(this.select_node.key == "root") {
                xtcd_table.xtcd_table_data = [];
                this.table_pagination.current = 0;
                return;
            };
            this.get_result_list();
        },
        handleTableChange(table_pagination) {
            if(this.table_pagination.hasOwnProperty('current')) {
                this.table_pagination.current = table_pagination.current;
            }
        },
        get_result_list() { //获取table
            Loading.show();
            ajax({
                url: "/gmvcs/uap/app/queryById/" + this.select_node.key,
                method: "get",
                data: {}
            }).then(result => {
                if(result.code != 0) {
                    notification.error({
                        message: "获取菜单列表失败，请稍后再试！",
                        title: "通知"
                    });
                    return;
                }

                if(!result.data || result.data.menus.length == 0) {
                    xtcd_table.xtcd_table_data = [];

                    this.table_pagination.current = 0;
                    setTimeout(function() {
                        Loading.hide();
                        notification.warn({
                            message: "暂无数据！",
                            title: "温馨提示"
                        });
                    }, 500);
                    return;
                }

                for(let i = 0; i < result.data.menus.length; i++) {
                    if(result.data.menus[i].menuType == "MENU") {
                        result.data.menus[i].menuText = "菜单";
                    } else if(result.data.menus[i].menuType == "FUNCTION") {
                        result.data.menus[i].menuText = "功能";
                    }
                }

                this.table_pagination.current = 1;
                xtcd_table.xtcd_table_data = result.data.menus;
                setTimeout(function() {
                    Loading.hide();
                }, 500);
                $(".xtpzgl_xtcd_table tbody tr").removeClass("selected");
                $(".xtpzgl_xtcd_table tbody tr td").bind("click", function(e) {
                    $(this).parent("tr").addClass("selected").siblings().removeClass("selected");
                });
            });
        }
    }
});

//定义树
let xtcd_tree = avalon.define({
    $id: "xtcd_tree",
    xtcd_tdata: [],
    expandedKeys: []
});

//定义列表
let xtcd_table = avalon.define({
    $id: "xtpzgl_xtcd_table",
    xtcd_table_data: []
});

//定义"导入系统菜单"弹窗
let import_dialog = avalon.define({
    $id: "import_dialog",
    title: "导入系统菜单",
    fileUploadUrl: "/api/file/uploadFile",
    handleChange(e) {
        console.log(e.target.value);
    }
});

//获取树
function get_xtcd_tree() {
    let xtcd_temp = [];
    ajax({
        //      url: "/api/app_all",
        url: "/gmvcs/uap/app/all",
        type: "get",
        data: {}
    }).then(result => {
        if(result.code != 0) {
            notification.error({
                message: "获取系统列表失败，请稍后再试",
                title: "通知"
            });
            return;
        }
        handle_data(result.data, xtcd_temp);
        xtcd_tree.xtcd_tdata = xtcd_temp;
        xtcd_tree.expandedKeys = all_key;
        all_key = [];

        $(".xtpzgl_xtcd .sidebar_tree .ztree li").click(function() {
            $(this).siblings().children("a").removeClass("change_height");
            $(this).children("a").addClass("change_height");
        });
    });
}
let all_key = [];
//处理后台返回的树数据
function handle_data(treelet, dataTree) {
    if(!treelet) {
        return;
    }
    for(let i = 0, item; item = treelet[i]; i++) {
        dataTree[i] = new Object();
        dataTree[i].children = new Array();

        if(item.code) { //系统
            dataTree[i].key = item.code;
            dataTree[i].title = item.name;
            dataTree[i].order = item.order;
            all_key.push(item.code);

            handle_data(item.menus, dataTree[i].children);
        } else { //菜单和功能
            dataTree[i].open = 1;
            dataTree[i].key = item.menuCode;
            dataTree[i].title = item.menuName;
            dataTree[i].url = item.url;
            dataTree[i].orderNo = item.orderNo;
            dataTree[i].path = item.path;
            dataTree[i].menuType = item.menuType;
            all_key.push(item.menuCode);
        }

        handle_data(item.childs, dataTree[i].children);
    }
}