import avalon from 'avalon2'
import {
    notification
} from 'ane'
import {
    store
} from './zfsypsjglpt-zfda-jtwf-store'

import ajax from '../../services/ajaxService'
import './zfsypsjglpt-zfda-sgcl-search'
import './zfsypsjglpt-zfda-sgcl-list'
import './zfsypsjglpt-zfda-checks'
import './zfsypsjglpt-zfda-sgcl_jiaojing.css'

export const name = 'zfsypsjglpt-zfda-sgcl_jiaojing'
let sgclVm = ''

function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
    }
    return str
}
avalon.component(name, {
    template: __inline('./zfsypsjglpt-zfda-sgcl_jiaojing.html'),
    defaults: {
        onInit() {
            // 定义一个监听的方法
            let listener = () => {
                // 监听查看页面状态
                this.pageck = store.getState().isCheck
            }

            // 创建一个监听
            store.subscribe(listener)
            // 设置默认值
            store.dispatch({
                type: "closecheck"
            })

            // enter 事件
            $(window).on('keydown', (e) => {
                if (e.keyCode === 13 || e.code === 'Enter') {
                    if (this.pageck) {
                        if (this.checkVM.toggleShowTJGL) {
                            this.checkVM.searchonChange()
                        }
                    } else {
                        sgclVm.fromsearch(this.current - 1)
                    }
                }
            })

            setTimeout(() => {
                if (sgclVm) {
                    sgclVm.fetchOrgData().then(() => {
                        this.chageCurrent(0)
                    })
                }
            }, 50)

        },
        onDispose() {
            $(window).off('keydown')
        },
        pageck: false,
        isLoading: false,
        datas: [],
        // 是否关闭查看页面
        isclose() {
            sgclVm.fromsearch(this.current - 1)
        },
        onReadyVm: function (ev) {
            //简易程序组件vm可以访问组件里定义过的属性 
            sgclVm = ev.vmodel
        },
        checkVM: '',
        onReadycheck(ev) {
            this.checkVM = ev.vmodel
        },
        // 切换页面
        chageCurrent(page) {
            sgclVm.fromsearch(page)
        },
        overLimit: false,
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

            seachParams.sgStartTime += ' 00:00:00'
            seachParams.sgStartTime = new Date(seachParams.sgStartTime.replace(/-/g, '/')).getTime()

            seachParams.sgEndTime += ' 23:59:59'
            seachParams.sgEndTime = new Date(seachParams.sgEndTime.replace(/-/g, '/')).getTime()

            seachParams.clStartTime += ' 00:00:00'
            seachParams.clStartTime = new Date(seachParams.clStartTime.replace(/-/g, '/')).getTime()

            seachParams.clEndTime += ' 23:59:59'
            seachParams.clEndTime = new Date(seachParams.clEndTime.replace(/-/g, '/')).getTime()

            if (seachParams.sgStartTime > seachParams.sgEndTime || seachParams.clStartTime > seachParams.clEndTime) {
                notification.error({
                    message: '开始时间不能大于结束时间',
                    title: '温馨提示'
                })
                this.isLoading = false
                return
            }

            //测试部门 需要删除
            // seachParams.orgPath = '/0/'

            avalon.mix(seachParams, pageConfig)

            url = '/gmvcs/audio/accident/find/pageable'

            ajax({
                url: url,
                method: 'post',
                data: seachParams,
                cache: false
            }).then(ret => {
                if (ret.code === 0) {
                    this.current = page + 1
                    if (ret.data.overLimit) {
                        this.total = 2000
                        this.overLimit = true
                    } else {
                        this.total = ret.data.totalElements
                        this.overLimit = false
                    }
                    this.datas = ret.data
                    this.isLoading = false
                } else {
                    if (ret.msg) {
                        notification.error({
                            message: ret.msg,
                            title: '温馨提示'
                        })
                    }

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