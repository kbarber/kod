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
    if(this.commands[c] && this.commands[c][v]) {
      this.commands[c][v](client, p);
    } else {
      log('unknown command', {id: client.id, c: c, v: v, p: p});
    };  
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

function Mongo(hostname, port, dbName, func) {
  var self = this;

  this.hostname = hostname;
  this.port = port;
  this.dbName = dbName;

  var Server = require('mongodb').Server,
      mongoServer = new Server(hostname, port, {native_parser: true, poolSize: 20}),
      MongoClient = require('mongodb').MongoClient;
      mongoClient = new MongoClient(mongoServer);

  this.connect = function(func) {
    mongoClient.open(function(err, mongoClient) {
      if(err) { return log('failure to connect', {"err":err}) };
      log('mongodb connected', {hostname: self.hostname, port: self.port, dbName: self.dbName});
      self.db = mongoClient.db(self.dbName);
      func();
    });
  };
  
  this.work = function(func) {
    func(this.db);
  }; 
};

function Universe() {
  var self = this;

  this.mongo = new Mongo("localhost", 27017, "kod");
  this.images = [];

  /* Connect and grab initial data */
  this.mongo.connect(function() {
    /* Grab images */
    self.mongo.work(function(db) {
      var collection = db.collection('images');
      collection.find({}, {'_id':0}).toArray(function(err, items) {
        self.images = items;
        log('found images', {images: self.images});
      });
    });
  });

  this.clientView = function(view, func) {
    this.mongo.work(function(db) {
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
            if(lookupDocs[x] && lookupDocs[x][y]) {
              row.push(lookupDocs[x][y]);
            } else {
              row.push({tile: {floor: 'blank'}});
            };
          };
          cView.push(row);
        };

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

  server.on("move", 1, function(c, pld) {
    switch(pld.dir) {
    case "n":
      c.view.y = c.view.y - 1;
      break;
    case "s":
      c.view.y = c.view.y + 1;
      break;
    case "e":
      c.view.x = c.view.x + 1;
      break;
    case "w":
      c.view.x = c.view.x - 1;
      break;
    };

    universe.clientView(c.view, function(result) {
      c.sendCommand('draw view', 1, result);
    });
  });

  server.on("change tile", 1, function(c, pld) {
    var x = c.view.x;
    var y = c.view.y;
    var tile = pld;

    universe.mongo.work(function(db) {
      var collection = db.collection('map');

      collection.update({x: x, y: y}, {x: x, y: y, tile: tile}, {upsert: true}, function(err, result) {
        if(err) { log('unable to change tile', {err: err})};

        log('tile changed', {id: c.id, x: x, y: y, tile: tile});

        universe.clientView(c.view, function(result) {
          c.sendCommand('draw view', 1, result);
        });
      });
    });
  });
};

g = new Game();
