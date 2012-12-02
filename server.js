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
      log('ws message invalid json', {"id": id, "data": msg.data});
    }
    log('received message', {"id": id, "msg": json});

    if(json.c && json.v && json.p) {
      self.rcvCommand(json.c, json.v, json.p);
    } else {
      log('not a valid message', {"id": id, "msg": json});
    };
  });

  ws.on('close', function() {
    log('ws close', {"id": id});
    self.close();
  });

  this.sendCommand = function(c, v, p) {
    cmd = {"c": c, "v": v, "p": p};
    log('send command', cmd);
    snd = JSON.stringify(cmd);
    this.ws.send(snd);
  };

  this.rcvCommand = function(c, v, p) {
    log('received command', {"id": this.id, "cmd": {"c": c, "v": v, "p": p}});
    this.commands.runCommand(this, c, v, p);
  };

  this.login = function(username, password) {
    log('login', {"username": username, "password": password});
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
    res.render("status");
  });

  var svr = http.createServer(app);
  svr.listen(this.port);

  this.wss = new WebSocketServer({server: svr});
  this.wss.on('connection', function(ws) {
    var client = self.clientGroup.newClient(ws);
    var id = client.id;

    log('ws connection', {"id":id});
  });

  this.on = function(cmd, ver, func) {
    this.commands.registerCommand(cmd, ver, func);
  };
};

/*
var images = [
  {
    name: "grass",
    href: "/img/grass.png"
  },
  {
    name: "knight",
    href: "/img/knight.png"
  },
  {
    name: "cthulhu",
    href: "/img/cthulhu.png"
  },
  {
    name: "rabbit",
    href: "/img/rabbit.png"
  },
  {
    name: "cobblestone",
    href: "/img/cobblestone.png"
  }
]
*/

function Mongo(url) {
  var self = this;

  this.url = url;

  var MongoClient = require('mongodb').MongoClient;

  this.connect = function(func) {
    MongoClient.connect(this.url, function(err, db) {
      if(err) { return log('failure to connect', {"err":err}) };
      log('mongodb connected');

      func(db);
    });
  }; 
};

function Universe() {
  var self = this;

  this.mongo = new Mongo("mongodb://localhost:27017/kod");
  this.images = [];

  var gk = {images: ['grass', 'knight']};
  var gr = {images: ['grass']};
  var cs = {images: ['cobblestone']};
  var rb = {images: ['grass', 'rabbit']};

  this.world = [
    [gk, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, rb, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, cs, cs, cs, cs, cs, cs],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr],
    [gr, gr, gr, gr, gr, cs, gr, gr, gr, gr, gr, gr]
  ]

  /* Grab images */
  this.mongo.connect(function(db) {
    var collection = db.collection('images');
    collection.find().toArray(function(err, items) {
      self.images = items;
      log('found images', {"images": self.images});
    });
  });
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
    c.sendCommand('draw view', 1, {
      images: universe.images,
      view: universe.world
    });
  });
};

g = new Game();
