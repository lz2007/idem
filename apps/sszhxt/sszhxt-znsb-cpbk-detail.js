import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
export const name = "sszhxt-znsb-cpbk-detail";
require("/apps/sszhxt/sszhxt-znsb-cpbk-detail.less");
import '../common/common-ms-table';
import '/services/filterService';
import '../../vendor/jquery/jquery.SuperSlide.2.1.1'

let cpbk_detail_vm, cpbk_map;
avalon.component(name, {
    template: __inline("./sszhxt-znsb-cpbk-detail.html"),
    defaults: {
        recognition_arr: [],
        scene_img: "",
        recognition_list: [],
        recognition_info: {},

        change_page: false,
        table_pagination: {
            current: 0,
            pageSize: 20,
            total: 0
        },
        page_type: false, //false 显示总条数; true 显示大于多少条
        handlePageChange(currentPage) {
            this.change_page = true;
            this.table_pagination.current = currentPage;
            this.loading = true;
            this.getTableList();
        },
        getCurrent(current) {
            this.table_pagination.current = current;
        },

        actions(type, text, record, index) {
            if (type == "check") {
                if (cpbk_map.loadMapCompelete) {
                    this.setMap(record.longitude, record.latitude);
                } else {
                    this.pollGetMapLoadStatus(record.longitude, record.latitude);
                }
            }
        },

        timer: null,
        setMap(lon, lat) {
            cpbk_map.esriMap.clearDrawLayer();
            cpbk_map.esriMap.setMapCenter(lon, lat, 12);
            cpbk_map.esriMap.addPictureMarker(lon, lat, cpbk_map.locationSymbol, null);
        },
        pollGetMapLoadStatus(lon, lat) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (cpbk_map.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat);
                }
            }, 200);
        },

        onInit(e) {
            cpbk_detail_vm = e.vmodel;
        },

        table_list: [],
        search_data: {},
        loading: false,
        carNumber: "",

        onReady() {
            $(document.body).css({
                "min-height": "643px"
            });

            let record_item = storage.getItem('sszhxt-znsb-cpbk-record-item');
            this.carNumber = record_item.carNumber;

            setTimeout(() => {
                cpbk_map = $('#mapIframe')[0].contentWindow;
            }, 200);

            ajax({
                // url: '/api/getCarRec',
                url: `/gmvcs/instruct/car/monitoring/get/recognition?id=${record_item.id}`,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: '获取人脸识别结果失败，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                this.scene_img = result.data.shootCarImgFilePath;

                let temp = [];
                for (let i = 0; i < result.data.recognitionCarInfo.length; i++) {
                    let obj = result.data.recognitionCarInfo[i];
                    obj.carNumber = result.data.carNumber;
                    obj.index = i;
                    obj.txt = i + 1;
                    temp.push(obj);
                }
                this.recognition_list = temp;
                this.recognition_info = this.recognition_list[0];
                $(".recognition_panel .recognition_ul li").removeClass("selected");
                $(".recognition_panel .recognition_ul li:eq(0)").addClass("selected");
            });

            this.change_page = false;
            this.table_pagination.current = 0;
            this.table_pagination.total = 0; //总条数
            this.loading = true;
            this.getTableList();
        },

        getTableList() {
            let ajax_data = {
                "carNumber": this.carNumber,
                "page": 0,
                "pageSize": this.table_pagination.pageSize
            };

            if (this.change_page) {
                ajax_data = this.search_data;
                ajax_data.page = this.table_pagination.current - 1;
            } else
                this.search_data = ajax_data;

            ajax({
                // url: '/api/getCarLog',
                url: '/gmvcs/instruct/car/monitoring/get/recognition/log/by/car/number',
                method: 'post',
                data: ajax_data
            }).then(result => {
                if (result.code != 0) {
                    notification.warn({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                if (!result.data.overLimit && result.data.totalElements == 0) {
                    this.table_pagination.current = 0;
                    this.table_pagination.total = 0;
                    this.table_list = [];
                    this.loading = false;
                    return;
                }

                if (!this.change_page)
                    this.table_pagination.current = 1;

                let ret_data = [];
                let temp = (this.table_pagination.current - 1) * this.table_pagination.pageSize + 1;
                avalon.each(result.data.currentElements, function (index, item) {
                    ret_data[index] = item;
                    ret_data[index].table_index = temp + index; //行序号
                    ret_data[index].policeTypeName = item.policeType == "LEVAM_JYLB_JY" ? "警员" : "辅警"; //人员类别
                    ret_data[index].name_id = (item.userName || "-") + "(" + (item.userCode || "-") + ")"; //姓名（警号）
                    ret_data[index].time = moment(item.shootTime).format("YYYY-MM-DD HH:mm:ss"); //拍摄时间
                });

                if (result.data.overLimit) {
                    this.page_type = true;
                    this.table_pagination.total = result.data.limit * this.table_pagination.pageSize; //总条数
                } else {
                    this.page_type = false;
                    this.table_pagination.total = result.data.totalElements; //总条数
                }

                this.table_list = ret_data;
                this.loading = false;
            });
        },

        recognition_list_click(index) {
            this.recognition_info = this.recognition_list[index];
            $(".recognition_panel .recognition_ul li").removeClass("selected");
            $(".recognition_panel .recognition_ul li:eq(" + index + ")").addClass("selected");
        },
        onDispose() {
            storage.removeItem('sszhxt-znsb-cpbk-record-item');
            $(document.body).css({
                "min-height": "550px"
            });

            if (cpbk_map.loadMapCompelete) {
                cpbk_map.esriMap.clearDrawLayer();
                cpbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            }
        },
        returnBtn() {
            storage.removeItem('sszhxt-znsb-cpbk-record-item');
            $(document.body).css({
                "min-height": "550px"
            });

            if (cpbk_map.loadMapCompelete) {
                cpbk_map.esriMap.clearDrawLayer();
                cpbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            }

            avalon.history.setHash("/sszhxt-znsb-cpbk");
        }
    }
});

// ------------function---------------


/*================== 弹出tooltips start =============================*/
function _popover() { //title的bootstrap tooltip
    let timer;
    $("[data-toggle=tooltip]").popoverX({
        trigger: 'manual',
        container: 'body',
        placement: 'top',
        //delay:{ show: 5000},
        //viewport:{selector: 'body',padding:0},
        //title : '<div style="font-size:14px;">title</div>',  
        html: 'true',
        content: function () {
            let html = "";
            if ($(this)[0].outerHTML.indexOf("data-title-img-four") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-four") + 21, $(this)[0].outerHTML.indexOf("data-title-img-four") + 25);
            else if ($(this)[0].outerHTML.indexOf("data-title-img-five") > 0)
                html = $(this)[0].outerHTML.substring($(this)[0].outerHTML.indexOf("data-title-img-five") + 21, $(this)[0].outerHTML.indexOf("data-title-img-five") + 26);
            else
                html = $(this)[0].innerText;
            return '<div class="title-content">' + html + '</div>';
        },
        animation: false
    }).on("mouseenter", function () {
        let _this = this;
        if ($(this)[0].innerText == "-")
            return;
        timer = setTimeout(function () {
            $('div').siblings(".popover").popoverX("hide");
            $(_this).popoverX("show");

            $(".popover").on("mouseleave", function () {
                $(_this).popoverX('hide');
            });
        }, 500);
    }).on("mouseleave", function () {
        let _this = this;
        clearTimeout(timer);
        setTimeout(function () {
            if (!$(".popover:hover").length) {
                $(_this).popoverX("hide");
            }
        }, 100);
    });
}
/*================== 弹出tooltips end =============================*/