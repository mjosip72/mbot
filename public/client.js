
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

function connect() {

    console.log("Probajmo se spojiti...");

    socket = io(host);
    peer = new Peer("client", {
        host: "mjosip-peerjs.herokuapp.com",
        port: 443,
        secure: true
    });

    peer.on("open", () => {
        console.log("Spojeno");
        console.log("Saljem serveru do znanja da je klijent spojen...");
        socket.emit("client-connected");
    });

    peer.on("call", call => {
        
        console.log("Server me zove, odgovorit cu na poziv ;)");

        const constraints = {
            video: false,
            audio: true
        };
        
        console.log("Trazim dozvolu za mikrofon");

        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {

            console.log("Dobio sam dozvolu jupiiiii ;D"); //

            call.answer(stream);
            call.on("stream", robotStream => {

                console.log("Server mi je poslao svoj stream ;)");

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
    connected = false;
}

console.log("Pozdrav ;)");