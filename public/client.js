
let USE_LOCALHOST = false;
let options = {
    host: "/",
    secure: false,
    port: 443
};
if(!USE_LOCALHOST) {
    options.host = "mjosip-peerjs.herokuapp.com";
    options.secure = true;
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

function connect() {

    socket = io("mjosip-mbot.herokuapp.com");
    peer = new Peer("client", {
        host: options.host,
        port: options.port,
        secure: options.secure
    });

    peer.on("open", () => {
        socket.emit("client-connected");
    });

    peer.on("call", call => {
        
        const constraints = {
            video: false,
            audio: true
        };
        
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            call.answer(stream);
            call.on("stream", robotStream => {

                video.srcObject = robotStream;
                video.addEventListener('loadedmetadata', () => {
                    video.play();
                });

                connected = true;
                control_btn.innerHTML = "Disconnect";

            });
        });

    });

}

function disconnect() {

}
