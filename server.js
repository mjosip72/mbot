
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
let path = require("path");

let PORT = 5000 || process.env.PORT;
let PATH = path.join(__dirname, "public");

app.use(express.static(PATH));

app.get("/robot", (req, res) => {
    res.redirect("/robot.html");
});

let robot_socket;
let client_socket;

function approve_connection(socket, id) {
    console.log("Connection approved for " + id);
    socket.emit("connection-approved");
}

function reject_connection(socket, id, reason) {
    console.log("Connection rejected for " + id);
    console.log("Reason: " + reason);
    socket.emit("connection-rejected", reason);
}

io.on("connection", socket => {

    socket.on("request-connection", id => {

        console.log("Connection requested by " + id);
        if(id == "robot") {

            if(robot_socket == undefined) {
                robot_socket = socket;
                approve_connection(socket, id);
            }else{
                reject_connection(socket, id, "robot is already connected");
            }

        }else if(id == "client") {

            if(client_socket == undefined) {

                if(robot_socket == undefined) {
                    reject_connection(socket, id, "robot is not connected");
                }else{
                    client_socket = socket;
                    approve_connection(socket, id);
                }

            }else{
                reject_connection(socket, id, "client is already connected");
            }

        }
    });

    socket.on("request-robot-media", () => {
        console.log("Requesting robot media");
        robot_socket.emit("request-media");
    });

    socket.on("disconnect", () => {
        if(socket == robot_socket) {
            robot_socket = undefined;
            console.log("Robot disconnected");
        }else if(socket == client_socket) {
            client_socket = undefined;
            console.log("Client disconnected");
        }
    });

});

server.listen(PORT);
