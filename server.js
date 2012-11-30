function log(title, data) {
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
};

function Client(cg, id, ws) {
  var self = this;

  this.id = id;
  this.ws = ws;
  this.clientGroup = cg;

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
    self.clientGroup.clients
  });

  this.sendCommand = function(c, v, p) {
    cmd = {"c": c, "v": v, "p": p};
    log('send command', cmd);
    snd = JSON.stringify(cmd);
    this.ws.send(snd, function() {
      log("error sending command", {"command": snd});
    });
  };

  this.rcvCommand = function(c, v, p) {
    log('received command', {"id": this.id, "cmd": {"c": c, "v": v, "p": p}});
  };

  this.close = function() {
  };
}

function ClientGroup() {
  var self = this;

  this.clients = {};
  this.nextId = 0;

  this.newClient = function(ws) {
    id = ++self.nextId;
    client = new Client(self, id, ws);
    self.clients[id] = client;
    return client;
  }
}

function Server() {
  var self = this;

  this.clientGroup = new ClientGroup();
  var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

  app.use(express.static(__dirname + '/public'));
  var svr = http.createServer(app);
  svr.listen(8080);

  this.wss = new WebSocketServer({server: svr});
  this.wss.on('connection', function(ws) {
    var client = self.clientGroup.newClient(ws);
    var id = client.id;

    log('ws connection', {"id":id});
  });
};

var server = new Server();
