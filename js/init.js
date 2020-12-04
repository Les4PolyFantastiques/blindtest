let joinButton = document.getElementById("join-room-button");
let createButton = document.getElementById("new-room-button");
let roomIdFiel = document.getElementById("join-room-roomid");
let pseudoField = document.getElementById("register-userid");

function joinRoom() {
    let roomId = "room-" + roomIdFiel.value;
    let pseudo = pseudoField.value;
    roomServer.emit("joinRoom", { roomId: roomId, pseudo: pseudo });
    roomServer.register("roomJoined", (data) => {
        if (data.status === 404) {
            alert("Room id not correct");
        } else if (data.status === 200) {
            console.log(data.userId);
            console.log(roomId);
            console.log(pseudo)
            roomServer.roomId = roomId;
            startGame(false);
        }
    });
}

function createRoom() {
    let pseudo = pseudoField.value;
    roomServer.emit("newRoom", {pseudo: pseudo});
    roomServer.register("roomCreated", (data) => {
        console.log(data.userId);
        console.log(data.roomId);
        roomServer.roomId = data.roomId;
        startGame(true);
    });
}

joinButton.addEventListener("click", joinRoom);
createButton.addEventListener("click", createRoom);