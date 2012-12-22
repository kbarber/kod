(function($, undefined) {
  /**
   * Create a hidden canvas for blitting, based on an original.
   */
  function createBlitCanvas(orig) {
    var o = orig.get(0),
        c = document.createElement('canvas');
    log('creating new blit canvas', {w: o.width, h: o.height});
    c.width = o.width;
    c.height = o.height;

    return c;
  }

  $.widget('kod.mapview', {
    version: "@VERSION",

    defaultElement: "<canvas>",

    options: {
      /* css classes that get applied to our element */
      cssClasses: 'kod-mapview kod-noboxmodel',
      /* tile size in pixels */
      tileSize: 32,
      /* Number of tiles in width and height */
      tilesWidth: 80,
      tilesHeight: 80 
    },

    _create: function() {
      var opts = this.options,
          self = this;

      this.canvas = this.element.get(0);
      this.game = $(":kod-game");
      this.element.addClass(opts.cssClasses)
                  .css('height', '100%')
                  .css('width', '100%')
                  .css('vertical-align', 'top');

      /* Create some hidden canvas for blitting */
      this.tileCanvas = createBlitCanvas(this.element);
      this.pointerCanvas = createBlitCanvas(this.element);
      this.selectedCanvas = createBlitCanvas(this.element);

      this.ctxView = this.canvas.getContext("2d");
      this.ctxTile = this.tileCanvas.getContext("2d");
      this.ctxPointer = this.pointerCanvas.getContext("2d");
      this.ctxSelected = this.selectedCanvas.getContext("2d");

      /* Report mouse status */
      this.element.mousemove(function(evt) {
        self._pointer(evt.pageX, evt.pageY);
        $('#statusbar').statusbar('setMouseXY', evt.pageX, evt.pageY);
      });

      this.element.mouseleave(function(evt) {
        self._pointerClear();
        $('#statusbar').statusbar('setMouseXY', '?', '?');
      });

      this.element.mousedown(function(evt) {
        if(evt.button === 0) {
          self._selected(evt.pageX, evt.pageY);
        }
      });

      this.setToolSelect();

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    _drawTile: function(obj, x, y) {
      var o = this.options;
      this.ctxTile.drawImage(obj, x * o.tileSize, y * o.tileSize);
    },

    drawView: function(view) {
      this.lastView = view;
      var images = this.game.game('getImages');
      for(var y = 0; y < view.length; y++) {
        var row = view[y];
        for(var x = 0; x < row.length; x++) {
          var cell = row[x];
          var floor = cell.tile.floor;

          this._drawTile(images[floor], x, y);
        }
      }
      this._paint();
    },

    _getImages: function() {
      var g = this.game;
    },

    _paint: function() {
      this.ctxView.drawImage(this.tileCanvas, 0, 0);
      this.ctxView.drawImage(this.selectedCanvas, 0, 0);
      this.ctxView.drawImage(this.pointerCanvas, 0, 0);
    },

    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
    },

    _pointer: function(x, y) {
      var ctx = this.ctxPointer;
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 4;

      var ts = this.options.tileSize;
      var newx = Math.floor(x / ts) * ts;
      var newy = Math.floor(y / ts) * ts;
      ctx.clearRect(0, 0, this.pointerCanvas.width, this.pointerCanvas.height);
      ctx.strokeRect(newx, newy, ts, ts);
      this._paint();
    },

    _pointerClear: function() {
      var ctx = this.ctxPointer;
      ctx.clearRect(0, 0, this.pointerCanvas.width, this.pointerCanvas.height);
      this._paint();
    },

    setToolSelect: function() {
      this.toolFunc = function(x, y, tileData) {
        var ts = this.options.tileSize;
        var ctx = this.ctxSelected;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.clearRect(0, 0, this.selectedCanvas.width, this.selectedCanvas.height);
        ctx.strokeRect(x * ts, y * ts, ts, ts);

        $(':kod-props').dialog('open');
        $(':kod-props').props('showTile', tileData);
        this._paint();
      };
    },

    setToolFloor: function() {
      this.toolFunc = function(x, y, tileData) {
        tileData.tile.floor = "grass";
        $(':kod-game').game('sendCommand', 'change tile', 1, tileData);
      };
    },

    _selected: function(x, y) {
      var ts = this.options.tileSize;
      var tilex = Math.floor(x / ts);
      var tiley = Math.floor(y / ts);
      var tileData = this.lastView[tiley][tilex];

      this.toolFunc(x, y, tileData);

    },

    _resize: function() {
      var h = parseInt(this.element.css("height"), 10);
      var w = parseInt(this.element.css("width"), 10);

      var dom = this.canvas;

      if(dom.height !== h || dom.width !== w) {
        log('adjusting to size', {h: h, w: w});

        /* adjust the local canvas element */
        dom.height = h;
        dom.width = w;

        /* adjust the canvas blit copies */
        if(this.tileCanvas) {
          this.tileCanvas.height = h;
          this.tileCanvas.width = w;
        }
        if(this.pointerCanvas) {
          this.pointerCanvas.height = h;
          this.pointerCanvas.width = w;
        }
        if(this.selectedCanvas) {
          this.selectedCanvas.height = h;
          this.selectedCanvas.width = w;
        }

        if(this.lastView) {
          log('redrawing mapview');
          this.drawView(this.lastView);
        }
      }
    },

    _destroy: function() {
      this.element.removeClass(this.options.cssClasses);
    }
  });
}(jQuery));
