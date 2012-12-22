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
    var json;
    try {
      json = JSON.parse(msg);
    } catch(e) {
      log('ws message invalid json', {id: id, data: msg.data});
    }
    log('received message', {id: id, msg: json});

    if(json.c && json.v && json.p) {
      self.rcvCommand(json.c, json.v, json.p);
    } else {
      log('not a valid message', {id: id, msg: json});
    }
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
