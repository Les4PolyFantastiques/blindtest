const server = require('http').createServer();
const { Server } = require('ws');
const fs = require('fs')
const wss = new Server({ server });
const PORT = process.env.PORT || 3000;


let rooms = {};
let roomsInGame = {};
let currentMusic = {};
let reponses = {};
let roomMusics = {};
let roomsNb = 0;
let userNb = 0;

wss.on('connection', (client) => {
    client.on('message', (message) => {
        let msg = JSON.parse(message);
        if (msg.id === "newRoom") {
            newRoom(msg.data, client);
        } else if (msg.id === "joinRoom") {
            joinRoom(msg.data, client);
        } else if (msg.id === "nextMusic") {
            nextMusic(msg.data, client);
        } else if (msg.id === "submitMusic") {
            submitMusic(msg.data, client);
        } else if (msg.id === "playlist") {
            submitPlaylist(msg.data, client);
        } else if (msg.id == "envoireponse"){
            receptionReponse(msg.data, client);
        }
    })
});

function newRoom(msg, client) {
    roomsNb += 1;
    let room = `room-${roomsNb}`;
    userNb += 1;
    let userId = `U_${userNb}`;
    let pseudo = msg.pseudo;

    roomsInGame[room] = {inGame: false};
    rooms[room] = [{ id: userId, client: client, pseudo: pseudo }];
    currentMusic[room] = 0;

    sendToClient(client,
        "roomCreated",
        { roomId: room, userId: userId });

    client.on('close', () => {
        rooms[room] = rooms[room].filter((val, i, a) => { return val.id !== userId });
    });
}

function joinRoom(msg, client) {
    let room = msg.roomId;
    userNb += 1;
    let userId = `U_${userNb}`;
    let pseudo = msg.pseudo;

    if (!rooms.hasOwnProperty(room) || roomsInGame[room].inGame == true) {
        sendToClient(client, "roomJoined", { status: 404 });
        return;
    }

    rooms[room].push({ id: userId, client: client, pseudo: pseudo });
    sendToClient(client, "roomJoined", { status: 200, userId: userId });

    client.on('close', () => {
        rooms[room] = rooms[room].filter((val, i, a) => { return val.id !== userId });
    });
}

function nextMusic(msg) {
    let roomId = msg.roomId;
    reponses[roomId]=[];
    reponses[roomId].length = 0;
    if (!roomMusics.hasOwnProperty(roomId)) return;
    if (currentMusic[roomId] >= roomMusics[roomId].length) return;
    rooms[roomId].forEach((user) => {
        sendToClient(user.client, "nextMusic", { token: roomMusics[roomId][currentMusic[roomId]].videoId});
    })
}

function submitMusic(msg) {
    let roomId = msg.roomId;

    rooms[roomId].forEach((user) => {
        sendToClient(user.client, "submitMusic", { title: roomMusics[roomId][currentMusic[roomId]].title, reponse: reponses[roomId] });
    })
    currentMusic[roomId] += 1;
    reponses[roomId]=[];
    reponses[roomId].length = 0;
}

function receptionReponse(msg, client){
    let proposition = msg.reponse;
    let pseudo = msg.pseudo;
    let room = msg.roomId;
    if(reponses[room] == null){
        reponses[room] = [{pseudo: pseudo, reponse: proposition}];
    }
    else reponses[room].push({ pseudo: pseudo, reponse: proposition});
    sendToClient(client, "ReponseEnvoye", { status: 200});
}

function submitPlaylist(msg) {
    let roomId = msg.roomId;

    roomsInGame[roomId].inGame = true;

    getPlaylist(msg.playlistId, (music) => {
        roomMusics[roomId] = music.sort(() => Math.random() - 0.5);
        nextMusic(msg);
    });
}

function sendToClient(client, id, msg) {
    client.send(JSON.stringify({ id: id, data: msg }));
}

server.listen(PORT);

const PlaylistSummary = require('youtube-playlist-summary')
const config = {
    GOOGLE_API_KEY: 'AIzaSyCscobFCKmWDG7SUNo4jcOLU-W48U9Ir7I', // require
    PLAYLIST_ITEM_KEY: ['title', 'videoId'],
}

const ps = new PlaylistSummary(config)
const PLAY_LIST_ID = 'PLlYKDqBVDxX1Q_jLy_Olg_VlQpl_xZEX1'

function getPlaylist(playlistId, callback){   
    ps.getPlaylistItems(playlistId)
    .then((result) => {
        callback(result.items);
    })
    .catch((error) => {
        console.error(error)
    })
}