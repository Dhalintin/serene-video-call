const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: location.port || (location.protocol === 'https:' ? 443 : 80),
});

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
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

    videoGrid.append(video);
}
console.log(ROOM_ID)

// Mute/Unmute Audio
document.getElementById('muteAudioButton').addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const audioTrack = stream.getAudioTracks()[0];
            console.log(audioTrack.enabled)
            audioTrack.enabled = !audioTrack.enabled;
            console.log(audioTrack.enabled)

            const muteButton = document.getElementById('muteAudioButton');
            muteButton.textContent = audioTrack.enabled ? 'Mute Audio' : 'Unmute Audio';
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
});


// Turn On/Off Video
document.getElementById('toggleVideoButton').addEventListener('click', () => {
    const videoTrack = myStream.getVideoTracks()[0];
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        document.getElementById('toggleVideoButton').innerText = 'Turn On Video';
    } else {
        videoTrack.enabled = true;
        document.getElementById('toggleVideoButton').innerText = 'Turn Off Video';
    }
});
