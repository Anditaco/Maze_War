$(document).ready(function(){
   handleResize();
   $("#nameInput").focus();
});

function loadMaze(name){
    handleResize();
    console.log("I'm ready!");

    var playerId;

    var players;

    var maze;
    var x = 0;
    var y = 0;
    var dir = 0;
    var depth = 0;
    var name = name;

    console.log("name is ", name);

    console.log(window);

    var ip = window.location.hostname;
   /* jQuery.getJSON('ip.json', function(data) {
        console.log("success");
        console.log(data);
        ip = data;
    });
*/
    console.log("Client got ip as " + ip);
    console.log(typeof ip);

    var connection = new WebSocket('ws://' + ip + ':8080');
    connection.onopen = function(event){

    };

    connection.onmessage = function (event) {
       // console.log(event.data);
        let val = JSON.parse(event.data);
        if(val.type == "spawn"){
            maze = val.maze;
            x = val.x;
            y = val.y;
            dir = val.dir;
            depth = val.depth;
            players = val.data;
            playerId = val.id;

            connection.send(JSON.stringify({type: "setup", name: name, id: playerId}));
        }
        else if(val.type == "update"){

            let playerIndex = 0;
            for(let i = 0; i < val.data.length; i++){
                if(val.data[i].id == playerId) playerIndex = i;
            }

            x = val.data[playerIndex].x;
            y = val.data[playerIndex].y;
            dir = val.data[playerIndex].dir;
            depth = val.data[playerIndex].depth;
            players = val.data;

            let scoreList=[];
            for(let i = 0; i < val.data.length; i++){
                scoreList.push({id: val.data[i].id, score: val.data[i].score, name: val.data[i].name});
            }

            console.log(scoreList);
            scoreList.sort(function(a,b){
                return a.score < b.score;
            });
            updateScoreTable(scoreList);

        }
        else if(val.type == "shoot"){
            let appendString;
            if(val.shooter == name){
                appendString = "<span style='color: red'>" + String(val.shooter) + "</span> &nbsp  shot &nbsp " + String(val.shootee) + "<br>";
            }
            else if(val.shootee == name){
                appendString = String(val.shooter) + "&nbsp  shot &nbsp <span style='color: red'>" + String(val.shootee) + "</span><br>";
            }
            else{
                appendString = String(val.shooter) + "&nbsp  shot &nbsp " + String(val.shootee) + "<br>";
            }

            console.log(appendString);
            //$(appendString).appendTo($("#output"));
            $("#outputText").append(appendString);
        }
        else if(val.type == "join"){
            console.log("join ", val);
            let appendString;
            if(val.player.id == playerId) {
                appendString = "<span style='color: red'>" + val.player.name + "</span> &nbsp joined &nbsp the &nbsp game!<br>";
            }
            else {
                appendString = val.player.name + " &nbsp joined &nbsp the &nbsp game!<br>";

            }
            $("#outputText").append(appendString);
        }
        else if(val.type == "disconnect"){
            let appendString = String(val.player.name) + " &nbsp disconnected &nbsp from &nbsp the &nbsp game.<br>";
            $("#outputText").append(appendString);
        }
        else if(val.type == "kill"){
            if(playerId == val.shootee.id){
                displayKillEffect();
            }
        }
        redraw();
    };





    var fov = 0.25;


    let spacedown = false;

    function handleMove(event){
        if((event.which == 32 && spacedown==false) || event.which != 32) {
            if(event.which == 32){
                spacedown = true;
            }
            let pressed = event.which;
            //console.log(pressed,event);

            if (pressed == 32) {
                connection.send(JSON.stringify({
                    type: "shoot",
                    id: playerId,
                }));
            }
            else {
                connection.send(JSON.stringify({
                    type: "move",
                    id: playerId,
                    key: pressed
                }));
            }
        }
    }
    function keyup(event){
        if(event.which == 32){
            spacedown = false;
        }
    }

    document.addEventListener("keydown", handleMove);
    document.addEventListener("keyup", keyup);


    function updateScoreTable(scoreList){
        $("#scoreTable tr").remove();

        $("<tr><th align='left'>Player</th><th align='right'>Score</th></tr>").appendTo($("#scoreTable"));
        for(let i = 0; i < scoreList.length; i++){
            let player = scoreList[i];
            console.log("playerId is ", playerId);
            console.log("player.id is ", player.id);
            if(player.id == playerId){
                $("<tr style='color: red'><td align='left'>" + player.name+"</td><td align='right'>"+player.score+"</td></tr>").appendTo($("#scoreTable"));
            }
            else{
                $("<tr><td align='left'>"+player.name+"</td><td align='right'>"+player.score+"</td></tr>").appendTo($("#scoreTable"));
            }
        }
    }


    function redraw() {
        var oCanvas = document.getElementById("mazeOverhead");
        var vCanvas = document.getElementById("mazeView");
      //  var sCanvas = document.getElementById("scores");
        var oContext = oCanvas.getContext('2d');
        var vContext = vCanvas.getContext('2d');
      //  var sContext = sCanvas.getContext('2d');
        vContext.strokeStyle = "black";

        vContext.clearRect(0,0,vCanvas.width,vCanvas.height);
        oContext.clearRect(0,0,oCanvas.width,oCanvas.height);
      //  sContext.clearRect(0,0,sCanvas.width,sCanvas.height);
        oContext.fillStyle ="black";

        vContext.lineWidth = 5;
        vContext.strokeRect(0,0,vCanvas.width,vCanvas.height);
        vContext.lineWidth = 2;

        let w = vCanvas.width;
        let h = vCanvas.height;

        vContext.beginPath();

        for(let i = 0; i < depth; i++){
            if(getTileType(maze, x, y, dir, i, -1) == 0){
                drawLeftExit(i,fov,w,h,depth, vContext);
            }
            else{
                drawLeftWall(i,fov,w,h,depth, vContext);
            }

            if(getTileType(maze,x,y,dir,i,1) == 0){
                drawRightExit(i,fov,w,h,depth, vContext);
            }
            else{
                drawRightWall(i,fov,w,h,depth, vContext);
            }
        }
        drawEndLines(depth,fov,w,h, vContext);
        //draw enemy if on screen
        vContext.stroke();

        let enemies = enemyOnScreen();

        for(let i = enemies.length-1; i >=0; i--) {
            if (enemies[i][0] > 0) {
                drawEnemy(enemies[i][0], fov, w, h, vContext, enemies[i][1], enemies[i][2]);
            }
        }




        var mazeHeight = maze.length;
        var mazeWidth = maze[0].length;
        var cellHeight = oCanvas.height / mazeHeight;
        var cellWidth = oCanvas.width / mazeWidth;

        for (let x = 0 ; x < mazeWidth ; x++) {
            for (let y = 0 ; y < mazeHeight ; y++) {
                if (maze[y][x])
                    oContext.fillRect(x * cellWidth, y *cellHeight, cellWidth, cellHeight);
            }
        }

        var playerCount = players.length;
        for(let i = 0; i < playerCount; i++){
            //console.log("player id: "+playerId);
            if(players[i].id == playerId || playerId == undefined){
                oContext.fillStyle = "red";

                oContext.save();
                oContext.translate((players[i].x+1/2)*cellWidth,(players[i].y+1/2)*cellHeight);
                oContext.rotate(players[i].dir*Math.PI/2);
                oContext.beginPath();
                oContext.moveTo(0,-3/8*cellHeight);
                oContext.lineTo(3/8*cellWidth,0);
                oContext.lineTo(-3/8*cellWidth,0);
                oContext.fill();

                oContext.fillRect(-1/8*cellWidth, 0, 1/4*cellWidth, 3/8*cellHeight);

                oContext.restore();
            }
        }

       // sContext.strokeStyle = "black";
       // sContext.font = "30px Arial";
       // sContext.strokeRect(0,0,sCanvas.width, sCanvas.height);

        let maxScoresDisplayed = 10;
       // let vOffset = sCanvas.height/(maxScoresDisplayed+1);
       // let hOffset = sCanvas.width/3;

       // sContext.fillText("Scores:", hOffset,vOffset);
    }

    function enemyOnScreen(){
        let enemies = [];
        if(dir == 0){
            for(let i = 1; i < depth; i++){
                for(let j = 0; j < players.length; j++){
                    if(players[j].x == x && players[j].y == y-i) {
                        enemies.push([i,players[j].dir], players[j].name)
                    }
                }
            }
        }
        else if(dir == 1){
            for(let i = 1; i < depth; i++){
                for(let j = 0; j < players.length; j++){
                    if(players[j].x == x+i && players[j].y == y) {
                        enemies.push([i,players[j].dir], players[j].name)
                    }
                }
            }
        }
        else if(dir == 2){
            for(let i = 1; i < depth; i++){
                for(let j = 0; j < players.length; j++){
                    if(players[j].x == x && players[j].y == y+i) {
                        enemies.push([i,players[j].dir], players[j].name)
                    }
                }
            }
        }
        else{
            for(let i = 1; i < depth; i++){
                for(let j = 0; j < players.length; j++){
                    if(players[j].x == x-i && players[j].y == y) {
                        enemies.push([i,players[j].dir], players[j].name)
                    }
                }
            }
        }
        return enemies;
    }

    function drawLeftWall(i,fov,w,h,depth, context){
        context.moveTo(((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)), ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i)));
        context.lineTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)));


        context.moveTo(((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)), (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));
        context.lineTo(((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1)), (h-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1))));


        if(i == depth-1) {
            context.moveTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)));
            context.lineTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));

        }
    }

    function drawRightWall(i,fov,w,h,depth, context){
        context.moveTo((w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)));
        context.lineTo((w-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1))), ((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1)));


        context.moveTo((w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));
        context.lineTo((w-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(w/2)/Math.pow(1/fov,i+1))), (h-((Math.pow(1/fov,i+1)-Math.pow((1/fov)-1,i+1))*(h/2)/Math.pow(1/fov,i+1))));


        if(i == depth-1) {
            context.moveTo((w-((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1))) * (w / 2) / Math.pow(1 / fov, i + 1)), ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)));
            context.lineTo((w-((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));

        }
    }

    function drawLeftExit(i,fov,w,h,depth,context){
        context.moveTo(((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)), ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)));
        context.lineTo(((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i)), (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));


        if(i != depth-1) {
            context.moveTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)));
            context.lineTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));

        }

        context.moveTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)));
        context.lineTo(((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)), (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));


        context.moveTo(((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1)), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));
        context.lineTo(((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i)), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));


    }

    function drawRightExit(i,fov,w,h,depth,context) {
        context.moveTo((w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))), (((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i))));
        context.lineTo((w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))), (h - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (h / 2) / Math.pow(1 / fov, i))));


        if(i != depth-1) {
            context.moveTo((w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))), (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));
            context.lineTo((w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));

        }

        context.moveTo((w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))), (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));
        context.lineTo((w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))), (((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));


        context.moveTo((w - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (w / 2) / Math.pow(1 / fov, i + 1))), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));
        context.lineTo((w - ((Math.pow(1 / fov, i) - Math.pow((1 / fov) - 1, i)) * (w / 2) / Math.pow(1 / fov, i))), (h - ((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1))));


    }

    function drawEndLines(i,fov,w,h,context){
        context.moveTo((((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));
        context.lineTo((w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), (((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));


        context.moveTo((((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));
        context.lineTo((w-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(w/2)/Math.pow(1/fov,i))), (h-((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i))));

    }

    function drawEnemy(i, fov, w, h, context, edir, ename){
        context.fillStyle="#000000";
        let scale = 0.75;
        let r = ((h/2) - ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)) - ((((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) - ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)))/2))*scale;
        context.beginPath();
        context.arc(w/2, h/2, r, 0, 2*Math.PI);
        context.fill();

        let t = 4;
        let theta = Math.PI / 7;
        let pupilFactor = 7/8;
        context.fillStyle = "#ffffff";
        context.save();
        context.translate(w / 2, h / 2);
        //  context.strokeWidth="1"
        if((dir - edir + 4)%4 == 1 || (dir - edir + 4)%4 == 3) {
            if((dir - edir + 4)%4 == 1){
                context.scale(-1, 1)
            }
            let alpha = Math.atan(1 / Math.sqrt(1 + t * t));
            let startAngle = Math.PI * 3 / 2 - theta - alpha;
            let endAngle = Math.PI * 3 / 2 - theta + alpha;

            context.beginPath();
            context.moveTo(0, 0);
            //context.lineTo(r*Math.cos(theta),-r*Math.sin(theta));
            let cosx = Math.cos(theta);
            let sinx = Math.sin(theta);
            let center_x = r / 2 * (cosx + t * sinx);
            let center_y = -r / 2 * (sinx - t * cosx);
           // console.log("r", r);
            //console.log("t", t);
            //console.log("center", center_x, center_y);


            context.arc(center_x, center_y, Math.sqrt(1 + t * t) * r / 2, startAngle, endAngle);
            context.arc(0, 0, r, -theta, +theta);
            context.arc(center_x, -center_y, Math.sqrt(1 + t * t) * r / 2, 2 * Math.PI - endAngle, 2 * Math.PI - startAngle);

            context.fill();

            context.fillStyle = "black";
            context.beginPath();
            let eyeAngle = theta*pupilFactor;
            context.moveTo(Math.cos(eyeAngle) * r, -r*Math.sin(eyeAngle));
            context.arc(0, 0, r, -eyeAngle, eyeAngle);
            context.fill();
        }
        else if((dir - edir + 4)%4 == 2){
            let epsilon = r*Math.sin(theta);
            let fRad = (r*r - epsilon*epsilon)/(2*epsilon) + epsilon;
            let fAng = Math.asin(r/fRad);

            //console.log("fRad = " + fRad);
            //console.log("r = " + r);
            //console.log("r/fRad = " + r/fRad);
            //console.log("fAng = " + fAng);
           //console.log("epsilon = " + epsilon);

            context.fillStyle = "white";
            context.beginPath();

            context.moveTo(-r, 0);
            context.arc(0, fRad-epsilon, fRad, Math.PI * 3 / 2 - fAng, Math.PI * 3 / 2 + fAng);
            context.arc(0, -(fRad-epsilon), fRad, Math.PI / 2 - fAng, Math.PI / 2 + fAng);

            context.fill();

            let pRad = r * Math.sin(theta * pupilFactor);
            context.fillStyle = "black";
            context.beginPath();

            context.moveTo(pRad, 0);
            context.arc(0,0,pRad,0,2*Math.PI);

            context.fill();
        }
        context.restore();

        //TODO add display enemy name
        //context.fillText(ename, 0, 0);

        /*
        let t = 2*r;
        let theta = Math.PI/6;
        context.fillStyle="#eeeeee";
        context.moveTo(w/2,h/2);
        context.beginPath();
        context.lineTo(w/2+r*Math.cos(theta), h/2+r*Math.sin(theta));
        //context.arc(w/2 + t*Math.sin(theta)/2, h/2 - t*Math.cos(theta), Math.sqrt(1+Math.pow(t,2))/2, Math.PI*3/2 - theta - Math.atan(1/t), Math.PI*3/2 - theta + Math.atan(1/t));
        context.arc(w/2, h/2, r, Math.PI*2 - theta, Math.PI*2+theta);
        //context.arc(w/2, h/2, r, 0, theta);
        //context.closePath();
        context.lineTo(w/2,h/2);
        //context.arc(w/2 + t*Math.sin(theta)/2, h/2 + t*Math.cos(theta), Math.sqrt(1+Math.pow(t,2))/2, Math.PI/2 + theta - Math.atan(1/t), Math.PI/2 + theta + Math.atan(1/t));
        context.fill();
*/

        context.fillStyle="#555555";
        context.beginPath();
        context.ellipse(w/2, h - ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)) - ((((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) - ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)))/2), r, ((((Math.pow(1 / fov, i + 1) - Math.pow((1 / fov) - 1, i + 1)) * (h / 2) / Math.pow(1 / fov, i + 1)) - ((Math.pow(1/fov,i)-Math.pow((1/fov)-1,i))*(h/2)/Math.pow(1/fov,i)))/2)*3/4, 0, 0, 2 * Math.PI);
        context.fill();
    }


    function getTileType(maze, x, y, dir, depth, side){
        if (x == NaN) console.log("x is not initialized");
       // console.log(x,y,depth,side,dir);

        if(dir == 0){
            return ((maze[y-depth][x+side] == 0) ? 0 : 1);
        }
        else if(dir == 1){
            return ((maze[y+side][x+depth] == 0) ? 0 : 1);
        }
        else if(dir == 2){
            return ((maze[y+depth][x-side] == 0) ? 0 : 1);
        }
        else{
            return ((maze[y-side][x-depth] == 0) ? 0 : 1);
        }
    }

};