
//用法实例： <ms-datepick :widget="{css:@css, input:@date}"></ms-datepick>
import {
    Gm
} from '../common/common-tools.js';
require('/apps/common/common-input.css');
require('/apps/common/common-datepick.css');
function Tools(name) {
    Gm.call(this, name);
};
function Format() {};
function Reg() {};
Tools.prototype = Object.create(new Gm().tool);
Format.prototype = Object.create(new Gm().format);
Reg.prototype = Object.create(new Gm().reg);
let Gm_tool = new Tools('inputs');
let Gm_format = new Format();
let Gm_reg = new Reg();
let common_input = null;
const gminput = avalon.component('ms-datepick', {
    template: __inline('./common-datepick.html'),
    defaults: {
        css: avalon.noop,
        id:　'',
        alertShow: false,
        input: avalon.noop,
        onChange: function(e) {         
            this.alertShow = e.target.value ? false : true;
            this.input.valid = e.target.value ? true : false;
            let time = this.input.showTime ? Gm_format.getTimeByDateStr(e.target.value) : Gm_format.dateTransToTime(e.target.value);
            return this.input.timeChange && this.input.timeChange(time);
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
            this.id = +new Date();
            this.$watch('alertShow', function (v) { 
                this.input.valid = v ? false : true;
            });
            this.input.vm = this;
            this.input.valid = true;
            if (!this.input.value) {
                this.input.valid = false;
            }
        },
        onReady: function (event) {

        },
        onDispose: function (event) {
            
        }
    }
});