const socket = io('/');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: 'https://serene-video-call.onrender.com',
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
    secure: location.protocol === 'https:'
});

const myVideo = document.getElementById('myVideo');
myVideo.muted = true;

const peers = {};
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.getElementById('userVideo');;
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnect', userId => {
    if (peers[userId]) {
        peers[userId].close();
    }
});

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    // videoGrid.append(video);
}
