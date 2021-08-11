
let host = "mjosip-mbot.herokuapp.com";
if(document.location.hostname == "localhost") {
    host = "/";
}

//#region controls

let robot_video = document.getElementById("robot_video");
let client_video = document.getElementById("client_video");
robot_video.muted = true;

let streaming = false;
function set_streaming(value) {
    streaming = value;
    if(streaming) control_btn.innerHTML = "Stop";
    else control_btn.innerHTML = "Start";
}

let control_btn = document.getElementById("control_btn");
control_btn.addEventListener("click", e => {
    if(!connected) return;
    if(streaming) stop_streaming();
    else start_streaming();
});

let log_element = document.getElementById("log");
function log(x) {
    log_element.innerHTML += x + "<br>";
    console.log(x);
}

//#endregion

//#region connection

let socket = io(host);

log("Requesting connection");
socket.emit("request-connection", "robot");

socket.on("connection-approved", () => {
    log("Connection approved");
    connect_to_peer_network();
});

socket.on("connection-rejected", (reason) => {
    log("Connection rejected");
    log("Reason: " + reason);
});

let connected = false;
let peer;

function connect_to_peer_network() {

    log("Connectiong to peer network");

    peer = new Peer("robot", {
        host: "mjosip-peerjs.herokuapp.com",
        port: 443,
        secure: true
    });
    
    peer.on("open", id => {
        log("Connected");
        connected = true;
    });

}

//#endregion

//#region stream

let robot_stream;
let client_stream;

function start_streaming() {

    log("Requesting media");

    /*
    const constraints = {
        video: {
            width: { exact: 640 },
            height: { exact: 480 }
        },
        audio: true
    };
    */
    const constraints = {
        audio: true,
        video: {
            facingMode: { exact: "environment" }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        robot_stream = stream;
        robot_video.srcObject = stream;
        set_streaming(true);
        log("Success");
    })
    .catch(error => {
        log("Error");
    });

}

function stop_streaming() {
    robot_stream.getTracks().forEach(track => {
        track.stop();
    });
    set_streaming(false);
}

//#endregion

//#region media

socket.on("request-media", () => {

    log("Media requested");
    let call = peer.call("client", robot_stream);
    call.on("stream", stream => {
        log("Got client stream");
        client_stream = stream;
        client_video.srcObject = stream;
    });

});

//#endregion





/*



socket.on("client-connected", () => {

    console.log("Klijent se povezao");
    console.log("Zovem klijenta....");

    let call = peer.call("client", myStream);

    call.on("stream", clientStream => {
        client_stream = clientStream;
        console.log("Dobio sam od klijenta stream", clientStream);
        audio.srcObject = clientStream;
        audio.addEventListener('loadedmetadata', () => {
            audio.play();
        });
    });

    let conn = peer.connect("client");
    raw_conn = conn;
    conn.on("open", () => {
        conn.on("data", data => {
            console.log("Received", data);
            send_key_event(data);
        });
    });

});



*/















let control_span = document.getElementById("control");

let __key = "";
let __speed = 2;

function send_key_event(x) {
    
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