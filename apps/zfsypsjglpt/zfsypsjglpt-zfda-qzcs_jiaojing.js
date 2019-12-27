import avalon from "avalon2"
import './zfsypsjglpt-zfda-sgcl-list-qzcs'
import './zfsypsjglpt-zfda-sgcl-search-qzcs'
import './zfsypsjglpt-zfda-checks'
import {
    mixins
} from './zfsypsjglpt-zfda-mix'

let componentsVm = null
let onReadyVm = {
    onReady() {
        this.componentsVm = componentsVm
        if (this.componentsVm) {
            this.componentsVm.fetchOrgData()
                .then(() => {
                    this.chageCurrent(0)
                })
        }
    },
    onReadyVm(e) {
        componentsVm = e.vmodel
        this.componentsVm = e.vmodel
        this.onReady()
    }
}

let myMixin = new mixins('/gmvcs/audio/force/find/pageable')

export const name = "zfsypsjglpt-zfda-qzcs_jiaojing"

avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-qzcs_jiaojing.html"),
    defaults: avalon.mix({}, onReadyVm, myMixin)
})