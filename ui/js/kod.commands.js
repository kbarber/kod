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
