import avalon from 'avalon2'
import './chartbox.css'

avalon.component('ms-chartbox', {
    template: __inline('./chartbox.html'),
    defaults: {
        width: 86,
        title: '',
        content: "",
        leftCtl: avalon.noop,
        rightCtl: avalon.noop,
        clickLeft(ev) {
            animClick(ev.target)
            this.leftCtl()
        },
        clickRight(ev) {
            animClick(ev.target)
            this.rightCtl()
        }
    }
})

function animClick(ev) {
    // avalon(ev).removeClass('cbutton--click')
    // setTimeout(() => {
    //     avalon(ev).addClass('cbutton--click')
    // }, 50);
}