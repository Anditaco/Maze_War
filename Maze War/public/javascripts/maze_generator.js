exports.generate_maze = function(playerCap){
    var w,h;

    if(playerCap%2 == 0){
        w = playerCap*2+3;
        h = w*3/2;
        if(Math.floor(h) % 2 == 0){
            h = Math.ceil(h);
        }
        else{
            h = Math.floor(h);
        }
    }
    else{
        w = playerCap*2 + 3;
        h = w*3/2;
        if(Math.floor(h) % 2 == 0){
            h = Math.ceil(h);
        }
        else{
            h = Math.floor(h);
        }
    }

    var maze = new Array(h);
    for(let i = 0; i < h; i++){
        maze[i] = new Array(w);
        for(let j = 0; j < w; j++){
            if(i == 0 || j == 0 || i == h-1 || j == w-1){
                maze[i][j] = 1;
            }
            else if(i % 2 == 0 && j % 2 == 0){
                maze[i][j] = 1;
            }
            else{
                maze[i][j] = 0;
            }
        }
    }

    for(let i = 0; i < (w-2)*(h-2)*Math.pow(52/50,playerCap)/8; i++){
        addWall(maze,w,h);
    }

    return maze;
};

function addWall(maze,w,h){
    let tries = 0;

    while(true) {
        let y = Math.floor(Math.random() * (maze.length-2) + 1);
        let x = Math.floor(Math.random() * (maze[0].length-2) + 1);

        if (((x % 2 == 0 && y % 2 == 1) || (x % 2 == 1 && y % 2 == 0)) && maze[y][x] == 0) {
            var t = new Array(maze.length);
            for(let i = 0; i < maze.length; i++){
                t[i] = new Array(maze[0].length);
                for(let j = 0; j < maze[0].length; j++){
                    t[i][j] = maze[i][j];
                }
            }
            t[y][x] = 2;

            //for(let i = 0; i < t.length; i++){
            //    console.log(t[i]);
            //}
            //console.log("");

            if(validMaze(t, x, y,w,h)){
                maze[y][x] = 1;
                return;
            }
        }
        if(tries > 1000){
            //console.log("Too many tries");
            return;
        }
        tries++;
    }
}

function validMaze(maze, x, y,w,h){
    if(x % 2 == 1){
        //check top/bot
        //console.log("checking top/bot")
        if(countDirections(maze, x, y-1,w,h) < 2) return false;
        if(countDirections(maze, x, y+1,w,h) < 2) return false;
    }
    else{
        //check left/right
        //console.log("checking right/left")
        if(countDirections(maze, x-1, y,w,h) < 2) return false;
        if(countDirections(maze, x+1, y,w,h) < 2) return false;
    }
    //console.log("every spot has 2 ways in/out");


    if(!noWallLoop(maze, x, y)) return false;

    return true;
}

function countDirections(maze, x, y, w, h){
    let c = 0;
    if(y > 0 && maze[y-1][x] == 0) c++;
    if(y < h-1 && maze[y+1][x] == 0) c++;
    if(x > 0 && maze[y][x-1] == 0) c++;
    if(x < w-1 && maze[y][x+1] == 0) c++;
    //console.log("Spot (" + x + ", " + y + ") has " + c + " exits");
    return c;
}

function noWallLoop(maze, x, y){
    //console.log("checking for loop created in walls");
    if(followWall(maze, x, y, x, y, [[y, x]], 0) != undefined) return false;
    //console.log("No loops found")
    return true;
}

function getAdjacentWalls(maze, x, y){
    let r = [[],[],[],[]];
    if(y > 0 && maze[y-1][x] > 0) r[0]=[y-1,x];
    if(y < maze.length-1 && maze[y+1][x] > 0) r[1]=[y+1,x];
    if(x > 0 && maze[y][x-1] > 0) r[2]=[y,x-1];
    if(x < maze[0].length-1 && maze[y][x+1] > 0) r[3]=[y,x+1];
    return r;
}

function followWall(maze, x, y, goalx, goaly, used, depth){
    //console.log("Following wall at " + y + "," + x + " and have used " + used);
    let options = getAdjacentWalls(maze, x, y);
    //for(let i = 0; i < options.length; i++){
    //    if(options[i] != "") console.log("found option " + options[i]);
    //}
    for(let i = 0; i < options.length; i++){
        //console.log([options[i][0], options[i][1]])
        if(containedInArray(options, [goaly, goalx]) && depth>1){
            //console.log("loop found");
            return true;
        }
        if(options[i][0] != undefined && !containedInArray(used, [options[i][0], options[i][1]])){
            //console.log("used does not contain " + options[i][0] + ", " + options[i][1]);
            //console.log("goal is " + goalx + "," + goaly + " location is " + options[i][1] + "," + options[i][0]);
            let tused = new Array(used.length + 1);
            for(let j = 0; j < tused.length - 1; j++){
                tused[j] = new Array(2);
                for(let k = 0; k < 2; k++){
                    tused[j][k] = used[j][k]
                }
            }
            tused[tused.length-1] = [options[i][0], options[i][1]];
            //console.log("original used is " + used);
            //console.log("new used is " + tused);

            if(followWall(maze, options[i][1], options[i][0], goalx, goaly, tused, depth+1)){
                return true;
            }
        }
    }
}

function containedInArray(arr, ele){
    for(let i = 0; i < arr.length; i++){
        if(arr[i][0] == ele[0] && arr[i][1] == ele[1]) return true;
    }
    return false;
}
