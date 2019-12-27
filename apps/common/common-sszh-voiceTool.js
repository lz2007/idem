/*
* 实时指挥音量调节工具
* */
require('./common-sszh-voiceTool.css');
let soundMaxPix,vm;
let vmd = avalon.component('common-sszh-voiceTool', {
    template: __inline('./common-sszh-voiceTool.html'),
    defaults: {
        IsIe:true,
        soundLevel: 0,
        soundStartLevel: 10,
        soundShow: false,
        soundIsDown: false,
        soundStartY: 0,
        index:'',//ocx窗口值
        handleSound(event) {
            this.soundShow = !this.soundShow;
            soundMaxPix = $('.sound-level-wrap').height();
        },
        handleSoundMouseLeave(event) {
            this.handleSoundMouseUp();
            this.soundShow = false;
        },
        handleSoundScroll(event) {
            let dis = - event.deltaY || event.wheelDelta;
            if (dis > 0 && this.soundLevel < 100) {
                //上滚：音量加
                this.soundLevel++;
            } else if (dis < 0 && this.soundLevel > 0) {
                //下滚：音量减
                this.soundLevel--;
            }


        },
        handleSoundMouseDown(event) {
            this.soundIsDown = true;
            this.soundStartY = event.clientY;
            this.soundStartLevel = this.soundLevel;
        },
        handleSoundMouseMove(event) {
            if (!this.soundIsDown) {
                return;
            }
            let disPix = this.soundStartY - event.clientY;
            let disLevel = Math.floor((disPix / soundMaxPix) * 100);
            let level = this.soundStartLevel + disLevel;
            if (level > 100) {
                this.soundLevel = 100;
            } else if (level < 0) {
                this.soundLevel = 0;
            } else {
                this.soundLevel = level;
            }
        },
        handleSoundMouseUp(event) {
            this.soundIsDown = false;
        },
        handleSoundLevel:avalon.noop,
        onInit(event){
            vm = event.vmodel;
            vm.IsIe = isIE();
            this.$watch('soundLevel', (v) => {
                this.handleSoundLevel(v+1);
            })
        },
        onReady(){
            // let _this = this;
            // if(vm.IsIe){
            //     eventUtil.addHandler(document,'mousewheel',vm.handleSoundScroll);
            // }else{
            //     eventUtil.addHandler(document,'DOMMouseScroll',vm.handleSoundScroll);
            // }

        },
        onDispose(){
            // if(vm.IsIe){
            //     eventUtil.removeHandler(document,'mousewheel', vm.handleSoundScroll);
            // }else{
            //     eventUtil.removeHandler(document,'DOMMouseScroll',vm.handleSoundScroll);
            // }
        }
    }

})
function isIE()
{
    if(!!window.ActiveXObject || "ActiveXObject" in window)
        return true;
    else
        return false;
}
var handlers = {};
var eventUtil = {
    addHandler	: function(element, type, handler){
        if(!handlers[type]){
            handlers[type]=[handler];
        }else{
            handlers[type].push(handler);
        }
        if(element.addEventListener){
            element.addEventListener(type, handler, false);
        }else if (element.attachEvent){
            element.attachEvent('on' + type , handler);
        }else{
            element['on' + type] = handler;
        }
    },
    removeHandler : function(element, type, handler){
        var fun;
        for(var i=0,len=handlers[type].length;i<len;i++){
            if(handlers[type][i].toString()==handler.toString()){
                fun = handlers[type][i];
                handlers[type].splice(i,1);
            }
        }
        if(element.removeEventListener){
            element.removeEventListener(type, fun, false);
        }else if(element.detachEvent){
            element.detachEvent('on' + type, fun);
        }else {
            element['on' + type] = null;
        }
    }
};