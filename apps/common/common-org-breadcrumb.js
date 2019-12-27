require('/apps/common/common-org-breadcrumb.css');

const orgBreadcrumb = avalon.component('ms-org-breadcrumb', {
    template: __inline('./common-org-breadcrumb.html'),
    defaults: {
        list: [],
        cid: '',
        handleclick: avalon.noop,

        clickItem(index, item) {
            if(index !== 0 && index < this.list.length) {
                this.list = this.list.slice(0, index);
            }
            this.handleclick(index, item, this.list);
        }
    }
});