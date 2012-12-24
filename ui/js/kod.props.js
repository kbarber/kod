(function($, undefined) {
  $.widget('kod.props', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-props kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      this.element.addClass(this.options.cssClasses)
                  .append('<p><span>X:</span> <span id="propertyX"></span></p>')
                  .append('<p><span>Y:</span> <span id="propertyY"></span></p>')
                  .append('<p><span>Floor:</span> <span id="propertyFloor"></span></p>')
                  .dialog({
                    title: 'Properties',
                    position: {
                      at: "right top"
                    },
                    height: 200,
                    width: 200,
                    autoOpen: false
                  });

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    showTile: function(tile) {
      $('#propertyFloor').text(tile.tile.floor);
      $('#propertyX').text(tile.x);
      $('#propertyY').text(tile.y);
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
