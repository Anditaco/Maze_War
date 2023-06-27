var express = require('express');
var http = require('http');
var mazeGen = require('../public/javascripts/maze_generator.js');
//var playerMaxHandler = require('../public/javascripts/playerCountHandler.js');
var ws = require("nodejs-websocket");

var router = express.Router();

var playerCap = process.argv.length > 2 ? process.argv[2] : 4;
console.log("playercap is " + playerCap);

var maze = mazeGen.generate_maze(playerCap);
var players = [];
var clients = [];
var connCount = 0;


const DIRECTIONX = [0,1,0,-1];
const DIRECTIONY = [-1,0,1,0];

function availableConns(){
    return playerCap-clients.length;
}

var server = ws.createServer(function (conn) {
    console.log("New connection");

    let x,y,dir,depth,score,name;

    let spawnResults = spawnPlayer(connCount);
    x = spawnResults[0];
    y = spawnResults[1];
    dir = spawnResults[2];
    depth = spawnResults[3];
    score = 0;
    name = "N/A";


    players.push({id: connCount, x: x, y: y, dir: dir, depth: depth, score: score, name: name});
    clients.push(conn);


    var val = JSON.stringify({
        type: "spawn",
        maze: maze,
        x: x,
        y: y,
        dir: dir,
        depth: depth,
        score: score,
        data: players,
        id: connCount
    });
    conn.send(val);

    updateAllPlayers();

    let pIndex = 0;
    for(let i = 0; i < players.length; i++){
        if(players[i].id == connCount) pIndex = i;
    }

    conn.on('text', function (message) {
        console.log("Received "+message);
        let data = JSON.parse(message);
        let playerIndex = 0;
        for(let i = 0; i < players.length; i++){
            if(players[i].id == data.id){
                playerIndex = i;
            }
        }
        let plyr = players[playerIndex];

        if(data.type == "move"){
            let targetLoc = [-1,-1];
            let playerDepth = plyr.depth;
            if(data.key == 68 || data.key == 39){
                plyr.dir = (plyr.dir+1)%4;
                plyr.depth = getHallDepth(playerIndex, maze);
            }
            else if(data.key == 65 || data.key == 37){
                plyr.dir = (plyr.dir+3)%4;
                plyr.depth = getHallDepth(playerIndex, maze);

            }
            else if((data.key == 87 || data.key == 38) && playerDepth > 1){
                if(plyr.dir == 0 && maze[plyr.y-1][plyr.x] == 0){
                    targetLoc = [plyr.y-1, plyr.x];
                    if(noPlayersAtLoc(targetLoc) == -1) {
                        plyr.y -= 1;
                        plyr.depth -= 1;
                    }
                }
                else if(plyr.dir == 1 && maze[plyr.y][plyr.x+1] == 0){
                    targetLoc = [plyr.y, plyr.x+1];
                    if(noPlayersAtLoc(targetLoc) == -1) {
                        plyr.x += 1;
                        plyr.depth -= 1;
                    }
                }
                else if(plyr.dir == 2 && maze[plyr.y+1][plyr.x] == 0){
                    targetLoc = [plyr.y+1, plyr.x];
                    if(noPlayersAtLoc(targetLoc) == -1) {
                        plyr.y += 1;
                        plyr.depth -= 1;
                    }
                }
                else if(plyr.dir == 3 && maze[plyr.y][plyr.x-1] == 0){
                    targetLoc = [plyr.y, plyr.x-1];
                    if(noPlayersAtLoc(targetLoc) == -1) {
                        plyr.x -= 1;
                        plyr.depth -= 1;
                    }
                }
            }

            updateAllPlayers();
        }
        else if(data.type == "shoot"){
            let enemy = playerOnScreen(plyr);
            console.log(enemy);

            if(enemy != -1) {
                let shotPlayer = players[enemy];
                let respawnData = spawnPlayer(shotPlayer);
                shotPlayer.x = respawnData[0];
                shotPlayer.y = respawnData[1];
                shotPlayer.dir = respawnData[2];
                shotPlayer.depth = respawnData[3];

                shotPlayer.score = shotPlayer.score - 1;
                plyr.score = plyr.score + 1;

                for(let i = 0; i < clients.length; i++){
                    clients[i].send(JSON.stringify({
                        type: "shoot",
                        shooter: plyr.name,
                        shootee: shotPlayer.name,
                    }));
                }

                for(let i = 0; i < clients.length; i++){
                    clients[i].send(JSON.stringify({type: "kill", shootee: shotPlayer}))
                }

                updateAllPlayers();
            }
        }
        else if(data.type == "setup"){
            console.log("got setup message with name ", data.name, " and id ", data.id);
            let pIndex = 0;
            for(let i = 0; i < players.length; i++){
                if(players[i].id == data.id){
                    pIndex = i;
                    break;
                }
            }
            players[pIndex].name = data.name;

            for(let i = 0; i < clients.length; i++){
                clients[i].send(JSON.stringify({
                    type: "join",
                    player: players[pIndex]
                }));
            }

            updateAllPlayers();
        }
    });
    conn.on("close", function (code, reason) {
        console.log("Connection closed");
        console.log("code: " + code);
        console.log("reason: " + reason);
        clients.splice(connCount,1);
        players.splice(connCount,1);
        updateAllPlayers();
    });
    conn.on('error', function(){
        console.log("ws error");

        let disconnectIndex = 0;
        for(let i = 0; i < clients.length; i++){
            if(clients[i] == conn){
                disconnectIndex = i;
            }
        }

        for(let i = 0; i < clients.length; i++){
            if(i != disconnectIndex) {
                clients[i].send(JSON.stringify({
                    type: "disconnect",
                    player: players[disconnectIndex]
                }));
            }
        }

        clients.splice(disconnectIndex,1);
        players.splice(disconnectIndex,1);

        updateAllPlayers();
    });
    connCount++;
}).listen(8080, "0.0.0.0");

function updateAllPlayers(){

    //TODO Add smart iteration to prevent errors

    for(let i = 0; i < clients.length; i++){
        clients[i].send(JSON.stringify({
            type: "update",
            maze: maze,
            data: players,
        }));
    }
}

function noPlayersAtLoc(loc){

    //TODO Add smart iteration to prevent errors

    //console.log("target loc: " + loc);

    for(let i = 0; i < players.length; i++){
        let pY = players[i].y;
        let pX = players[i].x;

        //console.log(pY, pX);
        if(pY == loc[0] && pX == loc[1]) {
            //console.log("Found player with id " + i);
            return i;
        }
        //console.log("player at " + pY + " " + pX + " is not in target spot");
    }
    //console.log("No players found at " + loc);
    return -1;
}

function playerOnScreen(shooter){
    let enemy = -1;
    for(let i = 1; i < shooter.depth; i++){
        //console.log(i);
        let sX = shooter.x;
        let sY = shooter.y;

        enemy = noPlayersAtLoc([sY + i*DIRECTIONY[shooter.dir], sX + i*DIRECTIONX[shooter.dir]]);
        if(enemy != -1){
            return enemy;
        }
    }
    return -1;
}

function getHallDepth(id, maze){
    let d = 0;
    while(true){
        if(players[id].dir == 0){
            if(maze[players[id].y-d-1][players[id].x] == 1) break;
        }
        else if(players[id].dir == 1){
            if(maze[players[id].y][players[id].x+d+1] == 1) break;
        }
        else if(players[id].dir == 2){
            if(maze[players[id].y+d+1][players[id].x] == 1) break;
        }
        else{
            if(maze[players[id].y][players[id].x-d-1] == 1) break;
        }
        d++;
    }
    d++;
    //console.log("d = " + d);
    return d;
}

function visibleLoc(y, x, p){
    for(let i = 0; i < players.length; i++){
        if(players[i].id != p && canSeeLoc(players[i], y, x) == true)
        {
            return true;
        }
    }
    return false;
}

function canSeeLoc(player, y, x){
    for(let i = 0; i < player.depth; i++){
        if(player.x + DIRECTIONX[player.dir]*i == x && player.y + DIRECTIONY[player.dir]*i == y){
            return true;
        }
    }
    return false;
}

function cardinalLoc(y,x,id){
    for(let i = 0; i < players.length; i++){
        if(players[i].id != id) {
            for (let j = 0; j < 4; j++) {
                if (j != players[i].dir) {
                    let tDepth = 0;
                    while (true) {
                        if (j == 0) {
                            if (players[i].y <= 0) break;
                            if (maze[players[i].y - tDepth - 1][players[i].x] == 1) break;
                        }
                        else if (j == 1) {
                            if (players[i].x >= maze[0].length - 1) break;
                            if (maze[players[i].y][players[i].x + tDepth + 1] == 1) break;
                        }
                        else if (j == 2) {
                            if (players[i].y >= maze.length - 1) break;
                            if (maze[players[i].y + tDepth + 1][players[i].x] == 1) break;
                        }
                        else {
                            if (players[i].x <= 0) break;
                            if (maze[players[i].y][players[i].x - tDepth - 1] == 1) break;
                        }
                        tDepth++;

                        if (tDepth > maze.length * 2) break;
                    }
                    if (tDepth != 0) {
                        tDepth++;
                    }

                    if (tDepth > 0)
                        console.log("depth in dir ", j, "for loc", players[i].y, players[i].x, " is ", tDepth);
                    for (let k = 0; k < tDepth; k++) {
                        if (players[i].x + DIRECTIONX[j] * k == x && players[i].y + DIRECTIONY[j] * k == y) {
                            console.log("spot", y, x, "is cardinal of player", players[i].name);
                            return true;
                        }
                        else {
                            console.log("spot", y, x, "is not cardinal of", players[i].name);
                        }
                    }
                }
            }
        }
    }
    return false;
}

function spawnPlayer(p){
    let x,y,dir,depth;

    let validLocations = new Array(maze.length);
    for(let i = 0; i < validLocations.length; i++){
        validLocations[i] = new Array(maze[i].length);
        for(let j = 0; j < validLocations[i].length; j++){
            validLocations[i][j] = 0;
        }
    }

    for(let i = 0; i < validLocations.length; i++){
        for(let j = 0; j < validLocations[i].length; j++){
            if(cardinalLoc(i,j,p) == true && validLocations[i][j] == 0){
                validLocations[i][j] = 3;
            }
            if(visibleLoc(i,j,p) == true && (validLocations[i][j] == 0 || validLocations[i][j] > 2)){
                validLocations[i][j] = 2;
            }
            if(noPlayersAtLoc([i,j]) != -1 && (validLocations[i][j] == 0 || validLocations[i][j] > 1)){
                validLocations[i][j] = 1;
            }
            if(maze[i][j] == 1){
                validLocations[i][j] = 1;
            }
        }
    }

    console.log("valid: ", validLocations);

    let tries = 0;
    while(true){
        x = Math.floor(Math.random()*maze[0].length);
        y = Math.floor(Math.random()*maze.length);
        if(validLocations[y][x] == 0) {
            console.log("location is " + x + "," + y);
            break;
        }

        if(tries > maze.length * maze[0].length * 10){
            if(validLocations[y][x] > 2){
                break;
            }
        }

        if(tries > maze.length * maze[0].length * 10){
            if(validLocations[y][x] > 1){
                break;
            }
        }
        tries++;
    }

    dir = Math.floor(Math.random()*4);



    depth = 0;
    let d = 0;
    while(true){
        if(dir == 0){
            if(maze[y-d-1][x] == 1) break;
        }
        else if(dir == 1){
            if(maze[y][x+d+1] == 1) break;
        }
        else if(dir == 2){
            if(maze[y+d+1][x] == 1) break;
        }
        else{
            if(maze[y][x-d-1] == 1) break;
        }
        d++;
    }
    d++;
    depth = d;

    return [x,y,dir,depth];
}



/* GET home page. */
router.get('/', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.end();
});

module.exports = router;