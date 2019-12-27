// 公共引用部分，兼容IE8
require('/apps/common/common');

// === demo核心内容 ===
require('/apps/common/common-login');

require('./main-line-login.less');

export const name = "ms-main-line-login";

avalon.component(name, {
    template: __inline('./main-line-login.html'),
    defaults: {}
})

avalon.scan(document.body);