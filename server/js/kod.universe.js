function Universe() {
  var self = this;

  this.mongo = new Mongo("localhost", 27017, "kod");
  this.images = [];

  /* Connect and grab initial data */
  this.mongo.connect(function() {
    /* Grab images */
    self.mongo.work(function(db) {
      var collection = db.collection('images');
      collection.find({}, {'_id':0}).toArray(function(err, items) {
        self.images = items;
        log('found images', {images: self.images});
      });
    });
  });

  this.clientView = function(view, func) {
    this.mongo.work(function(db) {
      var collection = db.collection('map');
      collection.find({
        x: {$gte: view.x, $lt: view.x+view.width},
        y: {$gte: view.y, $lt: view.y+view.height}
      },{"_id":0}).toArray(function(err, docs) {
        //log('got map from mongodb', {map: docs});

        var lookupDocs = {};
        for(var i in docs) {
          var doc = docs[i];
          if(!lookupDocs[doc.x]) {
            lookupDocs[doc.x] = {};
          }
          lookupDocs[doc.x][doc.y] = doc;
        }

        var cView = [];
        for(var y = view.y; y < (view.y+view.height); y++) {
          var row = [];
          for(var x = view.x; x < (view.x+view.width); x++) {
            var cell = {
              x: x,
              y: y
            };
            if(lookupDocs[x] && lookupDocs[x][y] && lookupDocs[x][y].tile) {
              cell.tile = lookupDocs[x][y].tile;
            } else {
              cell.tile = {floor: 'blank'};
            }
            row.push(cell);
          }
          cView.push(row);
        }

        func({
          images: self.images,
          view: cView
        });
      });
    }); 
  };
}
