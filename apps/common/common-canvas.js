
/**
 * 截图标注组件
 * @param {string}  图片路径............imgUrl
 * @param {string}  图片数据............base64 说明：当base64有传入的时候，就是使用base64渲染图片，否则使用imgUrl，也是为了解决跨域问题
 * @param {string}  画布唯一标识............canvasId  
 * @param {int}     画布宽度............width，默认值是300
 * @param {int}     画布的高度............height，默认值是150
 * @param {Boolean}  打印标志............dyImgShow，当为true说明正在打印，是为了标志打印状态来调整要打印界面的样式
 * @param {string}     简要案情............jyaq，默认值是''
 * 
 * 使用方法： <ms-canvas :widget="{imgUrl:item.httpUrl,base64:item.base64,canvasId:item.rid,width:998,height:498,dyImgShow:@dyImgShow,jyaq:@jyaq}"></ms-canvas>
 */
import 'jquery';
// import { ipcRenderer, clipboard, nativeImage, Tray, remote } from 'electron';
import { ret } from '../../services/storageService';
require("/apps/common/common-canvas.css");
require('/node_modules/spectrum-colorpicker/spectrum.css');
// var storage = require('../../services/storageService.js').ret;
// import $ from 'jquery';
avalon.component("ms-canvas", {
    template: __inline("./common-canvas.html"),
    defaults: {
        canvasId:'',
        imgUrl:'',
        width: 300,
        height: 150,
        start:{
            x:0,
            y:0
        },
        colorPanelShow:false,
        flag:false,
        isShowText:false,
        rectangle:false,
        circle:false,
        arrow:false,
        text:false,  
        line:false,
        pencil:false, 
        imgArraw:[],
        currentImgUrl:'',  
        textCss:{}, 
        textFixed:{
            x:0,
            y:0,
        },
        isReturn:false, 
        isItalic:false,//斜体
        isBold:false,//加粗 
        rectangleStyleShow:false,
        circleStyleShow:false,
        arrowStyleShow:false,
        textStyleShow:false,//文字样式   
        areaCss:{
            color:'#f2330b',
            fontSize:'14px',
            fontFamily:'Microsoft YaHei',
            fontWeight:'normal',
            fontStyle:'normal'
        },
        fontFamilySelect:['Microsoft YaHei'],
        fontSizeSelect:['14'],
        wordShow:true,//显示下方文字内容
        shiftDown:false,
        labelTextWidth:0,
        display:'none',
        dyImgShow:false,//打印时是否显示图片
        dyImgUrl:'',//打印时将canvas图片数据转成页面图片
        cUrl:'',//出现文本时的图片url
        base64:'',
        dragFinish:false,//拖动完成标志
        circleUrl:'',
        rectangleUrl:'',
        arrowUrl:'',
        circleStyle:{
            border:2,
            color:'red'
        },
        rectangleStyle:{
            border:2,
            color:'red'
        },
        arrowStyle:{
            color:'red'
        },
        jyaq:'',//简要案情
        onClick(type){
            let _this = this;
            switch(type){
                case 'rectangle':
                    if(_this.rectangle){
                        _this.rectangle = false;
                        _this.rectangleStyleShow = false;
                    }else{
                        _this.rectangle = true;
                        _this.rectangleStyleShow = true;
                        $('#rectangleBorder').find('.b').removeClass('activeBorder');;
                        $('#rectangleBorder').find('.b').eq(0).addClass('activeBorder');
                        _this.rectangleStyle = {
                            border:2,
                            color:'red'
                        };
                        $("#"+_this.canvasId+"rectangleColor").spectrum("set", 'red');
                        _this.rectangleUrl = getRectangleBase64(_this.rectangleStyle.border,_this.rectangleStyle.color,30,30);
                    }
                    _this.circle = false;
                    _this.arrow = false;
                    _this.text = false;
                    _this.textStyleShow = false;
                    _this.circleStyleShow = false;
                    _this.arrowStyleShow = false;
                    break;
                case 'circle':
                    if(_this.circle){
                        _this.circle = false;
                        _this.circleStyleShow = false;
                    }else{
                        _this.circle = true;
                        _this.circleStyleShow = true;
                        $('#circleBorder').find('.b').removeClass('activeBorder');;
                        $('#circleBorder').find('.b').eq(0).addClass('activeBorder');
                        _this.circleStyle = {
                            border:2,
                            color:'red'
                        };
                        $("#"+_this.canvasId+"circleColor").spectrum("set", 'red');
                        _this.circleUrl = getCirleBase64(_this.circleStyle.border,_this.circleStyle.color,30,30);
                    }
                    _this.rectangle = false;
                    _this.arrow = false;
                    _this.text = false;
                    _this.textStyleShow = false;
                    _this.rectangleStyleShow = false;
                    _this.arrowStyleShow = false;
                    break;
                case 'arrow':
                    if(_this.arrow){
                        _this.arrow = false;
                        _this.arrowStyleShow = false;
                    }else{
                        _this.arrow = true;
                        _this.arrowStyleShow = true;
                        _this.arrowStyle.color = 'red';
                        $("#"+_this.canvasId+"arrowColor").spectrum("set", 'red');
                        _this.arrowUrl = getArrowBase64(0, 0, 30, 30, 20, 10, 2, _this.arrowStyle.color,30,30);
                    }
                    _this.rectangle = false;
                    _this.circle = false;
                    _this.text = false;
                    _this.textStyleShow = false;
                    _this.rectangleStyleShow = false;
                    _this.circleStyleShow = false;
                    break;
                case 'text':
                    if(_this.text){
                        _this.text = false;
                        _this.textStyleShow = false;
                    }else{
                        _this.text = true;
                        _this.textStyleShow = true;
                        // _this.areaCss={
                        //     color:'#f2330b',
                        //     fontSize:'14px',
                        //     fontFamily:'Microsoft YaHei',
                        //     fontWeight:'normal',
                        //     fontStyle:'normal'
                        // };
                        // $('#'+_this.canvasId+'textarea').css('fontWeight','normal');
                        // $('#'+_this.canvasId+'textarea').css('fontStyle','normal');
                        // _this.fontFamilySelect = ['Microsoft YaHei'];
                        // _this.fontSizeSelect = ['14'];
                    }
                    _this.rectangle = false;
                    _this.circle = false;
                    _this.arrow = false;
                    _this.rectangleStyleShow = false;
                    _this.circleStyleShow = false;
                    _this.arrowStyleShow = false;
                    break;
                case 'return':
                    _this.rectangle = false;
                    _this.circle = false;
                    _this.arrow = false;
                    _this.text = false;
                    _this.textStyleShow = false;
                    _this.rectangleStyleShow = false;
                    // _this.isReturn = true;
                    _this.returnDrawn();
                    break;
                case 'bold':
                    // _this.isShowText = true;
                    if(_this.isBold){
                        _this.isBold = false;
                        $('#'+_this.canvasId+'textarea').css('fontWeight','normal');
                        _this.areaCss.fontWeight = 'normal';
                    }else{
                        _this.isBold = true;
                        $('#'+_this.canvasId+'textarea').css('fontWeight','bold');
                        _this.areaCss.fontWeight = 'bold';
                    }
                    break;
                case 'italic':
                    if(_this.isItalic){
                        _this.isItalic = false;
                        $('#'+_this.canvasId+'textarea').css('fontStyle','normal');
                        _this.areaCss.fontStyle = 'normal';
                    }else{
                        _this.isItalic = true;
                        $('#'+_this.canvasId+'textarea').css('fontStyle','italic');
                        _this.areaCss.fontStyle = 'italic';
                    }
                    break;
            }
        },
        handle(type){
            let _this = this;
            switch(type){
                case 'rectangle':
                    break;
                case 'circle':
                    break;
                case 'arrow':
                    break;
                case 'text':
                    break;
                case 'return':
                    break;
            }
        },
        handleFamilyChange(event){
            $('#'+this.canvasId+'textarea').css('fontFamily',event.target.value);
            this.areaCss.fontFamily = event.target.value;
        },
        handleSizeChange(event){
            // console.log(event.target.value);
            $('#'+this.canvasId+'textarea').css('fontSize',event.target.value+'px');
            this.areaCss.fontSize = event.target.value+'px';
        },
        /**画布鼠标移进移出事件 */
        screenMouseOpt(){
            let _this = this;
            $('#'+_this.canvasId).parent().mouseenter(function(e){
                    _this.display = 'block';
                    if(_this.text){
                        _this.textStyleShow = true;
                    }
                    if(_this.rectangle) _this.rectangleStyleShow = true;
                    if(_this.circle)_this.circleStyleShow = true;
                    if(_this.arrow)_this.arrowStyleShow = true;
            }).mouseleave(function(e){
                if($('.'+_this.canvasId+'-panel-family')[0] && $('.'+_this.canvasId+'-panel-family').parent().position().left > 0){
                    return;
                }
                if($('.'+_this.canvasId+'-panel-size')[0] && $('.'+_this.canvasId+'-panel-size').parent().position().left > 0){
                    return;
                }
                if(_this.colorPanelShow){
                    return;
                }
                _this.display = 'none';
                _this.textStyleShow = false;
                _this.rectangleStyleShow = false;
                _this.circleStyleShow = false;
                _this.arrowStyleShow = false;
            });
        },
        rectangleBorder(type){//矩形边框的变化选择
            let _this = this;
            if(type === '1'){
                $('#rectangleBorder').find('.b').removeClass('activeBorder');;
                $('#rectangleBorder').find('.b').eq(0).addClass('activeBorder');
                _this.rectangleStyle.border = 2;
                _this.rectangleUrl = getRectangleBase64(_this.rectangleStyle.border,_this.rectangleStyle.color,30,30);
                return;
            }
            if(type === '2'){
                $('#rectangleBorder').find('.b').removeClass('activeBorder');;
                $('#rectangleBorder').find('.b').eq(1).addClass('activeBorder');
                _this.rectangleStyle.border = 4;
                _this.rectangleUrl = getRectangleBase64(_this.rectangleStyle.border,_this.rectangleStyle.color,30,30);
                return;
            }
            if(type === '3'){
                $('#rectangleBorder').find('.b').removeClass('activeBorder');;
                $('#rectangleBorder').find('.b').eq(2).addClass('activeBorder');
                _this.rectangleStyle.border = 6;
                _this.rectangleUrl = getRectangleBase64(_this.rectangleStyle.border,_this.rectangleStyle.color,30,30);
                return;
            }
        },
        circleBorder(type){//圆形边框的变化选择
            let _this = this;
            if(type === '1'){
                $('#circleBorder').find('.b').removeClass('activeBorder');;
                $('#circleBorder').find('.b').eq(0).addClass('activeBorder');
                _this.circleStyle.border = 2;
                _this.circleUrl = getCirleBase64(_this.circleStyle.border,_this.circleStyle.color,30,30);
                return;
            }
            if(type === '2'){
                $('#circleBorder').find('.b').removeClass('activeBorder');;
                $('#circleBorder').find('.b').eq(1).addClass('activeBorder');
                _this.circleStyle.border = 4;
                _this.circleUrl = getCirleBase64(_this.circleStyle.border,_this.circleStyle.color,30,30);
                return;
            }
            if(type === '3'){
                $('#circleBorder').find('.b').removeClass('activeBorder');;
                $('#circleBorder').find('.b').eq(2).addClass('activeBorder');
                _this.circleStyle.border = 6;
                _this.circleUrl = getCirleBase64(_this.circleStyle.border,_this.circleStyle.color,30,30);
                return;
            }
        },
        onInit: function (event) {
            let _this = this;
            _this.start = {
                x:0,
                y:0
            };
            _this.flag = false;
            _this.colorPanelShow = false;
            _this.display = 'none';
            _this.rectangleStyleShow = false;
            _this.circleStyleShow = false;
            _this.arrowStyleShow = false;
            _this.isShowText = false;
            _this.imgArraw  = [];
            if(!_this.canvasId){
                _this.canvasId = 'canvas'+Number(new Date());
            }
            $('.'+_this.canvasId)[0].width = _this.width;
            $('.'+_this.canvasId)[0].height = _this.height;
            this.$watch('isShowText', function(v) {
                if (v && _this.imgArraw) {
                    _this.cUrl = _this.imgArraw[_this.imgArraw.length-1];
                    $('#'+_this.canvasId+'scream').mousedown(function(e){
                        if(_this.dragFinish) _this.isShowText = false;
                    });
                } else if(!v){
                    let textareaId =  _this.canvasId + 'textarea';
                    let val = $('#'+textareaId)[0].value;
                    let c = $('#'+_this.canvasId)[0];                  
                    let ctx= c.getContext("2d");
                    _this.drawText(ctx,val);
                }
            });
            this.$watch('text', function(v) {
                if (!v) {
                    _this.isShowText = false;
                    _this.textStyleShow = false;
                }else{
                    _this.textStyleShow = true;
                }
            });
            this.$watch('dyImgShow', function(v) {
                if (v && _this.imgArraw) {
                    _this.isShowText = false;
                    _this.dyImgUrl = _this.imgArraw[_this.imgArraw.length-1];
                }
            });
        },
        onReady: function (event) {
            let _this = this;
            let c = $('#'+_this.canvasId)[0];                
            let ctx= c.getContext("2d");
            let img = new Image();
            let src = _this.imgUrl;
            if(_this.base64){//说明采用的是服务器返回的图片数据
                let base64 = 'data:image/png;base64,'+ _this.base64;
                img.src = base64;
                _this.imgArraw.push(base64);
                img.onload = function(){
                    ctx.drawImage(img,0,0,c.width,c.height);
                };
                ctx.drawImage(img,0,0,c.width,c.height);
            }else{//没有base64,说明用的图片是本地图片
                main(src, function(base64){
                    img.src = base64;
                    // console.log(base64);
                    _this.imgArraw.push(base64);
                    img.onload = function(){
                        ctx.drawImage(img,0,0,c.width,c.height);
                    };
                    ctx.drawImage(img,0,0,c.width,c.height);
                });
            }
            
            this.getMouse(ctx,c);
            this.textDrag();
            
            // if (typeof document.webkitHidden == "undefined") {
            //     // 非chrome浏览器阻止粘贴
            //     box.onpaste = function() {
            //         return false;
            //     };
            // }
            let options = {
                color: "#f2330b", // 默认颜色
                preferredFormat: "hex",
                allowEmpty:false,
                chooseText: "选择",
                cancelText: "取消",
                showInitial: true,
                showInput: true, // 显示输入框
                replacerClassName: 'color-picker-wrap', // 样式名称
                showPalette: true, // 显示调色版
                palette: [
                    ['#20b362', '#e09e1f', '#e76a1e', '#17a2c6'],
                    ['#78ba00', '#2db7f5', '#691bb8', '#f2330b']
                ],
                show:function(){
                    _this.colorPanelShow = true;
                },
                hide:function(){
                    _this.colorPanelShow = false;
                },
                change:function(color){ 
                    // console.log(color);
                    // console.log(color.toHexString());
                    if(_this.rectangle){
                        // console.log('矩形：');
                        // console.log(color.toHexString());
                        _this.rectangleStyle.color = color.toHexString();
                        _this.rectangleUrl = getRectangleBase64(_this.rectangleStyle.border,_this.rectangleStyle.color,30,30);
                        return;
                    }
                    if(_this.circle){
                        // console.log('圆形：');
                        // console.log(color.toHexString());
                        _this.circleStyle.color = color.toHexString();
                        _this.circleUrl = getCirleBase64(_this.circleStyle.border,_this.circleStyle.color,30,30);
                        return;
                    }
                    if(_this.arrow){
                        // console.log('箭头：');
                        // console.log(color.toHexString());
                        _this.arrowStyle.color = color.toHexString();
                        _this.arrowUrl = getArrowBase64(0, 0, 30, 30, 20, 10, 2, _this.arrowStyle.color,30,30);
                        return;
                    }
                    if(_this.text){
                        // console.log('文本：');
                        // console.log(color.toHexString());
                        $('#'+_this.canvasId+'textarea').css('color',color.toHexString());
                         _this.areaCss.color = color.toHexString();
                         return;
                    }
                }
            };
            $('#'+_this.canvasId+'canvasColor').spectrum(options);
            $('#'+_this.canvasId+'rectangleColor').spectrum(options);
            $('#'+_this.canvasId+'arrowColor').spectrum(options);
            $('#'+_this.canvasId+'circleColor').spectrum(options);
            //let iconColor = $("#colorpickerSYS").spectrum("get").toHexString();
            _this.screenMouseOpt();
        },
        onDispose: function (event) {
            this.canvasId = '';
            this.imgUrl = '';
            this.rectangle = true;
            this.circle = false;
            this.arrow = false;
            this.text = false;
            this.pencil = false;
            this.line = false;
            this.imgArraw = [];
            this.isReturn = false;
            this.shiftDown = false;
            this.base64 = '';
            this.dragFinish = false;
            this.areaCss={
                color:'#f2330b',
                fontSize:'14px',
                fontFamily:'Microsoft YaHei',
                fontWeight:'normal',
                fontStyle:'normal'
            };
        },
        /**鼠标在画布中绘画操作 */
        getMouse(ctx,c){
            let _this = this;
            $('#'+_this.canvasId).mousedown(function(e){
                _this.flag = true;
                _this.currentImgUrl = $('#'+_this.canvasId)[0].toDataURL();
                _this.start.x = e.offsetX; // 鼠标落下时的X
                _this.start.y = e.offsetY; // 鼠标落下时的Y
                //  _this.showText();//呈现文字输入框
                 if(e.shiftKey){
                    _this.shiftDown = true;
                 }else{
                    _this.shiftDown = false;
                 }
            }).mouseup(function(e){
                _this.flag = false;
                let  x = e.offsetX; // 鼠标离开时的X
                let y = e.offsetY; // 鼠标离开时的Y
                let url = $('#'+_this.canvasId)[0].toDataURL(); // 每次 mouseup 都保存一次画布状态
                _this.currentImgUrl = url;
                _this.imgArraw.push(url);
                _this.loadImage(ctx,c);
                // console.log( _this.imgArraw);
            }).mousemove(function(e){
                _this.drawRect(e,ctx,c); // 绘制方法
                // _this.drawLine(e,ctx,c); //画直线
                // _this.drawPencil(e,ctx,c);//画笔
                _this.drawCircle(e,ctx,c);//画圆
                _this.drawArrow(e,ctx,c,  _this.start.x ,  _this.start.y ,20,20,5,_this.arrowStyle.color);//画箭头
                _this.drawEllipse(e,ctx,c);//椭圆
            });
            /**整个文本鼠标点击事件 */
            $(document).click(function (e) {
                let pop = $('#'+_this.canvasId)[0];
                let popImg = $('#'+_this.canvasId+'scream')[0];
                // console.log('点击事件');
                if(e.target === pop){
                    _this.showText();//呈现文字输入框
                }else if(e.target === popImg && _this.dragFinish){
                    _this.dragFinish = false;
                }else if(e.target === popImg && !_this.dragFinish){
                    _this.isShowText = false;
                }
            });
        },
        /**加载绘画图片 */
        loadImage(ctx,c){
            var imgLoad = new Image();
            imgLoad.src = this.currentImgUrl;
            ctx.drawImage(imgLoad,0,0,c.width,c.height);
        },
        /**撤回上一次的绘画操作 */
        returnDrawn(){
            let _this = this;
            let c = $('#'+_this.canvasId)[0];                  
            let ctx= c.getContext("2d");
            if(_this.imgArraw && _this.imgArraw.length > 1){
                _this.imgArraw.pop();
                let url = _this.imgArraw[_this.imgArraw.length-1];
                _this.currentImgUrl = url;
                ctx.clearRect(0,0, c.width,c.height);
                var imgLoad = new Image();
                imgLoad.src = url;
                imgLoad.onload = function(){
                    ctx.drawImage(imgLoad,0,0, c.width, c.height);
                };
                // console.log(_this.imgArraw);
            }else{
                // let imgId = _this.canvasId + "scream";
                // let img= document.getElementById(imgId);
                // ctx.clearRect(0,0, c.width, c.height);
                // ctx.drawImage(img,0,0, c.width, c.height);
                return;
            }
        },
        /**显示文本输入框 */
        showText(){
            let _this = this;
            if(_this.isShowText){
                _this.isShowText = false;
                return;
            }
            if(_this.text &&  !_this.isShowText){
                _this.isShowText = true;//添加文字
                let textareaId =  _this.canvasId + 'textarea';
                let elem = document.getElementById(textareaId);
                elem.style.height = '24px';
                elem.style.width = '10px';
                elem.value = '';
                $('#'+textareaId).focus();
                // console.log(textareaId);
                _this.addTextListener(elem,_this.canvasId);
                autoTextarea(elem);
                _this.textCss = {
                    left:_this.start.x+'px',
                    top:_this.start.y+'px'
                };
                _this.textFixed = {
                    x:_this.start.x,
                    y:_this.start.y
                };
            } 
        },
        /**文本绘画*/
        drawText(ctx,val){
            let _this = this;
            // console.log(getFormatCode(val));
            if(val){
                ctx.fillStyle = _this.areaCss.color;
                let font = _this.areaCss.fontWeight+ ' ' + _this.areaCss.fontStyle + ' ' + _this.areaCss.fontSize + ' ' +  _this.areaCss.fontFamily;
                ctx.font = font;
                // ctx.font = 'italic  bold 25px 宋体';
                let top = 0;
                let fontSize  = _this.areaCss.fontSize;
                fontSize = parseInt(fontSize.substring(0,fontSize.length-2));
                if(fontSize > 22){//字体超过22px
                    top = 6+fontSize-14;
                }else{
                    top = 22 -fontSize+6;
                }
                getFormatCode(val).forEach((element,key) =>{
                    ctx.fillText (element,  _this.textFixed.x+2,_this.textFixed.y+top+24*key);
                });
                let url = $('#'+_this.canvasId)[0].toDataURL(); // 每次 mouseup 都保存一次画布状态
                _this.currentImgUrl = url;
                _this.imgArraw.push(url);
                // console.log( _this.imgArraw);
            }
        },
        /**绘画矩形 */
        drawRect(e,ctx,c){
            let _this = this;
            if(_this.flag && _this.rectangle){
                ctx.clearRect(0,0,c.width,c.height);
                _this.loadImage(ctx,c);
                ctx.beginPath();
                ctx.lineWidth= _this.rectangleStyle.border;
                ctx.strokeStyle= _this.rectangleStyle.color;
                ctx.strokeRect(_this.start.x,_this.start.y,e.offsetX-_this.start.x,e.offsetY-_this.start.y);
            }
        },
        /**绘画直线 */
        drawLine(e,ctx,c){
            let _this = this;
            if(_this.flag && _this.line){
                ctx.clearRect(0,0,c.width,c.height);
                // let url = _this.imgArraw[_this.imgArraw.length - 1];
                // _this.loadImage(ctx,c,url);
                _this.loadImage(ctx,c);
                ctx.beginPath();
                ctx.lineWidth="2";
                ctx.strokeStyle="red";
                ctx.moveTo(_this.start.x,_this.start.y);
                ctx.lineTo(e.offsetX,e.offsetY);
                ctx.stroke();   
            }
        },
        /**画笔操作 */
        drawPencil(e,ctx,c){
            let _this = this;
            if(!_this.pencil) return;
            ctx.lineWidth="2";
            ctx.strokeStyle="red";
            if(_this.flag){
                ctx.lineTo(e.offsetX,e.offsetY);
                ctx.stroke(); // 调用绘制方法 
            }else{
                ctx.beginPath();
                ctx.moveTo(_this.x,_this.y);
            }
        },
        /**绘画圆形 */
        drawCircle(e,ctx,c){
            let _this = this;
            if(_this.flag &&  _this.circle && _this.shiftDown){
                // console.log('画圆');
                ctx.lineWidth= _this.circleStyle.border;
                ctx.strokeStyle= _this.circleStyle.color;
                ctx.clearRect(0,0,c.width,c.height);
                _this.loadImage(ctx,c);
                ctx.beginPath();
                var rx = (e.offsetX-_this.start.x)/2;
                var ry = (e.offsetY-_this.start.y)/2;
                var r = Math.sqrt(rx*rx+ry*ry);
                ctx.arc(rx+_this.start.x,ry+_this.start.y,r,0,Math.PI*2); // 第5个参数默认是false-顺时针
                ctx.stroke();
            }
        },
        /**绘画椭圆 */
        drawEllipse(e,context,c) {
            let _this = this;
            if(_this.flag &&  _this.circle && !_this.shiftDown){
                // console.log('画tuo圆');
                var a = (e.offsetX-_this.start.x)/2;
                var b = (e.offsetY-_this.start.y)/2;
                var x = _this.start.x + a;
                var y = _this.start.y + b;
                // context.save();
                // var r = (a > b) ? a : b;
                // var ratioX = a / r;
                // var ratioY = b / r;
                // context.scale(ratioX, ratioY);
                context.lineWidth=_this.circleStyle.border;
                context.strokeStyle=_this.circleStyle.color;
                context.clearRect(0,0,c.width,c.height);
                _this.loadImage(context,c);
                var step = (a > b) ? 1 / a : 1 / b;
                context.beginPath();
                context.moveTo(x + a, y); //从椭圆的左端点开始绘制
                for (var i = 0; i < 2 * Math.PI; i += step)
                {
                   //参数方程为x = a * cos(i), y = b * sin(i)，
                   //参数为i，表示度数（弧度）
                   context.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
                }
                context.closePath();
                context.stroke();
            }
        },
        /**绘画箭头 */
        drawArrow(e,ctx,c, fromX, fromY,theta,headlen,width,color){
            let _this = this;
            if(_this.flag &&  _this.arrow){
                theta = typeof(theta) != 'undefined' ? theta : 30; 
                headlen = typeof(theta) != 'undefined' ? headlen : 10; 
                width = typeof(width) != 'undefined' ? width : 1; 
                color = typeof(color) != 'color' ? color : 'red'; 
    
                let toX = e.offsetX,
                    toY = e.offsetY;
                
                // 计算各角度和对应的P2,P3坐标 
                var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI, 
                    angle1 = (angle + theta) * Math.PI / 180, 
                    angle2 = (angle - theta) * Math.PI / 180, 
                    topX = headlen * Math.cos(angle1), 
                    topY = headlen * Math.sin(angle1), 
                    botX = headlen * Math.cos(angle2), 
                    botY = headlen * Math.sin(angle2); 
    
                ctx.clearRect(0,0,c.width,c.height);
                _this.loadImage(ctx,c);
                ctx.save(); 
                ctx.beginPath(); 
                var arrowX = fromX - topX, 
                    arrowY = fromY - topY; 
                ctx.moveTo(arrowX, arrowY); 
                ctx.moveTo(fromX, fromY); 
                ctx.lineTo(toX, toY); 
                arrowX = toX + topX; 
                arrowY = toY + topY; 
                ctx.moveTo(arrowX, arrowY); 
                ctx.lineTo(toX, toY); 
                arrowX = toX + botX; 
                arrowY = toY + botY; 
                ctx.lineTo(arrowX, arrowY); 
                ctx.strokeStyle = color; 
                ctx.fillStyle = color;
                ctx.lineWidth = width; 
                ctx.stroke(); 
                ctx.fill();
                ctx.restore(); 
            }
        },
        /**添加文本输入监听，当文本输入自动延伸宽度 */
        addTextListener(el,id){
            let _this = this;
            el.addEventListener('input',function () {  
                var str= getFormatCode(this.value,true); 
                $('#'+id+'labelText').css({    
                "font": _this.areaCss.fontWeight+ ' ' + _this.areaCss.fontStyle + ' ' + _this.areaCss.fontSize + ' ' +  _this.areaCss.fontFamily  
                }).html(str);  
                var width = $('#'+id+'labelText').width();  
                $('#'+id+'textarea').width(width);
            });  
              
            el.addEventListener('propertychange',function () {//兼容IE  
                var str= getFormatCode(this.value,true);   
                $('#'+id+'labelText').css({    
                "font": _this.areaCss.fontWeight+ ' ' + _this.areaCss.fontStyle + ' ' + _this.areaCss.fontSize + ' ' +  _this.areaCss.fontFamily  
                }).html(str);  
                var width = $('#'+id+'labelText').width();  
                $('#'+id+'textarea').width(width);  
            }); 
        },
        /**文本移动 */
        textDrag(){
            let _this = this;
            let mouseX, mouseY;  
            let objX, objY;  
            let isDowm = false; 
            $(window).mouseup(function(e){
                if(isDowm){
                    isDowm = false; 
                }
            });
            $(document).mousemove(function(e){
                if (isDowm) {
                    let x = e.clientX;  
                    let y = e.clientY; 
                     let obj = document.getElementById(_this.canvasId+'textareaDiv');
                     obj.style.left = parseInt(objX) + parseInt(x) - parseInt(mouseX) + "px";  
                     obj.style.top = parseInt(objY) + parseInt(y) - parseInt(mouseY) + "px";  
                }
            });
            $('#'+_this.canvasId+'textarea').parent().mousedown(function(e){ 
                // $(this)[0].style.cursor = "move";  
                objX = $(this)[0].offsetLeft;
                objY = $(this)[0].offsetTop;
                mouseX = e.clientX;  
                mouseY = e.clientY;  
                isDowm = true; 
            }).mousemove(function(e){
                let x = e.clientX;  
                let y = e.clientY;  
                if (isDowm) {  
                    $(this)[0].style.left = parseInt(objX) + parseInt(x) - parseInt(mouseX) + "px";  
                    $(this)[0].style.top = parseInt(objY) + parseInt(y) - parseInt(mouseY) + "px";  
                }  
            }).mouseup(function(e){
                if (isDowm) {  
                    let x = e.clientX;  
                    let y = e.clientY;   
                    let left = parseInt(objX) + parseInt(x) - parseInt(mouseX);
                    let top = parseInt(objY) + parseInt(y) - parseInt(mouseY);
                    $(this)[0].style.left = left + "px";  
                    $(this)[0].style.top = top + "px";   
                    isDowm = false;  
                    _this.dragFinish = true;
                    _this.textFixed = {
                        x: left+2,
                        y:top+2
                    };
                }  
            });
        }
    }
});

/**  
 * 文本框根据输入内容自适应高度  
 * @param                {HTMLElement}        输入框元素  
 * @param                {Number}                设置光标与输入框保持的距离(默认0)  
 * @param                {Number}                设置最大高度(可选)  
 */  
function autoTextarea(elem, extra, maxHeight) {  
    extra = extra || 0;  
    var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window,  
        isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera'),  
        addEvent = function(type, callback) {  
            elem.addEventListener ?  
                elem.addEventListener(type, callback, false) :  
                elem.attachEvent('on' + type, callback);  
        },  
        getStyle = elem.currentStyle ? function(name) {  
            var val = elem.currentStyle[name];  
            if (name === 'height' && val.search(/px/i) !== 1) {  
                var rect = elem.getBoundingClientRect();  
                return rect.bottom - rect.top -  
                    parseFloat(getStyle('paddingTop')) -  
                    parseFloat(getStyle('paddingBottom')) + 'px';  
            };  
            return val;  
        } : function(name) {  
            return getComputedStyle(elem, null)[name];  
        },  
        minHeight = parseFloat(getStyle('height'));  
    elem.style.resize = 'none';  
    var change = function() {  
        var scrollTop, height,  
            padding = 0,  
            style = elem.style;  
        if (elem._length === elem.value.length) return;  
        elem._length = elem.value.length;  
        if (!isFirefox && !isOpera) {  
            padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));  
        };  
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;  
        elem.style.height = minHeight + 'px';  
        if (elem.scrollHeight > minHeight) {  
            if (maxHeight && elem.scrollHeight > maxHeight) {  
                height = maxHeight - padding;  
                style.overflowY = 'auto';  
            } else {  
                height = elem.scrollHeight - padding;  
                style.overflowY = 'hidden';  
            };  
            style.height = height + extra + 'px';  
            scrollTop += parseInt(style.height) - elem.currHeight;  
            document.body.scrollTop = scrollTop;  
            document.documentElement.scrollTop = scrollTop;  
            elem.currHeight = parseInt(style.height);  
        };  
    };  
    addEvent('propertychange', change);  
    addEvent('input', change);  
    addEvent('focus', change);  
    change();  
}; 
/* *
* 根据Value格式化为带有换行、空格格式的HTML代码 
* @param strValue {String} 需要转换的值 
* @param type {boolean} 返回值的类型
* @example   
* getFormatCode("测\r\n\s试")  =>  “测<br/> 试” 
*/  
function getFormatCode(strValue,type){  
    let val = strValue.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, ' '); 
    if(type) return val;
    if(!type) return val.split('<br/>');
}  
/**
 * 获取图片的base64
 * @param {*} img 
 */
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var dataURL = canvas.toDataURL();  // 可选其他值 image/jpeg
    return dataURL;
}
function main(src, cb) {
    var image = new Image();
    image.src = src + '?v=' + Math.random(); // 处理缓存
    // image.crossOrigin = "*";  // 支持跨域图片
    image.crossOrigin = 'Anonymous';
    image.onload = function(){
        var base64 = getBase64Image(image);
        cb && cb(base64);
    };
}
/**
 * 获取圆的base64
 * @param {int}  边距............ border
 * @param {string}  颜色......... color 
 * @param {int}  宽......... width 
 * @param {int}  高......... height 
 */
function getCirleBase64(border,color,width,height){
    let canvasCirle = document.createElement("canvas");
    canvasCirle.width = width;
    canvasCirle.height = height;
    let ctx = canvasCirle.getContext("2d");
    ctx.lineWidth=border;
    ctx.strokeStyle=color;
    let rx = width/2;
    let ry = height/2;
    // let r = Math.sqrt(rx*rx+ry*ry);
    let r = rx-border;
    ctx.beginPath();
    ctx.arc(rx,ry,r,0,2*Math.PI);
    ctx.stroke();
    let  dataURL = canvasCirle.toDataURL();  // 可选其他值 image/jpeg
    return  dataURL;
}
/**
 * 获取矩形的base64
 * @param {int}  边距............ border
 * @param {string}  颜色......... color 
 * @param {int}  宽......... width 
 * @param {int}  高......... height 
 */
function getRectangleBase64(border,color,width,height){
    let canvasCirle = document.createElement("canvas");
    canvasCirle.width = width;
    canvasCirle.height = height;
    let ctx = canvasCirle.getContext("2d");
    ctx.lineWidth=2+border;
    ctx.strokeStyle=color;
    ctx.beginPath();
    ctx.rect(0,0,30,30);
    ctx.stroke();
    let  dataURL = canvasCirle.toDataURL();  // 可选其他值 image/jpeg
    return  dataURL;
}
/**
 * 获取箭头的base64
 * @param {int}  起点坐标............ fromX, fromY
 * @param {int}  终点坐标.........  toX, toY 
 * @param {int}  三角斜边一直线夹角......... theta 
 * @param {int}  三角斜边长度......... headlen 
 * @param {int}  箭头线宽度......... lineWidth 
 * @param {int}  箭头颜色......... color 
 * @param {int}  画布的宽度......... width 
 * @param {int}  画布的高度......... height 
 */
function getArrowBase64(fromX, fromY, toX, toY, theta, headlen, lineWidth, color,width,height){
    let canvasArrow = document.createElement("canvas");
    canvasArrow.width = 30;
    canvasArrow.height = 30;
    let ctx = canvasArrow.getContext("2d");

    theta = typeof(theta) != 'undefined' ? theta : 30; 
    headlen = typeof(theta) != 'undefined' ? headlen : 10; 
    lineWidth = typeof(lineWidth) != 'undefined' ? lineWidth : 1; 
    color = typeof(color) != 'color' ? color : '#000'; 
    // 计算各角度和对应的P2,P3坐标 
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI, 
        angle1 = (angle + theta) * Math.PI / 180, 
        angle2 = (angle - theta) * Math.PI / 180, 
        topX = headlen * Math.cos(angle1), 
        topY = headlen * Math.sin(angle1), 
        botX = headlen * Math.cos(angle2), 
        botY = headlen * Math.sin(angle2); 
    ctx.save(); 
    ctx.beginPath(); 
    var arrowX = fromX - topX, 
        arrowY = fromY - topY; 
    ctx.moveTo(arrowX, arrowY); 
    ctx.moveTo(fromX, fromY); 
    ctx.lineTo(toX, toY); 
    arrowX = toX + topX; 
    arrowY = toY + topY; 
    ctx.moveTo(arrowX, arrowY); 
    ctx.lineTo(toX, toY); 
    arrowX = toX + botX; 
    arrowY = toY + botY; 
    ctx.lineTo(arrowX, arrowY); 
    ctx.strokeStyle = color; 
    ctx.fillStyle = color; 
    ctx.lineWidth = lineWidth; 
    ctx.stroke(); 
    ctx.fill();
    ctx.restore();
    let  dataURL = canvasArrow.toDataURL();  // 可选其他值 image/jpeg
    return  dataURL;
}