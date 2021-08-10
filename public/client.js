
let host = "mjosip-mbot.herokuapp.com";
if(document.location.hostname == "localhost") {
    host = "/";
}

let control_btn = document.getElementById("control_btn");
control_btn.addEventListener("click", e => {
    if(connected) disconnect();
    else connect();
});

let video = document.getElementById("video");

let connected = false;

let socket;
let peer;
let raw_conn;
let robot_stream;

let p_log = document.getElementById("log");

function log(x, a) {
    if(a == undefined) {
        console.log(x);
        p_log.innerHTML += x + "<br>";
        return;
    }
    console.log(x, a);
    p_log.innerHTML += x + ", " + a + "<br>";
}

function connect() {

    log("Probajmo se spojiti...");

    socket = io(host);
    peer = new Peer("client", {
        host: "mjosip-peerjs.herokuapp.com",
        port: 443,
        secure: true
    });

    peer.on("open", () => {
        log("Spojeno");
        log("Saljem serveru zahtjev za video i audio komunikaciju...");
        socket.emit("client-connected");
    });

    peer.on("call", call => {
        
        log("Server me zove, odgovoram na poziv");

        const constraints = {
            video: false,
            audio: true
        };
        
        log("Trazim dozvolu za mikrofon");

        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {

            log("Dobio sam dozvolu");

            call.answer(stream);
            call.on("stream", robotStream => {
                robot_stream = robotStream;
                log("Server mi je poslao svoj stream", robotStream);

                video.srcObject = robotStream;
                video.addEventListener('loadedmetadata', () => {
                    video.play();
                });

                connected = true;
                control_btn.innerHTML = "Disconnect";

            });
        });

    });

    peer.on("connection", conn => {
        raw_conn = conn;
        conn.on("data", data => {
            console.log("Received", data);
        });
    });

}

function on_btn_play() {
    console.log("btn play");
    video.play();
}

function disconnect() {
    connected = false;
}

//#region keys

let control_span = document.getElementById("control");

let __key = "";
let __speed = 2;

function send_key_event(x) {
    
    if(raw_conn) {
        raw_conn.send(x);
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

console.log("Pozdrav ;)");