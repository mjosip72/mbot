
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);

//////////
let path = require("path");
let PORT = process.env.PORT || 5000;
console.log("Listening on port " + PORT);
console.log(__dirname);
let PATH = path.join(__dirname, "public");
//////////

app.use(express.static(PATH));

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

server.listen(PORT);
