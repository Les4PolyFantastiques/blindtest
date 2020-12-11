let nextButton = document.getElementById("next-music-button");
let submitButton = document.getElementById("reveal-answer-button");
let submitPlaylistDiv = document.getElementById("submit-playlist");
let textDiv = document.getElementById("text");

var player1;
let AmICreator = false;

function startGame(isCreator) {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    if (!isCreator) {
        submitPlaylistDiv.style.display = "none";
        textDiv.innerText = "Waiting for the creator to select a playlist";
    } else {
        textDiv.innerText = "Please select a playlist";
    }
    AmICreator = isCreator;

    roomServer.register("newPlayer", addTheNewPlayer);
    roomServer.register("updateList", updateListOfPlayers);
    roomServer.register("removePlayer", removePlayer);
}

function addTheNewPlayer(data) {
    var table_players = document.getElementById("table-players");
    var newLine = table_players.insertRow(-1);
    var newCel = newLine.insertCell(-1);
    var playerName = document.createTextNode(data.pseudo);
    newCel.appendChild(playerName);
}

function updateListOfPlayers(data) {
    var table_players = document.getElementById("table-players");
    var newLine = table_players.insertRow(-1);
    var newCel = newLine.insertCell(-1);
    var playerName = document.createTextNode(data.name);
    newCel.appendChild(playerName);
}

function removePlayer(data) {
    var table_players = document.getElementById("table-players");
    table_players.deleteRow(data.userId);
}

function onYouTubeIframeAPIReady() {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("room-id").innerText = roomServer.roomId;

    nextButton.addEventListener("click", next);
    submitButton.addEventListener("click", submitAnswer);

    roomServer.register("nextMusic", playNextMusic);
    roomServer.register("submitMusic", revealAnswer);

    if (AmICreator) {
        document.getElementById("submit-playlist-button").addEventListener("click", submitPlaylist);
    }

    var ctrlq1 = document.getElementById("youtube-audio1");
    ctrlq1.innerHTML = '<div id="youtube-player1"></div>'
    player1 = new YT.Player('youtube-player1', {
        height: '0',
        width: '0',
        videoId: ctrlq1.dataset.video,
        events: {
            'onReady': onPlayerReady1,
            'onStateChange': onPlayerStateChange1,
            'onError': (e) => {
                textDiv.innerText = "Cannot be played";
                submitAnswer();
                next();
            }
        }
    });
}

function onPlayerReady1(event) {
    player1.setPlaybackQuality("small");
    document.getElementById("youtube-audio1").style.display = "block";
    player1.playVideo();
    if (!AmICreator) {
        next();
    }
}

function onPlayerStateChange1(event) {
    if (event.data === 0) {
        //togglePlayButton1(false);
    }
}


function next() {
    roomServer.emit("nextMusic", { roomId: roomServer.roomId});
}

function submitAnswer() {
    roomServer.emit("submitMusic", { roomId: roomServer.roomId });
}

function playNextMusic(data) {
    submitButton.style.display = "initial";
    nextButton.style.display = "none";
    textDiv.innerText = "Now Playing";
    var ctrlq1 = document.getElementById("youtube-audio1");
    ctrlq1.dataset.video = data.token;
    player1.loadVideoById(ctrlq1.dataset.video);
}

function submitPlaylist() {
    let playlistId = document.getElementById("submit-playlist-id").value;
    roomServer.emit("playlist", { roomId: roomServer.roomId, playlistId: playlistId });
    document.getElementById("submit-playlist").style.display = "none";
}

function revealAnswer(data) {
    submitButton.style.display = "none";
    nextButton.style.display = "initial";
    player1.pauseVideo();
    textDiv.innerText = data.title;
}