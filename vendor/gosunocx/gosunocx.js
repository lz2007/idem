/*
 * 高新兴播放器
 *
 * */
import moment from 'moment';
//用于继承设置
let extend = function () {
    var src, copyIsArray, copy, name, options, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
        deep = target;

        // skip the boolean and the target
        target = arguments[i] || {};
        i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
    }

    // extend jQuery itself if only one argument is passed
    if (i === length) {
        target = this;
        i--;
    }

    for (; i < length; i++) {

        // Only deal with non-null/undefined values
        if ((options = arguments[i]) != null) {

            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];

                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }

                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (jQuery.isPlainObject(copy) ||
                        (copyIsArray = jQuery.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];

                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = jQuery.extend(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    // Return the modified object
    return target;
};
let Indexcount = 0;
//存储流媒体序号，用于给多台流媒体服务器时使用。
let indexObject = {
    find: function (a) {
        return this[a];
    },
    set: function (b) {
        this[b] = Indexcount + 1;
        Indexcount = Indexcount + 1;
    }
};
let talkObject = {}; //用于关闭实时对讲
function Gxxplayer() {
    return this;
}
Gxxplayer.prototype = {
    defaults: {
        'element': '',
        'proxy': function () {
            return;
        },
        'viewType': 0, //视图类型 0--实时视图 1--录像视图
        'captureSavePath': 'D:\\CaptureFolder', //存储路径
        'videoSavePath': 'D:\\capture',
        'nMaxSplit': 16,
        'nDefaultSplit': 1
    },
    init: function (opt, callback) {
        // 配置信息
        this.settings = extend({}, this.defaults, opt);
        // 实时视频登陆信息
        this.loginInfo = [];
        // 语音对讲句柄
        this.lTalkHandle = -1;
        if (this.settings.element.length == 0) {
            return -1;
        }

        // 初始化设备SDK
        this.player = document.getElementById(this.settings.element);
        this.player.style.display = "block";
        // if (isIE()) {
        //     this.player.RegJsFunctionCallback(this.settings.proxy);
        // }
        this.player.GS_ReplayFunc(JSON.stringify({
            'action': 'InitDeviceSdk'
        }));
        this.player.RegJsFunctionCallback(this.settings.proxy);

        let _this = this;
        if (this.settings.viewType == 0) {
            setTimeout(function () {
                _this.createRealTimeView();
                 _this.player.RegJsFunctionCallback(_this.settings.proxy);
                (Object.prototype.toString.call(callback) === "[object Function]") && callback();
            }, 2000)
        } else {
            setTimeout(function () {
                _this.CreateRePlayView();
                _this.player.RegJsFunctionCallback(_this.settings.proxy);
                (Object.prototype.toString.call(callback) === "[object Function]") && callback();
            }, 2000)
        }
        return 0;
    },
    uninit: function () {

        let data = {};
        data.action = 'Delete';
        this.player.GS_ReplayFunc(JSON.stringify(data));

        data = {};
        data.action = 'LogOut';
        this.player.GS_ReplayFunc(JSON.stringify(data));

        this.settings = {};
        this.loginInfo = [];
        Indexcount = 0;
        indexObject = {
            find: function (a) {
                return this[a];
            },
            set: function (b) {
                this[b] = Indexcount + 1;
                Indexcount = Indexcount + 1;
            }
        };
        this.lTalkHandle = -1;
        return 0;
    },
    createRealTimeView: function () {
        let data = {};
        data.action = 'InitPara'; //设置视图标识，作为每个视图回调事件的标识
        data['arguments'] = {};
        data['arguments']['ocxID'] = "RealTimeView"; //用户自定义
        this.player.GS_RealTimeFunc(JSON.stringify(data));

        data = {};
        data.action = 'SetConfigParam'; //设置视图标识，作为每个视图回调事件的标识
        data['arguments'] = {};
        data['arguments']['captureSavePath'] = this.settings.captureSavePath; //抓图保存路径
        data['arguments']['savePath'] = this.settings.videoSavePath; //录像下载跟本地录像保存路径
        this.player.GS_RealTimeFunc(JSON.stringify(data));

        data = {};
        data.action = 'InitMonitorWnd'; //创建实时视图
        data['arguments'] = {};
        data['arguments']['nDefaultSplit'] = this.settings.nDefaultSplit;
        data['arguments']['nMaxSplit'] = this.settings.nMaxSplit;
        this.player.GS_RealTimeFunc(JSON.stringify(data));

        return 0;
    },
    login: function (opt) {
        let data = {};

        if (indexObject.find(opt.ssIp + opt.ssPort)) {
            return 0; //已经登录
        }
        indexObject.set(opt.ssIp + opt.ssPort);
        data.action = 'Login_SSServer';
        data['arguments'] = {};
        data['arguments']['nIndex'] = indexObject[opt.ssIp + opt.ssPort];
        data['arguments']['strIp'] = opt.ssIp;
        data['arguments']['nPort'] = parseInt(opt.ssPort);
        data['arguments']['userName'] = opt.ssUsername;
        data['arguments']['passWord'] = opt.ssPasswd;
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            delete indexObject[opt.ssIp + opt.ssPort]; //删除该流媒体的登录信息
            return ret.code;
        }
        return 0; //0表示成功
    },
    logoff: function (opt) {
        let data = {};
        if (!indexObject.find(opt.ssIp + opt.ssPort)) {
            return; //没有登录过
        }

        data.action = 'Logout_SSServer';
        data['arguments'] = {};
        data['arguments']['nIndex'] = indexObject[opt.ssIp + opt.ssPort];
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code;
        }
        delete indexObject[opt.ssIp + opt.ssPort]; //删除该流媒体的登录信息
        return 0; //0表示成功
    },
    //登录中心录像服务
    loginVod: function (opt) {
        let data = {};
        data.action = 'Login_VodServer';
        data['arguments'] = {};
        data['arguments']['strIp'] = opt.ssIp;
        data['arguments']['nPort'] = parseInt(opt.ssPort);
        data['arguments']['userName'] = opt.ssUsername;
        data['arguments']['passWord'] = opt.ssPasswd;
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code;
        }
        return 0; //0表示成功
    },
    //退出中心录像服务
    logoffVod: function (opt) {
        let data = {};
        data.action = 'Logout_VodServer';
        data['arguments'] = {};
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code;
        }
        return 0; //0表示成功
    },
    splitWnd: function (total, row, column) {
        let data = {};
        data.action = 'ChangeLiveDispSplit';
        data['arguments'] = {};
        data['arguments']['nDispSplit'] = total;
        row && (data['arguments']['nRow'] = row);
        column && (data['arguments']['nColumn'] = column);
        this.player.GS_RealTimeFunc(JSON.stringify(data));

        return 0;
    },
    getStatusByIndex: function (n) {
        var data = {};
        data.action = 'GetLiveDispWndInfo';
        data['arguments'] = {};
        data['arguments']['nIndex'] = parseInt(n);

        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code;
        }
        if (ret.data) {
            return ret.data.dispStatus; //空闲状态是0
        } else {
            return 0;
        }

    },
    playRecByUrl: function (opt) {
        console.log('触发playRecByUrl' + new Date().toLocaleTimeString())
        let data = {};
        data.action = 'PlayRealVideoByURL';
        data['arguments'] = {};
        data['arguments']['szDevID'] = opt.gbcode;
        data['arguments']['szURL'] = opt.url;
        data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return -1;
        }
        // setTimeout(() => {
        //     //须先开启声音
        //     this.handleSoundLevel(this.soundLevel);
        // }, 500);
        return 0;
    },
    playRec: function (opt) {
        console.log('触发playRec' + new Date().toLocaleTimeString());
        let data = {};

        //流媒体序号
        if (!indexObject.find(opt.ssIp + opt.ssPort)) {
            return -2; //表示没有登录
        }

        data.action = 'PlayRealVideoBySS';
        data['arguments'] = {};
        data['arguments']['nSSIndex'] = indexObject[opt.ssIp + opt.ssPort]; //流媒体序号
        data['arguments']['szDevID'] = opt.gbcode;
        data['arguments']['nStreamType'] = 1;
        data['arguments']['nDevType'] = 150001; //高新兴设备-150001；海康-30001
        data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        // setTimeout(() => {
        //     //须先开启声音
        //     this.handleSoundLevel(this.soundLevel);
        // }, 500);
        return 0;
    },
    stopRec: function (index) {
        console.log('触发stopRec' + new Date().toLocaleTimeString());
        let data = {};
        data.action = 'CloseRealVideo';
        data['arguments'] = {};
        data['arguments']['nIndex'] = index;
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        return 0;
    },
    startTalk: function (opt) {
        console.log('触发startTalk' + new Date().toLocaleTimeString());
        if (!indexObject.find(opt.ssIp + opt.ssPort)) {
            return -2; //表示没有登录
        }
        if (this.lTalkHandle != -1) {
            return -4; //已经有语音对讲了，提示他先关闭当前语音对讲
        }
        let data = {};
        data.action = 'StartTalk';
        data['arguments'] = {};
        data['arguments']['nIndex'] = 1;
        data['arguments']['szDevID'] = opt.gbcode;
        data['arguments']['nDevType'] = 150001;
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code < 1) {
            return ret.code; //语音成功的放回值初始1，每次加1
        }
        this.lTalkHandle = ret.code;
        talkObject[opt.gbcode] = ret.code;
        return 0;
    },
    stopTalk: function (gbcode) {
        console.log('触发stopTalk' + new Date().toLocaleTimeString());
        if (!talkObject[gbcode]) {
            return 0;
        }
        let data = {};
        data.action = 'StopTalk';
        data['arguments'] = {};
        data['arguments']['lHandle'] = talkObject[gbcode];
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        talkObject[gbcode] = -1;
        this.lTalkHandle = -1;
        return 0;
    },
    // 获取插件版本
    getVersion: function () {
        let data = {};
        data.action = 'GetVersion';
        var str = JSON.stringify(data);
        let ret = this.player.GS_ReplayFunc(str);
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return -1;
        }

        return ret.data.version;
    },
    //让某个窗口获取焦点
    focus: function (index) {
        let data = {};
        data.action = 'SetLiveDispFocus';
        data['arguments'] = {};
        data['arguments'].nIndex = parseInt(index);
        let str = JSON.stringify(data);
        let ret = this.player.GS_ReplayFunc(str);
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return -1;
        }
    },
    soundLevel: 80,
    //音量调节
    handleSoundLevel(v=80) {
        //须先开启声音
        this.SoundCtrl(1, 1, 1);
        this.setVolume(v);
    },
    //开启或禁音
    SoundCtrl: function (index, value, nVideoType) {
        let data = {};
        data.action = 'SoundCtrl';
        data['arguments'] = {};
        data['arguments']['nIndex'] = index; //窗口索引
        data['arguments']['nCtrlType'] = value; //0表示关闭，1表示开启
        data['arguments']['nVideoType'] = nVideoType; //1-实时视频；2-远程录像；3-本地录像
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
    },
    getVolume: function () {
        let data = {};
        data.action = 'OCXGetVolume';
        data['arguments'] = {};
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        return ret.nVolume;
    },
    // 音量调整
    setVolume: function (value) {
        let data = {};
        data.action = 'OCXSetVolume';
        data['arguments'] = {};
        data['arguments']['nVolume'] = parseInt(value);
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
    },
    //设置每个ocx窗口音量,不支持实时视频
    setOcxWindowVolume: function (value, index, nVideoType) {
        let data = {};
        data.action = 'SetVolume';
        data['arguments'] = {};
        data['arguments']['nVolume'] = parseInt(value);
        data['arguments']['nIndex'] = index;
        data['arguments']['nVideoType'] = nVideoType; //1-实时视频；2-远程录像；3-本地录像
        let ret = this.player.GS_RealTimeFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
    },
    /**
     * 创建录像视图
     */
    CreateRePlayView: function () {
        var data = {};
        data.action = 'InitPara'; //设置视图标识，作为每个视图回调事件的标识
        data['arguments'] = {};
        data['arguments']['ocxID'] = "ReplayView"; //用户自定义
        this.player.GS_RealTimeFunc(JSON.stringify(data));

        data = {};
        data.action = 'InitReplayWnd'; //创建录像视图
        data['arguments'] = {};
        data['arguments']['nDefaultSplit'] = 1;
        data['arguments']['nMaxSplit'] = 4;

        this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    /**
     * 录像控制
     * @param {Int} type 控制类型 0--播放 | 1-暂停 | 2-快放 | 3-慢放 | 4-单帧前进 | 5-静音? | 6-音量控制? | 7-进度? | 8-进度? | 9-停止 | 10-单帧后退
     * @param {Int} lParam 参数1
     * @param {Int} wParam 参数2
     * @param {Int} index 窗口号，-1表示当前窗口
     */
    controlVideotape: function (type, lParam, wParam, index) {
        var data = {};
        data.action = 'ReplayCtrl';
        data['arguments'] = {};
        data['arguments']['nCtrlType'] = type;
        data['arguments']['lParam'] = lParam;
        data['arguments']['wParam'] = wParam;
        data['arguments']['nIndex'] = index;

        this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    /**
     * 根据URL播放服务器上的录像
     * @param {Int} path 服务器上录像的路径
     * @param {Int} startTime 开始时间
     * @param {Int} endTime 结束时间
     */
    playVideotape: function (path, startTime, endTime) {
        var data = {};
        data.action = 'Replay_Ex';
        data['arguments'] = {};
        data['arguments']['szNodeID'] = "";
        data['arguments']['recordUrl'] = path;
        data['arguments']['szStartTime'] = startTime;
        data['arguments']['szEndTime'] = endTime;
        data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        return ret.code;
    },
    /**
     * 获取录像播放的时间戳
     */
    getPlayTimeStamp: function () {
        var data = {};
        data.action = 'GetPlayTimeStamp';
        data['arguments'] = {};
        data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        //ocx默认返回10位时间戳，js使用的是13位
        return ret.data.nTimeStamp * 1000;

    },
    getReplayWndInfoByIndex: function () {
        var data = {};
        data.action = 'GetReplayWndInfoByIndex';
        data['arguments'] = {};
        data['arguments']['nIndex'] = -1; //填写-1默认选择空闲窗口
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        return ret.data;
    },
    /**
     * 关闭所有录像
     */
    closeAllVideoTape: function () {
        var data = {};
        data.action = 'CloseAllReplayVideo';
        data['arguments'] = {};
        this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    /**
     * 设置是否显示录像窗口进度条 0--显示 | 1--隐藏
     */
    showVideotapeProcess: function (type) {
        var data = {};
        data.action = 'SetReplayWindowStyle';
        data['arguments'] = {};
        data['arguments']['nIndex'] = type;

        this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    /**
     * 设置是否显示窗口右上角的x  0--隐藏 | 1--显示
     */
    showVideoClose: function (type) {
        var data = {};
        data.action = 'EnableToolBar';
        data['arguments'] = {};
        data['arguments']['enable'] = type;
        this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    getVideotapeProcess: function (index) {
        var data = {};
        data.action = 'GetPlayProgress';
        data['arguments'] = {};
        data['arguments']['nIndex'] = index;
        let ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        return ret.data;
    },
    //全屏
    maxView: function () {
        var data = {};
        data.action = 'ChangeLiveDispSplit';
        data['arguments'] = {};
        data['arguments']['nDispSplit'] = 0;
        // data['arguments']['nRow'] = 1;
        // data['arguments']['nColumn'] = 1;
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ///ret = eval('(' + ret + ')');
    },
    //录像回放全屏
    lxhf_maxView: function () {
        var data = {};
        data.action='ChangeReplayDispSplit';
        data['arguments'] = {};
        data['arguments']['nDispSplit'] = 0;
        // data['arguments']['nRow'] = 1;
        // data['arguments']['nColumn'] = 1;
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ///ret = eval('(' + ret + ')');
    },
    exitFull: function () {
        var data = {};
        data.action = 'ChangeLiveDispSplit';
        data['arguments'] = {};
        data['arguments']['nDispSplit'] = -1;
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
    },
    //全屏截图，该版本ocx无此接口
    printscreen: function () {
        var data = {};
        data.action = 'CaptureScreen';
        data['arguments'] = {};
        data['arguments']['iUserDefine'] = 1;
        data['arguments']['iPopupFileDlg'] = 1;
        data['arguments']['nSpliceX'] = 50;
        data['arguments']['nSpliceY'] = 100;
        data['arguments']['nSpliceW'] = 100;
        data['arguments']['nSpliceH'] = 200;
        data['arguments']['szFileName'] = "D:\\file.jpg";
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
    },
    //视频播放窗口截图
    printOcxWindow: function (index) {
        var data = {};
        var time = moment().format('YYYY-MM-DD HH-mm-ss');
        data.action = 'CapturePicture';
        data['arguments'] = {};
        data['arguments']['szPicPath'] = "D:\\CaptureFolder\\" + time + ".jpg";
        data['arguments']['nIndex'] = index;
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        return {
            code: ret.code,
            time: time
        }
    },
    // 多通道语音对讲（不用登录流媒体）
    startTSTalk: function(szURL) {
        console.log('触发startTSTalk' + new Date().toLocaleTimeString());
        var data = {};
        data.action = 'TSStartTalk';
        data['arguments'] = {};
        data['arguments']['szURL'] = szURL;
        var ret = this.player.GS_ReplayFunc(JSON.stringify(data));
        ret = eval('(' + ret + ')');
        if (ret.code < 1) {
            return ret.code; //语音成功的放回值初始1，每次加1
        }
        this.lTalkHandle = ret.code;
        return 0;
    },
    // 多通道停止语音对讲
    stopTSTalk: function (gbcode) {
        // if (!talkObject[gbcode]) {
        //     return 0;
        // }
        var data = {};
        data.action = 'TSStopTalk';
        var str = JSON.stringify(data);
        let ret = this.player.GS_RealTimeFunc(str);
        ret = eval('(' + ret + ')');
        if (ret.code != 0) {
            return ret.code; //非0表示失败
        }
        // talkObject[gbcode] = -1;
        this.lTalkHandle = -1;
        return 0;
    }

};

function isIE() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}
export {
    Gxxplayer
};