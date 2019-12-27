import {
    message
} from "ane";
import {
    notification
} from 'ane';
import ajax from '../../services/ajaxService';
import {
    Gm
} from '../common/common-tools.js';
require('/apps/common/common-glmt.css');
function Tools() {};
function Format() {};
function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools();
let Gm_format = new Format();
let Gm_reg = new Reg();

let common_glmt = null;
const glmt = avalon.component('ms-glmt', {
    template: __inline('./common-glmt.html'),
    defaults: {

        //整体布局配置
        img_show: false,
        outdate_show: false,
        dalete_show: false,
        ocxPlayer_show: false,
        all_mt: ['img_show', 'outdate_show', 'dalete_show', 'ocxPlayer_show'],
        height: avalon.noop,
        tabActiveIndex: 0,
        glmt_tab_click(index) {
            this.tabActiveIndex = index;
        },

        //图片配置
        src: '',

        //播放器配置
        video_url: '',
        media_type: false, //false is video
        web_width: '',
        web_height: '',
        web_left: '',
        web_top: '',
        play_status: false,

        //媒体数据配置
        mt_data: avalon.noop,
        playFile: avalon.noop,
        diaHide: avalon.noop,
        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },
        sp(e) {

            //用于点击勾选框阻止父级点击事件触发两次
        },

        //点击媒体文件名
        playingFile: '',
        clickMt(e) {

            //选中复选框时不触发该事件
            if (e.target.className == 'text check') {
                return;
            }

            /*获得相应的请求字段值*/
            var rid = $(e.currentTarget).find('[path]').attr('rid'); //获取元素属性上用于请求的rid                   
            var type = $(e.currentTarget).find('[path]').attr('type'); //获取媒体类型: 视频/语音/图片/其他/文字 
            var name =  $(e.currentTarget).find('[path]').attr('name');
            /*获取结束*/

            //增加选中状态
            $('.clickMTCK').removeClass('clickMTCK');
            $(e.currentTarget).addClass('clickMTCK');
            this.playingFile = rid; //更新正在展示的媒体rid           

            //更新媒体信息
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + rid,
                method: 'get',
                data: null,
                cache: false
            }).then(ret => {

                if (ret.code == 0) {

                    // 画轨迹所需参数
                    this.mapAjaxData = {
                        "deviceId": ret.data.deviceId,
                        "fileRid": ret.data.rid,
                        "fileType": ret.data.type,
                        "beginTime": ret.data.startTime,
                        "endTime": ret.data.endTime
                    };

                    /*处理,转换返回的字段*/
                    ret.data.keyFile = ret.data.match == true ? '已关联' : '未关联';
                    if (ret.data.saveTime == -1) {
                        ret.data.saveTime = '永久存储';
                    } else if (ret.data.saveTime == -2) {
                        ret.data.saveTime = '已过期';
                    } else {
                        ret.data.saveTime = ret.data.saveTime + '天';
                    }

                    if (ret.data.saveSiteWs && ret.data.saveSiteSt) {
                        ret.data.path = "采集工作站、存储服务器";
                    } else {

                        if (ret.data.saveSiteWs) {
                            ret.data.path = "采集工作站";
                        } else if (ret.data.saveSiteSt) {
                            ret.data.path = "存储服务器";
                        }
                    }
                    /*处理结束*/

                    if (ret.data.saveTime == '已过期') {
                        ret.data.path = "-";
                        //过期文件不予播放       
                        filePlayer.close();              
                        filePlayer.show('outdate');
                        Gm_tool.sayWarn('该文件已过期');
                    } else {
                        filePlayer.play(type, rid, '');
                    }
                    this.playFile && this.playFile(ret, name);
                } else if (ret.code == 1032) {
                    Gm_tool.sayError(ret.msg);
                } else {
                    Gm_tool.sayError('获取详细媒体信息失败');
                }
            });
        },
        onInit: function (event) {
            common_glmt = this;
            // console.log(this.playFile);
            //初始化播放器
            this.ocxPlayer_show = true;
            $("#common-glmt-player").css("visibility", "hidden");

            //播放器设置
            this.video_url = "";
            this.play_status = false;
            this.web_width = $("#common-glmt-player").width();
            this.web_height = $("#common-glmt-player").height();
            this.web_left = $("#common-glmt-player").offset().left + 1;
            this.web_top = $("#common-glmt-player").offset().top + 1;

            setTimeout(function () {
                $("#common-glmt-player").css("visibility", "visible");

                $(window).resize(function () {
                    common_glmt.web_width = $("#common-glmt-player").width();
                    $('#gm_webplayer').css('width', $("#common-glmt-player").width());
                    common_glmt.web_height = $("#common-glmt-player").height();
                });

                common_glmt.$watch('ocxPlayer_show', (v) => {

                    if (v) {
                        return;
                    } else {
                        common_glmt.play_status = false;
                    }
                });
            }, 1000);
        },
        onReady: function (event) {
            Gm_tool.reduceWord('.cmspan_prop span', '.cmspan_prop', 15)
        },
        onDispose: function (event) {
            if (this.ocxPlayer_show) {
                this.video_url = "";
                this.ocxPlayer_show = false;
                delete_ocx();
            }
            $("#gm_webplayer").hide();
        }
    }
});
function delete_ocx(params) {
    let globalOcxPlayer;
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        globalOcxPlayer = document.getElementById('gxxPlayOcx');
    else {
        globalOcxPlayer = document.getElementById('npGSVideoPlugin_pic') || document.getElementById('npGSVideoPlugin');
        if (globalOcxPlayer && !globalOcxPlayer.GS_ReplayFunc)
            return;
    }

    if (!globalOcxPlayer)
        return;

    globalOcxPlayer.IMG_DestroyWnd();

    if ($("#gxx_ocx").length > 1)
        $("#gxx_ocx").hide();

    let data = {};
    data.action = 'Delete';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));

    data = {};
    data.action = 'LogOut';
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}
let filePlayer = (function () {
    function show(which) {
        common_glmt[which + '_show'] = true;
    };
    function close(which) {
        common_glmt.all_mt.forEach((value, index) => {
             common_glmt[value] = false;
        });
    };
    var States = {
        'picture': function (ret, dia) {

            if (ret.code == 0) {
                delete_ocx();
                filePlayer.close();
                setTimeout(() => {
                    filePlayer.show('img');
                    common_glmt.src = ret.data[0].storageFileURL || ret.data[0].wsFileURL || ret.data[0].storageTransFileURL || ret.data[0].wsTransFileURL;
                }, 10)
            } else {
                Gm_tool.sayError('请求图片数据失败');
            }
            return;
        },
        'video': function (ret, dia) {
            
            if (ret.code == 0) {
                delete_ocx();
                filePlayer.close();
                common_glmt.media_type = false;
                common_glmt.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Gm_tool.sayError('视频地址无效，无法播放');
                    return;
                }

                common_glmt.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                common_glmt.play_status = true;
                setTimeout(() => {
                    common_glmt.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    filePlayer.show('ocxPlayer');
                    common_glmt.play_status = true;
                }, 300)
            } else {
                Gm_tool.sayError('请求视频数据失败');
            }
        },
        'audio': function (ret, dia) {
            
            if (ret.code == 0) {
                delete_ocx();
                filePlayer.close();
                common_glmt.media_type = true;
                common_glmt.play_status = false;

                if (!(ret.data[0].storageFileURL || ret.data[0].wsFileURL)) {
                    Gm_tool.sayError('语音地址无效，无法播放');
                    return;
                }
                setTimeout(() => {
                    common_glmt.video_url = ret.data[0].storageFileURL || ret.data[0].wsFileURL;
                    filePlayer.show('ocxPlayer');
                    common_glmt.play_status = true;
                }, 300)
            } else {
                Gm_tool.sayError('请求音频数据失败');
            }
            return;
        },
        playing: null
    };
    return {
        play: function (type, rid, dia) {

            if (type == '图片' || type == '2') {
                type = 'picture';
            } else if (type == '视频' || type == '0') {
                type = 'video';
            } else if (type == '音频' || type == '1') {
                type = 'audio';
            } else if (type == '文本' || type == '3') {
                type = 'word';

                if (dia == '_dia') {
                    Gm_tool.saySuccess('文本文件类型添加关联后需下载查看');
                } else {
                    Gm_tool.saySuccess('文本文件类型需下载查看');
                }
                return;
            } else {
                type = 'other';

                if (dia == '_dia') {
                    Gm_tool.saySuccess('其它文件类型添加关联后需下载查看');
                } else {
                    Gm_tool.saySuccess('其他文件类型需下载查看');
                }
                return;
            };
            ajax({
                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + rid,
                // url: '/api/faketable.json',
                method: 'get',
                // method: 'post',
                data: null,
                cache: false
            }).then(ret => {
                States[type](ret, dia);
            });
        },
        show: function (which) {
            show(which);
        },
        close: function (which) {
            close(which)
        }
    };
})();
avalon.filters.checkNull = function (str) {

    if (str === '' || str === null) {
        return '-';
    } else {
        return str;
    }
};
