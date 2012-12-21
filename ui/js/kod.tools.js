(function($, undefined) {
  $.widget('kod.tools', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-tools kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      this.element.addClass(this.options.cssClasses)
                  .css('position', 'absolute')
                  .css('z-index', 22)
                  .css('top', '10px')
                  .css('right', '10px')
                  .css('height', '95%')
                  .css('width', '34%');

      /* Create necessary DOM elements for jquery ui tab widget */
      $('<div>').attr('id', 'toolTabs')
                .css('height', '100%')
                .append($('<div id="toolTabsProperties"></div>'))
                .append($('<div id="toolTabsLibrary"></div>'))
                .appendTo(this.element);
      $('<ul>').prependTo('#toolTabs')
               .append($('<li><a href="#toolTabsProperties">Properties</a></li>'))
               .append($('<li><a href="#toolTabsLibrary">Library</a></li>'));

      /* Make it a widget */
      $('#toolTabs').tabs();

      /* Prep each of the tool tabs */
      $('#toolTabsLibrary').toollibrary();
      $('#toolTabsProperties').toolproperties();

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
