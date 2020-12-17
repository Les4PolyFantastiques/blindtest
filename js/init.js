let joinButton = document.getElementById("join-room-button");
let createButton = document.getElementById("new-room-button");
let roomIdFiel = document.getElementById("join-room-roomid");
let pseudoFieldJoin = document.getElementById("join-room-userid");
let pseudoFieldNew = document.getElementById("new-room-userid");

function joinRoom() {
    let roomId = "room-" + roomIdFiel.value;
    let pseudo = pseudoFieldJoin.value;
    if(pseudo === ""){
        alert("Veuillez renseigner votre pseudo SVP");
    }
    else {
        join = false;
        roomServer.emit("joinRoom", { roomId: roomId, pseudo: pseudo });
        roomServer.register("roomJoined", (data) => {
            switch(data.status) {
                case 404: 
                    if(!join){
                        alert("L'ID de la Room n'existe pas");
                        join = true;
                    }
                    break;
                case 405:
                    if(!join){
                        alert("La Room a commencé sans vous");
                        join = true;   
                    }
                    break;
                default:
                    if(!join){
                        addMyNameToPlayerList();
                        console.log(data.userId);
                        console.log(roomId);
                        console.log(pseudo);
                        roomServer.roomId = roomId;
                        roomServer.pseudo = pseudo;
                        startGame(false);
                        join = true;
                    }
            }
        });
    }
}

function createRoom() {
    let pseudo = pseudoFieldNew.value;
    if (pseudo === ""){
        alert("Veuillez renseigner votre pseudo SVP");
    }
    else {
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
}

function addMyNameToPlayerList() {
    // Maj du tableau des Players
    var table_players = document.getElementById("table-players");
    var newLine = table_players.insertRow(-1);
    var newCel = newLine.insertCell(0);
    var secondCel = newLine.insertCell(1);
    if(pseudoFieldJoin.value != ""){
        var playerName = document.createTextNode(pseudoFieldJoin.value);    
    }
    else if(pseudoFieldNew.value != "") {
        var playerName = document.createTextNode(pseudoFieldNew.value);
    }
    newCel.appendChild(playerName);
    secondCel.innerHTML = 0;
}

joinButton.addEventListener("click", joinRoom);
createButton.addEventListener("click", createRoom);