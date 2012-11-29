var connect = require('connect');

connect.createServer(
    connect.static("html")
).listen(7777);
