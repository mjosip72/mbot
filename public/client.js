
let host = "mjosip-mbot.herokuapp.com";
if(document.location.hostname == "localhost") {
    host = "/";
}

//#region controls

let robot_video = document.getElementById("robot_video");
let client_video = document.getElementById("client_video");
client_video.muted = true;

function set_connected(value) {
    connected = value;
    if(connected) connect_btn.innerHTML = "Connected";
}

let connect_btn = document.getElementById("connect_btn");
connect_btn.addEventListener("click", e => {
    if(!connected) connect();
});

let streaming = false;
function set_streaming(value) {
    streaming = value;
    if(streaming) control_btn.innerHTML = "Stop";
    else control_btn.innerHTML = "Start";
}

let control_btn = document.getElementById("control_btn");
control_btn.addEventListener("click", e => {
    if(!streaming) start_streaming();
    else stop_streaming();
});

let log_element = document.getElementById("log");
function log(x) {
    log_element.innerHTML += x + "<br>";
    console.log(x);
}

//#endregion

//#region connection

let connected = false;
let socket;
let peer;
let data_connection;

function connect() {

    socket = io(host);

    log("Requesting connection");
    socket.emit("request-connection", "client");

    socket.on("connection-approved", () => {
        log("Connection approved");
        connect_to_peer_network();
    });

    socket.on("connection-rejected", (reason) => {
        log("Connection rejected");
        log("Reason: " + reason);
    });

}

function connect_to_peer_network() {

    log("Connectiong to peer network");

    peer = new Peer("client", {
        host: "mjosip-peerjs.herokuapp.com",
        port: 443,
        secure: true
    });
    
    peer.on("open", id => {

        log("Connected");
        set_connected(true);

        log("Requesting robot media");
        socket.emit("request-robot-media");

    });

    peer.on("call", call => {

        call.answer(client_stream);

        call.on("stream", stream => {
            log("Got robot stream");
            robot_stream = stream;
            robot_video.srcObject = stream;
        });

    });

    peer.on("connection", conn => {
        data_connection = conn;
    });

}

//#endregion

//#region stream

let robot_stream;
let client_stream;

function start_streaming() {

    log("Requesting media");

    const constraints = {
        audio: true,
        video: false
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        client_stream = stream;
        client_video.srcObject = stream;
        set_streaming(true);
        log("Success");
    })
    .catch(error => {
        log("Error");
    });

}

function stop_streaming() {
    client_stream.getTracks().forEach(track => {
        track.stop();
    });
    set_streaming(false);
}

//#endregion

//#region robot control

let control_span = document.getElementById("control");

let __key = "";
let __speed = 2;

function send_key_event(x) {
    
    if(data_connection) {
        data_connection.send(x);
    }

    if(x == "shift") __speed = 3;
    else if(x == "alt") __speed = 1;
    else if(x == "r") __speed = 2;
    else if(x == "x") __key = "";
    else __key = x;

    if(__speed != 2 && __key == "") {
        control_span.innerHTML = "";
        return;
    }

    if(__speed == 3) {
        control_span.innerHTML = __key + " - brzo";
    }else if(__speed == 2) {
        control_span.innerHTML = __key;
    }else if(__speed == 1) {
        control_span.innerHTML = __key + " - sporo";
    }
    
}

let key_w = false;
let key_s = false;
let key_a = false;
let key_d = false;
let key_alt = false;
let key_shift = false;

window.addEventListener("keydown", e => {

    switch(e.code) {
    
    case "KeyW":
        if(!key_w) {
            key_w = true;
            send_key_event("w");
        }
        break;
    
    case "KeyS":
        if(!key_s) {
            key_s = true;
            send_key_event("s");
        }
        break;
    
    case "KeyA":
        if(!key_a) {
            key_a = true;
            send_key_event("a");
        }
        break;

    case "KeyD":
        if(!key_d) {
            key_d = true;
            send_key_event("d");
        }
        break; 

    case "KeyQ":
        if(!key_shift) {
            key_shift = true;
            send_key_event("shift");
        }
        break;
    
    case "KeyE":
        if(!key_alt) {
            key_alt = true;
            send_key_event("alt");
        }
        break;

    }

});

window.addEventListener("keyup", e => {

    switch(e.code) {
    
    case "KeyW":
    case "KeyS":
    case "KeyA":
    case "KeyD":
        key_w = false;
        key_s = false;
        key_a = false;
        key_d = false;
        send_key_event("x");
        break;

    case "KeyQ":
    case "KeyE":
        key_shift = false;
        key_alt = false;
        send_key_event("r");
        break;

    }

});

// #endregion
