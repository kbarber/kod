(function($, undefined) {
  $.widget('kod.toollibrary', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-toollibrary kod-noboxmodel',
    },

    _create: function() {
      var opts = this.options,
          self = this;

      this.div = this.element.get(0);
      this.element.addClass(opts.cssClasses);
      this.element.css('height', '100%');

      /* Prepare content for accordion view */
      var accdiv = $('<div id="toolLibraryAccordion">');
      accdiv.css('height', '100%')
            .append($('<h3>Objects</h3>'))
            .append($('<div id="toolLibraryObjects">'))
            .append($('<h3>Floors</h3>'))
            .append($('<div id="toolLibraryFloors">'))
            .appendTo(this.div);

      /* Now make it an accordian */
      $('#toolLibraryAccordion').accordion();

      /* Draw some sample selectables */
      var sol = $('<ol id="selectable">');
      sol.css('list-style-type', 'none')
         .css('margin', '0')
         .css('padding', '0')
         .append($('<li class="ui-widget-content">Foo</li>'))
         .appendTo($('#toolLibraryObjects'));
      $('#selectable').selectable();
      

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
