/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var PopoverX = function (element, options) {
    this.init('popoverX', element, options);
  };

  if (!$.fn.tooltipX) throw new Error('Popover requires tooltip.js');

  PopoverX.VERSION  = '3.3.7';

  PopoverX.DEFAULTS = $.extend({}, $.fn.tooltipX.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  PopoverX.prototype = $.extend({}, $.fn.tooltipX.Constructor.prototype);

  PopoverX.prototype.constructor = PopoverX;

  PopoverX.prototype.getDefaults = function () {
    return PopoverX.DEFAULTS;
  };

  PopoverX.prototype.setContent = function () {
    var $tip    = this.tip();
    var title   = this.getTitle();
    var content = this.getContent();

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content);

    $tip.removeClass('fade top bottom left right in');

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
  };

  PopoverX.prototype.hasContent = function () {
    return this.getTitle() || this.getContent();
  };

  PopoverX.prototype.getContent = function () {
    var $e = this.$element;
    var o  = this.options;

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content);
  };

  PopoverX.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'));
  };


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('bs.popover');
      var options = typeof option == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.popover', (data = new PopoverX(this, options)));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.popoverX;

  $.fn.popoverX             = Plugin;
  $.fn.popoverX.Constructor = PopoverX;


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popoverX.noConflict = function () {
    $.fn.popoverX = old;
    return this;
  };

}(jQuery);
