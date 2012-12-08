/**
 * An object that represents the visible world.
 *
 * @param {String} canvasId
 */
function View(universe) {
  var self = this;

  this.universe = universe;

  this.width = 17;
  this.height = 22;
  this.tileSize = 32;

  /* Tool area */
  this.toolsDiv = $('#tools').get(0);

  /* Main view canvas */
  this.viewCanvas = $('#world').get(0);
  var w = parseInt(this.viewCanvas.style.width, 10);
  var h = document.innerHeight;
  log('setting size of canvas', {w: w, h: h});
  this.viewCanvas.width = w;
  this.viewCanvas.height = h;

  /* Invisible canvas for blitting */
  this.tileCanvas = document.createElement('canvas');
  this.tileCanvas.width = this.viewCanvas.width;
  this.tileCanvas.height = this.viewCanvas.height;

  /* Invisible canvas for blitting */
  this.toolCanvas = document.createElement('canvas');
  this.toolCanvas.width = this.viewCanvas.width;
  this.toolCanvas.height = this.viewCanvas.height;

  this.ctxView = this.viewCanvas.getContext("2d");
  this.ctxTile = this.tileCanvas.getContext("2d");
  this.ctxTool = this.toolCanvas.getContext("2d");

  /* Draw title in canvas */
  this.ctxTool.fillStyle = "white";
  this.ctxTool.font = "bold 18px century gothic";
  this.ctxTool.shadowColor = "red";
  this.ctxTool.shadowOffsetX = 0;
  this.ctxTool.shadowOffsetY = 0;
  this.ctxTool.shadowBlur = 10;
  this.ctxTool.fillText("Knights of Dischord", 10, 20);

  /**
   * Draw an image onto the main world area as a tile.
   *
   * @public
   * @example
   * var image = new Image;
   * grass.src = "img/grass.png";
   * drawTile(grass, 4, 1);
   * @param {Image} obj Image object to draw
   * @param {Number} x X coordinate
   * @param {Number} y Y coordinate
   */
  this.drawTile = function(obj, x, y) {
    this.ctxTile.drawImage(obj, x * this.tileSize, y * this.tileSize);
  };

  this.drawView = function(view) {
    for(var y = 0; y < view.length; y++) {
      var row = view[y];
      for(var x = 0; x < row.length; x++) {
        var cell = row[x];
        var floor = cell.tile.floor;

        this.drawTile(this.universe.images[floor], x, y);
      }
    }
    this.paint();
  };

  this.paint = function() {
    this.ctxView.drawImage(this.tileCanvas, 0, 0);
    this.ctxView.drawImage(this.toolCanvas, 0, 0);
  };
}
