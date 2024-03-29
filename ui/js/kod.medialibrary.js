(function($, undefined) {
  $.widget('kod.medialibrary', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-medialibrary kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      this.element.addClass(this.options.cssClasses)
                  .css('height', '100%');

      /* Prepare content for accordion view */
      $('<div>').attr('id', 'mediaLibraryAccordion')
                .append($('<h3>Objects</h3>'))
                .append($('<div id="mediaLibraryObjects">'))
                .append($('<h3>Floors</h3>'))
                .append($('<div id="mediaLibraryFloors">'))
                .appendTo(this.element)
                .accordion({ heightStyle: "content" });

      /* Draw some sample selectables */
      $('<ol>').attr('id', 'selectable')
               .css('list-style-type', 'none')
               .css('margin', '0')
               .css('padding', '0')
               .append($('<li class="ui-widget-content">Foo</li>'))
               .appendTo($('#mediaLibraryObjects'))
               .selectable();
      
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
