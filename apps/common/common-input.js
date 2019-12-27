
import {
    Gm
} from '../common/common-tools.js';
require('/apps/common/common-input.css');

/*
    自定义自适应输入框组件:
    必传参数：
        css: 定义整个组件外包装高宽，内部即可自适应

        input: 格式 -> {name: 'xx', value: 'xx', required: 可选，默认为false} 
        name是输入组件字段名称，value是输入框内值, required代表是否必填字段
        注明: 如果是必填的字段，在定义的地方应注明valid等于false
    可选参数:
        type: 表单验证类型，默认是非法字符验证
              目前可提供验证类型:
              非法自发- > 'illegal_word'  
              数字 -> 'Number'
              自定义正则 -> 'custom

        afterClickX: 点击右边X图标的回调函数

        enter_click: 对输入框进行回车的快捷搜索

        regMessage: 在type传入'custom'即为自定义的正则验证便需要传入该参数
              格式 -> {reg: 'xxx', message: 'xxxx'}
    用法实例: <ms-inputs :widget="{css:@css,input:@input}"></ms-inputs>
*/
function Tools(name) {
    Gm.call(this, name);
};
function Reg(name) {
    Gm.call(this, name);
};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools('common-inputs');
Reg.prototype = Object.create(new Gm().reg);
let Gm_reg = new Reg('common-inputs-reg');

let common_input = null;
const gminput = avalon.component('ms-inputs', {
    template: __inline('./common-input.html'),
    defaults: {
        css: avalon.noop,
        input: avalon.noop,
        type: avalon.noop,
        regMessage:avalon.noop,
        id:　'',
        title: '',
        xSHow: false,
        alertShow: false,
        alertText: '',
        afterClickX: avalon.noop,
        enter: avalon.noop,
        enter_click: function(e) {

            if (e.keyCode == "13") {
                this.input_blur();
            }
            return this.enter && this.enter();
        },
        closeX() {
            this.input.value = '';
            return this.afterClickX && this.afterClickX(); 
        },
        input_focus() {
            this.xSHow = true;
        },
        input_blur() {
            this.xSHow = false;
            this.input.value = $.trim(this.input.value);
            if (this.input.required) {
                if (Gm_reg.require.test(this.input.value)) {
                    this.alertShow = false;
                    this.input.valid = true;
                } else {
                    this.alertShow = true;
                    this.alertText = Gm_reg.alertText.require;
                    return;
                }
            }
            if (typeof this.input.type != 'string') {
                this.input.type = 'illegal_word';
            }
            switch(this.input.type) {              
                case 'custom':
                    if (regMessage.reg.test(this.input.value)) {
                        this.alertShow = false;
                    } else {
                        this.alertShow = true;
                        this.alertText = regMessage.message;
                    }
                    break;
                case 'Number':
                    if (Gm_reg.minus.test(this.input.value) || Gm_reg.positive.test(this.input.value)) {
                        this.alertShow = false;
                    } else {
                        this.alertShow = true;
                        this.alertText = Gm_reg.alertText['Number'];
                    }
                    break;
                default:
                    if (!Gm_reg[this.input.type].test(this.input.value)) {
                        this.alertShow = false;
                    } else {
                        this.alertShow = true;
                        this.alertText = Gm_reg.alertText[this.input.type];
                    }
                    break;
            }
        },
        showMessage(message) {
            this.alertShow = true;
            this.alertText = message;
        },
        closeAlert() {
            this.alertShow = false;
            this.alertText =  Gm_reg.alertText[this.input.type];
        },
        onInit: function (event) {
            this.input.name = this.input.name ? this.input.name : '';
            this.title = this.input.name;
            this.id = Gm_tool.getRandom(8) + '' + +new Date();
            this.$watch('alertShow', function (v) { 
                this.input.valid = v ? false : true;
            });
            this.input.vm = this;
            this.input.valid = true;
            if (this.input.required) {
                this.alertText = Gm_reg.alertText.require;
                this.input.valid = false;
            }
        },
        onReady: function (event) {

        },
        onDispose: function (event) {
            
        }
    }
});