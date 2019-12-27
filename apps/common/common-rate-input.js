/**
 * 执法视音频数据管理系统 - 监督考评 - 综合考评 输入框组件
 *  @prop {num} num 遍历个数
 *  @prop {value} value 后台数据
 *  @prop {sign} sign 某一行xx率panel
 *  @event {onChange} onChange 操作事件  参数：index => 当前改变位置， record => 当前输入框组数据， value => 当前改变的输入框的值， data => 所有输入框改变后的新数据
 *  ----------------
 * <ms-rate-input :widget="{rateMin:@rateMin,rateMax:@rateMax point:@point}"></ms-rate-input>
 *  ----------------
 */

import {
    notification
} from 'ane';
require('/apps/common/common-rate-input.css');

export const name = 'ms-rate-input';

const msHeaderOperation = avalon.component(name, {
    template: __inline('./common-rate-input.html'),
    defaults: {
        data: [],
        num: 4,
        value: [],
        maxPoint: 0,
        onChange: avalon.noop,
        timer: 0,
        alertSign: false,
        sign: '',
        tips_text: '该得分不能超过权重分',
        handleChange(index, record, value, type) {
            // 限制只能输入数字
            if (/[^\d]/g.test(value)) {
                value = value.replace(/[^\d]/g, '');
                record[type] = Number(value);
            }
            if (value === '') { // 判断当前值是否为空
                $('.' + this.sign + 'input_' + index + '_' + type).addClass('input_error');
                $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                $('.' + this.sign + 'tips_' + index).css('display', 'block');
                $('.' + this.sign + 'tips_' + index).children().html('该输入框不能为空');
            } else {
                if (/^0[0-9]/.test(value)) { // 限制输入0+
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_' + type).addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('输入数据格式错误');
                } else if (Number(record.point) > Number(this.maxPoint)) { // 判断当前得分值是否大于权重分
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_' + type).addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('该得分不能超过权重得分');
                } else { // 都不符合条件，移除错误样式，即没有错误
                    $('.' + this.sign + 'input_' + index + '_rateMax').removeClass('input_error');
                    $('.' + this.sign + 'input_' + index + '_rateMin').removeClass('input_error');
                    $('.' + this.sign + 'input_' + index + '_point').removeClass('input_error');
                    $('.' + this.sign + 'tips_' + index).removeClass('rate-tips');
                    $('.' + this.sign + 'tips_' + index).css('display', 'none');
                }
                if ('' === record.rateMax) { // 判断最大百分率是否为空
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMax').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('该输入框不能为空');
                } else if ('' === record.rateMin) { // 判断最小百分率是否为空
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMin').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('该输入框不能为空');
                } else if ('' === record.point) { // 判断得分值是否为空
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_point').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('该输入框不能为空');
                }

                if (/^0[0-9]/.test(record.rateMax)) { // 限制输入0+
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMax').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('输入数据格式错误');
                } else if (/^0[0-9]/.test(record.rateMin)) {
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMin').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('输入数据格式错误');
                } else if (/^0[0-9]/.test(record.point)) {
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_point').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('输入数据格式错误');
                }

                // 首个xx率输入框框值不能大于100
                if (index == 0 && Number(record.rateMin) > 100) {
                    $('.' + this.sign + 'input_' + index + '_rateMin').addClass('input_error');
                        $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                        $('.' + this.sign + 'tips_' + index).css('display', 'block');
                        $('.' + this.sign + 'tips_' + index).children().html('该值不能大于100分！');
                }

                // 提示百分率递减
                if (index >= 1 && Number(record['rateMax']) > Number(this.data[index - 1].rateMin)) {
                    record['rateMax'] = this.data[index - 1].rateMin;
                    if ("" == record['rateMax']) {
                        $('.' + this.sign + 'input_' + index + '_rateMax').addClass('input_error');
                        $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                        $('.' + this.sign + 'tips_' + index).css('display', 'block');
                        $('.' + this.sign + 'tips_' + index).children().html('该输入框不能为空');
                    }
                } else if (index >= 1 && Number(record['rateMax']) <= Number(this.data[index - 1].rateMin) && /[\d]/g.test(Number(record['rateMax']))) {
                    if (Number(this.data[index - 1].point) > Number(this.maxPoint)) { // 判断当前得分值是否大于权重分
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_point').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('该得分不能超过权重得分');
                    } else if ('' === this.data[index - 1].point) { // 判断当前值是否为空
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_point').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('该输入框不能为空');
                    } else if ('' === this.data[index - 1].rateMax) { // 判断当前值是否为空
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMax').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('该输入框不能为空');
                    } else if ('' === this.data[index - 1].rateMin) { // 判断当前值是否为空
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMin').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('该输入框不能为空');
                    } else if (/^0[0-9]/.test(this.data[index - 1].point)) { // 限制输入0+
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_point').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('输入数据格式错误');
                    } else if (/^0[0-9]/.test(this.data[index - 1].rateMin)) { // 限制输入0+
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMin').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('输入数据格式错误');
                    } else if (/^0[0-9]/.test(this.data[index - 1].rateMax)) { // 限制输入0+
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMax').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('输入数据格式错误');
                    } else if (index > 1 && Number(this.data[index - 1].rateMax) < Number(this.data[index - 1].rateMin)) {
                        $('.' + this.sign + 'tips_' + String(index - 1)).addClass('rate-tips');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMax').addClass('input_error');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMin').addClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'block');
                        $('.' + this.sign + 'tips_' + String(index - 1)).children().html('最大值不能小于最小值');
                    } else {
                        $('.' + this.sign + 'input_' + String(index - 1) + '_point').removeClass('input_error');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMax').removeClass('input_error');
                        $('.' + this.sign + 'input_' + String(index - 1) + '_rateMin').removeClass('input_error');
                        $('.' + this.sign + 'tips_' + String(index - 1)).removeClass('rate-tips');
                        $('.' + this.sign + 'tips_' + String(index - 1)).css('display', 'none');
                    }
                }
                if (index >= 1 && Number(record.rateMax) < Number(record.rateMin)) {
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMax').addClass('input_error');
                    $('.' + this.sign + 'input_' + index + '_rateMin').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('最大值不能小于最小值');
                }
                if (index != (this.data.length - 1) && Number(record['rateMin']) < Number(this.data[index + 1].rateMax)) {
                    $('.' + this.sign + 'tips_' + index).addClass('rate-tips');
                    $('.' + this.sign + 'input_' + index + '_rateMin').addClass('input_error');
                    $('.' + this.sign + 'tips_' + index).css('display', 'block');
                    $('.' + this.sign + 'tips_' + index).children().html('不能少于其后的百分率');
                }
            }

            this.data.splice(index, 1, record);
            this.onChange(index, record, value, this.data);
        },
        // 失去焦点事件
        blurFunc(point, index) {

        },
        // 获得焦点事件
        focusFunc(point, index) {

        },
        onInit: function(event) {
            let _this = this;
            _this.data = [];
            for (var i = 0; i < _this.num; i++) {
                let obj = {
                    rateMin: '',
                    rateMax: '',
                    point: '',
                };
                _this.data.push(obj);
            }
            this.$watch('value', v => {
                if (v.length == 0) {
                    _this.data = [];
                    for (var i = 0; i < _this.num; i++) {
                        let obj = {
                            rateMin: '',
                            rateMax: '',
                            point: '',
                        };
                        _this.data.push(obj);
                    }
                } else if (_this.value.length < _this.num) {
                    _this.data = _this.value;
                    for (var i = 0; i < (_this.num - _this.value.length); i++) {
                        let obj = {
                            rateMin: '',
                            rateMax: '',
                            point: '',
                        };
                        _this.data.push(obj);
                    }
                } else {
                    _this.data = _this.value;
                }
            });

            // 通过监测maxPoint(权重分)的变化来进行错误提示
            this.$watch('maxPoint', v => {
                avalon.each(this.data, function(key, val) {
                    if (Number(val.point) > Number(v)) {
                        $('.' + _this.sign + 'input_' + key + '_point').addClass('input_error');
                        $('.' + _this.sign + 'tips_' + key).addClass('rate-tips');
                        $('.' + _this.sign + 'tips_' + key).css('display', 'block');
                    } else {
                        $('.' + _this.sign + 'input_' + key + '_point').removeClass('input_error');
                        $('.' + _this.sign + 'tips_' + key).removeClass('rate-tips');
                        $('.' + _this.sign + 'tips_' + key).css('display', 'none');
                    }
                    // 0 == ''  ==> true
                    // 0 === '' ==> false
                    if (val.point === '') {
                        $('.' + _this.sign + 'input_' + key + '_point').addClass('input_error');
                        $('.' + _this.sign + 'tips_' + key).addClass('rate-tips');
                        $('.' + _this.sign + 'tips_' + key).css('display', 'block');
                    }
                });
            });
        },
        onReady: function(event) {},
        onDispose: function(event) {}
    }
});