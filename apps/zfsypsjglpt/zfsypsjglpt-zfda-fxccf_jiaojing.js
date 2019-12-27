import avalon from "avalon2"
import './zfsypsjglpt-zfda-sgcl-search-fcfxc'
import './zfsypsjglpt-zfda-sgcl-list-fcfxc'
import './zfsypsjglpt-zfda-checks'
import {
    mixins
} from './zfsypsjglpt-zfda-mix'
let myMixin = new mixins('/gmvcs/audio/surveil/find/pageable')

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
export const name = "zfsypsjglpt-zfda-fxccf_jiaojing"

avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-fxccf_jiaojing.html"),
    defaults: avalon.mix({}, onReadyVm, myMixin)
})