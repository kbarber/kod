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

      /* Create necessary DOM elements for jquery ui tab widget */
      var tabdiv = $('<div id="toolTabs">');
      tabdiv.css('height', 'inherit')
            .append($('<div id="toolTabsProperties"></div>'))
            .append($('<div id="toolTabsLibrary"></div>'))
            .appendTo(this.div);
      var ul = $('<ul>');
      ul.prependTo(tabdiv),
        .append($('<li><a href="#toolTabsProperties">Properties</a></li>')),
        .append($('<li><a href="#toolTabsLibrary">Library</a></li>'));

      /* Make it a widget */
      $('#toolTabs').tabs({
        heightStyle: "fill"
      });

      /* Prep the tool library widget */
      $('#toolTabsLibrary').toollibrary();

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
