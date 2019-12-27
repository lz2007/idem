import avalon from 'avalon2';
import './common-ms-month-picker.css';
import getPanelVm from './common-ms-month-picker-panel';

/**
 * 月份选择组件
 * @prop value 组件值(inherit)
 * @prop col 字段路径(inherit)
 * @prop format 日期格式，参考 momentjs，默认为 YYYY-MM-DD
 * @prop startDate 控制可已选择的时间的开始日期，日期字符串，格式与 format 参数匹配，设置此项自动忽略 disabledDate
 * @prop endDate 控制可已选择的时间的结束日期，日期字符串，格式与 format 参数匹配，设置此项自动忽略 disabledDate
 * @prop disabledDate 不可选择日期的判断函数，传入 current（当前遍历日期），返回 true 表示此日期不可选
 * @prop showTime 是否显示时间选择，如果此项为 true，则 format 默认为 YYYY-MM-DD HH:mm:ss
 * 
 * @example
 * ``` html
 * 
 * ```
 */

avalon.component('ms-month-picker', {
    template: __inline('./common-ms-month-picker.html'),
    defaults: {
        width: 'auto',
        clearShow: "none",
        format: 'YYYY-MM-DD',
        placeholder: '',
        lang: 'cn',
        direction: 'down',
        selected: '',
        value: '',
        panelVmId: '',
        panelVisible: false,
        panelClass: 'ane-datepicker-panel-container',
        panelTemplate: __inline('./common-ms-month-picker-panel.html'),
        onChange: avalon.noop,
        emitValue(e) {
            let v = e.target.value;
            v = v.toJSON ? v.toJSON() : v;
            this.value = v;
        },
        handleChange(e) {
            this.emitValue(e);
            this.onChange(e);
        },
        clear() {
            this.selected = '';
            avalon.vmodels[this.panelVmId].reset();
            this.handleChange({
                target: {
                    value: ''
                },
                type: 'datepicker-changed'
            });
        },
        handleClick(e) {
            if (!this.panelVisible) {
                avalon.vmodels[this.panelVmId].reset();
                this.panelVisible = true;
            } else {
                this.panelVisible = false;
            }
        },
        mapValueToSelected(value) {
            this.selected = value;
        },
        handlePanelHide() {
            this.panelVisible = false;
        },
        withInBox(el) {
            return this.$element === el || avalon.contains(this.$element, el);
        },
        getTarget() {
            return this.$element;
        },
        onInit: function () {
            this.selected = this.value;
            this.$watch('value', v => {
                this.mapValueToSelected(v);
                // this.handleChange({
                //     target: { value: v },
                //     denyValidate: true,
                //     type: 'datepicker-changed'
                // });
            });
            this.$watch('selected', v => {
                if (v.length > 0)
                    this.clearShow = "";
                else
                    this.clearShow = "none";
            });

            this.panelVmId = this.$id + '_panel';
            const innerVm = getPanelVm(this);
            innerVm.reset();
        },
        onReady: function () {

        },
        $computed: {

        },
        onDispose() {
            delete avalon.vmodels[this.panelVmId];
        }
    }
});