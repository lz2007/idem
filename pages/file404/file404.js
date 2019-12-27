import './file404.less';
import 'ane';

let language_txt = require('../../vendor/language').language;

var root = avalon.define({
    $id: 'fileNotExist_vm',
    file_txt: language_txt.mainIndex,
    returnBtn() {
        global.location.href = '/';
    }
});

document.title = language_txt.mainIndex.fileNotExist;

avalon.scan(document.body);