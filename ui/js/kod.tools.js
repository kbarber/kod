(function($, undefined) {
  $.widget('kod.tools', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-tools kod-noboxmodel',
    },

    _create: function() {
      var opts = this.options,
          self = this;

      this.div = this.element.get(0);
      this.element.addClass(opts.cssClasses);

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },

    _resize: function() {
    },

    _destroy: function() {
      this.element.removeClass(this.options.cssClasses);
    }
  });
}(jQuery));
