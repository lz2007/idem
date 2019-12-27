// 公共引用部分，兼容IE8
require('/apps/common/common');

// === demo核心内容 ===
require('/apps/common/common-login');

require('./shandong-ling-login.less');

export const name = "ms-shandong-line-login";

avalon.component(name, {
    template: __inline('./shandong-line-login.html'),
    defaults: {}
})

avalon.scan(document.body);