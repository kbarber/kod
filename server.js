var connect = require('connect');

connect.createServer(
    connect.static("html")
).listen(7777);

var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({port: 7778});
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        rcv = JSON.parse(message);
        snd = JSON.stringify({"bar":"far"});
        console.log('received: %s', rcv);
        ws.send(snd);
    });
    ws.send(JSON.stringify('welcome!'));
});
