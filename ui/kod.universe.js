function Universe() {
  var self = this;

  this.images = {};
  this.loadImage = function(name, details, func) {
    log("loading image", {"name": name, "details": details});
    this.images[name] = new Image();
    this.images[name].onload = func;
    this.images[name].src = details.href;
  };
  this.view = new View(self);

  this.loadImages = function(images, func) {
    var icount = images.length;

    /**
     * A function for counting down image loads.
     */
    var imageLoaded = function() {
      --icount;
      if(icount === 0) {
        func();
      }
    };

    for(var key in images) {
      var image = images[key];
      this.loadImage(image.name, image, imageLoaded);
    }
  };
}
