import avalon from 'avalon2';
import './common-progress.css';
/* status: 'success','info','warning','danger' */
avalon.component('ms-progress', {
    template: __inline('./common-progress.html'),
    defaults: {
        progress: 0,
        onInit(event){
            this.$watch('progress', (v) => {
                $('.progress-bar').width(v+'%')
            })
        }
    }
});