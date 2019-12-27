import {
    notification
} from 'ane';
export let burn_ocx = {
    burn: null,
    //播放器路径。审讯一体机本地磁盘路径，刻录OCX已固定安装目录，一般不修改该项
    playerPath: 'C:\\gosun\\GSWebOCXPackageCD\\GoSun.MultiWindowPlayer\\',
    downloadIP: document.location.host,
    //笔录数据下载，后台服务器
    downloadSVR: 'http://' + document.location.host + '/cmt/service/records/',
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
        if (retData.code == 0) {
        } else {
            notification.error({
                message: retData.resultMessage,
                title: '温馨提示'
            });
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
}