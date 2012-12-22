(function($, undefined) {
  $.widget('kod.game', {
    version: "@VERSION",

    defaultElement: "<div>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-game kod-noboxmodel'
    },

    _create: function() {
      var self = this;

      this.element.addClass(this.options.cssClasses);

      $('<canvas>').attr('id', 'mapview')
                   .css('height', '100%')
                   .css('width', '100%')
                   .css('vertical-align', 'top')
                   .hide()
                   .appendTo(this.element)
                   .mapview()
                   .height = parseInt($('#mapview').css("height"), 10)
                   .width = parseInt($('#mapview').css("width"), 10);

      $('<div>').attr('id', 'statusbar')
                .hide()
                .appendTo(this.element)
                .statusbar();

      $('<div>').attr('id', 'props')
                .appendTo(this.element)
                .props();

      $('<div>').attr('id', 'toolbar')
                .hide()
                .appendTo(this.element)
                .toolbar();

      $('<div>').attr('id', 'loginPrompt')
                .appendTo(this.element)
                .loginprompt();


      this.images = {};

      $(window).resize(function() {
        self._resize();
      }); // Wrapped to preserve scope
      this._resize();

      document.onkeydown = function(ev) {
        self._handleKeys(ev);
      };
    },

    /**
     * Retrieve images
     */
    getImages: function() {
      return this.images;
    },

    /**
     * Login
     */
    login: function(username, password) {
      /* Create client and register commands */
      this.client = new Client(username, password);
      this._registerCommands();

      /* Show elements */
      $('#statusbar').show();
      $('#mapview').show();
      $('#toolbar').show();
    },

    /**
     * Send command via client
     */
    sendCommand: function(cmd, ver, pld) {
      this.client.sendCommand(cmd, ver, pld);
    },

    /**
     * Load an image, call 'func()' when done.
     * TODO: look into jquery event handling here 
     */
    _loadImage: function(name, details, func) {
      log("loading image", {"name": name, "details": details});
      this.images[name] = new Image();
      this.images[name].onload = func;
      this.images[name].src = details.href;
    },

    /**
     * Load a set of images. Calls func() when they are all done.
     */
    _loadImages: function(images, func) {
      var icount = images.length;

      /** 
       * A function for counting down image loads and executing a callback when
       * they are all complete.
       */
      var imageLoaded = function() {
        --icount;
        if(icount === 0) {
          func();
        }   
      };  

      for(var key in images) {
        var image = images[key];
        this._loadImage(image.name, image, imageLoaded);
      }   
    },

    /**
     * Called during window resizing this will change the height and width
     * of the game div to ensure we keep fixed width and height.
     */
    _resize: function() {
      var div = this.element.get(0);
      var h = window.innerHeight + 'px';
      var w = window.innerWidth + 'px';

      div.style.height = h;
      div.style.width = w;

      log('window resized', {"h": h, "w": w}); 
    },

    /**
     * Deals with key presses.
     */
    _handleKeys: function(ev) {
      var self = this;
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

    /**
     * Register the protocol commands for receiving messages from the server.
     */
    _registerCommands: function() {
      var self = this;

      this.client.on("create view", 1, function(pld) {
        var v = $('#mapview');
        self.client.sendCommand("register view", 1, {
          "width": v.mapview('option', 'tilesWidth'),
          "height": v.mapview('option', 'tilesHeight')
        });
      });

      this.client.on("draw view", 1, function(pld) {
        var images = pld.images;
        var view = pld.view;

        self._loadImages(pld.images, function() {
          log('all images loaded', {"image_count":pld.images.length});
          $('#mapview').mapview('drawView', pld.view);
        });
      });
    },

    /**
     * This gets called when someone modifies the widget options.
     */
    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },

    /**
     * Removes any elements created during the widget init and then self-
     * destructs.
     *
     * "When the button is pushed theres no runnin' away"
     */
    _destroy: function() {
      this.element.removeClass(this.options.cssClasses);
    }
  });
}(jQuery));
