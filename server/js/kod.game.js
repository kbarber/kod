function Game() {
  var server = new Server();
  var universe = new Universe();

  server.on("login", 1, function(c, pld) {
    if(c.login(pld.username, pld.password)) {
      c.sendCommand('create view', 1, {});
    } else {
      c.sendCommand('login again', 1, {});
    }
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
    }

    universe.clientView(c.view, function(result) {
      c.sendCommand('draw view', 1, result);
    });
  });

  server.on("change tile", 1, function(c, pld) {
    var x = pld.x;
    var y = pld.y;
    var tile = pld.tile;

    universe.mongo.work(function(db) {
      var collection = db.collection('map');

      collection.update({x: x, y: y}, {x: x, y: y, tile: tile}, {upsert: true}, function(err, result) {
        if(err) { log('unable to change tile', {err: err}); }

        log('tile changed', {id: c.id, x: x, y: y, tile: tile});

        universe.clientView(c.view, function(result) {
          c.sendCommand('draw view', 1, result);
        });
      });
    });
  });
}

game = new Game();
