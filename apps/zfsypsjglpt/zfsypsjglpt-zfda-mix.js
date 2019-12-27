// zfsypsjglpt-zfda-mix.js
import avalon from "avalon2"
import {
    notification
} from 'ane'

import ajax from '../../services/ajaxService'

import {
    store
} from '/apps/zfsypsjglpt/zfsypsjglpt-zfda-jtwf-store'

// url = '/gmvcs/audio/violation/find/pageable'
// url = '/gmvcs/audio/surveil/find/pageable'
// url = '/gmvcs/audio/force/find/pageable'

function trim(str) {
    if (str.replace) {
        return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '')
    }
    return str
}

export const mixins = class comfig {
    // 构造
    constructor(url) {
        this.url = url;
        this.componentsVm = null;
        this.isLoading = false;
        this.datas = [];
        this.total = 0;
        this.current = 1;
        this.pageSize = 20;
        this.page = false;
        this.checkVM = null;
        this.overLimit = false;
    }

    onInit() {
        // 定义一个监听的方法
        let listener = () => {
            this.page = store.getState().isCheck
        }
        // 创建一个监听
        store.subscribe(listener)

        // enter 事件
        $(window).off('keydown').on('keydown', (e) => {
            if (e.keyCode === 13 || e.code === 'Enter') {
                if (this.page) {
                    if (this.checkVM.toggleShowTJGL) {
                        this.checkVM.searchonChange()
                    }
                } else {
                    this.componentsVm.fromsearch(this.current - 1)
                }
            }
        })
    }

    onDispose() {
        $(window).off('keydown')
    }

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

        avalon.mix(seachParams, pageConfig)

        ajax({
            url: this.url,
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
    }

    getCurrent(current) {
        this.current = current
        this.chageCurrent(Number(this.current) - 1)
    }

    chageCurrent(page) {
        if (this.componentsVm) {
            setTimeout(() => {
                this.componentsVm.fromsearch(page)
            }, 50)
        }
    }

    onReadycheck(e) {
        this.checkVM = e.vmodel
    }

    isclose() {
        this.componentsVm.fromsearch(this.current - 1)
    }
}