function log(title, data) {
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
};

function Commands() {
  var self = this;

  this.commands = {};
  this.registerCommand = function(cmd, ver, func) {
    if(!this.commands[cmd]) {
      this.commands[cmd] = {};
    };
    this.commands[cmd][ver] = func;
  };

  this.runCommand = function(c, v, p) {
    if(this.commands[c] && this.commands[c][v]) {
      this.commands[c][v](p);
    } else {
      log('unknown command', {"c": c, "v": v, "p": p});
    };
  };
}

/**
 * An object that represents the visible world.
 *
 * @param {String} canvasId
 */
function View(universe, canvasId) {
  var self = this;

  this.universe = universe;
  this.world = document.getElementById(canvasId);
  this.width = Math.floor(document.body.scrollWidth / 32);
  this.height = Math.floor(document.body.scrollHeight / 32);
  this.tileWidth = 32;
  this.world.width = this.width * this.tileWidth;
  this.world.height = this.height * this.tileWidth;
  this.world.style.width  = this.world.width + 'px';
  this.world.style.height = this.world.height + 'px';
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
    this.ctx.drawImage(obj, x * this.tileWidth, y * this.tileWidth);
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
  };
};

/**
 * Client connection object.
 *
 * @param {String} [url] WebSocket URL, defaults to requested
 *                       hostname and port.
 */
function Client(url) {
  var self = this;

  this.commands = new Commands();

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
    this.commands.runCommand(c, v, p);
  };

  this.close = function() {
    this.ws.close();
  };

  this.on = function(cmd, ver, func) {
    this.commands.registerCommand(cmd, ver, func);
  };
};

function Universe() {
  var self = this;

  this.images = {};
  this.view = null;

  this.loadImage = function(name, details, func) {
    log("loading image", {"name": name, "details": details});
    this.images[name] = new Image;
    this.images[name].onload = func;
    this.images[name].src = details.href;
  };

  this.loadImages = function(images, func) {
    var icount = images.length;

    /**
     * A function for counting down image loads.
     */
    var imageLoaded = function() {
      --icount;
      if(icount == 0) {
        func();
      };
    };

    for(var key in images) {
      var image = images[key];
      this.loadImage(image.name, image, imageLoaded);
    };
  };
};

function Game() {
  var self = this;

  this.client = new Client();
  this.universe = new Universe();

  this.checkKey = function(e) {
    var e = e || window.event;
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
    };
  };

  document.onkeydown = this.checkKey;

  this.client.on("create view", 1, function(pld) {
    var v = self.universe.view = new View(self.universe, "world");
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
};

g = new Game();
