/**
 * 统一运维管理平台----分页组件
 * @prop {Number} total 数据总量
 *  @prop {Number} current 当前页数
 * @event {Function} onChange 当页码改变时触发，参数current
 * @example
 * ```
 * <ms-pages :widget="{total:@total,onChange:@handlePageChange，current:@currentPage}"></ms-pages>
 *
 * ```
 */
import {
    message
} from "ane";
let {
    languageSelect
} = require('/services/configService');
require('/apps/common/common-pages.css');

const pagesVm = avalon.component('ms-pages', {
    template: __inline('./common-pages.html'),
    defaults: {
        languageSelect_pages: languageSelect == "zhcn" ? true : false,
        current: 1,
        pageSize: 20,
        total: 0,
        pageTotal: 0,
        $computed: {
            pageTotal: function () {
                return Math.ceil(this.total / this.pageSize);
            }
        },
        homePage: function () {
            if (this.current > 1) {
                this.getCurrent(1);
                this.onChange(this.current, this.pageSize);
            }
        },
        endPage: function () {
            if (this.current < this.pageTotal) {
                this.getCurrent(this.pageTotal);
                this.onChange(this.current, this.pageSize);
            }
        },
        prevPage: function () {
            if (this.current > 1) {
                this.getCurrent(--this.current);
                this.onChange(this.current, this.pageSize);
            }
        },
        nextPage: function () {
            if (this.current < this.pageTotal) {
                this.getCurrent(++this.current);
                this.onChange(this.current, this.pageSize);
            }
        },
        onChange: avalon.noop,
        getCurrent: avalon.noop,
        overLimit: false,
        onInit: function (event) {},
        onReady: function (event) {},
        onDispose: function (event) {}
    }
});