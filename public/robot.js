
let host = "mjosip-mbot.herokuapp.com";
if(document.location.hostname == "localhost") {
    host = "/";
}

let control_btn = document.getElementById("control_btn");
control_btn.addEventListener("click", e => {
    if(running) stop();
    else start();
});

let video = document.getElementById("video");
let audio = document.getElementById("audio");
video.muted = true;

let myStream;

let running = false;

function start() {

    const constraints = {
        video: {
            width: { exact: 640 },
            height: { exact: 480 }
        },
        audio: true
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {

        myStream = stream;

        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });

        running = true;
        control_btn.innerHTML = "Stop";

    });

}

function stop() {

    video.srcObject.getTracks().forEach(track => {
        track.stop();
    });

    running = false;
    control_btn.innerHTML = "Start";

}

let raw_conn;
let client_stream;

let socket = io(host);

let peer = new Peer("robot", {
    host: "mjosip-peerjs.herokuapp.com",
    port: 443,
    secure: true
});

peer.on("open", id => {
    console.log("Spojeno");
    socket.emit("robot-connected", id);
});


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