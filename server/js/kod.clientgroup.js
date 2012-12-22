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
  };

  this.removeClient = function(client) {
    delete this.clients[client];
  };
}
