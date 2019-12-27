import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import '../common/common-tyywglpt.css';
import '../common/common-ms-table/common-ms-table';

import {
    createForm,
    message,
    notification
} from 'ane';

export const name = 'tyywglpt-ptjlgl-xlwgl';

//页面组件
avalon.component(name, {
    template: __inline('./tyywglpt-ptjlgl-xlwgl.html'),
    defaults: {
        loading: false,
        // 表格
        list: avalon.range(20).map(n => ({
            id: n,
            name: '老狼' + n,
            address: '深山',
            province: '老林',
            checked: false
        })),
        // 表格-操作回调
        actions(type, text, record, index) {
            if (type == 'delete') {
                this.list.removeAll(el => el.id == record.id);
                message.success({
                    content: '删除成功'
                });
            }
        },
        // 表格-选择回调
        selectChange(type, data) {
            // console.log(type)
            // console.log(data)
            // console.log(this.list)
        },

        // 分页
        pagination: {
            total: 100,
            pageSize: 20,
            current: 1
        },
        getCurrent(current) {
            console.log(current)
        }
    }
});