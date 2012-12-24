(function($, undefined) {
  $.widget('kod.toolbar', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-toolbar kod-noboxmodel',
    },

    _create: function() {
      var self = this;

      /* Selection button */
      var select = $('<button id="selectButton">');
      select.button({ text: false })
            .css('background-image', 'url(img/selecttool.png)')
            .css('background-repeat', 'no-repeat')
            .css('height', '40px')
            .css('width', '40px')
            .attr('title', 'Selection tool')
            .tooltip()
            .click(function() {
              $(':kod-mapview').mapview('setToolSelect');
            });

      /* Floor paint */
      var floor = $('<button id="floorButton">');
      floor.css('height', '40px')
           .css('width', '40px')
           .css('margin-right', '-1px')
           .button({ text: false })
           .css('background-image', 'url(img/grass.png)')
           .css('background-repeat', 'no-repeat')
           .attr('title', 'Floor painting tool')
           .tooltip()
           .click(function() {
             $(':kod-mapview').mapview('setToolFloor');
           });
      var floorDrop = $('<button id="floorButtonDrop">');
      floorDrop.css('height', '40px')
               .css('width', '40px')
               .button({
                 text: false,
                 icons: {
                   primary: "ui-icon-triangle-1-s"
                 }
               })
               .attr('title', 'Select a floor')
               .tooltip()
               .click(function() {
               });
      var floorCombo = $('<div>');
      floorCombo.append(floor)
                .append(floorDrop)
                .css('display', 'inline-block')
                .buttonset();

      var obj = $('<button id="objButton">');
      obj.css('height', '40px')
         .css('width', '40px')
         .css('margin-right', '-1px')
         .button({ text: false })
         .css('background-image', 'url(img/chest.png)')
         .css('background-repeat', 'no-repeat')
         .attr('title', 'Object placement tool')
         .tooltip()
         .click(function() {
         });
      var objDrop = $('<button id="objButtonDrop">');
      objDrop.css('height', '40px')
             .css('width', '40px')
             .button({
               text: false,
               icons: {
                 primary: "ui-icon-triangle-1-s"
               }
             })
             .attr('title', 'Select an object')
             .tooltip()
             .click(function() {
             });
      var objCombo = $('<div>');
      objCombo.append(obj)
              .append(objDrop)
              .css('display', 'inline-block')
              .buttonset();

      this.toolbarSpan = $('<div id="toolbarSpan">');
      this.toolbarSpan.addClass('ui-widget-header ui-corner-all')
                      .css('padding', '4px 4px 0px 4px')
                      .css('height', '45px')
                      .append(select)
                      .append(floorCombo)
                      .append(objCombo);

      this.element.addClass(this.options.cssClasses)
                  .css('position', 'absolute')
                  .css('z-index', 22)
                  .css('top', '10px')
                  .css('left', '10px')
                  .css('height', '45px')
                  .append(this.toolbarSpan);

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
