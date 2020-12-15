let nextButton = document.getElementById("next-music-button");
let submitPlaylistDiv = document.getElementById("submit-playlist");
let textDiv = document.getElementById("text");
let boutonReponse = document.getElementById("boutonReponse");
let reponsediv = document.getElementById("reponse-div");
let reponseField = document.getElementById("reponseField");
let texteReponse = document.getElementById("texteReponse");
var tableauReponse = document.getElementById("tableauReponse");

var player1;
var done = true;
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

    roomServer.register("nextMusic", playNextMusic);
    roomServer.register("submitMusic", revealAnswer);
    //roomServer.register("scoreUpdate")

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
    player1.setVolume(50);
    if (!AmICreator) {
        next();
    }
}

function onPlayerStateChange1(event) {
    if (event.data == 1 && !done) {
        setTimeout(stopVideo, 10000);
        done = true;
    }
}

function stopVideo() {
    player1.pauseVideo();
    if(AmICreator){
        submitAnswer();
    }
  }

function next() {
    roomServer.emit("nextMusic", { roomId: roomServer.roomId});
}

function submitAnswer() {
    roomServer.emit("submitMusic", { roomId: roomServer.roomId });
}

function playNextMusic(data) {
    reponseField.style.display = "block";
    boutonReponse.style.display = "block";
    texteReponse.style.display = "block";
    tableauReponse.style.display = "none";

    var longueur = tableauReponse.rows.length;
    for(i=0; i < longueur; i++){
        tableauReponse.deleteRow(-1);
    }

    done = false;
    document.getElementById("reponseField").value = "";
    nextButton.style.display = "none";
    reponsediv.style.display = "initial"
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
    done = true;
    nextButton.style.display = "initial";
    reponsediv.style.display = "none"
    textDiv.innerText = data.title;
    var array = data.reponse;
    displayArray(array);
    roomServer.register("bonneReponse", function(outerArray){ 
        var longueur = tableauReponse.rows.length;
        for(i=0; i < longueur; i++){
            tableauReponse.deleteRow(-1);
        }
        displayArray(outerArray.array);
    });
}

function displayArray(array) {
    if(array != null){
        array.forEach(element => {
            var ligne = tableauReponse.insertRow(-1);//on a ajouté une ligne
	        var colonne1 = ligne.insertCell(0);//on a une ajouté une cellule
	        colonne1.innerHTML += element.pseudo;
	        var colonne2 = ligne.insertCell(1);//on ajoute la seconde cellule
            colonne2.innerHTML += element.reponse;
            var colonne3 = ligne.insertCell(2);
            boutonVF = document.createElement("button");
            boutonVF.style.backgroundColor = element.vf ? "#1D8B28" : "#B43636";
            boutonVF.style.color = "#313337";
            boutonVF.style.height = '30px';
            boutonVF.style.display = "initial";
            boutonVF.innerHTML = element.vf ? "TRUE" : "FAUX";
            colonne3.appendChild(boutonVF);
            if (AmICreator){
                boutonVF.addEventListener("click", function(){
                    element.vf = !element.vf;
                    roomServer.emit("bonneReponse", {roomId: roomServer.roomId, array:array})
                });               
            }
        });
    }
    if(tableauReponse != null){
        tableauReponse.style.display = "table";
    }
}

function envoyerReponse(){
    let reponse = reponseField.value;
    let pseudo = roomServer.pseudo;
    roomServer.emit("envoireponse", { roomId: roomServer.roomId, reponse: reponse, pseudo: pseudo });
    roomServer.register("ReponseEnvoye", (data) => {
        if (data.status === 404) {
            alert("Reponse non transmise");
        } else if (data.status === 200) {
            console.log("ReponseEnvoyé");
        }
    });
    reponsediv.style.display = "none";
}

boutonReponse.addEventListener("click", envoyerReponse);