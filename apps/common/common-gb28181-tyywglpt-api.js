import {
    notification
} from 'ane';

let language_txt = require('../../vendor/language').language;

export const errOK = 0;
export const notificationTitle = language_txt.xtywgl.bygl.tips;
export const message = language_txt.xtywgl.bygl.requestfailedunknownerror;

export function ajaxErrInfo(message = message, title = notificationTitle) {
    notification.error({
        message,
        title
    });
}

export function ajaxInfo(type = 'info', message = message, title = notificationTitle) {
    notification[type]({
        message,
        title
    });
}