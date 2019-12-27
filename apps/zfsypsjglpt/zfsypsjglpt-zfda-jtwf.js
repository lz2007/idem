import avalon from 'avalon2'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'
import {
    notification
} from 'ane'
import ajax from '../../services/ajaxService'
import './zfsypsjglpt-zfda-sgcl-search-jycx'
import './zfsypsjglpt-zfda-sgcl-list-jycx'
import './zfsypsjglpt-zfda-sgcl-search-fcfxc'
import './zfsypsjglpt-zfda-sgcl-list-fcfxc'
import './zfsypsjglpt-zfda-sgcl-list-qzcs'
import './zfsypsjglpt-zfda-sgcl-search-qzcs'
import './zfsypsjglpt-zfda-checks'
import './zfsypsjglpt-zfda-jtwf.css'
import {
    store as menuStore
} from '/apps/common/common-store.js'

export const name = './zfsypsjglpt-zfda-jtwf'
let jycxcomponentsVm = ''
let fcfxccomponentsVm = ''
let qzcscomponentsVm = ''
let componentsVm = ''

function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')
    }
    return str
}
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-jtwf.html'),
    defaults: {
        authorizedMenu: [], // 已授权的第三级菜单
        onInit() {
            let isfirst = true
            let menuInterval = setInterval(() => {
                if (menuStore.getState().menu.length) {
                    clearInterval(menuInterval)

                    avalon.each(menuStore.getState().menu, (i, el) => {
                        if (i == 0) {
                            el.isactive = true
                            this.swichPages(el)
                        } else {
                            el.isactive = false
                        }
                    })
                    this.authorizedMenu = menuStore.getState().menu
                }
            }, 20)

            setTimeout(() => {
                if (menuInterval) {
                    clearInterval(menuInterval)
                }
            }, 5000)

            // 定义一个监听的方法
            let listener = () => {
                this.page4 = store.getState().isCheck
            }
            // 创建一个监听
            store.subscribe(listener)

            // enter 事件
            $(window).on('keydown', (e) => {
                if (e.keyCode === 13 || e.code === 'Enter') {
                    if (this.page4) {
                        if (this.checkVM.toggleShowTJGL) {
                            this.checkVM.searchonChange()
                        }
                    } else {
                        componentsVm.fromsearch(this.current - 1)
                    }
                }
            })
        },
        onDispose() {
            $(window).off('keydown')
        },
        onReadyVm: function (ev) {
            //组件vm可以访问组件里定义过的属性
            if (this.page1) {
                jycxcomponentsVm = ev.vmodel

            }
            if (this.page2) {
                fcfxccomponentsVm = ev.vmodel

            }
            if (this.page3) {
                qzcscomponentsVm = ev.vmodel

            }
        },
        checkVM: '',
        onReadycheck(ev) {
            this.checkVM = ev.vmodel
        },
        page1: '',
        page2: '',
        page3: '',
        page4: false, // 查看
        isactive: [true, true, true],
        swichPages(item) {
            avalon.each(this.authorizedMenu, (i, el) => {
                el.isactive = false
            })
            item.isactive = true
            this.datas = []
            switch (item.title) {
                case "简易程序":
                    this.page1 = 'active'
                    this.page2 = ''
                    this.page3 = ''
                    store.dispatch({
                        type: "closecheck"
                    })
                    break
                case "非现场处罚":
                    this.page1 = ''
                    this.page2 = 'active'
                    this.page3 = ''
                    store.dispatch({
                        type: "closecheck"
                    })
                    break
                case "非现场处理":
                    this.page1 = ''
                    this.page2 = 'active'
                    this.page3 = ''
                    store.dispatch({
                        type: "closecheck"
                    })
                    break
                case "强制措施":
                    this.page1 = ''
                    this.page2 = ''
                    this.page3 = 'active'
                    store.dispatch({
                        type: "closecheck"
                    })
                    break
            }

            setTimeout(() => {
                if (this.page1) {
                    componentsVm = jycxcomponentsVm
                }
                if (this.page2) {
                    componentsVm = fcfxccomponentsVm
                }
                if (this.page3) {
                    componentsVm = qzcscomponentsVm
                }

                if (componentsVm) {
                    componentsVm.fetchOrgData()
                        .then(() => {
                            this.chageCurrent(0)
                        })
                }

            }, 100)
        },
        isLoading: false,
        datas: [],
        // 是否关闭查看页面
        isclose() {
            componentsVm.fromsearch(this.current - 1)
        },
        // 切换页面
        chageCurrent(page) {
            if (componentsVm) {
                setTimeout(() => {
                    componentsVm.fromsearch(page)
                }, 50)
            }
        },
        // 查询
        search(data, type, page = 0) {
            if (this.isLoading) {
                return
            }
            this.isLoading = true

            let pageConfig = {
                page: page,
                pageSize: 20
            }

            avalon.each(Object.keys(data), (i, el) => {
                data[el] = trim(data[el])
            })

            let url = ''
            let seachParams = {}

            seachParams = JSON.parse(JSON.stringify(data))
            seachParams.wfStartTime += ' 00:00:00'
            seachParams.wfStartTime = new Date(seachParams.wfStartTime.replace(/-/g, '/')).getTime()
            seachParams.wfEndTime += ' 23:59:59'
            seachParams.wfEndTime = new Date(seachParams.wfEndTime.replace(/-/g, '/')).getTime()

            if (seachParams.wfStartTime > seachParams.wfEndTime) {
                notification.error({
                    message: '开始时间不能大于结束时间',
                    title: '温馨提示'
                })
                this.isLoading = false
                return
            }

            //测试部门 需要删除
            // seachParams.orgPath = ''

            avalon.mix(seachParams, pageConfig)
            if (type == 'jycx') {
                url = '/gmvcs/audio/violation/find/pageable'
            } else if (type == 'fcfxc') {
                url = '/gmvcs/audio/surveil/find/pageable'
            } else if (type == 'qzcs') {
                url = '/gmvcs/audio/force/find/pageable'
            }

            ajax({
                url: url,
                method: 'post',
                data: seachParams,
                cache: false
            }).then(ret => {
                if (ret.code === 0) {
                    this.current = page + 1
                    if (ret.data.overLimit) {
                        this.total = ret.data.limit
                    } else {
                        this.total = ret.data.totalElements
                    }
                    this.datas = ret.data
                    this.isLoading = false
                } else {
                    if (!ret.msg) {
                        ret.msg = '请求错误，未知错误'
                    }
                    notification.warn({
                        message: ret.msg,
                        title: '温馨提示'
                    })

                    this.current = 0
                    this.total = 0
                    this.datas = []
                    this.isLoading = false
                }
            })
        },
        total: 0,
        current: 1,
        pageSize: 20,
        getCurrent(current) {
            this.current = current
            this.chageCurrent(Number(this.current) - 1)
        }
    }
})