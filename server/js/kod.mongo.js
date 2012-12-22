function Mongo(hostname, port, dbName, func) {
  var self = this;

  this.hostname = hostname;
  this.port = port;
  this.dbName = dbName;

  var Server = require('mongodb').Server,
      mongoServer = new Server(hostname, port, {native_parser: true, poolSize: 20}),
      MongoClient = require('mongodb').MongoClient;
      mongoClient = new MongoClient(mongoServer);

  this.connect = function(func) {
    mongoClient.open(function(err, mongoClient) {
      if(err) { return log('failure to connect', {"err":err}); }
      log('mongodb connected', {hostname: self.hostname, port: self.port, dbName: self.dbName});
      self.db = mongoClient.db(self.dbName);
      func();
    });
  };
  
  this.work = function(func) {
    func(this.db);
  }; 
}
