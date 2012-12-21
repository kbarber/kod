(function($, undefined) {
  $.widget('kod.toolproperties', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-toolproperties kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      this.element.addClass(this.options.cssClasses)
                  .css('height', '100%')
                  .html('<p><span>Floor:</span> <span id="propertyFloor"></span></p>');

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    showTile: function(tile) {
      $('#propertyFloor').text(tile.tile.floor);
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
