/**
 * 可输入可模糊匹配的输入选择框
 * 可以直接从可选列表中选中某项，也可以自己输入内容
 * 当输入的内容在可选列表中存在，则选中的是存在的该项
 * 当输入的内容在可选列表中不存在，则选中的项为{label:输入内容,value:null}这样将value传给后台就会新增该项到可选列表中
 * @prop {String} owner 唯一标识符（相当于元素id的作用）
 * @prop {String} searchLabel 输入的描述值/选择项的描述值
 * @prop {Array} options 可用于选择的下拉列表数据
 * @prop {Boolean} isIcon 是否显示图标
 * @event {Function} getSearchLabel 获取当前的searchLabel
 * @event {Function} getSelected 获取当前选择的选择项的label及value
 * @event {Function} onFocus 输入框获得焦点时触发
 * @event {Function} onBlur 输入框失去焦点时触发
 * @example 
 * <ms-search-select :widget="{owner:'manufacturer', searchLabel:@inputJson.manufacturer,options:@manufacturerOptions,getSearchLabel:getSearchLabel,getSelected:getSearchSelected,onFocus:@handleSearchSelectFocus,onBlur:@handleSearchSelectFormat}"></ms-search-select>
 * 
 */
import avalon from 'avalon2';
require('/apps/common/common-search-select.css');

avalon.component('ms-search-select', {
    template: __inline('./common-search-select.html'),
    defaults: {
        owner: 'owner',
        options: [],
        searchOptions: [],
        searchLabel: '',
        searchValue: '',
        visible: false,
        isIcon: true,
        hasSelect: false, //是否从可选的下拉列表中选中了某项
        getSelected: avalon.noop,
        getSearchLabel: avalon.noop,
        onFocus: avalon.noop,
        onBlur: avalon.noop,
        onInit: function (event) {
            this.$watch('searchLabel', (v) => {
                this.hasSelect = false;
                this.searchOptions = this.getFilteredOptions();
                if ((!this.searchLabel || this.searchOptions.length) && this.isFocus) {
                    this.visible = true;
                }
                this.getSearchLabel(v, this.owner);
            });
            $(document).on('click', this.hidePanel);
        },
        onReady: function (event) {},
        onDispose: function (event) {
            $(document).off('click', this.hidePanel);
        },
        handleTrigger(event) {
            this.visible = !this.visible;
        },
        handleSelect(event) {
            this.searchLabel = $(event.target).attr('data-label');
            this.searchValue = $(event.target).attr('data-value');
            this.visible = false;
            this.hasSelect = true;
            this.onBlur(event, this.owner);
            this.getSelected(this.searchLabel, this.searchValue, this.owner);
        },
        isFocus: false,
        handleFocus(event) {
            this.isFocus = true;
            this.searchOptions = this.options;
            this.onFocus(event, this.owner);
        },
        handleBlur(event) {
            this.isFocus = false;
            this.onBlur(event, this.owner);
        },
        getFilteredOptions() {
            return this.options.filter(this.filterFn);
        },
        filterFn(el) {
            var reg = new RegExp(avalon.escapeRegExp(this.searchLabel), 'i');
            return reg.test(el.label);
        },
        hidePanel(e) {
            let $target = $('.common-search-select-' + this.owner);
            if (this.visible && !$target.is(e.target) && $target.has(e.target).length === 0) {
                this.visible = false;
                if (this.hasSelect) {
                    return;
                }
                //当用户未选择时，判断用户输入的值是否已经存在
                //如果存在则直接使用存在value值，不存在则将value设为null以表示要新建
                let $searchItems = $('.common-search-select .search-list .list-item');
                let isExisted = false;
                let existValue = "";
                $.each($searchItems, (index, ele) => {
                    if (this.searchLabel === $(ele).attr('data-label')) {
                        isExisted = true;
                        existValue = $(ele).attr('data-value');
                        return false;
                    }
                })
                if (isExisted) {
                    this.searchValue = existValue;
                    this.getSelected(this.searchLabel, this.searchValue, this.owner);
                } else {
                    this.getSelected(this.searchLabel, null, this.owner);
                }
            }
        },
        $computed: {
            searchData() {
                // var search = this.searchLabel;
                // if (search) {
                //     return this.options.filter(function (option) {
                //         return Object.keys(option).some(function (key) {
                //             return String(option[key]).toLowerCase().indexOf(search) > -1
                //         })
                //     })
                // }

                return this.options;
            },
            toggle() {
                return this.visible && this.isFocus;
            },
            getTriangleDir() {
                return (!this.visible || (this.searchLabel && !this.searchOptions.length)) ? "fa-caret-down" : "fa-caret-up";
            }
        }
    }
});