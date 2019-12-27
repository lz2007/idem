import avalon from "avalon2";
import "ane";
import {
    notification
} from "ane";
import ajax from "/services/ajaxService";
import moment from 'moment';
import * as menuServer from '../../services/menuService';
var storage = require('../../services/storageService.js').ret;

export const name = "zfsypsjglpt-yspk-zfyps-detail";
require("/apps/zfsypsjglpt/zfsypsjglpt-yspk-zfyps-detail.css");

let zfyps_detail_vm,
    return_data = {},
    search_condition = {},
    rel_tag_num = true;
avalon.component(name, {
    template: __inline("./zfsypsjglpt-yspk-zfyps-detail.html"),
    defaults: {
        cancelText: "取消",
        mediaBtn: true,
        modify_toggle: true,
        zfyps_dialog_show: false,
        dialog_status: true,
        unClick_media: false,
        collection_site: "",
        zfyps_area: "",
        record_item: {},
        rel_tag: true, // 控制关联信息和标注信息的样式显示
        rel_toggle: true, // true 显示关联信息
        tag_toggle: false, // true 显示标注信息
        no_rel_tag: false, // true 显示暂无关联信息
        media_info: {},
        show_timeout: false,
        show_GMPlayer: false,
        show_img: false,
        show_other: false,
        media_no_img: false,
        play_url: "",
        media_type: false, //--fasle 视频；true 音频
        web_width: "",
        web_height: "",
        web_left: "",
        web_top: "",
        play_status: false,
        download_url: "",
        zfyps_close_locality: false,
        days: 0,
        zfyps_dialog_width: 300,
        zfyps_dialog_height: 178,
        zfyps_area_disabled: true,
        collection_site_disabled: true,
        edit_save: true,
        save_disabled: true,

        opt_detail: avalon.define({
            $id: "opt_detail",
            authority: { // 按钮权限标识
                "CHECK_GG": false, //音视频库_执法仪拍摄_查看_更改
                "DOWNLOAD": false, //音视频库_执法仪拍摄_下载
                "BZXX": false, // 标注信息
                "GLXX": false // 关联信息
            }
        }),

        onInit(e) {
            zfyps_detail_vm = e.vmodel;

            return_data = {};
            tag_type_vm.curTag = "";
            tag_type_vm.tag_label = "";

            change_time_vm.curTime = "";
            change_time_vm.time_type = ["1"];

            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            this.mediaBtn = true;
            this.modify_toggle = true;

            this.play_url = "";
            this.play_status = false;

            this.rel_tag = true;
            this.rel_toggle = true;
            this.tag_toggle = false;
            this.no_rel_tag = false;
            rel_tag_num = true;

            this.collection_site = "";
            this.zfyps_area = "";
            this.unClick_media = false;

            this.record_item = storage.getItem("zfsypsjglpt-yspk-zfyps-detail");

            let _this = this;
            // 按钮权限控制
            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                avalon.each(list, function (index, el) {
                    if (/^AUDIO_FUNCTION_SYPGL_ZFYSYP/.test(el))
                        avalon.Array.ensure(func_list, el);
                });

                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_CHECK_GG":
                            _this.opt_detail.authority.CHECK_GG = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_BZXX":
                            _this.opt_detail.authority.BZXX = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_GLXX":
                            _this.opt_detail.authority.GLXX = true;
                            break;
                        case "AUDIO_FUNCTION_SYPGL_ZFYSYP_DOWNLOAD":
                            _this.opt_detail.authority.DOWNLOAD = true;
                            break;
                    }
                });

                if (false == _this.opt_detail.authority.GLXX && true == _this.opt_detail.authority.BZXX) {
                    this.tag_btn();
                }
            });

            if (_this.record_item.is_tag) {
                _this.zfyps_area_disabled = true;
                _this.collection_site_disabled = true;
                _this.edit_save = true;
            } else {
                _this.zfyps_area_disabled = false;
                _this.collection_site_disabled = false;
                _this.edit_save = false;
            }

            ajax({
                // url: '/api/findBaseFileByRid',
                url: '/gmvcs/audio/basefile/findBaseFileByRid?rid=' + _this.record_item.rid,
                method: 'get',
                data: {}
            }).then(result => {
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                    return;
                }

                let media_temp = {};
                media_temp.fileName = result.data.fileName || "暂时无法获取文件名称！"; //文件名称
                media_temp.jobType = result.data.jobType || "-"; //民警岗位
                media_temp.startTime = formatDate(result.data.startTime); //拍摄时间
                media_temp.importTime = formatDate(result.data.importTime); //导入时间
                media_temp.saveSite = "-"; //存储位置
                media_temp.saveTime = "0天"; //存储天数（转换后的字符串）
                media_temp.save_time_num = result.data.saveTime; //存储天数（纯天数）

                media_temp.name_id = result.data.userName + "(" + result.data.userCode + ")"; //拍摄民警
                media_temp.key_media = result.data.match ? "是" : "否"; //关联媒体

                if (result.data.saveSiteWs && result.data.saveSiteSt)
                    media_temp.saveSite = "采集工作站、存储服务器";
                else {
                    if (result.data.saveSiteWs)
                        media_temp.saveSite = "采集工作站";
                    else if (result.data.saveSiteSt)
                        media_temp.saveSite = "存储服务器";
                }

                if (result.data.saveTime == "-1")
                    media_temp.saveTime = "永久存储";
                else if (result.data.saveTime == "-2") {
                    _this.show_timeout = true;
                    _this.show_GMPlayer = false;
                    _this.show_img = false;
                    _this.show_other = false;

                    media_temp.saveTime = "已过期";
                    media_temp.saveSite = "-";
                    _this.unClick_media = true;

                    zfyps_common_dialog_detail.operation_type = "1";
                    zfyps_common_dialog_detail.txt_rows = false;
                    zfyps_common_dialog_detail.title = "提示";
                    zfyps_common_dialog_detail.dialog_txt = "该媒体数据已过期！";
                    _this.zfyps_dialog_width = 300;
                    _this.zfyps_dialog_height = 178;

                    _this.cancelText = "关闭";
                    _this.zfyps_dialog_show = true;
                    _this.dialog_status = false;

                    if (!$(".zfyps_dialog_common").hasClass("dialog_close"))
                        $(".zfyps_dialog_common").addClass("dialog_close");
                } else
                    media_temp.saveTime = result.data.saveTime + "天";

                _this.media_info = media_temp;

                let rel_tag_aj = [],
                    rel_tag_jq = [];
                if (result.data.caseMainResponses.length == 0 && result.data.policeSituationResponses.length == 0) {
                    _this.no_rel_tag = true;
                    _this.rel_toggle = false;
                    rel_tag_num = false;
                }
                if (_this.tag_toggle) //防止接口请求过慢出现的bug
                    _this.tag_btn();

                avalon.each(result.data.caseMainResponses, function (index, item) {
                    rel_tag_aj[index] = {};
                    rel_tag_aj[index].case = true; //判断是案件还是警情
                    rel_tag_aj[index].glbt = item.ajmc || "-"; //案件名称
                    rel_tag_aj[index].ajbh = item.ajbh; //案件编号
                    rel_tag_aj[index].ajlb = item.ajlbmc || "-"; //案件类别
                    rel_tag_aj[index].sldw = item.sldwmc || "-"; //受理单位
                    rel_tag_aj[index].afsj = formatDate(item.afsj); //案发时间
                    rel_tag_aj[index].name_id = item.zbmjxm + "(" + item.zbr + ")"; //警员（警号）
                    // rel_tag_aj[index].name_id = item.zbr; //警员（警号）
                    rel_tag_aj[index].rymc = item.involvedPeoples ? item.involvedPeoples.rymc : "-"; //涉案人员
                });

                avalon.each(result.data.policeSituationResponses, function (index, item) {
                    rel_tag_jq[index] = {};
                    rel_tag_jq[index].case = false;
                    rel_tag_jq[index].glbt = item.jqmc || "-"; //警情名称
                    // rel_tag_jq[index].glbt = item.jqbh; //警情名称
                    rel_tag_jq[index].aqbh = item.jqbh; //警情编号
                    rel_tag_jq[index].bjrxm = item.bjrxm; //报警人姓名
                    // rel_tag_jq[index].aqlb = item.policeSituationType ? item.policeSituationType.name : "-"; //警情类型名称
                    rel_tag_jq[index].aqlb = item.jqlbmc || "-"; //警情类型名称
                    rel_tag_jq[index].cjdw = item.cjdwmc; //处警单位
                    rel_tag_jq[index].bjsj = formatDate(item.bjsj); //报警时间
                    rel_tag_jq[index].bjdh = item.bjrdh; //报警人电话
                    rel_tag_jq[index].sfdd = item.sfdd; //事发地点
                });

                relation_info_ul.aj_data = rel_tag_aj;
                relation_info_ul.jq_data = rel_tag_jq;

                _popover();

                ajax({
                    url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + _this.record_item.rid,
                    // url: '/api/findVideoPlayByRid',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取媒体播放信息失败！',
                            title: '通知'
                        });
                        return;
                    }

                    _this.download_url = result.data[0].storageFileURL || result.data[0].wsFileURL || result.data[0].storageTransFileURL || result.data[0].wsTransFileURL;
                    if (_this.record_item.file_flag == "2") {
                        if (_this.download_url) {
                            _this.media_no_img = true;
                            _this.play_url = _this.download_url;
                        }
                    } else
                        _this.play_url = result.data[0].storageFileURL || result.data[0].wsFileURL;
                    // _this.play_url = "http://10.10.17.79/mp4_test1.mp4";

                    if (!_this.unClick_media) {
                        if (_this.record_item.file_flag == "0" || _this.record_item.file_flag == "1") { //视频 && 音频
                            if (_this.record_item.file_flag == "0")
                                _this.media_type = false;
                            if (_this.record_item.file_flag == "1")
                                _this.media_type = true;

                            _this.show_GMPlayer = true;

                            _this.web_width = $(".web_player").width();
                            _this.web_height = $(".web_player").height();
                            _this.web_left = $(".zfyps_video").offset().left;
                            _this.web_top = $(".zfyps_video").offset().top;

                            _this.play_status = true;

                            $(window).resize(function () {
                                _this.web_width = $(".web_player").width();
                                _this.web_height = $(".web_player").height();
                            });
                        } else if (_this.record_item.file_flag == "2") { //图片
                            _this.show_img = true;
                        } else
                            _this.show_other = true;
                    }
                });
            });
        },
        onReady() {
            let _this = this;

            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    if (ev.preventDefault) {
                        ev.preventDefault();
                    } else {
                        ev.keyCode = 0;
                        ev.returnValue = false;
                    }

                    if (_this.zfyps_dialog_show)
                        return;

                    zfyps_common_dialog_detail.operation_type = "3";
                    zfyps_common_dialog_detail.txt_rows = false;
                    zfyps_common_dialog_detail.title = "提示";
                    zfyps_common_dialog_detail.dialog_txt = "是否确认离开此页面？";
                    _this.zfyps_dialog_width = 300;
                    _this.zfyps_dialog_height = 178;

                    _this.cancelText = "取消";
                    _this.zfyps_dialog_show = true;
                    _this.dialog_status = false;

                    $("#iframe_zfsyps").css({
                        "opacity": 0
                    });
                    setTimeout(function () {
                        $("#iframe_zfsyps").css({
                            "opacity": 1
                        });
                        $("#iframe_zfsyps").show();
                    }, 600);
                }
            });
            $(window).bind('beforeunload', function (event) { //ie
                $(window).unbind('beforeunload'); //在不需要时解除绑定   
                if (global.location.hash.indexOf("zfsypsjglpt-yspk-zfyps") > -1)
                    avalon.history.setHash("/zfsypsjglpt-yspk-zfyps");
            });
            $(window).unload(function () { //firefox
                $(window).unbind('beforeunload'); //在不需要时解除绑定 
                if (global.location.hash.indexOf("zfsypsjglpt-yspk-zfyps") > -1)
                    avalon.history.setHash("/zfsypsjglpt-yspk-zfyps");
            });
        },
        onDispose() {
            $(document).unbind("keydown");
            $("#gm_webplayer").hide();

            storage.removeItem("zfsypsjglpt-yspk-zfyps-detail");
        },
        returnBtn() {
            relation_info_ul.aj_data = [];
            relation_info_ul.jq_data = [];

            // $(document).unbind("keydown");
            this.show_timeout = false;
            this.show_GMPlayer = false;
            this.show_img = false;
            this.show_other = false;
            this.media_no_img = false;

            $("#gm_webplayer").hide();

            // storage.removeItem("zfsypsjglpt-yspk-zfyps-detail");
            storage.setItem('zfsypsjglpt-yspk-zfypsFlag', "true");
            avalon.history.setHash("/zfsypsjglpt-yspk-zfyps");
        },
        dialogCancel() {
            this.zfyps_dialog_show = false;
            this.dialog_status = true;
            $("#iframe_zfsyps").hide();
        },
        move_return(a, b) {
            let _this = this;
            $("#iframe_zfsyps").css({
                width: _this.zfyps_dialog_width + "px",
                height: _this.zfyps_dialog_height + "px",
                left: a,
                top: b
            })
        },
        dialogOk() {
            if (zfyps_common_dialog_detail.operation_type == "2") {
                ajax({
                    url: '/gmvcs/audio/basefile/update/exp?rid=' + this.record_item.rid + '&days=' + this.days,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '更改存储天数成功！',
                            title: '通知'
                        });
                        if (this.days == "-1") {
                            this.media_info.save_time_num = -1;
                            this.media_info.saveTime = "永久存储";
                        } else {
                            this.media_info.save_time_num = this.days;
                            this.media_info.saveTime = this.days + "天";
                        }
                    }
                    this.mediaBtn = true; //显示更改按钮
                    this.modify_toggle = true;
                });

            }
            if (zfyps_common_dialog_detail.operation_type == "3") {
                this.zfyps_dialog_show = false;
                this.dialog_status = true;

                $(document).unbind("keydown");
                setTimeout(function () {
                    // if (document.getElementById('gm_webplayer').style.display != "none") {
                    //     $("#gm_webplayer").hide();
                    // }
                    avalon.history.setHash("/zfsypsjglpt-yspk-zfyps");
                }, 300);
            }

            this.zfyps_dialog_show = false;
            this.dialog_status = true;

            $("#iframe_zfsyps").hide();
        },
        confirmBtn() {
            // this.mediaBtn = true; //显示更改按钮
            // this.modify_toggle = true;
            this.days = 0;
            let save_days = this.media_info.save_time_num;
            if (!change_time_vm.curTime)
                this.days = 90;
            else {
                if (change_time_vm.curTime == "1")
                    this.days = 90;
                if (change_time_vm.curTime == "2")
                    this.days = 180;
                if (change_time_vm.curTime == "3")
                    this.days = 365;
                if (change_time_vm.curTime == "4")
                    this.days = -1;
            }

            if (this.days != -1 && save_days > this.days) {
                zfyps_common_dialog_detail.operation_type = "2";
                zfyps_common_dialog_detail.txt_rows = true;
                zfyps_common_dialog_detail.title = "提示";
                zfyps_common_dialog_detail.dialog_txt = "设置存储天数小于当前存储天数，有可能导致该文件立即被删除。是否继续您的操作？";
                this.zfyps_dialog_width = 410;
                this.zfyps_dialog_height = 220;
                this.cancelText = "取消";

                this.zfyps_dialog_show = true;
                this.dialog_status = false;

                $("#iframe_zfsyps").css({
                    "opacity": 0
                });
                setTimeout(function () {
                    $("#iframe_zfsyps").css({
                        "opacity": 1
                    });
                    $("#iframe_zfsyps").show();
                }, 600);

                if (!$(".zfyps_dialog_common").hasClass("dialog_big_footer"))
                    $(".zfyps_dialog_common").addClass("dialog_big_footer");
            } else {
                ajax({
                    url: '/gmvcs/audio/basefile/update/exp?rid=' + this.record_item.rid + '&days=' + this.days,
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: result.msg,
                            title: '通知'
                        });
                    }
                    if (result.code == 0) {
                        notification.success({
                            message: '更改存储天数成功！',
                            title: '通知'
                        });
                        if (this.days == "-1") {
                            this.media_info.save_time_num = -1;
                            this.media_info.saveTime = "永久存储";
                        } else {
                            this.media_info.save_time_num = this.days;
                            this.media_info.saveTime = this.days + "天";
                        }
                    }
                    this.mediaBtn = true; //显示更改按钮
                    this.modify_toggle = true;
                });
            }

        },
        modifyBtn() {
            if (this.media_info.save_time_num == "-2") {
                return;
            }

            // if (click_change == true) {
            // click_change = false;
            // change_timer = setTimeout(function () {
            //     click_change = true;
            // }, 2000);
            this.mediaBtn = false; //显示确定按钮
            this.modify_toggle = false;
            let save_days = this.media_info.save_time_num;
            if (save_days == -1)
                change_time_vm.time_type = ["4"];
            else {
                if (0 < save_days && 90 >= save_days)
                    change_time_vm.time_type = ["1"];
                else if (90 < save_days && 180 >= save_days)
                    change_time_vm.time_type = ["2"];
                else if (180 < save_days && 365 >= save_days)
                    change_time_vm.time_type = ["3"];
                else if (365 < save_days)
                    change_time_vm.time_type = ["4"];
            }
        },
        input_area() {
            if (tag_type_vm.tag_type[0] == "0" && this.collection_site == "" && this.zfyps_area == "")
                this.save_disabled = false;
            else
                this.save_disabled = true;
        },
        rel_btn() { //显示关联信息
            this.rel_tag = true;
            this.rel_toggle = true;
            this.tag_toggle = false;
            if (!rel_tag_num) {
                this.rel_toggle = false;
                this.no_rel_tag = true;
            }
            _popover();
        },
        tag_btn() { //显示标注信息
            let _this = this;
            if (this.media_info.save_time_num == "-2") {
                return;
            }
            this.rel_tag = false;
            this.rel_toggle = false;
            this.tag_toggle = true;
            this.no_rel_tag = false;

            $(".locality_panel").width($(".dataFormBox_width").width() - 75);
            $(".locality_panel .form-control-input").width($(".locality_panel").width() - 24);
            $(".dataFormBox_tag .formInput").width($(".dataFormBox_tag").width() - 101);
            $(".zfyps_area").width($(".mark_info").width() - 94);

            $(window).resize(function () {
                $(".locality_panel").width($(".dataFormBox_width").width() - 75);

                if (_this.zfyps_close_locality)
                    $(".locality_panel .form-control-input").width($(".locality_panel").width() - 34);
                else
                    $(".locality_panel .form-control-input").width($(".locality_panel").width() - 24);

                $(".dataFormBox_tag .formInput").width($(".dataFormBox_tag").width() - 101);
                $(".zfyps_area").width($(".mark_info").width() - 94);
            });

            ajax({
                url: '/gmvcs/audio/basefile/label/types',
                method: 'get',
                // url: '/api/label_types',
                data: {}
            }).then(result => {
                let ret_data = [];
                if (result.code != 0) {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
                if (result.code == 0) {
                    if (!result.data || result.data.length == 0) {
                        tag_type_vm.tag_options = [{
                            value: "0",
                            label: "暂无标注类型"
                        }];
                        tag_type_vm.tag_type = ["0"];
                    } else {
                        avalon.each(result.data, function (index, item) {
                            ret_data[index] = {};
                            ret_data[index].value = item.code;
                            ret_data[index].label = item.name;
                        });
                        tag_type_vm.tag_options = ret_data;
                        tag_type_vm.tag_type = new Array(ret_data[0].value);
                    }
                }

                ajax({
                    url: '/gmvcs/audio/basefile/label/info/?rid=' + _this.record_item.rid,
                    // url: '/api/label_info',
                    method: 'get',
                    data: {}
                }).then(result => {
                    if (result.code != 0) {
                        notification.error({
                            message: '获取标注信息失败，请稍后再试！',
                            title: '通知'
                        });
                        return;
                    }

                    if (result.data != null) {
                        tag_type_vm.tag_label = result.data.labelTypeName;
                        if (result.data.labelTypeId != "" && result.data.labelTypeId != null) {
                            let normal = false;
                            avalon.each(ret_data, function (index, item) {
                                if (result.data.labelTypeId == item.value) {
                                    normal = true;
                                }
                            });

                            if (normal)
                                tag_type_vm.tag_type = new Array(result.data.labelTypeId.toString());
                            else
                                tag_type_vm.tag_type = new Array(tag_type_vm.tag_options[0].value);
                        }
                        if (result.data.location != null)
                            _this.collection_site = result.data.location;
                        if (result.data.labelRemark != null)
                            _this.zfyps_area = result.data.labelRemark;
                    } else {
                        tag_type_vm.tag_label = "";
                        if (tag_type_vm.tag_type[0] == "0")
                            this.save_disabled = false;
                        else
                            this.save_disabled = true;
                    }
                });
            });
        },
        edit_btn() {
            this.zfyps_area_disabled = false;
            this.collection_site_disabled = false;
            this.edit_save = false;
        },
        save_btn() { //保存标记
            // if (click_save == true) {
            //     click_save = false;
            //     save_timer = setTimeout(function () {
            //         click_save = true;
            //     }, 2000);
            if (this.save_disabled == false)
                return;

            this.collection_site = $.trim(this.collection_site);

            let labelTypeId = tag_type_vm.curTag || tag_type_vm.tag_type[0];
            ajax({
                url: '/gmvcs/audio/basefile/addLabelInfo',
                // url: '/api/label_types',
                method: 'post',
                data: {
                    "rid": this.record_item.rid,
                    "labelTypeId": labelTypeId == "0" ? "" : labelTypeId,
                    "location": this.collection_site,
                    "labelRemark": this.zfyps_area
                }
            }).then(result => {
                if (result.code == 0) {
                    notification.success({
                        message: '您已经成功保存标注信息！',
                        title: '通知'
                    });
                    avalon.each(tag_type_vm.tag_options, function (index, item) {
                        if (labelTypeId == item.value) {
                            tag_type_vm.tag_label = item.label;
                        }
                    });
                    if (tag_type_vm.tag_options[0].value == "0")
                        tag_type_vm.tag_label = "";

                    this.zfyps_area_disabled = true;
                    this.collection_site_disabled = true;
                    this.edit_save = true;
                } else {
                    notification.error({
                        message: result.msg,
                        title: '通知'
                    });
                }
            });
            // }
        },
        download() { //下载
            if (this.media_info.save_time_num == "-2") {
                return;
            }
            if (this.download_url == "") {
                notification.warn({
                    message: '无法获取下载地址，请稍后再试！',
                    title: '通知'
                });
                return;
            }
            window.open(this.download_url);
        },
        close_click(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.collection_site = "";
                    return false;
                    break;
            }
        },
        input_focus(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.zfyps_close_locality = true;
                    $(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel .collection_site").width($(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel").width() - 34);
                    break;
            }
        },
        input_blur(e) {
            let _this = this;
            switch (e) {
                case 'locality':
                    _this.zfyps_close_locality = false;
                    $(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel .collection_site").width($(".zfsypsjglpt_yspk_zfyps_detail .dataFormBox .locality_panel").width() - 24);
                    break;
            }
        },
    }
});

//保存标注定时器
// let save_timer;
// let click_save = true;
//更改存储时间定时器
// let change_timer;
// let click_change = true;

//关联信息 - CheckBox
let relation_info_ul = avalon.define({
    $id: "relation_info_ul",
    aj_data: [],
    jq_data: []
});

let tag_type_vm = avalon.define({
    $id: 'tag_type',
    curTag: "",
    tag_label: "",
    tag_options: [],
    tag_type: [],
    onChangeT(e) {
        let _this = this;
        _this.curTag = e.target.value;
    }
});

let change_time_vm = avalon.define({
    $id: 'change_time',
    curTime: "",
    time_type_options: [{
            value: "1",
            label: "3个月（90天）"
        },
        {
            value: "2",
            label: "6个月（180天）"
        }, {
            value: "3",
            label: "12个月（365天）"
        }, {
            value: "4",
            label: "永久存储"
        }
    ],
    time_type: ["1"],
    onChangeT(e) {
        let _this = this;
        _this.curTime = e.target.value;
    }
});

let zfyps_common_dialog_detail = avalon.define({
    $id: "zfyps_common_dialog_detail",
    title: "",
    dialog_txt: "",
    txt_rows: true, //true 两行 false 一行,
    operation_type: "1" // 1 提示媒体过期；2 更改存储天数的提示；3 按下F5的提示
});


/*================== 时间控制函数 start =============================*/
//获取当前时间戳
function getTimestamp() {
    return Math.round(new Date().getTime() / 1000);
    //getTime()返回数值的单位是毫秒
}

//日期转时间戳
function getTimeByDateStr(stringTime, end_flag) {
    // var s = stringTime.split(" ");
    // var s1 = s[0].split("-");
    var s1 = stringTime.split("-");
    var s2 = ["00", "00", "00"];
    // if (s2.length == 2) {
    //     s2.push("00");
    // }
    if (end_flag == true)
        s2 = ["23", "59", "59"];

    return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]).getTime();

    // 火狐不支持该方法，IE CHROME支持
    //var dt = new Date(stringTime.replace(/-/, "/"));
    //return dt.getTime();
}

//时间戳转日期
function formatDate(date) {
    var d = new Date(date);
    var year = d.getFullYear();
    var month = (d.getMonth() + 1) < 10 ? ("0" + (d.getMonth() + 1)) : (d.getMonth() + 1);
    var date = d.getDate() < 10 ? ("0" + d.getDate()) : d.getDate();
    var hour = d.getHours() < 10 ? ("0" + d.getHours()) : d.getHours();
    var minute = d.getMinutes() < 10 ? ("0" + d.getMinutes()) : d.getMinutes();
    var second = d.getSeconds() < 10 ? ("0" + d.getSeconds()) : d.getSeconds();

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

//秒 转 00:00:00格式
function formatSeconds(value) {
    var second = parseInt(value); // 秒
    var minute = 0; // 分
    var hour = 0; // 小时
    var result = "";
    // alert(second);
    if (second >= 60) {
        minute = parseInt(second / 60);
        second = parseInt(second % 60);
        // alert(minute+"-"+second);
        if (minute >= 60) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    }
    if (hour < 10)
        hour = "0" + hour;
    if (minute < 10)
        minute = "0" + minute;
    if (second < 10)
        second = "0" + second;

    result = hour + ":" + minute + ":" + second;
    return result;
}
/*================== 时间控制函数 end =============================*/

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