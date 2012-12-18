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
      tilesWidth: 64,
      tilesHeight: 64 
    },

    _create: function() {
      var opts = this.options,
          self = this;

      this.canvas = this.element.get(0);
      this.game = $(":kod-game");
      this.element.addClass(opts.cssClasses);

      /* Create some hidden canvas for blitting */
      this.tileCanvas = createBlitCanvas(this.element);
      this.pointerCanvas = createBlitCanvas(this.element);
      this.watermarkCanvas = createBlitCanvas(this.element);

      this.ctxView = this.canvas.getContext("2d");
      this.ctxTile = this.tileCanvas.getContext("2d");
      this.ctxPointer = this.pointerCanvas.getContext("2d");
      this.ctxWatermark = this.watermarkCanvas.getContext("2d");

      this._drawWatermark();

      /* Report mouse status */
      $(document).mousemove(function(evt) {
        $('#statusbar').statusbar('setMouseXY', evt.pageX, evt.pageY);
      });

      /* Start watching resize events */
      $(window).resize(function() {
        self._resize();
      });
      this._resize();
    },

    _drawWatermark: function() {
      /* Draw watermark title in canvas */
      this.ctxWatermark.fillStyle = "white";
      this.ctxWatermark.font = "bold 18px century gothic";
      this.ctxWatermark.shadowColor = "red";
      this.ctxWatermark.shadowOffsetX = 0;
      this.ctxWatermark.shadowOffsetY = 0;
      this.ctxWatermark.shadowBlur = 10;
      this.ctxWatermark.fillText("Knights of Dischord", 10, 20);
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
      this.ctxView.drawImage(this.pointerCanvas, 0, 0);
      this.ctxView.drawImage(this.watermarkCanvas, 0, 0);
    },

    _setOption: function(name, value) {
      $.Widget.prototype._setOption.apply(this, arguments);
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
        if(this.watermarkCanvas) {
          this.watermarkCanvas.height = h;
          this.watermarkCanvas.width = w;
        }
        if(this.pointerCanvas) {
          this.pointerCanvas.height = h;
          this.pointerCanvas.width = w;
        }

        this._drawWatermark();
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
