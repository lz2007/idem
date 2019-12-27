

//用法实例：<ms-selects :widget="{css:@css,input:@select}"></ms-selects>
import {
    Gm
} from '../common/common-tools.js';
require('/apps/common/common-input.css');
require('/apps/common/common-select.css');

function Tools(name) {
    Gm.call(this, name);
};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools('inputs');

let common_input = null;
const gminput = avalon.component('ms-selects', {
    template: __inline('./common-select.html'),
    defaults: {
        css: avalon.noop,
        input: avalon.noop,
        change: function (e) {
            this.input.value = e.target.value;
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
            this.input.vm = this;
            this.input.valid = true;
        },
        onReady: function (event) {

        },
        onDispose: function (event) {
            
        }
    }
});