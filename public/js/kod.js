function log(title, data) {
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
};

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
  };
};
var wv = new WorldView("world");

/**
 * Server connection object.
 *
 * @param {String} [url] WebSocket URL for Server, defaults to requested
 *                       hostname and port.
 */
function Server(url) {
  var self = this;

  if(!url) { url = "ws://" + window.document.location.host };
  this.url = url;

  log('connecting to server', {"url":this.url});

  this.ws = new WebSocket(this.url);
  this.ws.onopen = function() {
    log('socket open', {"url":url});
    self.login("ken", "ken");
  };
  this.ws.onerror = function() {
    log('unable to open socket', {"url": url});
  };
  this.ws.onclose = function() {
    log('websocket closed', {"url": url});
  };
  this.ws.onmessage = function(msg) {
    try {
      var json = JSON.parse(msg.data);
    } catch(e) {
      log('ws message invalid json', {"data": msg.data});
    };
    log('received message', {"url": url, "message": json});

    if(json.c && json.v && json.p) {
      self.rcvCommand(json.c, json.v, json.p);
    } else {
      log('not a valid message', {'msg': json});
    };
  };

  this.login = function(username, password) {
    this.sendCommand("login", 1, {
      "username": username,
      "password": password
    });
  };

  this.sendCommand = function(c, v, p) {
    cmd = {"c": c, "v": v, "p": p};
    log('send command', cmd);
    snd = JSON.stringify(cmd);
    this.ws.send(snd, function() {
      log("error sending command", {"command": snd});
    });
  };

  this.rcvCommand = function(c, v, p) {
    log('received command', {"c": c, "v": v, "p": p});
  };

  this.close = function() {
    this.ws.close();
  };
};

var s = new Server();

function loadedImage(str) {
  log('loaded image', {"name": str});
};

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
}, 3000);
