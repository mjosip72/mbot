
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.get("/", (req, res) => {
    res.writeHead(200);
    res.write("Pozdrav svijete");
    res.end();
});

server.listen(80);
