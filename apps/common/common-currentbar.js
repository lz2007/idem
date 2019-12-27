import * as menuService from '../../services/menuService';

var csshref = require('/apps/common/common-currentbar.css');
$('head').append('<link href="'+csshref+'" rel="stylesheet" />');

const menucont = avalon.component('common-currentbar', {
	template: __inline('./common-currentbar.html'),
	defaults: {
		menubar_item:avalon.define({
			$id: 'menubar_vm',
			item: [],
			showPage: false,
			showCrp(e) {
				var elem = e.target._ms_context_.el;
				//avalon.log(elem.uri);
				avalon.history.setHash(elem.uri);
			}		
		})
	}
});

$(document).on('click', '.ane-menu>li', function(){
    var currentHash = $.trim(global.location.hash.replace('#!/', ''));
    var menubar = menuService.menubar;

    //获取当前二级菜单数组
    for( var i = 0; i < menubar.length; i++){
    	if( $.trim(menubar[i].hasOwnProperty('parentKey')) && $.trim(menubar[i]['parentKey']) == currentHash){
    		avalon.components['common-currentbar'].defaults.menubar_item.item =  menubar[i].child;
    		avalon.components['common-currentbar'].defaults.menubar_item.showPage = true;
    		break;	
    	}else{
    		avalon.components['common-currentbar'].defaults.menubar_item.showPage = false;
    	}
    };
    $('.menubar_li>a').removeClass('active_bar').addClass('barlink');
    $('.menubar_li:eq(0)>a').addClass('active_bar').removeClass('barlink');
});

$(document).on('click', '.menubar_li>a', function(){
	$('.menubar_li>a').removeClass('active_bar').addClass('barlink');
	$(this).removeClass('barlink').addClass('active_bar');
});