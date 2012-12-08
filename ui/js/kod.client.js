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
