
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);

app.use(express.static("public"));

app.get("/robot", (req, res) => {
    res.redirect("/robot.html");
});

io.on("connection", socket => {

    socket.on("client-connected", () => {
        socket.join("client");
        socket.to("robot").emit("client-connected");
    });

    socket.on("robot-connected", () => {
        socket.join("robot");
    });

});

server.listen(80);
