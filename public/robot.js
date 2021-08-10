
let USE_LOCALHOST = false;
let options = {
    host: "/",
    secure: false,
    port: 443,
    path: "/"
};
if(!USE_LOCALHOST) {
    options.host = "https://mjosip-peerjs.herokuapp.com/";
    options.secure = true;
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

let socket = io(options.host);

let peer = new Peer("robot", {
    host: options.host,
    port: options.port,
    secure: options.secure,
    path: options.path
});

peer.on("open", id => {
    socket.emit("robot-connected", id);
});

socket.on("client-connected", () => {

    let call = peer.call("client", myStream);
    call.on("stream", clientStream => {
        audio.srcObject = clientStream;
        audio.addEventListener('loadedmetadata', () => {
            audio.play();
        });
    });

});