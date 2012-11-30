/**
 * An object that represents the visible world.
 *
 * @param {String} canvasId
 */
function WorldView(canvasId) {
  this.world = document.getElementById(canvasId);
  this.world.width = 400;
  this.world.height = 400; 
  this.world.style.width  = '400px';
  this.world.style.height = '400px';
  this.ctx = world.getContext("2d");

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
    this.ctx.drawImage(obj, x*32, y*32);
  }
}
var wv = new WorldView("world");

/**
 * KodServer connection object.
 *
 * @param {String} url WebSocket URL for KodServer
 */
function KodServer(url) {
  var self = this;
  this.url = url
  this.ws = new WebSocket(this.url);
  this.ws.onopen = function() {
    console.log("socket open: " + url);
    self.login();
  }
  this.ws.onmessage = function(msg) {
    rcv = JSON.parse(msg.data);
    console.log("On message: " + rcv);
  }

  this.login = function() {
    cmd = {
      "command":"login",
      "version":1,
      "payload":{
        "username":"ken",
        "password":"ken"
      }
    };
    snd = JSON.stringify(cmd);
    this.ws.send(snd);
  }

  this.close = function() {
    this.ws.close();
  }
}


var ks = new KodServer("ws://localhost:7778/");

function loadedImage(str) {
  console.log("Loaded image: " + str);
}

/* Prepare images */
var grass = new Image;
grass.onload = loadedImage("grass");
grass.src = "img/grass.png";

var knight = new Image;
grass.onload = loadedImage("knight");
knight.src = "img/knight.png";

var cthulhu = new Image;
cthulhu.onload = loadedImage("cthulhu");
cthulhu.src = "img/cthulhu.png";

var rabbit = new Image;
rabbit.onload = loadedImage("rabbit");
rabbit.src = "img/rabbit.png";

var cs = new Image;
cs.onload = loadedImage("cobblestone");
cs.src = "img/cobblestone.png";

setTimeout(function() {
  for (x = 0; x < 12; x++) {
    for (y = 0; y < 12; y++) {
      wv.drawTile(grass, x, y);
    }
  }

  wv.drawTile(knight, 0, 0);
  wv.drawTile(cthulhu, 1, 0);
  wv.drawTile(rabbit, 3, 0);

  for (y = 0; y < 12; y++) {
    wv.drawTile(cs, 5, y);
  }
  for (x = 5; x < 12; x++) {
    wv.drawTile(cs, x, 5);
  }
}, 3000)

