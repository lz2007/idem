import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
let storage = require('/services/storageService.js').ret;
let echarts = require("echarts/dist/echarts.min");
export const name = "sszhxt-znsb-rlbk-detail";
require("/apps/sszhxt/sszhxt-znsb-rlbk-detail.less");
import '../common/common-ms-table';
import '/services/filterService';
import '../../vendor/jquery/jquery.SuperSlide.2.1.1'

let language_txt = require('../../vendor/language').language;
let {
    languageSelect
} = require('/services/configService');

let rlbk_detail_vm, echart, rlbk_map;
avalon.component(name, {
    template: __inline("./sszhxt-znsb-rlbk-detail.html"),
    defaults: {
        extra_class: languageSelect == "en" ? true : false,
        rlbk_detail_txt: getLan(),
        result_txt: getLan().resemblance,
        echart_option: {
            color: ['#c2c2c2', '#be3335'].reverse(),
            series: [{
                hoverAnimation: false,
                type: 'pie',
                radius: ['55%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: false,
                        textStyle: {
                            fontSize: '30',
                            fontWeight: 'bold'
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data: [{
                        value: 88.88
                    },
                    {
                        value: 11.12
                    }
                ]
            }],
            graphic: [{
                id: 'percent_txt',
                type: 'text',
                style: {
                    text: '88.88%',
                    x: 52,
                    y: 70,
                    fill: '#be3335',
                    font: '14px "Microsoft YaHei", sans-serif'
                }
            }]
        },

        recognition_info: {},
        recognition_arr: [],
        scene_img: "",
        result_list: [],

        result_list_click(index) {
            this.recognition_info = this.recognition_arr[index];

            rlbk_detail_vm.echart_option.series[0].data = [{
                    value: Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2)
                },
                {
                    value: (100 - Number(rlbk_detail_vm.recognition_info.similarity)).toFixed(2)
                }
            ];
            rlbk_detail_vm.echart_option.graphic[0].style.text = Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2) + "%";
            echart.setOption(rlbk_detail_vm.echart_option);

            $(".comparison_result .result_list li").removeClass("select_li");
            $(".comparison_result .result_list li:eq(" + index + ")").addClass("select_li");
        },

        onInit(e) {
            rlbk_detail_vm = e.vmodel;
        },
        onReady() {
            $(document.body).css({
                "min-height": "681px"
            });

            let recordID = storage.getItem('sszhxt-znsb-rlbk-recordID');

            let img_num = Math.floor(($(".rlbk_detail_content").width() - 80) / 135);
            $(window).on('resize', resizeFuc);

            setTimeout(() => {
                rlbk_map = $('#mapIframe')[0].contentWindow;
            }, 200);

            ajax({
                // url: '/api/getRec',
                url: `/gmvcs/instruct/face/monitoring/get/recognition?id=${recordID}`,
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

                this.scene_img = result.data.shootPersonImgFilePath;

                setTimeout(() => {
                    if (rlbk_map.loadMapCompelete) {
                        this.setMap(result.data.longitude, result.data.latitude);
                    } else {
                        this.pollGetMapLoadStatus(result.data.longitude, result.data.latitude);
                    }
                }, 500);

                if (result.data.recogPersons.length == 0) {
                    notification.error({
                        message: '无法获取人脸识别结果列表，请稍后再试',
                        title: '通知'
                    });
                    return;
                }

                this.recognition_arr = result.data.recogPersons;
                this.recognition_info = this.recognition_arr[0];
                _popover();

                echart = echarts.init(document.getElementById("show_percent"));
                rlbk_detail_vm.echart_option.series[0].data = [{
                        value: Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2)
                    },
                    {
                        value: (100 - Number(rlbk_detail_vm.recognition_info.similarity)).toFixed(2)
                    }
                ];
                rlbk_detail_vm.echart_option.graphic[0].style.text = Number(rlbk_detail_vm.recognition_info.similarity).toFixed(2) + "%";
                echart.setOption(rlbk_detail_vm.echart_option);

                let temp = [];
                for (let i = 0; i < rlbk_detail_vm.recognition_arr.length; i++) {
                    let obj = rlbk_detail_vm.recognition_arr[i];
                    obj.index = i;
                    temp.push(obj);
                }
                this.result_list = temp;

                $(".comparison_result .result_list li").removeClass("select_li");
                $(".comparison_result .result_list li:eq(0)").addClass("select_li");

                jQuery(".comparison_result").slide({
                    titCell: ".control_bar ul",
                    mainCell: ".result_list",
                    autoPage: true,
                    effect: "left",
                    vis: img_num,
                    pnLoop: false,
                    trigger: "click"
                });

                if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
                    $(".comparison_result .result_list").css({
                        "margin-left": "40px"
                    })
                }

                $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
            });
        },

        timer: null,
        setMap(lon, lat) {
            rlbk_map.esriMap.clearDrawLayer();
            rlbk_map.esriMap.setMapCenter(lon, lat, 12);
            rlbk_map.esriMap.addPictureMarker(lon, lat, rlbk_map.locationSymbol, null);
        },
        pollGetMapLoadStatus(lon, lat) {
            let _this = this;
            _this.timer = setInterval(() => {
                if (rlbk_map.loadMapCompelete) {
                    clearInterval(_this.timer);
                    _this.setMap(lon, lat);
                }
            }, 200);
        },

        onDispose() {
            storage.removeItem('sszhxt-znsb-rlbk-recordID');
            $(document.body).css({
                "min-height": "550px"
            });
            $(window).off('resize', resizeFuc);

            if (rlbk_map.loadMapCompelete) {
                rlbk_map.esriMap.clearDrawLayer();
                rlbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            }
        },
        returnBtn() {
            storage.removeItem('sszhxt-znsb-rlbk-recordID');
            $(document.body).css({
                "min-height": "550px"
            });
            $(window).off('resize', resizeFuc);

            if (rlbk_map.loadMapCompelete) {
                rlbk_map.esriMap.clearDrawLayer();
                rlbk_map.esriMap.setMapCenter(113.26436, 23.12908, 6);
            }

            avalon.history.setHash("/sszhxt-znsb-rlbk");
        }
    }
});

// ------------function---------------
function getLan() {
    return language_txt.sszhxt.sszhxt_znsb;
}

function resizeFuc() {
    if (!$(".comparison_result .result_list").parent().hasClass("tempWrap")) {
        let img_num = Math.floor(($(".rlbk_detail_content").width() - 80) / 135);
        jQuery(".comparison_result").slide({
            titCell: ".control_bar ul",
            mainCell: ".result_list",
            autoPage: true,
            effect: "left",
            vis: img_num,
            pnLoop: false,
            trigger: "click"
        });
    } else
        $(".comparison_result .tempWrap").width($(".rlbk_detail_content").width() - 80);
}

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