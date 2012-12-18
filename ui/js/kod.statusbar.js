(function($, undefined) {
  $.widget('kod.statusbar', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-statusbar kod-noboxmodel',
    },

    _create: function() {
      var opts = this.options,
          self = this;

      this.div = this.element.get(0);
      this.element.addClass(opts.cssClasses);

      this.element.append($('<span id="statusBarMouseX">X: </span>'))
                  .append($('<span id="statusBarMouseY">Y: </span>'));

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    setMouseXY: function(x, y) {
      $('#statusBarMouseX').text('X: ' + x + ' ');
      $('#statusBarMouseY').text('Y: ' + y + ' ');
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
