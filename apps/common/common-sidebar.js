import avalon from 'avalon2';
import ajax from '../../services/ajaxService';
import * as menuService from '../../services/menuService';
import {
    menu as menuStore
} from '../../services/storeService';
import {
    notification
} from 'ane';
import 'ane';

avalon.effect('collapse', {
    enter(elem, done) {
        $(elem).slideDown(200, done);
    },
    leave(elem, done) {
        $(elem).slideUp(200, done);
    }
});

export const name = 'common-sidebar';

avalon.component(name, {
    template: __inline('./common-sidebar.html'),
    defaults: {
        menu: [],
        selectedKeys: ['tyyhrzpt-xtpzgl-yhgl'],
        openKeys: [],
        handleMenuClick(item, key, keyPath) {
            if (key == 'tyyhrzpt-xtpzgl-sbk-rlk' || key == 'tyyhrzpt-xtpzgl-sbk-rylxk') {
                return;
            }
            avalon.history.setHash(item.uri);
            if (key == 'tyyhrzpt-xtpzgl-sbk-cpk') {
                $(event.target).parents('.ane-menu-submenu').addClass('ane-menu-item-selected');
            } else {
                $(event.target).parents('li.ane-menu-item').siblings('.ane-menu-submenu').removeClass('ane-menu-item-selected');
            }

        },
        handleOpenChange(openKeys) {
            this.openKeys = openKeys.slice(-1);
        },
        onInit(event) {
            menuService.menu.then((menu) => {
                this.menu = menu.CAS_MENU_TYYHRZPT;
                if (global.location.hash == '#!/') {
                    let firstSelectedNav = this.menu[0].uri;
                    avalon.history.setHash(firstSelectedNav); // 默认选中第一项菜单
                }
                let hash = global.location.hash;
                let keyPath = hash.replace("#!/", "");
                this.selectedKeys = "" == keyPath ? ["tyyhrzpt-xtpzgl-yhgl"] : [keyPath];
            });
            menuStore.selectedKeys$.subscribe(v => {
                let hash = global.location.hash;
                let keyPath = hash.replace("#!/", "");
                this.selectedKeys = "" == keyPath ? ["tyyhrzpt-xtpzgl-yhgl"] : [keyPath];
                if (keyPath == 'tyyhrzpt-xtpzgl-sbk-rlk' || keyPath == 'tyyhrzpt-xtpzgl-sbk-cpk') {
                    let timeEle = setInterval(() => {
                        let submenu = $('.ms-layout-sider .ane-menu .ane-menu-submenu');
                        if (submenu.length) {
                            submenu.addClass('ane-menu-item-selected');
                            clearInterval(timeEle);
                        }
                    }, 20);
                }
                //this.selectedKeys = v;
            });
            menuStore.openKeys$.subscribe(v => {
                let hash = global.location.hash;
                let keyPath = hash.replace("#!/", "");
                this.openKeys = "" == keyPath ? ["tyyhrzpt-xtpzgl-yhgl"] : [keyPath];
                //this.openKeys = v;
            });

            // 人员类型库设置list
            this.$watch('dialogRylxkszShow', newVal => {
                if (newVal) {
                    ajax({
                        url: '/gmvcs/uap/person/type/find/setting',
                        method: 'get'
                    }).then(ret => {
                        if (ret.code == 0) {
                            rylxksz.personlistAll = ret.data.personTypes;
                            rylxksz.threshold = ret.data.threshold;
                            // 全选是否打钩
                            let flab = true;
                            for (let i = 0; i < rylxksz.personlistAll.length; i++) {
                                if (!rylxksz.personlistAll[i].enable) {
                                    flab = false;
                                    break;
                                }
                            }
                            if (flab) {
                                rylxksz.checkedAll = true;
                            }
                        }
                    });
                }
            });

            let recognitionUrl = null;

            ajax({
                url: '/gmvcs/uap/person/type/person/recognition/url',
                method: 'get',
            }).then(ret => {
                if (ret.code == 0) {
                    recognitionUrl = ret.data;
                }
            })

            $(this.$element).on('mouseover', '.ane-menu-submenu', function () {
                $(this).addClass('ane-menu-open');
            }).on('mouseout', '.ane-menu-submenu', function () {
                $(this).removeClass('ane-menu-open');
            });

            let that = this;
            let setTime = setInterval(() => {
                let menu = $(this.$element).find('.ane-menu-submenu ul.ane-menu')[0];
                if (menu) {
                    clearInterval(setTime);
                    $(menu).on('click', 'li', function () {
                        let index = $(this).index();
                        if (index == 0) {
                            that.dialogRylxkszShow = true;
                        }
                        if (index == 1) {
                            window.open(recognitionUrl);
                        }
                    });
                }
            }, 20);

        },
        // 弹窗-人员类型库设置
        dialogRylxkszShow: false,

        dialogRylxkszOk() {
            if (rylxksz.threshold < 80 || rylxksz.threshold > 100) {
                notification.error({
                    message: '识别阀值不在设置范围内',
                    title: '温馨提示'
                });
                return false;
            }
            let selectedIds = [];
            avalon.each(rylxksz.personlistAll, (i, el) => {
                if (el.enable) {
                    selectedIds.push(el.id);
                }
            });

            if (!selectedIds.length) {
                notification.error({
                    message: '人员类型库至少勾选一选',
                    title: '温馨提示'
                });
                return false;
            }
            ajax({
                url: '/gmvcs/uap/person/type/setting',
                method: 'post',
                data: {
                    "selectedIds": selectedIds.join(),
                    "threshold": rylxksz.threshold
                }
            }).then(ret => {
                if (ret.code == 0) {
                    notification.success({
                        message: '修改成功',
                        title: '温馨提示'
                    });
                } else {
                    notification.error({
                        message: ret.msg,
                        title: '温馨提示'
                    });
                }
            });
            this.dialogRylxkszCel();
        },

        dialogRylxkszCel() {
            this.dialogRylxkszShow = false;
        },
    }
});

// 弹窗-人员类型库设置
let rylxksz = avalon.define({
    $id: 'doc-dialog-rylxksz-bar',
    title: '人员类型库设置',
    checkedAll: false,
    threshold: 82,
    personlistAll: [],
    checkboxStyle: {
        cursor: 'pointer',
        fontSize: '16px'
    },
    checkStyle: {
        color: '#536b82'
    },
    uncheckStyle: {
        color: '#536b82'
    },
    selectedAll() {
        this.checkedAll = !this.checkedAll;
        avalon.each(this.personlistAll, (i, el) => {
            el.enable = this.checkedAll;
        });
    },
    selectedOne(config,index) {
        this.personlistAll[index].enable = !this.personlistAll[index].enable;
        let flab = true;
        if (this.personlistAll[index].enable) {
            for (let i = 0; i < this.personlistAll.length; i++) {
                if (!this.personlistAll[i].enable) {
                    flab = false;
                    break;
                }
            }
            if (flab) {
                this.checkedAll = true;
            }
        } else {
            this.checkedAll = false;
        }
    },
    handleChange(config) {
        if (config.value == 'ALL') {
            this.checkedAll = config.checked;
            avalon.each(this.personlistAll, (i, el) => {
                el.enable = config.checked;
            });
        } else {
            this.personlistAll[config.index].enable = config.checked;
            let flab = true;
            if (config.checked) {
                for (let i = 0; i < this.personlistAll.length; i++) {
                    if (!this.personlistAll[i].enable) {
                        flab = false;
                        break;
                    }
                }
                if (flab) {
                    this.checkedAll = true;
                }
            } else {
                this.checkedAll = false;
            }
        }
    },
});

avalon.component('ms-sidebar-checkbox', {
    template: `<i class="fa" :css="[checkboxStyle,(config.checked?checkStyle:uncheckStyle)]" :click="@chage | stop | prevent" :class="[(config.checked?'fa-check-square checked':'fa-square-o')]">
                    <span :if="config.label" :html="config.label" :css="{marginLeft:14}"></span>
               </i>`,
    defaults: {
        onInit(e) {},
        config: {},
        checkboxStyle: {
            cursor: 'pointer',
            fontSize: '16px'
        },
        checkStyle: {
            color: '#536b82'
        },
        uncheckStyle: {
            color: '#536b82'
        },
        onChange: avalon.noop,
        chage(event) {
            if (this.config.hasOwnProperty('checked')) {
                this.config.checked = !this.config.checked;
                this.onChange(this.config);
            } else {
                avalon.error('ms-gdkl-checkbox组件 config 参数未传入checked');
            };

        }
    }
});