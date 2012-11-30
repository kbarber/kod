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
function WorldView(canvasId, width, height) {
  this.world = document.getElementById(canvasId);
  this.width = width;
  this.height = height;
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
};

/**
 * Client connection object.
 *
 * @param {String} [url] WebSocket URL, defaults to requested
 *                       hostname and port.
 */
function Client(game, url) {
  var self = this;

  this.game = game;
  this.commands = this.game.commands;

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
};

function Game() {
  var self = this;

  this.commands = new Commands();
  this.client = new Client(this);
  this.images = {};
  this.worldView = null;

  this.on = function(cmd, ver, func) {
    this.commands.registerCommand(cmd, ver, func);
  };

  this.createView = function(id, width, height) {
    this.worldView = new WorldView(id, width, height);
  };

  this.loadImage = function(name, details) {
    log("loading image", {"name": name, "details": details});
    this.images[name] = new Image;
    this.images[name].src = details.href;
  };

  this.loadImages = function(images) {
    for(var key in images) {
      this.loadImage(key, images[key]);
    };
  };

  this.drawView = function(view) {
    var wv = this.worldView;
    for(var y = 0; y < view.length; y++) {
      var row = view[y];
      for(var x = 0; x < row.length; x++) {
        var cell = row[x];
        var images = cell['images'];

        for(var image in images) {
          var name = images[image];
          wv.drawTile(g.images[name], x, y);
        };
      }
    }
  };
};

g = new Game();

g.on("create view", 1, function(pld) {
  g.createView("world", 12, 12);
  g.client.sendCommand("register view", 1, {
    "width": 12,
    "height": 12
  });
});

g.on("draw view", 1, function(pld) {
  var images = pld.images;
  var view = pld.view;

  g.loadImages(pld.images);

  setTimeout(function() {
    g.drawView(pld.view);
  }, 3000);
});
