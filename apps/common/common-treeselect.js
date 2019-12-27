
//用法实例：<ms-treeselect :widget="{css:@css,data:@data, input:@tree}"> </ms-treeselect>
import {
    Gm
} from '../common/common-tools.js';
require('/apps/common/common-input.css');
require('/apps/common/common-treeselect.css');
function Tools(name) {
    Gm.call(this, name);
};
Tools.prototype = Object.create(new Gm().tool);
let Gm_tool = new Tools('inputs');

let common_input = null;
const gminput = avalon.component('ms-treeselect', {
    template: __inline('./common-treeselect.html'),
    defaults: {
        css: avalon.noop,
        id:　'',
        input: avalon.noop,
        change(event, treeId, treeNode, treeTarget) {
            this.input.value = treeNode.orgId;
            this.input.selectedKey = treeNode.orgId;
            this.input.selectedTitle = treeNode.orgName;
            return this.input.onChange && this.input.onChange(treeNode);
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
            this.input.valid = true;
        },
        onReady: function (event) {

        },
        onDispose: function (event) {
            
        }
    }
});