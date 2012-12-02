function log(title, data) {
  if(!data) { data = {} };
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

  this.runCommand = function(client, c, v, p) {
    this.commands[c][v](client, p);
  };
}

function View(client, universe, width, height, x, y) {
  var self = this;

  this.width = width;
  this.height = height;
  this.client = client;
  this.universe = universe;
  this.x = x;
  this.y = y;

  log('create view', {id: client.id, width: width, height: height, x: x, y: y});
  client.view = this;

  this.updateViewSize = function(width, height) {
    this.width = width;
    this.height = height;
    log('update view size', {
      id: this.client.id,
      width: width,
      height: height
    });
  };

  this.updateViewWidth = function(width) {
    this.width = width;
    log('update view width', {id: this.client.id, width: width});
  };

  this.updateViewHeight = function(height) {
    this.height = height;
    log('update view height', {id: this.client.id, height: height});
  };
}

function Client(cg, id, ws) {
  var self = this;

  this.id = id;
  this.ws = ws;
  this.clientGroup = cg;
  this.server = cg.server;
  this.commands = this.server.commands;
  this.username = null;
  this.loggedIn = false;

  ws.on('message', function(msg) {
    try {
      var json = JSON.parse(msg);
    } catch(e) {
      log('ws message invalid json', {id: id, data: msg.data});
    }
    log('received message', {id: id, msg: json});

    if(json.c && json.v && json.p) {
      self.rcvCommand(json.c, json.v, json.p);
    } else {
      log('not a valid message', {id: id, msg: json});
    };
  });

  ws.on('close', function() {
    log('ws close', {id: id});
    self.close();
  });

  this.sendCommand = function(c, v, p) {
    cmd = {"c": c, "v": v, "p": p};
    log('send command', {id: this.id, cmd: cmd});
    snd = JSON.stringify(cmd);
    this.ws.send(snd);
  };

  this.rcvCommand = function(c, v, p) {
    log('received command', {id: this.id, cmd: {c: c, v: v, p: p}});
    this.commands.runCommand(this, c, v, p);
  };

  this.login = function(username, password) {
    log('login', {id: this.id, username: username, password: password});
    this.username = username;
    this.loggedIn = true;
    return true;
  };

  this.close = function() {
    this.ws.close();
    this.clientGroup.removeClient(this);
  };
}

function ClientGroup(server) {
  var self = this;

  this.clients = {};
  this.nextId = 0;
  this.server = server;

  this.newClient = function(ws) {
    id = ++this.nextId;
    client = new Client(self, id, ws);
    this.clients[id] = client;
    return client;
  }

  this.removeClient = function(client) {
    delete this.clients[client];
  }
}

function Server(port) {
  var self = this;

  this.port = port || 7777;
  this.clientGroup = new ClientGroup(this);
  this.commands = new Commands();

  var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

  app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
  });

  app.get("/status", function(req, res) {
    res.locals.clientGroup = self.clientGroup;
    res.locals.server = self;
    res.render("status");
  });

  var svr = http.createServer(app);
  svr.listen(this.port);

  this.wss = new WebSocketServer({server: svr});
  this.wss.on('connection', function(ws) {
    var client = self.clientGroup.newClient(ws);
    var id = client.id;

    log('ws connection', {id: id});
  });

  this.on = function(cmd, ver, func) {
    this.commands.registerCommand(cmd, ver, func);
  };
};

function Mongo(url) {
  var self = this;

  this.url = url;

  var MongoClient = require('mongodb').MongoClient;

  this.connect = function(func) {
    MongoClient.connect(this.url, function(err, db) {
      if(err) { return log('failure to connect', {"err":err}) };
      log('mongodb connected', {url: self.url});

      func(db);
    });
  }; 
};

function Universe() {
  var self = this;

  this.mongo = new Mongo("mongodb://localhost:27017/kod");
  this.images = [];

  /* Grab images */
  this.mongo.connect(function(db) {
    var collection = db.collection('images');
    collection.find().toArray(function(err, items) {
      self.images = items;
      log('found images', {images: self.images});
    });
  });

  this.clientView = function(view, func) {
    this.mongo.connect(function(db) {
      var collection = db.collection('map');
      collection.find({
        x: {$gte: view.x, $lt: view.x+view.width},
        y: {$gte: view.y, $lt: view.y+view.height}
      },{"_id":0}).toArray(function(err, docs) {
        log('got map from mongodb', {map: docs});

        var lookupDocs = {};
        for(var i in docs) {
          var doc = docs[i];
          if(!lookupDocs[doc.x]) {
            lookupDocs[doc.x] = {};
          };
          lookupDocs[doc.x][doc.y] = doc;
        };

        var cView = [];
        for(var y = view.y; y < (view.y+view.height); y++) {
          var row = [];
          for(var x = view.x; x < (view.x+view.width); x++) {
            row.push(lookupDocs[x][y] || {tile: {floor: null}});
          };
          cView.push(row);
        };

        log('cview', {cview: cView});

        func({
          images: self.images,
          view: cView
        });
      });
    }); 
  };
};

function Game() {
  var server = new Server();
  var universe = new Universe();

  server.on("login", 1, function(c, pld) {
    if(c.login(pld.username, pld.password)) {
      c.sendCommand('create view', 1, {});
    } else {
      c.sendCommand('login again', 1, {});
    };
  });

  server.on("register view", 1, function(c, pld) {
    var startX = 1000000;
    var startY = 1000000;

    var view = new View(c, universe, pld.width, pld.height, startX, startY);

    universe.clientView(view, function(result) {
      c.sendCommand('draw view', 1, result);
    });
  });
};

g = new Game();
