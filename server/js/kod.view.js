function View(client, universe, width, height, x, y) {
  var self = this;

  this.width = width;
  this.height = height;
  this.client = client;
  this.universe = universe;
  this.x = x;
  this.y = y;

  log('create view', {id: client.id, width: width, height: height, x: x, y: y});
  client.view = this;

  this.updateViewSize = function(width, height) {
    this.width = width;
    this.height = height;
    log('update view size', {
      id: this.client.id,
      width: width,
      height: height
    });
  };

  this.updateViewWidth = function(width) {
    this.width = width;
    log('update view width', {id: this.client.id, width: width});
  };

  this.updateViewHeight = function(height) {
    this.height = height;
    log('update view height', {id: this.client.id, height: height});
  };
}
