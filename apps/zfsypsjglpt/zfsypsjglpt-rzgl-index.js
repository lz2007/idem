import avalon from "avalon2";
import "ane";
import {
    message,
    notification,
    Loading
} from "ane";
import ajax from "/services/ajaxService";
export const name = "zfsypsjglpt-rzgl-index";
require("/apps/zfsypsjglpt/zfsypsjglpt-rzgl-index.css");


let zfyps_vm = avalon.component(name, {
    template: __inline("./zfsypsjglpt-rzgl-index.html"),
    defaults: {
        onInit() {},
        onReady() {
            notification.warn({
                message: '页面施工中...',
                title: '通知',
                timeout: 3000
            });
        }
    }
});