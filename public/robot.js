
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

let socket = io(host);

let peer = new Peer("robot", {
    host: "mjosip-peerjs.herokuapp.com",
    port: 443,
    secure: true
});

peer.on("open", id => {
    console.log("Spojeno");//
    socket.emit("robot-connected", id);
});

socket.on("client-connected", () => {

    console.log("Klijent se povezao");
    console.log("Zovem klijenta....");

    let call = peer.call("client", myStream);

    call.on("stream", clientStream => {
        console.log("Dobio sam od klijenta stream");
        audio.srcObject = clientStream;
        audio.addEventListener('loadedmetadata', () => {
            audio.play();
        });
    });

});