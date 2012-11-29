var world = document.getElementById("world");

world.width  = 400;
world.height = 400; 
world.style.width  = '400px';
world.style.height = '400px';

var ctx = world.getContext("2d");

var grass = new Image;
grass.onload = function() {
  for (x = 0; x < 12; x++) {
    for (y = 0; y < 12; y++) {
      ctx.drawImage(grass, x*32, y*32);
    }
  }
};
grass.src = "img/grass.png";

var knight = new Image;
knight.onload = function() {
  ctx.drawImage(knight, 0, 0);
};
knight.src = "img/knight.png";

var cthulhu = new Image;
cthulhu.onload = function() {
  ctx.drawImage(cthulhu, 32, 0);
};
cthulhu.src = "img/cthulhu.png";

var rabbit = new Image;
rabbit.onload = function() {
  ctx.drawImage(rabbit, 96, 0);
};
rabbit.src = "img/rabbit.png";

var cs = new Image;
cs.onload = function() {
  for (y = 0; y < 12; y++) {
    ctx.drawImage(cs, 5*32, y*32);
  }
  for (x = 5; x < 12; x++) {
    ctx.drawImage(cs, x*32, 5*32);
  }
};
cs.src = "img/cobblestone.png";
