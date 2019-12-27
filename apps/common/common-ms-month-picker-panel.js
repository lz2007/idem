import * as avalon from 'avalon2';
import moment from 'moment';
require("/apps/common/common-ms-month-picker-panel.css");

export default function (cmpVm) {
    if (avalon.vmodels[cmpVm.panelVmId] !== undefined) {
        return avalon.vmodels[cmpVm.panelVmId];
    }

    return avalon.define({
        $id: cmpVm.panelVmId,
        currentDateArray: '',
        $moment: moment(),
        currentDay: 0,
        currentMonth: '',
        currentYear: 0,
        viewMode: 1,
        $startDate: null,
        $endDate: null,
        table: [],
        selectVal: "",
        disabledDate() {
            return false;
        },
        mutate_flag: true, //true 默认状态，false 点击了年份前进和后退的状态；为了年份前进和后退时共用reset函数
        double_right_disabled: false, // 面板显示年份>=当前年份 true，否则为false
        showTime: false,
        monthListLang: {
            "Jan": "一月",
            "Feb": "二月",
            "Mar": "三月",
            "Apr": "四月",
            "May": "五月",
            "Jun": "六月",
            "Jul": "七月",
            "Aug": "八月",
            "Sep": "九月",
            "Oct": "十月",
            "Nov": "十一月",
            "Dec": "十二月"
        },
        $computed: {

        },
        isSelected(el) {
            return el.isSelected;
        },
        isDisabled(el) {
            return el.isDisabled;
        },
        reset() {
            const monthTable = [];
            const monthList = moment.localeData().monthsShort();

            if (this.mutate_flag) {
                this.$moment = cmpVm.selected ? moment(cmpVm.selected, cmpVm.format) : moment();
                this.currentYear = this.$moment.year();
            }
            this.mutate_flag = true;
            if (this.currentYear >= parseInt(moment().format("Y")))
                this.double_right_disabled = true;
            else
                this.double_right_disabled = false;

            this.selectVal = this.$moment.format("MMM");

            if (monthTable.length === 0) {
                [0, 3, 6, 9].forEach(n => {
                    monthTable.push(monthList.slice(n, n + 3).map(m => ({
                        label: this.monthListLang[m],
                        value: m,
                        isSelected: this.selectVal == m ? true : false,
                        isDisabled: (this.double_right_disabled && monthList.indexOf(m) >= moment().format("M")) ? true : false
                    })));
                });
            }
            this.table = monthTable;

            this.viewMode = 1;
            this.currentDay = this.$moment.date();
            // this.currentMonth = this.$moment.format('MMM');
            this.currentMonth = this.monthListLang[this.$moment.format('MMM')];
            this.currentDateArray = this.$moment.toArray().toString();
            this.showTime = cmpVm.showTime;

            // 构造不可选择日期的判断函数
            if (cmpVm.startDate) {
                this.$startDate = moment(cmpVm.startDate, cmpVm.format);
            }
            if (cmpVm.endDate) {
                this.$endDate = moment(cmpVm.endDate, cmpVm.format);
            }
            if (cmpVm.startDate || cmpVm.endDate) {
                // 如果设置了开始日期和结束日期，则据此构造一个判断函数
                this.disabledDate = (current) => {
                    if (this.$startDate === null && this.$endDate === null) {
                        return false;
                    }
                    const currentMoment = moment(current);
                    const isSameOrAfterStartDate = currentMoment.isSameOrAfter(this.$startDate, 'date');
                    const isSameOrBeforeEndDate = currentMoment.isSameOrBefore(this.$endDate, 'date');
                    if (this.$startDate === null) {
                        return !isSameOrBeforeEndDate;
                    }
                    if (this.$endDate === null) {
                        return !isSameOrAfterStartDate;
                    }
                    return !(isSameOrAfterStartDate && isSameOrBeforeEndDate);
                };
            } else {
                // 否则使用默认的或者外部传进来的判断函数
                this.disabledDate = cmpVm.disabledDate;
            }
        },
        handleCellClick(el) {
            if (el.isDisabled)
                return;
            // this.currentMonth = el.value;
            this.currentMonth = el.label;
            this.$moment.month(el.value);
            this.currentDateArray = this.$moment.toArray().toString();
            this.complete();
        },
        mutate(action, ...args) {
            if (action == "add" && this.double_right_disabled)
                return;
            this.$moment[action].apply(this.$moment, args);
            this.currentDay = this.$moment.date();
            // this.currentMonth = this.$moment.format('MMM');
            this.currentMonth = this.monthListLang[this.$moment.format('MMM')];
            this.currentYear = this.$moment.year();
            this.currentDateArray = this.$moment.toArray().toString();

            if (this.currentYear >= parseInt(moment().format("Y")))
                this.double_right_disabled = true;
            else
                this.double_right_disabled = false;
            this.mutate_flag = false;
            this.reset();
        },
        today() {
            this.handleCalendarChange({
                target: {
                    value: moment()
                },
                type: 'calendar-changed'
            });
            this.complete();
        },
        handleCalendarChange(e) {
            this.$moment = e.target.value;
            this.currentDay = this.$moment.date();
            // this.currentMonth = this.$moment.format('MMM');
            this.currentMonth = this.monthListLang[this.$moment.format('MMM')];
            this.currentYear = this.$moment.year();
            if (!this.showTime) {
                this.complete();
            }
        },
        complete() {
            let _this = this;
            cmpVm.selected = this.$moment.format(cmpVm.format);
            this.selectVal = this.$moment.format("MMM");
            cmpVm.panelVisible = false;
            cmpVm.handleChange({
                target: {
                    value: cmpVm.selected
                },
                type: 'datepicker-changed'
            });
        },
        handleDblclick() {
            if (this.showTime) {
                this.complete();
            }
        }
    });
}