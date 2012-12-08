function Game() {
  var self = this;

  this.client = new Client();
  this.universe = new Universe();

  /* Handle sizing for the div class 'game' 
   *
   * The goal is generally to pin the 'game' div to the visible height
   * and width of the window. This div will contain all viewable widgets so we
   * end up with a fixed width/height area.
   */
  var gameDiv = $('#game').get(0);
  this.sizeMain = function() {
    gameDiv.height = window.innerHeight + 'px';
    gameDiv.width = window.innerWidth + 'px';
    gameDiv.style.height = gameDiv.height;
    gameDiv.style.width = gameDiv.width;

    this.universe.view.viewCanvas.height = document.innerHeight;
    log('window resized', {"height":gameDiv.height, "width":gameDiv.width}); 
  };
  window.onresize = this.sizeMain;
  this.sizeMain();

  /* Setup key handling */
  this.checkKey = function(ev) {
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
  };
  document.onkeydown = this.checkKey;

  /* Configure commands */
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
}

$(document).ready(function() {
  g = new Game();
});
