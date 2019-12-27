import avalon from 'avalon2';
let storage = require('../../services/storageService.js').ret;
import {
    notification
} from 'ane';
import './zfsypsjglpt-zfda-ajgl-ck-gdkl.css';
import ajax from '../../services/ajaxService';

export const name = 'zfsypsjglpt-zfda-ajgl-ck-gdkl';
function getFileSize(fileByte) {
    var fileSizeByte = fileByte;
    var fileSizeMsg = "";
    if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
    else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
    else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(2) + "MB";
    else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
    else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    else fileSizeMsg = "文件超过1TB";
    return fileSizeMsg;
}
avalon.filters.getFileSize = function (str) {
    return getFileSize(str);
};
let burn_ocx = {
    burn: null,
    //播放器路径。审讯一体机本地磁盘路径，刻录OCX已固定安装目录，一般不修改该项
    playerPath: 'C:\\gosun\\GSWebOCXPackageCD\\GoSun.MultiWindowPlayer\\',
    downloadIP: document.location.host,
    //笔录数据下载，后台服务器
    downloadSVR: 'http://' + '10.10.9.252:5081',
    /**
     * 获取版本号
     *
     * 【同步返回】【JSON String】
     * {
     * "action":"GetOcxVersion"
     * "code":	0,                      //0表示成功，非零表示失败
     * "version":	"1.0.0.7321"        //版本号
     * }
     * @returns {*}
     */
    getVersion: function () {
        var data = "{\"action\":\"GetOcxVersion\"}";
        var result = this.burn.BurnManager(data);
        return result;
    },
    /**
     * 初始化刻录
     *
     * 【同步返回】【JSON String】
     * {
     * "action":"Init"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * }
     *
     * @returns {*}
     */
    load: function (id, callback) {
        this.burn = document.getElementById(id);
        var that = this;
        var data = "{\"action\":\"Init\"}";
        var result = this.burn.BurnManager(data);
        var ret = this.burn.JSCallBack(function (data) {
            that._onOcxEventProxy(data, callback);
        });
        return {
            status: ret,
            ocx: this.burn
        };
    },
    /**
     * 释放控件
     *
     * 【同步返回】【JSON String】
     * {
     * "action":"Unit"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * }
     * @returns {*}
     */
    unload: function () {
        var data = "{\"action\":\"Unit\"}";
        var result = this.burn.BurnManager(data);
        return result;
    },
    /**
     * 刻录文件
     * @param param 参数
     * eg:
     * param = {
     * title: 'Test1',
     * filePath:[
     *      'E:/work/src/CDRecord/bin/mux3.mkv',
     *      'E:/work/src/CDRecord/bin/智能审讯系统播放器.exe',
     *      'E:/work/src/CDRecord/bin/智能审讯系统播放器'
     * ],
     * downloadLink:[
     *      'http://172.16.11.201/cmt/service/records/case/download?recordMagicId=a123213213213213213213',
     *      'http://172.16.11.201/cmt/service/records/base/download?magicId=a123213213213213213213',
     *      'http://172.16.11.201/cmt/service/records/person/download?recordMagicId=a123213213213213213213',
     *      'http://172.16.11.201/cmt/service/records/content/download?recordMagicId=a123213213213213213213'
     *  ]
     * }
     *
     * 【同步返回】【JSON String】
     * 【说明】该返回为接口调用的返回，接下来还有异步返回
     * {
     * "action":"BurnFile"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * }
     *
     * 【异步返回】【JSON String】
     * 【说明】该返回为刻录接口的异步返回，因为刻录过程中可能还要下载文件。下载成功后即开始刻录。如果下载文件失败则返回[100021,下载失败]
     * {
     * "code":	0,                        //0表示成功，非零表示失败
     * "action":	"BrunFileNotify",     //刻录文件下载结果异步返回
     * "resultMessage":	"成功"            //描述信息
     * }
     * @returns {*}
     */
    startRecord: function (param) {
        var data = {
            action: 'BurnFile',
            nConnectTimeout: 3, //连接超时时间，0表示一直等待，大于0表示等待的秒数
            nDownloadTimeout: 10, //下载超时时间，0表示一直等待，大于0表示等待的秒数
            param: []
        };
        var disk = {};
        disk.title = param.title || ''; //标题
        disk.filePath = param.filePath; //要刻录的本地文件路径
        param.downloadLink && (disk.downloadLink = param.downloadLink); //要下载的文件URL
        data.param.push(disk);
        var str = JSON.stringify(data);
        var ret = this.burn.BurnManager(str);
        return ret;
    },
    /**
     * 检查是否有可用于刻录的盘符
     *
     * 【同步返回】【JSON String】
     * {
     * "action":"BurnGetAvailableDisks"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * }
     * @returns {*}
     */
    getAvailableDisks: function () {
        var data = "{\"action\":\"BurnGetAvailableDisks\"}";
        var result = this.burn.BurnManager(data);
        return result;
    },
    /**
     * 检查光盘是否可刻录
     * 该接口必须在调用“刻录文件”的接口返回100012（该光盘不可写可擦除）时才可以调用
     * 【同步返回】【JSON String】
     *
     * {
     * "action":"BurnEraseCD"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * }
     * @returns {*}
     */
    eraseCD: function () {
        var data = "{\"action\":\"BurnEraseCD\"}";
        var result = this.burn.BurnManager(data);
        return result;
    },
    /**
     * 回调函数
     * @param data
     * @returns {*}
     * @private
     */
    _onOcxEventProxy: function (data, callback) {
        'function' === typeof callback && callback(data);
        let retData = JSON.parse(data);
        if (retData.code == 0) {} else {
            notification.error({
                message: retData.resultMessage || retData.szRetMsg,
                title: '温馨提示'
            });
            ajglGdklmodel.startRecordName = '开始刻录';
            ajglGdklmodel.progressState = '未开始刻录';
            clearInterval(ajglGdklmodel.getProcessSetTime);
        }

        return JSON.parse(data);
    },
    /**
     * 获取刻录进度
     *【同步返回】【JSON String】
     * {
     * "action":"BurnEraseCD"
     * 	"code":	0,                      //0表示成功，非零表示失败
     * 	"resultMessage":	"成功"      //描述信息
     * 	"process": 0                    //刻录进度（0~100）,当没有在刻录时返回-1
     * }
     * @returns {*}
     */
    getProcess: function () {
        var data = "{\"action\":\"BurnGetProgress\"}";
        var result = this.burn.BurnManager(data);
        return result;
    }
};

let ajglGdklmodel = null;
let ajglGdkl = avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-ajgl-ck-gdkl.html'),
    defaults: {
        onInit() {
            this.loading = true;
            ajglGdklmodel = this;
            let data = 'type=0' + '&ajbh=' + window.sessionStorage.getItem('ajgl_bh') + '&page=-1' + '&pageSize=2';
            ajax({
                url: "/gmvcs/pzzz/file/list?" + data,
                method: 'get',
            }).then(result => {
                if (result.code == 0) {

                    avalon.each(result.data.currentElements, (i, item) => {
                        item.checked = false;
                        item.startTime = avalon.filters.date(item.startTime, 'yyyy-MM-dd HH:mm:ss');
                    });

                    this.data = result.data.currentElements;
                }
            }).always(() => {
                this.loading = false;
            });


            this.$watch('data.length', val => {
                let tableIndexTbody = $('.zfsypsjglpt-zfda-ajgl-gdkl .table-index-tbody');
                let tableIndexTbodyH = tableIndexTbody.height();
                let itemH = 33 * this.data.length;
                if (itemH > tableIndexTbodyH) {
                    this.paddingRight = 17;
                } else {
                    this.paddingRight = 0;
                }
            });

            $('#zfda-ajgl-gdkl-fileupload').off('change').on('change', (e) => {
                let files = e.currentTarget.files;

                for (let i = 0; i < files.length; i++) {
                    let filePathData = $('input[type=file]').val().split(',');
                    let filePath = null;
                    if (files.length == 1) {
                        filePath = filePathData[0].replace(/\\/g, "\\\\");
                    } else {
                        filePath = filePathData[i];
                    }

                    let data = {
                        fileName: files[i].name,
                        startTime: '-',
                        size: files[i].size,
                        checked: false,
                        filePath: $.trim(filePath)
                    };
                    this.data.push(data);
                }
            });

            this.$fire('data.length');

            setTimeout(() => {
                if (!avalon.msie) {
                    notification.error({
                        message: '抱歉!刻录功能暂只支持ie浏览器下刻录！',
                        title: '温馨提示'
                    });
                } else {
                    burn_ocx.load('regRecordObj');
                }
            }, 25);
        },
        onDispose() {
            clearInterval(this.getProcessSetTime);
            burn_ocx.unload();
        },
        getProcessSetTime: '',
        isStartRecord: false,
        startRecordName: '开始刻录',
        startRecord() {
            // if (this.isStartRecord) {
            //     return;
            // }
            // 获取版本号
            console.log(burn_ocx.getVersion());
            if(!burn_ocx.getVersion()){
                notification.error({
                    message: '抱歉!刻录功能需要下载高新兴光盘刻录插件！',
                    title: '温馨提示'
                });
                return;
            }
            clearInterval(this.getProcessSetTime);

            if (!avalon.msie) {
                notification.error({
                    message: '抱歉!刻录功能暂只支持ie浏览器下刻录！',
                    title: '温馨提示'
                });
            }
            // 检查是否有可用于刻录的盘符
            let getAvailableDisks = JSON.parse(burn_ocx.getAvailableDisks());
            console.log('检查是否有可用于刻录的盘符');
            console.log(getAvailableDisks);
            if (getAvailableDisks.code != 0) {
                notification.error({
                    message: getAvailableDisks.resultMessage,
                    title: '温馨提示'
                });
                return;
            }
            // 检查光盘是否可刻录
            // let eraseCD = JSON.parse(burn_ocx.eraseCD());
            // console.log('检查光盘是否可刻录');
            // console.log(eraseCD);
            // if (eraseCD.code != 0) {
            //     notification.error({
            //         message: eraseCD.resultMessage,
            //         title: '温馨提示'
            //     });
            //     return;
            // }

            this.isStartRecord = true;
            this.startRecordName = '刻录中';

            let filePath = [];
            avalon.each(this.data, (key, val) => {
                if (val.filePath && val.checked) {
                    filePath.push(val.filePath);
                }
            });
            let downloadLink = [];
            avalon.each(this.data, (key, val) => {
                if (val.httpUrl && val.checked) {
                    downloadLink.push(val.httpUrl);
                }
            });

            console.log(filePath);
            console.log(downloadLink);
            let param = {
                title: 'Test1',
                filePath,
                downloadLink
            };
            console.log(param);

            // 开始刻录
            this.progress = '0';
            burn_ocx.startRecord(param);

            this.getProcessSetTime = setInterval(() => {
                let getProcess = JSON.parse(burn_ocx.getProcess());
                console.log(getProcess);
                if (getProcess.code == 0) {
                    if (getProcess.process == 100) {
                        clearInterval(this.getProcessSetTime);
                        this.progressState = '刻录完成';
                        notification.success({
                            message: '刻录完成',
                            title: '温馨提示'
                        });
                    }
                    if (getProcess.process == -1) {
                        // clearInterval(this.getProcessSetTime);
                    }
                    this.progress = getProcess.process;
                    this.progressState = '正在刻录，请稍等......';
                } else {
                    this.progress = getProcess.process;
                    this.progressState = getProcess.resultMessage;
                    notification.error({
                        message: getProcess.resultMessage,
                        title: '温馨提示'
                    });
                }
            }, 3000);
            // 获取刻录进度
        },
        paddingRight: 0,
        selectNum: 0,
        totalFilesize: 0,
        loading: false,
        data: [],
        // 全选config
        checkboxAllConfig: {
            checked: false
        },
        progress: 0,
        progressState: '未开始刻录',
        // 全选回调
        checkboxAllChange(configData) {
            avalon.each(this.data, (index, item) => {
                item.checked = configData.checked;
            });
        },
        // list 单选回调
        checkboxChange(configData) {
            if (!configData.checked) {
                this.checkboxAllConfig.checked = false;
            }
            console.log(configData);
        }
    }
});

ajglGdkl.extend({
    displayName: 'ms-gdkl-checkbox',
    template: `<i class="fa" :css="[checkboxStyle,(config.checked?checkStyle:uncheckStyle)]" :click="@chage | stop | prevent" :class="[(config.checked?'fa-check-square checked':'fa-square-o')]"></i>`,
    defaults: {
        onInit(e) {},
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#0078d7'
        },
        uncheckStyle: {
            color: '#cccccc'
        },
        onChang: avalon.noop,
        chage(event) {
            try {
                if (this.config.hasOwnProperty('checked')) {
                    this.config.checked = !this.config.checked;
                    this.onChang(this.config);
                } else {
                    throw 'err';
                };
            } catch (err) {
                avalon.error('ms-gdkl-checkbox组件 config 参数未传入checked');
            }
        }
    }
})