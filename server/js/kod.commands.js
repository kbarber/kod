function Commands() {
  var self = this;

  this.commands = {};
  this.registerCommand = function(cmd, ver, func) {
    if(!this.commands[cmd]) {
      this.commands[cmd] = {};
    }
    this.commands[cmd][ver] = func;
  };

  this.runCommand = function(client, c, v, p) {
    if(this.commands[c] && this.commands[c][v]) {
      this.commands[c][v](client, p);
    } else {
      log('unknown command', {id: client.id, c: c, v: v, p: p});
    }
  };
}
