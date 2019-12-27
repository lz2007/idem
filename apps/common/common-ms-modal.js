/**
 * common-ms-modal 参数：
 *      title: 弹窗标题 string
 *      cancelText:自定义取消按钮文字   string
 *      okText:自定义确认按钮文字 string
 *      onCancel:点击取消的回调 function
 *      onOk:	点击确定的回调 function
 *      show:是否显示弹窗    Boolean
 *      modalWidth: 自定义弹窗宽度  number string  
 *      modalHeight: 自定义弹窗body高度  number string  默认 auto
 *      ifcancelBtn:true  是否显示取消按钮 Boolean
 *      ifokBtn:true  是否显示确定按钮 Boolean
 *      drag 是否可以拖动弹窗  Boolean 默认：true
 *      btnalign:'right' 弹窗底部按钮位置 left center right
 *      <solt></solt> 插槽 弹窗body内容
 * 栗子
 *      <xmp :widget="{is:'common-ms-modal',modalSelector:'.sjbgl-del-body',drag:true,modalWidth:300,show:@showmodal,onOk:@okClickfn,onCancel:@cancelClickFn}">
            <div class="sjbgl-del-body">
                是否删除?
            </div>
        </xmp>
 * 注意
 * 有插槽的组件使用时要用<xmp is="组件名" />，不能使用<ms-组件名 />来使用组件，不然在ie8出问题
 * xmp 不能嵌套
 * 
 * author lz
 */
import avalon from 'avalon2';
import './common-ms-modal.css';

avalon.effect("my-fade-animation", {
    enterClass: "fade-enter",
    enterActiveClass: 'fade-enter-active',
    leaveClass: "fade-leave",
    leaveActiveClass: 'fade-leave-active'
});

avalon.effect("my-zoom-animation", {
    enterClass: "zoom-enter",
    enterActiveClass: "zoom-enter-active",
    leaveClass: "zoom-leave",
    leaveActiveClass: "zoom-leave-active"
});

avalon.component('common-ms-modal', {
    template: __inline('./common-ms-modal.html'),
    defaults: {
        // 弹窗标题
        title: '提示',
        // 取消按钮文字
        cancelText: '取 消',
        // 确定按钮文字
        okText: '确 定',
        // 额外按钮文字
        extraText: '自定义',
        // 是否显示
        show: false,
        // 弹窗宽度
        modalWidth: 500,
        // 是否显示取消按钮
        ifcancelBtn: true,
        // 是否显示确定按钮
        ifokBtn: true,
        //是否显示第三个按钮
        ifextraBtn: false,
        // 是否可以拖动弹窗
        drag: true,
        // 弹窗body的高度
        modalHeight: 'auto',
        maxLeft: '',
        maxTop: '',
        $skipArray: ['maxLeft', 'maxTop', 'modalSelector'],
        modalSelector: '',
        // 弹窗底部按钮位置
        btnalign: 'center',
        winHeight: 0,
        closeIconShow: true,
        okDisabled: false,
        cancleDisabled: false,
        extraDisabled: false,
        $params: {
            left: 0,
            top: 0,
            currentX: 0,
            currentY: 0,
            flag: false
        },
        onReady: function () {
            this.winHeight = avalon(window).height();
            var el = this.$element;

            if (this.show) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none'; //强制阻止动画发生
            }
            this.maxLeft = $(window).width() - this.modalWidth;
            this.maxTop = $(window).height() - $(this.modalSelector).parents('.com-modal-modal').height();
            $(this.modalSelector).parents('.com-modal-modal').css({
                left: this.maxLeft / 2,
                top: this.maxTop / 2
            });
            this.$watch('show', function (val) {
                $('div.popover').remove();
                if (val) {
                    el.style.display = 'block';
                    this.maxLeft = $(window).width() - this.modalWidth;
                    this.maxTop = $(window).height() - $(this.modalSelector).parents('.com-modal-modal').height();
                    if(navigator.userAgent.indexOf("Chrome") > -1){
                        // 即是chrome
                        this.extramove(this.maxTop / 2 -15, this.maxLeft / 2 + $(document).scrollLeft());
                        // this.extramove(this.maxTop / 2 - 15 + $(document).scrollTop(), this.maxLeft / 2 + $(document).scrollLeft());

                    }else{
                        // this.extramove(this.maxTop / 2 - this.modalHeight/2 + 25 + $('body').scrollTop(), this.maxLeft / 2 + $(document).scrollLeft());
                        this.extramove(this.maxTop / 2 - 15 + $('body').scrollTop(), this.maxLeft / 2 + $(document).scrollLeft());
                    }
                    $(this.modalSelector).parents('.com-modal-modal').css({
                        left: this.maxLeft / 2,
                        top: this.maxTop / 2
                    });
                    if(navigator.userAgent.indexOf("Chrome") > -1){
                        //谷歌固定位置
                        this.extraChromeHandle($(this.modalSelector).parents('.com-modal-modal'),this.maxTop / 2, this.maxLeft / 2);
                    }
                } else {
                    el.style.display = 'none';
                }
            });

        },
        $computed: {
            drapClass() {
                if (this.drag) {
                    return 'drap';
                } else {
                    return 'aa';
                }
            }
        },
        //取消
        cancelClick() {
            if (this.cancleDisabled) {
                return;
            }
            this.onCancel();
        },
        //取消回调
        onCancel: avalon.noop,
        //确定
        okClick() {
            if (this.okDisabled) {
                return;
            }
            this.onOk();
        },
        extramove: avalon.noop,
        //谷歌额外处理函数
        extraChromeHandle:avalon.noop,
        // 确定回调
        onOk: avalon.noop,
        //额外按钮
        extraClick() {
            if (this.extraDisabled) {
                return;
            }
            this.onExtra();
        },
        // 额外按钮回调
        onExtra: avalon.noop,
        // 弹窗按下
        mousedown(e) {
            if (!this.drag) {
                return false;
            }
            let _this = this;
            let parentNode = e.currentTarget.parentNode.parentNode;
            this.$params.left = parseInt(avalon(parentNode).css('left'));
            this.$params.top = parseInt(avalon(parentNode).css('top'));
            this.$params.currentX = e.clientX;
            this.$params.currentY = e.clientY;
            this.$params.flag = true;
            $(document).off('mousemove.modal').on('mousemove.modal', function (e) {
                var nowX = e.clientX,
                    nowY = e.clientY;
                var disX = nowX - (_this.$params.currentX),
                    disY = nowY - _this.$params.currentY;

                // _this.extramove(_this.$params.top + disY - _this.modalHeight/2 + 25+ $('body').scrollTop(), _this.$params.left + disX + $(document).scrollLeft());
                _this.extramove(_this.$params.top + disY - 15 + $('body').scrollTop(), _this.$params.left + disX + $(document).scrollLeft());

                $(_this.modalSelector).parents('.com-modal-modal').css({
                    left: ((_this.$params.left + disX) >= 0 && ((_this.$params.left + disX) <= _this.maxLeft)) ? _this.$params.left + disX : ((_this.$params.left + disX) < 0 ? 0 : _this.maxLeft),
                    top: ((_this.$params.top + disY) >= 0 && ((_this.$params.top + disY) <= _this.maxTop)) ? _this.$params.top + disY : ((_this.$params.top + disY) < 0 ? 0 : _this.maxTop)
                });
            });
            $(document).off('mouseup.modal').on('mouseup.modal', function () {
                $(document).off('mousemove.modal');
            });
            if (e) {
                //防止IE文字选中
                e.currentTarget.onselectstart = function () {
                    return false;
                };
            }
        },
        // 弹窗松开
        mouseup(e) {

            this.$params.flag = false;
        },
        //弹窗移动
        mousemove(e) {
            let parentNode = e.currentTarget.parentNode.parentNode;
            if (this.$params.flag) {
                var nowX = e.clientX,
                    nowY = e.clientY;
                var disX = nowX - (this.$params.currentX),
                    disY = nowY - this.$params.currentY;
                parentNode.style.left = parseInt(this.$params.left) + disX + "px";
                parentNode.style.top = parseInt(this.$params.top) + disY + "px";
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            }
        },
        body: ''
    },
    soleSlot: 'body'
});