/**
 * 插件下载提示
 */
import {
    message
} from "ane";
import {
    gxxOcxVersion,
    languageSelect
} from '../../services/configService';
let language_txt = require('../../vendor/language').language;

let url = '/static/GSVideoOcxSetup(' + gxxOcxVersion + ').exe';
require('/apps/common/common-download-tip.css');

const pagesVm = avalon.component('ms-download-tip', {
    template: __inline('./common-download-tip.html'),
    defaults: {
        show: false,
        info: '',
        plugLink: url,
        getShowStatus: avalon.noop,
        languageTxt: language_txt.sszhxt.main,
        handleOk() {
            let link = document.getElementById('download-link');
            link.click();
            this.show = false;
            this.getShowStatus(this.show)
        },
        handleCancel() {
            this.show = false;
            this.getShowStatus(this.show)
        },
        onInit: function (event) {
            this.$watch('show', (show) => {
                if (show) {
                    avalon.scan($('.modal-download-tip').get(0));
                }
            })
        },
        onReady: function (event) {},
        onDispose: function (event) {}
    },
    soleSlot: 'info'
});