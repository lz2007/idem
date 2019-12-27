/**
 * 数据量大时的下拉框
 * 将数据按照每次pageSize的数量分批处理
 * @prop {Array} options 下拉框数据数组
 * @prop {String} value 当前选中值（默认为第一个）
 * @prop {Boolean} showSearch 是否开启搜索
 * @prop {Boolean} loading 加载状态
 * @prop {Number} page 次数标志，当为1时表示最后一次处理
 * @prop {Number} pageTotal 分批处理的总次数
 * @prop {Number} pageSize 分批处理的单次数量
 * @prop {String} displayValue 无可选项时出现的提示
 * @event {Function} onChange 当选择项改变或options为空时触发，参数(selectedLabel, selectedValue)
 * @event {Function} getLoading 获取当前加载状态，参数(current)
 * @example
 * ```
 * <ms-large-select :widget="{options:allotOptions,value:@defaultAllot,showSearch:true,loading:@allotLoading,page:@allotPageByOrg,pageTotal:@allotPageTotal,pageSize:@allotPageSize,displayValue:'暂无可选的配发对象',onChange:@allotChange,getLoading:@getLoading}"></ms-large-select>
 * ```
 */
import avalon from 'avalon2';
require('/apps/common/common-ms-select.css');
let language_txt = require('../../vendor/language').language;
avalon.component('ms-large-select', {
    template: __inline('./common-ms-select.html'),
    defaults: {
        owner: 'owner',
        value: '',
        selectedValue: '',
        selectedLabel: '',
        isDown: false,
        options: [],
        searchOptions: [],
        searchValue: '',
        showSearch: false,
        displayValue: '',
        page: 0,
        pageSize: 500,
        pageTotal: 0,
        loading: true,
        onChange: avalon.noop,
        getLoading: avalon.noop,
        msSelect_language: language_txt.xtywgl.msSelect,
        handleTrigger(event) {
            this.isDown = !this.isDown;
            this.searchValue = '';
            if (this.isDown && this.showSearch) {
                this.$element.getElementsByTagName('input').search.focus();
            }
        },
        handleSelect(event) {
            this.isDown = false;
            this.selectedValue = $(event.target).attr('data-value');
        },
        onInit: function (event) {
            this.$watch('page', (v, n) => {
                if (!v) {
                    return;
                }
                let html = ``;
                for (let i = (this.pageTotal - this.page) * this.pageSize; i < (this.pageTotal - this.page) * this.pageSize + this.pageSize; i++) {
                    if (i >= this.options.length) {
                        break;
                    }
                    let option = this.options[i];
                    html += `<li class="list-item ${this.selectedValue === option.value ? 'list-item-selected' : ''}" title="${option.label}" data-value="${option.value}">${option.label}</li>`;
                }
                $('.common-ms-select .all-list').append(html);
                if (this.page == 1) {
                    //立即加入队列，但等前面的代码执行完再执行（解决ie8中到此处会提醒运行缓慢的问题）
                    setTimeout(() => {
                        this.loading = false;
                        this.getLoading(this.loading);
                        this.value = this.value ? this.value : this.options[0].value;
                        this.selectedValue = this.value;
                        this.value = '';
                    }, 0)
                }
            });
            this.$watch('options', (v) => {
                if (!v || !this.options.length) {
                    this.value = '';
                    this.selectedValue = '';
                    this.selectedLabel = '';
                    $('.common-ms-select .all-list').html('');
                    this.onChange(this.selectedLabel, this.selectedValue);
                    return;
                }
            });
            this.$watch('selectedValue', (v) => {
                if (!v || !this.options || !this.options.length) {
                    return;
                }
                let selected = this.options.filter((item) => {
                    return item.value === this.selectedValue;
                });
                this.selectedLabel = selected.length ? selected[0].label : "";
                $('.common-ms-select .list-item').removeClass('list-item-selected');
                $('.common-ms-select [data-value=' + v + ']').addClass('list-item-selected');
                this.onChange(this.selectedLabel, this.selectedValue);
            });
            this.$watch('searchOptions', (v, n, w) => {
                if (!v || !v.length) {
                    $('.common-ms-select .search-list').html('');
                    return;
                }
                let html = '';
                for (let i = 0; i < v.length; i++) {
                    html += '<li class="list-item ' + (this.selectedValue === v[i].value ? 'list-item-selected' : '') + '" title="' + v[i].label + '" data-value="' + v[i].value + '">' + v[i].label + '</li>'
                }
                $('.common-ms-select .search-list').html('').append(html);
            });
            this.$watch('searchValue', (v) => {
                this.searchOptions = this.getFilteredOptions();
            });
            $(document).on('click', this.hidePanel);
        },
        hidePanel(e) {
            let $target = $('.common-ms-select-' + this.owner);
            if (this.isDown && !$target.is(e.target) && $target.has(e.target).length === 0) {
                this.isDown = false;
                this.searchValue = '';
            }
        },
        getFilteredOptions() {
            return this.options.filter(this.filterFn);
        },
        filterFn(el) {
            var reg = new RegExp(avalon.escapeRegExp(this.searchValue), 'i');
            return reg.test(el.label);
        },
        onReady: function (event) {},
        onDispose: function (event) {
            $(document).off('click', this.hidePanel);
            $('.common-ms-select .all-list').html('');
            $('.common-ms-select .search-list').html('');
        },
        isLabelVisible(isDown, options, loading, showSearch) {
            return (!isDown && options.length && !loading) || (isDown && !showSearch);
        },
        isAllVisible(isDown, searchValue) {
            return isDown && !searchValue;
        },
        isSearchVisible(isDown, showSearch, searchValue) {
            return isDown && showSearch && searchValue;
        },
    }
});