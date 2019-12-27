import avalon from 'avalon2';
import ajax from '../../services/ajaxService';


export const name = 'common-header';
let {
    mainIndex
} = require('/services/configService');


avalon.component(name, {
    template: __inline('./common-header.html'),
    defaults: {
        currentUserName: '',
        logout() {
            global.sessionStorage.removeItem('adminSession');
            global.location.href = '/main-login.html';

        }
    }
});