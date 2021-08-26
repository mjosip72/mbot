
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

function set_ble_connected(value) {
    ble_connected = value;
    if(ble_connected) ble_btn.innerHTML = "BLE Disconnect";
    else ble_btn.innerHTML = "BLE Connect";
}

let ble_btn = document.getElementById("ble_btn");
ble_btn.addEventListener("click", e => {
    if(ble_connected) ble_disconnect();
    else ble_connect();
});

let log_element = document.getElementById("log");
function log(x) {
    log_element.innerHTML += x + "<br>";
    console.log(x);
}

//#endregion

//#region connection

let socket = io(host);
let connected = false;
let peer;

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

    let conn = peer.connect("client");
    conn.on("data", data => {
        console.log("Received", data);
        send_key_event(data);
    });

});

//#endregion

//#region robot commands
const COMMAND_FORWARD       = 10;
const COMMAND_BACKWARD      = 20;
const COMMAND_LEFT          = 30;
const COMMAND_RIGHT         = 40;
const COMMAND_STOP          = 50;
const COMMAND_SPEED_NORMAL  = 60;
const COMMAND_SPEED_SLOW    = 70;
const COMMAND_SPEED_FAST    = 80;
//#endregion

//#region ble

let ble_connected;

let bluetooth_device;
let ble_characteristic;

const NAME = "Croduino Nova32 BLE";
const SERVICE_UUID = "a2bf82f9-36a0-458b-b41b-bdf3c2924de9";
const CHARACTERISTIC_UUID = "4a644eb4-2c92-429b-b022-d827fa83db5f";

function send_command(x) {
    if(!ble_connected) return;
    let value = Uint8Array.of(x);
    ble_characteristic.writeValue(value);
}

function ble_connect() {

    const options = {
        filters: [
            { name: NAME },
            { services: [SERVICE_UUID] }
        ]
    };

    navigator.bluetooth.requestDevice(options)
    .then(device => {
        bluetooth_device = device;
        return device.gatt.connect();
    })
    .then(server => {
        return server.getPrimaryService(SERVICE_UUID);
    })
    .then(service => {
        return service.getCharacteristic(CHARACTERISTIC_UUID);
    })
    .then(characteristic => {
        ble_characteristic = characteristic;
        set_ble_connected(true);
    })

}

function ble_disconnect() {
    if(bluetooth_device.gatt.connected) {
        bluetooth_device.gatt.disconnect();
    }
    set_ble_connected(false);
}

//#endregion

//#region robot control

let control_span = document.getElementById("control");

let __key = "";
let __speed = 2;

function send_key_event(x) {
    
    if(x == "w") {
        send_command(COMMAND_FORWARD);
    }else if(x == "s") {
        send_command(COMMAND_BACKWARD);
    }else if(x == "a") {
        send_command(COMMAND_LEFT);
    }else if(x == "d") {
        send_command(COMMAND_RIGHT);
    }else if(x == "x") {
        send_command(COMMAND_STOP);
    }else if(x == "r") {
        send_command(COMMAND_SPEED_NORMAL);
    }else if(x == "shift") {
        send_command(COMMAND_SPEED_FAST);
    }else if(x == "alt") {
        send_command(COMMAND_SPEED_SLOW);
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

//#endregion