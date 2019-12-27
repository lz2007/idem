import ajax from '../../services/ajaxService.js';
import { createForm, message } from "ane";


 require('./sszhxt-xxcj.css');


export const name = 'sszhxt-xxcj';
const jqdj = avalon.component(name, {
    template: __inline('./sszhxt-xxcj.html'),
    defaults: {
        currentPage:"",
        activeIndex:0,
        menuData:[
            {url:"#!/sszhxt-xxcj/sszhxt-xxcj-sfzcj",name:"身份证采集"},
            {url:"#!/sszhxt-xxcj/sszhxt-xxcj-rlcj",name:"人脸采集"},
            {url:"#!/sszhxt-xxcj/sszhxt-xxcj-cpcj",name:"车牌采集"},
        ],
        onInit() {
          
        },
        onReady() {
            setTimeout(()=>{
                 avalon.router.navigate('sszhxt-xxcj/sszhxt-xxcj-sfzcj',2);
            },100);
        },
        handleMenuClick($index){
           this.activeIndex = $index;
        }
     


    }

});


avalon.scan(document.body);


//显示提示框
function showMessage(type, content) {
    message[type]({
        content: content
    });
};



/* api */
const _base = '/gmvcs/uap/';
/* 接口 */

/* 获取部门组织 */
function getDepartment() {
    return ajax({
        url: _base + 'app/all',
        type: 'get'
    });
}

