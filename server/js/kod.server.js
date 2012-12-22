function Server(port) {
  var self = this;

  this.port = port || 7777;
  this.clientGroup = new ClientGroup(this);
  this.commands = new Commands();

  var WebSocketServer = require('ws').Server,
      http = require('http'),
      express = require('express'),
      app = express();

  app.configure(function() {
    app.use(express.static(__dirname + '/server/public'));
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/server/views');
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
}
