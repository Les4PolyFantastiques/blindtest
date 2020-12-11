let joinButton = document.getElementById("join-room-button");
let createButton = document.getElementById("new-room-button");
let roomIdFiel = document.getElementById("join-room-roomid");
let pseudoField = document.getElementById("register-userid");

function joinRoom() {
    let roomId = "room-" + roomIdFiel.value;
    let pseudo = pseudoField.value;
    roomServer.emit("joinRoom", { roomId: roomId, pseudo: pseudo });
    roomServer.register("roomJoined", (data) => {
        addMyNameToPlayerList();
        if (data.status === 404) {
            alert("Room id not correct or room already in game");
        } else if (data.status === 200) {
            console.log(data.userId);
            console.log(roomId);
            console.log(pseudo)
            roomServer.roomId = roomId
            roomServer.pseudo = pseudo;
            startGame(false);
        }
    });
}

function createRoom() {
    let pseudo = pseudoField.value;
    roomServer.emit("newRoom", {pseudo: pseudo});
    roomServer.register("roomCreated", (data) => {
        addMyNameToPlayerList();
        console.log(data.userId);
        console.log(data.roomId);
        roomServer.roomId = data.roomId;
        roomServer.pseudo = pseudo;
        startGame(true);
    });
}

function addMyNameToPlayerList() {
    // Maj du tableau des Players
    var table_players = document.getElementById("table-players");
    var newLine = table_players.insertRow(-1);
    var newCel = newLine.insertCell(-1);
    var playerName = document.createTextNode(pseudoField.value);
    newCel.appendChild(playerName);
}

joinButton.addEventListener("click", joinRoom);
createButton.addEventListener("click", createRoom);