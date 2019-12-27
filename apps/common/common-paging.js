/**
 * 分页组件
 * @prop {Number} [current=1] 当前页
 * @prop {Number} [pageSize=10] 每页的数据量
 * @prop {Number} total 数据总量
 * @event {Function} onChange 当页码改变时触发，参数current
 * @event {Function} getCurrent 获取当前页码，参数current
 * @event {Function} getPageSize 获取当前每页数据量,参数pageSize
 * @example
 * ```
 * <ms-paging :widget="{total:100,onChange:@handlePageChange,getCurrent:@getCurrent,getPageSize:@getPageSize}"></ms-paging>
 *
 * <ms-paging :widget="{current:@currentPage,pageSize:@pageSize,total:@total,onChange:@handlePageChange,getCurrent:@getCurrent,getPageSize:@getPageSize}"></ms-paging>
 * ```
 */
import { notification } from "ane";
require('/apps/common/common-paging.css');

const pagingVm = avalon.component('ms-paging', {
    template: __inline('./common-paging.html'),
    defaults: {
        current: 1,
        pageSize: 10,
        total: 0,
        readonly:{},
        $computed: {
            pageTotal: function () {
                return Math.ceil(this.total / this.pageSize);
            }
            // start: function () {
            //     let startNum = (this.current - 1) * this.pageSize;
            //     return startNum || 1;
            // },
            // end: function () {
            //     let endNum = this.current * this.pageSize;
            //     return endNum > this.total ? this.total : endNum;
            // }
        },
        handleEnter(e) {
            if (e.keyCode == 13){
                let exp = /\d/g;
                let value = parseInt(e.target.value);
                if($(e.target).hasClass('pagesize')){
                    if (!exp.test(e.target.value) || isNaN(value)) {
                        notification.error({
                            message: '请输入正确的数字！',
                            title: '通知'
                        });
                        return false;
                    }
                    // this.pageSize = value;
                    // this.current = 1;
                    this.getCurrent(1);
                    this.getPageSize(value);
                    this.onChange(1);
                }else{
                    if (e.keyCode == 13 && $(e.target).hasClass('current')) {
                        if (!exp.test(e.target.value) || value < 1 || value > this.pageTotal || isNaN(value)) {
                            notification.error({
                                message: '请输入正确的页码！',
                                title: '通知'
                            });
                            return false;
                        }
                        this.current = value;
                        this.getCurrent(this.current);
                        this.onChange(this.current);
                    }
                }
            }
        },
        prevPage: function () {
            if (this.current > 1) {
                this.current--;
                this.getCurrent(this.current);
                this.onChange(this.current);
            } else {
                notification.warn({
                    message: '当前页已经是第一页！',
                    title: '通知'
                });
            }
        },
        nextPage: function () {
            if (this.current < Math.ceil(this.total / this.pageSize)) {
                this.current++;
                this.getCurrent(this.current);
                this.onChange(this.current);
            } else {
                notification.warn({
                    message: '当前页已经是最后一页！',
                    title: '通知'
                });
            }
        },
        toStartPage: function () {
            if (this.current > 1) {
                this.current = 1;
                this.getCurrent(this.current);
                this.onChange(this.current);
            } else {
                notification.warn({
                    message: '当前页已经是第一页！',
                    title: '通知'
                });
            }
        },
        toEndPage: function () {
            if (this.current < this.pageTotal) {
                this.current = this.pageTotal;
                this.getCurrent(this.current);
                this.onChange(this.current);
            } else {
                notification.warn({
                    message: '当前页已经是最后一页！',
                    title: '通知'
                });
            }
        },
        refresh: function () {
            this.getCurrent(this.current);
            this.getPageSize(this.pageSize);
            this.onChange(this.current);
            notification.success({
                message: '刷新成功！',
                title: '通知'
            });
        },
        onChange: avalon.noop,
        getCurrent: avalon.noop,
        getPageSize: avalon.noop,
        onInit: function (event) {
        },
        onReady: function (event) {
        },
        onDispose: function (event) {
        }
    }
});

