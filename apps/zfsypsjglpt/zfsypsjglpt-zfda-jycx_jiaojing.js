import avalon from "avalon2"
import './zfsypsjglpt-zfda-sgcl-search-jycx'
import './zfsypsjglpt-zfda-sgcl-list-jycx'
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

export const name = "zfsypsjglpt-zfda-jycx_jiaojing"

let myMixin = new mixins('/gmvcs/audio/violation/find/pageable')

avalon.component(name, {
    template: __inline("./zfsypsjglpt-zfda-jycx_jiaojing.html"),
    defaults: avalon.mix({}, onReadyVm, myMixin)
})