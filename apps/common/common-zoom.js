jQuery.fn.fancyZoom = function(options){
    
    var options   = options || {}; //初始化参数
    var directory = options && options.directory ? options.directory : 'images'; //默认是方法图片的标志
    var zooming   = false; //用来判断此时此刻是否有zooming在展示
  
      //没有zoom就建造一个插入
    if ($('#zoom').length == 0) {
      var html = '<div class="round_shade_box" id="zoom">' + 
                      '<div class="round_shade_top">' +
                          '<span class="round_shade_topleft"></span>'+
                          '<span class="round_shade_topright"></span>' +
                      '</div>' +
                      '<div class="round_shade_centerleft">' +
                          '<div class="round_shade_centerright">' +
                              '<div class="round_shade_center" id="zoom_content"></div>' +
                          '</div>' +
                      '</div>' +
                      '<div class="round_shade_bottom">' +
                          '<span class="round_shade_bottomleft"></span>' +
                          '<span class="round_shade_bottomright"></span>'  +
                      '</div>'  +
                      '<a href="#close" class="round_box_close" id="zoom_close">关闭</a>'  +
                  '</div>'; 
                  
      $('body').append(html);
      
      $('html').click(function(e){if($(e.target).parents('#zoom:visible').length == 0) hide();}); //点击除了zoom其他地方则隐藏
      $(document).keyup(function(event){
          if (event.keyCode == 27 && $('#zoom:visible').length > 0) hide();
      });
      
      $('#zoom_close').click(hide); //给关闭按钮赋予点击事件来隐藏zoom
    }
    
    var zoom          = $('#zoom');
    var zoom_close    = $('#zoom_close');
    var zoom_content  = $('#zoom_content');
      
      //这里的this指向调用fancyZoom的$对象
    this.each(function(i) {
  
          //$对象里所有指向到的放大div先隐藏，然后分别赋予点击事件来展示
      $($(this).attr('href')).hide();
      $(this).click(show);
    });
    $('#zoom_close').click(hide); //关闭按钮赋予点击事件来隐藏
    var aim = this;
    return this; //返回this进行链式调用
      
      //点击了调用了fancyZoom的元素
    function show(e) {
      if (zooming) return false; //假如zooming = true,则不调用
          zooming         = true; //先改变zooming的值
  
          //获取指向元素的输入参数长宽值，放大图片的情况下zoom_width， zoom_height为undefined
          var content_div = $(aim);
            var zoom_width  = options.width;
          var zoom_height = options.height;
          
          //获取页面长度宽度和浏览器滚动长度高度
          var width       = window.innerWidth || (window.document.documentElement.clientWidth || window.document.body.clientWidth);
          var height      = window.innerHeight || (window.document.documentElement.clientHeight || window.document.body.clientHeight);
          var x           = window.pageXOffset || (window.document.documentElement.scrollLeft || window.document.body.scrollLeft);
          var y           = window.pageYOffset || (window.document.documentElement.scrollTop || window.document.body.scrollTop);
          var window_size = {'width':width, 'height':height, 'x':x, 'y':y} //保存以上四个参数
          
          //放大图片的情况下对指向元素长宽各增加40
          var width              = (zoom_width || content_div.width()) + 40;
          var height             = (zoom_height || content_div.height()) + 40;
          var d                  = window_size;
          
          // ensure that newTop is at least 0 so it doesn't hide close button
          var newTop             = Math.max((d.height/2) - (height/2) + y, 0); //获取绝对定位的top，
          var newLeft            = (d.width/2) - (width/2); //获取绝对定位的left
          var curTop             = e.pageY; //获取点击事件对象现在的鼠标位置
          var curLeft            = e.pageX;
          
          //关闭按钮赋予相关属性
          zoom_close.attr('curTop', curTop);
          zoom_close.attr('curLeft', curLeft);
          zoom_close.attr('scaleImg', options.scaleImg ? 'true' : 'false');
          
          //先隐藏，在赋予样式，top&left赋予点击事件对象现在的鼠标位置
      $('#zoom').hide().css({
              position	: 'absolute',
              top				: curTop + 'px',
              left			: curLeft + 'px',
              width     : '1px',
              height    : '1px'
          });
      
      zoom_close.hide();
      
      if (options.closeOnClick) {
        $('#zoom').click(hide);
      }
      
      if (options.scaleImg) {
          zoom_content.html(content_div.html()); //指向元素的innerHTML复制给zoom content
          $('#zoom_content img').css('width', '100%'); //zoom content里面的img长度100%
          } else {
            zoom_content.html(''); //不缩放图片则直接空html
      }
          
      //最后展示zoom，有个动画效果
      $('#zoom').animate({
        top     : newTop + 'px',
        left    : newLeft + 'px',
        opacity : "show",
        width   : width,
        height  : height
      }, 500, null, function() {
  
              //动画结束回调，缩放图片的情况复制html
              //展示关闭按钮
              //恢复初始值zooming
        if (options.scaleImg != true) {

            if (content_div.attr('title')) {
                zoom_content.html(content_div.attr('title'));
            } else {
                zoom_content.html(content_div.html());
            }
             
        }
              zoom_close.show();
              zooming = false;
      })
      return false;
    }
    
    function hide() {
      if (zooming) return false;
          zooming         = true;
        $('#zoom').unbind('click');
          
          if (zoom_close.attr('scaleImg') != 'true') {
            zoom_content.html('');
          }
          zoom_close.hide();
          $('#zoom').animate({
            top     : zoom_close.attr('curTop') + 'px',
            left    : zoom_close.attr('curLeft') + 'px',
            opacity : "hide",
            width   : '1px',
            height  : '1px'
          }, 500, null, function() {
              
            if (zoom_close.attr('scaleImg') == 'true') {
                  zoom_content.html('');
              }
                  zooming = false;
          });
          return false;
        }
    
  }