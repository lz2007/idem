/**
 * 海外版导航组件(具体用法可以参考zfsypsjglpt.js和zfsypsjglpt.html)
 * @prop  {Array}       sideMenu         一个数组对象，将经过权限控制后的菜单传进来即可。
 * @prop  {String}      systemName       字符串，传当前系统url的共有部分。例如视音频管理平台，传zfsypsjglpt；实时指挥系统，传sszhxt。
 * @prop  {Boolean}     completed        默认值为false，给sideMenu后将completed置为true。用于解决第一次无法跳转的问题。
 * @event {Function}    menuCallback     点击左侧菜单的回调(sideSelectedKeys/当前选中菜单的key, sideOpenKeys/当前打开菜单的key)
 * @example
 * ```
 * <ms-common-layout :widget="{sideMenu: @demsMenu, systemName:'zfsypsjglpt', menuCallback: @menuCallback}">
 *     <div class="ant-currentPage" ms-html="@currentPage"></div>
 * </ms-common-layout>
 * 
 * sideMenu数组对象例子：
 * [{
        key: 'zfsypsjglpt-sypgl-zfjlysyp',     --------没有children时，key值与url值相同
        title: '执法记录仪视音频',              --------系统显示名称，在权限筛选时会根据后台返回的进行匹配
        lic: 'AUDIO_MENU_SYPGL_ZFYSYP_JJ',     --------权限控制字段
        url: '/zfsypsjglpt-sypgl-zfjlysyp'     --------跳转路径
    },{
        key: 'tjfx',                           --------有children时，key值与children的key值二级名称相同
        title: '统计分析',
        icon: 'tjfx',
        lic: 'AUDIO_MENU_TJFX',
        children: [{
                key: 'zfsypsjglpt-tjfx-slqktj',
                title: '摄录情况统计',
                lic: 'AUDIO_MENU_TJFX_SLQKTJ_JJ',
                url: '/zfsypsjglpt-tjfx-slqktj'
        }]
    }]
 * ```
 */

require('./common-layout.less');
// require.async("/apps/common/common-player-npGxx");
let storage = require('/services/storageService').ret;
import {
    store
} from '/apps/common/common-layout-store.js';
import {
    menu
} from '/services/menuService';
import {
    titleNameStyle,
    hasLogo,
    languageSelect,
    defaultBrowser,
    gxxOcxVersion
} from '/services/configService';
let language_txt = require('../../vendor/language').language;

let name = 'ms-common-layout';
let layoutVm = null;


let chromeDownloadUrl = '/static/GSBbrowser_chrome-3.3.1.7301.exe', // 谷歌浏览器下载地址
    firefoxDownloadUrl = '/static/GSBrowser_firefox-3.3.1.7301.exe', // 火狐浏览器下载地址
    defaultDownloadUrl = '',
    eggDownloadUrl = '';

switch (defaultBrowser) {
    case 0:
        defaultDownloadUrl = firefoxDownloadUrl;
        eggDownloadUrl = chromeDownloadUrl;
        break;
    case 1:
        defaultDownloadUrl = chromeDownloadUrl;
        eggDownloadUrl = firefoxDownloadUrl;
        break;
}

// getUserInfo.then(info => {
//     if (layoutVm)
//         layoutVm.userName = storage.getItem('userName');
// });

avalon.component(name, {
    template: __inline('./common-layout.html'),
    soleSlot: 'container',
    defaults: {
        layout_txt: language_txt.mainIndex,
        cloudClass: languageSelect == 'en' ? '' : 'img_downloadCenter_zhcn',
        downloadCenter: language_txt.index.downloadCenter,
        hasLogo: hasLogo,
        userName: storage.getItem('userName') || "",
        topMenu: [],
        sideMenu: [],
        selectedNavKey: '',
        userDropdownShow: false,
        showSidemenu: true,
        systemName: "",
        sideOpenKeys: [""],
        sideSelectedKeys: [""],
        sideOpenArr: [""],
        authority: {
            "XGMM": false, // 修改密码
            "EWM": false, // 二维码
            "TCDL": false, // 退出登录
        },
        menuCallback: avalon.noop,
        completed: avalon.noop,

        //三级菜单
        thirdLevelNavigation: [],
        thirdLevelKey: "",
        showLevelNavigation: false,
        zfyps_dialog_width: 680,
        zfyps_dialog_height: 280,
        zfyps_ques_dialog_width: 550,
        zfyps_ques_dialog_height: 250,
        openOrderCenter() {
            progressFuc(0); //隐藏进度条
            downLoadVm.show = true;
            $("#iframe_download").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_download").css({
                    "opacity": 1
                });
                $("#iframe_download").show();
            }, 600);
        },
         //ie下新窗口自动全屏
        handleNewWindow(url) {
            var tmp = window.open(url, "_blank");
            tmp.moveTo(0, 0);
            tmp.resizeTo(screen.width, screen.height);
            tmp.focus();
            tmp.location = url;
        },
        // "?" 点击弹出弹窗
        questionClick() {
            questionVm.show = true;
        },
        thirdLevelClick(item) {
            this.thirdLevelKey = item.key;
            avalon.history.setHash(item.url);
        },

        sideMenuItemClick(item, key, keypath, index = 0) {
            let userAgent = navigator.userAgent;
            // if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1)
            //     delete_ocx();
            // console.log(key);
            this.sideSelectedKeys = new Array(key);
            this.menuCallback(this.sideSelectedKeys, this.sideOpenKeys);
            if (item.showChildren) {
                this.showLevelNavigation = true;
                this.thirdLevelNavigation = item.childrenArray;
                this.thirdLevelClick(item.childrenArray[index]);
                // avalon.history.setHash(item.childrenArray[0].url);
            } else {
                this.showLevelNavigation = false;
                this.thirdLevelNavigation = [];
                avalon.history.setHash(item.url);
            }
        },
        sideMenuOpenChange(arr) {
            this.sideOpenArr = arr.splice(-1, 1);
            this.sideOpenKeys = this.sideOpenArr;
            this.menuCallback(this.sideSelectedKeys, this.sideOpenKeys);
        },

        topMenuItemClick(item, evt, index) {
            window.location.href = item.url;
        },
        topMenuItemMouseOver(item, evt, index) {
            if (this.selectedNavKey != item.key) {
                evt.currentTarget.classList.add("meunActive");
            }
        },
        topMenuItemMouseLeave(item, evt, index) {
            if (this.selectedNavKey != item.key) {
                evt.currentTarget.classList.remove("meunActive");
            }
        },

        userInfoClick() {
            // if (!this.authority.XGMM && !this.authority.EWM && !this.authority.TCDL) { // 用户下拉无权限时限制点击
            // return;
            // }
            this.userDropdownShow = !this.userDropdownShow;
        },
        editPassword() {
            avalon.components['ms-header-operation'].defaults.changePwd.show = true;
        },
        loginOut() {
            avalon.components['ms-header-operation'].defaults.logout_vm.show_logout = true;
        },
        qrCodeClick() {
            avalon.components['ms-header-operation'].defaults.qrCodeVm.qrCodeShow = true;
        },

        onInit: function (event) {
            layoutVm = event.vmodel;
            let _this = this;
            menu.then(menu => {
                // 获取授权的顶部菜单
                _this.topMenu = menu.APP_MENU;
                let pathName = window.location.pathname.replace('/', '');
                avalon.each(_this.topMenu, (k, v) => {
                    if (v.url.replace('/', '') == pathName) {
                        _this.selectedNavKey = v.key;
                    }
                });

                _this.$watch('userDropdownShow', (v) => {
                    if (v) {
                        $(".user-drop-down").slideDown();
                        $(".user-drop-triangle").slideDown();
                    } else {
                        $(".user-drop-down").slideUp();
                        $(".user-drop-triangle").slideUp();
                    }
                });

                // 按钮权限配置
                let authorityList = menu.INDEX_MENU;
                if (authorityList && authorityList.length > 0) {
                    avalon.each(authorityList, (key, val) => {
                        switch (val) {
                            case 'INDEX_MENU_HOME_XGMM':
                                this.authority.XGMM = true;
                                break;
                            case 'INDEX_MENU_HOME_EWM':
                                this.authority.EWM = true;
                                break;
                            case 'INDEX_MENU_HOME_TCDL':
                                this.authority.TCDL = true;
                                break;
                        }
                    });
                }
            });
        },
        onReady: function (event) {
            setTimeout(() => {
                layoutVm.menuCallback(layoutVm.sideSelectedKeys, layoutVm.sideOpenKeys);
            }, 500);
            // if (languageSelect == 'en') {
                $(".common-layout .logo h4").html(titleNameStyle);
            // }
            // if (this.sideMenu.$model.length == 0) {
            //     this.showSidemenu = false;
            // $('.common-layout .layout-container').css({
            //     left: 20
            // });
            // }

            let _this = this;
            this.$watch('completed', (v) => {
                if (this.sideMenu.$model.length == 0) {
                    this.showSidemenu = false;
                    $('.common-layout .layout-container').css({
                        top: "80px",
                        left: 20
                    });
                } else if (this.sideMenu.$model.length > 0) {
                    this.showSidemenu = true;
                    $('.common-layout .layout-container').css({
                        top: "80px",
                        left: 140
                    });
                    if (this.sideMenu[0].showChildren && this.sideMenu[0].childrenArray.length > 0) {
                        this.showLevelNavigation = true;
                    }
                }

                if (v) {
                    let reg = new RegExp(_this.systemName, "");
                    if (!reg.test(global.location.hash)) { //默认选择第一个模块
                        if (_this.sideMenu.$model[0].children && _this.sideMenu.$model[0].children.length > 0) {
                            avalon.history.setHash(_this.sideMenu.$model[0].children[0].url);
                            let current_key = window.location.hash.split("/")[1];
                            _this.sideOpenKeys = new Array(current_key.split("-")[1]);
                            _this.sideOpenArr = new Array(current_key.split("-")[1]);
                            _this.sideSelectedKeys = new Array(_this.sideMenu.$model[0].children[0].key);
                        } else {
                            avalon.history.setHash(_this.sideMenu.$model[0].url);
                            _this.sideOpenKeys = new Array(_this.sideMenu.$model[0].key);
                            _this.sideOpenArr = new Array(_this.sideMenu.$model[0].key);
                            _this.sideSelectedKeys = new Array(_this.sideMenu.$model[0].key);
                        }
                    } else {
                        get_selectedKey(true);
                    }
                    let hash = global.location.hash;
                    for (let i = 0; i < _this.sideMenu.length; i++) {
                        if (hash.indexOf(_this.sideMenu[i].key) > -1 && _this.sideMenu[i].showChildren) {
                            for (let j = 0; j < _this.sideMenu[i].childrenArray.length; j++) {
                                if (hash.split("/")[1] == _this.sideMenu[i].childrenArray[j].key) {
                                    this.sideMenuItemClick(_this.sideMenu[i], _this.sideMenu[i].key, null, j);
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            });
            this.$fire('completed', this.completed);

            this.$watch('showLevelNavigation', (v) => {
                if (v) {
                    $(".common-layout .layout-container").css({
                        top: "144px",
                        left: "148px"
                    });
                } else {
                    if (this.showSidemenu) {
                        $('.common-layout .layout-container').css({
                            top: "80px",
                            left: 140
                        });
                    }
                }
            });
            this.$fire('showLevelNavigation', this.showLevelNavigation);

            avalon.bind(window, "hashchange", (e) => {
                if (window.location.hash.replace('#!/', '') == 'xtywgl-ccfwgl-cjzscfwgl') {
                    layoutVm.sideSelectedKeys = ['xtywgl-ccfwgl-index'];
                } else {
                    get_selectedKey(false);
                }
            });
            if (window.location.hash.replace('#!/', '') == 'xtywgl-ccfwgl-cjzscfwgl') {
                layoutVm.sideSelectedKeys = ['xtywgl-ccfwgl-index'];
            }

            //进入告警查询详情页面时，设置二级菜单“告警查询”高亮
            avalon.bind(window, "hashchange", (e) => {
                if (window.location.hash.replace('#!/', '') == 'sszhxt-gjglcontrol') {
                    layoutVm.sideSelectedKeys = ['sszhxt-gjgl-gjcx'];
                } else {
                    get_selectedKey(false);
                }
            });
            if (window.location.hash.replace('#!/', '') == 'sszhxt-gjglcontrol') {
                layoutVm.sideSelectedKeys = ['sszhxt-gjgl-gjcx'];
            }

            $("#iframe_download").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_download").css({
                    "opacity": 1
                });
                $("#iframe_download").show();
            }, 600);
            
            $(document).bind("keydown", function (event) {
                var ev = window.event || event;
                var code = ev.keyCode || ev.which;
                if (code == 116) {
                    // console.log(window.location.href.split("/"));
                    let hrefArr = window.location.href.split("/");
                    // console.log(hrefArr[hrefArr.length-1]);
                    if(hrefArr[hrefArr.length-1] == "zfsypsjglpt-sypgl-zfjlysyp-detail") {
                        // console.log('detail');
                        if (ev.preventDefault) {
                            ev.preventDefault();
                        } else {
                            ev.keyCode = 0;
                            ev.returnValue = false;
                        }
                        downLoadVm.show = false;
                        questionVm.show = false;
                        $("#iframe_download").hide();
                    }
                    
                }
            });

        },
        onViewChange: function (event) {
            // if (event.vmodel.sideMenu.$model.length > 0) {
            //     this.showSidemenu = true;
            // $('.common-layout .layout-container').css({
            //     left: 140
            // });
            // }
        },
        onDispose: function (event) {}
    }
});

// 下载中心弹窗
let downLoadVm = avalon.define({
    $id: 'confirm-downLoad',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
        $("#iframe_download").hide();
        progressFuc(1); //显示进度条
    },
    move_return(a, b) {
        $("#iframe_download").css({
            width: layoutVm.zfyps_dialog_width + "px",
            height: layoutVm.zfyps_dialog_height + "px",
            left: a,
            top: b
        });
    },
});

let downLoadInnerVm = avalon.define({
    $id: 'confirm-ctl-inner',
    title: language_txt.index.downloadCenter,
    version: "/static/GSVideoOcxSetup(" + gxxOcxVersion + ").exe",
    certificatePlugHref: '//' + document.location.host + '/cert_download/rootca_levam.crt',
    essentialPlug: language_txt.index.essentialPlug,
    flashPlug: language_txt.index.flashPlug,
    certificatePlug: language_txt.index.certificatePlug,
    gosuncnPlayer: language_txt.index.gosuncnPlayer,
    availableBrowsers: language_txt.index.availableBrowsers,
    gosuncnBrowser: language_txt.index.gosuncnBrowser,
    IE64: language_txt.index.IE64,
    IE32: language_txt.index.IE32,
    firefox32: language_txt.index.firefox32,
    help: language_txt.index.help,
    defaultDownloadUrl: defaultDownloadUrl, // 默认高新兴国迈安全浏览器下载地址
    ocxDownload(type) {
        switch (type) {
            case 1:
                {
                    window.open(`//${document.location.host}/static/flash_player.zip`, "_blank");
                    break;
                }
            case 2:
                {
                    window.open(`${this.certificatePlugHref}`, "_blank");
                    break;
                }
            case 3:
                {
                    window.open(`//${document.location.host}${this.version}`, "_blank");
                    break;
                }
            case 4:
                {
                    window.open(`//${document.location.host}/static/IE11-Windows6.1-x86-en-us.exe`, "_blank");
                    break;
                }
            case 5:
                {
                    window.open(`//${document.location.host}/static/Firefox-51.0(32-bit).exe`, "_blank");
                    break;
                }
        }
    },
    iconDownLoad(event) {
        let target = event.target;
        if (target == undefined)
            return;
        if (target.tagName.toLowerCase() == 'i') {
            window.open(target.previousSibling.href, '_self');
        }
    },
    openDownLoadHelp() {
        downLoadVm.show = false;
        $("#iframe_download").hide();

        setTimeout(function(){
            questionVm.show = true;
            $("#iframe_download").css({
                "opacity": 0
            });
            setTimeout(function () {
                $("#iframe_download").css({
                    "opacity": 1
                });
                $("#iframe_download").show();
                progressFuc(0); //隐藏进度条
            }, 600);
        }, 300)
        
    },
});


// "?" 弹窗
let questionVm = avalon.define({
    $id: 'question-ctl',
    show: false,
    // 取消
    editCancel() {
        this.show = false;
        $("#iframe_download").hide();
        progressFuc(1); //显示进度条
    },
    // 确定
    editOk() {
        this.show = false;
        $("#iframe_download").hide();
        progressFuc(1); //显示进度条
    },
    move_return(a, b) {
        $("#iframe_download").css({
            width: layoutVm.zfyps_ques_dialog_width + "px",
            height: layoutVm.zfyps_ques_dialog_height + "px",
            left: a,
            top: b
        });
    },
});

// "?" innerVM
let questionInnerVM = avalon.define({
    $id: 'question-ctl-inner',
    title: language_txt.index.helpWindowTitle,
    helpTip1: language_txt.index.helpTip1,
    helpTip2: language_txt.index.helpTip2,
    helpTip3: language_txt.index.helpTip3,
    helpTip4: language_txt.index.helpTip4,
});

function get_selectedKey(val) {
    let select_key = window.location.hash.split("/")[1];
    if (!select_key)
        return;
    if (select_key.split("-").length > 3) {
        let str_index = find_str(select_key, "-", 2);
        let selectedKey_txt = select_key.slice(0, str_index);
        layoutVm.sideSelectedKeys = new Array(selectedKey_txt);
        // if (layoutVm.showLevelNavigation) {
        //     layoutVm.thirdLevelKey = select_key;
        // }
    } else {
        layoutVm.sideSelectedKeys = new Array(select_key);
    }

    if (val) {
        layoutVm.sideOpenKeys = new Array(select_key.split("-")[1]);
        layoutVm.sideOpenArr = new Array(select_key.split("-")[1]);
    }
}

function find_str(str, cha, num) { //找到某字符在字符串中出现第N次的位置。str 字符串，cha 某字符，num 第N次
    var x = str.indexOf(cha);
    for (var i = 0; i < num; i++) {
        x = str.indexOf(cha, x + 1);
    }
    return x;
}

//判断是否为IE浏览器
function isIE_fuc() {
    if (!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}

//控制进度条是否显示
function progressFuc(val) { //进度条 --- 0 隐藏；1显示
    // let is_IE = avalon['components']['ms-player']['defaults'].is_IE;
    let is_IE = isIE_fuc();
    let globalOcxPlayer = null;
    if (is_IE) {
        globalOcxPlayer = document.getElementById('gxxPlayOcx');
    }else{
        globalOcxPlayer = document.getElementById('npGSVideoPlugin');
    }
    if (globalOcxPlayer == null) {
        // notification.warn({
        //     message: "请安装媒体播放器！",
        //     title: '提示'
        // });
        return;
    }
    var data = {};
    data.action = 'EnableToolBar';
    data['arguments'] = {};
    data['arguments']['enable'] = val;
    globalOcxPlayer.GS_ReplayFunc(JSON.stringify(data));
}

