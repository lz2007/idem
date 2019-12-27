import avalon from 'avalon2'
import '/apps/zfsypsjglpt/zfsypsjglpt-zfda-jqgl-detail_gongan.css'
import './zfsypsjglpt-zfda-checks.css'
import '../common/common-ms-modal'
import ajax from '../../services/ajaxService'
import * as menuServer from '../../services/menuService';
import moment from 'moment'
import {
    notification,
    createForm
} from 'ane'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'
let delete_ocx = require('../../apps/common/common').delete_ocx;
export const name = 'ms-zfda-checks'

let vm = ''

const RegExpPic = /\.(png|jpe?g|gif|svg)(\?.*)?$/
const RegExpVidio = /\.(mp4|MP4|rmvb|mkv|avi)(\?.*)?$/
const RegExpAudio = /\.(mp3|wma|flac|aac|mmf|amr|m4a|ogg|mp2|wav|wv)(\?.*)?$/

function addPreZero(num) {
    let t = (num + '').length,
        s = '';

    for (let i = 0; i < 2 - t; i++) {
        s += '0';
    }

    return s + num;
}

avalon.filters.mediaType = function (result) {
    if (result == 2) {
        result = '图片'
    }
    if (result == 0) {
        result = '视频'
    }
    if (result == 1) {
        result = '音频'
    }
    if (result == 3) {
        result = '文本'
    }
    if (result == 4) {
        result = '其它'
    }
    return result
}

avalon.filters.tohms = function (result) {
    let h = Math.floor(result / 3600)
    let m = Math.floor((result / 60 % 60))
    let s = Math.floor((result % 60))
    result = addPreZero(h) + ':' + addPreZero(m) + ':' + addPreZero(s)
    return result
}

avalon.filters.checkNull = function (str) {
    if (!str) {
        return '-'
    } else {
        return str
    }
};

// MP3.WMA.FLAC.AAC.MMF.AMR.M4A.M4R.OGG.MP2.WAV.WV

// 简易程序 VIOLATION,非现场处罚 SURVEIL,强制措施 FORCE,事故处理 ACCIDENT
const trafficLEType = [
    'VIOLATION',
    'SURVEIL',
    'FORCE',
    'ACCIDENT'
]

// 关联详情
let detailRelevance = {
    url: ""
}
// 添加关联
let addRelevance = {
    url: '',
    trafficLEType: ''
}
// 删除关联
let delRelevance = {
    url: '',
    trafficLEType: ''
}

// 关联类型 1 简易程序  2 非现场处罚  3 强制措施 4 事故处理
let gllx = 1

var aa = true
// 去重
Array.prototype.distinct = function () {
    var arr = this,
        result = [],
        i,
        j,
        len = arr.length;
    for (i = 0; i < len; i++) {
        for (j = i + 1; j < len; j++) {
            if (arr[i] === arr[j]) {
                j = ++i;
            }
        }
        result.push(arr[i]);
    }
    return result;
}

avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-checks.html'),
    defaults: {
        authority: {
            TJGL: false,
            SCGL: false,
            DOWNLOAD: false,
        },
        onInit(e) {
            // 监听图片是否是404
            vm = e.vmodel
            // this.show_confirm = true
            this.time_Change(1)
            this.defaultJQInfo()
            this.ocxPlayerConfigSet()
            this.searchJQInfo()
            let _this = this
            let ocxPlayer_dia = ''
            let ocxPlayer = ''
            $(window).on('resize', () => {
                if (_this.toggleShowTJGL) {
                    ocxPlayer_dia = $(".tjgl-dialog .TJGLDIA .player_dia")
                    _this.ocxPlayerConfig.web_width = ocxPlayer_dia.width()
                    _this.ocxPlayerConfig.web_height = ocxPlayer_dia.height()

                } else {
                    ocxPlayer = $("#ocxPlayer")
                    _this.ocxPlayerConfig.web_width = ocxPlayer.width()
                    _this.ocxPlayerConfig.web_height = ocxPlayer.height()
                }
            })

            setTimeout(() => {
                this.reduceWordForJbxx()
            }, 50)

            menuServer.menu.then(menu => {
                let list = menu.AUDIO_MENU_SYPSJGL;
                let func_list = [];
                let mark = '';
                switch (gllx) {
                    case 1:
                        mark = /^AUDIO_FUNCTION_ZFDA_JTWF_JYCX/;
                        break;
                    case 2:
                        mark = /^AUDIO_FUNCTION_ZFDA_JTWF_FXCCL/;
                        break;
                    case 3:
                        mark = /^AUDIO_FUNCTION_ZFDA_JTWF_QZCS/;
                        break;
                    default:
                        mark = /^AUDIO_FUNCTION_ZFDA_SGCL/;
                        break;
                }




                avalon.each(list, function (index, el) {
                    if (mark.test(el))
                        avalon.Array.ensure(func_list, el);
                });
                const TOP_AUTHOR = mark.toString().replace(/[/^/]/g, '');
                const TJGL_AUTHOR = TOP_AUTHOR + '_CHECK_TJGL',
                    SCGL_AUTHOR = TOP_AUTHOR + '_CHECK_SCGL',
                    DOWNLOAD_AUTHOR = TOP_AUTHOR + '_DOWNLOAD';
                avalon.each(func_list, function (k, v) {
                    switch (v) {
                        case TJGL_AUTHOR:
                            vm.authority.TJGL = true;
                            break;
                        case SCGL_AUTHOR:
                            vm.authority.SCGL = true;
                            break;
                        case DOWNLOAD_AUTHOR:
                            vm.authority.DOWNLOAD = true;
                            break;
                    }
                });
            });

            // this.$watch('checkLooking', (newval) => {
            //     console.log(newval)
            // })
        },
        onDispose() {
            $(window).off('resize')
            delete_ocx()
        },
        // 返回
        jqgl_back() {
            this.isocxPlayer = false
            store.dispatch({
                type: "closecheck"
            })
            this.isclose()
            delete_ocx()
        },
        isclose: avalon.noop,
        // 查看标题
        checkLooking: '',
        checkorgName: '',
        // 播放器加载提示
        loading: false,
        // 图片查看
        isImg: false,
        // 播发器
        isocxPlayer: true,
        // 图片查看地址
        imgUrl: '',
        // 播发器参数
        ocxPlayerConfig: {
            videoUrl: '',
            media_type: false,
            web_width: '300',
            web_height: '250',
            web_left: '300',
            web_top: '100',
            play_status: false,
            dialog_status: true
        },
        // 播发器参数设置
        ocxPlayerConfigSet() {
            // 播放器设置
            let ocxPlayer = $("#ocxPlayer")
            this.ocxPlayerConfig.play_status = false
            if (ocxPlayer.length) {
                this.ocxPlayerConfig.web_width = ocxPlayer.width()
                this.ocxPlayerConfig.web_height = ocxPlayer.height()
                this.ocxPlayerConfig.web_left = ocxPlayer.offset().left + 1
                this.ocxPlayerConfig.web_top = ocxPlayer.offset().top + 1
            }
        },


        glmt_cj_show: true, // 媒体切换

        glmt_total: 0, // 共多少条关联媒体
        glmt_selected: 0, // 已选择多少条
        glmt_selected_total: 0, // 共选择多少条

        // 全选勾选
        allchecked: false,
        checkAll(e) {
            var checked = e.target.checked
            this.allchecked = checked
            this.delRelevanceData = []
            if (this.allchecked) {
                avalon.each(this.cj_data, (i, item) => {
                    item.checked = true
                    this.delRelevanceData.push(item.rid)
                })
            } else {
                avalon.each(this.cj_data, (i, item) => {
                    item.checked = false
                })
                this.allchecked = false
            }
        },
        // 简易程序信息
        infomation: {},
        // 关联数据
        cj_data: [],
        mid: '',
        // 查询关联数据
        defaultJQInfo() {
            let currentValue = store.getState()

            this.infomation = currentValue.list

            switch (currentValue.saveType) {
                case 'jycx':
                    gllx = 1
                    this.infoname = '简易程序信息'
                    detailRelevance.url = '/gmvcs/audio/violation/find/'
                    addRelevance.url = '/gmvcs/audio/violation/add/relevance'
                    addRelevance.trafficLEType = 'VIOLATION'

                    delRelevance.url = '/gmvcs/audio/violation/delete/relevance'
                    delRelevance.trafficLEType = 'VIOLATION'
                    this.mid = this.infomation.wfbh
                    break
                case 'fcfxc':
                    gllx = 2
                    this.infoname = '非现场处罚信息'
                    detailRelevance.url = '/gmvcs/audio/surveil/find/'
                    addRelevance.url = '/gmvcs/audio/surveil/add/relevance'
                    addRelevance.trafficLEType = 'SURVEIL'

                    delRelevance.url = '/gmvcs/audio/surveil/delete/relevance'
                    delRelevance.trafficLEType = 'SURVEIL'
                    this.mid = this.infomation.xh
                    break
                case 'qzcs':
                    gllx = 3
                    this.infoname = '强制措施信息'
                    detailRelevance.url = '/gmvcs/audio/force/find/'
                    addRelevance.url = '/gmvcs/audio/force/add/relevance'
                    addRelevance.trafficLEType = 'FORCE'

                    delRelevance.url = '/gmvcs/audio/force/delete/relevance'
                    delRelevance.trafficLEType = 'FORCE'
                    this.mid = this.infomation.xh
                    break
                case 'sgcl':
                    gllx = 4
                    this.infoname = '事故处理信息'
                    detailRelevance.url = '/gmvcs/audio/accident/find/'
                    addRelevance.url = '/gmvcs/audio/accident/add/relevance'
                    addRelevance.trafficLEType = 'ACCIDENT'

                    delRelevance.url = '/gmvcs/audio/accident/delete/relevance'
                    delRelevance.trafficLEType = 'ACCIDENT'
                    this.mid = this.infomation.rid
                    break
            }
        },
        // 查询媒体关联数据
        searchJQInfo() {
            this.delRelevanceData = []
            ajax({
                url: detailRelevance.url + this.mid,
                method: 'get',
                data: '',
                cache: false
            }).then(ret => {
                if (ret.code == 0) {
                    if (ret.data) {
                        // switch (gllx) {
                        //     case 1:
                        //         this.checkLooking = ret.data.wfxwmc + ' (' + ret.data.jdsbh + ')';
                        //         break;
                        //     case 2:
                        //         this.checkLooking = ret.data.wfxwmc + ' (' + ret.data.jdsbh + ')';
                        //         break;
                        //     case 3:
                        //         this.checkLooking = ret.data.wfxwmc + ' (' + ret.data.pzbh + ')';
                        //         break;
                        //     default:
                        //         this.checkLooking = ret.data.wfxwmc + ' (' + ret.data.sgbh + ')';
                        //         break;
                        // }

                        this.infomation = ret.data
                        this.checkorgName = ret.data.orgName
                        this.cj_data = []
                        if (ret.data.files) {
                            ret.data.files.forEach(function (val, key) {
                                val.checked = false
                            })
                            this.cj_data = []
                            this.glmt_total = ret.data.files.length
                            this.cj_data = ret.data.files
                        } else {
                            this.cj_data = []
                            this.glmt_total = 0
                        }

                    } else {
                        this.cj_data = []
                        this.glmt_total = 0
                    }
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            })
        },
        // 需要删除的关联数据
        delRelevanceData: [],

        // 接处警 class
        jq_clickClass: 'glmt_jj',
        // 接处警 显示隐藏
        glmt_cj_show: true,
        // 轨迹定位 class
        cj_clickClass: 'glmt_cj',
        // 轨迹定位 显示隐藏
        glmt_map_Show: false,
        //  轨迹定位传入数据
        mapAjaxData: {
            "deviceId": "", // 设备id
            "fileRid": "", // 文件Rid
            "fileType": "", // 文件类型(0视频、1音频、2图片、3文本、4其他、5-99预留)
            "beginTime": "", // 开始时间
            "endTime": "" // 结束时间
        },
        // 接处警 ，轨迹定位 点击
        clickGlmtType(type) {
            // 接处警
            if (type == 0) {
                this.jq_clickClass = 'glmt_jj';
                this.cj_clickClass = 'glmt_cj';

                this.glmt_cj_show = true;
                this.glmt_map_Show = false;
            }
            // 轨迹定位
            if (type == 1) {
                this.jq_clickClass = 'glmt_cj';
                this.cj_clickClass = 'glmt_jj';

                this.glmt_cj_show = false;
                this.glmt_map_Show = true;
            }
        },
        // 媒体点击查询媒体详细信息
        playFile(item, index) {
            if (item.relevanceStatus) {
                return
            }
            this.errorinfo = ''

            // test demo --satrt
            // var wsFileURL = '';

            // if (aa) {
            //     wsFileURL = 'http://127.0.0.1:8080/test.mp4';
            //     aa = false;
            // } else {
            //     wsFileURL = 'http://img0.bdstatic.com/static/searchresult/img/logo-2X_b99594a.png';
            //     aa = true;
            // }
            // console.log(wsFileURL)
            // if (RegExpPic.test(wsFileURL)) {
            //     this.imgUrl = wsFileURL
            //     this.isImg = true
            //     this.isocxPlayer = false
            //     return
            // }
            // if (RegExpVidio.test(wsFileURL) || RegExpAudio.test(wsFileURL)) {
            //     this.isImg = false
            //     this.isocxPlayer = true
            //     this.ocxPlayerConfig.play_status = false
            //     setTimeout(() => {
            //         this.ocxPlayerConfig.video_url = wsFileURL
            //         this.ocxPlayerConfig.play_status = true
            //     }, 300)
            //     return
            // }
            // return
            // test demo --end
            this.checkLooking = this.checkorgName + ' - ' + item.userName + '(' + item.userCode + ') - ' + item.fileName
            ajax({
                url: '/gmvcs/audio/basefile/getBaseFileByRid?rid=' + item.rid,
                // url: '/gmvcs/audio/basefile/findBaseFileByRid?rid=' + '99999999_87s5463y901281168814201804271614060200201805071142560545',
                method: 'get',
            }).then(ret => {
                if (ret.code == 0) {

                    // let wsFileURL = "http://10.10.18.19:8080/12.jpg"
                    // // 图片
                    // if (RegExpPic.test(wsFileURL)) {
                    //     this.imgUrl = wsFileURL
                    //     this.isImg = true
                    //     this.isocxPlayer = false
                    //     return
                    // }
                    // return
                    // 画轨迹所需参数
                    this.mapAjaxData = {
                        "deviceId": ret.data.deviceId,
                        "fileRid": ret.data.rid,
                        "fileType": ret.data.type,
                        "beginTime": ret.data.startTime,
                        "endTime": ret.data.endTime
                    };

                    if (ret.data.saveTime == -2) {
                        this.isImg = false
                        this.isocxPlayer = false
                        this.errorinfo = '文件已过期'
                        notification.error({
                            message: '文件已过期',
                            title: '温馨提示'
                        })
                    } else {

                        ajax({
                            url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + item.rid,
                            method: 'get',
                            data: {}
                        }).then(ret => {
                            if (ret.code == 0) {
                                let wsFileURL = ret.data[0].wsFileURL
                                // let wsFileURL = "http://10.10.18.19:8080/disk1/2018-05-07/shishi_87s5463y901311929289/shishi@2018-04-27_16-38-16.mp4"
                                // 图片
                                if (RegExpPic.test(wsFileURL) || item.type == 2) {
                                    this.isImg = false
                                    this.imgUrl = wsFileURL
                                    this.isImg = true
                                    this.isocxPlayer = false
                                    return
                                }
                                // 视频 // 音频
                                if (RegExpVidio.test(wsFileURL) || RegExpAudio.test(wsFileURL) || item.type == 0 || item.type == 1) {
                                    this.isImg = false
                                    this.isocxPlayer = false
                                    delete_ocx()
                                    this.ocxPlayerConfig.play_status = false
                                    setTimeout(() => {
                                        this.ocxPlayerConfig.video_url = wsFileURL
                                        this.isocxPlayer = true
                                        this.ocxPlayerConfig.play_status = true
                                    }, 300)
                                    return
                                }

                                // 其它类型
                                notification.error({
                                    message: '其它类型的文件需要下载查看',
                                    title: '温馨提示'
                                })
                            } else {
                                this.isImg = false
                                this.isocxPlayer = false
                                this.errorinfo = '请求媒体资源错误'
                                notification.error({
                                    message: ret.msg,
                                    title: '温馨提示'
                                })
                            }
                        })
                    }


                    //添加关联页面返回
                    if (this.toggleShowTJGL) return
                    this.mediaInfomation = ret.data
                    this.mediaInfomation.match = this.mediaInfomation.match ? '已关联' : '未关联'
                    if (this.mediaInfomation.saveTime == -2) {
                        this.mediaInfomation.saveTime = '已过期'
                    } else if (this.mediaInfomation.saveTime == -1) {
                        this.mediaInfomation.saveTime = '永久存储'
                    } else {
                        this.mediaInfomation.saveTime = this.mediaInfomation.saveTime + '' + '天'
                    }

                    this.cjxx()
                } else {
                    this.isImg = false
                    this.isocxPlayer = false
                    this.errorinfo = '请求媒体资源错误'
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    })
                }
            })


        },
        clickindex: 0,
        clickitem: '',
        clickone(item, index) {
            item.checked = item.checked ? false : true

            if (item.checked) {
                this.delRelevanceData.push(item.rid)
            } else {
                avalon.each(this.delRelevanceData, (i, el) => {
                    if (el == item.rid) {
                        this.delRelevanceData.splice(i, 1)
                    }
                })
            }
            this.delRelevanceData = this.delRelevanceData.distinct()
        },

        // 删除关联弹窗
        show_confirm: false,
        // 删除关联
        delgl() {
            if (this.delRelevanceData.length) {
                setTimeout(function () {
                    $("#iframe_zfsyps").css({
                        "opacity": 1
                    })
                    $("#iframe_zfsyps").show();
                }, 300)
                this.show_confirm = true
                this.ocxPlayerConfig.dialog_status = false
                tjgl_confirm.delRelevance = this.delRelevanceData.length
            } else {
                notification.error({
                    message: '请选择需要删除的关联媒体',
                    title: '温馨提示'
                })
            }
        },
        // 播发器提示信息
        errorinfo: '',
        // 确定删除关联
        handleOk_confirm() {
            let data = {
                bh: this.mid,
                rids: this.delRelevanceData,
                trafficLEType: delRelevance.trafficLEType
            }

            for (let i = 0; i < this.delRelevanceData.length; i++) {
                if (this.delRelevanceData[i] == this.mediaInfomation.rid) {
                    // 媒体信息
                    this.mediaInfomation = {}
                    this.checkLooking = ''

                    // 播发器停止播放

                    if (this.ocxPlayerConfig.play_status || this.isImg) {
                        this.isocxPlayer = false
                        this.isImg = false
                        this.ocxPlayerConfig.play_status = false
                        this.errorinfo = '文件已删除'
                    }
                    break
                }
            }

            ajax({
                url: delRelevance.url,
                method: 'post',
                data
            }).then(ret => {
                if (ret.code === 0) {
                    notification.success({
                        message: '删除成功',
                        title: '温馨提示'
                    })
                    this.delRelevanceData = []
                    // 重新查询数据
                    this.searchJQInfo()
                    this.allchecked = false
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            })
            this.handleCancel_confirm1()
        },

        // 取消删除关联
        handleCancel_confirm1() {
            $('#iframe_zfsyps').hide()
            $("#iframe_zfsyps").css({
                "opacity": 0
            })
            setTimeout(() => {
                this.show_confirm = false
                this.ocxPlayerConfig.dialog_status = true
            }, 30)
        },
        // 关联弹窗移动回调
        move_return(a, b) {
            $("#iframe_zfsyps").css({
                width: '299px', //---- 这个是弹窗的宽度
                height: '180px', //---- 这个是弹窗的高度
                left: b,
                top: a
            });
        },
        // 添加关联按钮
        addgl() {
            this.errorinfo = ''
            this.isImg = false
            this.isocxPlayer = true
            this.toggleShowCk = false
            this.toggleShowTJGL = true
            this.ischeckAllGL = false
            this.tjglData = []
            this.ocxPlayerConfig.play_status = false
            let ocxPlayer_dia = $(".tjgl-dialog .TJGLDIA .player_dia")
            this.ocxPlayerConfig.web_width = ocxPlayer_dia.width()

            this.tjgl_search(0)
        },
        // 下载
        download() {
            this.ocxPlayerConfig.play_status = false
            if (this.delRelevanceData.length) {
                if (this.delRelevanceData.length > 1) {
                    notification.info({
                        message: '单次下载只能选取一个媒体文件',
                        title: '温馨提示'
                    })
                    return false
                }
                ajax({
                    url: '/gmvcs/audio/basefile/findBaseFileByRid?rid=' + this.delRelevanceData,
                    method: 'get',
                }).then(ret => {
                    if (ret.code == 0) {
                        if (ret.data.saveTime == -2) {
                            notification.error({
                                message: '文件已过期',
                                title: '温馨提示'
                            })
                        } else {
                            ajax({
                                url: '/gmvcs/uom/file/fileInfo/vodInfo?vFileList[]=' + this.delRelevanceData[0],
                                method: 'get',
                                data: {}
                            }).then(ret => {
                                if (ret.code == 0) {
                                    let wsFileURL = ret.data[0].wsFileURL
                                    window.open(wsFileURL)
                                } else {
                                    notification.error({
                                        message: ret.msg,
                                        title: '温馨提示'
                                    })
                                }
                            })
                        }
                        this.mediaInfomation = ret.data
                    } else {
                        notification.error({
                            message: ret.msg,
                            title: '温馨提示'
                        })
                    }
                })
            } else {
                notification.info({
                    message: '请选择需要下载的关联媒体',
                    title: '温馨提示'
                })
            }
        },

        // 查看基本信息
        infoname: '简易程序信息',
        jbxx_clickClass: 'jbxx-btn',
        jbxx_show: true,
        jbxx(e) {
            this.jbxx_clickClass = 'jbxx-btn'
            this.cjxx_clickClass = 'cjxx-btn'
            this.jbxx_show = true
            this.cjxx_show = false
            this.reduceWordForJbxx()
        },
        // 基本信息提示
        reduceWordForJbxx() {
            let _this = this

            setTimeout(() => {
                let $jbxx = $('.jbxx')
                $jbxx.find('.innerSpan').each(function () {
                    let $this = $(this)
                    if ($this.text().length > 8) {
                        $this.attr('data-toggle', 'popover')
                        $this.attr('data-placement', 'top')
                        _this.setPopover($this)
                    }
                });
                $jbxx.find($("[data-toggle='popover']")).popover({
                    trigger: 'manual',
                    container: 'body',
                    placement: 'bottom',
                    html: 'true',
                    content: function () {
                        return '<div class="title-content">' + $(this).text() + '</div>'
                    },
                    animation: false
                })
                $('.title-content').css('max-height', '100px')
            }, 50)

        },
        setPopover: function (ele) {
            ele.on("mouseenter", function () {
                var _this = this
                clearTimeout(_this.timer)
                _this.timer = setTimeout(function () {
                    $('div').siblings(".popover").popover("hide")
                    $(_this).popover("show")
                }, 1000)

                $(this).siblings(".popover").on("mouseleave", function () {
                    $(_this).popover('hide')
                })
            }).on("mouseleave", function () {
                var _this = this
                clearTimeout(_this.timer)
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide")
                    }
                }, 100)
                $(".popover").on("mouseleave", function () {
                    $('.popover').hide()
                });
            }).on('shown.bs.popover', function () {
                $('.popover').mouseleave(function () {
                    $('.popover').hide()
                })
            });
        },

        // 查看媒体信息
        cjxx_clickClass: 'cjxx-btn',
        cjxx_show: false,
        cjxx(e) {
            this.jbxx_clickClass = 'cjxx-btn';
            this.cjxx_clickClass = 'jbxx-btn';
            this.jbxx_show = false;
            this.cjxx_show = true;

            this.reduceWordForJbxx()
        },
        // 媒体信息data
        mediaInfomation: {},
        // 查看 page
        toggleShowCk: true,
        // 添加关联 page
        toggleShowTJGL: false,

        // 添加关联播发器显示
        ocxPlayer_dia: false,
        // 返回
        goBackFromTjgl() {
            this.isImg = false
            this.isocxPlayer = true
            this.toggleShowCk = true
            this.toggleShowTJGL = false
            this.ocxPlayerConfigSet()
        },
        bjsj: ['last-week'],
        dateShow: false,
        searchForm_bjsj_Change(e) {
            this.bjsj = [e.target.value];
            if (e.target.value == 'last-past-of-time') {
                this.dateShow = true
            }
        },
        diamt_total: 0, //总数
        selected_length: 0, //已选择
        diaglmt_data: [], //添加关联数据

        // 添加关联数据分页
        pagination: {
            total: 0,
            pageSize: 0,
            current: 0
        },
        // 当前页面切换
        getCurrent(getCurrent) {
            this.ischeckAllGL = false
            this.diaglmt_data = []
            this.tjgl_search(getCurrent - 1)
        },

        // 查询关联数据
        searchData: {
            startTime: '',
            endTime: '',
            user: ''
        },
        // enter 查询
        searchonChange(e) {
            this.tjgl_search(this.pagination.current - 1)
        },
        timeMode: [1],
        isDuration: false,
        startTime(e) {
            this.searchData.startTime = e.target.value
        },
        endTime(e) {
            this.searchData.endTime = e.target.value
        },
        json: {},
        $searchForm: createForm({
            autoAsyncChange: true,
            onFieldsChange: function (fields, record) {
                if (vm) {
                    vm.json = record
                    vm.searchData.user = record.user
                }
            }
        }),
        time_Change(e) {
            this.timeMode[0] = e.target ? e.target.value : e;
            switch (this.timeMode[0]) {
                case 2:
                    this.searchData.startTime = moment().startOf('month').format('YYYY-MM-DD');
                    this.searchData.endTime = moment().endOf('month').format('YYYY-MM-DD');
                    this.isDuration = false;
                    break;
                case 3:
                    this.searchData.startTime = moment().subtract(3, 'months').format('YYYY-MM-DD');
                    this.searchData.endTime = moment().format('YYYY-MM-DD');
                    this.isDuration = true;
                    break;
                default:
                    //moment从星期天开始一个星期，所以需要加一天才能从星期一开始一个星期
                    this.searchData.startTime = moment().subtract(1, 'days').startOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.searchData.endTime = moment().subtract(1, 'days').endOf('week').add(1, 'days').format('YYYY-MM-DD');
                    this.isDuration = false;
            }
        },

        // 添加关联查询
        tjgl_search(page = 0, pageSize = 5) {
            let jsonData = {}
            this.ischeckAllGL = false
            jsonData.user = this.json.user
            jsonData.startTime = this.searchData.startTime + ' 00:00:00'
            jsonData.endTime = this.searchData.endTime + ' 23:59:59'

            this.tjglData = []
            jsonData.startTime = new Date(jsonData.startTime.replace(/-/g, '/')).getTime()
            jsonData.endTime = new Date(jsonData.endTime.replace(/-/g, '/')).getTime()

            if (jsonData.startTime > jsonData.endTime) {
                notification.error({
                    message: '开始时间不能大于结束时间',
                    title: '温馨提示'
                })
                return
            }
            let seachParams = {
                bh: this.mid,
                endTime: '',
                gllx,
                page,
                pageSize,
                startTime: '',
                user: ""
            }
            avalon.mix(seachParams, jsonData)

            ajax({
                url: '/gmvcs/audio/basefile/findRelevance',
                method: 'post',
                data: seachParams,
                cache: false
            }).then(ret => {

                if (ret.code === 0) {
                    this.allchecked = false

                    ret.data.currentElements.forEach(function (val, key) {
                        val.checked = false
                    })
                    this.diaglmt_data = ret.data.currentElements

                    this.pagination.pageSize = ret.data.perPages
                    this.pagination.current = ret.data.currentPages + 1
                    if (ret.data.overLimit) {
                        this.pagination.total = ret.data.limit
                    } else {
                        this.pagination.total = ret.data.totalElements
                    }
                } else {
                    this.diaglmt_data = []

                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    })
                }
            })
        },
        input_focus(e) {
            avalon(e.target.nextSibling).css('display', 'inline-block')
        },
        input_blur(e) {
            avalon(e.target.nextSibling).css('display', 'none')
        },
        // 添加关联数据
        // 全选
        ischeckAllGL: false,
        // 已经关联数据
        isrelevanceStatus: [],
        checkAllGL() {
            if (!this.diaglmt_data.length) {
                return
            }
            this.ischeckAllGL = this.ischeckAllGL ? false : true
            if (this.ischeckAllGL) {
                this.tjglData = []
                this.isrelevanceStatus = []
                avalon.each(this.diaglmt_data, (i, el) => {
                    if (el.relevanceStatus) {
                        this.isrelevanceStatus.push(el.rid)
                    } else {
                        el.checked = true
                        this.tjglData.push(el.rid)
                    }
                })

                if (!this.tjglData.length) {
                    notification.info({
                        message: '抱歉该页数据已关联',
                        title: '温馨提示'
                    })
                    this.ischeckAllGL = false
                    return
                }

                if (this.isrelevanceStatus.length) {
                    notification.info({
                        message: '已为您选择未关联的数据',
                        title: '温馨提示'
                    })
                }

            } else {
                avalon.each(this.diaglmt_data, (i, el) => {
                    el.checked = false
                })
                this.tjglData = []
            }
        },
        tjglData: [],
        // 添加关联选择
        clickMT_dia(item, index) {
            if (item.relevanceStatus) {
                return false
            }
            item.checked = item.checked ? false : true
            if (item.checked) {
                this.tjglData.push(item.rid)
            } else {
                avalon.each(this.tjglData, (i, el) => {
                    if (el == item.rid) {
                        this.tjglData.splice(i, 1)
                    }
                })
                this.ischeckAllGL = false
            }
            this.tjglData = this.tjglData.distinct()
        },
        // 添加
        handleOkAdd(trafficLEType) {
            let rids = this.tjglData

            if (!this.tjglData.length) {
                notification.info({
                    message: '请选择需要关联的文件',
                    title: '温馨提示'
                })
                return
            }

            let data = {
                bh: this.mid,
                rids,
                trafficLEType: addRelevance.trafficLEType
            }

            ajax({
                url: addRelevance.url,
                method: 'post',
                data
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '添加成功',
                        title: '温馨提示'
                    })

                    // 返回上一个界面
                    this.goBackFromTjgl()
                    // 刷新一遍关联数据
                    this.searchJQInfo()
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    })
                }
            })
        }
    }
})


let tjgl_confirm = avalon.define({
    $id: 'tjgl-confirm',
    title: '提示',
    delRelevance: 0
});