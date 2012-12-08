(function($, undefined) {
  $.widget('kod.game', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-game kod-noboxmodel'
    },

    _create: function() {
      var opts = this.options
          self = this;

      this.div = this.element.get(0);
      this.element.addClass(opts.cssClasses);
      this.client = new Client();
      this.universe = new Universe();

      $(window).resize(function() {
        self._resize();
      });
      this._resize();

      document.onkeydown = this._handleKeys;

      this._registerCommands();
    },

    _resize: function() {
      var h = window.innerHeight + 'px';
      var w = window.innerWidth + 'px';

      this.div.style.height = h;
      this.div.style.width = w;

      this.universe.view.viewCanvas.height = h;
      log('window resized', {"h": h, "w": w}); 
    },

    _handleKeys: function(ev) {
      var e = ev || window.event;
      switch(e.keyCode) {
      case 37:
        self.client.sendCommand("move", 1, {dir: "w"});
        break;
      case 38:
        self.client.sendCommand("move", 1, {dir: "n"});
        break;
      case 39:
        self.client.sendCommand("move", 1, {dir: "e"});
        break;
      case 40:
        self.client.sendCommand("move", 1, {dir: "s"});
        break;
      case 67:
        self.client.sendCommand("change tile", 1, {floor: 'cobblestone'});
        break;
      }
    },

    _registerCommands: function() {
      var self = this;

      this.client.on("create view", 1, function(pld) {
        var v = self.universe.view;
        self.client.sendCommand("register view", 1, {
          "width": v.width,
          "height": v.height
        });
      });

      this.client.on("draw view", 1, function(pld) {
        var images = pld.images;
        var view = pld.view;

        self.universe.loadImages(pld.images, function() {
          log('all images loaded', {"image_count":pld.images.length});
          self.universe.view.drawView(pld.view);
        });
      });
    },

    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },

    _destroy: function() {
      this.element.removeClass(this.options.cssClasses);
      this._destroy();
    }
  });
}(jQuery));
