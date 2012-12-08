function log(title, data) {
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
}

function Commands() {
  var self = this;

  this.commands = {};
  this.registerCommand = function(cmd, ver, func) {
    if(!this.commands[cmd]) {
      this.commands[cmd] = {};
    }
    this.commands[cmd][ver] = func;
  };

  this.runCommand = function(c, v, p) {
    if(this.commands[c] && this.commands[c][v]) {
      this.commands[c][v](p);
    } else {
      log('unknown command', {"c": c, "v": v, "p": p});
    }
  };
}

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

/**
 * Client connection object.
 *
 * @param {String} [url] WebSocket URL, defaults to requested
 *                       hostname and port.
 */
function Client(url) {
  var self = this;

  this.commands = new Commands();

  if(!url) { url = "ws://" + window.document.location.host; }
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
    var json;
    try {
      json = JSON.parse(msg.data);
    } catch(e) {
      log('ws message invalid json', {"data": msg.data});
    }
    log('received message', {"url": url, "message": json});

    if(json.c && json.v && json.p) {
      self.rcvCommand(json.c, json.v, json.p);
    } else {
      log('not a valid message', {'msg': json});
    }
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
}

function Universe() {
  var self = this;

  this.images = {};
  this.loadImage = function(name, details, func) {
    log("loading image", {"name": name, "details": details});
    this.images[name] = new Image();
    this.images[name].onload = func;
    this.images[name].src = details.href;
  };
  this.view = new View(self);

  this.loadImages = function(images, func) {
    var icount = images.length;

    /**
     * A function for counting down image loads.
     */
    var imageLoaded = function() {
      --icount;
      if(icount === 0) {
        func();
      }
    };

    for(var key in images) {
      var image = images[key];
      this.loadImage(image.name, image, imageLoaded);
    }
  };
}

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
